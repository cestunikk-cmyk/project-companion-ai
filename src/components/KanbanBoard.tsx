import { useState, useEffect, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Plus, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "./KanbanColumn";
import { AddTaskDialog } from "./AddTaskDialog";
import { toast } from "sonner";
import type { Task, Status, Priority } from "@/types/kanban";

const COLUMNS: Status[] = ["todo", "in_progress", "completed"];

interface KanbanBoardProps {
  onTasksChanged?: () => void;
}

export function KanbanBoard({ onTasksChanged }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStatus, setDialogStatus] = useState<Status>("todo");
  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("position", { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    setTasks(data as Task[]);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as Status;

    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === draggableId ? { ...t, status: newStatus } : t
      );

      const columnTasks = updated
        .filter((t) => t.status === newStatus)
        .sort((a, b) => a.position - b.position);

      const movedTask = columnTasks.find((t) => t.id === draggableId);
      if (movedTask) {
        const filtered = columnTasks.filter((t) => t.id !== draggableId);
        filtered.splice(destination.index, 0, movedTask);
        filtered.forEach((t, i) => (t.position = i));
      }

      return updated;
    });
  };

  const handleAddTask = async (taskData: {
    title: string;
    description: string;
    status: Status;
    priority: Priority;
    category: string;
    due_date: string;
    time_estimate: string;
  }) => {
    const columnTasks = tasks.filter((t) => t.status === taskData.status);
    const position = columnTasks.length;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: taskData.title,
        description: taskData.description || null,
        status: taskData.status,
        priority: taskData.priority,
        category: taskData.category || null,
        due_date: taskData.due_date || null,
        time_estimate: taskData.time_estimate || null,
        position,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add task");
      console.error(error);
      return;
    }

    setTasks((prev) => [...prev, data as Task]);
    toast.success("Task added!");
  };

  const handleDeleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete task");
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success("Task deleted");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const promises = tasks.map((t) =>
        supabase
          .from("tasks")
          .update({ status: t.status, position: t.position })
          .eq("id", t.id)
      );
      await Promise.all(promises);
      toast.success("Board saved!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const openDialog = (status: Status) => {
    setDialogStatus(status);
    setDialogOpen(true);
  };

  const getColumnTasks = (status: Status) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Action bar */}
      <div className="flex items-center justify-end px-8 py-4 gap-3">
        <Button variant="outline" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Board"}
        </Button>
        <Button onClick={() => openDialog("todo")}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto px-8 pb-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 min-w-max">
            {COLUMNS.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={getColumnTasks(status)}
                onAddTask={openDialog}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      <AddTaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAddTask}
        defaultStatus={dialogStatus}
      />
    </div>
  );
}
