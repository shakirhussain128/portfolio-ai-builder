import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { useGeneratePortfolio, useCreateProject, useUpdateProject, useGetProject, getGetProjectQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PortfolioEditor } from "@/components/editor/PortfolioEditor";
import { PreviewIframe } from "@/components/editor/PreviewIframe";
import { downloadPortfolioAsZip } from "@/lib/zip";
import { useDebounce } from "@/hooks/use-debounce";
import { Wand2, Download, Save, Loader2, Sparkles } from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export function Home() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const projectId = searchParams.get('id') ? parseInt(searchParams.get('id') as string) : null;
  
  const { user, isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  
  const [prompt, setPrompt] = useState("");
  const [template, setTemplate] = useState<"dark" | "minimal" | "creative">("dark");
  const [html, setHtml] = useState("<!-- Your generated HTML will appear here -->");
  const [css, setCss] = useState("/* Your generated CSS will appear here */");
  const [js, setJs] = useState("// Your generated JS will appear here");
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>("html");
  
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");

  const debouncedHtml = useDebounce(html, 500);
  const debouncedCss = useDebounce(css, 500);
  const debouncedJs = useDebounce(js, 500);

  const generatePortfolio = useGeneratePortfolio();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  
  const { data: projectData, isLoading: isLoadingProject } = useGetProject(projectId as number, { 
    query: { enabled: !!projectId, queryKey: getGetProjectQueryKey(projectId as number) } 
  });

  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (projectData && initializedForId.current !== projectData.id) {
      initializedForId.current = projectData.id;
      setHtml(projectData.html);
      setCss(projectData.css);
      setJs(projectData.js);
      setPrompt(projectData.prompt);
      setProjectTitle(projectData.title);
      if (projectData.template) {
        setTemplate(projectData.template as any);
      }
    }
  }, [projectData]);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for your portfolio.",
        variant: "destructive"
      });
      return;
    }

    generatePortfolio.mutate({
      data: { prompt, template }
    }, {
      onSuccess: (data) => {
        setHtml(data.html);
        setCss(data.css);
        setJs(data.js);
        toast({
          title: "Generation complete",
          description: "Your portfolio has been generated successfully.",
        });
      },
      onError: () => {
        toast({
          title: "Generation failed",
          description: "There was an error generating your portfolio. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  const handleSaveProject = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "You must be logged in to save projects.",
        action: <Button onClick={() => login()} size="sm">Login</Button>
      });
      return;
    }

    if (projectId) {
      // Update existing project without dialog
      updateProject.mutate({
        id: projectId,
        data: {
          title: projectTitle,
          html,
          css,
          js
        }
      }, {
        onSuccess: () => {
          toast({
            title: "Project updated",
            description: "Your changes have been saved.",
          });
        },
        onError: () => {
          toast({
            title: "Update failed",
            description: "There was an error updating your project.",
            variant: "destructive"
          });
        }
      });
    } else {
      setSaveDialogOpen(true);
      if (!projectTitle) {
        setProjectTitle(prompt.slice(0, 30) + (prompt.length > 30 ? '...' : '') || 'My Portfolio');
      }
    }
  };

  const submitSave = () => {
    if (!projectTitle.trim()) return;
    
    createProject.mutate({
      data: {
        title: projectTitle,
        prompt,
        html,
        css,
        js,
        template
      }
    }, {
      onSuccess: (newProject) => {
        setSaveDialogOpen(false);
        toast({
          title: "Project saved",
          description: "Your portfolio has been saved to your dashboard.",
        });
        setLocation(`/?id=${newProject.id}`);
      },
      onError: () => {
        toast({
          title: "Save failed",
          description: "There was an error saving your project.",
          variant: "destructive"
        });
      }
    });
  };

  const handleCodeChange = (type: 'html' | 'css' | 'js', value: string) => {
    if (type === 'html') setHtml(value);
    if (type === 'css') setCss(value);
    if (type === 'js') setJs(value);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Top control bar */}
      <div className="border-b border-border bg-card p-4 flex flex-col sm:flex-row gap-4 shrink-0 z-10">
        <div className="flex-1 flex gap-2">
          <Textarea 
            placeholder="Describe your portfolio... e.g. 'A dark themed portfolio for a full-stack developer focusing on React and Node.js'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="resize-none min-h-[60px] h-[60px] bg-background border-input focus-visible:ring-primary"
            data-testid="input-prompt"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
          <div className="flex items-center gap-2">
            <Select value={template} onValueChange={(v: any) => setTemplate(v)}>
              <SelectTrigger className="w-[140px]" data-testid="select-template">
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleGenerate} 
              disabled={generatePortfolio.isPending || !prompt.trim()}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              data-testid="button-generate"
            >
              {generatePortfolio.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Generate
            </Button>
          </div>
          
          <div className="h-full w-px bg-border hidden sm:block" />
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" title="Download ZIP" onClick={() => downloadPortfolioAsZip(html, css, js, projectData?.title || 'portfolio')} data-testid="button-download">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="secondary" className="gap-2" onClick={handleSaveProject} data-testid="button-save">
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 relative min-h-0">
        {(isLoadingProject) ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground font-medium">Loading project...</p>
            </div>
          </div>
        ) : null}
        
        {generatePortfolio.isPending ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-6 max-w-sm text-center p-8 rounded-xl bg-card border border-border shadow-2xl">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <Wand2 className="w-12 h-12 text-primary animate-pulse relative z-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Crafting your portfolio</h3>
                <p className="text-sm text-muted-foreground">AI is writing the code. This usually takes 10-20 seconds.</p>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full w-1/2 animate-pulse" style={{ animationDuration: '1s' }} />
              </div>
            </div>
          </div>
        ) : null}

        <ResizablePanelGroup direction="horizontal" className="h-full border-t border-border">
          <ResizablePanel defaultSize={40} minSize={20} className="flex flex-col h-full bg-background z-10 relative">
            <PortfolioEditor 
              html={html}
              css={css}
              js={js}
              onChange={handleCodeChange}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </ResizablePanel>
          <ResizableHandle withHandle className="bg-border w-1 hover:w-2 hover:bg-primary/50 transition-all z-20" />
          <ResizablePanel defaultSize={60} minSize={30} className="bg-white relative">
            <PreviewIframe html={debouncedHtml} css={debouncedCss} js={debouncedJs} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
            <DialogDescription>
              Give your portfolio a title to save it to your dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="name"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Dark Minimalist Dev Portfolio"
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitSave} disabled={!projectTitle.trim() || createProject.isPending}>
              {createProject.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
