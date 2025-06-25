// Estado Global de la Aplicación
let currentUser = '';
let products = [];
let filteredProducts = [];
let cart = [];
let categories = [];

// Elementos del DOM
const welcomeScreen = document.getElementById('welcome-screen');
const storeScreen = document.getElementById('store-screen');
const userNameInput = document.getElementById('user-name');
const continueBtn = document.getElementById('continue-btn');
const userNameDisplay = document.getElementById('user-name-display');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const categoryFilter = document.getElementById('category-filter');
const sortSelect = document.getElementById('sort-select');
const loadingElement = document.getElementById('loading');
const errorState = document.getElementById('error-state');
const retryBtn = document.getElementById('retry-btn');
const productsGrid = document.getElementById('products-grid');
const noResults = document.getElementById('no-results');
const cartBtn = document.getElementById('cart-btn');
const cartCount = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const emptyCart = document.getElementById('empty-cart');
const cartItems = document.getElementById('cart-items');
const cartFooter = document.getElementById('cart-footer');
const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total');
const clearCartBtn = document.getElementById('clear-cart');
const checkoutBtn = document.getElementById('checkout-btn');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notification-text');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Cargar datos del localStorage
    loadFromStorage();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Si hay un usuario guardado, ir directamente a la tienda
    if (currentUser) {
        showStore();
    }
}

function loadFromStorage() {
    currentUser = localStorage.getItem('carriexpress_user') || '';
    const savedCart = localStorage.getItem('carriexpress_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function saveToStorage() {
    localStorage.setItem('carriexpress_user', currentUser);
    localStorage.setItem('carriexpress_cart', JSON.stringify(cart));
}

function setupEventListeners() {
    // Pantalla de bienvenida
    userNameInput.addEventListener('input', handleNameInput);
    userNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !continueBtn.disabled) {
            handleContinue();
        }
    });
    continueBtn.addEventListener('click', handleContinue);
    
    // Búsqueda y filtros
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    categoryFilter.addEventListener('change', handleFilter);
    sortSelect.addEventListener('change', handleSort);
    
    // Carrito
    cartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    clearCartBtn.addEventListener('click', handleClearCart);
    checkoutBtn.addEventListener('click', handleCheckout);
    
    // Cerrar modal al hacer clic en overlay
    cartModal.addEventListener('click', function(e) {
        if (e.target === cartModal || e.target.classList.contains('cart-overlay')) {
            closeCart();
        }
    });
    
    // Tecla Escape para cerrar modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !cartModal.classList.contains('hidden')) {
            closeCart();
        }
    });
    
    // Botón de reintentar
    retryBtn.addEventListener('click', loadProducts);
}

function handleNameInput() {
    const name = userNameInput.value.trim();
    continueBtn.disabled = name.length < 2;
}

function handleContinue() {
    const name = userNameInput.value.trim();
    if (name.length >= 2) {
        currentUser = name;
        saveToStorage();
        showStore();
    }
}

function showStore() {
    userNameDisplay.textContent = currentUser;
    welcomeScreen.classList.add('hidden');
    storeScreen.classList.remove('hidden');
    updateCartUI();
    loadProducts();
}

async function loadProducts() {
    try {
        showLoading();
        
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) {
            throw new Error('Error al cargar productos');
        }
        
        products = await response.json();
        filteredProducts = [...products];
        
        // Extraer categorías únicas
        categories = [...new Set(products.map(product => product.category))];
        populateCategories();
        
        hideLoading();
        renderProducts();
        
    } catch (error) {
        console.error('Error loading products:', error);
        showError();
    }
}

function showLoading() {
    loadingElement.classList.remove('hidden');
    errorState.classList.add('hidden');
    productsGrid.classList.add('hidden');
    noResults.classList.add('hidden');
}

function hideLoading() {
    loadingElement.classList.add('hidden');
}

function showError() {
    hideLoading();
    errorState.classList.remove('hidden');
    productsGrid.classList.add('hidden');
    noResults.classList.add('hidden');
}

function populateCategories() {
    categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });
}

function renderProducts() {
    if (filteredProducts.length === 0) {
        productsGrid.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    productsGrid.classList.remove('hidden');
    
    productsGrid.innerHTML = '';
    
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Generar estrellas para el rating
    const fullStars = Math.floor(product.rating.rate);
    const hasHalfStar = product.rating.rate % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '★'.repeat(fullStars);
    if (hasHalfStar) starsHTML += '☆';
    starsHTML += '☆'.repeat(emptyStars);
    
    card.innerHTML = `
        <img src="${product.image}" alt="${product.title}" class="product-image" 
             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect width=%22200%22 height=%22200%22 fill=%22%23f0f0f0%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22>Imagen no disponible</text></svg>'">
        <div class="product-category">${product.category}</div>
        <h3 class="product-title">${product.title}</h3>
        <div class="product-rating">
            <span class="stars">${starsHTML}</span>
            <span class="rating-text">(${product.rating.count} reseñas)</span>
        </div>
        <div class="product-price">US$ ${product.price.toFixed(2)}</div>
        <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
            🛒 Agregar al Carrito
        </button>
    `;
    
    return card;
}

function handleSearch() {
    const query = searchInput.value.trim();
    
    if (query) {
        clearSearchBtn.classList.remove('hidden');
    } else {
        clearSearchBtn.classList.add('hidden');
    }
    
    applyFiltersAndSort();
}

function clearSearch() {
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    applyFiltersAndSort();
}

function handleFilter() {
    applyFiltersAndSort();
}

function handleSort() {
    applyFiltersAndSort();
}

function applyFiltersAndSort() {
    const searchQuery = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    const sortOption = sortSelect.value;
    
    // Filtrar productos
    filteredProducts = products.filter(product => {
        const matchesSearch = !searchQuery || 
            product.title.toLowerCase().includes(searchQuery) ||
            product.description.toLowerCase().includes(searchQuery) ||
            product.category.toLowerCase().includes(searchQuery);
        
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    // Ordenar productos
    switch (sortOption) {
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
            break;
        default:
            // Orden por defecto (por ID)
            filteredProducts.sort((a, b) => a.id - b.id);
    }
    
    renderProducts();
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveToStorage();
    updateCartUI();
    showNotification('Producto añadido al carrito');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveToStorage();
    updateCartUI();
    renderCartItems();
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveToStorage();
        updateCartUI();
        renderCartItems();
    }
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (totalItems === 0) {
        cartCount.style.display = 'none';
    } else {
        cartCount.style.display = 'flex';
    }
}

function openCart() {
    cartModal.classList.remove('hidden');
    renderCartItems();
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
}

function closeCart() {
    cartModal.classList.add('hidden');
    document.body.style.overflow = 'auto'; // Restaurar scroll del body
}

function renderCartItems() {
    if (cart.length === 0) {
        emptyCart.classList.remove('hidden');
        cartItems.classList.add('hidden');
        cartFooter.classList.add('hidden');
        return;
    }
    
    emptyCart.classList.add('hidden');
    cartItems.classList.remove('hidden');
    cartFooter.classList.remove('hidden');
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        cartItem.innerHTML = `
            <div class="cart-item-content">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image"
                     onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><rect width=%2260%22 height=%2260%22 fill=%22%23f0f0f0%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2210%22>Sin imagen</text></svg>'">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <div class="cart-item-status">
                        <span>✓</span>
                        <span>Disponible</span>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>
                                −
                            </button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">
                                +
                            </button>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span class="cart-item-price">US$ ${itemTotal.toFixed(2)}</span>
                            <button class="remove-item-btn" onclick="removeFromCart(${item.id})" title="Eliminar producto">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    // Actualizar totales
    subtotalElement.textContent = `US$ ${total.toFixed(2)}`;
    totalElement.textContent = `US$ ${total.toFixed(2)}`;
}

function handleClearCart() {
    if (cart.length > 0) {
        const confirmed = confirm('¿Estás seguro de que deseas vaciar todo el carrito?');
        if (confirmed) {
            cart = [];
            saveToStorage();
            updateCartUI();
            renderCartItems();
            showNotification('Carrito vaciado exitosamente');
        }
    }
}

function handleCheckout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega productos antes de proceder con la compra.');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    alert(`¡Gracias por tu compra, ${currentUser}!\n\n` +
          `Resumen de tu pedido:\n` +
          `• ${itemCount} producto${itemCount > 1 ? 's' : ''}\n` +
          `• Total: US$ ${total.toFixed(2)}\n` +
          `• Envío: Gratis\n\n` +
          `Tu pedido será procesado pronto. ¡Gracias por elegir CarriExpress!`);
    
    // Simular compra exitosa
    cart = [];
    saveToStorage();
    updateCartUI();
    closeCart();
    showNotification('¡Compra realizada exitosamente!');
}

function showNotification(message) {
    notificationText.textContent = message;
    notification.classList.remove('hidden');
    
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Función global para manejar errores de imagen
function handleImageError(img) {
    img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Imagen no disponible</text></svg>';
}

// Funciones de utilidad
function formatPrice(price) {
    return `US$ ${price.toFixed(2)}`;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Manejo de eventos de teclado globales
document.addEventListener('keydown', function(e) {
    // Atajo Alt + C para abrir/cerrar carrito
    if (e.altKey && e.key === 'c') {
        e.preventDefault();
        if (cartModal.classList.contains('hidden')) {
            openCart();
        } else {
            closeCart();
        }
    }
    
    // Atajo Ctrl + / para enfocar la búsqueda
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        searchInput.focus();
    }
});

// Manejo de redimensionado de ventana
window.addEventListener('resize', function() {
    // Ajustar modal del carrito en dispositivos móviles
    if (window.innerWidth <= 768 && !cartModal.classList.contains('hidden')) {
        // Reajustar el modal si es necesario
    }
});

// Prevenir zoom en dispositivos móviles al hacer doble tap
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Detectar cuando la aplicación viene del background (para recargar productos si es necesario)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && products.length === 0) {
        loadProducts();
    }
});

// Service Worker para cache (opcional, comentado por simplicidad)
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            }, function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
*/

// Debug helper (solo en desarrollo)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugCarriExpress = {
        currentUser,
        products,
        filteredProducts,
        cart,
        categories,
        clearAllData: function() {
            localStorage.removeItem('carriexpress_user');
            localStorage.removeItem('carriexpress_cart');
            location.reload();
        },
        addTestProducts: function() {
            const testProduct = products[0];
            if (testProduct) {
                for (let i = 0; i < 5; i++) {
                    addToCart(testProduct.id);
                }
            }
        }
    };
    console.log('🛒 CarriExpress Debug Mode - Accede a window.debugCarriExpress para herramientas de debug');
}