const canvas = document.getElementById("walkCanvas");
const graphCanvas = document.getElementById("graphCanvas");

const ctx = canvas.getContext("2d");
const graphCtx = graphCanvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// ============================================================
// SETTINGS
// ============================================================

let numberOfWalkers = 15;
let sigma = 1.0;

const MAX_TIME = 60;

// How frequently the physics is updated.
// This is NOT the speed of the simulation.
const PHYSICS_DT = 0.02;

// ============================================================
// DISPLAY
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
"#facc15"
];

// ============================================================
// STATE
// ============================================================

let walkers = [];

let simulationTime = 0;

let running = false;

let startTimestamp = null;

let lastPhysicsTime = 0;

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

startTimestamp = null;

lastPhysicsTime = 0;

history = [];

createWalkers();

updateDisplay();

draw();
```

}

// ============================================================
// PHYSICS
// ============================================================

function physicsStep(dt) {

```
const stepSize =
    sigma * Math.sqrt(dt);

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
            walker.x * walker.x +
            walker.y * walker.y
        );

    totalDistance += distance;
}

const meanDistance =
    totalDistance / walkers.length;

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
return sigma *
    Math.sqrt(
        Math.PI * t / 2
    );
```

}

// ============================================================
// WORLD TO CANVAS
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


// Trails

for (let i = 0; i < walkers.length; i++) {

    const trail = walkers[i].trail;

    ctx.strokeStyle =
        colors[i % colors.length];

    ctx.lineWidth = 1.2;

    ctx.globalAlpha = 0.5;

    ctx.beginPath();

    for (let j = 0; j < trail.length; j++) {

        const point =
            worldToCanvas(
                trail[j].x,
                trail[j].y
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
```
