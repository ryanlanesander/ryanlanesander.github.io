# Lil Tools Project Documentation

## Overview
This project is a collection of interactive web-based tools and games, including a crossword path finder, dictionary editor, quiz creator, and more. The codebase is primarily JavaScript and HTML, with supporting CSS for styling.

---

## Main Pages

### 1. `liltools.html`
- **Purpose:** Main dashboard and UI for all tools. Contains sections for each game/utility (e.g., Path Finder, Quiz Climb, Chain, Swap, Downward, etc.).
- **Key Features:**
  - Navigation bar for switching between tools.
  - Modal for editing dictionaries.
  - Dynamic sections for each tool/game, shown/hidden via JavaScript.
  - Buttons to trigger actions (e.g., Add Decoys, Edit Dictionaries, Generate JSON).

### 2. `pathFinder.js`
- **Purpose:** Implements the crossword path-finding logic and decoy word placement.
- **Key Functions:**
  - `startSolver()`: Parses user input, runs the crossword solver, and displays the solution.
  - `solveCrossword()`: Backtracking algorithm to fit words into a grid.
  - `addDecoys()`: Fills empty grid spaces with decoy words from a selected or custom dictionary.
  - `loadDictionary(theme)`: Loads a dictionary by theme or uses a custom dictionary set by the user.
  - Helper functions for grid manipulation and constraint checking.

### 3. `dictionaryEditor.js`
- **Purpose:** Provides a modal UI for editing, creating, and managing word dictionaries used by the games.
- **Key Features:**
  - Load, display, and edit dictionaries from `dictionaries.json`.
  - Add new words to existing dictionaries, grouped by word length.
  - Create new dictionaries.
  - Set a custom dictionary to be used as the decoy source in the Path Finder tool.

### 4. `dictionaries.json`
- **Purpose:** Stores all word lists, grouped by theme and word length.
- **Format Example:**
  ```json
  {
    "animals": {
      "3": ["cat", "dog"],
      "4": ["lion", "bear"]
    },
    ...
  }
  ```

### 5. `json_converter.js`
- **Purpose:** Handles import/export and conversion of game data to/from JSON for various game formats.
- **Key Features:**
  - Export current game state to JSON.
  - Import JSON files to populate the UI.
  - Format-specific loaders (e.g., stacked, quoted, quiz climb).

### 6. `downwardsAssistant.js`, `emojicarouselmodal.js`, `lilPasswords.js`
- **Purpose:** Additional utilities for specific games or UI features (e.g., emoji selection, password overlays, AI suggestions).

---

## How to Use
1. **Open `liltools.html` in a browser.**
2. **Select a tool/game** from the dashboard.
3. **Input data** (words, clues, settings) as required by the tool.
4. **Use the Dictionary Editor** to manage word lists and set custom decoy dictionaries for the Path Finder.
5. **Export or import JSON** for saving/loading game data.

---

## Custom Dictionary Workflow
- Open the Dictionary Editor modal.
- Add or create a dictionary, inputting words (comma-separated).
- Click "Use This Dictionary for Decoys" to set it as the active decoy source.
- Run the Path Finder and use "Add Decoys" to fill the grid with your custom words.

---

## File List
- `liltools.html` — Main UI and tool dashboard.
- `pathFinder.js` — Crossword/path-finding logic and decoy placement.
- `dictionaryEditor.js` — Dictionary management modal and logic.
- `dictionaries.json` — Word lists by theme and length.
- `json_converter.js` — JSON import/export and format conversion.
- `downwardsAssistant.js` — AI and helper features for Downward game.
- `emojicarouselmodal.js` — Emoji picker modal logic.
- `lilPasswords.js` — Password overlay logic.
- `styles.css` — Main stylesheet.
- `beats/`, `cluecards/`, `Website Assets/` — Additional games/assets.

---

## Contributing
- Fork the repository and submit pull requests for improvements or bug fixes.
- Please keep code modular and document new features.

---

## License
TK
