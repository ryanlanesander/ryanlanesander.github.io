// Helper function to get or set the letter of the day
function getLetterOfTheDay() {
    const today = new Date().toISOString().slice(0, 10);
    const storedDate = localStorage.getItem('letterOfTheDayDate');
    const storedLetter = localStorage.getItem('letterOfTheDay');
    if (storedLetter && storedDate === today) {
        return storedLetter;
    } else {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const letter = letters[Math.floor(Math.random() * letters.length)];
        localStorage.setItem('letterOfTheDay', letter);
        localStorage.setItem('letterOfTheDayDate', today);
        return letter;
    }
}

// Helper function to get or set the word of the day and its definition
function getWordInfo(letter) {
    const today = new Date().toISOString().slice(0,10);
    const cachedDate = localStorage.getItem('wordOfTheDayDate');
    const cachedWord = localStorage.getItem('wordOfTheDay');
    const cachedDef = localStorage.getItem('definitionOfTheDay');
    if(cachedWord && cachedDef && cachedDate === today) {
        return { word: cachedWord, definition: cachedDef };
    }
    // A sample dictionary mapping for demo purposes.
    const sampleWords = {
        A: [{word:"Apple", definition:"A common fruit."}, {word:"Anchor", definition:"Heavy device for mooring."}],
        B: [{word:"Banana", definition:"A tropical fruit."}, {word:"Beacon", definition:"A guiding signal."}],
        C: [{word:"Cat", definition:"A furry pet."}, {word:"Candle", definition:"Provides light when lit."}]
        // ... will add more as needed ...
    };
    const candidates = sampleWords[letter] || [{word:"Word", definition:"Definition not found."}];
    const chosen = candidates[Math.floor(Math.random()* candidates.length)];
    localStorage.setItem('wordOfTheDay', chosen.word);
    localStorage.setItem('definitionOfTheDay', chosen.definition);
    localStorage.setItem('wordOfTheDayDate', today);
    return chosen;
}

// Initialize PIXI for the Letter of the Day canvas.
(function initLetterCanvas(){
    const letter = getLetterOfTheDay();
    const app = new PIXI.Application({
        width: 410,
        height: 400,
        backgroundColor: 0xFFFFFF,
        transparent: false
    });
    document.getElementById('letterCanvasContainer').appendChild(app.view);

    // Define text styles
    const topTextStyle = new PIXI.TextStyle({
        fontFamily: 'Jua',
        fontSize: 24,
        fill: ['#000000'],
        align: 'center'
    });

    const middleTextStyle = new PIXI.TextStyle({
        fontFamily: 'Jua',
        fontSize: 148,
        fill: ['#000000'],
        align: 'center'
    });

    const bottomTextStyle = new PIXI.TextStyle({
        fontFamily: 'Jua',
        fontSize: 20,
        fill: ['#000000'],
        align: 'center'
    });

    // Create top text
    const topText = new PIXI.Text("Today's Letter:", topTextStyle);
    topText.anchor.set(0.5);
    topText.x = app.renderer.width / 2;
    topText.y = 50;
    app.stage.addChild(topText);

    // Create middle text
    const middleText = new PIXI.Text(letter, middleTextStyle);
    middleText.anchor.set(0.5);
    middleText.x = app.renderer.width / 2;
    middleText.y = app.renderer.height / 2;
    app.stage.addChild(middleText);

    // Create bottom text
    const bottomText = new PIXI.Text("Pretty cool huh? Wanna touch it?", bottomTextStyle);
    bottomText.anchor.set(0.5);
    bottomText.x = app.renderer.width / 2;
    bottomText.y = app.renderer.height - 50;
    app.stage.addChild(bottomText);

    // Animations

    // Add bounce animation to the middle text
    function animateBounce() {
        gsap.to(middleText, {
            y: app.renderer.height / 2 - 10, // Move up slightly
            duration: 0.5,
            yoyo: true,
            repeat: -1, // Infinite bounce
            ease: "power1.inOut"
        });
    }
    animateBounce();

    // Animation functions using GSAP
    function animateSwirlOut(duration, onComplete) {
        const seconds = duration / 60;
        gsap.to([topText, middleText, bottomText], {
            duration: seconds,
            alpha: 0,
            rotation: "+=5",
            ease: "power2.inOut",
            onComplete: onComplete
        });
    }

    function animateSwirlIn(newText, duration) {
        const wordText = new PIXI.Text(newText, middleTextStyle);
        wordText.anchor.set(0.5);
        wordText.x = app.renderer.width / 2;
        wordText.y = app.renderer.height / 2;
        wordText.alpha = 0;
        wordText.scale.set(0);
        app.stage.addChild(wordText);

        const seconds = duration / 60;
        gsap.to(wordText, {
            duration: seconds,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            ease: "power2.inOut"
        });
    }

    //Interaction

    // Add interaction to middle text
    middleText.interactive = true;
    middleText.buttonMode = true;
    middleText.on('pointerdown', function() {
        const wordInfo = getWordInfo(letter);
        animateSwirlOut(60, () => {
            const newContent = `Word of the Day:\n${wordInfo.word}`;
            animateSwirlIn(newContent, 60);
        });
    });
})();
