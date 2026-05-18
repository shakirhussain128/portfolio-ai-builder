import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Trash2, Copy, Edit, ExternalLink } from "lucide-react";
import type { Project } from "@workspace/api-client-react";

interface ProjectCardProps {
  project: Project;
  onOpen: (id: number) => void;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
  isDuplicating: boolean;
}

export function ProjectCard({ project, onOpen, onDuplicate, onDelete, isDeleting, isDuplicating }: ProjectCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden border-border/50 hover:border-primary/50 transition-colors group">
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/10">
        <CardTitle className="text-lg font-semibold tracking-tight truncate" title={project.title}>
          {project.title}
        </CardTitle>
        <div className="text-xs text-muted-foreground">
          {format(new Date(project.updatedAt), 'MMM d, yyyy h:mm a')}
        </div>
      </CardHeader>
      
      <CardContent className="py-4 flex-1">
        <div className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {project.prompt || "No prompt available"}
        </div>
        
        {project.template && (
          <div className="mt-4 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground">
            {project.template} template
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-3 pb-3 border-t border-border/50 bg-muted/5 flex justify-between items-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="secondary" size="sm" onClick={() => onOpen(project.id)} data-testid={`button-open-${project.id}`}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDuplicate(project.id)} 
            disabled={isDuplicating}
            data-testid={`button-duplicate-${project.id}`}
            title="Duplicate"
          >
            <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(project.id)} 
            disabled={isDeleting}
            data-testid={`button-delete-${project.id}`}
            className="hover:text-destructive hover:bg-destructive/10"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
