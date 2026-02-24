import { useState, useCallback } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { ChatPanel } from "@/components/ChatPanel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutDashboard, MessageCircle } from "lucide-react";

const Index = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTasksChanged = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Tabs defaultValue="board" className="flex-1 flex flex-col min-h-0">
          <div className="border-b border-border bg-card px-8 pt-5 pb-0">
            <h1 className="text-2xl font-display font-bold text-foreground">Workspace</h1>
            <p className="text-sm text-muted-foreground mt-0.5 mb-4">Manage your tasks and projects</p>
            <TabsList className="bg-transparent p-0 h-auto gap-4">
              <TabsTrigger
                value="board"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3 pt-1 text-sm font-medium"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Board
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3 pt-1 text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                AI Assistant
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="board" className="flex-1 m-0 min-h-0">
            <KanbanBoard key={refreshKey} onTasksChanged={handleTasksChanged} />
          </TabsContent>

          <TabsContent value="chat" className="flex-1 m-0 min-h-0 flex flex-col">
            <ChatPanel onTasksChanged={handleTasksChanged} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
