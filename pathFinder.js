// Path Finder Functions

  // Create an empty grid.
    // Each cell is an object with:
    //   letter: either null or a character,
    //   words: a Set of word identifiers (the words that occupy this cell).
    function createEmptyGrid(width, height) {
        const grid = [];
        for (let r = 0; r < height; r++) {
          const row = [];
          for (let c = 0; c < width; c++) {
            row.push({ letter: null, words: new Set() });
          }
          grid.push(row);
        }
        return grid;
      }
      
      // Check that the word fits in the grid at (row, col) in the given orientation.
      function canPlaceWord(grid, word, row, col, orientation) {
        const height = grid.length;
        const width = grid[0].length;
        if (orientation === 'H') {
          if (col + word.length > width) return false;
        } else { // 'V'
          if (row + word.length > height) return false;
        }
        for (let i = 0; i < word.length; i++) {
          const r = (orientation === 'H') ? row : row + i;
          const c = (orientation === 'H') ? col + i : col;
          const cell = grid[r][c];
          if (cell.letter !== null && cell.letter !== word[i]) {
            return false;
          }
        }
        return true;
      }
      
      // Enforce the adjacent constraint: for each non-empty cell, every neighbor (up, down, left, right) that is non-empty must share at least one common word.
      function checkAdjacentConstraint(grid) {
        const height = grid.length;
        const width = grid[0].length;
        for (let r = 0; r < height; r++) {
          for (let c = 0; c < width; c++) {
            const cell = grid[r][c];
            if (cell.letter !== null) {
              const cellWords = cell.words;
              const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
              for (const [dr, dc] of directions) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < height && nc >= 0 && nc < width) {
                  const neighbor = grid[nr][nc];
                  if (neighbor.letter !== null) {
                    let commonFound = false;
                    neighbor.words.forEach(w => {
                      if (cellWords.has(w)) {
                        commonFound = true;
                      }
                    });
                    if (!commonFound) return false;
                  }
                }
              }
            }
          }
        }
        return true;
      }
      
      // Constraint 2: No cell should be used by more than 2 words.
      function checkCellConstraint(grid) {
        const height = grid.length;
        const width = grid[0].length;
        for (let r = 0; r < height; r++) {
          for (let c = 0; c < width; c++) {
            if (grid[r][c].letter !== null && grid[r][c].words.size > 2) {
              return false;
            }
          }
        }
        return true;
      }
      
      // Place a word on the grid, updating cells.
      // Returns a backup record (an array of objects) so the placement can be undone.
      function applyWordToGrid(grid, word, row, col, orientation) {
        const backup = [];
        for (let i = 0; i < word.length; i++) {
          const r = (orientation === 'H') ? row : row + i;
          const c = (orientation === 'H') ? col + i : col;
          const cell = grid[r][c];
          backup.push({
            r: r,
            c: c,
            oldLetter: cell.letter,
            oldWords: new Set(cell.words)
          });
          if (cell.letter === null) {
            cell.letter = word[i];
            cell.words = new Set([word]);
          } else {
            cell.words.add(word);
          }
        }
        return backup;
      }
      
      // Undo a placement using the backup record.
      function restoreGrid(grid, backup) {
        backup.forEach(record => {
          const { r, c, oldLetter, oldWords } = record;
          grid[r][c].letter = oldLetter;
          grid[r][c].words = oldWords;
        });
      }
      
      // Check that every row of the grid has at least one letter.
      function gridHasAllRowsFilled(grid) {
        for (const row of grid) {
          let filled = false;
          for (const cell of row) {
            if (cell.letter !== null) {
              filled = true;
              break;
            }
          }
          if (!filled) return false;
        }
        return true;
      }
      
      // Constraint 1: In the final overlap graph, exactly two words should have exactly one overlap,
      // and all others should have exactly two overlaps.
      // We build an overlap count for each word from the placements (each placement is an array of {r,c}).
      function checkOverlapGraph(placements, words) {
        // If there is only one word, skip this check.
        if (words.length < 2) return true;
        const degrees = {};
        words.forEach(word => { degrees[word] = 0; });
        
        // For every pair of words, check if they share at least one cell.
        for (let i = 0; i < words.length; i++) {
          for (let j = i + 1; j < words.length; j++) {
            const w1 = words[i];
            const w2 = words[j];
            // Build a set of "r,c" strings for w1.
            const positions1 = new Set(placements[w1].map(pos => pos.r + "," + pos.c));
            let overlap = false;
            for (const pos of placements[w2]) {
              if (positions1.has(pos.r + "," + pos.c)) {
                overlap = true;
                break;
              }
            }
            if (overlap) {
              degrees[w1]++;
              degrees[w2]++;
            }
          }
        }
        
        let endpoints = 0;
        let internal = 0;
        for (const word of words) {
          const d = degrees[word];
          if (d === 1) {
            endpoints++;
          } else if (d === 2) {
            internal++;
          } else {
            return false; // Any word with degree 0 or >2 fails.
          }
        }
        return endpoints === 2 && (endpoints + internal === words.length);
      }
      
// Enforce that if any two words share an overlapping cell at an endpoint, then they must be placed with different orientations.
function checkDirectionConstraint(placements, orientations, words) {
    for (let i = 0; i < words.length; i++) {
        for (let j = 0; j < words.length; j++) {
            if (i === j) continue; // Skip comparing the same word
            const w1 = words[i];
            const w2 = words[j];
            const pos1 = placements[w1];
            const pos2 = placements[w2];
            for (let k = 0; k < pos1.length; k++) {
                for (let l = 0; l < pos2.length; l++) {
                    if (pos1[k].r === pos2[l].r && pos1[k].c === pos2[l].c) {
                        // If the overlap is at an endpoint for either word,
                        // enforce that the two words use different directions.
                        if (k === 0 || k === pos1.length - 1 || l === 0 || l === pos2.length - 1) {
                            if (orientations[w1] === orientations[w2]) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
    }
    return true;
}

// The main solver using backtracking.
// Returns an object { solution, placements } if a solution is found; otherwise, returns null.
function solveCrossword(width, height, words) {
    const grid = createEmptyGrid(width, height);
    const placements = {}; // Mapping: word -> array of {r, c}
    const orientations = {}; // Mapping: word -> orientation ('H' or 'V')
    let solution = null;
    let attempts = 0;
    const maxAttempts = 1000000; // Prevent infinite loops
    const progressDiv = document.getElementById("solverProgress");
    
    function backtrack(used) {
        attempts++;
        if (attempts % 1000 === 0) {
            const percentage = ((attempts / maxAttempts) * 100).toFixed(1);
            progressDiv.innerHTML = `${percentage}%`;
            progressDiv.style.display = 'none';
            progressDiv.offsetHeight; // Force redraw
            progressDiv.style.display = 'block';
        }
        
        if (attempts >= maxAttempts) {
            return false;
        }

        if (used.size === words.length) {
            if (!gridHasAllRowsFilled(grid)) return false;
            if (!checkAdjacentConstraint(grid)) return false;
            if (!checkCellConstraint(grid)) return false;
            if (!checkOverlapGraph(placements, words)) return false;
            // Check that consecutive words do not continue in the same direction.
            if (!checkDirectionConstraint(placements, orientations, words)) return false;
            // Deep-copy grid for the solution.
            solution = grid.map(row => row.map(cell => {
                return { letter: cell.letter, words: new Set(cell.words) };
            }));
            return true;
        }
        
        for (const word of words) {
            if (used.has(word)) continue;
            for (const orientation of ['H', 'V']) {
                for (let row = 0; row < height; row++) {
                    for (let col = 0; col < width; col++) {
                        if (!canPlaceWord(grid, word, row, col, orientation)) continue;
                        
                        // For non-first words, require that there is at least one overlapping letter.
                        let overlapCount = 0;
                        for (let i = 0; i < word.length; i++) {
                            const r = (orientation === 'H') ? row : row + i;
                            const c = (orientation === 'H') ? col + i : col;
                            if (grid[r][c].letter !== null) overlapCount++;
                        }
                        if (used.size > 0 && overlapCount === 0) continue;
                        
                        const backup = applyWordToGrid(grid, word, row, col, orientation);
                        placements[word] = [];
                        for (let i = 0; i < word.length; i++) {
                            const r = (orientation === 'H') ? row : row + i;
                            const c = (orientation === 'H') ? col + i : col;
                            placements[word].push({ r: r, c: c });
                        }
                        orientations[word] = orientation;  // Record this word's orientation.
                        used.add(word);
                        
                        if (checkCellConstraint(grid) && checkAdjacentConstraint(grid)) {
                            if (backtrack(used)) return true;
                        }
                        
                        used.delete(word);
                        delete placements[word];
                        delete orientations[word];
                        restoreGrid(grid, backup);
                    }
                }
            }
        }
        return false;
    }
    
    const used = new Set();
    if (backtrack(used)) {
        return { solution: solution, placements: placements };
    } else {
        if (attempts >= maxAttempts) {
            throw new Error("Maximum attempts reached. The puzzle may be too complex.");
        }
        return null;
    }
}
      
      // When the user clicks the button, gather input and run the solver.
      function startSolver() {
        const loader = document.getElementById("pathFinderLoader");
        const solutionDiv = document.getElementById("solution");
        const progressDiv = document.getElementById("solverProgress");
        const dimsInput = document.getElementById("dimensions").value;
        const wordsInput = document.getElementById("words").value;
        
        // Clear previous state and show starting state
        progressDiv.style.display = 'block';
        progressDiv.innerHTML = '0%';
        solutionDiv.innerHTML = ""; // clear any previous solution
        loader.classList.add('active');
        
        // Use requestAnimationFrame for smoother UI updates.
        requestAnimationFrame(() => {
            setTimeout(() => {
                try {
                    const dimsParts = dimsInput.split(",");
                    if (dimsParts.length !== 2) {
                        throw new Error("Please enter exactly two numbers for grid dimensions, separated by a comma.");
                    }
                    const width = parseInt(dimsParts[0].trim());
                    const height = parseInt(dimsParts[1].trim());
                    if (isNaN(width) || isNaN(height)) {
                        throw new Error("Invalid grid dimensions.");
                    }
                    const words = wordsInput.split(",")
                                         .map(s => s.trim())
                                         .filter(s => s.length > 0);
                    if (words.length === 0) {
                        throw new Error("Please enter at least one word.");
                    }
                    
                    const result = solveCrossword(width, height, words);
                    if (result === null) {
                        solutionDiv.textContent = "No solution found. Try adjusting the grid size or words.";
                    } else {
                        const sol = result.solution;
                        // Store the solution grid globally for decoys processing
                        window.currentSolution = sol;
                        // Display the solution
                        displaySolutionAsTable(sol, solutionDiv);
                    }
                } catch (error) {
                    solutionDiv.textContent = "Error: " + error.message;
                } finally {
                    // Hide loader when done
                    loader.classList.remove('active');
                    progressDiv.innerHTML = 'Done';
                }
            }, 50); // Small delay to ensure UI updates
        });
    }

// Helper function to rebuild the plaintext string from the grid.
function buildPlaintext(grid) {
    const numCols = grid[0].length;
    let text = "Solution found:\n";
    // The frame borders will have length = grid columns + 2 (one on each side)
    const border = "!".repeat(numCols + 2);
    // Add top border.
    text += border + "\n";
    // Process each row, adding a left and right "!" border.
    for (let r = 0; r < grid.length; r++) {
        let rowStr = "";
        for (let c = 0; c < numCols; c++) {
            rowStr += grid[r][c].letter ? grid[r][c].letter : ".";
        }
        text += "!" + rowStr + "!" + "\n";
    }
    // Add bottom border.
    text += border + "\n";
    return text;
}

// Helper: display grid solution as plaintext
function displaySolutionAsTable(grid, container) {
    const plaintext = buildPlaintext(grid);
    container.textContent = plaintext;
    container.contentEditable = "true";
}

// Helper to parse user-revised grid text into a grid structure (each line must be exactly 9 characters)
function parseEditedGrid(text) {
    const lines = [];
    for (const line of text.split('\n')) {
        const trimmed = line.trim();
        if (trimmed !== '') {
            lines.push(trimmed);
        }
    }
    // If first line contains header info, remove it.
    if (lines.length && lines[0].startsWith("Solution found:")) {
        lines.shift();
    }
    const grid = [];
    for (const line of lines) {
        const row = line.trim();
        if (row.length !== 11) { // enforce each line is exactly 11 characters
            throw new Error("Each grid line must be exactly 11 characters.");
        }
        const cells = [];
        for (const ch of row) {
            cells.push({ letter: ch === '.' ? null : ch, words: new Set(), isDecoy: false });
        }
        grid.push(cells);
    }
    return grid;
}

async function loadDictionary(theme = "animals") {
    try {
        const response = await fetch("dictionaries.json");
        if (!response.ok) {
            throw new Error("Failed to load the dictionary file.");
        }
        const data = await response.json();
        // Return the dictionary for the given theme, or default if missing.
        return data[theme] || data["animals"];
    } catch (error) {
        console.error("Error loading dictionary:", error);
        return null;
    }
}

async function addDecoys() {
    if (!window.currentSolution) {
        alert("No existing solution found. Please run the solver first.");
        return;
    }
    try {
        // Parse the edited grid from the solution element
        const solutionElem = document.getElementById("solution");
        const editedText = solutionElem.innerText;
        const revisedGrid = parseEditedGrid(editedText);
        window.currentSolution = revisedGrid;
    } catch (error) {
        alert("Invalid grid revision: " + error.message);
        return;
    }
    // Get the selected theme from the dropdown (default to "animals")
    const themeElement = document.getElementById("dictionaryTheme");
    const theme = themeElement ? themeElement.value : "animals";

    const dict = await loadDictionary(theme);
    if (!dict) {
        alert("Failed to load the dictionary. Decoys cannot be added.");
        return;
    }
  
    const grid = window.currentSolution;
    const numRows = grid.length;
    const numCols = grid[0].length;
  
    let decoyWords = [];
  
    // Function to scan and return contiguous empty zones from the grid.
    function getEmptyZones() {
        const zones = [];
        // Horizontal zones
        for (let r = 0; r < numRows; r++) {
            let c = 0;
            while (c < numCols) {
                if (grid[r][c].letter === null) {
                    const start = c;
                    while (c < numCols && grid[r][c].letter === null) { 
                        c++; 
                    }
                    zones.push({ orientation: "H", row: r, col: start, length: c - start });
                } else {
                    c++;
                }
            }
        }
        // Vertical zones
        for (let c = 0; c < numCols; c++) {
            let r = 0;
            while (r < numRows) {
                if (grid[r][c].letter === null) {
                    const start = r;
                    while (r < numRows && grid[r][c].letter === null) { 
                        r++; 
                    }
                    zones.push({ orientation: "V", row: start, col: c, length: r - start });
                } else {
                    r++;
                }
            }
        }
        return zones;
    }
  
    // Iteratively fill empty zones one at a time.
    let zones = getEmptyZones();
    while(zones.length > 0) {
        let placedAny = false;
        // Process each zone one by one.
        for (const zone of zones) {
            // Double-check that every cell in the zone is still empty.
            let canPlace = true;
            if (zone.orientation === "H") {
                for (let i = 0; i < zone.length; i++) {
                    if (grid[zone.row][zone.col + i].letter !== null) {
                        canPlace = false;
                        break;
                    }
                }
            } else { // Vertical
                for (let i = 0; i < zone.length; i++) {
                    if (grid[zone.row + i][zone.col].letter !== null) {
                        canPlace = false;
                        break;
                    }
                }
            }
            if (!canPlace) continue;
  
            // Check if a candidate word exists for this zone length.
            if (dict[zone.length] && dict[zone.length].length > 0) {
                const candidates = dict[zone.length];
                const randomIndex = Math.floor(Math.random() * candidates.length);
                const candidate = candidates.splice(randomIndex, 1)[0];
                // Place the candidate in the zone and mark letters as decoys.
                if (zone.orientation === "H") {
                    for (let i = 0; i < zone.length; i++) {
                        grid[zone.row][zone.col + i].letter = candidate[i].toUpperCase();
                        grid[zone.row][zone.col + i].isDecoy = true;
                    }
                } else {
                    for (let i = 0; i < zone.length; i++) {
                        grid[zone.row + i][zone.col].letter = candidate[i].toUpperCase();
                        grid[zone.row + i][zone.col].isDecoy = true;
                    }
                }
                decoyWords.push(candidate);
                placedAny = true;
            }
        }
        // Recompute zones on the updated grid.
        zones = getEmptyZones();
        // If no new decoys were placed this iteration, break to prevent an infinite loop.
        if (!placedAny) break;
    }
  
    // Build display HTML from the updated grid.
    let text = "Decoy solution:<br>";
    for (let r = 0; r < numRows; r++) {
        let rowStr = "";
        for (let c = 0; c < numCols; c++) {
            if (grid[r][c].letter) {
                if (grid[r][c].isDecoy) {
                    rowStr += '<span style="color:red;">' + grid[r][c].letter + '</span>';
                } else {
                    rowStr += grid[r][c].letter;
                }
            } else {
                rowStr += ".";
            }
        }
        text += rowStr + "<br>";
    }
    document.getElementById("solution").innerHTML = text;
    document.getElementById("solution").contentEditable = "true";
  
    // Update the Distractors field with the decoy words.
    const distractorsField = document.getElementById("distractors");
    if (distractorsField) {
        distractorsField.value = decoyWords.join(", ");
    }
}