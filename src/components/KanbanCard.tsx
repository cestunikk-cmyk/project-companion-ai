import { Draggable } from "@hello-pangea/dnd";
import { Calendar, Clock, Trash2 } from "lucide-react";
import { Task, PRIORITY_CONFIG, CATEGORY_COLORS } from "@/types/kanban";

interface KanbanCardProps {
  task: Task;
  index: number;
  onDelete: (id: string) => void;
}

export function KanbanCard({ task, index, onDelete }: KanbanCardProps) {
  const priority = PRIORITY_CONFIG[task.priority];
  const categoryClass = task.category
    ? CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Other
    : null;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group bg-card rounded-lg border border-border p-4 mb-3 transition-all duration-200 cursor-grab active:cursor-grabbing ${
            snapshot.isDragging
              ? "shadow-lg ring-2 ring-primary/20 rotate-1 scale-[1.02]"
              : "hover:shadow-md hover:border-primary/30"
          }`}
        >
          {/* Category tag */}
          {task.category && categoryClass && (
            <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full mb-2 ${categoryClass}`}>
              {task.category}
            </span>
          )}

          {/* Title */}
          <h4 className="font-medium text-card-foreground text-sm leading-snug mb-2">
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {task.due_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
              {task.time_estimate && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {task.time_estimate}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${priority.dotClass}`} />
                {priority.label}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
