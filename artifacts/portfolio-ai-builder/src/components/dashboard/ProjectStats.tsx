import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Activity } from "lucide-react";

interface ProjectStatsProps {
  total: number;
  recentCount: number;
}

export function ProjectStats({ total, recentCount }: ProjectStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card className="bg-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
          <FolderKanban className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{total}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Recently Active</CardTitle>
          <Activity className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{recentCount}</div>
          <p className="text-xs text-muted-foreground mt-1">in the last 7 days</p>
        </CardContent>
      </Card>
    </div>
  );
}
