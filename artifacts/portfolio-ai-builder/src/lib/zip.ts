import JSZip from "jszip";

export async function downloadPortfolioAsZip(html: string, css: string, js: string, title: string = "portfolio") {
  const zip = new JSZip();
  
  const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  ${html}
  <script src="script.js"></script>
</body>
</html>`;

  zip.file("index.html", finalHtml);
  zip.file("style.css", css);
  zip.file("script.js", js);

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.toLowerCase().replace(/\\s+/g, "-")}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
