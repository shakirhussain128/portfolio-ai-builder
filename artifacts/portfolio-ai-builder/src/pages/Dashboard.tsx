import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { useListProjects, useGetProjectStats, useDeleteProject, useDuplicateProject, getListProjectsQueryKey, getGetProjectStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { ProjectStats } from "@/components/dashboard/ProjectStats";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Dashboard() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading, login } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated and finished loading
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Login required",
        description: "You must be logged in to view the dashboard.",
        variant: "destructive"
      });
      setLocation("/");
      login(); // Prompt login
    }
  }, [authLoading, isAuthenticated, setLocation, login, toast]);

  const { data: projects, isLoading: projectsLoading } = useListProjects({
    query: { enabled: isAuthenticated }
  });

  const { data: stats, isLoading: statsLoading } = useGetProjectStats({
    query: { enabled: isAuthenticated }
  });

  const deleteProject = useDeleteProject();
  const duplicateProject = useDuplicateProject();

  const handleOpen = (id: number) => {
    setLocation(`/?id=${id}`);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProjectStatsQueryKey() });
          toast({ title: "Project deleted" });
        },
        onError: () => {
          toast({ title: "Failed to delete project", variant: "destructive" });
        }
      });
    }
  };

  const handleDuplicate = (id: number) => {
    duplicateProject.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProjectStatsQueryKey() });
        toast({ title: "Project duplicated" });
      },
      onError: () => {
        toast({ title: "Failed to duplicate project", variant: "destructive" });
      }
    });
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-[200px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage and edit your generated portfolios.</p>
        </div>
        <Button onClick={() => setLocation("/")} className="gap-2" data-testid="button-new-project">
          <PlusCircle className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {(statsLoading) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
        </div>
      ) : stats ? (
        <ProjectStats total={stats.total} recentCount={stats.recentCount} />
      ) : null}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Saved Projects</h2>
        
        {projectsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onOpen={handleOpen}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                isDeleting={deleteProject.isPending && deleteProject.variables?.id === project.id}
                isDuplicating={duplicateProject.isPending && duplicateProject.variables?.id === project.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/10 border border-border/50 rounded-xl border-dashed">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              You haven't saved any portfolio projects yet. Generate your first portfolio and save it to see it here.
            </p>
            <Button onClick={() => setLocation("/")}>Create your first project</Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Need FolderKanban for empty state
import { FolderKanban } from "lucide-react";
