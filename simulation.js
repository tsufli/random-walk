const walkCanvas = document.getElementById("walkCanvas");
const graphCanvas = document.getElementById("graphCanvas");

const walkCtx = walkCanvas.getContext("2d");
const graphCtx = graphCanvas.getContext("2d");

const WIDTH = walkCanvas.width;
const HEIGHT = walkCanvas.height;


let N_WALKERS = 10;
let SIGMA = 1.0;

const MAX_TIME = 60;
const DT = 0.02;

let positions = [];
let trails = [];
let meanDistances = [];

let simulationTime = 0;
let running = false;

let lastTime = null;
let physicsAccumulator = 0;

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


function gaussianRandom() {
    let u = 0;
    let v = 0;

    while (u === 0) {
        u = Math.random();
    }

    while (v === 0) {
        v = Math.random();
    }

    return Math.sqrt(-2 * Math.log(u)) *
        Math.cos(2 * Math.PI * v);
}

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

function physicsStep() {
    const stepSize = SIGMA * Math.sqrt(DT);

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

        const distance = Math.sqrt(
            positions[i].x ** 2 +
            positions[i].y ** 2
        );

        totalDistance += distance;
    }

    meanDistances.push(
        totalDistance / N_WALKERS
    );
}

function theoreticalDistance(t) {
    return SIGMA *
        Math.sqrt(Math.PI * t / 2);
}

const WORLD_SIZE = 15;

function worldToCanvas(x, y) {
    const scale =
        WIDTH / (2 * WORLD_SIZE);

    return {
        x: WIDTH / 2 + x * scale,
        y: HEIGHT / 2 - y * scale
    };
}

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

    for (let x = 0; x <= WIDTH; x += 50) {
        walkCtx.beginPath();
        walkCtx.moveTo(x, 0);
        walkCtx.lineTo(x, HEIGHT);
        walkCtx.stroke();
    }

    for (let y = 0; y <= HEIGHT; y += 50) {
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

    // Walker trails
    for (let i = 0; i < N_WALKERS; i++) {

        if (trails[i].length < 2) {
            continue;
        }

        walkCtx.lineWidth = 1.2;
        walkCtx.lineCap = "round";
        walkCtx.lineJoin = "round";

        const trail = trails[i];

        for (let j = 1; j < trail.length; j++) {

            const progress =
                j / (trail.length - 1);

            // Old parts fade to 0, newest part reaches 0.7
            const alpha =
                0.05 + 0.65 * progress;

            walkCtx.strokeStyle =
                colors[i % colors.length];

            walkCtx.globalAlpha = alpha;

            const previous =
                worldToCanvas(
                    trail[j - 1].x,
                    trail[j - 1].y
                );

            const current =
                worldToCanvas(
                    trail[j].x,
                    trail[j].y
                );

            walkCtx.beginPath();

            walkCtx.moveTo(
                previous.x,
                previous.y
            );

            walkCtx.lineTo(
                current.x,
                current.y
            );

            walkCtx.stroke();
        }

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

        walkCtx.globalAlpha = 1;

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
    walkCtx.globalAlpha = 1;
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

function animate(timestamp) {
    if (!running) {
        return;
    }

    if (lastTime === null) {
        lastTime = timestamp;
    } else {
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

document
    .getElementById("pauseButton")
    .addEventListener(
        "click",
        function () {
            running = false;
            lastTime = null;
        }
    );

document
    .getElementById("resetButton")
    .addEventListener(
        "click",
        function () {
            resetSimulation();
        }
    );

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

walkerValue.textContent =
    N_WALKERS;

sigmaValue.textContent =
    SIGMA.toFixed(1);

resetSimulation();

