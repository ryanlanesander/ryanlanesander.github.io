document.addEventListener('DOMContentLoaded', function() {
    const cube = document.querySelector('.cube');
    if (cube) {
        cube.addEventListener('click', function() {
            const randomX = Math.floor(Math.random() * 360);
            const randomY = Math.floor(Math.random() * 360);
            this.style.transform = `rotateX(${randomX}deg) rotateY(${randomY}deg)`;
        });
    }
});
