const API_URL = 'http://127.0.0.1:5000/api';
let currentPage = 1;
const ITEMS_PER_PAGE = 9;

// Mapeamento dos elementos do HTML para variáveis
const reviewsList = document.getElementById('reviews-list');
const reviewForm = document.getElementById('review-form');
const reviewIdField = document.getElementById('review-id');
const titleField = document.getElementById('title');
const contentField = document.getElementById('content');
const formTitle = document.getElementById('form-title');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const paginationControls = document.getElementById('pagination-controls');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');

// Busca os reviews da API e inicia a renderização na tela.
async function fetchAndRenderReviews(page = 1) {
    window.scrollTo(0, 0);
    searchInput.value = '';
    paginationControls.style.display = 'none';

    try {
        const response = await fetch(`${API_URL}/reviews?page=${page}&per_page=${ITEMS_PER_PAGE}`);
        if (!response.ok) throw new Error('Erro ao buscar os reviews.');
        const data = await response.json();
        renderReviews(data.items);
        updatePaginationControls(data);
        currentPage = data.page;
    } catch (error) {
        console.error('Falha na requisição:', error);
        alert('Não foi possível carregar os reviews.');
    }
}

// Atualiza os botões e texto da paginação com base nos dados da API.
function updatePaginationControls(paginationData) {
    if (paginationData.total_pages > 0) {
        pageInfo.textContent = `Página ${paginationData.page} de ${paginationData.total_pages}`;
        prevBtn.disabled = !paginationData.has_prev;
        nextBtn.disabled = !paginationData.has_next;
        paginationControls.style.display = 'flex';
    } else {
        paginationControls.style.display = 'none';
    }
}

// Limpa a lista atual e renderiza os cards de review na tela.
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

// Cria o HTML de um único card de review e anexa os eventos de clique.
function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.setAttribute('data-id', review.id);
    
    const formattedDate = new Date(review.date_posted).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

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

// Preenche o formulário com os dados de um review para edição.
function populateFormForEdit(review) {
    reviewIdField.value = review.id;
    titleField.value = review.title;
    contentField.value = review.content;
    formTitle.textContent = 'Editando Review';
    cancelEditBtn.classList.remove('d-none');
    window.scrollTo(0, 0);
}

// Limpa o formulário, retornando ao estado de "criar novo".
function resetForm() {
    reviewForm.reset();
    reviewIdField.value = '';
    formTitle.textContent = 'Postar um Novo Review';
    cancelEditBtn.classList.add('d-none');
}

// Envia uma requisição para deletar um review e atualiza a tela.
async function deleteReview(id) {
    if (!confirm('Tem certeza de que deseja deletar este review?')) return;
    try {
        const response = await fetch(`${API_URL}/reviews/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Falha ao deletar o review.');
        fetchAndRenderReviews(currentPage);
    } catch (error) {
        console.error('Erro ao deletar:', error);
        alert('Não foi possível deletar o review.');
    }
}

// Lida com o envio do formulário, decidindo entre criar ou atualizar um review.
async function handleFormSubmit(event) {
    event.preventDefault();
    const id = reviewIdField.value;
    const reviewData = { title: titleField.value, content: contentField.value };
    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/reviews/${id}` : `${API_URL}/reviews`;
        const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reviewData) });
        if (!response.ok) throw new Error('A requisição falhou.');
        resetForm();
        fetchAndRenderReviews(id ? currentPage : 1);
    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Não foi possível salvar o review.');
    }
}

// Lida com o envio do formulário de busca.
async function handleSearch(event) {
    event.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
        fetchAndRenderReviews(1);
        return;
    }
    try {
        const response = await fetch(`${API_URL}/reviews/search?term=${searchTerm}`);
        if (!response.ok) throw new Error('Erro na busca.');
        const reviews = await response.json();
        renderReviews(reviews);
        paginationControls.style.display = 'none';
    } catch (error) {
        console.error('Falha na busca:', error);
        alert('Não foi possível realizar a busca.');
    }
}

// Limpa a busca e recarrega a lista completa de reviews.
function handleClearSearch() {
    searchInput.value = '';
    fetchAndRenderReviews(1);
}

// Adiciona os "ouvintes" de eventos aos elementos da página
reviewForm.addEventListener('submit', handleFormSubmit);
cancelEditBtn.addEventListener('click', resetForm);
searchForm.addEventListener('submit', handleSearch);
clearSearchBtn.addEventListener('click', handleClearSearch);
prevBtn.addEventListener('click', () => { if (currentPage > 1) fetchAndRenderReviews(currentPage - 1); });
nextBtn.addEventListener('click', () => fetchAndRenderReviews(currentPage + 1));
document.addEventListener('DOMContentLoaded', () => fetchAndRenderReviews(1));
