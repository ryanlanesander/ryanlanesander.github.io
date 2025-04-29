// Functions to show the grid editor modal, allow inline editing, and export as plaintext.

function showGridModal(grid) {
    // Build the editable table from the grid
    const container = document.getElementById("gridTableContainer");
    container.innerHTML = ""; // Clear previous content

    const table = document.createElement("table");
    table.id = "gridSolutionTable";
    table.style.borderCollapse = "collapse";

    for (let r = 0; r < grid.length; r++) {
        const tr = document.createElement("tr");
        for (let c = 0; c < grid[r].length; c++) {
            const td = document.createElement("td");
            td.contentEditable = true;
            // Populate with the letter or empty string
            td.textContent = grid[r][c].letter ? grid[r][c].letter : "";
            td.style.border = "1px solid #ccc";
            td.style.padding = "5px";
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    container.appendChild(table);

    // Clear any previous exported plaintext
    document.getElementById("exportedPlaintext").textContent = "";

    // Show the modal
    const modal = document.getElementById("gridModal");
    modal.style.display = "block";
}

// Function to export grid as plaintext by reading the table
function exportGridAsPlaintext() {
    const table = document.getElementById("gridSolutionTable");
    if (!table) return;
    let plaintext = "Solution found:\n";
    for (let r = 0; r < table.rows.length; r++) {
        let rowStr = "";
        for (let c = 0; c < table.rows[r].cells.length; c++) {
            const cellText = table.rows[r].cells[c].textContent.trim();
            rowStr += cellText ? cellText : ".";
        }
        plaintext += rowStr + "\n";
    }
    document.getElementById("exportedPlaintext").textContent = plaintext;
}

// Function to close/hide the modal
function closeGridModal() {
    document.getElementById("gridModal").style.display = "none";
}

// Set up event listeners once the document is ready
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("exportGridButton")
        .addEventListener("click", exportGridAsPlaintext);
    document.getElementById("closeGridModal")
        .addEventListener("click", closeGridModal);
    // Optional: close modal when clicking outside modal content
    window.addEventListener("click", (event) => {
        const modal = document.getElementById("gridModal");
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
});