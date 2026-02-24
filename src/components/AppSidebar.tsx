import { LayoutDashboard, MessageCircle, Settings } from "lucide-react";

interface AppSidebarProps {
  onToggleChat: () => void;
  chatOpen: boolean;
}

export function AppSidebar({ onToggleChat, chatOpen }: AppSidebarProps) {
  return (
    <aside className="w-16 min-h-screen bg-sidebar flex flex-col items-center py-6 gap-2 border-r border-sidebar-border">
      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-8">
        <span className="text-primary-foreground font-display font-bold text-lg">K</span>
      </div>

      <NavItem icon={LayoutDashboard} label="Board" active />
      <NavItem
        icon={MessageCircle}
        label="AI Chat"
        active={chatOpen}
        onClick={onToggleChat}
      />
      <div className="flex-1" />
      <NavItem icon={Settings} label="Settings" />
    </aside>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
        active
          ? "bg-sidebar-accent text-sidebar-primary"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
