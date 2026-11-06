// Ajustes de cada dificuldade. O "normal" é o jogo como era antes.
const DIFFICULTIES = {
  facil: {
    label: "Fácil",
    startTime: 60,
    startLives: 5,
    startVelocity: 1200,
    minVelocity: 600,
    speedUpEvery: 5,
    speedUpStep: 40,
  },
  normal: {
    label: "Normal",
    startTime: 60,
    startLives: 3,
    startVelocity: 1000,
    minVelocity: 400,
    speedUpEvery: 5,
    speedUpStep: 50,
  },
  dificil: {
    label: "Difícil",
    startTime: 45,
    startLives: 2,
    startVelocity: 800,
    minVelocity: 300,
    speedUpEvery: 3,
    speedUpStep: 50,
  },
};

const state = {
  view: {
    squares: document.querySelectorAll(".square"),
    timeLeft: document.querySelector("#time-left"),
    score: document.querySelector("#score"),
    bestScore: document.querySelector("#best-score"),
    lives: document.querySelector("#lives"),
    overlay: document.querySelector("#overlay"),
    overlayTitle: document.querySelector("#overlay-title"),
    overlayText: document.querySelector("#overlay-text"),
    startButton: document.querySelector("#start-button"),
    pauseButton: document.querySelector("#pause-button"),
    difficulty: document.querySelector("#difficulty"),
    difficultyButtons: document.querySelectorAll(".difficulty-btn"),
    difficultyInfo: document.querySelector("#difficulty-info"),
  },
  values: {
    gameVelocity: 1000,
    hitPosition: null, // id do quadrado do Ralph enquanto ele ainda não foi acertado
    enemyPosition: null, // id do quadrado onde o Ralph está agora
    result: 0,
    currentTime: 60,
    lives: 3,
    bestScore: 0,
    level: "normal",
    running: false,
    paused: false,
  },
  config: { ...DIFFICULTIES.normal },
  actions: {
    timerId: null,
    countDownTimerId: null,
  },
};

const hitAudio = new Audio("./src/audios/hit.m4a");
hitAudio.volume = 0.2;

/* ---------- recorde (localStorage), um por dificuldade ---------- */

function bestKey(level) {
  return `detona-ralph:best:${level}`;
}

function loadBestScore(level) {
  try {
    let saved = localStorage.getItem(bestKey(level));
    // recorde guardado pela versão anterior (só existia o modo normal)
    if (saved === null && level === "normal") {
      saved = localStorage.getItem("detona-ralph:best");
    }
    return Number(saved) || 0;
  } catch {
    return 0; // localStorage pode estar bloqueado
  }
}

function saveBestScore(level, value) {
  try {
    localStorage.setItem(bestKey(level), String(value));
  } catch {
    /* sem problema: o recorde só não será guardado */
  }
}

/* ---------- tela ---------- */

function playSound() {
  hitAudio.currentTime = 0;
  hitAudio.play().catch(() => {});
}

function flash(square, className) {
  square.classList.remove("hit", "miss");
  void square.offsetWidth; // reinicia a animação se clicar rápido
  square.classList.add(className);
}

function updateHud() {
  state.view.timeLeft.textContent = state.values.currentTime;
  state.view.score.textContent = state.values.result;
  state.view.bestScore.textContent = state.values.bestScore;
  state.view.lives.textContent = `x${state.values.lives}`;
}

function showOverlay({ title, text, buttonLabel, showDifficulty }) {
  state.view.overlayTitle.textContent = title;
  state.view.overlayText.textContent = text;
  state.view.startButton.textContent = buttonLabel;
  state.view.difficulty.classList.toggle("hidden", !showDifficulty);
  state.view.overlay.classList.remove("hidden");
  state.view.startButton.focus();
}

function hideOverlay() {
  state.view.overlay.classList.add("hidden");
}

/* ---------- dificuldade ---------- */

function selectDifficulty(level) {
  state.values.level = level;
  state.config = { ...DIFFICULTIES[level] };

  state.view.difficultyButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.level === level));
  });

  const { startTime, startLives } = state.config;
  state.view.difficultyInfo.textContent = `${startTime}s e ${startLives} vidas`;

  // mostra o recorde e as vidas/tempo da dificuldade escolhida
  state.values.bestScore = loadBestScore(level);
  state.values.currentTime = startTime;
  state.values.lives = startLives;
  state.values.result = 0;
  updateHud();
}

/* ---------- lógica do jogo ---------- */

function randomSquare() {
  const { squares } = state.view;
  squares.forEach((square) => square.classList.remove("enemy"));

  // sorteia um quadrado diferente do anterior
  let randomSquare;
  do {
    randomSquare = squares[Math.floor(Math.random() * squares.length)];
  } while (randomSquare.id === state.values.enemyPosition);

  randomSquare.classList.add("enemy");
  state.values.enemyPosition = randomSquare.id;
  state.values.hitPosition = randomSquare.id;
}

// usa setTimeout em vez de setInterval para a velocidade poder mudar durante o jogo
function scheduleNextSquare() {
  state.actions.timerId = setTimeout(() => {
    randomSquare();
    scheduleNextSquare();
  }, state.values.gameVelocity);
}

function startTimers() {
  scheduleNextSquare();
  state.actions.countDownTimerId = setInterval(countDown, 1000);
}

function stopTimers() {
  clearTimeout(state.actions.timerId);
  clearInterval(state.actions.countDownTimerId);
}

function countDown() {
  state.values.currentTime--;
  state.view.timeLeft.textContent = state.values.currentTime;

  if (state.values.currentTime <= 0) {
    endGame("Tempo esgotado!");
  }
}

function speedUp() {
  const { result } = state.values;
  const { speedUpEvery, speedUpStep, minVelocity } = state.config;

  if (result > 0 && result % speedUpEvery === 0) {
    state.values.gameVelocity = Math.max(
      minVelocity,
      state.values.gameVelocity - speedUpStep
    );
  }
}

function handleHit(square) {
  state.values.result++;
  state.values.hitPosition = null; // evita pontuar duas vezes no mesmo Ralph
  state.view.score.textContent = state.values.result;
  flash(square, "hit");
  playSound();
  speedUp();
}

function handleMiss(square) {
  state.values.lives--;
  state.view.lives.textContent = `x${state.values.lives}`;
  flash(square, "miss");

  if (state.values.lives <= 0) {
    endGame("Acabaram as vidas!");
  }
}

function addListenerHitBox() {
  state.view.squares.forEach((square) => {
    // pointerdown funciona com mouse e com toque
    square.addEventListener("pointerdown", () => {
      if (!state.values.running) return; // também ignora cliques durante a pausa

      if (square.id === state.values.hitPosition) {
        handleHit(square);
      } else if (square.id !== state.values.enemyPosition) {
        // errou o quadrado; clicar de novo no Ralph já acertado não pune
        handleMiss(square);
      }
    });
  });
}

/* ---------- pausa ---------- */

function pauseGame() {
  if (!state.values.running) return;

  state.values.running = false;
  state.values.paused = true;
  stopTimers();
  state.view.pauseButton.textContent = "Continuar (P)";

  showOverlay({
    title: "Pausado",
    text: "O tempo está parado. Clique em Continuar para voltar.",
    buttonLabel: "Continuar",
    showDifficulty: false,
  });
}

function resumeGame() {
  if (!state.values.paused) return;

  state.values.paused = false;
  state.values.running = true;
  state.view.pauseButton.textContent = "Pausar (P)";
  hideOverlay();
  startTimers();
}

function togglePause() {
  if (state.values.running) {
    pauseGame();
  } else if (state.values.paused) {
    resumeGame();
  }
}

/* ---------- início e fim ---------- */

function endGame(reason) {
  state.values.running = false;
  state.values.paused = false;
  stopTimers();
  state.view.pauseButton.disabled = true;
  state.view.pauseButton.textContent = "Pausar (P)";

  const { result, bestScore, level } = state.values;
  let message = `${reason} O seu resultado foi: ${result}`;

  if (result > bestScore) {
    state.values.bestScore = result;
    saveBestScore(level, result);
    message += ". Novo recorde!";
  }

  updateHud();
  showOverlay({
    title: "Game Over",
    text: message,
    buttonLabel: "Jogar de novo",
    showDifficulty: true,
  });
}

function startGame() {
  stopTimers();

  state.values.gameVelocity = state.config.startVelocity;
  state.values.currentTime = state.config.startTime;
  state.values.lives = state.config.startLives;
  state.values.result = 0;
  state.values.hitPosition = null;
  state.values.enemyPosition = null;
  state.values.running = true;
  state.values.paused = false;
  state.view.pauseButton.disabled = false;

  updateHud();
  hideOverlay();

  randomSquare();
  startTimers();
}

// o botão do overlay serve para começar, recomeçar ou continuar
function handleOverlayButton() {
  if (state.values.paused) {
    resumeGame();
  } else {
    startGame();
  }
}

function initialize() {
  state.view.squares.forEach((square) => square.classList.remove("enemy"));
  addListenerHitBox();

  state.view.difficultyButtons.forEach((button) => {
    button.addEventListener("click", () => selectDifficulty(button.dataset.level));
  });
  state.view.startButton.addEventListener("click", handleOverlayButton);
  state.view.pauseButton.addEventListener("click", togglePause);

  document.addEventListener("keydown", (event) => {
    if (event.key === "p" || event.key === "P") togglePause();
  });

  // pausa sozinho se a pessoa trocar de aba
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseGame();
  });

  selectDifficulty("normal");
  state.view.startButton.focus();
}

initialize();
