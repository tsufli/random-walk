const walkCanvas = document.getElementById("walkCanvas");
const graphCanvas = document.getElementById("graphCanvas");

const walkCtx = walkCanvas.getContext("2d");
const graphCtx = graphCanvas.getContext("2d");

const WIDTH = walkCanvas.width;
const HEIGHT = walkCanvas.height;

// ============================================================
// SIMULATION PARAMETERS
// ============================================================

let N_WALKERS = 15;
let SIGMA = 1.0;

// One simulation second corresponds to one real second.
const MAX_TIME = 60;

// Size of the visible world.
const WORLD_SIZE = 15;

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
"#818cf8",
"#e879f9",
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
"#fb923c"
];

// ============================================================
// SIMULATION STATE
// ============================================================

let positions = [];
let trails = [];

let meanDistances = [];

let running = false;

let simulationTime = 0;
let lastTimestamp = null;

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
// RESET
// ============================================================

function resetSimulation() {

```
running = false;

simulationTime = 0;
lastTimestamp = null;

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
```

}

// ============================================================
// ADVANCE THE SIMULATION
// ============================================================

function advanceSimulation(dt) {

```
if (dt <= 0) {
    return;
}

/*
 * For a continuous Gaussian random walk:
 *
 * dx ~ N(0, sigma^2 dt)
 * dy ~ N(0, sigma^2 dt)
 *
 * Therefore:
 *
 * dx = sigma * sqrt(dt) * Gaussian
 */

for (let i = 0; i < N_WALKERS; i++) {

    const dx =
        SIGMA *
        Math.sqrt(dt) *
        gaussianRandom();

    const dy =
        SIGMA *
        Math.sqrt(dt) *
        gaussianRandom();

    positions[i].x += dx;
    positions[i].y += dy;

    trails[i].push({
        x: positions[i].x,
        y: positions[i].y
    });
}

simulationTime += dt;

calculateMeanDistance();
```

}

// ============================================================
// CALCULATE MEAN DISTANCE
// ============================================================

function calculateMeanDistance() {

```
let totalDistance = 0;

for (let i = 0; i < N_WALKERS; i++) {

    const x = positions[i].x;
    const y = positions[i].y;

    totalDistance +=
        Math.sqrt(x * x + y * y);
}

const mean =
    totalDistance / N_WALKERS;

meanDistances.push({
    time: simulationTime,
    value: mean
});
```

}

// ============================================================
// COORDINATE TRANSFORMATION
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

const gridSpacing = 50;

for (
    let x = 0;
    x <= WIDTH;
    x += gridSpacing
) {

    walkCtx.beginPath();
    walkCtx.moveTo(x, 0);
    walkCtx.lineTo(x, HEIGHT);
    walkCtx.stroke();
}

for (
    let y = 0;
    y <= HEIGHT;
    y += gridSpacing
) {

    walkCtx.beginPath();
    walkCtx.moveTo(0, y);
    walkCtx.lineTo(WIDTH, y);
    walkCtx.stroke();
}


// Axes

walkCtx.strokeStyle = "#9ca3af";
walkCtx.lineWidth = 1;

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

    const trail = trails[i];

    if (trail.length < 2) {
        continue;
    }

    walkCtx.strokeStyle =
        colors[i % colors.length];

    walkCtx.lineWidth = 1.2;

    walkCtx.globalAlpha = 0.55;

    walkCtx.beginPath();

    for (let j = 0; j < trail.length; j++) {

        const point =
            worldToCanvas(
                trail[j].x,
                trail[j].y
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


// Axis labels

walkCtx.fillStyle = "#d1d5db";
walkCtx.font = "14px Arial";

walkCtx.fillText(
    "y",
    WIDTH / 2 + 8,
    20
);

walkCtx.fillText(
    "x",
    WIDTH - 20,
    HEIGHT / 2 - 8
);
```

}

// ============================================================
// THEORETICAL EXPECTATION VALUE
// ============================================================

function theoreticalDistance(t) {

```
/*
 * For independent Gaussian x and y coordinates:
 *
 * <r> = sigma * sqrt(pi * t / 2)
 */

return SIGMA *
    Math.sqrt(
        Math.PI * t / 2
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
    WIDTH - margin - 50,
    HEIGHT - 20
);


const maxTime = MAX_TIME;

const maxDistance =
    theoreticalDistance(maxTime) * 1.15;


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
        * maxTime;

    const value =
        theoreticalDistance(t);

    const x =
        margin + px;

    const y =
        HEIGHT - margin
        - (value / maxDistance)
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
            meanDistances[i].time;

        const x =
            margin
            + (t / maxTime)
            * graphWidth;

        const y =
            HEIGHT - margin
            - (meanDistances[i].value / maxDistance)
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

document.getElementById(
    "timeDisplay"
).textContent =
    simulationTime.toFixed(2);

const mean =
    meanDistances.length > 0
    ? meanDistances[meanDistances.length - 1].value
    : 0;

document.getElementById(
    "meanDisplay"
).textContent =
    mean.toFixed(3);
```

}

// ============================================================
// ANIMATION LOOP
// ============================================================

function animate(timestamp) {

```
if (!running) {
    return;
}

if (lastTimestamp === null) {

    lastTimestamp = timestamp;

} else {

    /*
     * Convert milliseconds to seconds.
     *
     * The browser may call this function 60 times per
     * second, but the simulation itself advances according
     * to actual elapsed time.
     */

    let dt =
        (timestamp - lastTimestamp)
        / 1000;

    lastTimestamp = timestamp;


    // Protect against a huge jump after switching tabs.

    dt = Math.min(dt, 0.1);

    advanceSimulation(dt);
}

draw();

if (simulationTime >= MAX_TIME) {

    simulationTime = MAX_TIME;

    running = false;

    draw();

    return;
}

requestAnimationFrame(animate);
```

}

// ============================================================
// BUTTONS
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

        lastTimestamp = null;

        requestAnimationFrame(animate);
    }
});
```

document
.getElementById("pauseButton")
.addEventListener("click", () => {

```
    running = false;
    lastTimestamp = null;
});
```

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

walkerSlider.addEventListener(
"input",
() => {

```
    N_WALKERS =
        Number(walkerSlider.value);

    walkerValue.textContent =
        N_WALKERS;
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

sigmaSlider.addEventListener(
"input",
() => {

```
    SIGMA =
        Number(sigmaSlider.value);

    sigmaValue.textContent =
        SIGMA.toFixed(1);

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

walkerValue.textContent =
N_WALKERS;

sigmaValue.textContent =
SIGMA.toFixed(1);

resetSimulation();

```
```
