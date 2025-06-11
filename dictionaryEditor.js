document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById("openEditDictModal");
    const modal = document.getElementById("editDictModal");
    const closeBtn = document.getElementById("closeEditDictModal");
    const dictSelect = document.getElementById("dictSelect");
    const dictContent = document.getElementById("dictContent");
    const newWordsInput = document.getElementById("newWordsInput");
    const addWordsBtn = document.getElementById("addWordsBtn");
    const newDictSection = document.getElementById("newDictSection");
    const newDictName = document.getElementById("newDictName");
    const newDictWords = document.getElementById("newDictWords");
    const createNewDictBtn = document.getElementById("createNewDictBtn");
    
    let dictionaries = {};

    // Load dictionaries.json (note: if your file includes comment lines, you may need a helper to strip them)
    async function loadDictionaries() {
        try {
            const response = await fetch("dictionaries.json");
            dictionaries = await response.json();
            populateDictSelect();
        } catch (e) {
            console.error("Error loading dictionaries:", e);
        }
    }

    function populateDictSelect() {
        dictSelect.innerHTML = "";
        // Populate select options from current dictionaries
        for (const key in dictionaries) {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = key;
            dictSelect.appendChild(option);
        }
        // Add option for new dictionary creation
        const newOption = document.createElement("option");
        newOption.value = "new";
        newOption.textContent = "New Dictionary";
        dictSelect.appendChild(newOption);
        updateDictContent();
    }

    function updateDictContent() {
        const selected = dictSelect.value;
        if (selected === "new") {
            newDictSection.style.display = "block";
            dictContent.innerHTML = "";
        } else {
            newDictSection.style.display = "none";
            const dict = dictionaries[selected];
            let html = "";
            // Group words by length into a readable format.
            for (const len in dict) {
                html += `<strong>Length ${len}:</strong> ${dict[len].join(", ")}<br>`;
            }
            dictContent.innerHTML = html;
        }
    }

    dictSelect.addEventListener("change", updateDictContent);

    addWordsBtn.addEventListener("click", () => {
        const selected = dictSelect.value;
        if (selected === "new") {
            alert("Please use the new dictionary section to create a dictionary.");
            return;
        }
        const words = newWordsInput.value.split(",").map(s => s.trim()).filter(s => s.length);
        const dict = dictionaries[selected];
        words.forEach(word => {
            const len = word.length.toString();
            if (!dict[len]) {
                dict[len] = [];
            }
            dict[len].push(word);
        });
        newWordsInput.value = "";
        updateDictContent();
    });

    createNewDictBtn.addEventListener("click", () => {
        const name = newDictName.value.trim();
        if (!name) {
            alert("Dictionary name is required.");
            return;
        }
        if (dictionaries[name]) {
            alert("A dictionary with that name already exists.");
            return;
        }
        const words = newDictWords.value.split(",").map(s => s.trim()).filter(s => s.length);
        const newDict = {};
        words.forEach(word => {
            const len = word.length.toString();
            if (!newDict[len]) {
                newDict[len] = [];
            }
            newDict[len].push(word);
        });
        dictionaries[name] = newDict;
        newDictName.value = "";
        newDictWords.value = "";
        populateDictSelect();
        dictSelect.value = name;
        updateDictContent();
    });

    // Add a button to use the current dictionary as decoys
    const useAsDecoysBtn = document.createElement("button");
    useAsDecoysBtn.textContent = "Use This Dictionary for Decoys";
    dictContent.parentNode.insertBefore(useAsDecoysBtn, dictContent.nextSibling);

    // Store the current custom decoy dictionary in window
    function setCustomDecoyDictionary(dict) {
        window.customDecoyDictionary = dict;
    }

    useAsDecoysBtn.addEventListener("click", () => {
        const selected = dictSelect.value;
        if (selected === "new") {
            alert("Please select an existing dictionary.");
            return;
        }
        setCustomDecoyDictionary(dictionaries[selected]);
        alert("This dictionary will now be used for decoys when you click 'Add Decoys'.");
    });

    openBtn.addEventListener("click", () => {
        modal.style.display = "block";
        loadDictionaries();
    });
    
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
});