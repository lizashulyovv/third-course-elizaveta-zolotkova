const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

const scale = 15;

const gridWidth = 40;
const gridHeight = 30;

const x1Input = document.querySelector('#x1');
const y1Input = document.querySelector('#y1');
const x2Input = document.querySelector('#x2');
const y2Input = document.querySelector('#y2');

const drawButton = document.querySelector('#drawButton');
const stepsTable = document.querySelector('#stepsTable');


function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#dddddd';
    ctx.lineWidth = 1;

    for (let y = 0; y < gridHeight; y += 1) {
        for (let x = 0; x < gridWidth; x += 1) {
            ctx.strokeRect(
                x * scale,
                y * scale,
                scale,
                scale
            );
        }
    }
}


function putPixel(x, y, color = 'black') {
    if (
        x < 0 ||
        x >= gridWidth ||
        y < 0 ||
        y >= gridHeight
    ) {
        return;
    }

    ctx.fillStyle = color;

    ctx.fillRect(
        x * scale + 1,
        y * scale + 1,
        scale - 2,
        scale - 2
    );
}


function lineDDA(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    const steps = Math.max(
        Math.abs(dx),
        Math.abs(dy)
    );

    const stepsData = [];

    if (steps === 0) {
        const pixelX = Math.round(x1);
        const pixelY = Math.round(y1);

        putPixel(pixelX, pixelY);

        stepsData.push({
            step: 0,
            x: x1,
            y: y1,
            pixelX: pixelX,
            pixelY: pixelY
        });

        return stepsData;
    }

    const xStep = dx / steps;
    const yStep = dy / steps;

    let x = x1;
    let y = y1;

    for (let i = 0; i <= steps; i += 1) {
        const pixelX = Math.round(x);
        const pixelY = Math.round(y);

        putPixel(pixelX, pixelY);

        stepsData.push({
            step: i,
            x: x,
            y: y,
            pixelX: pixelX,
            pixelY: pixelY
        });

        x += xStep;
        y += yStep;
    }

    return stepsData;
}


function renderTable(stepsData) {
    stepsTable.innerHTML = '';

    for (const step of stepsData) {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${step.step}</td>
            <td>${step.x.toFixed(2)}</td>
            <td>${step.y.toFixed(2)}</td>
            <td>${step.pixelX}</td>
            <td>${step.pixelY}</td>
        `;

        stepsTable.appendChild(row);
    }
}


function drawLine() {
    const x1 = Number(x1Input.value);
    const y1 = Number(y1Input.value);
    const x2 = Number(x2Input.value);
    const y2 = Number(y2Input.value);

    drawGrid();

    const stepsData = lineDDA(
        x1,
        y1,
        x2,
        y2
    );

    renderTable(stepsData);
}


drawButton.addEventListener('click', drawLine);

drawLine();
