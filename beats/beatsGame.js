// Load the beatPuzzles JSON and initialize the drag-and-drop experience
 fetch('beatPuzzles.json')
 .then(response => response.json())
 .then(data => {
     const puzzleSelector = document.getElementById('puzzleSelector');
     const dragDropContainer = document.getElementById('dragDropContainer');

     // Create a container for puzzle content inside the canvas
     const puzzleContent = document.createElement('div');
     puzzleContent.id = 'puzzleContent';
     dragDropContainer.appendChild(puzzleContent);

     // Move submit button and feedback area to the canvas
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

     dragDropContainer.appendChild(submitButton);
     dragDropContainer.appendChild(feedbackArea);

     let currentWinCombo = [];
     let currentPuzzle; // new variable to hold the current puzzle data
     let currentPuzzleKey; // new variable to store the current puzzle key

     // Preload images to determine dimensions
     const dropzoneImg = new Image();
     const buttonImg = new Image();
     dropzoneImg.src = "assets/dropzone.png";
     buttonImg.src = "assets/button.png";

     let dropzoneWidth, dropzoneHeight, buttonWidth, buttonHeight;

     Promise.all([
         new Promise(resolve => dropzoneImg.onload = resolve),
         new Promise(resolve => buttonImg.onload = resolve)
     ]).then(() => {
         dropzoneWidth = dropzoneImg.naturalWidth + "px";
         dropzoneHeight = dropzoneImg.naturalHeight + "px";
         buttonWidth = buttonImg.naturalWidth + "px";
         buttonHeight = buttonImg.naturalHeight + "px";
         // Initialize first puzzle now that dimensions are available
         initializePuzzle('puzzle1');
     });

     function initializePuzzle(puzzleKey) {
         // Instead of clearing the entire canvas, only clear the puzzle content
         puzzleContent.innerHTML = ''; // Clear previous puzzle elements

         currentPuzzleKey = puzzleKey; // store current puzzle key
         const puzzleData = data[puzzleKey];
         currentPuzzle = puzzleData; // store current puzzle object
         const words = puzzleData?.words; // Access the 'words' key
         currentWinCombo = puzzleData?.winCombo || []; // Load the winCombo for the puzzle
         if (!words) return;

         // Create a container for drop zones and separators
         const dropZoneRow = document.createElement('div');
         dropZoneRow.style.display = 'flex';
         dropZoneRow.style.justifyContent = 'center';
         dropZoneRow.style.marginBottom = '20px';

         // Replace drop zones creation (was using <img>) with divs to allow text content
         for (let i = 0; i < 5; i++) {
             const dropZoneDiv = document.createElement('div');
             dropZoneDiv.className = 'drop-zone';
             dropZoneDiv.style.backgroundImage = "url('assets/dropzone.png')";
             dropZoneDiv.style.backgroundSize = 'cover';
             dropZoneDiv.style.width = dropzoneWidth;
             dropZoneDiv.style.height = dropzoneHeight;
             dropZoneDiv.style.marginRight = '0'; // margin removed; using image as separator
             dropZoneDiv.style.cursor = 'pointer';
             dropZoneDiv.style.display = 'flex';
             dropZoneDiv.style.justifyContent = 'center';
             dropZoneDiv.style.alignItems = 'center';
             dropZoneDiv.dataset.index = i;
             dropZoneRow.appendChild(dropZoneDiv);

             if (i < 4) { // Insert separator image between drop zones
                 const separatorImg = document.createElement('img');
                 separatorImg.src = "assets/greaterthan.png";
                 separatorImg.style.margin = '0 8px';
                 separatorImg.style.width = "auto";    // Keep natural width
                 separatorImg.style.height = "auto";   // Keep natural height
                 dropZoneRow.appendChild(separatorImg);
             }
         }

         puzzleContent.appendChild(dropZoneRow);

         // Create a container for draggable words in a single row with 8px between each
         const wordsRow = document.createElement('div');
         wordsRow.style.display = 'flex';
         wordsRow.style.justifyContent = 'center';
         wordsRow.style.flexWrap = 'nowrap';
         wordsRow.style.gap = '8px';

         // Create draggable words using the button image dimensions
         words.forEach((word, index) => {
             const wordElement = document.createElement('div');
             wordElement.className = 'draggable-word';
             wordElement.textContent = word;
             wordElement.style.borderRadius = '8px';
             wordElement.style.padding = '5px';
             // wordElement.style.margin = '5px'; // removed in favor of container gap
             wordElement.style.display = 'inline-block';
             wordElement.style.cursor = 'grab';
             wordElement.style.width = buttonWidth;      // use natural width
             wordElement.style.height = buttonHeight;    // use natural height
             wordElement.style.textAlign = 'center';
             wordElement.style.lineHeight = buttonHeight; // center text vertically
             wordElement.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.2)';
             wordElement.style.transition = 'all 0.3s ease';
             wordElement.draggable = true;
             wordElement.dataset.word = word;
             wordElement.dataset.box = `box${index + 1}`; // Assign box value
             wordElement.style.backgroundImage = "url('assets/button.png')";
             wordElement.style.backgroundSize = 'cover';
             wordElement.style.backgroundPosition = 'center';

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

         puzzleContent.appendChild(wordsRow);

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
     // initializePuzzle('puzzle1'); // Moved to image preloading

     // Update puzzle on dropdown change
     puzzleSelector.addEventListener('change', event => {
         initializePuzzle(event.target.value);
     });

     submitButton.addEventListener('click', () => {
         const dropZones = dragDropContainer.querySelectorAll('.drop-zone');
         const userOrder = Array.from(dropZones).map(zone => zone.textContent.trim());

         if (JSON.stringify(userOrder) === JSON.stringify(currentWinCombo)) {
             // Directly assign image based on puzzle key number: e.g. puzzle1 => puzzleimage1.png
             const puzzleImage = "assets/puzzleimage" + currentPuzzleKey.replace("puzzle", "") + ".png";
             feedbackArea.innerHTML = currentPuzzle.story +
                 "<br><img src='" + puzzleImage + "' alt='Puzzle Image' style='max-width:100%; height:auto;'>";
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

         // Update drop zones: set correct ones to DropzoneCorrect and revert others
         dropZones.forEach((zone, index) => {
             if (zone.textContent.trim() === currentWinCombo[index]) {
                 zone.style.backgroundImage = "url('assets/DropzoneCorrect.png')";
             } else {
                 zone.style.backgroundImage = "url('assets/dropzone.png')";
             }
         });
     });
 });