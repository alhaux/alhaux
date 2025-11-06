// Función para actualizar la paginación
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const paginationContainer = document.querySelector('.pagination');
    let paginationHTML = '';

    // Botón anterior
    paginationHTML += `
        <a href="#" class="page ${currentPage === 1 ? 'disabled' : ''}" 
           onclick="changePage(${currentPage - 1}); return false;">
            ← Anterior
        </a>
    `;

    // Páginas numéricas
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 || // Primera página
            i === totalPages || // Última página
            (i >= currentPage - 1 && i <= currentPage + 1) // Páginas alrededor de la actual
        ) {
            paginationHTML += `
                <a href="#" class="page ${i === currentPage ? 'active' : ''}" 
                   onclick="changePage(${i}); return false;">
                    ${i}
                </a>
            `;
        } else if (
            i === currentPage - 2 ||
            i === currentPage + 2
        ) {
            paginationHTML += '<span class="page-dots">...</span>';
        }
    }

    // Botón siguiente
    paginationHTML += `
        <a href="#" class="page ${currentPage === totalPages ? 'disabled' : ''}" 
           onclick="changePage(${currentPage + 1}); return false;">
            Siguiente →
        </a>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

// Función para cambiar de página
function changePage(newPage) {
    if (newPage < 1 || newPage > Math.ceil(allDesigns.length / ITEMS_PER_PAGE)) {
        return;
    }
    currentPage = newPage;
    loadDesigns(currentCategory, currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Función para filtrar por categoría
function filterByCategory(category) {
    currentCategory = category;
    currentPage = 1;
    
    // Actualizar estado visual de los botones de categoría
    document.querySelectorAll('#categoriasList a').forEach(link => {
        link.classList.remove('active');
        if (
            (category === 'all' && link.textContent === 'Todos los diseños') ||
            link.textContent === category
        ) {
            link.classList.add('active');
        }
    });
    
    loadDesigns(category, currentPage);
}

// Función para filtrar por precio
function filterByPrice(priceType) {
    const designsGrid = document.getElementById('catalogoGrid');
    designsGrid.innerHTML = '';
    
    let filteredDesigns = [...allDesigns];
    
    if (priceType === 'premium') {
        filteredDesigns = filteredDesigns.filter(design => parseFloat(design.price) > 0);
    } else if (priceType === 'gratis') {
        filteredDesigns = filteredDesigns.filter(design => parseFloat(design.price) === 0);
    }
    
    updateDesignsCount(filteredDesigns.length);
    displayPaginatedDesigns(filteredDesigns, 1);
}

// Actualizar contadores de categorías por tipo (gratis/premium)
function updateCategoryCounts() {
    if (!allDesigns || allDesigns.length === 0) return;

    const cats = ['INTERCLASES','FUTSALEROS','EQUIPOS OFICIALES','INTERNACIONALES'];
    // total
    const totalElem = document.getElementById('countAll');
    if (totalElem) totalElem.textContent = allDesigns.length;

    cats.forEach(cat => {
        if (!cat || typeof cat !== 'string') {
            console.warn('Categoría inválida encontrada:', cat);
            return;
        }
        
        const gratisCount = allDesigns.filter(d => d.category === cat && d.priceType === 'gratis').length;
        const premiumCount = allDesigns.filter(d => d.category === cat && d.priceType === 'premium').length;

        const gEl = document.getElementById(`count-${cat.toLowerCase().replace(/ /g,'-')}-gratis`);
        const pEl = document.getElementById(`count-${cat.toLowerCase().replace(/ /g,'-')}-premium`);
        if (gEl) gEl.textContent = gratisCount;
        if (pEl) pEl.textContent = premiumCount;
    });
}

// Filtrar por categoría y tipo (gratis/premium)
async function filterByCategoryAndPrice(category, priceType, el) {
    currentCategory = category;
    currentPage = 1;

    // actualizar UI activo
    document.querySelectorAll('.category-link').forEach(link => link.classList.remove('active'));
    if (el && el.classList) el.classList.add('active');

    // Asegurar que allDesigns esté cargado
    if (!allDesigns || allDesigns.length === 0) {
        await loadDesigns('all', 1);
    }

    const filtered = allDesigns.filter(d => d.category === category && d.priceType === priceType);
    updateDesignsCount(filtered.length);
    displayPaginatedDesigns(filtered, 1);
}

// Mostrar todos los diseños (limpia filtros)
async function showAllDesigns() {
    // limpiar estado activo
    document.querySelectorAll('.category-link').forEach(link => link.classList.remove('active'));
    const allLink = document.querySelector('#categoriasList .category-link');
    if (allLink) allLink.classList.add('active');

    currentCategory = 'all';
    currentPage = 1;

    // Forzar recarga desde Firestore
    await loadDesigns('all', 1);
}

// Función para manejar la compra
async function handleBuyClick(designId) {
    const user = auth.currentUser;
    
    if (!user) {
        Swal.fire({
            title: '¿Quieres comprar este diseño?',
            text: 'Necesitas iniciar sesión primero',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Iniciar sesión',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'login.html';
            }
        });
        return;
    }

    try {
        const designDoc = await db.collection('designs').doc(designId).get();
        const design = designDoc.data();
        
        const priceLabel = (design.priceType === 'gratis' || parseFloat(design.price) === 0) ? 'Gratis' : `S/ ${parseFloat(design.price).toFixed(2)}`;

        Swal.fire({
            title: `¿Comprar "${design.name}"?`,
            text: `Precio: ${priceLabel}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Comprar ahora',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Aquí iría la lógica de procesamiento de pago
                processPurchase(designId, design);
            }
        });
    } catch (error) {
        console.error('Error al obtener detalles del diseño:', error);
        Swal.fire('Error', 'No se pudo procesar la compra', 'error');
    }
}

// Función para procesar la compra
async function processPurchase(designId, design) {
    try {
        // Aquí se integraría con el sistema de pagos real
        // Por ahora solo simularemos una compra exitosa
        
        await db.collection('purchases').add({
            userId: auth.currentUser.uid,
            designId: designId,
            designName: design.name,
            price: design.price,
            purchaseDate: firebase.firestore.FieldValue.serverTimestamp()
        });

        Swal.fire({
            title: '¡Compra exitosa!',
            text: 'Tu diseño estará disponible en tu panel de usuario',
            icon: 'success',
            confirmButtonText: 'Ver mis compras',
            showCancelButton: true,
            cancelButtonText: 'Seguir comprando'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'dashboard.html';
            }
        });
    } catch (error) {
        console.error('Error al procesar la compra:', error);
        Swal.fire('Error', 'No se pudo completar la compra', 'error');
    }
}

// Función para la búsqueda
function searchDesigns(query) {
    query = query.toLowerCase().trim();
    if (!query) {
        loadDesigns(currentCategory, 1);
        return;
    }

    const filteredDesigns = allDesigns.filter(design => 
        design.name.toLowerCase().includes(query) ||
        design.category.toLowerCase().includes(query) ||
        (design.description && design.description.toLowerCase().includes(query))
    );

    displayPaginatedDesigns(filteredDesigns, 1);
    updateDesignsCount(filteredDesigns.length);
}

// Función auxiliar para mostrar diseños paginados
function displayPaginatedDesigns(designs, page) {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedDesigns = designs.slice(startIndex, endIndex);
    
    const designsGrid = document.getElementById('catalogoGrid');
    designsGrid.innerHTML = '';

    if (paginatedDesigns.length === 0) {
        designsGrid.innerHTML = '<p class="no-designs">No se encontraron diseños</p>';
        return;
    }

    paginatedDesigns.forEach(design => {
        const designCard = document.createElement('div');
        designCard.className = 'design-card';
        const priceLabel = (design.priceType === 'gratis' || parseFloat(design.price) === 0) ? 'Gratis' : `S/ ${parseFloat(design.price).toFixed(2)}`;

        designCard.innerHTML = `
            <img src="${design.imageUrl}" alt="${design.name}" class="design-image" loading="lazy">
            <div class="design-info">
                <h4>${design.name}</h4>
                <div class="design-details">
                    <p class="design-category">${design.category}</p>
                    <p class="design-price">${priceLabel}</p>
                    <p class="design-formats">Formatos: ${design.formats || 'PNG, PSD'}</p>
                    <button onclick="handleDownloadClick('${design.id}', '${design.name}', '${design.type}', '${design.price || 0}')" class="buy-button">
                        ${design.type === 'gratis' || parseFloat(design.price) === 0 ? '📥 Descargar Gratis' : '💎 Descargar Premium'}
                    </button>
                </div>
            </div>
        `;
        designsGrid.appendChild(designCard);
    });

    updatePagination(designs.length);
}

// Inicializar búsqueda
document.querySelector('.hero-search input').addEventListener('input', (e) => {
    searchDesigns(e.target.value);
});

// Función para scroll al catálogo
function scrollToDesigns() {
    const catalogSection = document.querySelector('.content-center');
    catalogSection.scrollIntoView({ behavior: 'smooth' });
}

// Cargar diseños iniciales
document.addEventListener('DOMContentLoaded', () => {
    loadDesigns();
});