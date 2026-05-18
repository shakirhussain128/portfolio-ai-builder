# PortFolioGen AI

An AI-powered portfolio website builder. Describe your portfolio in plain text, and the AI instantly generates a complete HTML/CSS/JS website — ready to preview, edit, and download.

---

## Features

- **AI Generation** — Type a prompt and get a full portfolio website (HTML, CSS, JS) in seconds
- **Live Preview** — See your portfolio render in real time as you edit the code
- **Monaco Editor** — VS Code-style editor with syntax highlighting for HTML, CSS, and JS
- **Templates** — Choose from Dark, Minimal, Creative, and Professional styles
- **Download ZIP** — Export your portfolio files with one click
- **Save & Manage** — Log in to save projects, edit them later, and manage all your portfolios from a dashboard
- **Replit Auth** — Secure login via Replit OAuth

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4 |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| Backend | Express 5, Node.js 24, TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Replit Auth (OpenID Connect) |
| AI | OpenAI GPT (via Replit AI Integration) |
| API | OpenAPI spec + Orval codegen (React Query hooks) |
| Monorepo | pnpm workspaces |

---

## Project Structure

```
portfolio-ai-builder/
├── artifacts/
│   ├── api-server/          # Express backend (port 8080)
│   └── portfolio-ai-builder/ # React + Vite frontend
├── lib/
│   ├── db/                  # Drizzle ORM schema & migrations
│   ├── api-spec/            # OpenAPI spec + codegen
│   ├── api-client-react/    # Generated React Query hooks
│   ├── replit-auth-web/     # Auth hook for frontend
│   └── integrations-openai-ai-server/ # OpenAI client for backend
└── scripts/                 # Utility scripts
```

---

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm
- PostgreSQL database
- Replit account (for Auth)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/shakirhussain128/portfolio-ai-builder.git
   cd portfolio-ai-builder
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set environment variables**

   Create a `.env` file or set these in your environment:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/portfolio_ai
   SESSION_SECRET=your_session_secret
   ```

4. **Push database schema**
   ```bash
   pnpm --filter @workspace/db run push
   ```

5. **Run the API server**
   ```bash
   pnpm --filter @workspace/api-server run dev
   ```

6. **Run the frontend**
   ```bash
   pnpm --filter @workspace/portfolio-ai-builder run dev
   ```

Open `http://localhost:5173` in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/user` | Get current user |
| GET | `/api/auth/login` | Start OAuth login |
| GET | `/api/auth/logout` | Logout |
| POST | `/api/generate` | Generate portfolio with AI |
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Save a new project |
| GET | `/api/projects/:id` | Get a single project |
| PUT | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project |
| POST | `/api/projects/:id/duplicate` | Duplicate a project |
| GET | `/api/projects/stats` | Get project statistics |

---

## Development Commands

```bash
pnpm run typecheck          # Full typecheck across all packages
pnpm run build              # Typecheck + build all packages
pnpm --filter @workspace/api-spec run codegen   # Regenerate API hooks from OpenAPI spec
pnpm --filter @workspace/db run push            # Push DB schema changes (dev only)
```

---

## How It Works

1. User types a description (e.g. *"A dark portfolio for a React developer who loves open source"*)
2. The frontend sends the prompt + template to the `/api/generate` endpoint
3. The backend calls OpenAI's GPT model with a structured prompt to produce HTML, CSS, and JS
4. The response is streamed back and displayed in the Monaco editor
5. The live preview iframe updates automatically as the code changes
6. Logged-in users can save, edit, duplicate, and download their projects

---

## License

MIT
