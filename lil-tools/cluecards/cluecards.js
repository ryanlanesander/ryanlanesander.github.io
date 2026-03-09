// filepath: cluecards/cluecards/cluecards.js

document.addEventListener('DOMContentLoaded', () => {
    let draggedCard = null;
    // New global toggle state: true means "link" (green), false means "x-out" (red)
    let isLinkState = true;
    let baseTextColor = "green"; // initial color for baseText

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

    // Add event listeners for drag & drop
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('dragstart', () => {
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
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedCard && draggedCard !== card) {
                if (card.parentElement.classList.contains('answer-slot') ||
                    draggedCard.parentElement.classList.contains('answer-slot')) {
                    return;
                }
                // BaseText sharing logic with style based on toggle state
                if (!card.querySelector(`.clickable-text[data-basetext="${draggedCard.baseText}"]`)) {
                    card.innerHTML += `<div class="clickable-text" style="color: ${baseTextColor};" data-basetext="${draggedCard.baseText}">${draggedCard.baseText}</div>`;
                }
                if (!draggedCard.querySelector(`.clickable-text[data-basetext="${card.baseText}"]`)) {
                    draggedCard.innerHTML += `<div class="clickable-text" style="color: ${baseTextColor};" data-basetext="${card.baseText}">${card.baseText}</div>`;
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

    // Create toggle button next to submit button
    function createToggleButton() {
        const submitButton = document.getElementById('submitButton');
        const toggleButton = document.createElement('button');
        toggleButton.id = "toggleBaseTextButton";
        // Set initial appearance for "link" mode.
        toggleButton.textContent = "link";
        toggleButton.style.backgroundColor = "green";
        toggleButton.style.color = "white";
        toggleButton.style.marginLeft = "10px";

        // Set up click listener to toggle state.
        toggleButton.addEventListener('click', () => {
            isLinkState = !isLinkState;
            if (isLinkState) {
                toggleButton.textContent = "link";
                toggleButton.style.backgroundColor = "green";
                baseTextColor = "green";
            } else {
                toggleButton.textContent = "x-out";
                toggleButton.style.backgroundColor = "red";
                baseTextColor = "red";
            }
        });
        // Insert the toggle button after the submit button.
        submitButton.parentNode.insertBefore(toggleButton, submitButton.nextSibling);
    }
    
    createToggleButton();
});