import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const tools = [
  {
    type: "function",
    function: {
      name: "add_task",
      description: "Add a new task to the Kanban board",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Task title" },
          description: { type: "string", description: "Task description" },
          status: { type: "string", enum: ["todo", "in_progress", "completed"], description: "Task status column" },
          priority: { type: "string", enum: ["low", "medium", "high"], description: "Task priority" },
          category: { type: "string", enum: ["Design", "Development", "Marketing", "Research", "Other"], description: "Task category" },
          due_date: { type: "string", description: "Due date in YYYY-MM-DD format" },
          time_estimate: { type: "string", description: "Time estimate e.g. 2h, 1d" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_task",
      description: "Delete a task from the Kanban board by its title (case-insensitive partial match)",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Title or partial title of the task to delete" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_task",
      description: "Update an existing task's fields (find by title, update any fields)",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Title or partial title of the task to find" },
          new_title: { type: "string", description: "New title" },
          description: { type: "string", description: "New description" },
          status: { type: "string", enum: ["todo", "in_progress", "completed"] },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          category: { type: "string", enum: ["Design", "Development", "Marketing", "Research", "Other"] },
          due_date: { type: "string", description: "New due date YYYY-MM-DD" },
          time_estimate: { type: "string" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_tasks",
      description: "List all current tasks on the board, optionally filtered by status",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["todo", "in_progress", "completed"], description: "Filter by status" },
        },
      },
    },
  },
];

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function executeTool(name: string, args: Record<string, unknown>): Promise<{ result: string; action?: Record<string, unknown> }> {
  const sb = getSupabase();

  if (name === "add_task") {
    const { data, error } = await sb.from("tasks").insert({
      title: args.title as string,
      description: (args.description as string) || null,
      status: (args.status as string) || "todo",
      priority: (args.priority as string) || "medium",
      category: (args.category as string) || null,
      due_date: (args.due_date as string) || null,
      time_estimate: (args.time_estimate as string) || null,
      position: 0,
    }).select().single();
    if (error) return { result: `Error adding task: ${error.message}` };
    return { result: `Task "${data.title}" added to ${data.status}`, action: { type: "task_added", task: data } };
  }

  if (name === "delete_task") {
    const { data: matches } = await sb.from("tasks").select("*").ilike("title", `%${args.title}%`);
    if (!matches?.length) return { result: `No task found matching "${args.title}"` };
    const task = matches[0];
    const { error } = await sb.from("tasks").delete().eq("id", task.id);
    if (error) return { result: `Error deleting: ${error.message}` };
    return { result: `Task "${task.title}" deleted`, action: { type: "task_deleted", id: task.id } };
  }

  if (name === "update_task") {
    const { data: matches } = await sb.from("tasks").select("*").ilike("title", `%${args.title}%`);
    if (!matches?.length) return { result: `No task found matching "${args.title}"` };
    const task = matches[0];
    const updates: Record<string, unknown> = {};
    if (args.new_title) updates.title = args.new_title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.status) updates.status = args.status;
    if (args.priority) updates.priority = args.priority;
    if (args.category) updates.category = args.category;
    if (args.due_date) updates.due_date = args.due_date;
    if (args.time_estimate) updates.time_estimate = args.time_estimate;
    const { data, error } = await sb.from("tasks").update(updates).eq("id", task.id).select().single();
    if (error) return { result: `Error updating: ${error.message}` };
    return { result: `Task "${data.title}" updated`, action: { type: "task_updated", task: data } };
  }

  if (name === "list_tasks") {
    let query = sb.from("tasks").select("*").order("position");
    if (args.status) query = query.eq("status", args.status as string);
    const { data, error } = await query;
    if (error) return { result: `Error: ${error.message}` };
    if (!data?.length) return { result: "No tasks found" };
    const summary = data.map((t: Record<string, unknown>) => `• [${t.status}] ${t.title} (${t.priority} priority)`).join("\n");
    return { result: `Found ${data.length} tasks:\n${summary}` };
  }

  return { result: "Unknown tool" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemMsg = {
      role: "system",
      content: `You are a helpful AI assistant integrated into a Kanban task management board. You can manage tasks directly using the provided tools. When a user asks to add, delete, update, or list tasks, use the appropriate tool. Keep answers clear, concise, and actionable. Use markdown formatting when helpful.`,
    };

    // First call: may return tool_calls
    const firstResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [systemMsg, ...messages],
        tools,
        stream: false,
      }),
    });

    if (!firstResponse.ok) {
      const status = firstResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await firstResponse.text();
      console.error("AI error:", status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const firstResult = await firstResponse.json();
    const choice = firstResult.choices?.[0];

    if (!choice?.message?.tool_calls?.length) {
      // No tool calls, return content directly
      const content = choice?.message?.content || "I'm not sure how to help with that.";
      return new Response(JSON.stringify({ content, actions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Execute tool calls
    const toolMessages = [];
    const actions: Record<string, unknown>[] = [];
    for (const tc of choice.message.tool_calls) {
      const args = typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function.arguments;
      const result = await executeTool(tc.function.name, args);
      if (result.action) actions.push(result.action);
      toolMessages.push({ role: "tool", tool_call_id: tc.id, content: result.result });
    }

    // Second call: get final response with tool results
    const secondResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [systemMsg, ...messages, choice.message, ...toolMessages],
        stream: false,
      }),
    });

    const secondResult = await secondResponse.json();
    const finalContent = secondResult.choices?.[0]?.message?.content || "Done!";

    return new Response(JSON.stringify({ content: finalContent, actions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
