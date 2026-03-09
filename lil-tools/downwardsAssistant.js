const aiBtn = document.getElementById('aiDownwardBtn');
const aiInput = document.getElementById('aiDownwardInput');
const aiOptionsDiv = document.getElementById('aiDownwardOptions');

// Add a textarea for displaying/editing the AI response
let aiResponseTextarea = document.createElement('textarea');
aiResponseTextarea.id = 'aiDownwardResponseTextarea';
aiResponseTextarea.style.width = '100%';
aiResponseTextarea.style.minHeight = '120px';
aiResponseTextarea.style.marginTop = '10px';
aiOptionsDiv.parentNode.insertBefore(aiResponseTextarea, aiOptionsDiv.nextSibling);
aiOptionsDiv.style.display = 'none'; // Hide the old options div

// NEW: Helper function to parse options from AI response text
function parseOptions(text) {
    const options = [];
    const lines = text.split('\n');
    lines.forEach(line => {
        const match = line.match(/^\s*\d+\.\s*(.+)$/);
        if (match) {
            options.push(match[1].trim());
        }
    });
    return options;
}

// Remove unconditional debug element update and use a debug flag instead.
aiBtn.addEventListener('click', async function() {
    const theme = aiInput.value.trim();
    aiResponseTextarea.value = '';
    // Clear debug element only if debugging is enabled.
    if (window.DEBUG) {
        const debugElem = document.getElementById('openaiDebug');
        if (debugElem) debugElem.textContent = '';
    }
    aiOptionsDiv.innerHTML = '';
    aiOptionsDiv.style.display = 'none';
    if (!theme) {
        aiResponseTextarea.value = 'Please enter a theme.';
        return;
    }
    aiResponseTextarea.value = 'Thinking...';
    try {
        const res = await fetch('http://localhost:5001/api/ai-downward', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: theme })
        });
        const data = await res.json();
        // Update debug element only in debug mode.
        if (window.DEBUG) {
            const debugElem = document.getElementById('openaiDebug');
            if (debugElem) debugElem.textContent = JSON.stringify(data, null, 2);
        }
        const text = data.result || data.text || '';
        if (!text) {
            aiResponseTextarea.value = 'No response from AI.';
            return;
        }
        
        // Parse AI response into options if available
        const options = parseOptions(text);
        if (options.length === 5) {
            aiResponseTextarea.value = '';
            aiOptionsDiv.style.display = 'block';
            options.forEach((opt, index) => {
                const btn = document.createElement('button');
                btn.textContent = opt;
                btn.style.margin = '5px';
                btn.addEventListener('click', () => {
                    const parts = opt.split(":");
                    if (parts.length >= 2) {
                        const clueText = parts[0].trim();
                        const wordsText = parts.slice(1).join(":").trim();
                        document.getElementById("clueDownward").value = clueText;
                        document.getElementById("correctWordsDownward").value = wordsText;
                        document.getElementById("words").value = wordsText;
                    }
                });
                aiOptionsDiv.appendChild(btn);
            });
        } else {
            // Fallback: display the full text if 5 options not found
            aiResponseTextarea.value = text;
        }
    } catch (e) {
        aiResponseTextarea.value = 'Error contacting AI backend.';
    }
});
