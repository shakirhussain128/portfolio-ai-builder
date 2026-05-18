import { useRef, useEffect } from "react";

interface PreviewIframeProps {
  html: string;
  css: string;
  js: string;
}

export function PreviewIframe({ html, css, js }: PreviewIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    const srcdoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `;

    iframeRef.current.srcdoc = srcdoc;
  }, [html, css, js]);

  return (
    <iframe
      ref={iframeRef}
      title="Live Preview"
      className="w-full h-full border-0 bg-white"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
