const state = {
    users: [],
    isLoading: false,
    error: null,
    filter: ''
};

const loadButton = document.querySelector('#loadButton');
const updateButton = document.querySelector('#updateButton');
const status = document.querySelector('#status');
const usersList = document.querySelector('#usersList');
const searchInput = document.querySelector('#searchInput');

const totalCount = document.querySelector('#totalCount');
const filteredCount = document.querySelector('#filteredCount');
const citiesCount = document.querySelector('#citiesCount');

function render() {
  if (state.isLoading) {
    status.textContent = 'Загрузка';
    return;
  }

  if (state.error) {
    status.textContent = 'Ошибка: ' + state.error;
    return;
  }

  if (state.users.length > 0) {
      status.textContent = 'Пользователи загружены';
  } else {
      status.textContent = 'Нажмите кнопку "Загрузить"';
  }
}

async function loadUsers() {
    state.isLoading = true;
    state.error = null;
    render()

    try {
        const response = await fetch(
            'https://jsonplaceholder.typicode.com/users'
        );

        if (!response.ok) {
            throw new Error('Ошибка HTTP: ' + response.status);
        }

        const users = await response.json();

        state.users = users;
        const cities = [];

        state.users.forEach(function (user) {
            if (!cities.includes(user.address.city)) {
                cities.push(user.address.city)
            }
        });

        totalCount.textContent = 'Всего пользователей: ' + state.users.length;
        citiesCount.textContent = 'Уникальных городов: ' + cities.length;

        state.isLoading = false;
        renderUsers(state.users);
        render();

    } catch (error) {
        state.error = error.message;
        state.isLoading = false;
        render();
    }
}

loadButton.addEventListener('click', loadUsers);
updateButton.addEventListener('click', loadUsers);

function createUserCard(user) {
    const card = document.createElement('div');
    card.className = 'user-card';

    const name = document.createElement('p');
    name.textContent = user.name;
    card.append(name);

    const username = document.createElement('p');
    username.textContent = user.username;
    card.append(username);

    const email = document.createElement('p');
    email.textContent = user.email;
    card.append(email);

    const city = document.createElement('p');
    city.textContent = user.address.city;
    card.append(city);

    const company = document.createElement('p');
    company.textContent = user.company.name;
    card.append(company);

    return card;
}

function renderUsers(users) {
    usersList.innerHTML = '';
    let count = 0;

    users.forEach(function (user) {
        if (
            user.name.toLowerCase().includes(state.filter.toLowerCase()) ||
            user.username.toLowerCase().includes(state.filter.toLowerCase()) ||
            user.email.toLowerCase().includes(state.filter.toLowerCase())
        ) {
            const card = createUserCard(user);
            usersList.append(card);
            count++;
        }
    });

    filteredCount.textContent = 'Отображается: ' + count;
}

searchInput.addEventListener('input', function () {
    state.filter = searchInput.value;
    renderUsers(state.users);
});