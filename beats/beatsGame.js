// Load the beatPuzzles JSON and initialize the drag-and-drop experience
 fetch('beatPuzzles.json')
 .then(response => response.json())
 .then(data => {
     const puzzleSelector = document.getElementById('puzzleSelector');
     const dragDropContainer = document.getElementById('dragDropContainer');

     // Add a submit button and feedback area
     const submitButton = document.createElement('button');
     submitButton.textContent = 'Submit';
     submitButton.style.marginTop = '20px';
     submitButton.style.backgroundColor = '#ff66b2';
     submitButton.style.color = '#fff';
     submitButton.style.border = 'none';
     submitButton.style.padding = '10px 20px';
     submitButton.style.borderRadius = '12px';
     submitButton.style.fontSize = '16px';
     submitButton.style.cursor = 'pointer';
     submitButton.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.2)';
     const feedbackArea = document.createElement('div');
     feedbackArea.style.marginTop = '10px';
     feedbackArea.style.padding = '10px';
     feedbackArea.style.borderRadius = '8px';
     feedbackArea.style.fontSize = '16px';
     dragDropContainer.parentElement.appendChild(submitButton);
     dragDropContainer.parentElement.appendChild(feedbackArea);

     let currentWinCombo = [];

     function initializePuzzle(puzzleKey) {
         dragDropContainer.innerHTML = ''; // Clear previous content

         const words = data[puzzleKey]?.words; // Access the 'words' key in the JSON structure
         currentWinCombo = data[puzzleKey]?.winCombo || []; // Load the winCombo for the puzzle
         if (!words) return;

         // Create a container for drop zones and separators
         const dropZoneRow = document.createElement('div');
         dropZoneRow.style.display = 'flex';
         dropZoneRow.style.justifyContent = 'center';
         dropZoneRow.style.marginBottom = '20px';

         // Create drop zones
         for (let i = 0; i < 5; i++) {
             const dropZone = document.createElement('div');
             dropZone.className = 'drop-zone';
             dropZone.style.border = '2px dashed #ff99cc';
             dropZone.style.width = '100px'; // changed from '60px'
             dropZone.style.height = '50px'; // changed from '60px'
             dropZone.style.display = 'inline-block';
             dropZone.style.margin = '0 10px';
             dropZone.style.verticalAlign = 'middle';
             dropZone.dataset.index = i;
             dropZone.style.borderRadius = '8px';
             dropZone.style.backgroundColor = '#fff0f5';
             dropZoneRow.appendChild(dropZone);

             if (i < 4) {
                 const separator = document.createElement('span');
                 separator.textContent = '<';
                 separator.style.margin = '0 10px';
                 dropZoneRow.appendChild(separator);
             }
         }

         dragDropContainer.appendChild(dropZoneRow);

         // Create a container for draggable words
         const wordsRow = document.createElement('div');
         wordsRow.style.display = 'flex';
         wordsRow.style.justifyContent = 'center';
         wordsRow.style.flexWrap = 'wrap';

         // Create draggable words as rectangle objects
         words.forEach((word, index) => {
             const wordElement = document.createElement('div');
             wordElement.className = 'draggable-word';
             wordElement.textContent = word;
             wordElement.style.border = '2px solid #ff66b2';
             wordElement.style.borderRadius = '8px';
             wordElement.style.padding = '5px';
             wordElement.style.margin = '5px';
             wordElement.style.display = 'inline-block';
             wordElement.style.cursor = 'grab';
             wordElement.style.width = '100px';
             wordElement.style.height = '50px';
             wordElement.style.textAlign = 'center';
             wordElement.style.lineHeight = '50px';
             wordElement.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.2)';
             wordElement.style.transition = 'all 0.3s ease';
             wordElement.draggable = true;
             wordElement.dataset.word = word;
             wordElement.dataset.box = `box${index + 1}`; // Assign box value

             wordElement.addEventListener('dragstart', event => {
                 event.dataTransfer.setData('text/plain', word);
             });

             wordsRow.appendChild(wordElement);
         });

         // Persist initial words in their respective boxes
         words.forEach((word, index) => {
             const boxKey = `box${index + 1}`;
             localStorage.setItem(boxKey, word);
         });

         // Restore words to their boxes on load
         words.forEach((_, index) => {
             const boxKey = `box${index + 1}`;
             const persistedWord = localStorage.getItem(boxKey);
             if (persistedWord) {
                 const wordElement = Array.from(wordsRow.children).find(el => el.dataset.box === boxKey);
                 if (wordElement) {
                     wordElement.textContent = persistedWord;
                     wordElement.dataset.word = persistedWord;
                 }
             }
         });

         dragDropContainer.appendChild(wordsRow);

         // Add drag-and-drop functionality to drop zones
         const dropZones = dropZoneRow.querySelectorAll('.drop-zone');
         dropZones.forEach(zone => {
             zone.addEventListener('dragover', event => {
                 event.preventDefault();
             });

             zone.addEventListener('drop', event => {
                 event.preventDefault();
                 const word = event.dataTransfer.getData('text/plain');
                 zone.textContent = word;
             });
         });
     }

     // Initialize the first puzzle by default
     initializePuzzle('puzzle1');

     // Update puzzle on dropdown change
     puzzleSelector.addEventListener('change', event => {
         initializePuzzle(event.target.value);
     });

     submitButton.addEventListener('click', () => {
         const dropZones = dragDropContainer.querySelectorAll('.drop-zone');
         const userOrder = Array.from(dropZones).map(zone => zone.textContent.trim());

         if (JSON.stringify(userOrder) === JSON.stringify(currentWinCombo)) {
             feedbackArea.textContent = 'You win!';
             feedbackArea.style.color = 'green';
         } else {
             const feedback = userOrder.map((word, index) => {
                 if (word === currentWinCombo[index]) {
                     return `${word}: Correct`;
                 } else {
                     return `${word || '(empty)'}: Incorrect`;
                 }
             }).join('\n');
             feedbackArea.textContent = feedback;
             feedbackArea.style.color = 'red';
         }
     });
 });