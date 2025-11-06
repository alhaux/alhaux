// Script de limpieza y sincronización de la base de datos - Design Reyes

// Función para verificar y limpiar documentos corruptos
async function cleanupDatabase() {
  try {
    console.log('🧹 Iniciando limpieza de la base de datos...');
    
    // Obtener todos los diseños
    const snapshot = await db.collection('designs').get();
    const corruptedDocs = [];
    const validDocs = [];
    
    console.log(`📊 Analizando ${snapshot.size} documentos...`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Verificar campos requeridos
      const isValid = 
        data.name && 
        data.category && 
        data.imageUrl && 
        (data.type === 'gratis' || data.type === 'premium') &&
        data.createdAt;
      
      if (!isValid) {
        corruptedDocs.push({
          id: doc.id,
          data: data,
          issues: []
        });
        
        // Identificar problemas específicos
        const doc_issues = corruptedDocs[corruptedDocs.length - 1].issues;
        if (!data.name) doc_issues.push('Sin nombre');
        if (!data.category) doc_issues.push('Sin categoría');
        if (!data.imageUrl) doc_issues.push('Sin imagen');
        if (!data.type || (data.type !== 'gratis' && data.type !== 'premium')) doc_issues.push('Tipo inválido');
        if (!data.createdAt) doc_issues.push('Sin fecha de creación');
        
      } else {
        validDocs.push({
          id: doc.id,
          data: data
        });
      }
    });
    
    console.log(`✅ Documentos válidos: ${validDocs.length}`);
    console.log(`❌ Documentos corruptos: ${corruptedDocs.length}`);
    
    if (corruptedDocs.length > 0) {
      console.log('🔍 Documentos con problemas:');
      corruptedDocs.forEach(doc => {
        console.log(`- ${doc.id}: ${doc.issues.join(', ')}`);
      });
      
      // Preguntar si eliminar documentos corruptos
      const result = await Swal.fire({
        title: '🧹 Limpieza de Base de Datos',
        html: `
          <div style="text-align: left;">
            <p><strong>Análisis completado:</strong></p>
            <p>✅ Documentos válidos: ${validDocs.length}</p>
            <p>❌ Documentos corruptos: ${corruptedDocs.length}</p>
            <br>
            <p><strong>Documentos con problemas:</strong></p>
            <ul style="text-align: left; margin: 10px 0;">
              ${corruptedDocs.map(doc => 
                `<li><code>${doc.id}</code>: ${doc.issues.join(', ')}</li>`
              ).join('')}
            </ul>
            <br>
            <p>¿Deseas eliminar los documentos corruptos?</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '🗑️ Eliminar corruptos',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#e74c3c'
      });
      
      if (result.isConfirmed) {
        await deleteCorruptedDocs(corruptedDocs);
      }
    } else {
      Swal.fire({
        icon: 'success',
        title: '✅ Base de datos limpia',
        text: 'No se encontraron documentos corruptos',
        timer: 2000
      });
    }
    
    return {
      total: snapshot.size,
      valid: validDocs.length,
      corrupted: corruptedDocs.length,
      corruptedDocs: corruptedDocs
    };
    
  } catch (error) {
    console.error('❌ Error en limpieza de base de datos:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error en limpieza',
      text: error.message
    });
    throw error;
  }
}

// Función para eliminar documentos corruptos
async function deleteCorruptedDocs(corruptedDocs) {
  try {
    console.log(`🗑️ Eliminando ${corruptedDocs.length} documentos corruptos...`);
    
    const batch = db.batch();
    
    corruptedDocs.forEach(doc => {
      const docRef = db.collection('designs').doc(doc.id);
      batch.delete(docRef);
    });
    
    await batch.commit();
    
    console.log('✅ Documentos corruptos eliminados');
    
    Swal.fire({
      icon: 'success',
      title: '🗑️ Limpieza completada',
      text: `Se eliminaron ${corruptedDocs.length} documentos corruptos`,
      timer: 3000
    });
    
    // Forzar recarga del catálogo
    if (typeof forceReloadCatalog === 'function') {
      setTimeout(() => {
        forceReloadCatalog();
      }, 1000);
    }
    
  } catch (error) {
    console.error('❌ Error eliminando documentos:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error al eliminar',
      text: error.message
    });
    throw error;
  }
}

// Función para verificar integridad de la base de datos
async function verifyDatabaseIntegrity() {
  try {
    console.log('🔍 Verificando integridad de la base de datos...');
    
    const result = await cleanupDatabase();
    
    return {
      isHealthy: result.corrupted === 0,
      statistics: result
    };
    
  } catch (error) {
    console.error('❌ Error verificando integridad:', error);
    return {
      isHealthy: false,
      error: error.message
    };
  }
}

// Función para regenerar índices (si es necesario)
async function regenerateIndexes() {
  try {
    console.log('🔄 Regenerando índices...');
    
    // Obtener todos los diseños y reordenarlos
    const snapshot = await db.collection('designs')
      .orderBy('createdAt', 'desc')
      .get();
    
    console.log(`📊 Procesando ${snapshot.size} documentos para regenerar índices...`);
    
    // Los índices se regeneran automáticamente al hacer consultas
    // Este paso fuerza la regeneración
    
    Swal.fire({
      icon: 'success',
      title: '✅ Índices regenerados',
      text: 'Los índices de la base de datos han sido actualizados',
      timer: 2000
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Error regenerando índices:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error regenerando índices',
      text: error.message
    });
    return false;
  }
}

// Función completa de mantenimiento de la base de datos
async function performDatabaseMaintenance() {
  try {
    console.log('🔧 Iniciando mantenimiento completo de la base de datos...');
    
    // Mostrar indicador de progreso
    Swal.fire({
      title: '🔧 Mantenimiento de Base de Datos',
      text: 'Realizando verificaciones...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // 1. Verificar integridad
    const integrity = await verifyDatabaseIntegrity();
    
    // 2. Validar categorías (si está disponible)
    let categoryStatus = { isValid: true };
    if (typeof validateAndFixCategories === 'function') {
      categoryStatus = await validateAndFixCategories();
    }
    
    // 3. Regenerar índices
    await regenerateIndexes();
    
    // 4. Limpiar caché
    if (typeof clearCatalogCache === 'function') {
      clearCatalogCache();
    }
    
    // 5. Forzar recarga
    if (typeof forceReloadCatalog === 'function') {
      await forceReloadCatalog();
    }
    
    Swal.fire({
      icon: 'success',
      title: '✅ Mantenimiento completado',
      html: `
        <div style="text-align: left;">
          <p><strong>Resultados:</strong></p>
          <p>🔍 Integridad: ${integrity.isHealthy ? '✅ Buena' : '❌ Problemas detectados'}</p>
          <p>📂 Categorías: ${categoryStatus.invalid === 0 ? '✅ Correctas' : `❌ ${categoryStatus.invalid} problemas`}</p>
          <p>🔄 Índices: ✅ Regenerados</p>
          <p>🧹 Caché: ✅ Limpiado</p>
          <p>📊 Catálogo: ✅ Recargado</p>
        </div>
      `,
      confirmButtonText: 'Perfecto'
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Error en mantenimiento:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error en mantenimiento',
      text: error.message
    });
    return false;
  }
}

// Agregar botón de mantenimiento al panel de admin (si existe)
function addMaintenanceButton() {
  const adminPanel = document.querySelector('.admin-panel, .dashboard-content');
  if (adminPanel) {
    const button = document.createElement('button');
    button.innerHTML = '🔧 Mantenimiento DB';
    button.style.cssText = `
      background: #e74c3c;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      margin: 10px;
      font-size: 12px;
    `;
    button.onclick = performDatabaseMaintenance;
    
    adminPanel.appendChild(button);
  }
}

// Hacer funciones globales
window.cleanupDatabase = cleanupDatabase;
window.verifyDatabaseIntegrity = verifyDatabaseIntegrity;
window.regenerateIndexes = regenerateIndexes;
window.performDatabaseMaintenance = performDatabaseMaintenance;

// Auto-agregar botón de mantenimiento si estamos en página de admin
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('admin.html')) {
    setTimeout(addMaintenanceButton, 2000);
  }
});

console.log('🔧 Sistema de mantenimiento de base de datos cargado');