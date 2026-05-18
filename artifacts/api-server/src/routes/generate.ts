import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GeneratePortfolioBody } from "@workspace/api-zod";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are an expert web developer. Generate a complete, modern, responsive portfolio website based on the user's prompt.

You MUST return ONLY a valid JSON object with exactly these three keys: "html", "css", "js".
No markdown, no code fences, no explanation — only the raw JSON object.

Rules:
- html: A complete HTML file (with <!DOCTYPE html>, <html>, <head>, <body> tags). Link to style.css and script.js using relative paths. Do NOT include inline <style> or <script> blocks.
- css: Complete CSS for the portfolio (responsive, modern, animations).
- js: Complete JavaScript (scroll animations, smooth behavior, interactivity).

The portfolio must include:
- Hero/header section with name and title
- About section
- Skills section with visual skill cards
- Projects section with project cards
- Education or experience section
- Contact section with a form (frontend only)
- Footer

Make it professional, modern, and beautiful with:
- Smooth fade-in animations
- Hover effects on cards and buttons
- Smooth scroll behavior
- Responsive mobile layout
- A cohesive color scheme`;

const TEMPLATE_HINTS: Record<string, string> = {
  dark: "Use a dark color scheme with deep backgrounds (#0a0a0f, #111827), vibrant accent colors (electric blue #3b82f6 or purple #8b5cf6), and glowing hover effects.",
  minimal:
    "Use a clean minimal style: white or very light background, subtle grays, a single muted accent color, generous whitespace, and simple typography.",
  creative:
    "Use a bold, creative design with gradients, asymmetric layouts, vibrant colors, and strong typographic hierarchy.",
};

router.post("/generate", async (req, res): Promise<void> => {
  const parsed = GeneratePortfolioBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { prompt, template } = parsed.data;
  const templateHint = template ? TEMPLATE_HINTS[template] ?? "" : "";

  const userMessage = `${prompt}${templateHint ? `\n\nTemplate style: ${templateHint}` : ""}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 8192,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "";

  let parsed2: { html?: string; css?: string; js?: string };
  try {
    // Strip any markdown fences just in case
    const jsonStr = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    parsed2 = JSON.parse(jsonStr);
  } catch {
    // Last resort: find the first { ... } block
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed2 = JSON.parse(match[0]);
      } catch {
        req.log.error({ raw: raw.slice(0, 500) }, "Failed to parse AI response as JSON");
        res.status(500).json({ error: "AI returned an invalid response. Please try again." });
        return;
      }
    } else {
      req.log.error({ raw: raw.slice(0, 500) }, "Failed to parse AI response as JSON");
      res.status(500).json({ error: "AI returned an invalid response. Please try again." });
      return;
    }
  }

  if (!parsed2.html || !parsed2.css || !parsed2.js) {
    res.status(500).json({ error: "AI response was missing required fields. Please try again." });
    return;
  }

  res.json({
    html: parsed2.html,
    css: parsed2.css,
    js: parsed2.js,
  });
});

export default router;
