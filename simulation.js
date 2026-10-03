const canvas = document.getElementById("walkCanvas");
const graphCanvas = document.getElementById("graphCanvas");

const ctx = canvas.getContext("2d");
const graphCtx = graphCanvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// ============================================================
// USER SETTINGS
// ============================================================

let numberOfWalkers = 15;
let sigma = 1.0;

const MAX_TIME = 60;

// ============================================================
// SIMULATION SETTINGS
// ============================================================

// Physics timestep.
// The simulation advances in these small increments.
const DT = 0.01;

// 1.0 means real-time.
// 2.0 would make it twice as fast.
const SPEED = 1.0;

// ============================================================
// DISPLAY SETTINGS
// ============================================================

const WORLD_SIZE = 15;

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
"#10b981",
"#38bdf8",
"#818cf8",
"#c084fc",
"#fb7185",
"#4ade80",
"#facc15",
"#2dd4bf",
"#60a5fa",
"#a78bfa",
"#fb923c",
"#f472b6",
"#34d399",
"#fbbf24",
"#22d3ee",
"#c084fc",
"#fb7185",
"#4ade80",
"#facc15",
"#2dd4bf",
"#60a5fa",
"#a78bfa",
"#fb923c",
"#f472b6",
"#34d399",
"#fbbf24",
"#22d3ee",
"#818cf8",
"#e879f9",
"#fb7185",
"#4ade80",
"#facc15",
"#2dd4bf",
"#60a5fa",
"#a78bfa"
];

// ============================================================
// SIMULATION STATE
// ============================================================

let walkers = [];

let simulationTime = 0;

let running = false;

let lastFrameTime = null;

let accumulatedTime = 0;

let history = [];

// ============================================================
// GAUSSIAN RANDOM NUMBER
// ============================================================

function gaussianRandom() {

```
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
```

}

// ============================================================
// CREATE WALKERS
// ============================================================

function createWalkers() {

```
walkers = [];

for (let i = 0; i < numberOfWalkers; i++) {

    walkers.push({
        x: 0,
        y: 0,
        trail: [
            {
                x: 0,
                y: 0
            }
        ]
    });
}
```

}

// ============================================================
// RESET
// ============================================================

function resetSimulation() {

```
running = false;

simulationTime = 0;

lastFrameTime = null;

accumulatedTime = 0;

history = [];

createWalkers();

draw();

updateDisplayedValues();
```

}

// ============================================================
// ONE PHYSICS STEP
// ============================================================

function physicsStep() {

```
/*
 * For a continuous Gaussian random walk:
 *
 * dx = sigma * sqrt(dt) * N(0,1)
 * dy = sigma * sqrt(dt) * N(0,1)
 *
 * Therefore:
 *
 * Var(x) = sigma^2 * t
 * Var(y) = sigma^2 * t
 */

const stepSize =
    sigma * Math.sqrt(DT);

let totalDistance = 0;

for (let i = 0; i < walkers.length; i++) {

    const walker = walkers[i];

    walker.x +=
        stepSize * gaussianRandom();

    walker.y +=
        stepSize * gaussianRandom();

    walker.trail.push({
        x: walker.x,
        y: walker.y
    });

    const distance =
        Math.sqrt(
            walker.x * walker.x
            +
            walker.y * walker.y
        );

    totalDistance += distance;
}

const meanDistance =
    totalDistance / walkers.length;

simulationTime += DT;

history.push({
    time: simulationTime,
    value: meanDistance
});
```

}

// ============================================================
// THEORETICAL EXPECTATION
// ============================================================

function theoreticalMeanDistance(t) {

```
/*
 * For a 2D Gaussian random walk:
 *
 * <r(t)> = sigma * sqrt(pi*t/2)
 */

return sigma *
    Math.sqrt(
        Math.PI * t / 2
    );
```

}

// ============================================================
// WORLD → CANVAS
// ============================================================

function worldToCanvas(x, y) {

```
const scale =
    WIDTH / (2 * WORLD_SIZE);

return {
    x: WIDTH / 2 + x * scale,
    y: HEIGHT / 2 - y * scale
};
```

}

// ============================================================
// DRAW WALKERS
// ============================================================

function drawWalkers() {

```
ctx.fillStyle = "#1f2937";

ctx.fillRect(
    0,
    0,
    WIDTH,
    HEIGHT
);


// Grid

ctx.strokeStyle = "#374151";
ctx.lineWidth = 1;

const gridSpacing = 50;

for (
    let x = 0;
    x <= WIDTH;
    x += gridSpacing
) {

    ctx.beginPath();

    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);

    ctx.stroke();
}

for (
    let y = 0;
    y <= HEIGHT;
    y += gridSpacing
) {

    ctx.beginPath();

    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);

    ctx.stroke();
}


// Axes

ctx.strokeStyle = "#9ca3af";
ctx.lineWidth = 1;

ctx.beginPath();

ctx.moveTo(
    WIDTH / 2,
    0
);

ctx.lineTo(
    WIDTH / 2,
    HEIGHT
);

ctx.moveTo(
    0,
    HEIGHT / 2
);

ctx.lineTo(
    WIDTH,
    HEIGHT / 2
);

ctx.stroke();


// Walker trails

for (let i = 0; i < walkers.length; i++) {

    const walker = walkers[i];

    if (walker.trail.length < 2) {
        continue;
    }

    ctx.strokeStyle =
        colors[i % colors.length];

    ctx.lineWidth = 1.2;

    ctx.globalAlpha = 0.55;

    ctx.beginPath();

    for (
        let j = 0;
        j < walker.trail.length;
        j++
    ) {

        const point =
            worldToCanvas(
                walker.trail[j].x,
                walker.trail[j].y
            );

        if (j === 0) {

            ctx.moveTo(
                point.x,
                point.y
            );

        } else {

            ctx.lineTo(
                point.x,
                point.y
            );
        }
    }

    ctx.stroke();

    ctx.globalAlpha = 1;
}


// Origin

const origin =
    worldToCanvas(0, 0);

ctx.strokeStyle = "white";
ctx.lineWidth = 2;

ctx.beginPath();

ctx.moveTo(
    origin.x - 7,
    origin.y
);

ctx.lineTo(
    origin.x + 7,
    origin.y
);

ctx.moveTo(
    origin.x,
    origin.y - 7
);

ctx.lineTo(
    origin.x,
    origin.y + 7
);

ctx.stroke();


// Current walker positions

for (let i = 0; i < walkers.length; i++) {

    const point =
        worldToCanvas(
            walkers[i].x,
            walkers[i].y
        );

    ctx.fillStyle =
        colors[i % colors.length];

    ctx.beginPath();

    ctx.arc(
        point.x,
        point.y,
        3,
        0,
        2 * Math.PI
    );

    ctx.fill();
}


// Labels

ctx.fillStyle = "#d1d5db";
ctx.font = "14px Arial";

ctx.fillText(
    "y",
    WIDTH / 2 + 8,
    20
);

ctx.fillText(
    "x",
    WIDTH - 20,
    HEIGHT / 2 - 8
);
```

}

// ============================================================
// DRAW GRAPH
// ============================================================

function drawGraph() {

```
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
graphCtx.lineWidth = 1;

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


const maxDistance =
    theoreticalMeanDistance(MAX_TIME)
    * 1.15;


// Theoretical curve

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
        (px / graphWidth)
        * MAX_TIME;

    const value =
        theoreticalMeanDistance(t);

    const x =
        margin + px;

    const y =
        HEIGHT - margin
        -
        (value / maxDistance)
        * graphHeight;

    if (px === 0) {

        graphCtx.moveTo(x, y);

    } else {

        graphCtx.lineTo(x, y);
    }
}

graphCtx.stroke();

graphCtx.setLineDash([]);


// Simulation curve

if (history.length > 0) {

    graphCtx.strokeStyle = "#60a5fa";
    graphCtx.lineWidth = 2;

    graphCtx.beginPath();

    for (let i = 0; i < history.length; i++) {

        const point = history[i];

        const x =
            margin
            +
            (point.time / MAX_TIME)
            * graphWidth;

        const y =
            HEIGHT - margin
            -
            (point.value / maxDistance)
            * graphHeight;

        if (i === 0) {

            graphCtx.moveTo(x, y);

        } else {

            graphCtx.lineTo(x, y);
        }
    }

    graphCtx.stroke();
}


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
```

}

// ============================================================
// DRAW EVERYTHING
// ============================================================

function draw() {

```
drawWalkers();

drawGraph();

updateDisplayedValues();
```

}

// ============================================================
// UPDATE TEXT
// ============================================================

function updateDisplayedValues() {

```
document.getElementById(
    "timeDisplay"
).textContent =
    simulationTime.toFixed(2);

let mean = 0;

if (history.length > 0) {

    mean =
        history[history.length - 1].value;
}

document.getElementById(
    "meanDisplay"
).textContent =
    mean.toFixed(3);
```

}

// ============================================================
// ANIMATION LOOP
// ============================================================

function animationLoop(timestamp) {

```
if (!running) {
    return;
}


if (lastFrameTime === null) {

    lastFrameTime = timestamp;

} else {

    /*
     * Real elapsed time in seconds.
     */

    const elapsed =
        (timestamp - lastFrameTime)
        / 1000;

    lastFrameTime = timestamp;


    /*
     * Add real elapsed time to the simulation clock.
     */

    accumulatedTime +=
        elapsed * SPEED;


    /*
     * Run physics steps until the simulation
     * catches up with real time.
     */

    while (
        accumulatedTime >= DT
        &&
        simulationTime < MAX_TIME
    ) {

        physicsStep();

        accumulatedTime -= DT;
    }
}


draw();


if (simulationTime >= MAX_TIME) {

    running = false;

    return;
}


requestAnimationFrame(animationLoop);
```

}

// ============================================================
// START BUTTON
// ============================================================

document
.getElementById("startButton")
.addEventListener("click", () => {

```
    if (simulationTime >= MAX_TIME) {

        resetSimulation();
    }

    if (!running) {

        running = true;

        lastFrameTime = null;

        requestAnimationFrame(
            animationLoop
        );
    }
});
```

// ============================================================
// PAUSE BUTTON
// ============================================================

document
.getElementById("pauseButton")
.addEventListener("click", () => {

```
    running = false;

    lastFrameTime = null;
});
```

// ============================================================
// RESET BUTTON
// ============================================================

document
.getElementById("resetButton")
.addEventListener("click", () => {

```
    resetSimulation();
});
```

// ============================================================
// WALKER SLIDER
// ============================================================

const walkerSlider =
document.getElementById("walkerSlider");

const walkerValue =
document.getElementById("walkerValue");

walkerSlider.value =
numberOfWalkers;

walkerValue.textContent =
numberOfWalkers;

walkerSlider.addEventListener(
"input",
() => {

```
    numberOfWalkers =
        Number(walkerSlider.value);

    walkerValue.textContent =
        numberOfWalkers;
}
```

);

walkerSlider.addEventListener(
"change",
() => {

```
    resetSimulation();
}
```

);

// ============================================================
// SIGMA SLIDER
// ============================================================

const sigmaSlider =
document.getElementById("sigmaSlider");

const sigmaValue =
document.getElementById("sigmaValue");

sigmaSlider.value =
sigma;

sigmaValue.textContent =
sigma.toFixed(1);

sigmaSlider.addEventListener(
"input",
() => {

```
    sigma =
        Number(sigmaSlider.value);

    sigmaValue.textContent =
        sigma.toFixed(1);

    draw();
}
```

);

sigmaSlider.addEventListener(
"change",
() => {

```
    resetSimulation();
}
```

);

// ============================================================
// INITIALIZE
// ============================================================

resetSimulation();
