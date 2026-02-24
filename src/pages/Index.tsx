import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { ChatPanel } from "@/components/ChatPanel";

const Index = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar onToggleChat={() => setChatOpen(!chatOpen)} chatOpen={chatOpen} />
      <KanbanBoard />
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Index;
