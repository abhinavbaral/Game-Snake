const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");

const overlay = document.getElementById("overlay");
const restartBtn = document.getElementById("restartBtn");

const box = 20;

let snake, food;
let direction = null; // IMPORTANT: no movement until start
let gameStarted = false;
let gameOverState = false;

let score = 0;
let highScore = 0;

let speed = 120;
let lastTime = 0;

// ---------- RESIZE ----------
function resize() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;
    canvas.width = size;
    canvas.height = size;
    if (gameStarted) spawnFood();
}
window.addEventListener("resize", resize);
resize();

// ---------- GRID ----------
function cols() {
    return Math.floor(canvas.width / box);
}

function rows() {
    return Math.floor(canvas.height / box);
}

function rand(max) {
    return Math.floor(Math.random() * max) * box;
}

// ---------- INIT ----------
function init() {
    snake = [{ x: 0, y: 0 }];
    direction = null;
    gameStarted = false;
    gameOverState = false;

    score = 0;
    scoreEl.textContent = score;

    overlay.classList.add("hidden");

    spawnFood();
}

// ---------- FOOD ----------
function spawnFood() {
    let f;
    while (true) {
        f = {
            x: rand(cols()),
            y: rand(rows())
        };

        if (!snake.some(s => s.x === f.x && s.y === f.y)) break;
    }
    food = f;
}

// ---------- GAME OVER ----------
function gameOver() {
    gameOverState = true;

    overlay.classList.remove("hidden");

    if (score > highScore) {
        highScore = score;
        highScoreEl.textContent = highScore;
    }
}

// ---------- RESTART ----------
function restart() {
    init();
}

// ---------- INPUT ----------
document.addEventListener("keydown", (e) => {
    // start game on first input
    if (!gameStarted && !gameOverState) {
        gameStarted = true;
        direction = "RIGHT";
    }

    if (gameOverState) return;

    switch (e.key) {
        case "ArrowLeft":
            if (direction !== "RIGHT") direction = "LEFT";
            break;
        case "ArrowUp":
            if (direction !== "DOWN") direction = "UP";
            break;
        case "ArrowRight":
            if (direction !== "LEFT") direction = "RIGHT";
            break;
        case "ArrowDown":
            if (direction !== "UP") direction = "DOWN";
            break;
    }
});

restartBtn.addEventListener("click", restart);

// ---------- COLLISION ----------
function hitSelf(head) {
    return snake.some(s => s.x === head.x && s.y === head.y);
}

// ---------- UPDATE ----------
function update() {
    if (!direction) return;

    let x = snake[0].x;
    let y = snake[0].y;

    if (direction === "LEFT") x -= box;
    if (direction === "RIGHT") x += box;
    if (direction === "UP") y -= box;
    if (direction === "DOWN") y += box;

    const head = { x, y };

    // wall collision
    if (
        x < 0 ||
        y < 0 ||
        x >= canvas.width ||
        y >= canvas.height ||
        hitSelf(head)
    ) {
        gameOver();
        return;
    }

    // eat
    if (x === food.x && y === food.y) {
        score++;
        scoreEl.textContent = score;
        spawnFood();
    } else {
        snake.pop();
    }

    snake.unshift(head);
}

// ---------- DRAW ----------
function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // snake
    snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? "#fff" : "#00ff00";
        ctx.fillRect(s.x, s.y, box, box);
    });

    // food
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(food.x, food.y, box, box);
}

// ---------- LOOP ----------
function loop(t) {
    if (!lastTime) lastTime = t;

    const delta = t - lastTime;

    if (delta > speed) {
        if (gameStarted && !gameOverState) update();
        lastTime = t;
    }

    draw();
    requestAnimationFrame(loop);
}

// start
init();
requestAnimationFrame(loop);