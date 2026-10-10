const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

const scale = 10;
const gridWidth = canvas.width / scale;
const gridHeight = canvas.height / scale;

const x1Input = document.querySelector('#x1');
const y1Input = document.querySelector('#y1');
const x2Input = document.querySelector('#x2');
const y2Input = document.querySelector('#y2');

const drawButton = document.querySelector('#drawButton');
const stepsTable = document.querySelector('#stepsTable');
const pixelList = document.querySelector('#pixelList');
const message = document.querySelector('#message');

const compareButton = document.querySelector('#compareButton');
const compareTable = document.querySelector('#compareTable');
const compareSummary = document.querySelector('#compareSummary');

const benchmarkButton = document.querySelector('#benchmarkButton');
const benchmarkResult = document.querySelector('#benchmarkResult');

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#dddddd';
  ctx.lineWidth = 1;

  for (let x = 0; x < gridWidth; x += 1) {
    for (let y = 0; y < gridHeight; y += 1) {
      ctx.strokeRect(
        x * scale,
        y * scale,
        scale,
        scale
      );
    }
  }
}

function putPixel(x, y, color = '#315c9b') {
  if (
    x < 0 || x >= gridWidth ||
    y < 0 || y >= gridHeight
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

function lineDDA(x1, y1, x2, y2, draw = false) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  const steps = Math.max(
    Math.abs(dx),
    Math.abs(dy)
  );

  const pixels = [];

  if (steps === 0) {
    const pixel = {
      step: 0,
      x: x1,
      y: y1,
      pixelX: Math.round(x1),
      pixelY: Math.round(y1),
      error: null,
      error2: null,
      changedX: false,
      changedY: false
    };

    pixels.push(pixel);

    if (draw) {
      putPixel(pixel.pixelX, pixel.pixelY);
    }

    return pixels;
  }

  const xStep = dx / steps;
  const yStep = dy / steps;

  let x = x1;
  let y = y1;

  let previousPixelX = null;
  let previousPixelY = null;

  for (let i = 0; i <= steps; i += 1) {
    const pixelX = Math.round(x);
    const pixelY = Math.round(y);

    const pixel = {
      step: i,
      x: x,
      y: y,
      pixelX: pixelX,
      pixelY: pixelY,
      error: null,
      error2: null,
      changedX: previousPixelX !== null &&
        pixelX !== previousPixelX,
      changedY: previousPixelY !== null &&
        pixelY !== previousPixelY
    };

    pixels.push(pixel);

    if (draw) {
      putPixel(pixelX, pixelY);
    }

    previousPixelX = pixelX;
    previousPixelY = pixelY;

    x += xStep;
    y += yStep;
  }

  return pixels;
}

function lineBresenham(x1, y1, x2, y2, draw = false) {
  let x = x1;
  let y = y1;

  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);

  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;

  let error = dx - dy;

  const pixels = [];

  while (true) {
    const pixel = {
      step: pixels.length,
      x: x,
      y: y,
      pixelX: x,
      pixelY: y,
      error: error,
      error2: null,
      changedX: false,
      changedY: false
    };

    pixels.push(pixel);

    if (draw) {
      putPixel(x, y);
    }

    if (x === x2 && y === y2) {
      break;
    }

    const error2 = 2 * error;

    const oldX = x;
    const oldY = y;

    if (error2 > -dy) {
      error -= dy;
      x += sx;
    }

    if (error2 < dx) {
      error += dx;
      y += sy;
    }

    pixel.error2 = error2;
    pixel.changedX = x !== oldX;
    pixel.changedY = y !== oldY;
  }

  return pixels;
}

function getCoordinates() {
  if (
    x1Input.value.trim() === '' ||
    y1Input.value.trim() === '' ||
    x2Input.value.trim() === '' ||
    y2Input.value.trim() === ''
  ) {
    return null;
  }

  const x1 = Number(x1Input.value);
  const y1 = Number(y1Input.value);
  const x2 = Number(x2Input.value);
  const y2 = Number(y2Input.value);

  if (
    !Number.isInteger(x1) ||
    !Number.isInteger(y1) ||
    !Number.isInteger(x2) ||
    !Number.isInteger(y2)
  ) {
    return null;
  }

  if (
    x1 < 0 || x1 >= gridWidth ||
    x2 < 0 || x2 >= gridWidth ||
    y1 < 0 || y1 >= gridHeight ||
    y2 < 0 || y2 >= gridHeight
  ) {
    return null;
  }

  return {
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2
  };
}

function renderTable(pixels) {
  stepsTable.innerHTML = '';

  for (const pixel of pixels) {
    const row = document.createElement('tr');

    const values = [
      pixel.step,
      pixel.x.toFixed(2),
      pixel.y.toFixed(2),
      pixel.pixelX,
      pixel.pixelY,
      pixel.error === null ? '-' : pixel.error,
      pixel.error2 === null ? '-' : pixel.error2,
      pixel.changedX ? 'Да' : 'Нет',
      pixel.changedY ? 'Да' : 'Нет'
    ];

    for (const value of values) {
      const cell = document.createElement('td');

      cell.textContent = value;
      row.appendChild(cell);
    }

    stepsTable.appendChild(row);
  }
}

function renderPixelList(pixels) {
  pixelList.innerHTML = '';

  for (const pixel of pixels) {
    const item = document.createElement('li');

    item.textContent =
      '(' + pixel.pixelX + ', ' + pixel.pixelY + ')';

    pixelList.appendChild(item);
  }
}

function drawLine() {
  const coordinates = getCoordinates();

  if (coordinates === null) {
    message.textContent =
      'Введите координаты.';

    return;
  }

  const x1 = coordinates.x1;
  const y1 = coordinates.y1;
  const x2 = coordinates.x2;
  const y2 = coordinates.y2;

  const selectedAlgorithm = document.querySelector(
    'input[name="algorithm"]:checked'
  ).value;

  drawGrid();

  let pixels;

  if (selectedAlgorithm === 'dda') {
    pixels = lineDDA(x1, y1, x2, y2, true);
    message.textContent = 'Алгоритм ЦДА.';
  } else {
    pixels = lineBresenham(x1, y1, x2, y2, true);
    message.textContent = 'Алгоритм Брезенхэма.';
  }

  const bresenhamPixels = lineBresenham(x1, y1, x2, y2);

  renderTable(bresenhamPixels);
  renderPixelList(pixels);
}

function hasPoint(points, point) {
  for (const item of points) {
    if (item === point) {
      return true;
    }
  }

  return false;
}

function comparePixels(pixels1, pixels2) {
  const set1 = [];
  const set2 = [];

  for (const pixel of pixels1) {
    const point = pixel.pixelX + ',' + pixel.pixelY;

    if (!hasPoint(set1, point)) {
      set1.push(point);
    }
  }

  for (const pixel of pixels2) {
    const point = pixel.pixelX + ',' + pixel.pixelY;

    if (!hasPoint(set2, point)) {
      set2.push(point);
    }
  }

  const onlyDDA = [];
  const onlyBresenham = [];

  for (const point of set1) {
    if (!hasPoint(set2, point)) {
      onlyDDA.push(point);
    }
  }

  for (const point of set2) {
    if (!hasPoint(set1, point)) {
      onlyBresenham.push(point);
    }
  }

  return {
    equal: onlyDDA.length === 0 &&
      onlyBresenham.length === 0,
    onlyDDA: onlyDDA,
    onlyBresenham: onlyBresenham
  };
}

function compareAlgorithms() {
  const testLines = [
    {
      type: 'Горизонтальный',
      x1: 2, y1: 5, x2: 20, y2: 5
    },
    {
      type: 'Вертикальный',
      x1: 7, y1: 2, x2: 7, y2: 20
    },
    {
      type: 'Пологий',
      x1: 2, y1: 2, x2: 20, y2: 8
    },
    {
      type: 'Крутой',
      x1: 3, y1: 2, x2: 7, y2: 25
    },
    {
      type: 'Обратный',
      x1: 20, y1: 8, x2: 2, y2: 3
    }
  ];

  const current = getCoordinates();

  if (current === null) {
    message.textContent =
      'Введите координаты.';

    return;
  }

  testLines.push({
    type: 'Текущий отрезок',
    x1: current.x1,
    y1: current.y1,
    x2: current.x2,
    y2: current.y2
  });

  compareTable.innerHTML = '';

  let equalCount = 0;

  for (const line of testLines) {
    const ddaPixels = lineDDA(
      line.x1,
      line.y1,
      line.x2,
      line.y2
    );

    const bresenhamPixels = lineBresenham(
      line.x1,
      line.y1,
      line.x2,
      line.y2
    );

    const comparison = comparePixels(
      ddaPixels,
      bresenhamPixels
    );

    if (comparison.equal) {
      equalCount += 1;
    }

    let differences = '';

    if (comparison.onlyDDA.length > 0) {
      differences = 'ЦДА: ';

      for (let i = 0; i < comparison.onlyDDA.length; i += 1) {
        const coordinates = comparison.onlyDDA[i].split(',');

        differences +=
          '(' + coordinates[0] + ', ' + coordinates[1] + ')';

        if (i < comparison.onlyDDA.length - 1) {
          differences += '; ';
        }
      }
    }

    if (comparison.onlyBresenham.length > 0) {
      if (differences !== '') {
        differences += ' ';
      }

      differences += 'Брезенхэм: ';

      for (
        let i = 0;
        i < comparison.onlyBresenham.length;
        i += 1
      ) {
        const coordinates =
          comparison.onlyBresenham[i].split(',');

        differences +=
          '(' + coordinates[0] + ', ' + coordinates[1] + ')';

        if (i < comparison.onlyBresenham.length - 1) {
          differences += '; ';
        }
      }
    }

    if (differences === '') {
      differences = 'Нет';
    }

    const values = [
      line.type,
      ddaPixels.length,
      bresenhamPixels.length,
      comparison.equal ? 'Да' : 'Нет',
      differences
    ];

    const row = document.createElement('tr');

    for (const value of values) {
      const cell = document.createElement('td');

      cell.textContent = value;
      row.appendChild(cell);
    }

    compareTable.appendChild(row);
  }

  compareSummary.textContent =
    'Совпали наборы пикселей в ' +
    equalCount + ' из ' + testLines.length + ' случаев.';
}

function benchmarkAlgorithms() {
  const numberOfLines = 1000;
  const numberOfRuns = 5;

  const lines = [];

  for (let i = 0; i < numberOfLines; i += 1) {
    lines.push({
      x1: Math.floor(Math.random() * gridWidth),
      y1: Math.floor(Math.random() * gridHeight),
      x2: Math.floor(Math.random() * gridWidth),
      y2: Math.floor(Math.random() * gridHeight)
    });
  }

  function measure(algorithm) {
    const times = [];

    for (let i = 0; i < numberOfLines; i += 1) {
      algorithm(
        lines[i].x1,
        lines[i].y1,
        lines[i].x2,
        lines[i].y2
      );
    }

    for (let run = 0; run < numberOfRuns; run += 1) {
      const start = performance.now();

      for (let i = 0; i < numberOfLines; i += 1) {
        algorithm(
          lines[i].x1,
          lines[i].y1,
          lines[i].x2,
          lines[i].y2
        );
      }

      const end = performance.now();

      times.push(end - start);
    }

    let total = 0;

    for (let i = 0; i < times.length; i += 1) {
      total += times[i];
    }

    const average = total / times.length;

    return {
      average: average,
      times: times
    };
  }

  const ddaResult = measure(lineDDA);
  const bresenhamResult = measure(lineBresenham);

  benchmarkResult.innerHTML = '';

  const heading = document.createElement('p');

  heading.textContent =
    'Количество отрезков за запуск: ' + numberOfLines +
    '. Количество замеров: ' + numberOfRuns + '.';

  const ddaText = document.createElement('p');

  ddaText.textContent =
    'ЦДА - среднее время: ' +
    ddaResult.average.toFixed(3) + ' мс.';

  const bresenhamText = document.createElement('p');

  bresenhamText.textContent =
    'Брезенхэм - среднее время: ' +
    bresenhamResult.average.toFixed(3) + ' мс.';

  const ddaRuns = document.createElement('p');

  ddaRuns.textContent = 'Замеры ЦДА: ';

  for (let i = 0; i < ddaResult.times.length; i += 1) {
    ddaRuns.textContent += ddaResult.times[i].toFixed(3);

    if (i < ddaResult.times.length - 1) {
      ddaRuns.textContent += '; ';
    }
  }

  ddaRuns.textContent += ' мс.';

  const bresenhamRuns = document.createElement('p');

  bresenhamRuns.textContent = 'Замеры Брезенхэма: ';

  for (let i = 0; i < bresenhamResult.times.length; i += 1) {
    bresenhamRuns.textContent +=
      bresenhamResult.times[i].toFixed(3);

    if (i < bresenhamResult.times.length - 1) {
      bresenhamRuns.textContent += '; ';
    }
  }

  bresenhamRuns.textContent += ' мс.';

  benchmarkResult.append(
    heading,
    ddaText,
    bresenhamText,
    ddaRuns,
    bresenhamRuns
  );
}

drawButton.addEventListener('click', drawLine);
compareButton.addEventListener('click', compareAlgorithms);
benchmarkButton.addEventListener('click', benchmarkAlgorithms);

drawGrid();
drawLine();
