// Create the PIXI Application for the background
const pixiBackgroundDiv = document.getElementById('pixiBackground');
const pixiApp = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    transparent: true,
});
pixiBackgroundDiv.appendChild(pixiApp.view);

// Set initial background color from CSS default: rgb(123,51,52) = 0x7b3334
let currentBgColor = 0x7b3334;
let targetBgColor = currentBgColor;
const lerpFactor = 0.05; // Adjust for smoothness

// Create a fullscreen rectangle with currentBgColor.
const bgRect = new PIXI.Graphics();
function drawBgRect() {
    bgRect.clear();
    bgRect.beginFill(currentBgColor);
    bgRect.drawRect(0, 0, pixiApp.renderer.width, pixiApp.renderer.height);
    bgRect.endFill();
}
drawBgRect();
pixiApp.stage.addChild(bgRect);

// Update the renderer on window resize and redraw bgRect.
window.addEventListener('resize', () => {
    pixiApp.renderer.resize(window.innerWidth, window.innerHeight);
    drawBgRect();
    // ...existing code...
});

// Animate background color transition in ticker.
pixiApp.ticker.add(() => {
    // Lerp each color channel.
    let curR = (currentBgColor >> 16) & 0xFF;
    let curG = (currentBgColor >> 8) & 0xFF;
    let curB = currentBgColor & 0xFF;
    let tarR = (targetBgColor >> 16) & 0xFF;
    let tarG = (targetBgColor >> 8) & 0xFF;
    let tarB = targetBgColor & 0xFF;
    
    let newR = Math.round(curR + (tarR - curR) * lerpFactor);
    let newG = Math.round(curG + (tarG - curG) * lerpFactor);
    let newB = Math.round(curB + (tarB - curB) * lerpFactor);
    
    let newColor = (newR << 16) + (newG << 8) + newB;
    if(newColor !== currentBgColor) {
        currentBgColor = newColor;
        drawBgRect();
    }
});

// Listen for "Change Page Color" button click.
const changeColorButton = document.getElementById('changeColorButton');
changeColorButton.addEventListener('click', () => {
    // Choose a new random color.
    targetBgColor = parseInt(Math.floor(Math.random() * 16777215).toString(10));
    // Optionally update the body's background too.
    document.body.style.backgroundColor = '#' + targetBgColor.toString(16).padStart(6, '0');
});