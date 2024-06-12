function checkPassword() {
    const password = document.getElementById('password').value;
    const correctPassword = 'yourPassword'; // Replace with the actual password

    if (password === correctPassword) {
        document.getElementById('password-form').style.display = 'none';
        document.getElementById('protected-content').style.display = 'block';
    } else {
        alert('Incorrect password. Please try again.');
    }
}
