import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { Task, Status, STATUS_CONFIG } from "@/types/kanban";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  status: Status;
  tasks: Task[];
  onAddTask: (status: Status) => void;
  onDeleteTask: (id: string) => void;
}

export function KanbanColumn({ status, tasks, onAddTask, onDeleteTask }: KanbanColumnProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex flex-col w-[340px] min-w-[300px] shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-semibold text-foreground text-sm">
            {config.label}
          </h3>
          <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 rounded-xl p-3 transition-colors min-h-[200px] scrollbar-thin overflow-y-auto ${
              snapshot.isDraggingOver
                ? "bg-primary/5 ring-2 ring-primary/10"
                : "bg-kanban-column"
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <p className="text-sm">No tasks yet</p>
                <button
                  onClick={() => onAddTask(status)}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Create Task
                </button>
              </div>
            )}
            {tasks.map((task, index) => (
              <KanbanCard
                key={task.id}
                task={task}
                index={index}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
