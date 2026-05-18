import { Editor } from "@monaco-editor/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCode, FileJson, Paintbrush } from "lucide-react";

interface PortfolioEditorProps {
  html: string;
  css: string;
  js: string;
  onChange: (type: 'html' | 'css' | 'js', value: string) => void;
  activeTab: 'html' | 'css' | 'js';
  onTabChange: (tab: 'html' | 'css' | 'js') => void;
}

export function PortfolioEditor({ html, css, js, onChange, activeTab, onTabChange }: PortfolioEditorProps) {
  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as 'html' | 'css' | 'js')} className="flex flex-col flex-1 h-full">
        <div className="px-4 py-2 border-b border-border bg-muted/30">
          <TabsList className="bg-background/50 h-8 p-1">
            <TabsTrigger value="html" className="text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <FileCode className="w-3 h-3 mr-1.5" />
              HTML
            </TabsTrigger>
            <TabsTrigger value="css" className="text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Paintbrush className="w-3 h-3 mr-1.5" />
              CSS
            </TabsTrigger>
            <TabsTrigger value="js" className="text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <FileJson className="w-3 h-3 mr-1.5" />
              JS
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="html" className="flex-1 m-0 border-none p-0 outline-none">
          <Editor
            height="100%"
            defaultLanguage="html"
            theme="vs-dark"
            value={html}
            onChange={(v) => onChange('html', v || '')}
            options={{ minimap: { enabled: false }, fontSize: 13, tabSize: 2, wordWrap: "on" }}
          />
        </TabsContent>
        <TabsContent value="css" className="flex-1 m-0 border-none p-0 outline-none">
          <Editor
            height="100%"
            defaultLanguage="css"
            theme="vs-dark"
            value={css}
            onChange={(v) => onChange('css', v || '')}
            options={{ minimap: { enabled: false }, fontSize: 13, tabSize: 2, wordWrap: "on" }}
          />
        </TabsContent>
        <TabsContent value="js" className="flex-1 m-0 border-none p-0 outline-none">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={js}
            onChange={(v) => onChange('js', v || '')}
            options={{ minimap: { enabled: false }, fontSize: 13, tabSize: 2, wordWrap: "on" }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
