
// ============================================================
// PARAMETERS
// ============================================================

const N_WALKERS = 15;

// Number of simulation steps
const N_STEPS = 1200;

// Physical timestep
const DT = 0.05;

// Gaussian standard deviation
const SIGMA = 1.0;

// Number of simulation steps per animation frame
const STEPS_PER_FRAME = 2;


// ============================================================
// CANVAS SETUP
// ============================================================

const walkCanvas =
    document.getElementById("walkCanvas");

const graphCanvas =
    document.getElementById("graphCanvas");

const walkCtx =
    walkCanvas.getContext("2d");

const graphCtx =
    graphCanvas.getContext("2d");

const WIDTH = walkCanvas.width;
const HEIGHT = walkCanvas.height;


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

// Box-Muller transform
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
// SIMULATION STATE
// ============================================================

let positions;
let trails;

let currentStep = 0;

let meanDistances = [];

let running = false;


// ============================================================
// RESET SIMULATION
// ============================================================

function resetSimulation() {

    positions = [];
    trails = [];

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

    currentStep = 0;

    meanDistances = [];

    running = false;

    draw();
}


// ============================================================
// ONE RANDOM-WALK STEP
// ============================================================

function simulationStep() {

    let totalDistance = 0;

    for (let i = 0; i < N_WALKERS; i++) {

        const dx =
            SIGMA
            * Math.sqrt(DT)
            * gaussianRandom();

        const dy =
            SIGMA
            * Math.sqrt(DT)
            * gaussianRandom();

        positions[i].x += dx;
        positions[i].y += dy;

        trails[i].push({
            x: positions[i].x,
            y: positions[i].y
        });

        const distance =
            Math.sqrt(
                positions[i].x ** 2
                + positions[i].y ** 2
            );

        totalDistance += distance;
    }

    const meanDistance =
        totalDistance / N_WALKERS;

    meanDistances.push(meanDistance);

    currentStep++;
}


// ============================================================
// COORDINATE SCALE
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

        walkCtx.strokeStyle = colors[i];
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


    // Current walker positions
    for (let i = 0; i < N_WALKERS; i++) {

        const point =
            worldToCanvas(
                positions[i].x,
                positions[i].y
            );

        walkCtx.fillStyle = colors[i];

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
// DRAW EXPECTATION GRAPH
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
        "Time",
        WIDTH - margin - 35,
        HEIGHT - 20
    );


    const maxTime =
        N_STEPS * DT;

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

            const t = i * DT;

            const x =
                margin
                + (t / maxTime)
                * graphWidth;

            const y =
                HEIGHT - margin
                - (meanDistances[i] / maxDistance)
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
}


// ============================================================
// DRAW EVERYTHING
// ============================================================

function draw() {

    drawWalkers();
    drawGraph();

    const time =
        currentStep * DT;

    document.getElementById(
        "timeDisplay"
    ).textContent =
        time.toFixed(2);

    const mean =
        meanDistances.length > 0
        ? meanDistances[meanDistances.length - 1]
        : 0;

    document.getElementById(
        "meanDisplay"
    ).textContent =
        mean.toFixed(3);
}


// ============================================================
// ANIMATION LOOP
// ============================================================

function animate() {

    if (!running) {
        return;
    }

    for (
        let i = 0;
        i < STEPS_PER_FRAME;
        i++
    ) {

        if (currentStep >= N_STEPS) {

            running = false;
            break;
        }

        simulationStep();
    }

    draw();

    if (running) {
        requestAnimationFrame(animate);
    }
}


// ============================================================
// BUTTONS
// ============================================================

document
    .getElementById("startButton")
    .addEventListener("click", () => {

        if (currentStep >= N_STEPS) {
            resetSimulation();
        }

        if (!running) {
            running = true;
            animate();
        }
    });


document
    .getElementById("pauseButton")
    .addEventListener("click", () => {

        running = false;
    });


document
    .getElementById("resetButton")
    .addEventListener("click", () => {

        resetSimulation();
    });


// ============================================================
// INITIALIZE
// ============================================================

resetSimulation();
