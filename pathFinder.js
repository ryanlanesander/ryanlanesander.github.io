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
      
      // Enforce the adjacent constraint: for each non-empty cell, every neighbor (up, down, left, right)
      // that is non-empty must share at least one common word.
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
      
      // New Constraint 2: No cell should be used by more than 2 words.
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
      
      // New Constraint 1: In the final overlap graph, exactly two words should have exactly one overlap,
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
      
      // The main solver using backtracking.
      // Returns an object { solution, placements } if a solution is found; otherwise, returns null.
      function solveCrossword(width, height, words) {
        const grid = createEmptyGrid(width, height);
        const placements = {}; // Mapping: word -> array of {r, c}
        let solution = null;
        
        function backtrack(used) {
          if (used.size === words.length) {
            if (!gridHasAllRowsFilled(grid)) return false;
            if (!checkAdjacentConstraint(grid)) return false;
            if (!checkCellConstraint(grid)) return false;
            if (!checkOverlapGraph(placements, words)) return false;
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
                  used.add(word);
                  
                  // Check our constraints that can be verified immediately.
                  if (checkCellConstraint(grid) && checkAdjacentConstraint(grid)) {
                    if (backtrack(used)) return true;
                  }
                  
                  used.delete(word);
                  delete placements[word];
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
          return null;
        }
      }
      
      // When the user clicks the button, gather input and run the solver.
      function startSolver() {
        const loader = document.getElementById("pathFinderLoader");
        const solutionDiv = document.getElementById("solution");
        const dimsInput = document.getElementById("dimensions").value;
        const wordsInput = document.getElementById("words").value;
        
        // Show loader, hide previous solution
        loader.classList.add('active');
        solutionDiv.textContent = "";
        
        // Use setTimeout to allow the UI to update before running the solver
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
                const words = wordsInput.split(",").map(s => s.trim()).filter(s => s.length > 0);
                if (words.length === 0) {
                    throw new Error("Please enter at least one word.");
                }
                
                const result = solveCrossword(width, height, words);
                if (result === null) {
                    solutionDiv.textContent = "No solution found.";
                } else {
                    const sol = result.solution;
                    let text = "Solution found:\n";
                    for (let r = 0; r < sol.length; r++) {
                        let rowStr = "";
                        for (let c = 0; c < sol[r].length; c++) {
                            rowStr += sol[r][c].letter ? sol[r][c].letter : ".";
                        }
                        text += rowStr + "\n";
                    }
                    solutionDiv.textContent = text;
                }
            } catch (error) {
                solutionDiv.textContent = "Error: " + error.message;
            } finally {
                // Hide loader when done
                loader.classList.remove('active');
            }
        }, 50); // Small delay to ensure UI updates
    }