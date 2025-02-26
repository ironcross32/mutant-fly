// Class definitions

class Map {
  constructor() {
    this.tiles = []; //holds all the tiles
  }

  get_tile_at(x) {
    if (x < this.tiles.length) {
      return this.tiles[x];
    } else {
      return "";
    }
  }

  add_platform(min_x, max_x, type) {
    for (let i = min_x; i <= max_x; i++) {
      this.tiles.push(type);
    }
  }

  clear_platform() {
    this.tiles = []; //use this to clear the platform. Maybe when the game is over?
  }
}

class Timer {
  constructor() {
    this.startTime = new Date().getTime();
    this.endTime;
    this.elapsed;
    this.paused = false;
  }

  update() {
    if (!this.paused) {
      this.endTime = new Date().getTime();
      this.elapsed = this.endTime - this.startTime;
    }
  }

  restart() {
    this.startTime = new Date().getTime();
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }
}

class GameObject {
  constructor(x) {
    this.x = x;
  }
}

class Player extends GameObject {
  constructor(x) {
    super(x);
    this.moveTime = 680;
    this.score = 0;
  }

  getInitialSpeed() {
    const speed_index = difficultyScalar().length - 1;
    this.moveTime = difficultyScalar()[speed_index];
  }
}

class Fly extends GameObject {
  constructor(x) {
    super(x);
    this.spawned = true;
  }
}

// Function definitions

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const collide = (obj1, obj2) => obj1.x === obj2.x;

function focusGameArea() {
  return gameArea.focus();
}

function handleScoreInterval() {
  if (!speakScoreCheckbox.checked) {
    speakScoreIntervalLabel.style.display = "none";
    speakScoreIntervalInput.style.display = "none";
  } else {
    speakScoreIntervalLabel.style.display = "block";
    speakScoreIntervalInput.style.display = "block";
  }
}

function render_message(msg) {
  const lr = "alerts";
  document.getElementById(lr).innerHTML = "";
  document.getElementById(lr).textContent = msg;
}

function showResults(text) {
  const gameOverDialog = document.getElementById("game-over");
  const contents = document.getElementById("content");
  const btnPlayAgain = document.getElementById("btn-play-again");
  const btnStartOver = document.getElementById("btn-start-new");
  contents.innerHTML = "";
  contents.innerHTML = text;
  gameOverDialog.showModal();
  btnPlayAgain.addEventListener("click", (e) => {
    gameOverDialog.close();
    resetGame();
  });
  btnStartOver.addEventListener("click", (e) => {
    location.reload();
  });
}

function resetGame() {
  gameOver = false;
  fly.x = random(5, 15);
  person.x = 0;
  person.getInitialSpeed();
  person.score = 0;
  timer.resume();
  frameId = requestAnimationFrame(gameLoop);
}

function isGameOver() {
  if (collide(person, fly)) {
    showResults(
      `Game over. You managed to scare the fly away ${person.score} times on difficulty level ${difficulty}.\nClicking \"Play again\" will start a new game with the same settings while clicking "Start over" will reload the page, allowing you to configure the game again.`
    );
    cancelAnimationFrame(frameId);
    timer.pause();
    gameOver = true;
    render_message("");
  }
  if (person.x === fly.x - 2) {
    play_sound("./close.mp3");
  }
}

function difficultyScalar() {
  let moveTimeMin = 5,
    moveTimeMax = 10,
    flyMinX = 5,
    flyMaxX = 20,
    startMoveSpeed = 680;

  switch (difficulty) {
    case "Medium":
      moveTimeMin *= 2;
      moveTimeMax *= 4;
      flyMinX -= 1;
      flyMaxX = Math.floor(flyMaxX * 1.75);
      startMoveSpeed = 480;
      break;
    case "Hard":
      moveTimeMin *= 6;
      moveTimeMax = 8;
      flyMinX -= 2;
      flyMaxX = Math.floor(flyMaxX * 2.5);
      startMoveSpeed = 340;
      break;
    default:
      moveTimeMin *= 1;
      moveTimeMax *= 1;
      flyMinX *= 1;
      flyMaxX *= 1;
      startMoveSpeed *= 1;
  }

  return [moveTimeMin, moveTimeMax, flyMinX, flyMaxX, startMoveSpeed];
}

function gameLoop() {
  timer.update();
  if (!gameOver) {
    if (timer.elapsed >= person.moveTime) {
      person.x += 1;
      isGameOver();
      play_sound(`./${m.get_tile_at(person.x)}${random(1,5)}.mp3`)
      timer.restart();
    }
  }
  frameId = requestAnimationFrame(gameLoop);
}

function play_sound(path) {
  var aud = new Audio();
  aud.src = path;
  aud.currentTime = 0;
  audioElements.push(aud);
  aud.play().then(function() {
    // Remove the audio element from the array once it has finished playing
    audioElements.splice(audioElements.indexOf(aud), 1);
  }).catch(function(error) {
    console.error('Failed to play sound:', error);
    // Remove the audio element from the array if there's an error
    audioElements.splice(audioElements.indexOf(aud), 1);
  });
}

//Constant and variable declarations

let audioElements=[]; //This will be a list of audio objects.
const gameArea = document.getElementById("area");
const start = document.getElementById("start");
const btnStart = document.getElementById("btn-start");

let frameId;
let difficulty;
let speakScoreInterval;
const difficultyInput = document.getElementById("difficulty-input");
const speakScoreIntervalLabel = document.getElementById(
  "speak-score-interval-label"
);
const speakScoreIntervalInput = document.getElementById(
  "speak-score-interval-input"
);
const speakScoreCheckbox = document.getElementById("speak-score-checkbox");
let timer = new Timer();
const person = new Player(0);
const fly = new Fly(random(7, 20));
let gameOver = false;
const m = new Map();
m.add_platform(0, 10000, "step");

// Start game

gameArea.addEventListener("click", (e) => {
  let [moveTimeMin, moveTimeMax, flyMinX, flyMaxX] = difficultyScalar();
  speakScoreInterval = Number(speakScoreIntervalInput.value) || 5;

  if (fly.x - person.x <= 2) {
    play_sound("./jump.mp3");
    fly.x += random(flyMinX, flyMaxX);
    person.score += 1;
    if (speakScoreCheckbox.checked && person.score % speakScoreInterval === 0) {
      render_message(`Score: ${person.score}`);
    }
    person.moveTime -= random(moveTimeMin, moveTimeMax);
  } else {
    play_sound("./buzz.mp3");
  }
});

start.showModal();
gameOver = true;
btnStart.addEventListener("click", (e) => {
  difficulty = String(difficultyInput.value);
  person.getInitialSpeed();
  play_sound("./jump.mp3");
  gameOver = false;
  setTimeout(focusGameArea, 50);
  start.close();
});
frameId = requestAnimationFrame(gameLoop);
