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
        success: "August 7. I remember now. And this time, I won't forget again."
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
        success: "Exactly. No other answer was acceptable. 😂"
    },

    {
        number: "03",
        title: "Hydration",
        question: "What was Rajasthan’s greatest contribution to our conversations?",
        options: [
            "Unlimited water",
            "Water shortage jokes",
            "Swimming lessons",
            "Five-star hydration"
        ],
        answer: 1,
        success: "Water shortage jokes. Honestly, we got more mileage out of that joke than Rajasthan got out of its water."
    },

    {
        number: "04",
        title: "A little memory",
        question: "When I used to drop you home after class in Allen… how did that actually make you feel?",
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
            "Bad",
           
        ]
    }
];

let currentPuzzle = 0;
let selectedMemoryAnswer = "";
let soundEnabled = true;
let audioContext = null;


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const openingScreen = document.getElementById("opening-screen");
const gameScreen = document.getElementById("game-screen");
const twistScreen = document.getElementById("twist-screen");
const finalScreen = document.getElementById("final-screen");

const startButton = document.getElementById("start-button");
const continueButton = document.getElementById("continue-button");
const replayButton = document.getElementById("replay-button");

const puzzleNumber = document.getElementById("puzzle-number");
const puzzleTitle = document.getElementById("puzzle-title");
const puzzleQuestion = document.getElementById("puzzle-question");
const optionsContainer = document.getElementById("options-container");
const successMessage = document.getElementById("success-message");

const progressBar = document.getElementById("progress-bar");
const soundToggle = document.getElementById("sound-toggle");

const twistContinue = document.getElementById("twist-continue");
const finalReplay = document.getElementById("final-replay");


/* =========================================================
   AUDIO
   ========================================================= */

function initAudio() {
    if (!audioContext) {
        const AudioContext =
            window.AudioContext || window.webkitAudioContext;

        if (AudioContext) {
            audioContext = new AudioContext();
        }
    }

    if (audioContext && audioContext.state === "suspended") {
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
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

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
    [
        openingScreen,
        gameScreen,
        twistScreen,
        finalScreen
    ].forEach(element => {
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

    if (!puzzle) {
        return;
    }

    puzzleNumber.textContent = puzzle.number;
    puzzleTitle.textContent = puzzle.title;
    puzzleQuestion.textContent = puzzle.question;

    successMessage.textContent = "";
    successMessage.innerHTML = "";
    successMessage.classList.remove("visible");

    continueButton.classList.remove("visible");

    optionsContainer.innerHTML = "";

    updateProgress();

    if (puzzle.memoryQuestion) {
        renderMemoryQuestion(puzzle);
        return;
    }

    puzzle.options.forEach((option, index) => {
        const button = document.createElement("button");

        button.className = "answer-button";
        button.type = "button";
        button.textContent = option;

        button.addEventListener("click", () => {
            handleAnswer(index, button);
        });

        optionsContainer.appendChild(button);
    });
}


/* =========================================================
   NORMAL QUESTIONS
   ========================================================= */

function handleAnswer(index, button) {
    const puzzle = puzzles[currentPuzzle];

    const allButtons =
        optionsContainer.querySelectorAll(
            ".answer-button"
        );

    allButtons.forEach(btn => {
        btn.disabled = true;
    });

    if (index === puzzle.answer) {
        button.classList.add("correct");

        playCorrectSound();
        createSparkles();

        successMessage.textContent =
            puzzle.success;

        successMessage.classList.add("visible");

        continueButton.classList.add("visible");
    } else {
        button.classList.add("wrong");

        playWrongSound();

        setTimeout(() => {
            button.classList.remove("wrong");

            allButtons.forEach(btn => {
                btn.disabled = false;
            });
        }, 550);
    }
}


/* =========================================================
   MEMORY QUESTION
   ========================================================= */

function renderMemoryQuestion(puzzle) {
    const note = document.createElement("p");

    note.className = "question-note";

    note.textContent =
        "No wrong answer. Seriously. I actually want the honest answer, whatever it is.";

    optionsContainer.appendChild(note);

    puzzle.options.forEach(option => {
        const button = document.createElement("button");

        button.className =
            "answer-button memory-answer";

        button.type = "button";
        button.textContent = option;

        button.addEventListener("click", () => {
            handleMemoryAnswer(
                option,
                button
            );
        });

        optionsContainer.appendChild(button);
    });
}

function handleMemoryAnswer(answer, button) {
    selectedMemoryAnswer = answer;

    const allButtons =
        optionsContainer.querySelectorAll(
            ".answer-button"
        );

    allButtons.forEach(btn => {
        btn.disabled = true;
    });

    button.classList.add("selected");

    playCorrectSound();
    createSparkles();

    successMessage.innerHTML = `
        <div class="memory-result">
            <div class="memory-result-label">
                Your answer
            </div>

            <div class="memory-result-answer">
                ${escapeHTML(answer)}
            </div>

            <p>
                I wanted to know what you actually thought.
                So thank you for being honest. 🤍
            </p>

            <button
                type="button"
                class="whatsapp-button"
                id="whatsapp-button"
            >
                Send my answer on WhatsApp ↗
            </button>
        </div>
    `;

    successMessage.classList.add("visible");

    const whatsappButton =
        document.getElementById(
            "whatsapp-button"
        );

    if (whatsappButton) {
        whatsappButton.addEventListener(
            "click",
            () => {
                sendMemoryAnswer(answer);
            }
        );
    }

    continueButton.classList.add("visible");
}


/* =========================================================
   WHATSAPP SHARE
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
   LEVEL 5 — MOOD QUESTION
   ========================================================= */

function handleMoodAnswer(answer, button) {
    const allButtons =
        optionsContainer.querySelectorAll(
            ".answer-button"
        );

    allButtons.forEach(btn => {
        btn.disabled = true;
    });

    if (answer === "Good") {
        button.classList.add("correct");

        playCorrectSound();
        createSparkles();

        successMessage.textContent =
            "Good. That's what I wanted to hear. 🤍";

        successMessage.classList.add("visible");

        continueButton.classList.add("visible");

        return;
    }

    button.classList.add("wrong");

    playWrongSound();

    document.body.classList.add("dimmed");

    const existingSadMessage =
        document.querySelector(
            ".sad-message"
        );

    if (existingSadMessage) {
        existingSadMessage.remove();
    }

    const sadMessage =
        document.createElement("div");

    sadMessage.className =
        "sad-message";

    sadMessage.innerHTML = `
        <div class="sad-cat">
            😿
        </div>

        <div>
            Aww don't be like that 😿
        </div>

        <button
            type="button"
            class="mood-retry"
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

            allButtons.forEach(btn => {
                btn.disabled = false;
            });

            button.classList.remove(
                "wrong"
            );
        }
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
    if (!progressBar) {
        return;
    }

    const progress =
        (currentPuzzle / puzzles.length) *
        100;

    progressBar.style.width =
        `${Math.max(
            0,
            Math.min(progress, 100)
        )}%`;
}


/* =========================================================
   SPARKLES
   ========================================================= */

function createSparkles() {
    const container =
        document.createElement("div");

    container.className =
        "sparkle-container";

    for (let i = 0; i < 18; i++) {
        const sparkle =
            document.createElement("span");

        sparkle.className =
            "sparkle";

        sparkle.style.left =
            `${Math.random() * 100}%`;

        sparkle.style.top =
            `${Math.random() * 100}%`;

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
    soundEnabled = !soundEnabled;

    if (soundToggle) {
        soundToggle.textContent =
            soundEnabled
                ? "🔊"
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

if (startButton) {
    startButton.addEventListener(
        "click",
        startGame
    );
}

if (continueButton) {
    continueButton.addEventListener(
        "click",
        continueGame
    );
}

if (twistContinue) {
    twistContinue.addEventListener(
        "click",
        showFinal
    );
}

if (replayButton) {
    replayButton.addEventListener(
        "click",
        replayGame
    );
}

if (finalReplay) {
    finalReplay.addEventListener(
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
   KEYBOARD SUPPORT
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {
        if (event.key !== "Enter") {
            return;
        }

        const focused =
            document.activeElement;

        if (
            focused &&
            focused.classList.contains(
                "answer-button"
            )
        ) {
            focused.click();
        }
    }
);


/* =========================================================
   INITIAL STATE
   ========================================================= */

showScreen(openingScreen);
