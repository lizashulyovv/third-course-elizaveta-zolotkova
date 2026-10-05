const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

const scale = 10;

function putPixel(x, y, color = 'black') {
  ctx.fillStyle = color;
  ctx.fillRect(x * scale, y * scale, scale, scale);
}

function lineDDA(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));

  const stepsData = [];

  if (steps === 0) {
    putPixel(x1, y1);

    stepsData.push({
      step: 0,
      x: x1,
      y: y1,
      pixelX: x1,
      pixelY: y1
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
  const table = document.querySelector('#stepsTable');

  table.innerHTML = '';

  for (const step of stepsData) {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${step.step}</td>
      <td>${step.x.toFixed(2)}</td>
      <td>${step.y.toFixed(2)}</td>
      <td>${step.pixelX}</td>
      <td>${step.pixelY}</td>
    `;

    table.appendChild(row);
  }
}

function drawLine() {
  const x1 = Number(document.querySelector('#x1').value);
  const y1 = Number(document.querySelector('#y1').value);
  const x2 = Number(document.querySelector('#x2').value);
  const y2 = Number(document.querySelector('#y2').value);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const stepsData = lineDDA(x1, y1, x2, y2);

  renderTable(stepsData);
}

document.querySelector('#drawButton').addEventListener('click', drawLine);
