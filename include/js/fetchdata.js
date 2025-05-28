document.addEventListener('DOMContentLoaded', async () => {
    const vocabularyTableBody = document.querySelector('#vocabularyTable tbody');
    const paginationControls = document.getElementById('paginationControls');

    const ITEMS_PER_PAGE = 5;
    const MAX_PAGES_DISPLAYED = 5;
    let currentPage = 1;
    let allVocabularyData = [];

    if (!vocabularyTableBody || !paginationControls) {
        console.warn("Salah satu elemen DOM penting untuk Vocabulary atau Pagination tidak ditemukan.");
        return;
    }

    function displayVocabulary(page) {
        vocabularyTableBody.innerHTML = '';

        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedData = allVocabularyData.slice(startIndex, endIndex);

        if (paginatedData.length === 0 && allVocabularyData.length > 0) {
            currentPage--;
            displayVocabulary(currentPage);
            return;
        } else if (paginatedData.length === 0 && allVocabularyData.length === 0) {
            vocabularyTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center;">Tidak ada kosakata yang tersedia.</td></tr>`;
            renderPaginationControls();
            return;
        }

        paginatedData.forEach(vocab => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><h3>${vocab.word}</h3></td>
                <td><p>${vocab.translation}</p></td>
                <td><p class="example">${vocab.example}</p></td>
            `;
            vocabularyTableBody.appendChild(row);
        });

        renderPaginationControls();
    }

    // Fungsi untuk membuat dan merender tombol-tombol pagination
    function renderPaginationControls() {
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil(allVocabularyData.length / ITEMS_PER_PAGE);
       
        const prevBtn = document.createElement('button');
        prevBtn.id = 'prevPageBtn';
        prevBtn.textContent = 'Previous';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayVocabulary(currentPage);
            }
        });
        paginationControls.appendChild(prevBtn);

        let startPage = Math.max(1, currentPage - Math.floor(MAX_PAGES_DISPLAYED / 2));
        let endPage = Math.min(totalPages, startPage + MAX_PAGES_DISPLAYED - 1);

        if (endPage - startPage + 1 < MAX_PAGES_DISPLAYED) {
            startPage = Math.max(1, endPage - MAX_PAGES_DISPLAYED + 1);
        }

        if (startPage > 1) {
            const firstPageBtn = document.createElement('button');
            firstPageBtn.classList.add('page-number');
            firstPageBtn.textContent = '1';
            firstPageBtn.addEventListener('click', () => {
                currentPage = 1;
                displayVocabulary(currentPage);
            });
            paginationControls.appendChild(firstPageBtn);
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.classList.add('ellipsis');
                ellipsis.textContent = '...';
                paginationControls.appendChild(ellipsis);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.classList.add('page-number');
            pageBtn.textContent = i;
            if (i === currentPage) {
                pageBtn.classList.add('active');
                pageBtn.disabled = true;
            }
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                displayVocabulary(currentPage);
            });
            paginationControls.appendChild(pageBtn);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.classList.add('ellipsis');
                ellipsis.textContent = '...';
                paginationControls.appendChild(ellipsis);
            }
            const lastPageBtn = document.createElement('button');
            lastPageBtn.classList.add('page-number');
            lastPageBtn.textContent = totalPages;
            lastPageBtn.addEventListener('click', () => {
                currentPage = totalPages;
                displayVocabulary(currentPage);
            });
            paginationControls.appendChild(lastPageBtn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.id = 'nextPageBtn';
        nextBtn.textContent = 'Next';
        nextBtn.disabled = currentPage === totalPages || allVocabularyData.length === 0;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayVocabulary(currentPage);
            }
        });
        paginationControls.appendChild(nextBtn);
    }

    try {
        const response = await fetch('include/data/vocabulary.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allVocabularyData = await response.json();

        if (allVocabularyData.length === 0) {
             vocabularyTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center;">Tidak ada kosakata yang tersedia.</td></tr>`;
        }

        displayVocabulary(currentPage);
    } catch (error) {
        console.error('Error loading vocabulary:', error);
        vocabularyTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: red;">Gagal memuat kosakata. Silakan coba lagi nanti.</td></tr>`;
        renderPaginationControls();
    }
});
