# SystemA Project Structure

```
Systema/
│
├── 📄 Configuration Files
│   ├── package.json              # Dependencies and scripts
│   ├── tsconfig.json             # TypeScript config
│   ├── tsconfig.node.json        # Node TypeScript config
│   ├── vite.config.ts            # Vite build config
│   ├── tailwind.config.js        # Tailwind CSS config (dark theme)
│   ├── postcss.config.js         # PostCSS config
│   ├── .gitignore                # Git ignore rules
│   ├── .env.example              # Environment template
│   └── .env                      # YOUR SUPABASE CREDENTIALS (create this!)
│
├── 📖 Documentation
│   ├── README.md                 # Full project documentation
│   ├── START_HERE.md             # Quick overview & status ⭐
│   ├── QUICKSTART.md             # Setup guide
│   ├── PROJECT_SUMMARY.md        # Technical details
│   ├── DEVELOPMENT_ROADMAP.md    # What to build next
│   └── TROUBLESHOOTING.md        # Disk space & install issues
│
├── 🗄️ Database
│   └── supabase-schema.sql       # Complete database schema (run in Supabase)
│
├── 🛠️ Scripts
│   └── setup.ps1                 # PowerShell setup script
│
├── 🌐 Public Assets
│   └── index.html                # HTML entry point
│
└── 📁 src/ - Main Application Code
    │
    ├── 📄 Entry Points
    │   ├── main.tsx              # React entry point
    │   ├── App.tsx               # Main app component ⭐
    │   └── index.css             # Global styles (dark theme)
    │
    ├── 📦 types/
    │   └── index.ts              # All TypeScript types ⭐
    │       ├── Component
    │       ├── Connection
    │       ├── Architecture
    │       ├── FailureMode
    │       ├── RecoveryStrategy
    │       ├── ValidationWarning
    │       └── ... (20+ types)
    │
    ├── 🏪 store/
    │   └── architectureStore.ts  # Zustand state management ⭐
    │       ├── currentArchitecture
    │       ├── addComponent()
    │       ├── updateComponent()
    │       ├── addConnection()
    │       ├── validateArchitecture()
    │       ├── toggleSimulationMode()
    │       └── ... (15+ actions)
    │
    ├── 🔧 lib/
    │   └── supabase.ts           # Supabase client setup
    │
    └── 🎨 components/
        │
        ├── canvas/
        │   └── ArchitectureCanvas.tsx  # Main canvas editor ⭐
        │       ├── React Flow integration
        │       ├── Node dragging
        │       ├── Zoom/pan controls
        │       ├── Mini-map
        │       └── Simulation controls
        │
        ├── nodes/
        │   └── ComponentNode.tsx       # Custom component nodes ⭐
        │       ├── 7 component types
        │       ├── Criticality colors
        │       ├── Failure visualization
        │       └── Connection handles
        │
        ├── edges/
        │   └── ConnectionEdge.tsx      # Custom connection edges
        │       ├── Critical path styling
        │       ├── Control flow styling
        │       └── Bezier curves
        │
        └── panels/
            ├── MetadataPanel.tsx       # Component editor panel ⭐
            │   ├── Basic info form
            │   ├── Failure modes list
            │   ├── Recovery strategies
            │   └── Save/cancel actions
            │
            └── ValidationPanel.tsx     # Validation warnings ⭐
                ├── Error list
                ├── Warning list
                └── Auto-validation

```

## 🎯 Key Files to Understand

### Start Here:
1. **START_HERE.md** - Project status and next steps
2. **src/App.tsx** - Main application, demo architecture
3. **src/types/index.ts** - Understand the data model

### Core Functionality:
4. **src/store/architectureStore.ts** - How state works
5. **src/components/canvas/ArchitectureCanvas.tsx** - Canvas editor
6. **src/components/nodes/ComponentNode.tsx** - How nodes look
7. **src/components/panels/MetadataPanel.tsx** - Component editing

### Setup:
8. **package.json** - Dependencies to install
9. **supabase-schema.sql** - Database to create
10. **.env.example** - Credentials to add

---

## 📊 File Statistics

- **Total Files**: 28
- **TypeScript Files**: 13
- **Config Files**: 8
- **Documentation**: 7
- **Lines of Code**: ~3,500

---

## 🎨 Component Tree (Runtime)

```
App
├── Header
│   ├── Title: "SystemA"
│   ├── Architecture Name
│   └── Actions
│       ├── Details Button
│       ├── Collaborate Button
│       ├── Export Button
│       └── Save Button
│
└── Main
    ├── ArchitectureCanvas (React Flow)
    │   ├── Background (Grid)
    │   ├── Controls (Zoom/Pan)
    │   ├── MiniMap
    │   ├── Panel (Top-Left)
    │   │   ├── Add Component Button
    │   │   └── Simulation Toggle
    │   ├── Panel (Top-Center)
    │   │   └── Simulation Status
    │   ├── Nodes
    │   │   └── ComponentNode (repeated)
    │   │       ├── Icon
    │   │       ├── Name
    │   │       ├── Type
    │   │       ├── Responsibility
    │   │       └── Metadata
    │   └── Edges
    │       └── ConnectionEdge (repeated)
    │
    ├── MetadataPanel (Right Side)
    │   ├── Header
    │   ├── Basic Info Section
    │   ├── Failure Modes Section
    │   ├── Recovery Strategies Section
    │   ├── Notes Section
    │   └── Actions (Save/Cancel)
    │
    └── ValidationPanel (Bottom-Left)
        ├── Header (Error/Warning Count)
        ├── Errors Section
        └── Warnings Section
```

---

## 🔄 Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Zustand Store Action
    ↓
State Update
    ↓
React Re-render
    ↓
UI Update
```

Example:
```
1. User clicks "Save" on MetadataPanel
2. handleSave() called
3. updateComponent() in store
4. Store updates currentArchitecture
5. React Flow re-renders node
6. validateArchitecture() runs
7. ValidationPanel shows new warnings
```

---

## 🗄️ Database Schema (Supabase)

```
auth.users (Supabase managed)
    ↓
profiles
    ├── id (FK to auth.users)
    ├── email
    ├── full_name
    └── avatar_url

architectures
    ├── id
    ├── name
    ├── description
    ├── data (JSONB - entire architecture)
    ├── created_by (FK to profiles)
    ├── version
    ├── is_public
    └── public_link

architecture_collaborators
    ├── architecture_id (FK)
    ├── user_id (FK to profiles)
    └── role (Owner/Editor/Commenter/Viewer)

architecture_snapshots
    ├── architecture_id (FK)
    ├── name
    ├── data (JSONB - snapshot)
    └── created_by (FK)

comments
    ├── architecture_id (FK)
    ├── component_id (optional)
    ├── connection_id (optional)
    ├── content
    ├── author (FK to profiles)
    └── resolved

change_log
    ├── architecture_id (FK)
    ├── user_id (FK)
    ├── action
    └── changes (JSONB)
```

---

## 🎯 Completion Status

### ✅ Complete (70%)
- Project structure
- Type system
- State management
- Canvas editor
- Custom nodes/edges
- Metadata panel
- Validation system
- Simulation mode
- Database schema
- Documentation

### 🚧 In Progress (0%)
- Nothing currently

### ❌ Not Started (30%)
- Authentication UI
- Save/Load to database
- Add component modal
- Connection editing
- Architecture management
- Collaboration UI
- Comments system
- Export functionality
- Version history UI
- Drawing tools
- AI advisory

---

## 📦 Dependencies (package.json)

### Production:
- react ^18.2.0
- react-dom ^18.2.0
- reactflow ^11.10.4 (Canvas)
- @supabase/supabase-js ^2.39.3 (Backend)
- zustand ^4.5.0 (State)
- react-router-dom ^6.21.3 (Routing)
- lucide-react ^0.316.0 (Icons)
- clsx ^2.1.0 (CSS utility)

### Development:
- @vitejs/plugin-react ^4.2.1
- typescript ^5.3.3
- tailwindcss ^3.4.1
- vite ^5.0.12
- eslint ^8.56.0

**Total install size**: ~300MB

---

## 🚀 Scripts (package.json)

```bash
npm run dev      # Start development server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 🎨 Theme Colors

```javascript
// tailwind.config.js
colors: {
  'system-bg': '#000000',      // Pure black
  'system-text': '#FFFFFF',    // Pure white
  'system-border': '#FFFFFF',  // White borders
  'system-hover': '#1a1a1a',   // Slight gray on hover
  'system-active': '#2a2a2a',  // Darker gray when active
}
```

**Criticality Colors**:
- High: `#f87171` (red-400)
- Medium: `#fbbf24` (yellow-400)
- Low: `#22c55e` (green-500)

**Failure State**: `#ef4444` (red-500)

---

This is your complete project structure! Everything is organized and documented. 🎉
