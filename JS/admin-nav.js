// Manejar la navegación activa
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentHash = window.location.hash || '#subir';

    // Actualizar link activo basado en el hash
    function updateActiveLink() {
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentHash || (!currentHash && href === '#subir')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Actualizar cuando cambia el hash
    window.addEventListener('hashchange', updateActiveLink);

    // Click en los links de navegación
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const hash = link.getAttribute('href');
                window.location.hash = hash;
                updateActiveLink();
            }
        });
    });

    // Manejar el logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const result = await Swal.fire({
                title: '¿Cerrar sesión?',
                text: '¿Estás seguro de que quieres salir del panel de administración?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                // Cerrar sesión con Firebase y redirigir
                if (window.firebase && window.firebase.auth) {
                    try {
                        await window.firebase.auth().signOut();
                    } catch (err) {
                        console.warn('Error al cerrar sesión:', err);
                    }
                }
                // Redirección segura con fallback
                (function safeRedirect(routePath, filePath) {
                    try {
                        fetch(routePath, { method: 'HEAD' })
                          .then(res => {
                              if (res && res.ok) {
                                  window.location.href = routePath;
                              } else {
                                  window.location.href = filePath;
                              }
                          })
                          .catch(() => window.location.href = filePath);
                    } catch (_) {
                        window.location.href = filePath;
                    }
                })('/login', 'login.html');
            }
        });
    }

    // Inicializar estado activo
    updateActiveLink();
});