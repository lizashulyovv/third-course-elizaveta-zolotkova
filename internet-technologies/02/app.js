const values = [];

function addValue(value) {
  values.push(value);
}

function removeLastValue() {
  values.pop();
}

function clearValues() {
  values.length = 0;
}

function getStatistics(values) {
  const count = values.length;

  if (count === 0) {
    return {
      count: 0,
      sum: 0,
      min: null,
      max: null,
      average: null
    };
  }

  let sum = 0;
  let min = values[0];
  let max = values[0];

  for (const value of values) {
    sum = sum + value;

    if (value < min) {
      min = value;
    }

    if (value > max) {
      max = value;
    }
  }

  return {
    count: count,
    sum: sum,
    min: min,
    max: max,
    average: sum / count
  };
}

function render() {
  const stats = getStatistics(values);

const listEl = document.querySelector('#list');

if (values.length === 0) {
  listEl.textContent = 'Список пуст';
} else {
  listEl.textContent = values.join(', ');
}
  
  document.querySelector('#count').textContent = stats.count;
  document.querySelector('#sum').textContent = stats.sum;

  if (stats.average === null) {
    document.querySelector('#average').textContent = '—';
  } else {
    document.querySelector('#average').textContent = stats.average.toFixed(2);
  }

  if (stats.min === null) {
    document.querySelector('#min').textContent = '—';
  } else {
    document.querySelector('#min').textContent = stats.min;
  }

  if (stats.max === null) {
    document.querySelector('#max').textContent = '—';
  } else {
    document.querySelector('#max').textContent = stats.max;
  }
}

document.querySelector('#add-btn').addEventListener('click', function () {
  const input = document.querySelector('#number-input');
  const raw = input.value.trim();
  const value = Number(raw);

  if (raw === '' || !Number.isFinite(value)) {
    document.querySelector('#error').textContent = 'Введите корректное число';
    return;
  }

  document.querySelector('#error').textContent = '';
  addValue(value);
  input.value = '';
  render();
});

document.querySelector('#remove-btn').addEventListener('click', function () {
  removeLastValue();
  render();
});

document.querySelector('#clear-btn').addEventListener('click', function () {
  clearValues();
  render();
});

console.log(values);
console.log(getStatistics(values));

render();
