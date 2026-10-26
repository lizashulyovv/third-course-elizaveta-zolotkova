const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const scale = 10;

const drawButton = document.querySelector('#drawButton');
const formulaButton = document.querySelector('#formulaButton');
const stepsTable = document.querySelector('#stepsTable');
const showStep = document.querySelector('#showStep');
const compareButton = document.querySelector('#compareButton');

let pixels = new Set();

drawButton.addEventListener('click', function() {
    const cx = Number(document.querySelector('#cx').value);
    const cy = Number(document.querySelector('#cy').value);
    const r = Number(document.querySelector('#r').value);

    if (!checkCircle(cx, cy, r)) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stepsTable.innerHTML = '';
    pixels.clear();

    const start = performance.now();
    circleMidpoint(cx, cy, r);
    const end = performance.now();

    document.querySelector('#midpointTime').textContent =
        'Время построения: ' + (end - start).toFixed(3) + ' мс';
});

formulaButton.addEventListener('click', function() {
    const cx = Number(document.querySelector('#cx').value);
    const cy = Number(document.querySelector('#cy').value);
    const r = Number(document.querySelector('#r').value);

    if (!checkCircle(cx, cy, r)) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pixels.clear();

    const start = performance.now();
    circleFormula(cx, cy, r);
    const end = performance.now();

    document.querySelector('#formulaTime').textContent =
        'Время построения: ' + (end - start).toFixed(3) + ' мс';
});

function checkCircle(cx, cy, r) {
    if (
        !Number.isFinite(cx) ||
        !Number.isFinite(cy) ||
        !Number.isFinite(r) ||
        r <= 0
    ) {
        alert('Введите корректные координаты и радиус больше нуля');
        return false;
    }

    if (
        cx - r < 0 || cy - r < 0 ||
        cx + r >= canvas.width / scale ||
        cy + r >= canvas.height / scale
    ) {
        alert('Окружность выходит за границы Canvas');
        return false;
    }

    return true;
}

function putPixel(x, y, color = 'black') {
    ctx.fillStyle = color;
    ctx.fillRect(x * scale, y * scale, scale, scale);
    pixels.add(x + ',' + y);
}

function plot8(cx, cy, x, y, color = 'black') {
    putPixel(cx + x, cy + y, color);
    putPixel(cx + y, cy + x, color);
    putPixel(cx - x, cy + y, color);
    putPixel(cx - y, cy + x, color);
    putPixel(cx + x, cy - y, color);
    putPixel(cx + y, cy - x, color);
    putPixel(cx - x, cy - y, color);
    putPixel(cx - y, cy - x, color);
}

function circleMidpoint(cx, cy, r) {
    let x = 0;
    let y = r;
    let d = 1 - r;
    let step = 1;
    let pointsCount = 0;

    while (x <= y) {
        pointsCount++;
        plot8(cx, cy, x, y);

        if (showStep.checked && step === 1) {
            plot8(cx, cy, x, y, 'red');
        }

        const xBefore = x;
        const yBefore = y;
        const dBefore = d;

        let variant;

        if (d < 0) {
            variant = 'E';
            d += 2 * x + 3;
        } else {
            variant = 'SE';
            d += 2 * (x - y) + 5;
            y--;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${step}</td>
            <td>${xBefore}</td>
            <td>${yBefore}</td>
            <td>${dBefore}</td>
            <td>${variant}</td>
            <td>${d}</td>
        `;
        stepsTable.appendChild(row);

        x++;
        step++;
    }

    document.querySelector('#midpointPoints').textContent =
        'Количество базовых точек: ' + pointsCount;
}

function circleFormula(cx, cy, r) {
    let x = 0;
    let pointsCount = 0;

    while (x <= r / Math.sqrt(2)) {
        const y = Math.round(Math.sqrt(r * r - x * x));

        plot8(cx, cy, x, y);

        pointsCount++;
        x++;
    }

    document.querySelector('#formulaPoints').textContent =
        'Количество базовых точек: ' + pointsCount;
}

function midpointCoordinates(cx, cy, r) {
    const result = [];

    let x = 0;
    let y = r;
    let d = 1 - r;

    while (x <= y) {
        result.push([
            cx + x, cy + y,
            cx + y, cy + x,
            cx - x, cy + y,
            cx - y, cy + x,
            cx + x, cy - y,
            cx + y, cy - x,
            cx - x, cy - y,
            cx - y, cy - x
        ]);

        if (d < 0) {
            d += 2 * x + 3;
        } else {
            d += 2 * (x - y) + 5;
            y--;
        }

        x++;
    }

    return result;
}

function formulaCoordinates(cx, cy, r) {
    const result = [];

    let x = 0;

    while (x <= r / Math.sqrt(2)) {
        const y = Math.round(Math.sqrt(r * r - x * x));

        result.push([
            cx + x, cy + y,
            cx + y, cy + x,
            cx - x, cy + y,
            cx - y, cy + x,
            cx + x, cy - y,
            cx + y, cy - x,
            cx - x, cy - y,
            cx - y, cy - x
        ]);

        x++;
    }

    return result;
}

function measureTime(method, cx, cy, r) {
    const repetitions = 1000;
    const measurements = 5;
    let totalTime = 0;

    method(cx, cy, r);

    for (let i = 0; i < measurements; i++) {
        const start = performance.now();

        for (let j = 0; j < repetitions; j++) {
            method(cx, cy, r);
        }

        const end = performance.now();

        totalTime += end - start;
    }

    return totalTime / (measurements * repetitions);
}

compareButton.addEventListener('click', function() {
    const cx = Number(document.querySelector('#cx').value);
    const cy = Number(document.querySelector('#cy').value);
    const r = Number(document.querySelector('#r').value);

    if (!checkCircle(cx, cy, r)) return;

    const midpointTime = measureTime(
        midpointCoordinates,
        cx,
        cy,
        r
    );

    const formulaTime = measureTime(
        formulaCoordinates,
        cx,
        cy,
        r
    );

    document.querySelector('#midpointTime').textContent =
        'Среднее время алгоритма средней точки: ' +
        midpointTime.toFixed(6) + ' мс';

    document.querySelector('#formulaTime').textContent =
        'Среднее время алгоритма по формуле: ' +
        formulaTime.toFixed(6) + ' мс';

    pixels.clear();
    stepsTable.innerHTML = '';

    circleMidpoint(cx, cy, r);

    const midpointPixels = new Set(pixels);

    pixels.clear();

    circleFormula(cx, cy, r);

    const formulaPixels = new Set(pixels);

    let same = midpointPixels.size === formulaPixels.size;

    for (const point of midpointPixels) {
        if (!formulaPixels.has(point)) {
            same = false;
            break;
        }
    }

    document.querySelector('#compareResult').textContent =
        same
            ? 'Пиксели совпадают'
            : 'Пиксели не совпадают';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pixels.clear();

    circleMidpoint(cx, cy, r);
});