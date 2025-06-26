// === VARIABLES GLOBALES ===
let productos = [];
let carrito = [];
let nombreUsuario = '';
let carritoVisible = false;

// === ELEMENTOS DEL DOM ===
const elementos = {
    paginaInicio: document.getElementById('pagina-inicio'),
    paginaPrincipal: document.getElementById('pagina-principal'),
    carritoContainer: document.getElementById('carrito-container'),
    mensajeBienvenida: document.getElementById('mensaje-bienvenida'),
    productosContainer: document.getElementById('productos-container'),
    categoriaSelect: document.getElementById('categoria-select'),
    busquedaInput: document.getElementById('busqueda-input'),
    ordenamientoSelect: document.getElementById('ordenamiento-select'),
    contadorCarrito: document.getElementById('contador-carrito'),
    carritoContenido: document.getElementById('carrito-contenido'),
    totalCarrito: document.getElementById('total-carrito'),
    formularioNombre: document.getElementById('formulario-nombre'),
    nombreInput: document.getElementById('nombre-input'),
    carritoToggle: document.getElementById('carrito-toggle'),
    carritoBadge: document.getElementById('carrito-badge'),
    btnCerrarSesion: document.getElementById('btn-cerrar-sesion')
};

// === FUNCIONES DEL CARRITO ===
function cargarCarritoDesdeStorage() {
    try {
        const carritoGuardado = localStorage.getItem('carritoCarriExpress');
        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
        }
    } catch (error) {
        console.warn('Error al cargar carrito desde localStorage:', error);
        carrito = [];
    }
}

function guardarCarritoEnStorage() {
    try {
        localStorage.setItem('carritoCarriExpress', JSON.stringify(carrito));
    } catch (error) {
        console.warn('Error al guardar carrito en localStorage:', error);
    }
}

function agregarAlCarrito(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    const itemExistente = carrito.find(item => item.id === productoId);

    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            id: producto.id,
            title: producto.title,
            price: producto.price,
            image: producto.image,
            cantidad: 1
        });
    }

    guardarCarritoEnStorage();
    renderizarCarrito();
    mostrarNotificacionAgregarCarrito(producto.title);
}

function eliminarDelCarrito(productoId) {
    const indice = carrito.findIndex(item => item.id === productoId);
    if (indice !== -1) {
        carrito.splice(indice, 1);
        guardarCarritoEnStorage();
        renderizarCarrito();
    }
}

function calcularTotalCarrito() {
    return carrito.reduce((total, item) => total + (item.price * item.cantidad), 0);
}

function renderizarCarrito() {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);

    // Actualizar contador en el header
    elementos.contadorCarrito.textContent = totalItems;

    // Actualizar badge del botón carrito
    if (totalItems > 0) {
        elementos.carritoBadge.textContent = totalItems;
        elementos.carritoBadge.classList.remove('hidden');
    } else {
        elementos.carritoBadge.classList.add('hidden');
    }

    if (carrito.length === 0) {
        elementos.carritoContenido.innerHTML = '<div class="carrito-vacio">Tu carrito está vacío</div>';
    } else {
        const itemsHTML = carrito.map(item => `
            <div class="carrito-item">
                <div class="item-info">
                    <div class="item-nombre">${truncarTexto(item.title, 30)}</div>
                    <div class="item-cantidad">Cantidad: ${item.cantidad}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                     <span class="item-precio">$${(item.price * item.cantidad).toFixed(2)}</span>
                    <button class="btn-eliminar" onclick="eliminarDelCarrito(${item.id})">❌</button>
                </div>
            </div>
        `).join('');

        elementos.carritoContenido.innerHTML = itemsHTML;
    }

    const total = calcularTotalCarrito();
    elementos.totalCarrito.textContent = total.toFixed(2);
}

function mostrarNotificacionAgregarCarrito(nombreProducto) {
    // Crear notificación temporal
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        max-width: 300px;
        font-weight: 500;
    `;
    notificacion.textContent = `✅ ${truncarTexto(nombreProducto, 20)} agregado al carrito`;

    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.remove();
    }, 3000);
}

function toggleCarrito() {
    carritoVisible = !carritoVisible;

    if (carritoVisible) {
        elementos.carritoContainer.classList.add('mostrar');
    } else {
        elementos.carritoContainer.classList.remove('mostrar');
    }
}

// === FUNCIONES DE PRODUCTOS ===
async function cargarProductos() {
    try {
        elementos.productosContainer.innerHTML = '<div class="loading">Cargando productos...</div>';

        const respuesta = await fetch('https://fakestoreapi.com/products');
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        productos = await respuesta.json();
        cargarCategorias();
        renderizarProductos();

    } catch (error) {
        console.error('Error al cargar productos:', error);
        elementos.productosContainer.innerHTML = `
            <div class="mensaje-sin-productos">
                <h3>❌ Error al cargar productos</h3>
                <p>No se pudieron cargar los productos. Por favor, recarga la página.</p>
                <button onclick="cargarProductos()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Intentar de nuevo
                </button>
            </div>
        `;
    }
}

function cargarCategorias() {
    const categorias = [...new Set(productos.map(p => p.category))];

    // Limpiar opciones existentes (excepto la primera)
    elementos.categoriaSelect.innerHTML = '<option value="">📂 Todas las categorías</option>';

    categorias.forEach(categoria => {
        const opcion = document.createElement('option');
        opcion.value = categoria;
        opcion.textContent = `📁 ${capitalizarPrimeraLetra(categoria)}`;
        elementos.categoriaSelect.appendChild(opcion);
    });
}

function filtrarProductos() {
    const busqueda = elementos.busquedaInput.value.toLowerCase().trim();
    const categoriaSeleccionada = elementos.categoriaSelect.value;

    return productos.filter(producto => {
        const coincideBusqueda = busqueda === '' ||
            producto.title.toLowerCase().includes(busqueda) ||
            producto.description.toLowerCase().includes(busqueda);

        const coincideCategoria = categoriaSeleccionada === '' ||
            producto.category === categoriaSeleccionada;

        return coincideBusqueda && coincideCategoria;
    });
}

function ordenarProductos(productosArray) {
    const orden = elementos.ordenamientoSelect.value;
    const copia = [...productosArray];

    switch (orden) {
        case 'precioAsc':
            return copia.sort((a, b) => a.price - b.price);
        case 'precioDesc':
            return copia.sort((a, b) => b.price - a.price);
        case 'nombreAsc':
            return copia.sort((a, b) => a.title.localeCompare(b.title));
        case 'nombreDesc':
            return copia.sort((a, b) => b.title.localeCompare(a.title));
        default:
            return copia;
    }
}

function renderizarProductos() {
    const productosFiltrados = filtrarProductos();
    const productosOrdenados = ordenarProductos(productosFiltrados);

    if (productosOrdenados.length === 0) {
        elementos.productosContainer.innerHTML = `
            <div class="mensaje-sin-productos">
                <h3>🔍 No se encontraron productos</h3>
                <p>Intenta con otros términos de búsqueda o categoría.</p>
            </div>
        `;
        return;
    }


    const productosHTML = productosOrdenados.map(producto => `
        <div class="producto-card">
            <div class="producto-img-container">
                <img src="${producto.image}" alt="${producto.title}" class="producto-img" 
                    onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTZiMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=='" />
            </div>
            <div class="producto-info">
                <div class="producto-category">${capitalizarPrimeraLetra(producto.category)}</div>
                <div class="producto-title">${producto.title}</div>
                <div class="producto-price">$${producto.price.toFixed(2)}</div>
                <button class="producto-btn" onclick="agregarAlCarrito(${producto.id})">
                    🛒 Agregar al Carrito
                </button>
            </div>
        </div>
    `).join('');

    elementos.productosContainer.innerHTML = `<div class="productos-grid">${productosHTML}</div>`;
}

// === FUNCIONES DE UTILIDAD ===
function truncarTexto(texto, maxLength) {
    return texto.length > maxLength ? texto.substring(0, maxLength) + '...' : texto;
}

function capitalizarPrimeraLetra(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function cargarNombreUsuario() {
    try {
        const nombreGuardado = localStorage.getItem('nombreUsuarioCarriExpress');
        if (nombreGuardado) {
            nombreUsuario = nombreGuardado;
            mostrarPaginaPrincipal();
        }
    } catch (error) {
        console.warn('Error al cargar nombre de usuario:', error);
    }
}

function guardarNombreUsuario(nombre) {
    try {
        nombreUsuario = nombre;
        localStorage.setItem('nombreUsuarioCarriExpress', nombre);
    } catch (error) {
        console.warn('Error al guardar nombre de usuario:', error);
    }
}

function mostrarPaginaPrincipal() {
    elementos.paginaInicio.classList.add('hidden');
    elementos.paginaPrincipal.classList.remove('hidden');
    elementos.mensajeBienvenida.textContent = `¡Hola ${nombreUsuario}! 🎉 Encuentra los mejores productos`;

    cargarProductos();
    renderizarCarrito();
}

// === EVENT LISTENERS ===
elementos.formularioNombre.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const nombre = elementos.nombreInput.value.trim();
    if (nombre.length < 2) {
        alert('❌ Por favor ingresa un nombre válido (mínimo 2 caracteres)');
        return;
    }

    guardarNombreUsuario(nombre);
    mostrarPaginaPrincipal();
});

elementos.busquedaInput.addEventListener('input', renderizarProductos);
elementos.categoriaSelect.addEventListener('change', renderizarProductos);
elementos.ordenamientoSelect.addEventListener('change', renderizarProductos);

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', function () {
    cargarCarritoDesdeStorage();
    cargarNombreUsuario();

    // Si no hay nombre guardado, mostrar página de inicio
    if (!nombreUsuario) {
        elementos.paginaInicio.classList.remove('hidden');
    }
});

// === FUNCIÓN CERRAR SESIÓN ===
function cerrarSesion() {
    // Limpiar datos del usuario
    nombreUsuario = '';
    
    // Limpiar localStorage
    try {
        localStorage.removeItem('nombreUsuarioCarriExpress');
    } catch (error) {
        console.warn('Error al limpiar localStorage:', error);
    }
    
    // Ocultar carrito si está visible
    if (carritoVisible) {
        toggleCarrito();
    }
    
    // Mostrar página de inicio y ocultar página principal
    elementos.paginaPrincipal.classList.add('hidden');
    elementos.paginaInicio.classList.remove('hidden');
    
    // Limpiar el input del nombre
    elementos.nombreInput.value = '';
    elementos.nombreInput.focus();
}

// === FUNCIÓN HACER COMPRA ===
function hacerCompra() {
    if (carrito.length === 0) {
        alert('❌ Tu carrito está vacío. Agrega productos antes de hacer la compra.');
        return;
    }
    
    const total = calcularTotalCarrito();
    const cantidadItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    
    const confirmacion = confirm(
        `🛒 Confirmar Compra\n\n` +
        `Total de productos: ${cantidadItems}\n` +
        `Total a pagar: $${total.toFixed(2)}\n\n` +
        `¿Deseas confirmar tu compra?`
    );
    
    if (confirmacion) {
        // Simular proceso de compra
        mostrarNotificacionCompra(total);
        
        // Limpiar carrito
        carrito = [];
        guardarCarritoEnStorage();
        renderizarCarrito();
        
        // Cerrar carrito
        if (carritoVisible) {
            toggleCarrito();
        }
    }
}

// === FUNCIÓN VACIAR CARRITO ===
function vaciarCarrito() {
    if (carrito.length === 0) {
        alert('❌ El carrito ya está vacío.');
        return;
    }
    
    const confirmacion = confirm('🗑️ ¿Estás seguro que deseas eliminar todos los productos del carrito?');
    
    if (confirmacion) {
        carrito = [];
        guardarCarritoEnStorage();
        renderizarCarrito();
        
        // Mostrar notificación
        mostrarNotificacionVaciarCarrito();
    }
}

// === FUNCIÓN NOTIFICACIÓN COMPRA ===
function mostrarNotificacionCompra(total) {
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 1001;
        text-align: center;
        max-width: 400px;
        width: 90%;
    `;
    
    notificacion.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
        <h3 style="margin-bottom: 0.5rem; font-size: 1.5rem;">¡Compra Exitosa!</h3>
        <p style="margin-bottom: 1rem;">Tu pedido por $${total.toFixed(2)} ha sido procesado correctamente.</p>
        <p style="font-size: 0.9rem; opacity: 0.9;">¡Gracias por tu compra ${nombreUsuario}!</p>
    `;
    
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        overlay.remove();
        notificacion.remove();
    }, 4000);
}

// === FUNCIÓN NOTIFICACIÓN VACIAR CARRITO ===
function mostrarNotificacionVaciarCarrito() {
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        max-width: 300px;
        font-weight: 500;
    `;
    notificacion.textContent = `🗑️ Carrito vacío correctamente`;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.remove();
    }, 3000);
}

// === AGREGAR A LAS FUNCIONES GLOBALES ===
window.cerrarSesion = cerrarSesion;
window.hacerCompra = hacerCompra;
window.vaciarCarrito = vaciarCarrito;