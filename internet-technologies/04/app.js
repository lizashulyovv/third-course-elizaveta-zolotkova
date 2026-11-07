const state = {
    posts: [],
    isLoading: false,
    isSaving: false,
    error: null,
    editingId: null
};

async function loadPosts() {
    state.isLoading = true;
    state.error = null;
    render();

    try {
        const response = await fetch(
            'https://jsonplaceholder.typicode.com/posts?_limit=10'
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const posts = await response.json();
        state.posts = posts;

    } catch (error) {
        state.error = error.message;

    } finally {
        state.isLoading = false;
        render();
    }
}

function render() {
    const status = document.getElementById('status');

    status.textContent = '';

    if (state.isLoading) {
        status.textContent = 'Загрузка публикаций...';
    } else if (state.isSaving) {
        status.textContent = 'Сохранение публикации...';
    } else if (state.error) {
        status.textContent = `Ошибка: ${state.error}`;
    }

    const filter = document.getElementById('searchInput').value;
    const filteredPosts = getFilteredPosts(state.posts, filter);

    renderPosts(filteredPosts);
}

function renderPosts(posts) {
    const postsList = document.getElementById('postsList');

    postsList.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';

        const id = document.createElement('p');
        id.textContent = 'ID: ' + post.id;

        const title = document.createElement('h3');
        title.textContent = post.title;

        const body = document.createElement('p');
        body.textContent = post.body;

        postElement.appendChild(id);
        postElement.appendChild(title);
        postElement.appendChild(body);

        const editButton = document.createElement('button');
        editButton.textContent = 'Редактировать';

        editButton.addEventListener('click', () => {
            state.editingId = post.id;

            document.getElementById('titleInput').value = post.title;
            document.getElementById('bodyInput').value = post.body;

            document.getElementById('formTitle').textContent =
                'Редактирование публикации';

            document.getElementById('saveButton').textContent = 'Обновить';
            document.getElementById('cancelButton').hidden = false;
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Удалить';

        deleteButton.addEventListener('click', async () => {
            try {
                state.error = null;
                await deletePost(post.id);
            } catch (error) {
                state.error = error.message;
                render();
            }
        });

        postElement.appendChild(editButton);
        postElement.appendChild(deleteButton);

        postsList.appendChild(postElement);
    });
}

document.getElementById('loadButton').addEventListener('click', loadPosts);

async function createPost(data) {
    const response = await fetch(
        'https://jsonplaceholder.typicode.com/posts',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const newPost = await response.json();

    state.posts.unshift(newPost);
}

async function updatePost(id, data) {
    const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${id}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const updatedPost = await response.json();

    const index = state.posts.findIndex(post => post.id === id);

    if (index !== -1) {
        state.posts[index] = updatedPost;
    }
}

async function deletePost(id) {
    const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${id}`,
        {
            method: 'DELETE'
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    state.posts = state.posts.filter(post => post.id !== id);

    render();
}

document.getElementById('postForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    if (state.isSaving) {
        return;
    }

    const titleInput = document.getElementById('titleInput');
    const bodyInput = document.getElementById('bodyInput');

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title || !body) {
        return;
    }

    const data = {
        title: title,
        body: body,
        userId: 1
    };

    state.isSaving = true;
    state.error = null;
    render();

    try {
        if (state.editingId === null) {
            await createPost(data);
        } else {
            await updatePost(state.editingId, data);
        }

        resetForm();

    } catch (error) {
        state.error = error.message;

    } finally {
        state.isSaving = false;
        render();
    }
});

function resetForm() {
    state.editingId = null;

    document.getElementById('titleInput').value = '';
    document.getElementById('bodyInput').value = '';

    document.getElementById('formTitle').textContent = 'Новая публикация';
    document.getElementById('saveButton').textContent = 'Сохранить';
    document.getElementById('cancelButton').hidden = true;
}

document.getElementById('cancelButton').addEventListener('click', resetForm);

function getFilteredPosts(posts, filter) {
    const search = filter.toLowerCase();

    return posts.filter(post =>
        post.title.toLowerCase().includes(search) ||
        post.body.toLowerCase().includes(search)
    );
}

document.getElementById('searchInput').addEventListener('input', render);
