function getDayPassword() {
    const startDate = new Date('2025-02-11').getTime();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    return 352 + daysDiff;
}

function checkPassword() {
    const input = document.getElementById('passwordInput').value;
    const correctPassword = getDayPassword().toString();
    
    if (input === correctPassword) {
        document.getElementById('passwordOverlay').classList.add('hidden');
        // Store in localStorage with today's date
        const today = new Date().toDateString();
        localStorage.setItem('passwordValidated', today);
    } else {
        alert('Incorrect password');
    }
}

// Check if already validated today
window.onload = function() {
    const validated = localStorage.getItem('passwordValidated');
    const today = new Date().toDateString();
    
    if (validated === today) {
        document.getElementById('passwordOverlay').classList.add('hidden');
    }
};