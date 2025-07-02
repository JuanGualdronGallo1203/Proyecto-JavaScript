// === CONSTANTES Y CONFIGURACIÓN ===
const CONFIG = {
    API_URL: 'https://fakestoreapi.com/products',
    STORAGE_KEYS: {
        CART: 'carritoCarriExpress',
        USER_NAME: 'nombreUsuarioCarriExpress'
    },
    MIN_NAME_LENGTH: 2,
    NOTIFICATION_DURATION: 3000,
    SUCCESS_NOTIFICATION_DURATION: 4000
};

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
    carritoOverlay: document.getElementById('carrito-overlay'),
    mensajeBienvenida: document.getElementById('mensaje-bienvenida'),
    productosContainer: document.getElementById('productos-container'),
    categoriaSelect: document.getElementById('categoria-select'),
    busquedaInput: document.getElementById('busqueda-input'),
    ordenamientoSelect: document.getElementById('ordenamiento-select'),
    carritoContenido: document.getElementById('carrito-contenido'),
    totalCarrito: document.getElementById('total-carrito'),
    formularioNombre: document.getElementById('formulario-nombre'),
    nombreInput: document.getElementById('nombre-input'),
    carritoToggle: document.getElementById('carrito-toggle'),
    carritoBadge: document.getElementById('carrito-badge'),
    btnCerrarSesion: document.getElementById('btn-cerrar-sesion')
};

// === FUNCIONES DE UTILIDAD ===
function truncarTexto(texto, maxLength) {
    return texto.length > maxLength ? texto.substring(0, maxLength) + '...' : texto;
}

function capitalizarPrimeraLetra(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function crearElemento(tag, className = '', textContent = '') {
    const elemento = document.createElement(tag);
    if (className) elemento.className = className;
    if (textContent) elemento.textContent = textContent;
    return elemento;
}

function crearImagen(src, alt, className = '') {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    if (className) img.className = className;
    
    // Imagen de fallback
    img.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTZiMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
    };
    
    return img;
}

// === FUNCIONES DE STORAGE ===
function cargarCarritoDesdeStorage() {
    try {
        const carritoGuardado = localStorage.getItem(CONFIG.STORAGE_KEYS.CART);
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
        localStorage.setItem(CONFIG.STORAGE_KEYS.CART, JSON.stringify(carrito));
    } catch (error) {
        console.warn('Error al guardar carrito en localStorage:', error);
    }
}

function cargarNombreUsuario() {
    try {
        const nombreGuardado = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_NAME);
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
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_NAME, nombre);
    } catch (error) {
        console.warn('Error al guardar nombre de usuario:', error);
    }
}

// === FUNCIONES DEL CARRITO ===
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

function actualizarCantidadCarrito(productoId, nuevaCantidad) {
    const item = carrito.find(item => item.id === productoId);
    if (!item) return;

    if (!Number.isInteger(nuevaCantidad) || nuevaCantidad < 0) {
        console.warn(`Cantidad inválida: ${nuevaCantidad}`);
        mostrarNotificacion('❌ Cantidad inválida', 'error');
        return;
    }

    const MAX_CANTIDAD = 99;
    if (nuevaCantidad === 0) {
        eliminarDelCarrito(productoId);
    } else {
        item.cantidad = Math.min(nuevaCantidad, MAX_CANTIDAD);
        guardarCarritoEnStorage();
        renderizarCarrito(); // Re-render to update total and UI
    }
}

function calcularTotalCarrito() {
    return carrito.reduce((total, item) => total + (item.price * item.cantidad), 0);
}

function crearItemCarrito(item) {
    const carritoItem = crearElemento('div', 'carrito-item');

    // Información del producto
    const itemInfo = crearElemento('div', 'item-info');
    const itemNombre = crearElemento('div', 'item-nombre', truncarTexto(item.title, 20)); // Removed truncarTexto to show full name
    const itemCantidadContainer = crearElemento('div', 'item-cantidad-container');

    // Controles de cantidad
    const btnMenos = crearElemento('button', 'btn-cantidad btn-cantidad-menos', '-');
    btnMenos.setAttribute('aria-label', `Reducir cantidad de ${item.title}`);
    btnMenos.setAttribute('title', `Reducir cantidad de ${item.title}`);
    btnMenos.addEventListener('click', () => {
        actualizarCantidadCarrito(item.id, item.cantidad - 1);
    });

    const cantidadSpan = crearElemento('span', 'cantidad-valor', item.cantidad.toString());

    const btnMas = crearElemento('button', 'btn-cantidad btn-cantidad-mas', '+');
    btnMas.setAttribute('aria-label', `Aumentar cantidad de ${item.title}`);
    btnMas.setAttribute('title', `Aumentar cantidad de ${item.title}`);
    btnMas.addEventListener('click', () => {
        actualizarCantidadCarrito(item.id, item.cantidad + 1);
    });

    itemCantidadContainer.appendChild(crearElemento('span', 'cantidad-label', 'Cantidad: '));
    itemCantidadContainer.appendChild(btnMenos);
    itemCantidadContainer.appendChild(cantidadSpan);
    itemCantidadContainer.appendChild(btnMas);

    itemInfo.appendChild(itemNombre);
    itemInfo.appendChild(itemCantidadContainer);

    // Precio y botón eliminar
    const itemActions = crearElemento('div', 'item-actions');
    const itemPrecio = crearElemento('span', 'item-precio', `$${(item.price * item.cantidad).toFixed(2)}`);
    const btnEliminar = crearElemento('button', 'btn-eliminar', '❌');
    btnEliminar.setAttribute('aria-label', `Eliminar ${item.title} del carrito`);
    btnEliminar.setAttribute('title', `Eliminar ${item.title} del carrito`);
    btnEliminar.addEventListener('click', () => {
        eliminarDelCarrito(item.id);
    });

    itemActions.appendChild(itemPrecio);
    itemActions.appendChild(btnEliminar);

    carritoItem.appendChild(itemInfo);
    carritoItem.appendChild(itemActions);

    return carritoItem;
}

function renderizarCarrito() {
    // Always clear content to prevent duplication
    elementos.carritoContenido.innerHTML = '';

    // Header
    const carritoHeader = crearElemento('div', 'carrito-header');
    const carritoTitulo = crearElemento('h3', 'carrito-titulo', '🛒 Mi Carrito');
    const btnCerrarCarrito = crearElemento('button', 'btn-cerrar-carrito', '✕');
    btnCerrarCarrito.setAttribute('aria-label', 'Cerrar carrito');
    btnCerrarCarrito.setAttribute('title', 'Cerrar carrito');
    btnCerrarCarrito.addEventListener('click', cerrarCarrito);
    carritoHeader.appendChild(carritoTitulo);
    carritoHeader.appendChild(btnCerrarCarrito);
    elementos.carritoContenido.appendChild(carritoHeader);

    if (carrito.length === 0) {
        const carritoVacio = crearElemento('div', 'carrito-vacio');
        const icono = crearElemento('div', 'carrito-vacio-icon', '🛒');
        const mensaje = crearElemento('p', '', 'Tu carrito está vacío');
        const submensaje = crearElemento('small', '', 'Agrega productos para comenzar');
        carritoVacio.appendChild(icono);
        carritoVacio.appendChild(mensaje);
        carritoVacio.appendChild(submensaje);
        elementos.carritoContenido.appendChild(carritoVacio);
    } else {
        const itemsContainer = crearElemento('div', 'carrito-items-container');
        carrito.forEach(item => {
            const itemElement = crearItemCarrito(item);
            itemsContainer.appendChild(itemElement);
        });
        elementos.carritoContenido.appendChild(itemsContainer);

        // Footer
        const carritoFooter = crearElemento('div', 'carrito-footer');
        const totalContainer = crearElemento('div', 'total-container');
        const totalLabel = crearElemento('span', 'total-label', 'Total: ');
        const totalValor = crearElemento('span', 'total-valor', `$${calcularTotalCarrito().toFixed(2)}`);
        totalContainer.appendChild(totalLabel);
        totalContainer.appendChild(totalValor);
        const botonesContainer = crearElemento('div', 'botones-container');
        const btnVaciar = crearElemento('button', 'btn-vaciar-carrito', '🗑️ Vaciar Carrito');
        btnVaciar.setAttribute('title', 'Eliminar todos los productos');
        btnVaciar.addEventListener('click', vaciarCarrito);
        const btnComprar = crearElemento('button', 'btn-comprar', '💳 Comprar');
        btnComprar.setAttribute('title', 'Proceder con la compra');
        btnComprar.addEventListener('click', hacerCompra);
        botonesContainer.appendChild(btnVaciar);
        botonesContainer.appendChild(btnComprar);
        carritoFooter.appendChild(totalContainer);
        carritoFooter.appendChild(botonesContainer);
        elementos.carritoContenido.appendChild(carritoFooter);
    }
}

function toggleCarrito() {
    if (elementos.carritoContainer.classList.contains('transitioning')) return;
    elementos.carritoContainer.classList.add('transitioning');

    carritoVisible = !carritoVisible;

    if (carritoVisible) {
        elementos.carritoContainer.classList.add('mostrar');
        elementos.carritoOverlay.classList.add('mostrar');
        document.body.classList.add('carrito-abierto');
        elementos.carritoContenido.querySelector('.btn-cerrar-carrito')?.focus();
    } else {
        elementos.carritoContainer.classList.remove('mostrar');
        elementos.carritoOverlay.classList.remove('mostrar');
        document.body.classList.remove('carrito-abierto');
    }

    setTimeout(() => {
        elementos.carritoContainer.classList.remove('transitioning');
    }, 300);
}

function cerrarCarrito() {
    if (carritoVisible) {
        toggleCarrito();
    }
}

// === FUNCIONES DE PRODUCTOS ===
async function cargarProductos() {
    try {
        // Mostrar mensaje de carga
        elementos.productosContainer.innerHTML = '';
        const loading = crearElemento('div', 'loading', 'Cargando productos...');
        elementos.productosContainer.appendChild(loading);

        const respuesta = await fetch(CONFIG.API_URL);
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        productos = await respuesta.json();
        cargarCategorias();
        renderizarProductos();

    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarErrorCargaProductos();
    }
}

function mostrarErrorCargaProductos() {
    elementos.productosContainer.innerHTML = '';
    
    const errorContainer = crearElemento('div', 'mensaje-sin-productos');
    const titulo = crearElemento('h3', '', '❌ Error al cargar productos');
    const mensaje = crearElemento('p', '', 'No se pudieron cargar los productos. Por favor, recarga la página.');
    
    const btnReintentar = crearElemento('button', 'btn-reintentar', 'Intentar de nuevo');
    btnReintentar.addEventListener('click', cargarProductos);
    
    errorContainer.appendChild(titulo);
    errorContainer.appendChild(mensaje);
    errorContainer.appendChild(btnReintentar);
    
    elementos.productosContainer.appendChild(errorContainer);
}

function cargarCategorias() {
    const categorias = [...new Set(productos.map(p => p.category))];

    // Limpiar opciones existentes (excepto la primera)
    elementos.categoriaSelect.innerHTML = '';
    
    const opcionTodas = crearElemento('option', '', '📂 Todas las categorías');
    opcionTodas.value = '';
    elementos.categoriaSelect.appendChild(opcionTodas);

    categorias.forEach(categoria => {
        const opcion = crearElemento('option', '', `📁 ${capitalizarPrimeraLetra(categoria)}`);
        opcion.value = categoria;
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

function crearTarjetaProducto(producto) {
    const productoCard = crearElemento('div', 'producto-card');

    // Contenedor de imagen
    const imgContainer = crearElemento('div', 'producto-img-container');
    const img = crearImagen(producto.image, producto.title, 'producto-img');
    imgContainer.appendChild(img);

    // Información del producto
    const productoInfo = crearElemento('div', 'producto-info');
    
    const categoria = crearElemento('div', 'producto-category', capitalizarPrimeraLetra(producto.category));
    const titulo = crearElemento('div', 'producto-title', producto.title);
    const precio = crearElemento('div', 'producto-price', `$${producto.price.toFixed(2)}`);
    
    const btnAgregar = crearElemento('button', 'producto-btn', '🛒 Agregar al Carrito');
    btnAgregar.addEventListener('click', () => {
        agregarAlCarrito(producto.id);
    });

    productoInfo.appendChild(categoria);
    productoInfo.appendChild(titulo);
    productoInfo.appendChild(precio);
    productoInfo.appendChild(btnAgregar);

    productoCard.appendChild(imgContainer);
    productoCard.appendChild(productoInfo);

    return productoCard;
}

function renderizarProductos() {
    const productosFiltrados = filtrarProductos();
    const productosOrdenados = ordenarProductos(productosFiltrados);

    // Limpiar contenedor
    elementos.productosContainer.innerHTML = '';

    if (productosOrdenados.length === 0) {
        const sinProductos = crearElemento('div', 'mensaje-sin-productos');
        const titulo = crearElemento('h3', '', '🔍 No se encontraron productos');
        const mensaje = crearElemento('p', '', 'Intenta con otros términos de búsqueda o categoría.');
        
        sinProductos.appendChild(titulo);
        sinProductos.appendChild(mensaje);
        elementos.productosContainer.appendChild(sinProductos);
        return;
    }

    const productosGrid = crearElemento('div', 'productos-grid');
    
    productosOrdenados.forEach(producto => {
        const tarjeta = crearTarjetaProducto(producto);
        productosGrid.appendChild(tarjeta);
    });

    elementos.productosContainer.appendChild(productosGrid);
}

// === FUNCIONES DE NOTIFICACIONES ===
function mostrarNotificacion(mensaje, tipo = 'success', duracion = CONFIG.NOTIFICATION_DURATION) {
    const notificacion = crearElemento('div', `notificacion notificacion-${tipo}`, mensaje);
    
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.remove();
    }, duracion);
}

function mostrarNotificacionAgregarCarrito(nombreProducto) {
    mostrarNotificacion(`✅ ${truncarTexto(nombreProducto, 20)} agregado al carrito`, 'success');
}

function mostrarNotificacionCompra(total) {
    const notificacion = crearElemento('div', 'notificacion-compra');
    
    const icono = crearElemento('div', 'compra-icono', '🎉');
    const titulo = crearElemento('h3', 'compra-titulo', '¡Compra Exitosa!');
    const mensaje = crearElemento('p', 'compra-mensaje', `Tu pedido por $${total.toFixed(2)} ha sido procesado correctamente.`);
    const agradecimiento = crearElemento('p', 'compra-agradecimiento', `¡Gracias por tu compra ${nombreUsuario}!`);
    
    notificacion.appendChild(icono);
    notificacion.appendChild(titulo);
    notificacion.appendChild(mensaje);
    notificacion.appendChild(agradecimiento);
    
    // Crear overlay
    const overlay = crearElemento('div', 'notificacion-overlay');
    
    document.body.appendChild(overlay);
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        overlay.remove();
        notificacion.remove();
    }, CONFIG.SUCCESS_NOTIFICATION_DURATION);
}

function mostrarNotificacionVaciarCarrito() {
    mostrarNotificacion('🗑️ Carrito vacío correctamente', 'error');
}

// === FUNCIONES DE NAVEGACIÓN ===
function mostrarPaginaPrincipal() {
    elementos.paginaInicio.classList.add('hidden');
    elementos.paginaPrincipal.classList.remove('hidden');
    elementos.mensajeBienvenida.textContent = `¡Hola ${nombreUsuario}! 🎉 Encuentra los mejores productos`;

    cargarProductos();
    renderizarCarrito();
}

function cerrarSesion() {
    // Limpiar datos del usuario
    nombreUsuario = '';
    
    // Limpiar localStorage
    try {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_NAME);
    } catch (error) {
        console.warn('Error al limpiar localStorage:', error);
    }
    
    // Cerrar carrito si está visible
    cerrarCarrito();
    
    // Mostrar página de inicio y ocultar página principal
    elementos.paginaPrincipal.classList.add('hidden');
    elementos.paginaInicio.classList.remove('hidden');
    
    // Limpiar el input del nombre
    elementos.nombreInput.value = '';
    elementos.nombreInput.focus();
}

function cargarEstilosCarrito(rutaCSS = './css/carrito-styles.css') {
    return new Promise((resolve, reject) => {
        // Verificar si los estilos ya están cargados
        const linkExistente = document.getElementById('carrito-styles');
        if (linkExistente) {
            resolve('Estilos ya cargados');
            return;
        }

        // Crear elemento link para el CSS
        const link = document.createElement('link');
        link.id = 'carrito-styles';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = rutaCSS;

        // Eventos de carga
        link.onload = () => {
            console.log('✅ Estilos del carrito cargados correctamente');
            resolve('Estilos cargados exitosamente');
        };

        link.onerror = () => {
            console.error('❌ Error al cargar los estilos del carrito');
            reject(new Error('No se pudo cargar el archivo CSS'));
        };

        // Agregar al head del documento
        document.head.appendChild(link);
    });
}

// ===== FUNCIÓN PARA CREAR MODAL DE CONFIRMACIÓN =====

function crearModalConfirmacion(titulo, mensaje, onConfirmar) {
    const overlay = crearElemento('div', 'modal-overlay');
    const modal = crearElemento('div', 'modal-confirmacion');
    
    const modalHeader = crearElemento('div', 'modal-header');
    const modalTitulo = crearElemento('h3', 'modal-titulo', titulo);
    modalHeader.appendChild(modalTitulo);
    
    const modalBody = crearElemento('div', 'modal-body');
    const modalMensaje = crearElemento('p', 'modal-mensaje', mensaje);
    modalBody.appendChild(modalMensaje);
    
    const modalFooter = crearElemento('div', 'modal-footer');
    
    const btnCancelar = crearElemento('button', 'btn-modal-cancelar', 'Cancelar');
    const btnConfirmar = crearElemento('button', 'btn-modal-confirmar', 'Confirmar');
    
    // Eventos de los botones
    btnCancelar.addEventListener('click', () => {
        overlay.remove();
    });
    
    btnConfirmar.addEventListener('click', () => {
        onConfirmar();
        overlay.remove();
    });
    
    modalFooter.appendChild(btnCancelar);
    modalFooter.appendChild(btnConfirmar);
    
    modal.appendChild(modalHeader);
    modal.appendChild(modalBody);
    modal.appendChild(modalFooter);
    
    overlay.appendChild(modal);
    
    // Event listeners para cerrar el modal
    overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
        }
    });
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    
    // Enfocar el primer botón para accesibilidad
    setTimeout(() => {
        btnCancelar.focus();
    }, 100);
    
    return overlay;
}

// ===== FUNCIONES MEJORADAS DE COMPRA Y VACIAR =====

function hacerCompra() {
    if (carrito.length === 0) {
        mostrarNotificacion('❌ Tu carrito está vacío. Agrega productos antes de hacer la compra.', 'error');
        return;
    }

    const total = calcularTotalCarrito();
    const cantidadItems = carrito.reduce((total, item) => total + item.cantidad, 0);

    const modal = crearModalConfirmacion(
        '🛒 Confirmar Compra',
        `Total de productos: ${cantidadItems}\nTotal a pagar: $${total.toFixed(2)}\n\n¿Deseas confirmar tu compra?`,
        () => {
            // Confirmar compra
            mostrarNotificacionCompra(total);
            carrito = [];
            guardarCarritoEnStorage();
            renderizarCarrito();
            cerrarCarrito(); // Asegurar que el carrito se cierre
            if (window.carritoConfig?.onCompraRealizada) {
                window.carritoConfig.onCompraRealizada(total, cantidadItems);
            }
        }
    );

    document.body.appendChild(modal);
}

function vaciarCarrito() {
    if (carrito.length === 0) {
        mostrarNotificacion('❌ El carrito ya está vacío.', 'error');
        return;
    }

    const modal = crearModalConfirmacion(
        '🗑️ Vaciar Carrito',
        '¿Estás seguro que deseas eliminar todos los productos del carrito?',
        () => {
            carrito = [];
            guardarCarritoEnStorage();
            renderizarCarrito();
            cerrarCarrito(); // Asegurar que el carrito se cierre
            mostrarNotificacionVaciarCarrito();
        }
    );

    document.body.appendChild(modal);
}

// ===== INICIALIZACIÓN CON CARGA DE ESTILOS =====

/**
 * Inicializa el carrito con carga de estilos
 * @param {Object} opciones - Opciones de configuración
 */
async function inicializarCarritoConEstilos(opciones = {}) {
    const config = {
        rutaCSS: './css/carrito-styles.css',
        usarFallback: true,
        ...opciones
    };

    try {
        // Intentar cargar estilos externos
        await cargarEstilosCarrito(config.rutaCSS);
        console.log('✅ Estilos del carrito cargados desde archivo externo');
        
    } catch (error) {
        console.warn('⚠️ No se pudieron cargar los estilos externos:', error.message);
        
        if (config.usarFallback) {
            console.log('🔄 Cargando estilos críticos inline como fallback...');
            cargarEstilosCriticos();
        }
    }

    // Continuar con la inicialización normal
    cargarCarritoDesdeStorage();
    cargarNombreUsuario();
    inicializarEventListeners();

    // Si no hay nombre guardado, mostrar página de inicio
    if (!nombreUsuario) {
        elementos.paginaInicio.classList.remove('hidden');
    }
}

// ===== ACTUALIZAR EL EVENT LISTENER DE DOMCONTENTLOADED =====

document.addEventListener('DOMContentLoaded', function () {
    // Usar la nueva función de inicialización
    inicializarCarritoConEstilos({
        rutaCSS: './css/carrito-styles.css', // Ajustar la ruta según tu estructura
        usarFallback: true
    });
});

// ===== FUNCIÓN DE CONFIGURACIÓN AVANZADA =====

/**
 * Configura el carrito con opciones personalizadas
 * @param {Object} configuracion - Configuración personalizada
 */
function configurarCarrito(configuracion = {}) {
    const config = {
        // Rutas de archivos
        rutaCSS: './css/carrito-styles.css',
        
        // Comportamiento
        cerrarConEscape: true,
        cerrarConOverlay: true,
        mostrarAnimaciones: true,
        
        // Fallbacks
        usarEstilosCriticos: true,
        
        // Callbacks
        onCarritoAbierto: null,
        onCarritoCerrado: null,
        onCompraRealizada: null,
        
        ...configuracion
    };

    // Aplicar configuración
    if (config.cerrarConEscape) {
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && carritoVisible) {
                cerrarCarrito();
                if (config.onCarritoCerrado) config.onCarritoCerrado();
            }
        });
    }

    // Guardar configuración globalmente
    window.carritoConfig = config;
    
    return config;
}

// === EVENT LISTENERS ===
function inicializarEventListeners() {
    // Formulario de nombre
    elementos.formularioNombre.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const nombre = elementos.nombreInput.value.trim();
        if (nombre.length < CONFIG.MIN_NAME_LENGTH) {
            alert(`❌ Por favor ingresa un nombre válido (mínimo ${CONFIG.MIN_NAME_LENGTH} caracteres)`);
            return;
        }

        guardarNombreUsuario(nombre);
        mostrarPaginaPrincipal();
    });

    // Filtros y búsqueda
    elementos.busquedaInput.addEventListener('input', renderizarProductos);
    elementos.categoriaSelect.addEventListener('change', renderizarProductos);
    elementos.ordenamientoSelect.addEventListener('change', renderizarProductos);

    // Carrito
    elementos.carritoToggle.addEventListener('click', toggleCarrito);
    elementos.carritoOverlay.addEventListener('click', cerrarCarrito);
    
    // Botón cerrar sesión
    elementos.btnCerrarSesion.addEventListener('click', cerrarSesion);

    // Cerrar carrito con tecla Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && carritoVisible) {
            cerrarCarrito();
        }
    });
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', function () {
    cargarCarritoDesdeStorage();
    cargarNombreUsuario();
    inicializarEventListeners();

    // Si no hay nombre guardado, mostrar página de inicio
    if (!nombreUsuario) {
        elementos.paginaInicio.classList.remove('hidden');
    }
});

// === FUNCIONES GLOBALES PARA COMPATIBILIDAD ===
window.cerrarSesion = cerrarSesion;
window.hacerCompra = hacerCompra;
window.vaciarCarrito = vaciarCarrito;
window.toggleCarrito = toggleCarrito;