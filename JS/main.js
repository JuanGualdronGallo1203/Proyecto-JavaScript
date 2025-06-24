function toggleDropdown() {
    const dropdown = document.querySelector('.categories-dropdown');
    const arrow = document.querySelector('.search-arrow');
    
    dropdown.classList.toggle('open');
    arrow.classList.toggle('rotated');
}

// Cerrar dropdown al hacer clic fuera
document.addEventListener('click', function(event) {
    const container = document.querySelector('.search-container');
    if (!container.contains(event.target)) {
        const dropdown = document.querySelector('.categories-dropdown');
        const arrow = document.querySelector('.search-arrow');
        dropdown.classList.remove('open');
        arrow.classList.remove('rotated');
    }
});

// Manejar selección de categoría
document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', function() {
        // Aquí puedes agregar lógica para manejar la selección
        console.log('Categoría seleccionada:', this.textContent);
        
        // Cerrar dropdown después de seleccionar
        const dropdown = document.querySelector('.categories-dropdown');
        const arrow = document.querySelector('.search-arrow');
        dropdown.classList.remove('open');
        arrow.classList.remove('rotated');
    });
});