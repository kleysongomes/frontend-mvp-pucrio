const API_URL = 'http://127.0.0.1:5000/api';

// Seletores do DOM
const reviewsList = document.getElementById('reviews-list');
const reviewForm = document.getElementById('review-form');
const reviewIdField = document.getElementById('review-id');
const titleField = document.getElementById('title');
const contentField = document.getElementById('content');
const formTitle = document.getElementById('form-title');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// Seletores para a Busca
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');

/**
 * Busca todos os reviews da API e os exibe na tela.
 */
async function fetchAndRenderReviews() {
    try {
        const response = await fetch(`${API_URL}/reviews`);
        if (!response.ok) throw new Error('Erro ao buscar os reviews.');
        const reviews = await response.json();
        renderReviews(reviews); // Chama a função de renderização
    } catch (error) {
        console.error('Falha na requisição:', error);
        alert('Não foi possível carregar os reviews. Verifique se o back-end está rodando.');
    }
}

/**
 * Limpa a lista de reviews e renderiza uma nova lista na tela.
 * @param {Array} reviews - Um array de objetos de review.
 */
function renderReviews(reviews) {
    reviewsList.innerHTML = '';
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p class="text-center text-muted">Nenhum review encontrado.</p>';
        return;
    }
    reviews.forEach(review => {
        const reviewCard = createReviewCard(review);
        reviewsList.appendChild(reviewCard);
    });
}

/**
 * Cria o elemento HTML (card) para um único review.
 */
function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.setAttribute('data-id', review.id);

    const formattedDate = new Date(review.date_posted).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
    });

    card.innerHTML = `
        <div class="d-flex justify-content-between">
            <h5>${review.title}</h5>
            <small class="text-muted">ID: ${review.id}</small>
        </div>
        <p>${review.content}</p>
        <small class="text-muted">Postado em: ${formattedDate}</small>
        <div class="mt-3">
            <button class="btn btn-sm btn-outline-secondary edit-btn">Editar</button>
            <button class="btn btn-sm btn-outline-danger delete-btn">Deletar</button>
        </div>
    `;

    card.querySelector('.edit-btn').addEventListener('click', () => populateFormForEdit(review));
    card.querySelector('.delete-btn').addEventListener('click', () => deleteReview(review.id));
    return card;
}

/**
 * Preenche o formulário com os dados de um review existente para edição.
 * @param {object} review - O objeto do review a ser editado.
 */
function populateFormForEdit(review) {
    reviewIdField.value = review.id;
    titleField.value = review.title;
    contentField.value = review.content;
    formTitle.textContent = 'Editando Review';
    cancelEditBtn.classList.remove('d-none');
    window.scrollTo(0, 0);
}

/**
 * Limpa o formulário e o restaura para o modo de criação.
 */
function resetForm() {
    reviewForm.reset();
    reviewIdField.value = '';
    formTitle.textContent = 'Postar um Novo Review';
    cancelEditBtn.classList.add('d-none');
}

/**
 * Deleta um review pelo seu ID após confirmação do usuário.
 * @param {number} id - O ID do review a ser deletado.
 */
async function deleteReview(id) {
    if (!confirm('Tem certeza de que deseja deletar este review?')) {
        return;
    }
    try {
        const response = await fetch(`${API_URL}/reviews/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Falha ao deletar o review.');
        const cardToRemove = reviewsList.querySelector(`[data-id='${id}']`);
        if (cardToRemove) cardToRemove.remove();
    } catch (error) {
        console.error('Erro ao deletar:', error);
        alert('Não foi possível deletar o review.');
    }
}

/**
 * Lida com o envio do formulário principal (criar/editar).
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    const id = reviewIdField.value;
    const reviewData = {
        title: titleField.value,
        content: contentField.value,
    };
    try {
        let response;
        if (id) {
            response = await fetch(`${API_URL}/reviews/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData),
            });
        } else {
            response = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData),
            });
        }
        if (!response.ok) throw new Error('A requisição falhou.');
        resetForm();
        fetchAndRenderReviews();
    } catch (error) {
        console.error('Erro ao salvar review:', error);
        alert('Não foi possível salvar o review.');
    }
}

/**
 * Lida com o envio do formulário de busca.
 */
async function handleSearch(event) {
    event.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
        fetchAndRenderReviews();
        return;
    }
    try {
        const response = await fetch(`${API_URL}/reviews/search?term=${searchTerm}`);
        if (!response.ok) throw new Error('Erro ao buscar reviews.');
        const reviews = await response.json();
        renderReviews(reviews);
    } catch (error) {
        console.error('Falha na busca:', error);
        alert('Não foi possível realizar a busca.');
    }
}

/**
 * Limpa o campo de busca e recarrega todos os reviews.
 */
function handleClearSearch() {
    searchInput.value = ''; // Limpa o texto do input
    fetchAndRenderReviews(); // Executa a busca geral
}

// Listener para o formulário principal
reviewForm.addEventListener('submit', handleFormSubmit);

// Listener para o botão de cancelar
cancelEditBtn.addEventListener('click', resetForm);

// Listener para o formulário de busca
searchForm.addEventListener('submit', handleSearch);

// Adiciona o evento de clique ao novo botão.
clearSearchBtn.addEventListener('click', handleClearSearch);

// Listener para carregar os dados iniciais quando a página carregar
document.addEventListener('DOMContentLoaded', fetchAndRenderReviews);