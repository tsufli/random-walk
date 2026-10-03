const walkCanvas = document.getElementById("walkCanvas");
const graphCanvas = document.getElementById("graphCanvas");

const walkCtx = walkCanvas.getContext("2d");
const graphCtx = graphCanvas.getContext("2d");

const WIDTH = walkCanvas.width;
const HEIGHT = walkCanvas.height;

// ============================================================
// SETTINGS
// ============================================================

let N_WALKERS = 15;
let SIGMA = 1.0;

const MAX_TIME = 60;
const DT = 0.02;

// ============================================================
// STATE
// ============================================================

let positions = [];
let trails = [];
let meanDistances = [];

let simulationTime = 0;
let running = false;

let lastTime = null;
let physicsAccumulator = 0;

// ============================================================
// COLORS
// ============================================================

const colors = [
"#ef4444",
"#f97316",
"#eab308",
"#22c55e",
"#14b8a6",
"#06b6d4",
"#3b82f6",
"#6366f1",
"#8b5cf6",
"#a855f7",
"#d946ef",
"#ec4899",
"#f43f5e",
"#84cc16",
"#10b981"
];

// ============================================================
// GAUSSIAN RANDOM NUMBER
// ============================================================

function gaussianRandom() {

let u = 0;
let v = 0;

while (u === 0) {
    u = Math.random();
}

while (v === 0) {
    v = Math.random();
}

return Math.sqrt(-2 * Math.log(u))
    * Math.cos(2 * Math.PI * v);


}

// ============================================================
// RESET
// ============================================================

function resetSimulation() {


running = false;

simulationTime = 0;
lastTime = null;
physicsAccumulator = 0;

positions = [];
trails = [];
meanDistances = [];

for (let i = 0; i < N_WALKERS; i++) {

    positions.push({
        x: 0,
        y: 0
    });

    trails.push([
        {
            x: 0,
            y: 0
        }
    ]);
}

draw();


}

// ============================================================
// ONE PHYSICS STEP
// ============================================================

function physicsStep() {


const stepSize =
    SIGMA * Math.sqrt(DT);

let totalDistance = 0;

for (let i = 0; i < N_WALKERS; i++) {

    positions[i].x +=
        stepSize * gaussianRandom();

    positions[i].y +=
        stepSize * gaussianRandom();

    trails[i].push({
        x: positions[i].x,
        y: positions[i].y
    });

    const distance =
        Math.sqrt(
            positions[i].x ** 2 +
            positions[i].y ** 2
        );

    totalDistance += distance;
}

meanDistances.push(
    totalDistance / N_WALKERS
);


}

// ============================================================
// THEORETICAL EXPECTATION
// ============================================================

function theoreticalDistance(t) {


return SIGMA *
    Math.sqrt(
        Math.PI * t / 2
    );


}

// ============================================================
// WORLD COORDINATES
// ============================================================

const WORLD_SIZE = 15;

function worldToCanvas(x, y) {


const scale =
    WIDTH / (2 * WORLD_SIZE);

return {
    x: WIDTH / 2 + x * scale,
    y: HEIGHT / 2 - y * scale
};


}

// ============================================================
// DRAW WALKERS
// ============================================================

function drawWalkers() {

 
walkCtx.fillStyle = "#1f2937";

walkCtx.fillRect(
    0,
    0,
    WIDTH,
    HEIGHT
);


// Grid

walkCtx.strokeStyle = "#374151";
walkCtx.lineWidth = 1;

for (
    let x = 0;
    x <= WIDTH;
    x += 50
) {

    walkCtx.beginPath();

    walkCtx.moveTo(x, 0);
    walkCtx.lineTo(x, HEIGHT);

    walkCtx.stroke();
}

for (
    let y = 0;
    y <= HEIGHT;
    y += 50
) {

    walkCtx.beginPath();

    walkCtx.moveTo(0, y);
    walkCtx.lineTo(WIDTH, y);

    walkCtx.stroke();
}


// Axes

walkCtx.strokeStyle = "#9ca3af";

walkCtx.beginPath();

walkCtx.moveTo(
    WIDTH / 2,
    0
);

walkCtx.lineTo(
    WIDTH / 2,
    HEIGHT
);

walkCtx.moveTo(
    0,
    HEIGHT / 2
);

walkCtx.lineTo(
    WIDTH,
    HEIGHT / 2
);

walkCtx.stroke();


// Trails

for (let i = 0; i < N_WALKERS; i++) {

    if (trails[i].length < 2) {
        continue;
    }

    walkCtx.strokeStyle =
        colors[i % colors.length];

    walkCtx.lineWidth = 1.2;
    walkCtx.globalAlpha = 0.5;

    walkCtx.beginPath();

    for (
        let j = 0;
        j < trails[i].length;
        j++
    ) {

        const point =
            worldToCanvas(
                trails[i][j].x,
                trails[i][j].y
            );

        if (j === 0) {

            walkCtx.moveTo(
                point.x,
                point.y
            );

        } else {

            walkCtx.lineTo(
                point.x,
                point.y
            );
        }
    }

    walkCtx.stroke();

    walkCtx.globalAlpha = 1;
}


// Current positions

for (let i = 0; i < N_WALKERS; i++) {

    const point =
        worldToCanvas(
            positions[i].x,
            positions[i].y
        );

    walkCtx.fillStyle =
        colors[i % colors.length];

    walkCtx.beginPath();

    walkCtx.arc(
        point.x,
        point.y,
        3,
        0,
        2 * Math.PI
    );

    walkCtx.fill();
}


// Origin

const origin =
    worldToCanvas(0, 0);

walkCtx.strokeStyle = "white";
walkCtx.lineWidth = 2;

walkCtx.beginPath();

walkCtx.moveTo(
    origin.x - 7,
    origin.y
);

walkCtx.lineTo(
    origin.x + 7,
    origin.y
);

walkCtx.moveTo(
    origin.x,
    origin.y - 7
);

walkCtx.lineTo(
    origin.x,
    origin.y + 7
);

walkCtx.stroke();
 

}

// ============================================================
// DRAW GRAPH
// ============================================================

function drawGraph() {

 
graphCtx.fillStyle = "#1f2937";

graphCtx.fillRect(
    0,
    0,
    WIDTH,
    HEIGHT
);


const margin = 60;

const graphWidth =
    WIDTH - 2 * margin;

const graphHeight =
    HEIGHT - 2 * margin;


// Axes

graphCtx.strokeStyle = "#9ca3af";

graphCtx.beginPath();

graphCtx.moveTo(
    margin,
    HEIGHT - margin
);

graphCtx.lineTo(
    WIDTH - margin,
    HEIGHT - margin
);

graphCtx.moveTo(
    margin,
    margin
);

graphCtx.lineTo(
    margin,
    HEIGHT - margin
);

graphCtx.stroke();


const maxDistance =
    theoreticalDistance(MAX_TIME) * 1.15;


// Theory

graphCtx.strokeStyle = "#ef4444";
graphCtx.lineWidth = 2;
graphCtx.setLineDash([6, 6]);

graphCtx.beginPath();

for (
    let px = 0;
    px <= graphWidth;
    px += 2
) {

    const t =
        px / graphWidth * MAX_TIME;

    const value =
        theoreticalDistance(t);

    const x =
        margin + px;

    const y =
        HEIGHT - margin
        -
        value / maxDistance
        * graphHeight;

    if (px === 0) {

        graphCtx.moveTo(x, y);

    } else {

        graphCtx.lineTo(x, y);
    }
}

graphCtx.stroke();

graphCtx.setLineDash([]);


// Simulation

if (meanDistances.length > 1) {

    graphCtx.strokeStyle = "#60a5fa";
    graphCtx.lineWidth = 2;

    graphCtx.beginPath();

    for (
        let i = 0;
        i < meanDistances.length;
        i++
    ) {

        const t =
            i * DT;

        const x =
            margin
            +
            t / MAX_TIME
            * graphWidth;

        const y =
            HEIGHT - margin
            -
            meanDistances[i] / maxDistance
            * graphHeight;

        if (i === 0) {

            graphCtx.moveTo(x, y);

        } else {

            graphCtx.lineTo(x, y);
        }
    }

    graphCtx.stroke();
}


// Labels

graphCtx.fillStyle = "#f9fafb";
graphCtx.font = "16px Arial";

graphCtx.fillText(
    "Mean distance",
    margin,
    30
);

graphCtx.fillText(
    "Time (s)",
    WIDTH - margin - 55,
    HEIGHT - 20
);


// Legend

graphCtx.fillStyle = "#60a5fa";

graphCtx.fillRect(
    margin,
    HEIGHT - 25,
    25,
    3
);

graphCtx.fillStyle = "#d1d5db";

graphCtx.fillText(
    "Simulation",
    margin + 35,
    HEIGHT - 20
);


graphCtx.strokeStyle = "#ef4444";
graphCtx.setLineDash([6, 6]);

graphCtx.beginPath();

graphCtx.moveTo(
    margin + 150,
    HEIGHT - 23
);

graphCtx.lineTo(
    margin + 175,
    HEIGHT - 23
);

graphCtx.stroke();

graphCtx.setLineDash([]);

graphCtx.fillStyle = "#d1d5db";

graphCtx.fillText(
    "Theory",
    margin + 185,
    HEIGHT - 20
);
 

}

// ============================================================
// DRAW
// ============================================================

function draw() {

 
drawWalkers();

drawGraph();

const mean =
    meanDistances.length > 0
    ? meanDistances[
        meanDistances.length - 1
    ]
    : 0;

document.getElementById(
    "timeDisplay"
).textContent =
    simulationTime.toFixed(2);

document.getElementById(
    "meanDisplay"
).textContent =
    mean.toFixed(3);
 

}

// ============================================================
// ANIMATION
// ============================================================

function animate(timestamp) {

 
if (!running) {
    return;
}


if (lastTime === null) {

    lastTime = timestamp;

} else {

    /*
     * Actual wall-clock time.
     *
     * If one real second passes,
     * simulationTime increases by one second.
     */

    const elapsed =
        (timestamp - lastTime) / 1000;

    lastTime = timestamp;

    physicsAccumulator += elapsed;


    while (
        physicsAccumulator >= DT &&
        simulationTime < MAX_TIME
    ) {

        physicsStep();

        simulationTime += DT;

        physicsAccumulator -= DT;
    }
}


draw();


if (simulationTime >= MAX_TIME) {

    running = false;

    return;
}


requestAnimationFrame(animate);
 

}

// ============================================================
// START
// ============================================================

document
.getElementById("startButton")
.addEventListener(
"click",
function () {

 
        if (simulationTime >= MAX_TIME) {

            resetSimulation();
        }

        if (!running) {

            running = true;

            lastTime = null;

            requestAnimationFrame(
                animate
            );
        }
    }
);
 

// ============================================================
// PAUSE
// ============================================================

document
.getElementById("pauseButton")
.addEventListener(
"click",
function () {

 
        running = false;

        lastTime = null;
    }
);
 

// ============================================================
// RESET
// ============================================================

document
.getElementById("resetButton")
.addEventListener(
"click",
function () {

 
        resetSimulation();
    }
);
 

// ============================================================
// WALKER SLIDER
// ============================================================

const walkerSlider =
document.getElementById(
"walkerSlider"
);

const walkerValue =
document.getElementById(
"walkerValue"
);

walkerSlider.addEventListener(
"input",
function () {

 
    N_WALKERS =
        Number(this.value);

    walkerValue.textContent =
        N_WALKERS;

    resetSimulation();
}
 

);

// ============================================================
// SIGMA SLIDER
// ============================================================

const sigmaSlider =
document.getElementById(
"sigmaSlider"
);

const sigmaValue =
document.getElementById(
"sigmaValue"
);

sigmaSlider.addEventListener(
"input",
function () {

 
    SIGMA =
        Number(this.value);

    sigmaValue.textContent =
        SIGMA.toFixed(1);

    resetSimulation();
}
 

);

// ============================================================
// INITIALIZE
// ============================================================

walkerValue.textContent =
N_WALKERS;

sigmaValue.textContent =
SIGMA.toFixed(1);

resetSimulation();
alert("simulation.js reached the end");
