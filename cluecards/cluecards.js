// filepath: cluecards/cluecards/cluecards.js

document.addEventListener('DOMContentLoaded', () => {
    let draggedCard = null;

    // Helper function to generate a random hex color
    function getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Update each card: store original parent, register baseText, wrap baseText in a non-clickable span, assign a random color
    document.querySelectorAll('.card').forEach(card => {
        card.originalParent = card.parentElement;
        card.baseText = card.textContent;
        card.innerHTML = `<span class="base-text">${card.baseText}</span>`;
        card.style.backgroundColor = getRandomColor();
    });

    // New function: randomly assign one correct card per drop zone (3 correct cards total)
    function assignCorrectCards() {
        let availableCards = Array.from(document.querySelectorAll('.card'));
        if (availableCards.length < 3) return;
        let selectedCards = [];
        for (let i = 0; i < 3; i++) {
            let index = Math.floor(Math.random() * availableCards.length);
            selectedCards.push(availableCards[index]);
            availableCards.splice(index, 1);
        }
        let dropZones = document.querySelectorAll('.answer-slot');
        dropZones.forEach((zone, i) => {
            if (selectedCards[i]) {
                zone.dataset.correctId = selectedCards[i].id;
            }
        });
    }

    assignCorrectCards();

    // Add drag events for static cards
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('dragstart', () => {
            // if card is dragged from dropzone, put it back into its original container
            if (card.parentElement !== card.originalParent) {
                card.originalParent.appendChild(card);
            }
            draggedCard = card;
            setTimeout(() => {
                card.style.display = 'none';
            }, 0);
        });
        card.addEventListener('dragend', () => {
            setTimeout(() => {
                card.style.display = 'block';
                draggedCard = null;
            }, 0);
        });
        // New event listeners to handle drop on top of another card
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedCard && draggedCard !== card) {
                // If either card is in an answer-slot (i.e. dropped swapping), skip baseText sharing logic
                if (card.parentElement.classList.contains('answer-slot') ||
                    draggedCard.parentElement.classList.contains('answer-slot')) {
                    return;
                }
                // BaseText sharing logic (applied only when not swapping from a drop zone)
                if (!card.querySelector(`.clickable-text[data-basetext="${draggedCard.baseText}"]`)) {
                    card.innerHTML += `<div class="clickable-text" data-basetext="${draggedCard.baseText}">${draggedCard.baseText}</div>`;
                }
                if (!draggedCard.querySelector(`.clickable-text[data-basetext="${card.baseText}"]`)) {
                    draggedCard.innerHTML += `<div class="clickable-text" data-basetext="${card.baseText}">${card.baseText}</div>`;
                }
            }
        });
    });

    // Handle drag over and drop events for the answer slots
    const answerSlots = document.querySelectorAll('.answer-slot');
    answerSlots.forEach(slot => {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        slot.addEventListener('drop', () => {
            if (draggedCard) {
                // Removed swapping logic. Now simply allow multiple cards in a slot.
                slot.appendChild(draggedCard);
            }
        });
    });

    // Add a submit button event to check if placed cards match the correct ones
    document.getElementById('submitButton').addEventListener('click', () => {
        let score = 0;
        document.querySelectorAll('.answer-slot').forEach(zone => {
            const cardInZone = zone.querySelector('.card');
            if (cardInZone && zone.dataset.correctId === cardInZone.id) {
                score++;
            }
        });
        const total = document.querySelectorAll('.answer-slot').length;
        if (score === total) {
            alert('Success! All correct cards matched.');
        } else {
            alert(`Incorrect! You matched ${score} out of ${total} correctly.`);
        }
    });

    // Global event listener to remove clicked clickable text
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('clickable-text')) {
            e.target.remove();
        }
    });

    // Removed createCards() call since cards are now static
    // createCards();
    
    // New modal logic for label input
    const labelModal = document.getElementById("labelModal");
    const labelForm = document.getElementById("labelForm");

    labelForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(labelForm);
        
        // Update answer-slot labels for 5 slots
        const answerSlotLabels = document.querySelectorAll('.answer-slot-label');
        for (let i = 0; i < 5; i++) {
            answerSlotLabels[i].textContent = formData.get(`location${i+1}`) || `Location ${i+1}`;
        }
        
        // Update suspect cards for 5 cards
        const suspectCards = document.querySelectorAll('.card[id^="suspect"]');
        for (let i = 0; i < 5; i++) {
            if (suspectCards[i]) {
                suspectCards[i].baseText = formData.get(`suspect${i+1}`) || `Suspect ${i+1}`;
                suspectCards[i].innerHTML = `<span class="base-text">${suspectCards[i].baseText}</span>`;
            }
        }
        
        // Update weapon cards for 5 cards
        const weaponCards = document.querySelectorAll('.card[id^="weapon"]');
        for (let i = 0; i < 5; i++) {
            if (weaponCards[i]) {
                weaponCards[i].baseText = formData.get(`weapon${i+1}`) || `Weapon ${i+1}`;
                weaponCards[i].innerHTML = `<span class="base-text">${weaponCards[i].baseText}</span>`;
            }
        }
        
        // Do not hide the label section; allow continuous updates
        // Removed: labelModal.style.display = "none";
    });
});