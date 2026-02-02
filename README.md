# SystemA - Architecture Design Tool

A thinking tool for system architecture design. Not a diagramming tool, not a whiteboard—a structured environment for building correct, clear system architectures.

## Philosophy

**What SystemA is:**
- A thinking tool for system architecture
- Optimized for clarity, reasoning, and correctness
- Visuals exist to support decisions, not replace them

**What SystemA is not:**
- Not a diagramming tool
- Not a whiteboard
- Not a cloud provisioner
- Not an AI architect
- Not a design showcase

<video src="https://github.com/Altyd/Systema/assets/demo.mp4" controls></video>

*Short screen recording of SystemA in use*

## Features

### Core Architecture Design
- **Node-based editor** - n8n-style canvas with drag-drop, zoom, pan, snap-to-grid
- **Structured components** - Every component must define:
  - Name, type, responsibility (single sentence)
  - Inputs, outputs, dependencies
  - Owner, environment, criticality
  - Failure modes and recovery strategies
  - Notes and assumptions
- **Connection system** - Define contracts, failure behavior, retry policies, and timeouts
- **System states** - Normal, Degraded, Read-only, Fail-open, Fail-closed

### Validation & Warnings
Soft enforcement that warns when:
- Component has no failure mode
- Critical node has no recovery
- External dependency lacks notes
- Ownership is undefined
- Control logic is implicit

### Simulation
- Toggle component failure
- Observe downstream impact and degraded states
- Highlight single points of failure and tight coupling

### Collaboration (Supabase-powered)
- User authentication
- Architecture sharing with roles: Owner, Editor, Commenter, Viewer
- Inline comments
- Change log
- Version history and snapshots

### Export & Sharing
- Export to PNG, PDF, JSON/YAML
- Public read-only links
- Embed in documentation

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Canvas**: React Flow (node-based editor)
- **State**: Zustand
- **Backend**: Supabase (auth, database, real-time)
- **Styling**: Tailwind CSS (custom dark theme)

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Altyd/Systema.git
cd Systema
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase-schema.sql` in the SQL editor
   - Copy your project URL and anon key

4. Configure environment variables:
```bash
cp .env.example .env
```
Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the development server:
```bash
npm run dev
```

6. Open http://localhost:5173 in your browser

## Project Structure

```
Systema/
├── src/
│   ├── components/
│   │   ├── canvas/          # Main canvas editor
│   │   ├── nodes/           # Custom React Flow nodes
│   │   ├── edges/           # Custom React Flow edges
│   │   └── panels/          # Metadata, validation panels
│   ├── store/               # Zustand state management
│   ├── types/               # TypeScript type definitions
│   ├── lib/                 # Supabase client setup
│   ├── App.tsx              # Main application
│   └── main.tsx             # Entry point
├── supabase-schema.sql      # Database schema
└── package.json
```

## Component Types

- **API** - REST/GraphQL endpoints
- **DB** - Databases
- **Worker** - Background processors
- **Queue** - Message queues
- **External** - Third-party services
- **Human** - Manual processes
- **Control** - Conditional logic/routing

## Criticality Levels

- **High** (Red) - Critical path, requires recovery strategy
- **Medium** (Yellow) - Important but not critical
- **Low** (Green) - Nice to have

## Keyboard Shortcuts

- `Space + Drag` - Pan canvas
- `Scroll` - Zoom in/out
- `Delete` - Remove selected node/edge
- `Cmd/Ctrl + S` - Save architecture

## Possible Extensions

- [ ] AI advisory features (architecture explanation, risk summary)
- [ ] Connection editing panel (edit edge metadata)
- [ ] Real-time collaboration
- [ ] Advanced export options (PNG, PDF, SVG, embedded HTML)
- [ ] Architecture templates
- [ ] Dependency analysis tools
- [ ] Comments and annotations system
- [ ] Version history and snapshots UI
- [ ] Integration with documentation systems

## Design Principles

1. **Explicit over implicit** - Everything must be defined
2. **Declarative over freeform** - Structure enforces correctness
3. **Constraints over flexibility** - Opinionated by design
4. **Explanation over polish** - Clarity beats aesthetics
5. **Boring correctness** - No clever UX tricks

## Contributing

This is a philosophical tool. Before contributing:
1. Read the philosophy section
2. Understand what this tool is NOT
3. Ensure your contribution aligns with the core principles

## License

MIT

## Documentation

Additional documentation is available in the [`docs/`](docs/) folder:
- [Quick Start Guide](docs/QUICKSTART.md)
- [Project Structure](docs/PROJECT_STRUCTURE.md)
- [Possible Extensions](docs/POSSIBLE_EXTENSIONS.md)

## Support

For issues, questions, or discussions, please open an issue on GitHub.