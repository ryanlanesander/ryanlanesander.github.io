function checkPassword() {
    const password = document.getElementById('password').value;
    const correctPassword = 'KimTaegon'; // Replace with the actual password

    if (password === correctPassword) {
        document.getElementById('password-form').style.display = 'none';
        document.getElementById('protected-content').style.display = 'block';
    } else {
        alert('Incorrect password. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new PIXI.Application({ width: 800, height: 600, backgroundColor: 0x1099bb });
    document.getElementById('cube-container').appendChild(app.view);

    const cube = new PIXI.Graphics();
    cube.beginFill(0xde3249);
    cube.drawRect(-50, -50, 100, 100);
    cube.endFill();
    cube.x = app.screen.width / 2;
    cube.y = app.screen.height / 2;
    cube.interactive = true;
    cube.buttonMode = true;

    app.stage.addChild(cube);

    let spinning = false;

    cube.on('pointerdown', () => {
        spinning = !spinning;
    });

    app.ticker.add((delta) => {
        if (spinning) {
            cube.rotation += 0.1 * delta;
        }
    });
});
