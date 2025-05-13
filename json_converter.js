// Refactored json_converter.js

document.addEventListener('DOMContentLoaded', () => {
    changeFormat();
    addEmojiWord(); // Add first emoji word field
    addRebus(); // Add first rebus field
    restoreQuizClimbAutosave();
    // Autosave every 30 seconds if active format is Quiz Climb.
    setInterval(() => {
        if (document.getElementById('format').value === 'quizClimb') {
            autosaveQuizClimbProgress();
        }
    }, 30000);
    // Also, autosave on any input within the Quiz Climb section.
    const quizClimbSection = document.getElementById('quizClimbSection');
    if (quizClimbSection) {
        quizClimbSection.addEventListener('input', () => {
            autosaveQuizClimbProgress();
        });
    }
});

// Utility functions
function getInputValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : "";
}

function parseCSVInput(id) {
    return getInputValue(id)
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

// Consolidated format display
function changeFormat() {
    const format = getInputValue('format');
    const sections = {
        downward: 'downwardSection',
        puttPuttProblems: 'puttPuttSection',
        swap: 'swapSection',
        stacked: 'stackedSection',
        quoted: 'quotedSection',
        chain: 'chainSection',
        liarsQuest: 'liarsQuestSection',
        quizClimb: 'quizClimbSection'
    };
    Object.keys(sections).forEach(key => {
        document.getElementById(sections[key]).style.display = (format === key) ? 'block' : 'none';
    });
    // Toggle Quiz Climb Visualizer container
    const visualizer = document.getElementById('quizClimbVisualizerContainer');
    if (visualizer) {
        visualizer.style.display = (format === 'quizClimb') ? 'block' : 'none';
    }
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

function removeRow(button) {
    button.parentElement.remove();
}

// Main JSON generation function
function generateJSON() {
    const format = getInputValue('format');
    switch(format) {
        case 'stacked': generateStackedJSON(); break;
        case 'quoted': generateQuotedJSON(); break;
        case 'puttPuttProblems': generatePuttPuttJSON(); break;
        case 'downward': generateDownwardJSON(); break;
        case 'chain': generateChainJSON(); break;
        case 'swap': generateSwapJSON(); break;
        case 'liarsQuest': generateLiarsQuestJSON(); break;
        case 'quizClimb': generateQuizClimbJSON(); break;
        default: console.error("Unknown format selected.");
    }
}

// Stacked Format JSON
function generateStackedJSON() {
    const prompt = getInputValue('promptStacked');
    const lowText = getInputValue('lowText') || "Earliest to Premiere";
    const highText = getInputValue('highText') || "Latest to Premiere";
    const nameInputs = document.querySelectorAll('.nameInput');
    const valueInputs = document.querySelectorAll('.valueInput');
    const stackItems = [];

    for (let i = 0; i < nameInputs.length; i++) {
        const name = nameInputs[i].value.trim();
        const value = valueInputs[i].value.trim();
        if (name && value) {
            stackItems.push({ name, value, hintIndex: i });
        }
    }

    const result = {
        lowText,
        highText,
        stackItems,
        stackPrompt: prompt
    };

    document.getElementById('output').textContent = JSON.stringify(result, null, 4);
}

// Liar's Quest Format JSON 
function generateLiarsQuestJSON() {
    const levels = [];
    for (let i = 1; i <= 4; i++) {
        const guardName = getInputValue(`guardName${i}`);
        const guardClue = getInputValue(`guardClue${i}`);
        const answers = [];
        for (let j = 1; j <= 4; j++) {
            const answer = getInputValue(`answer${i}-${j}`);
            const isLie = document.getElementById(`isLie${i}-${j}`).checked;
            answers.push({ isLie, answer });
        }
        levels.push({
            guardName,
            guardClue,
            guardIndex: i - 1,
            answers
        });
    }
    const result = { levels };
    document.getElementById('output').textContent = JSON.stringify(result, null, 4);
}

// Quoted Format JSON
function generateQuotedJSON() {
    const hint = getInputValue('hintQuoted');
    const attribute = getInputValue('attributeQuoted');
    const correctWords = parseCSVInput('correctWordsQuoted');
    const incorrectWords = parseCSVInput('incorrectWordsQuoted');
    const randomizeSeed = parseInt(getInputValue('randomizeSeedQuoted')) || 0;

    const result = {
        hint,
        attribute,
        correctWords,
        incorrectWords,
        countdownTime: 120,
        randomizeSeed
    };

    document.getElementById('output').textContent = JSON.stringify(result, null, 4);
}

// Putt-Putt Format JSON
function generatePuttPuttJSON() {
    const clues = [];
    const answers = [];

    for (let i = 1; i <= 9; i++) {
        const clue = getInputValue(`clue${i}`);
        const answer = parseInt(getInputValue(`answer${i}`)) || 0;
        clues.push({ clue, answer });
    }

    for (let i = 1; i <= 3; i++) {
        const name = getInputValue(`answerName${i}`);
        answers.push({ name });
    }

    const specialRounds = Array.from(document.querySelectorAll('.special-round-row')).map(row => {
        const speed = parseInt(row.querySelector('.speedInput').value) || 1;
        const roundType = row.querySelector('.roundTypeInput').value || "bomb";
        const roundIndex = (parseInt(row.querySelector('.roundIndexInput').value) || 1) - 1;
        return { speed, roundType, roundIndex };
    });

    const result = {
        clues,
        answers,
        specialRounds
    };

    document.getElementById('output').textContent = JSON.stringify(result, null, 4);
}

// Chain Format JSON
function generateChainJSON() {
    const words = Array.from(document.querySelectorAll('#chainWordsContainer .wordInput'))
        .map(input => input.value.trim())
        .filter(word => word !== '')
        .map(word => ({ word }));

    const numHearts = parseInt(getInputValue('numHearts'));
    const revealNextLetter = document.getElementById('revealNextLetter').checked;

    const result = { words, numHearts, revealNextLetter };
    document.getElementById('output').textContent = JSON.stringify(result, null, 4);
}

// Chain Format helper functions
function addWordRow() {
    const container = document.getElementById('chainWordsContainer');
    const wordCount = container.children.length + 1;
    
    const div = document.createElement('div');
    div.className = 'word-row';
    div.innerHTML = `
        <label class="word-number">${wordCount}</label>
        <input type="text" class="wordInput" placeholder="Enter word">
        <button type="button" onclick="removeWordRow(this)">Remove</button>
    `;
    
    container.appendChild(div);
    updateWordNumbers();
}

function removeWordRow(button) {
    button.closest('.word-row').remove();
    updateWordNumbers();
}

function updateWordNumbers() {
    const wordRows = document.querySelectorAll('#chainWordsContainer .word-row');
    wordRows.forEach((row, index) => {
        row.querySelector('.word-number').textContent = index + 1;
    });
}

// Downward Format JSON
function generateDownwardJSON() {
    const clue = getInputValue('clueDownward');
    const correctWords = parseCSVInput('correctWordsDownward');
    // Changed the id from 'distractorsDownward' to 'distractors'
    const distractors = parseCSVInput('distractors');

    const goalWords = [
        ...correctWords.map(word => ({ word, isBad: false })),
        ...distractors.map(word => ({ word, isBad: true }))
    ];

    const maxHealth = parseInt(getInputValue('maxHealthDownward')) || 12;
    const randomizeSeed = parseInt(getInputValue('randomizeSeedDownward')) || 123;

    // Get emoji words from dynamic inputs
    const emojiWords = Array.from(document.querySelectorAll('#emojiWordsContainer .emoji-word-input'))
        .map((input, index) => {
            const value = input.value.trim();
            return [index + 1, value]; // Returns [1, "word1"], etc.
        })
        .reduce((obj, [index, word]) => {
            obj[`emoji${index}Word`] = word || `emoji${index}`; // Default if empty
            return obj;
        }, {});

    const result = {
        clue,
        goalWords,
        maxHealth,
        ...emojiWords,
        randomizeSeed
    };

    document.getElementById('output').textContent = JSON.stringify(result, null, 4);
}

// Add new emoji word input field
function addEmojiWord() {
    const container = document.getElementById('emojiWordsContainer');
    const emojiWordCount = container.children.length + 1;
    
    const div = document.createElement('div');
    div.className = 'emoji-word-row';
    div.innerHTML = `
        <input type="text" class="emoji-word-input" 
               placeholder="Enter emoji word ${emojiWordCount}" 
               data-index="${emojiWordCount}">
        <button onclick="removeEmojiWord(this)">Remove</button>
    `;
    
    container.appendChild(div);
    updateEmojiWordNumbers();
}

function removeEmojiWord(button) {
    button.closest('.emoji-word-row').remove();
    updateEmojiWordNumbers();
}

function updateEmojiWordNumbers() {
    const inputs = document.querySelectorAll('#emojiWordsContainer .emoji-word-input');
    inputs.forEach((input, index) => {
        input.placeholder = `Enter emoji word ${index + 1}`;
        input.dataset.index = index + 1;
    });
}

// Add new rebus input field
function addRebus() {
    const container = document.getElementById('rebusContainer');
    const rebusCount = container.children.length + 1;
    
    const div = document.createElement('div');
    div.className = 'rebus-row';
    div.innerHTML = `
        <label>Rebus ${rebusCount}:</label>
        <input type="number" class="hintIndex" value="${rebusCount}" min="1">
        <input type="text" class="replaceLetter" maxlength="1" placeholder="@">
        <button onclick="removeRebus(this)">Remove</button>
    `;
    
    container.appendChild(div);
    updateRebusNumbers();
}

function removeRebus(button) {
    button.closest('.rebus-row').remove();
    updateRebusNumbers();
}

function updateRebusNumbers() {
    const rebusRows = document.querySelectorAll('#rebusContainer .rebus-row');
    rebusRows.forEach((row, index) => {
        row.querySelector('label').textContent = `Rebus ${index + 1}:`;
        if (row.querySelector('.hintIndex').value == '') {
            row.querySelector('.hintIndex').value = index + 1;
        }
    });
}

// Swap Format JSON
function generateSwapJSON() {
    const creator = getInputValue('swapCreator');
    const rebuses = Array.from(document.querySelectorAll('#rebusContainer .rebus-row'))
        .map(row => ({
            hintIndex: parseInt(row.querySelector('.hintIndex').value),
            replaceLetter: row.querySelector('.replaceLetter').value.trim()
        }))
        .filter(rebus => rebus.replaceLetter !== '');

    const result = {
        creator,
        rebuses,
        bonusSwapsAdd: parseInt(getInputValue('bonusSwapsAdd')) || 0,
        countdownTime: parseInt(getInputValue('countdownTime')) || 240,
        randomizeSeed: parseInt(getInputValue('randomizeSeedSwap')) || 0,
        allowedSwapsAdd: parseInt(getInputValue('allowedSwapsAdd')) || 0
    };

    document.getElementById('output').textContent = JSON.stringify(result, null, 4);
}

// Quiz Climb Format JSON
function generateQuizClimbJSON() {
    const theme = getInputValue('quizTheme');
    const gameDate = getInputValue('gameDate');
    const startingChips = parseInt(getInputValue('startingChips')) || 2;

    const levels = Array.from(document.querySelectorAll('.quiz-level')).map(levelDiv => {
        const questions = Array.from(levelDiv.querySelectorAll('.quiz-question')).map(questionDiv => {
            const questionText = questionDiv.querySelector('.question-text').value;
            const questionType = questionDiv.querySelector('.question-type').value;
            const stars = parseInt(questionDiv.querySelector('.stars').value) || 1;
            const topic = questionDiv.querySelector('.topic').value;
            const iconIndex = parseInt(questionDiv.querySelector('.icon-index').value) || 0;
            const funFact = questionDiv.querySelector('.fun-fact').value.trim();
            
            const answers = Array.from(questionDiv.querySelectorAll('.answer-option')).map(answerDiv => ({
                answer: answerDiv.querySelector('.answer-text').value,
                correct: answerDiv.querySelector('.is-correct').checked
            }));

            const questionObj = { 
                question: questionText, 
                questionType, 
                stars, 
                topic, 
                iconIndex, 
                answers 
            };

            if (funFact) {
                questionObj.funFact = funFact;
            }

            return questionObj;
        });
        return { questions };
    });

    const result = {
        theme,
        levels,
        gameDate,
        startingChips
    };

    document.getElementById('output').textContent = JSON.stringify(result, null, 4);
}

// Quiz Climb helper functions
function addQuizLevel() {
    const container = document.getElementById('quizLevelsContainer');
    const template = document.getElementById('quizLevelTemplate');
    const level = template.content.cloneNode(true);
    
    // Get next level number
    const existingLevels = container.querySelectorAll('.quiz-level').length;
    const levelNumber = existingLevels + 1;
    
    // Update level header with number
    level.querySelector('h4').textContent = `Level ${levelNumber}`;
    
    container.appendChild(level);
    updateQuizClimbVisualizer(); // Update visualizer after adding level
}

function addQuizQuestion(button) {
    const container = button.parentElement.querySelector('.questions-container');
    const template = document.getElementById('quizQuestionTemplate');
    const question = template.content.cloneNode(true);
    container.appendChild(question);
    updateQuizClimbVisualizer(); // Update visualizer after adding question
}

function addQuizAnswer(button) {
    const container = button.parentElement.querySelector('.answers-container');
    const answerDiv = document.createElement('div');
    answerDiv.className = 'answer-option';
    answerDiv.innerHTML = `
        <input type="text" class="answer-text" placeholder="Answer text">
        <input type="checkbox" class="is-correct">
        <label>Correct?</label>
        <button onclick="this.parentElement.remove()">Remove</button>
    `;
    container.appendChild(answerDiv);
}

function removeQuizQuestion(button) {
    const questionElem = button.closest('.quiz-question');
    const inputs = questionElem.querySelectorAll('input[type="text"], textarea');
    let hasData = false;
    inputs.forEach(input => {
        if (input.value.trim() !== "") {
            hasData = true;
        }
    });
    if (hasData && !confirm("Are you sure you want to erase this question? It has information entered.")) {
        return;
    }
    questionElem.remove();
    updateQuizClimbVisualizer(); // Update visualizer after removing question
}

function removeQuizLevel(button) {
    const levelElem = button.closest('.quiz-level');
    const inputs = levelElem.querySelectorAll('input[type="text"], textarea');
    let hasData = false;
    inputs.forEach(input => {
        if (input.value.trim() !== "") {
            hasData = true;
        }
    });
    if (hasData && !confirm("Are you sure you want to erase this level? It has information entered.")) {
        return;
    }
    levelElem.remove();
    updateQuizClimbVisualizer(); // Update visualizer after removing level
}

// NEW: Update Quiz Climb Visualizer based on current levels and questions.
function updateQuizClimbVisualizer() {
    const container = document.getElementById('quizClimbVisualizer');
    if (!container) return;
    container.innerHTML = '';
    const levels = document.querySelectorAll('#quizLevelsContainer .quiz-level');
    levels.forEach((level, levelIndex) => {
        const levelNode = document.createElement('div');
        levelNode.className = 'level-node';
        levelNode.textContent = 'Level ' + (levelIndex + 1);
        levelNode.setAttribute('data-level', levelIndex);  // NEW: assign level index
        const questionsContainer = document.createElement('div');
        questionsContainer.className = 'level-questions';
        
        const questions = level.querySelectorAll('.quiz-question');
        questions.forEach((q, qIndex) => {
            const questionNode = document.createElement('div');
            questionNode.className = 'question-node';
            questionNode.textContent = 'Q' + (qIndex + 1) + " " + "★".repeat(parseInt(q.querySelector('.stars').value) || 1) + (q.querySelector('.topic').value ? " (" + q.querySelector('.topic').value.trim() + ")" : "");
            // NEW: assign question index to node for matching
            questionNode.setAttribute('data-level', levelIndex);
            questionNode.setAttribute('data-question', qIndex);
            questionsContainer.appendChild(questionNode);
        });
        levelNode.appendChild(questionsContainer);
        container.appendChild(levelNode);
    });
}

// NEW: Highlight the corresponding question node in the visualizer for the active quiz input.
function highlightCorrespondingQuestion(levelIndex, questionIndex) {
    // Remove active class from all question nodes.
    document.querySelectorAll('#quizClimbVisualizer .question-node').forEach(node => {
        node.classList.remove('active');
    });
    // Find and add active class.
    const selector = `#quizClimbVisualizer [data-level="${levelIndex}"][data-question="${questionIndex}"]`;
    const target = document.querySelector(selector);
    if (target) {
        target.classList.add('active');
    }
}

// NEW: Listen for focusin events on quiz climb input fields.
document.addEventListener('focusin', (e) => {
    if(e.target.closest('.quiz-question')) {
        const quizQuestion = e.target.closest('.quiz-question');
        const levelElem = quizQuestion.closest('.quiz-level');
        const levelNodes = Array.from(document.querySelectorAll('#quizLevelsContainer .quiz-level'));
        const levelIndex = levelNodes.indexOf(levelElem);
        const questionNodes = Array.from(levelElem.querySelectorAll('.quiz-question'));
        const questionIndex = questionNodes.indexOf(quizQuestion);
        highlightCorrespondingQuestion(levelIndex, questionIndex);
    }
});

// Copy JSON to clipboard
function copyJSON() {
    const jsonText = document.getElementById('output').textContent;
    if (!jsonText.trim()) {
        alert("No JSON available to copy!");
        return;
    }
    navigator.clipboard.writeText(jsonText)
        .then(() => alert("JSON copied to clipboard!"))
        .catch(err => {
            console.error("Error copying JSON: ", err);
            alert("Failed to copy JSON.");
        });
}

// Realtime update: refresh Quiz Climb Visualizer when stars or topic input fields change.
document.addEventListener('input', (e) => {
    if(e.target.classList.contains('stars') || e.target.classList.contains('topic')) {
        updateQuizClimbVisualizer();
    }
});

// New: Read and load JSON file from upload control.
function handleJSONUpload() {
    const fileInput = document.getElementById('jsonFileInput');
    if (fileInput.files.length === 0) {
        alert("Please select a JSON file to upload.");
        return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const json = JSON.parse(e.target.result);
            loadJSON(json);
        } catch(err) {
            alert("Error reading JSON file: " + err.message);
        }
    };
    reader.readAsText(file);
}

// New: Generic loader.
// Expects the uploaded JSON to include a property "format" with value e.g. "stacked", "quoted", etc.
function loadJSON(json) {
    const activeFormat = document.getElementById('format').value;
    if (!json.format) {
        alert("Uploaded JSON is missing the 'format' property.");
        return;
    }
    if (json.format !== activeFormat) {
        alert("Uploaded JSON is for format '" + json.format + "'. Please select that format from the dropdown menu.");
        return;
    }
    switch(activeFormat) {
        case 'stacked': loadStackedJSON(json); break;
        case 'quoted': loadQuotedJSON(json); break;
        case 'quizClimb': loadQuizClimbJSON(json); break; // NEW for Quiz Climb
        // ...implement similar loaders for other formats...
        default: alert("No loader implemented for format: " + activeFormat);
    }
}

// New: Loader for Stacked Format JSON.
// Expects keys: format, stackPrompt, lowText, highText, stackItems (an array of {name, value}).
function loadStackedJSON(json) {
    document.getElementById('promptStacked').value = json.stackPrompt || "";
    document.getElementById('lowText').value = json.lowText || "";
    document.getElementById('highText').value = json.highText || "";
    // Populate static option rows:
    const optionRows = document.querySelectorAll('#optionsContainer .option-row');
    json.stackItems.forEach((item, index) => {
        if(index < optionRows.length) {
            optionRows[index].querySelector('.nameInput').value = item.name || "";
            optionRows[index].querySelector('.valueInput').value = item.value || "";
        }
    });
}

// New: Loader for Quoted Format JSON.
// Expects keys: format, hint, attribute, correctWords (array), incorrectWords (array), randomizeSeed.
function loadQuotedJSON(json) {
    document.getElementById('hintQuoted').value = json.hint || "";
    document.getElementById('attributeQuoted').value = json.attribute || "";
    document.getElementById('correctWordsQuoted').value = (json.correctWords || []).join(", ");
    document.getElementById('incorrectWordsQuoted').value = (json.incorrectWords || []).join(", ");
    document.getElementById('randomizeSeedQuoted').value = json.randomizeSeed || 0;
}

// NEW: Loader for Quiz Climb Format JSON.
// Expects keys: format, theme, gameDate, startingChips, levels (array of { questions: [...] }).
function loadQuizClimbJSON(json) {
    document.getElementById('quizTheme').value = json.theme || "";
    document.getElementById('gameDate').value = json.gameDate || "";
    document.getElementById('startingChips').value = json.startingChips || 2;
    
    const levelsContainer = document.getElementById('quizLevelsContainer');
    levelsContainer.innerHTML = ""; // Clear existing levels.
    
    const levelTemplate = document.getElementById('quizLevelTemplate');
    const questionTemplate = document.getElementById('quizQuestionTemplate');
    
    json.levels.forEach((levelData, levelIndex) => {
        const levelClone = levelTemplate.content.cloneNode(true);
        // Update level header text
        levelClone.querySelector('h4').textContent = `Level ${levelIndex + 1}`;
        
        const questionsContainer = levelClone.querySelector('.questions-container');
        questionsContainer.innerHTML = ""; // Clear any pre-existing questions
        
        levelData.questions.forEach((qData, qIndex) => {
            const qClone = questionTemplate.content.cloneNode(true);
            // Populate question fields
            qClone.querySelector('.question-text').value = qData.question || "";
            qClone.querySelector('.question-type').value = qData.questionType || "MULTIPLE_CHOICE";
            qClone.querySelector('.stars').value = qData.stars || 1;
            qClone.querySelector('.topic').value = qData.topic || "";
            qClone.querySelector('.icon-index').value = qData.iconIndex || 0;
            qClone.querySelector('.fun-fact').value = qData.funFact || "";
            
            const answersContainer = qClone.querySelector('.answers-container');
            answersContainer.innerHTML = ""; // Remove any default answers
            
            // Create answer nodes for each answer
            qData.answers.forEach(answerObj => {
                const answerDiv = document.createElement('div');
                answerDiv.className = 'answer-option';
                answerDiv.innerHTML = `
                    <input type="text" class="answer-text" placeholder="Answer text" value="${answerObj.answer || ""}">
                    <input type="checkbox" class="is-correct" ${answerObj.correct ? "checked" : ""}>
                    <label>Correct?</label>
                    <button type="button" onclick="this.parentElement.remove()">Remove</button>
                `;
                answersContainer.appendChild(answerDiv);
            });
            
            questionsContainer.appendChild(qClone);
        });
        
        levelsContainer.appendChild(levelClone);
    });
    
    // Update visualizer after loading Quiz Climb data.
    updateQuizClimbVisualizer();
}

// New: Export JSON File function triggered by the export button
function exportJSONFile() {
    const outputElem = document.getElementById('output');
    if (!outputElem.textContent.trim()) {
        alert("No JSON available to export. Generate JSON first.");
        return;
    }
    try {
        const generated = JSON.parse(outputElem.textContent);
        // Create a cloned JSON with an added "format" field
        const exportData = Object.assign({}, generated, { format: document.getElementById('format').value });
        const exportContent = JSON.stringify(exportData, null, 4);
        const blob = new Blob([exportContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "exported_game.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        alert("Failed to export JSON file: " + err.message);
    }
}

// NEW: Gather current Quiz Climb data for autosave
function getQuizClimbData() {
    const theme = getInputValue('quizTheme');
    const gameDate = getInputValue('gameDate');
    const startingChips = parseInt(getInputValue('startingChips')) || 2;
    const levels = Array.from(document.querySelectorAll('.quiz-level')).map(levelDiv => {
        const questions = Array.from(levelDiv.querySelectorAll('.quiz-question')).map(questionDiv => {
            const questionText = questionDiv.querySelector('.question-text').value;
            const questionType = questionDiv.querySelector('.question-type').value;
            const stars = parseInt(questionDiv.querySelector('.stars').value) || 1;
            const topic = questionDiv.querySelector('.topic').value;
            const iconIndex = parseInt(questionDiv.querySelector('.icon-index').value) || 0;
            const funFact = questionDiv.querySelector('.fun-fact').value.trim();
            const answers = Array.from(questionDiv.querySelectorAll('.answer-option')).map(answerDiv => ({
                answer: answerDiv.querySelector('.answer-text').value,
                correct: answerDiv.querySelector('.is-correct').checked
            }));
            const questionObj = { 
                question: questionText, 
                questionType, 
                stars, 
                topic, 
                iconIndex, 
                answers 
            };
            if (funFact) {
                questionObj.funFact = funFact;
            }
            return questionObj;
        });
        return { questions };
    });
    return { theme, gameDate, startingChips, levels };
}

// NEW: Autosave Quiz Climb progress to localStorage
function autosaveQuizClimbProgress() {
    const data = getQuizClimbData();
    data.format = 'quizClimb'; // add format for clarity
    localStorage.setItem('quizClimbAutosave', JSON.stringify(data));
}

// NEW: Restore autosaved Quiz Climb progress (if any)
function restoreQuizClimbAutosave() {
    const saved = localStorage.getItem('quizClimbAutosave');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.format === 'quizClimb') {
                loadQuizClimbJSON(data);
            }
        } catch (err) {
            console.error("Failed to restore autosave:", err);
        }
    }
}
