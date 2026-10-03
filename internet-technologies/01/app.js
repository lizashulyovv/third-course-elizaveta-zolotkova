let value = 0;

const valueElement = document.querySelector('#value');
const messageElement = document.querySelector('#message');
const increaseButton = document.querySelector('#increase');
const decreaseButton = document.querySelector('#decrease');
const resetButton = document.querySelector('#reset');

function render() {
  valueElement.textContent = value;

  if (value > 0) {
    messageElement.textContent = 'Число положительное';
  } else if (value < 0) {
    messageElement.textContent = 'Число отрицательное';
  } else {
    messageElement.textContent = 'Число равно нулю';
  }
}

increaseButton.addEventListener('click', () => {
  value += 1;
  render();
});

decreaseButton.addEventListener('click', () => {
  value -= 1;
  render();
});

resetButton.addEventListener('click', () => {
  value = 0;
  render();
});

render();
