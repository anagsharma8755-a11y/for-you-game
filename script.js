/* =========================================================
   FOR YOU — PERSONALIZED MINI GAME
   Pure HTML / CSS / JavaScript
   GitHub Pages ready
========================================================= */

const screens = {
  opening: document.getElementById("opening"),
  game: document.getElementById("game"),
  twist: document.getElementById("twist"),
  affirmations: document.getElementById("affirmations"),
  final: document.getElementById("final")
};

const gameContent = document.getElementById("gameContent");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const soundToggle = document.getElementById("soundToggle");
const sparkleContainer = document.getElementById("sparkleContainer");

const startBtn = document.getElementById("startBtn");
const twistNextBtn = document.getElementById("twistNextBtn");
const affirmationNextBtn = document.getElementById("affirmationNextBtn");
const replayBtn = document.getElementById("replayBtn");

let currentQuestion = 0;
let currentAffirmation = 0;
let soundEnabled = true;
let audioContext = null;


/* =========================================================
   QUESTIONS
========================================================= */

const puzzles = [
  {
    number: "01",
    label: "I remember now",
    question: "When is your birthday?",
    description: "Let’s see if I finally got this one right.",
    options: [
      "August 7",
      "August 17",
      "July 7",
      "September 7"
    ],
    correct: 0,
    success:
      "August 7. I remember now. And this time, I won't forget again."
  },

  {
    number: "02",
    label: "An obvious one",
    question: "What did we both think about Allen?",
    description: "Surely this one isn't difficult.",
    options: [
      "Best place on Earth",
      "We both hated it",
      "I secretly loved it",
      "What's Allen?"
    ],
    correct: 1,
    success:
      "Exactly. At least we agreed on something. 😂"
  },

  {
    number: "03",
    label: "Hydration",
    question:
      "What was Rajasthan’s greatest contribution to our conversations?",
    description: "Think carefully. This is extremely important research.",
    options: [
      "Unlimited water",
      "Water shortage jokes",
      "Swimming lessons",
      "Five-star hydration"
    ],
    correct: 1,
    success:
      "Water shortage jokes. Honestly, we got more mileage out of that joke than Rajasthan got out of its water."
  },

  {
    number: "04",
    label: "A little memory",
    memoryQuestion: true,
    question: "When I used to drop you home… how did you actually feel about it?",
    description:
      "There isn't a right answer here. Pick whatever honestly feels closest.",
    options: [
      "🫶 I liked it",
      "🙂 I was comfortable",
      "😅 I didn't mind it",
      "🤍 I felt safe",
      "🙈 I was a little awkward",
      "😂 I just liked the company",
      "💭 Honestly, I had mixed feelings",
      "✨ Something else"
    ]
  },

  {
    number: "05",
    label: "One last question",
    moodQuestion: true,
    question: "How are you today?",
    options: [
      "Good",
      "Bad",
      "No"
    ]
  }
];


/* =========================================================
   AFFIRMATIONS
========================================================= */

const affirmations = [
  {
    eyebrow: "YOUR AMBITION",
    title: "Your ambition.",
    text:
      "I really like how ambitious you are. Don’t ever feel like you have to make your dreams smaller for anyone. You have places you want to go, things you want to do, and I hope you keep chasing all of them."
  },

  {
    eyebrow: "YOUR VOICE",
    title: "Your voice.",
    text:
      "This might sound random, but I really like hearing you talk. Your voice has this way of making even an ordinary conversation feel a little better."
  },

  {
    eyebrow: "AND YOU",
    title: "And you.",
    text:
      "You’re beautiful. Not in some dramatic movie-scene kind of way. Just in that very unfair way where I sometimes think you probably don’t realize how beautiful you actually are."
  }
];


/* =========================================================
   SCREEN MANAGEMENT
========================================================= */

function showScreen(screen) {
  Object.values(screens).forEach((item) => {
    item.classList.remove("active");
  });

  screen.classList.add("active");
}


/* =========================================================
   AUDIO
========================================================= */

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function playTone(frequency, duration, type = "sine", volume = 0.035) {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    // Audio is optional.
  }
}

function playClick() {
  playTone(520, 0.08, "sine", 0.025);
}

function playWrong() {
  playTone(180, 0.13, "sawtooth", 0.018);
}

function playSuccess() {
  if (!soundEnabled) return;

  playTone(660, 0.12, "sine", 0.035);

  setTimeout(() => {
    playTone(880, 0.18, "sine", 0.035);
  }, 90);
}


/* =========================================================
   SPARKLES
========================================================= */

function createSparkles(amount = 18) {
  for (let i = 0; i < amount; i++) {
    const sparkle = document.createElement("div");

    sparkle.className = "sparkle";

    sparkle.style.left = `${50 + (Math.random() - 0.5) * 45}%`;
    sparkle.style.top = `${50 + (Math.random() - 0.5) * 30}%`;

    sparkle.style.setProperty(
      "--x",
      `${(Math.random() - 0.5) * 180}px`
    );

    sparkle.style.setProperty(
      "--y",
      `${-50 - Math.random() * 120}px`
    );

    sparkle.style.animationDelay = `${Math.random() * 0.25}s`;

    sparkleContainer.appendChild(sparkle);

    setTimeout(() => {
      sparkle.remove();
    }, 1600);
  }
}


/* =========================================================
   GAME START
========================================================= */

startBtn.addEventListener("click", () => {
  getAudioContext();
  playClick();

  currentQuestion = 0;

  showScreen(screens.game);
  renderQuestion();
});


/* =========================================================
   RENDER QUESTION
========================================================= */

function renderQuestion() {
  const puzzle = puzzles[currentQuestion];

  progressText.textContent =
    `${String(currentQuestion + 1).padStart(2, "0")} / ${String(puzzles.length).padStart(2, "0")}`;

  progressBar.style.width =
    `${((currentQuestion + 1) / puzzles.length) * 100}%`;

  if (puzzle.memoryQuestion) {
    renderMemoryQuestion(puzzle);
    return;
  }

  if (puzzle.moodQuestion) {
    renderMoodQuestion(puzzle);
    return;
  }

  renderStandardQuestion(puzzle);
}


/* =========================================================
   STANDARD QUESTION
========================================================= */

function renderStandardQuestion(puzzle) {
  gameContent.innerHTML = `
    <div class="question-card">

      <div class="question-number">
        ${puzzle.number} — ${puzzle.label}
      </div>

      <h2>${puzzle.question}</h2>

      <p class="question-description">
        ${puzzle.description}
      </p>

      <div class="answers">
        ${puzzle.options
          .map(
            (option, index) => `
              <button
                class="answer-btn"
                data-index="${index}"
              >
                ${option}
              </button>
            `
          )
          .join("")}
      </div>

    </div>
  `;

  const buttons = document.querySelectorAll(".answer-btn");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      handleStandardAnswer(button, Number(button.dataset.index), puzzle);
    });
  });
}


/* =========================================================
   STANDARD ANSWER
========================================================= */

function handleStandardAnswer(button, selectedIndex, puzzle) {
  if (button.classList.contains("correct")) return;

  if (selectedIndex === puzzle.correct) {
    button.classList.add("correct");

    playSuccess();
    createSparkles(20);

    const card = document.querySelector(".question-card");

    const success = document.createElement("p");
    success.className = "success-message";
    success.textContent = puzzle.success;

    const nextWrap = document.createElement("div");
    nextWrap.className = "next-wrap";

    const nextButton = document.createElement("button");
    nextButton.className = "primary-btn";
    nextButton.innerHTML = "Next <span>→</span>";

    nextWrap.appendChild(nextButton);

    card.appendChild(success);
    card.appendChild(nextWrap);

    document.querySelectorAll(".answer-btn").forEach((item) => {
      item.disabled = true;
      item.style.pointerEvents = "none";
    });

    nextButton.addEventListener("click", () => {
      playClick();
      goToNextQuestion();
    });

  } else {
    button.classList.add("wrong");

    playWrong();

    setTimeout(() => {
      button.classList.remove("wrong");
    }, 500);
  }
}


/* =========================================================
   MEMORY / HOME DROP QUESTION
========================================================= */

function renderMemoryQuestion(puzzle) {
  gameContent.innerHTML = `
    <div class="question-card memory-answer">

      <div class="question-number">
        ${puzzle.number} — ${puzzle.label}
      </div>

      <h2>${puzzle.question}</h2>

      <p class="question-description">
        ${puzzle.description}
      </p>

      <div class="memory-note">
        <strong>No wrong answer.</strong><br />
        Seriously. I actually want the honest answer,
        whatever it is.
      </div>

      <div class="answers">
        ${puzzle.options
          .map(
            (option, index) => `
              <button
                class="answer-btn"
                data-memory-index="${index}"
              >
                ${option}
              </button>
            `
          )
          .join("")}
      </div>

    </div>
  `;

  const buttons = document.querySelectorAll("[data-memory-index]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      handleMemoryAnswer(
        button,
        Number(button.dataset.memoryIndex),
        puzzle
      );
    });
  });
}


/* =========================================================
   MEMORY ANSWER
========================================================= */

function handleMemoryAnswer(button, selectedIndex, puzzle) {
  playSuccess();
  createSparkles(16);

  const selectedAnswer = puzzle.options[selectedIndex];

  document.querySelectorAll("[data-memory-index]").forEach((item) => {
    item.disabled = true;
    item.style.pointerEvents = "none";
  });

  button.classList.add("correct");

  const card = document.querySelector(".question-card");

  let responseText =
    "Thank you for answering honestly. 🤍";

  if (selectedAnswer.includes("liked")) {
    responseText =
      "Okay. I'm glad I have that memory a little more clearly now. 🤍";
  } else if (selectedAnswer.includes("comfortable")) {
    responseText =
      "That's actually really nice to know. 🤍";
  } else if (selectedAnswer.includes("didn't mind")) {
    responseText =
      "Fair enough. I'll take an honest answer over a made-up one. 😌";
  } else if (selectedAnswer.includes("felt safe")) {
    responseText =
      "That one actually means a lot to know. 🤍";
  } else if (selectedAnswer.includes("awkward")) {
    responseText =
      "Honestly… I can understand that. 😂";
  } else if (selectedAnswer.includes("company")) {
    responseText =
      "Okay, I'll admit… I liked the company too. 😌";
  } else if (selectedAnswer.includes("mixed feelings")) {
    responseText =
      "Fair. I appreciate you being honest about it. 🤍";
  } else if (selectedAnswer.includes("Something else")) {
    responseText =
      "Now I'm curious what the actual answer was. 👀";
  }

  const result = document.createElement("div");
  result.className = "memory-result";

  result.innerHTML = `
    <div class="memory-result-title">
      Your answer
    </div>

    <div class="memory-result-text">
      ${escapeHtml(selectedAnswer)}
    </div>

    <p class="success-message">
      ${responseText}
    </p>

    <button class="whatsapp-btn" id="sendAnswerBtn">
      Send my answer on WhatsApp ↗
    </button>

    <div class="next-wrap">
      <button class="primary-btn" id="memoryNextBtn">
        Continue <span>→</span>
      </button>
    </div>
  `;

  card.appendChild(result);

  document
    .getElementById("sendAnswerBtn")
    .addEventListener("click", () => {
      sendMemoryAnswer(selectedAnswer);
    });

  document
    .getElementById("memoryNextBtn")
    .addEventListener("click", () => {
      playClick();
      goToNextQuestion();
    });
}


/* =========================================================
   WHATSAPP SHARE
========================================================= */

function sendMemoryAnswer(answer) {
  playClick();

  const message =
    `I played your little game 🤍\n\n` +
    `For the "dropping me home" question, I chose:\n` +
    `"${answer}"\n\n` +
    `That's my honest answer :)`;

  const whatsappUrl =
    `https://wa.me/?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank");
}


/* =========================================================
   MOOD QUESTION
========================================================= */

function renderMoodQuestion(puzzle) {
  gameContent.innerHTML = `
    <div class="question-card">

      <div class="question-number">
        ${puzzle.number} — ${puzzle.label}
      </div>

      <h2>${puzzle.question}</h2>

      <div class="mood-buttons">
        ${puzzle.options
          .map(
            (option, index) => `
              <button
                class="answer-btn"
                data-mood-index="${index}"
              >
                ${option}
              </button>
            `
          )
          .join("")}
      </div>

    </div>
  `;

  document.querySelectorAll("[data-mood-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.moodIndex);
      handleMoodAnswer(index);
    });
  });
}


/* =========================================================
   MOOD ANSWER
========================================================= */

function handleMoodAnswer(index) {
  if (index === 0) {
    showGoodMood();
  } else {
    showSadMood();
  }
}


function showGoodMood() {
  playSuccess();
  createSparkles(25);

  gameContent.innerHTML = `
    <div class="question-card">

      <div class="question-number">
        05 — One last question
      </div>

      <h2>There we go. 🤍</h2>

      <p class="question-description">
        That's better.
      </p>

      <div class="next-wrap">
        <button class="primary-btn" id="moodNextBtn">
          Unlock the last part <span>→</span>
        </button>
      </div>

    </div>
  `;

  document
    .getElementById("moodNextBtn")
    .addEventListener("click", () => {
      playClick();
      showTwist();
    });
}


function showSadMood() {
  playWrong();

  screens.game.classList.add("dimmed");

  gameContent.innerHTML = `
    <div class="question-card">

      <div class="question-number">
        05 — One last question
      </div>

      <h2>Hey…</h2>

      <div class="sad-cat">

        <div class="sad-cat-face">
          😿
        </div>

        <div class="sad-cat-text">
          Aww don't be like that 😿
        </div>

        <button class="primary-btn" id="goodMoodBtn">
          Okay okay… Good
        </button>

      </div>

    </div>
  `;

  document
    .getElementById("goodMoodBtn")
    .addEventListener("click", () => {
      screens.game.classList.remove("dimmed");

      playSuccess();
      createSparkles(22);

      showGoodMood();
    });
}


/* =========================================================
   NEXT QUESTION
========================================================= */

function goToNextQuestion() {
  currentQuestion++;

  if (currentQuestion >= puzzles.length - 1) {
    renderQuestion();
    return;
  }

  renderQuestion();
}


/* =========================================================
   TWIST
========================================================= */

function showTwist() {
  screens.game.classList.remove("dimmed");

  playSuccess();
  createSparkles(22);

  showScreen(screens.twist);
}


/* =========================================================
   AFFIRMATIONS
========================================================= */

twistNextBtn.addEventListener("click", () => {
  playClick();

  currentAffirmation = 0;

  showScreen(screens.affirmations);
  renderAffirmation();
});


function renderAffirmation() {
  const item = affirmations[currentAffirmation];

  const number =
    String(currentAffirmation + 1).padStart(2, "0");

  document.getElementById("affirmationNumber").textContent = number;

  document.getElementById("affirmationEyebrow").textContent =
    item.eyebrow;

  document.getElementById("affirmationTitle").textContent =
    item.title;

  document.getElementById("affirmationText").textContent =
    item.text;

  const card = document.getElementById("affirmationCard");

  card.style.animation = "none";
  void card.offsetWidth;
  card.style.animation = "cardEnter 0.65s ease both";

  if (currentAffirmation === affirmations.length - 1) {
    affirmationNextBtn.innerHTML =
      'One last thing <span>→</span>';
  } else {
    affirmationNextBtn.innerHTML =
      'Next <span>→</span>';
  }
}


affirmationNextBtn.addEventListener("click", () => {
  playClick();

  currentAffirmation++;

  if (currentAffirmation >= affirmations.length) {
    showScreen(screens.final);
    createSparkles(30);
    playSuccess();
    return;
  }

  renderAffirmation();
});


/* =========================================================
   REPLAY
========================================================= */

replayBtn.addEventListener("click", () => {
  playClick();

  currentQuestion = 0;
  currentAffirmation = 0;

  showScreen(screens.opening);
});


/* =========================================================
   SOUND TOGGLE
========================================================= */

soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;

  soundToggle.textContent = soundEnabled ? "♫" : "×";

  if (soundEnabled) {
    playTone(660, 0.1, "sine", 0.025);
  }
});


/* =========================================================
   SAFE HTML
========================================================= */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   INITIAL STATE
========================================================= */

showScreen(screens.opening);