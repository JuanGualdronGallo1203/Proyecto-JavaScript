# 🌟 Tienda Virtual Fake Store

¡Una aplicación web moderna, responsiva y atractiva que da vida a los datos de la [API Fake Store](https://fakestoreapi.com/products)! Explora productos renderizados dinámicamente en el DOM, disfruta de un carrito de compras interactivo con persistencia en localStorage, y utiliza funciones como filtros, ordenamiento y búsqueda para una experiencia de usuario fluida e intuitiva en cualquier dispositivo.

---

## 📑 Tabla de Contenidos
- [✨ Características](#-características)
- [🛠 Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [📂 Estructura del Proyecto](#-estructura-del-proyecto)
- [🚀 Instalación](#-instalación)
- [🎮 Uso](#-uso)
- [🛒 Funcionalidades](#-funcionalidades)
  - [🌐 Consumo de API](#-consumo-de-api)
  - [📱 Renderizado Dinámico del DOM](#-renderizado-dinámico-del-dom)
  - [🛍 Carrito de Compras](#-carrito-de-compras)
  - [🎯 Manejo de Eventos](#-manejo-de-eventos)
  - [🧩 Organización del Código](#-organización-del-código)
  - [🎨 Diseño Responsivo y Usabilidad](#-diseño-responsivo-y-usabilidad)
- [🤝 Contribución](#-contribución)
- [📜 Licencia](#-licencia)

---

## ✨ Características
- **Catálogo Dinámico**: Muestra productos de la API Fake Store en una cuadrícula visualmente atractiva.
- **Carrito Interactivo**: Agrega, elimina y visualiza productos con cálculo de precio total en tiempo real.
- **Persistencia del Carrito**: Guarda el carrito en localStorage para mantenerlo entre sesiones.
- **Filtros y Ordenamiento Inteligentes**: Filtra por categoría o ordena por precio/nombre con transiciones suaves.
- **Búsqueda en Tiempo Real**: Encuentra productos por nombre o descripción al instante.
- **Diseño Responsivo**: Se adapta perfectamente a escritorios, tablets y móviles.
- **Código Limpio y Modular**: Organizado para facilitar mantenimiento y escalabilidad.

---

## 🛠 Tecnologías Utilizadas
- **HTML5**: Estructura semántica para accesibilidad y SEO.
- **CSS3**: Estilos modernos con Flexbox, Grid, animaciones y media queries para responsividad.
- **JavaScript (ES6+)**: Lógica de la aplicación, consumo de API, manipulación del DOM e interactividad.
- **API Fake Store**: Fuente de datos de productos.
- **DaFont**: Fuente de letra utilizada en el proyecto.

---

## 📂 Estructura del Proyecto
```
fake-store-app/
├── index.html          # 🎨 Archivo HTML principal
├── css/
│   ├── styles.css      # ✨ Hoja de estilos con diseño responsivo y animaciones
│   ├── Variables.css   # 🎨 Definición de variables de los tipos de letras
├── DaFonts/
│   └── font.css        # 🎨 Fuente de letras utilizadas
├── js/
│   ├── main.js         # 🚀 Punto de entrada de la aplicación
├── README.md           # 📖 Documentación del proyecto
├── Analisis y Docs
│   ├── readme.md       # 📖 Documentación del paso a paso del proyecto
```

---

## 🚀 Instalación
1. Clona el repositorio:
   ```bash
   git clone https://github.com/JuanGualdronGallo1203/Proyecto-JavaScript
   ```
2. Navega al directorio del proyecto:
   ```bash
   cd fake-store-app
   ```
3. Abre `index.html` en un navegador o sirve el proyecto con un servidor local (por ejemplo, Live Server de VS Code o `http-server` de Node.js):
   ```bash
   npx http-server
   ```

¡No se requieren dependencias! Solo JavaScript puro y recursos CDN opcionales.

---

## 🎮 Uso
1. Abre la aplicación en tu navegador.
2. Explora el catálogo de productos de la API Fake Store.
3. Busca productos con la barra de búsqueda intuitiva.
4. Filtra por categoría o ordena nombre usando menús desplegables.
5. Agrega productos al carrito con un solo clic.
6. Revisa el carrito para ver los productos, el precio total o eliminar elementos.
7. Navega con una interfaz fluida y responsiva en cualquier dispositivo.

---

## 🛒 Funcionalidades

### 🌐 Consumo de API
- Obtiene datos de `https://fakestoreapi.com/products` con `fetch()`.
- Gestiona operaciones asíncronas con `async/await` para un código claro.
- Maneja errores con `try/catch` para una experiencia robusta.
- Muestra productos como tarjetas en una cuadrícula atractiva.

### 📱 Renderizado Dinámico del DOM
- Construye tarjetas de productos dinámicamente con `createElement()` o `innerHTML`.
- Muestra detalles (imagen, título, precio, categoría) con un botón "Agregar al Carrito".
- Actualiza el DOM en tiempo real para filtros, ordenamiento o búsquedas.
- Optimiza el renderizado para alto rendimiento con grandes conjuntos de datos.

### 🛍 Carrito de Compras
- Administra elementos del carrito (ID, cantidad, precio) en un objeto JavaScript.
- Calcula y muestra el precio total en tiempo real.
- Permite agregar/eliminar productos con retroalimentación visual.
- Guarda el carrito en `localStorage` para persistencia.
- Restaura el estado del carrito al cargar la página.

### 🎯 Manejo de Eventos
- **click**: Ejecuta acciones de "Agregar al Carrito" o "Eliminar del Carrito".
- **change**: Aplica filtros por categoría o ordenamiento vía menús desplegables.
- **input**: Actualiza la lista de productos dinámicamente con la búsqueda.
- Usa delegación de eventos para optimizar el rendimiento.


### 🧩 Organización del Código
- Modularizado en archivos separados:
- `main.js`: Inicializa la app y coordina módulos.
- Código claro, mantenible y escalable.

### 🎨 Diseño Responsivo y Usabilidad
- **Adaptabilidad**: Interfaz optimizada para escritorio, tablet y móvil con media queries.
- **Experiencia de Usuario**:
  - Botones accesibles y con retroalimentación visual.
  - Alto contraste de colores para legibilidad.
  - Tipografía clara y moderna.
  - Espaciados cómodos para una navegación intuitiva.
- **Carrito Accesible**: Visible en todos los dispositivos mediante barra lateral, modal o sección fija.
- Animaciones sutiles para transiciones fluidas y una experiencia moderna.


## 📜 Licencia
Este proyecto está bajo la [Licencia MIT](LICENSE). Siéntete libre de usarlo, modificarlo y distribuirlo según los términos de la licencia.

---

🌟 **¡Disfruta comprando en la Tienda Virtual Fake Store!** 🌟