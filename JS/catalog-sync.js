// Sistema de sincronización y gestión de catálogo - Design Reyes

// Función para forzar recarga completa del catálogo
async function forceReloadCatalog() {
  try {
    console.log('🔄 Forzando recarga completa del catálogo...');
    
    // Mostrar indicador de carga
    const catalogoGrid = document.getElementById('catalogoGrid');
    if (catalogoGrid) {
      catalogoGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #6236ff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <p style="margin-top: 15px; color: #666;">Sincronizando catálogo...</p>
        </div>
      `;
    }

    // Limpiar variables globales
    if (typeof allDesigns !== 'undefined') {
      allDesigns = [];
    }
    if (typeof currentCategory !== 'undefined') {
      currentCategory = 'all';
    }
    if (typeof currentPage !== 'undefined') {
      currentPage = 1;
    }

    // Obtener datos directamente desde Firebase (sin caché)
    const snapshot = await db.collection('designs')
      .orderBy('createdAt', 'desc')
      .get({ source: 'server' }); // Forzar desde servidor

    console.log(`📊 Diseños encontrados: ${snapshot.size}`);

    // Limpiar grid
    if (catalogoGrid) {
      catalogoGrid.innerHTML = '';
    }

    if (snapshot.empty) {
      if (catalogoGrid) {
        catalogoGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
            <h3 style="color: #666; margin-bottom: 10px;">📭 No hay diseños disponibles</h3>
            <p style="color: #999;">Los diseños se mostrarán aquí cuando el administrador los suba.</p>
          </div>
        `;
      }
      
      // Actualizar contador
      const infoBar = document.querySelector('.info-bar strong');
      if (infoBar) {
        infoBar.textContent = '0 diseños disponibles';
      }
      
      return [];
    }

    // Procesar diseños
    const designs = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      designs.push({
        id: doc.id,
        ...data
      });
    });

    // Guardar en variable global si existe
    if (typeof allDesigns !== 'undefined') {
      allDesigns = designs;
    }

    // Mostrar diseños
    displayDesigns(designs);

    // Actualizar contador
    const infoBar = document.querySelector('.info-bar strong');
    if (infoBar) {
      infoBar.textContent = `${designs.length} diseños disponibles`;
    }

    // Actualizar paginación si existe la función
    if (typeof updatePagination === 'function') {
      updatePagination(designs.length);
    }

    console.log('✅ Catálogo recargado exitosamente');
    return designs;

  } catch (error) {
    console.error('❌ Error recargando catálogo:', error);
    
    const catalogoGrid = document.getElementById('catalogoGrid');
    if (catalogoGrid) {
      catalogoGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <h3 style="color: #e74c3c; margin-bottom: 10px;">❌ Error de conexión</h3>
          <p style="color: #999; margin-bottom: 15px;">No se pudo cargar el catálogo</p>
          <button onclick="forceReloadCatalog()" style="background: #6236ff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
            🔄 Reintentar
          </button>
        </div>
      `;
    }
    
    throw error;
  }
}

// Función para mostrar diseños en el grid
function displayDesigns(designs) {
  const catalogoGrid = document.getElementById('catalogoGrid');
  if (!catalogoGrid) return;

  catalogoGrid.innerHTML = '';

  designs.forEach(design => {
    const designCard = document.createElement('div');
    designCard.className = 'design-card';
    
    // Determinar el tipo y precio
    const isGratuito = design.priceType === 'gratis' || design.type === 'gratis' || parseFloat(design.price || 0) === 0;
    const priceDisplay = isGratuito ? 'GRATIS' : `S/ ${parseFloat(design.price || 0).toFixed(2)}`;
    const typeClass = isGratuito ? 'free' : 'premium';
    
    designCard.innerHTML = `
      <div class="design-image-container">
        <img src="${design.imageUrl || '../img/placeholder.svg'}" alt="${design.name || 'Diseño'}" class="design-image" loading="lazy">
        <div class="design-overlay">
          <span class="design-type ${typeClass}">${isGratuito ? '🆓 GRATIS' : '💎 PREMIUM'}</span>
        </div>
      </div>
      <div class="design-info">
        <h4 class="design-name">${design.name || 'Diseño sin nombre'}</h4>
        <p class="design-category">📁 ${design.category || 'Sin categoría'}</p>
        <p class="design-price">${priceDisplay}</p>
        <p class="design-formats">📎 ${design.formats || 'PNG, PSD'}</p>
      </div>
      <div class="design-actions">
        <button 
          onclick="handleDownloadClick('${design.id}', '${design.name || 'Diseño'}', '${design.priceType || design.type || 'premium'}', '${design.price || 0}')" 
          class="btn-download ${typeClass}">
          📥 Descargar
        </button>
        <button 
          onclick="viewDesignDetails('${design.id}')" 
          class="btn-details">
          👁️ Ver detalles
        </button>
      </div>
    `;
    
    catalogoGrid.appendChild(designCard);
  });
}

// Función para ver detalles de un diseño
async function viewDesignDetails(designId) {
  try {
    const doc = await db.collection('designs').doc(designId).get();
    
    if (!doc.exists) {
      Swal.fire({
        icon: 'error',
        title: '❌ Diseño no encontrado',
        text: 'Este diseño ya no está disponible o fue eliminado.',
        confirmButtonText: 'Entendido'
      });
      
      // Forzar recarga del catálogo
      forceReloadCatalog();
      return;
    }

    const design = doc.data();
    const isGratuito = design.priceType === 'gratis' || design.type === 'gratis' || parseFloat(design.price || 0) === 0;
    
    Swal.fire({
      title: design.name,
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${design.imageUrl || '../img/placeholder.svg'}" alt="${design.name || 'Diseño'}" style="max-width: 100%; max-height: 300px; border-radius: 8px;">
          </div>
          <p><strong>📁 Categoría:</strong> ${design.category || 'Sin categoría'}</p>
          <p><strong>💰 Precio:</strong> ${isGratuito ? 'GRATIS' : `S/ ${parseFloat(design.price || 0).toFixed(2)}`}</p>
          <p><strong>📎 Formatos:</strong> ${design.formats || 'PNG, PSD'}</p>
          <p><strong>📝 Descripción:</strong></p>
          <p style="background: #f8f9fa; padding: 10px; border-radius: 5px; color: #333;">
            ${design.description || 'Sin descripción disponible'}
          </p>
        </div>
      `,
      width: '600px',
      showCancelButton: true,
      confirmButtonText: '📥 Descargar Ahora',
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#6236ff'
    }).then((result) => {
      if (result.isConfirmed) {
        const designType = design.priceType || design.type || 'premium';
        handleDownloadClick(design.id, design.name || 'Diseño', designType, design.price || 0);
      }
    });

  } catch (error) {
    console.error('Error cargando detalles:', error);
    Swal.fire({
      icon: 'error',
      title: '❌ Error',
      text: 'No se pudieron cargar los detalles del diseño',
      confirmButtonText: 'Entendido'
    });
  }
}

// Función para limpiar caché y forzar recarga
function clearCatalogCache() {
  // Limpiar localStorage si se usa
  if (typeof Storage !== 'undefined') {
    localStorage.removeItem('catalogCache');
    localStorage.removeItem('lastCatalogUpdate');
  }
  
  // Limpiar variables globales
  if (typeof allDesigns !== 'undefined') {
    allDesigns = [];
  }
  
  console.log('🧹 Caché del catálogo limpiado');
}

// Función para configurar listeners de cambios en tiempo real
function setupRealtimeSync() {
  if (typeof db === 'undefined') {
    console.error('Firebase no está inicializado');
    return;
  }

  console.log('🔄 Configurando sincronización en tiempo real...');
  
  db.collection('designs').onSnapshot(
    (snapshot) => {
      console.log('📡 Cambios detectados en la colección de diseños');
      
      const changes = snapshot.docChanges();
      let hasChanges = false;
      
      changes.forEach((change) => {
        if (change.type === 'added') {
          console.log('➕ Diseño agregado:', change.doc.data().name);
          hasChanges = true;
        }
        if (change.type === 'modified') {
          console.log('✏️ Diseño modificado:', change.doc.data().name);
          hasChanges = true;
        }
        if (change.type === 'removed') {
          console.log('🗑️ Diseño eliminado:', change.doc.id);
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        // Mostrar notificación sutil
        showSyncNotification();
        
        // Recargar catálogo después de un breve delay
        setTimeout(() => {
          forceReloadCatalog();
        }, 1000);
      }
    },
    (error) => {
      console.error('Error en sincronización en tiempo real:', error);
    }
  );
}

// Mostrar notificación de sincronización
function showSyncNotification() {
  // Crear notificación discreta
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #6236ff;
    color: white;
    padding: 10px 15px;
    border-radius: 8px;
    z-index: 10000;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  notification.textContent = '🔄 Actualizando catálogo...';
  
  document.body.appendChild(notification);
  
  // Mostrar notificación
  setTimeout(() => {
    notification.style.opacity = '1';
  }, 100);
  
  // Ocultar después de 3 segundos
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

// Hacer funciones globales
window.forceReloadCatalog = forceReloadCatalog;
window.displayDesigns = displayDesigns;
window.viewDesignDetails = viewDesignDetails;
window.clearCatalogCache = clearCatalogCache;
window.setupRealtimeSync = setupRealtimeSync;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Configurar botón de recarga manual si existe
  const reloadBtn = document.getElementById('reloadCatalogBtn');
  if (reloadBtn) {
    reloadBtn.addEventListener('click', forceReloadCatalog);
  }
  
  // Configurar sincronización en tiempo real
  if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
    setupRealtimeSync();
  }
});

console.log('🔄 Sistema de sincronización del catálogo cargado');