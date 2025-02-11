// Initialize event listeners when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set initial format display
    changeFormat();
});

// Format Selector
function changeFormat() {
    const format = document.getElementById('format').value;
    document.getElementById('stackedSection').style.display = format === 'stacked' ? 'block' : 'none';
    document.getElementById('liarsQuestSection').style.display = format === 'liarsQuest' ? 'block' : 'none';
    document.getElementById('quotedSection').style.display = format === 'quoted' ? 'block' : 'none';
    document.getElementById('puttPuttSection').style.display = format === 'puttPuttProblems' ? 'block' : 'none';
    document.getElementById('downwardSection').style.display = format === 'downward' ? 'block' : 'none';
    document.getElementById('chainSection').style.display = format === 'chain' ? 'block' : 'none';
    document.getElementById('swapSection').style.display = format === 'swap' ? 'block' : 'none';
}

// Add new special round input field
function addSpecialRound() {
    const container = document.getElementById('specialRoundsContainer');
    const newRow = document.createElement('div');
    newRow.classList.add('special-round-row');
    newRow.innerHTML = `
        <input type="number" class="speedInput" placeholder="Speed (1-5)" min="1" max="5">
        <select class="roundTypeInput">
            <option value="bomb">Bomb</option>
            <option value="heart">Heart</option>
        </select>
        <input type="number" class="roundIndexInput" placeholder="Round Index (1-9)" min="1" max="9">
        <button type="button" onclick="removeRow(this)">-</button>
    `;
    container.appendChild(newRow);
}

// Remove a row
function removeRow(button) {
    button.parentElement.remove();
}

// JSON generation for all formats
function generateJSON() {
    const format = document.getElementById('format').value;
    if (format === 'stacked') {
        generateStackedJSON();
    } else if (format === 'liarsQuest') {
        generateLiarsQuestJSON();
    } else if (format === 'quoted') {
        generateQuotedJSON();
    } else if (format === 'puttPuttProblems') {
        generatePuttPuttJSON();
    } else if (format === 'downward') {
        generateDownwardJSON();
    } else if (format === 'chain') {
        generateChainJSON();
    } else if (format === 'swap') {
        generateSwapJSON();
    }
}

// Stacked Format JSON
function generateStackedJSON() {
    const prompt = document.getElementById('promptStacked').value;
    const lowText = document.getElementById('lowText').value || "Earliest to Premiere";
    const highText = document.getElementById('highText').value || "Latest to Premiere";
    const names = document.querySelectorAll('.nameInput');
    const values = document.querySelectorAll('.valueInput');

    const stackItems = [];
    for (let i = 0; i < names.length; i++) {
        if (names[i].value && values[i].value) {
            stackItems.push({ name: names[i].value.trim(), value: values[i].value.trim() });
        }
    }

    const result = {
        lowText: lowText,
        highText: highText,
        stackItems: stackItems,
        stackPrompt: prompt
    };

    document.getElementById('output').textContent = JSON.stringify(result, null, 4);
}

// Liar's Quest Format JSON
function generateLiarsQuestJSON() {
    const levels = [];
    for (let i = 1; i <= 4; i++) {
        const guardName = document.getElementById(`guardName${i}`).value;
        const guardClue = document.getElementById(`guardClue${i}`).value;
        const answers = [];

        for (let j = 1; j <= 4; j++) {
            const answer = document.getElementById(`answer${i}-${j}`).value;
            const isLie = document.getElementById(`isLie${i}-${j}`).checked;
            answers.push({ isLie: isLie, answer: answer });
        }

        levels.push({
            guardName: guardName,
            guardClue: guardClue,
            guardIndex: i - 1,
            answers: answers
        });
    }

    const result = {
        levels: levels
    };

    document.getElementById('output').textContent = JSON.stringify(result, null, 4);
}

// Quoted Format JSON
function generateQuotedJSON() {
    const hint = document.getElementById('hintQuoted').value;
    const attribute = document.getElementById('attributeQuoted').value;

    const correctWords = document.getElementById('correctWordsQuoted').value
        .split(',')
        .map(word => word.trim())
        .filter(word => word.length > 0);

    const incorrectWords = document.getElementById('incorrectWordsQuoted').value
        .split(',')
        .map(word => word.trim())
        .filter(word => word.length > 0);

    const countdownTime = 120;
    const randomizeSeed = parseInt(document.getElementById('randomizeSeedQuoted').value) || 0;

    const result = {
        hint: hint,
        attribute: attribute,
        correctWords: correctWords,
        countdownTime: countdownTime,
        randomizeSeed: randomizeSeed,
        incorrectWords: incorrectWords
    };

    document.getElementById('output').textContent = JSON.stringify(result, null, 4);
}

// Putt-Putt Format JSON
function generatePuttPuttJSON() {
    const clues = [];
    const answers = [];

    for (let i = 1; i <= 9; i++) {
        const clueElement = document.getElementById(`clue${i}`);
        const answerElement = document.getElementById(`answer${i}`);
        
        if (clueElement && answerElement) {
            const clue = clueElement.value || "";
            const answer = parseInt(answerElement.value) || 0;
            clues.push({ clue, answer });
        }
    }

    for (let i = 1; i <= 3; i++) {
        const answerNameElement = document.getElementById(`answerName${i}`);
        if (answerNameElement) {
            const name = answerNameElement.value || "";
            answers.push({ name });
        }
    }

    const specialRounds = Array.from(document.querySelectorAll('.special-round-row')).map(row => {
        const speedInput = row.querySelector('.speedInput');
        const roundTypeInput = row.querySelector('.roundTypeInput');
        const roundIndexInput = row.querySelector('.roundIndexInput');
        const speed = parseInt(speedInput ? speedInput.value : 1);
        const roundType = roundTypeInput ? roundTypeInput.value : "bomb";
        const roundIndex = parseInt(roundIndexInput ? roundIndexInput.value : 1) - 1;
        return { speed, roundType, roundIndex };
    });

    const result = {
        clues: clues,
        answers: answers,
        specialRounds: specialRounds
    };

    document.getElementById('output').textContent = JSON.stringify(result, null, 4);
}

// Chain Format Functions
function addWordRow() {
    const container = document.getElementById('chainWordsContainer');
    const row = document.createElement('div');
    row.className = 'word-row';
    const newIndex = container.children.length + 1;
    row.innerHTML = `
        <label class="word-number">${newIndex}</label>
        <input type="text" class="wordInput" placeholder="Enter word">
        <button type="button" onclick="removeWordRow(this)">Remove</button>
    `;
    container.appendChild(row);
}

function removeWordRow(button) {
    const container = document.getElementById('chainWordsContainer');
    button.parentElement.remove();
    Array.from(container.children).forEach((row, index) => {
        row.querySelector('.word-number').textContent = index + 1;
    });
}

function generateChainJSON() {
    const words = Array.from(document.querySelectorAll('#chainWordsContainer .wordInput'))
        .map(input => ({
            word: input.value.trim()
        }))
        .filter(item => item.word !== '');

    const numHearts = parseInt(document.getElementById('numHearts').value);
    const revealNextLetter = document.getElementById('revealNextLetter').checked;

    const result = {
        words: words,
        numHearts: numHearts,
        revealNextLetter: revealNextLetter
    };

    document.getElementById('output').textContent = JSON.stringify(result, null, 4);
}

// Downward Format JSON
function generateDownwardJSON() {
    const clue = document.getElementById('clueDownward').value;
    const correctWords = document.getElementById('correctWordsDownward').value.split(',').map(word => word.trim());
    const distractors = document.getElementById('distractorsDownward').value.split(',').map(word => word.trim());

    const goalWords = [
        ...correctWords.map(word => ({ word, isBad: false })),
        ...distractors.map(word => ({ word, isBad: true }))
    ];

    const maxHealth = parseInt(document.getElementById('maxHealthDownward').value) || 12;
    const emoji1Word = document.getElementById('emoji1Word').value || "angel";
    const emoji2Word = document.getElementById('emoji2Word').value || "adel";
    const emoji3Word = document.getElementById('emoji3Word').value || "fort";
    const emoji4Word = document.getElementById('emoji4Word').value || "jackson";
    const randomizeSeed = parseInt(document.getElementById('randomizeSeedDownward').value) || 123;

    const result = {
        clue: clue,
        goalWords: goalWords,
        maxHealth: maxHealth,
        emoji1Word: emoji1Word,
        emoji2Word: emoji2Word,
        emoji3Word: emoji3Word,
        emoji4Word: emoji4Word,
        randomizeSeed: randomizeSeed
    };

    document.getElementById('output').textContent = JSON.stringify(result, null, 4);
}

// Swap Format Functions
function addRebusRow() {
    const container = document.getElementById('rebusContainer');
    const rows = container.getElementsByClassName('rebus-row');
    const newIndex = rows.length + 1;
    
    const row = document.createElement('div');
    row.className = 'rebus-row';
    row.innerHTML = `
        <label>Rebus ${newIndex}:</label>
        <input type="number" class="hintIndex" value="${newIndex}" min="1">
        <input type="text" class="replaceLetter" maxlength="1">
    `;
    container.appendChild(row);
}

function generateSwapJSON() {
    const creator = document.getElementById('swapCreator').value;
    
    const rebuses = Array.from(document.querySelectorAll('#rebusContainer .rebus-row'))
        .map(row => ({
            hintIndex: parseInt(row.querySelector('.hintIndex').value),
            replaceLetter: row.querySelector('.replaceLetter').value
        }))
        .filter(rebus => rebus.replaceLetter !== '');

    const result = {
        creator: creator,
        rebuses: rebuses,
        bonusSwapsAdd: parseInt(document.getElementById('bonusSwapsAdd').value),
        countdownTime: parseInt(document.getElementById('countdownTime').value),
        randomizeSeed: parseInt(document.getElementById('randomizeSeedSwap').value),
        allowedSwapsAdd: parseInt(document.getElementById('allowedSwapsAdd').value)
    };

    document.getElementById('output').textContent = JSON.stringify(result, null, 4);
}