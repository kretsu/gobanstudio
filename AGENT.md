# GobanStudio — Agent Knowledge Base & Project Documentation

## 1. Project Purpose & Objectives
**GobanStudio** is an interactive, web-based Go (Weiqi/Baduk) teaching platform designed specifically for Go instructors and students. The application treats Go game analysis, lessons, and tactical variations with a hierarchical, layer-based workflow, maximizing pedagogical efficiency and eliminating repetitive manual setup during live lessons.

### Primary Objectives:
- **Hierarchical Lesson Preparation**: Enable instructors to prepare Go positions, branch variations recursively in a tree hierarchy, and overlay drawing commentary before and during lectures.
- **Frictionless Live Teaching**: Facilitate seamless live exploration of alternative sequences without corrupting root game states.
- **Visual Distinction & Focus**: Provide clear numbering, intuitive layer visibility, visual outdatedness warnings, and persistent lock controls to maximize student comprehension.

---

## 2. Architecture & Technology Stack

- **Runtime & Backend**: Node.js (v20+ / v24+), Express (`server.js`) serving static assets and API health endpoints.
- **Frontend Framework**: React 18, TypeScript, Tailwind CSS, Lucide React icons.
- **Build System**: Vite 6 / 8, PostCSS, Autoprefixer.
- **Testing**: Vitest (`npm test`) with comprehensive unit testing covering Go rules, layer transitions, numbering, tree hierarchy, and serialization.
- **Audio Synthesis**: Web Audio API (`src/engine/soundEffects.ts`) for realistic stone placement clacks with auto-unlocking gesture listeners.

```
gobanstudio/
├── dist/                      # Production build output
├── src/
│   ├── components/            # UI Components
│   │   ├── GobanBoard.tsx     # Canvas Go board rendering (stones, marks, drawings, ghost previews)
│   │   ├── LayerPanel.tsx     # Photo editor-style tree hierarchy manager
│   │   ├── LessonNotes.tsx    # Rich lesson notes and teaching point editor
│   │   ├── SampleLessons.ts   # Pre-configured teaching scenarios (Joseki, Tsumego)
│   │   └── Toolbar.tsx        # Tool selection, stone colors, markers, export/import
│   ├── engine/                # Core logic & algorithms
│   │   ├── engine.test.ts     # Vitest test suite
│   │   ├── goRules.ts         # Go board state, liberty counting, group captures, suicide checks
│   │   ├── layerManager.ts    # Tree hierarchy, display state computation, auto-branching router
│   │   ├── sgfParser.ts       # SGF export/import and native .gobanstudio JSON serialization
│   │   └── soundEffects.ts    # Synthetic audio engine for stone placement clicks
│   ├── types/
│   │   └── goban.ts           # Core TypeScript data structures and interfaces
│   ├── App.tsx                # Main application state orchestrator & mode switcher
│   ├── index.css              # Global styles & Tailwind directives
│   └── main.tsx               # React application entry point
├── server.js                  # Production Express static web server
├── package.json               # Dependencies and script definitions
└── tsconfig.json              # TypeScript compiler configuration
```

---

## 3. Core Domain Concepts & Layer Hierarchy

### 3.1 Tree Hierarchy Structure
1. **Root Layer (Base Game / Board)**:
   - The foundational game or problem position (`id: 'root'`).
   - Contains setup handicap stones (`initialStones`), sequential root moves (`moves`), static markings, and drawing overlays (`subLayers`).
2. **Variation Layers (Tree Branches)**:
   - Form a multi-level tree hierarchy via `parentId` and `branchPoint`.
   - Variations directly under Root have `parentId: 'root'` and inherit root moves up to `branchPoint`.
   - Child variations have `parentId: string` pointing to their parent variation, inheriting ancestral moves up to their respective branch points.
   - Stone sequences are native variations in the tree hierarchy rather than separate sublayers.
3. **Subvariation Layers (Drawing Overlays Only)**:
   - Nested under the Root layer or any Variation layer.
   - Dedicated strictly to **drawings** (`type: 'drawing'`): freehand pen strokes, arrows, lines, and tactical markings.

---

## 4. Key Rules, Dynamics & Behavioral Logic

### 4.1 Stone Numbering Logic
- **Root View**: Stones display chronological move numbers (`1..N`).
- **Direct Variations of Root**: Root stones are rendered **unnumbered** (clean board context), while variation moves explicitly begin at **1 (`1..M`)**.
- **Child Variations (Sub-Variations)**: Stones seamlessly **continue numbering** from the parent variation's branch point (`parentCumulativeBranchPoint + i + 1`), preserving tactical reading continuity without resetting to 1.

### 4.2 Automated Branching & Lock Protection
- **Locked Root / Locked Variation**:
  - Placing a stone automatically creates a new child variation nested under the active layer (`parentId: activeId`, `branchPoint: currentStep`), selects it, and starts the new move sequence.
  - Drawing automatically creates a new `drawing` sublayer.
- **Unlocked Layers**:
  - Placing stones or adding markings appends directly to the active layer and marks all descendant variations/sublayers as `outdated: true`.
- **Drawing Sublayer Interaction**:
  - When an unlocked drawing sublayer is active, new freehand drawings append directly to it.
  - Selecting a drawing sublayer auto-switches the editor tool to `draw-pen`. Selecting a variation auto-switches to stone placement (`stone-alt`).

### 4.3 Outdated State Propagation
- If the Root layer is altered, all variations and sublayers across the project are automatically flagged as `outdated: true`.
- If a Variation is altered, all child variations in its descendant tree and all its drawing sublayers are flagged as `outdated: true`.
- **Visual Feedback**: Outdated layers display a red status dot and an `outdated` badge in the Layer Panel; valid layers display a green dot. Instructors can click the dot to manually toggle validity.
- **Persistence**: Outdated status is saved to and loaded from `.gobanstudio` files.

### 4.4 Lock Controls, Action Menus & Collapsible Trees
- **Collapsible Variation Tree**: All variations and root drawing overlays are collapsed by default and expand automatically upon selection or when containing an active descendant. Collapsed variations display summary count badges (`N branches`, `N overlays`) and interactive Chevron toggles (`ChevronRight`/`ChevronDown`) to expand or collapse sub-trees on demand without cluttering the screen.
- **Persistent Lock Icon**: A Lock / Unlock icon button is visible on every row (Root, Variations, Drawing Sublayers) at all times to allow instant 1-click toggling and immediate visibility of lock state.
- **Rename Mode Isolation**: The lock button and options menu are hidden exclusively during active rename mode, giving the input field maximum room with auto-focus, text selection, Save (`Check`, `Enter`), and Cancel (`X`, `Escape`) buttons.
- **Three-Dots Menu**: Consolidates actions (Rename, Add Sub-Variation, Add Drawing Overlay, Duplicate, Lock/Unlock, Delete).

---

## 5. File Formats & Persistence

### 5.1 Native `.gobanstudio` Format
A JSON-based serialization format preserving the full variation tree hierarchy (`parentId`, `branchPoint`), lock states, outdated flags, drawings, markings, lesson notes, and metadata.
- **Backward Compatibility Migration**: When loading legacy `.gobanstudio` or `.gobanshow` files with `stones` sublayers, the parser automatically converts them into native child variations in the tree hierarchy.

### 5.2 SGF (Smart Game Format) Compatibility
- **Export**: Exports the full variation tree hierarchy recursively into standard SGF multi-branch syntax (`(;GM[1]...(;B[]...)(;B[]...))`), ensuring complete compatibility with external Go software (Kogo's Joseki Dictionary, Sabaki, OGS).
- **Import**: Parses SGF trees with intelligent branching logic — the Root layer contains the move sequence strictly up to the first branching point, and all subsequent branches and sub-branches are recursively imported into a native variation tree hierarchy with accurate `parentId` and `branchPoint` assignments. Linear games without variations are imported fully into the Root layer.

---

## 6. Developer Workflow & Verification

### Common Commands:
```bash
# Install dependencies
npm install

# Run unit tests (Vitest)
npm test

# Build production bundle (TypeScript + Vite)
npm run build

# Start local development server
npm run dev

# Run production Node.js Express server
node server.js
```
