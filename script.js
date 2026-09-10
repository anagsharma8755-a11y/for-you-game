/* =========================================================
   FOR YOU — Interactive Mini Game
   ========================================================= */

const puzzles = [
    {
        number: "01",
        title: "I remember now",
        question: "When is your birthday?",
        options: [
            "August 7",
            "August 17",
            "July 7",
            "September 7"
        ],
        answer: 0,
        success:
            "August 7. I remember now. And this time, I won't forget again."
    },

    {
        number: "02",
        title: "An obvious one",
        question: "What did we both think about Allen?",
        options: [
            "Best place on Earth",
            "We both hated it",
            "I secretly loved it",
            "What’s Allen?"
        ],
        answer: 1,
        success:
            "Exactly. No other answer was acceptable. 😂"
    },

    {
        number: "03",
        title: "Hydration",
        question:
            "What was Rajasthan’s greatest contribution to our conversations?",
        options: [
            "Unlimited water",
            "Water shortage jokes",
            "Swimming lessons",
            "Five-star hydration"
        ],
        answer: 1,
        success:
            "Water shortage jokes. Honestly, we got more mileage out of that joke than Rajasthan got out of its water."
    },

    {
        number: "04",
        title: "A little memory",
        question:
            "When I used to drop you home after class in Allen… how did that actually make you feel?",
        memoryQuestion: true,
        options: [
            "🫶 I liked it",
            "🙂 I was comfortable",
            "😅 I didn’t mind it",
            "🤍 I felt safe",
            "🙈 I was a little awkward",
            "😂 I just liked the company",
            "💭 Honestly, I had mixed feelings",
            "✨ Something else"
        ]
    },

    {
        number: "05",
        title: "One last question",
        question: "How are you today?",
        moodQuestion: true,
        options: [
            "Good",
            "Bad"
        ]
    }
];


/* =========================================================
   STATE
   ========================================================= */

let currentPuzzle = 0;
let selectedMemoryAnswer = "";
let soundEnabled = true;
let audioContext = null;
let currentAffirmation = 0;


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const openingScreen = document.getElementById("opening");
const gameScreen = document.getElementById("game");
const twistScreen = document.getElementById("twist");
const affirmationsScreen =
    document.getElementById("affirmations");
const finalScreen = document.getElementById("final");

const startBtn = document.getElementById("startBtn");
const twistNextBtn =
    document.getElementById("twistNextBtn");
const affirmationNextBtn =
    document.getElementById("affirmationNextBtn");
const replayBtn = document.getElementById("replayBtn");

const gameContent =
    document.getElementById("gameContent");

const progressText =
    document.getElementById("progressText");

const progressBar =
    document.getElementById("progressBar");

const soundToggle =
    document.getElementById("soundToggle");

const affirmationNumber =
    document.getElementById("affirmationNumber");

const affirmationEyebrow =
    document.getElementById("affirmationEyebrow");

const affirmationTitle =
    document.getElementById("affirmationTitle");

const affirmationText =
    document.getElementById("affirmationText");


/* =========================================================
   AFFIRMATIONS
   ========================================================= */

const affirmations = [
    {
        eyebrow: "YOUR AMBITION",
        title: "Your ambition.",
        text:
            "I hope you never make your dreams smaller just because they feel far away. You’re ambitious, and I genuinely like that about you. Keep going after the things you want."
    },

    {
        eyebrow: "YOUR VOICE",
        title: "Your voice.",
        text:
            "I like hearing you talk. Even when we're just talking about completely ordinary things, you somehow make the conversation better. I don't think you realize how nice that is."
    },

    {
        eyebrow: "AND YOU",
        title: "And you.",
        text:
            "You're beautiful. Probably more than you realize. And somehow, I don't think you always see yourself the way other people do."
    }
];


/* =========================================================
   AUDIO
   ========================================================= */

function initAudio() {
    if (!audioContext) {
        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (AudioContext) {
            audioContext = new AudioContext();
        }
    }

    if (
        audioContext &&
        audioContext.state === "suspended"
    ) {
        audioContext.resume();
    }
}


function playTone(
    frequency,
    duration,
    type = "sine",
    volume = 0.05
) {
    if (!soundEnabled || !audioContext) {
        return;
    }

    try {
        const oscillator =
            audioContext.createOscillator();

        const gainNode =
            audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(
            volume,
            audioContext.currentTime
        );

        gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + duration
        );

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + duration
        );
    } catch (error) {
        console.warn("Audio unavailable:", error);
    }
}


function playCorrectSound() {
    playTone(
        523.25,
        0.12,
        "sine",
        0.05
    );

    setTimeout(() => {
        playTone(
            659.25,
            0.16,
            "sine",
            0.05
        );
    }, 80);
}


function playWrongSound() {
    playTone(
        180,
        0.16,
        "triangle",
        0.035
    );
}


function playSuccessSound() {
    playTone(
        523.25,
        0.1,
        "sine",
        0.04
    );

    setTimeout(() => {
        playTone(
            659.25,
            0.1,
            "sine",
            0.04
        );
    }, 90);

    setTimeout(() => {
        playTone(
            783.99,
            0.18,
            "sine",
            0.04
        );
    }, 180);
}


/* =========================================================
   SCREEN MANAGEMENT
   ========================================================= */

function showScreen(screen) {
    const screens = [
        openingScreen,
        gameScreen,
        twistScreen,
        affirmationsScreen,
        finalScreen
    ];

    screens.forEach(element => {
        if (element) {
            element.classList.remove("active");
        }
    });

    if (screen) {
        screen.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   START GAME
   ========================================================= */

function startGame() {
    initAudio();

    currentPuzzle = 0;
    selectedMemoryAnswer = "";

    showScreen(gameScreen);
    renderPuzzle();
}


/* =========================================================
   RENDER PUZZLE
   ========================================================= */

function renderPuzzle() {
    const puzzle = puzzles[currentPuzzle];

    if (!puzzle || !gameContent) {
        return;
    }

    gameContent.innerHTML = "";

    updateProgress();

    const card =
        document.createElement("div");

    card.className = "question-card";


    const number =
        document.createElement("div");

    number.className = "question-number";
    number.textContent = puzzle.number;


    const title =
        document.createElement("h2");

    title.textContent = puzzle.title;


    const question =
        document.createElement("p");

    question.className =
        "question-description";

    question.textContent =
        puzzle.question;


    const answers =
        document.createElement("div");

    answers.className = "answers";


    card.appendChild(number);
    card.appendChild(title);
    card.appendChild(question);
    card.appendChild(answers);

    gameContent.appendChild(card);


    if (puzzle.memoryQuestion) {
        renderMemoryQuestion(answers);
        return;
    }


    if (puzzle.moodQuestion) {
        renderMoodQuestion(answers);
        return;
    }


    puzzle.options.forEach(
        (option, index) => {

            const button =
                createAnswerButton(option);

            button.addEventListener(
                "click",
                () => {
                    handleAnswer(
                        index,
                        button
                    );
                }
            );

            answers.appendChild(button);
        }
    );
}


/* =========================================================
   CREATE ANSWER BUTTON
   ========================================================= */

function createAnswerButton(text) {
    const button =
        document.createElement("button");

    button.type = "button";
    button.className = "answer-btn";
    button.textContent = text;

    return button;
}


/* =========================================================
   NORMAL QUESTIONS
   ========================================================= */

function handleAnswer(index, button) {
    const puzzle =
        puzzles[currentPuzzle];

    const allButtons =
        gameContent.querySelectorAll(
            ".answer-btn"
        );


    if (index === puzzle.answer) {

        allButtons.forEach(btn => {
            btn.disabled = true;
        });

        button.classList.add("correct");

        playCorrectSound();
        createSparkles();

        showSuccessMessage(
            puzzle.success
        );

        createNextButton();

    } else {

        button.classList.add("wrong");

        playWrongSound();

        setTimeout(() => {
            button.classList.remove(
                "wrong"
            );
        }, 500);
    }
}


/* =========================================================
   MEMORY QUESTION
   ========================================================= */

function renderMemoryQuestion(container) {

    const note =
        document.createElement("div");

    note.className = "memory-note";

    note.textContent =
        "No wrong answer. Seriously. I actually want the honest answer, whatever it is.";

    container.appendChild(note);


    puzzles[currentPuzzle].options.forEach(
        option => {

            const button =
                createAnswerButton(option);

            button.classList.add(
                "memory-answer"
            );

            button.addEventListener(
                "click",
                () => {
                    handleMemoryAnswer(
                        option,
                        button
                    );
                }
            );

            container.appendChild(button);
        }
    );
}


function handleMemoryAnswer(
    answer,
    button
) {
    selectedMemoryAnswer = answer;

    const allButtons =
        gameContent.querySelectorAll(
            ".answer-btn"
        );

    allButtons.forEach(btn => {
        btn.disabled = true;
    });

    button.classList.add("correct");

    playCorrectSound();
    createSparkles();


    const message =
        document.createElement("div");

    message.className =
        "success-message";


    message.innerHTML = `
        <div class="memory-result">

            <div class="memory-result-title">
                YOUR ANSWER
            </div>

            <div class="memory-result-text">
                ${escapeHTML(answer)}
            </div>

            <p style="margin-top:12px;">
                I wanted to know what you actually thought.
                So thank you for being honest. 🤍
            </p>

            <button
                type="button"
                class="whatsapp-btn"
                id="whatsappBtn"
            >
                Send my answer on WhatsApp ↗
            </button>

        </div>
    `;


    gameContent.appendChild(message);


    const whatsappBtn =
        document.getElementById(
            "whatsappBtn"
        );


    if (whatsappBtn) {

        whatsappBtn.addEventListener(
            "click",
            () => {
                sendMemoryAnswer(
                    answer
                );
            }
        );
    }


    createNextButton();
}


/* =========================================================
   WHATSAPP
   ========================================================= */

function sendMemoryAnswer(answer) {

    const message =
`I played your little game 🤍

For the "dropping me home" question, I chose:
"${answer}"

That's my honest answer :)`;


    const whatsappURL =
        "https://wa.me/?text=" +
        encodeURIComponent(message);


    window.open(
        whatsappURL,
        "_blank",
        "noopener,noreferrer"
    );
}


/* =========================================================
   MOOD QUESTION
   ========================================================= */

function renderMoodQuestion(container) {

    const moodButtons =
        document.createElement("div");

    moodButtons.className =
        "mood-buttons";


    puzzles[currentPuzzle].options.forEach(
        option => {

            const button =
                createAnswerButton(option);

            moodButtons.appendChild(
                button
            );


            button.addEventListener(
                "click",
                () => {
                    handleMoodAnswer(
                        option,
                        button
                    );
                }
            );
        }
    );


    container.appendChild(
        moodButtons
    );
}


function handleMoodAnswer(
    answer,
    button
) {

    const allButtons =
        gameContent.querySelectorAll(
            ".answer-btn"
        );


    if (answer === "Good") {

        allButtons.forEach(btn => {
            btn.disabled = true;
        });

        button.classList.add(
            "correct"
        );

        playCorrectSound();
        createSparkles();

        showSuccessMessage(
            "Good. That's what I wanted to hear. 🤍"
        );

        createNextButton();

        return;
    }


    button.classList.add("wrong");

    playWrongSound();

    document.body.classList.add(
        "dimmed"
    );


    const existing =
        document.querySelector(
            ".sad-message"
        );


    if (existing) {
        existing.remove();
    }


    const sadMessage =
        document.createElement("div");

    sadMessage.className =
        "sad-message";


    sadMessage.innerHTML = `
        <div class="sad-cat-face">
            😿
        </div>

        <div class="sad-cat-text">
            Aww don't be like that 😿
        </div>

        <button
            type="button"
            class="primary-btn mood-retry"
        >
            Okay okay… Good
        </button>
    `;


    document.body.appendChild(
        sadMessage
    );


    const retryButton =
        sadMessage.querySelector(
            ".mood-retry"
        );


    retryButton.addEventListener(
        "click",
        () => {

            document.body.classList.remove(
                "dimmed"
            );

            sadMessage.remove();

            button.classList.remove(
                "wrong"
            );
        }
    );
}


/* =========================================================
   SUCCESS MESSAGE
   ========================================================= */

function showSuccessMessage(text) {

    const message =
        document.createElement("div");

    message.className =
        "success-message";

    message.textContent = text;

    gameContent.appendChild(
        message
    );
}


/* =========================================================
   NEXT BUTTON
   ========================================================= */

function createNextButton() {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "next-wrap";


    const button =
        document.createElement("button");

    button.type = "button";

    button.className =
        "primary-btn";


    button.innerHTML =
        `Continue <span>→</span>`;


    button.addEventListener(
        "click",
        continueGame
    );


    wrapper.appendChild(button);

    gameContent.appendChild(
        wrapper
    );
}


/* =========================================================
   CONTINUE
   ========================================================= */

function continueGame() {

    initAudio();


    if (
        currentPuzzle <
        puzzles.length - 1
    ) {

        currentPuzzle++;

        renderPuzzle();

        return;
    }


    playSuccessSound();

    showTwist();
}


/* =========================================================
   TWIST
   ========================================================= */

function showTwist() {
    showScreen(twistScreen);
}


/* =========================================================
   AFFIRMATIONS
   ========================================================= */

function showAffirmations() {

    currentAffirmation = 0;

    renderAffirmation();

    showScreen(
        affirmationsScreen
    );
}


function renderAffirmation() {

    const item =
        affirmations[
            currentAffirmation
        ];


    if (!item) {
        return;
    }


    affirmationNumber.textContent =
        String(
            currentAffirmation + 1
        ).padStart(2, "0");


    affirmationEyebrow.textContent =
        item.eyebrow;


    affirmationTitle.textContent =
        item.title;


    affirmationText.textContent =
        item.text;
}


function nextAffirmation() {

    currentAffirmation++;


    if (
        currentAffirmation >=
        affirmations.length
    ) {

        showFinal();

        return;
    }


    renderAffirmation();

    createSparkles();
}


/* =========================================================
   FINAL
   ========================================================= */

function showFinal() {

    showScreen(finalScreen);

    playSuccessSound();

    createSparkles();
}


/* =========================================================
   REPLAY
   ========================================================= */

function replayGame() {

    initAudio();

    currentPuzzle = 0;
    selectedMemoryAnswer = "";
    currentAffirmation = 0;


    document.body.classList.remove(
        "dimmed"
    );


    const sadMessage =
        document.querySelector(
            ".sad-message"
        );


    if (sadMessage) {
        sadMessage.remove();
    }


    showScreen(openingScreen);
}


/* =========================================================
   PROGRESS
   ========================================================= */

function updateProgress() {

    if (
        !progressBar ||
        !progressText
    ) {
        return;
    }


    const number =
        currentPuzzle + 1;


    progressText.textContent =
        `${String(number).padStart(
            2,
            "0"
        )} / 05`;


    const progress =
        (number / puzzles.length) *
        100;


    progressBar.style.width =
        `${progress}%`;
}


/* =========================================================
   SPARKLES
   ========================================================= */

function createSparkles() {

    const container =
        document.createElement("div");

    container.className =
        "sparkle-container";


    for (
        let i = 0;
        i < 18;
        i++
    ) {

        const sparkle =
            document.createElement("span");

        sparkle.className =
            "sparkle";


        sparkle.style.left =
            `${Math.random() * 100}%`;


        sparkle.style.top =
            `${Math.random() * 100}%`;


        sparkle.style.setProperty(
            "--x",
            `${(Math.random() - 0.5) * 160}px`
        );


        sparkle.style.setProperty(
            "--y",
            `${(Math.random() - 0.5) * 160}px`
        );


        sparkle.style.animationDelay =
            `${Math.random() * 0.4}s`;


        container.appendChild(
            sparkle
        );
    }


    document.body.appendChild(
        container
    );


    setTimeout(() => {
        container.remove();
    }, 1400);
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


/* =========================================================
   SOUND TOGGLE
   ========================================================= */

function toggleSound() {

    soundEnabled =
        !soundEnabled;


    if (soundToggle) {

        soundToggle.textContent =
            soundEnabled
                ? "♫"
                : "🔇";


        soundToggle.setAttribute(
            "aria-label",
            soundEnabled
                ? "Turn sound off"
                : "Turn sound on"
        );
    }


    if (soundEnabled) {

        initAudio();

        playTone(
            440,
            0.08,
            "sine",
            0.03
        );
    }
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

if (startBtn) {

    startBtn.addEventListener(
        "click",
        startGame
    );
}


if (twistNextBtn) {

    twistNextBtn.addEventListener(
        "click",
        showAffirmations
    );
}


if (affirmationNextBtn) {

    affirmationNextBtn.addEventListener(
        "click",
        nextAffirmation
    );
}


if (replayBtn) {

    replayBtn.addEventListener(
        "click",
        replayGame
    );
}


if (soundToggle) {

    soundToggle.addEventListener(
        "click",
        toggleSound
    );
}


/* =========================================================
   INITIAL STATE
   ========================================================= */

showScreen(openingScreen);
