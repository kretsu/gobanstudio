# GobanStudio — Go Lesson & Variation Studio

**GobanStudio** is an application built for Go teachers and students. It provides Photoshop-like multi-layered board management, SGF-compatible serialization, freehand vector drawing, and an intuitive studio environment.

---

### Key Capabilities

1. **Photoshop-like Layer Hierarchy**:
   - **Root Layer (Background / Base Game)**: Main game sequence or initial position. In Root mode, moves are numbered sequentially from 1 to the last stone ($1 \dots N$).
   - **Variation Layers**: Branching variations created under the Root layer with customizable names, tags (e.g., `#Joseki`, `#Invasion`, `#Mistake`), and branch points. When viewing a variation, Root stones are un-numbered, while variation moves start from number 1.
   - **Subvariation Layers**: Sublayers attached to any variation or root for trial moves, standard Goban markings, or freehand annotations. By default, subvariation layers are hidden when loading the project file, allowing teachers to toggle them on-demand during live lessons.
   - **Layer Locking**: Completed root or variation layers can be locked to protect lesson materials against accidental edits during class.

2. **Goban Markings & Vector Drawing**:
   - **Standard Goban Markings**: Triangle (TR), Square (SQ), Circle (CR), Cross/Mark (MA / X), Letter / Number labels (LB), and Territory indicators.
   - **Freehand Drawing Tools**: Multi-color brush lines, directional tactical arrows, straight lines, and a live fading laser pointer for lecture spotlighting.

3. **File Format & SGF Compatibility**:
   - **Project Persistence (`.gobanstudio`)**: Serializes full layer hierarchies, lock statuses, default visibility flags, tags, teacher commentary, and vector drawings.
   - **Standard SGF Export/Import (`.sgf`)**: Exports and imports multi-branch variation trees compatible with standard Go software (OGS, KGS, Sabaki, KaTrain).
   - **Board Snapshot Export**: High-resolution PNG image exporter for lesson worksheets and slides.

4. **Studio Workspace**:
   - Comprehensive layout with Layer Panel, Toolbox, Property Scrubber, and Commentary Editor.

---

### Quick Start

#### Development Mode:
```bash
npm run dev
```

#### Run Automated Tests:
```bash
npm test
```

#### Production Build & Run:
```bash
npm run build
npm start
```
The server will start at `http://localhost:3000`.
