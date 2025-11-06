// Verificador y corrector de categorías - Design Reyes

// Categorías válidas según el sistema de Design Reyes
const VALID_CATEGORIES = [
  'INTERCLASES',
  'FUTSALEROS', 
  'EQUIPOS OFICIALES',
  'INTERNACIONALES'
];

// Tipos válidos
const VALID_TYPES = ['gratis', 'premium'];

// Función para verificar y corregir categorías inválidas
async function validateAndFixCategories() {
  try {
    console.log('🔍 Verificando categorías en la base de datos...');
    
    const snapshot = await db.collection('designs').get();
    const invalidDocs = [];
    const validDocs = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const category = data.category;
      const type = data.type;
      
      // Verificar categoría
      const hasValidCategory = VALID_CATEGORIES.includes(category);
      const hasValidType = VALID_TYPES.includes(type);
      
      if (!hasValidCategory || !hasValidType) {
        invalidDocs.push({
          id: doc.id,
          name: data.name,
          currentCategory: category,
          currentType: type,
          data: data,
          issues: []
        });
        
        const doc_issues = invalidDocs[invalidDocs.length - 1].issues;
        if (!hasValidCategory) {
          doc_issues.push(`Categoría inválida: "${category}"`);
        }
        if (!hasValidType) {
          doc_issues.push(`Tipo inválido: "${type}"`);
        }
      } else {
        validDocs.push({
          id: doc.id,
          name: data.name,
          category: category,
          type: type
        });
      }
    });
    
    console.log(`✅ Documentos con categorías válidas: ${validDocs.length}`);
    console.log(`❌ Documentos con categorías inválidas: ${invalidDocs.length}`);
    
    if (invalidDocs.length > 0) {
      console.log('🔍 Documentos con problemas de categoría:');
      invalidDocs.forEach(doc => {
        console.log(`- "${doc.name}": ${doc.issues.join(', ')}`);
      });
      
      // Mostrar dialog para corregir
      await showCategoryFixDialog(invalidDocs);
    } else {
      Swal.fire({
        icon: 'success',
        title: '✅ Categorías correctas',
        text: 'Todas las categorías están correctas según el sistema de Design Reyes',
        timer: 2000
      });
    }
    
    return {
      total: snapshot.size,
      valid: validDocs.length,
      invalid: invalidDocs.length,
      invalidDocs: invalidDocs
    };
    
  } catch (error) {
    console.error('❌ Error verificando categorías:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error verificando categorías',
      text: error.message
    });
    throw error;
  }
}

// Mostrar dialog para corregir categorías
async function showCategoryFixDialog(invalidDocs) {
  const result = await Swal.fire({
    title: '📂 Categorías Inválidas Detectadas',
    html: `
      <div style="text-align: left; max-height: 400px; overflow-y: auto;">
        <p><strong>Se encontraron ${invalidDocs.length} diseños con categorías incorrectas:</strong></p>
        <br>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <strong>📋 Categorías válidas en Design Reyes:</strong>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>🏃 INTERCLASES</li>
            <li>⚽ FUTSALEROS</li>
            <li>🏆 EQUIPOS OFICIALES</li>
            <li>🌍 INTERNACIONALES</li>
          </ul>
        </div>
        <br>
        <strong>🔍 Problemas encontrados:</strong>
        <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
          ${invalidDocs.map(doc => 
            `<li><strong>"${doc.name}"</strong>: ${doc.issues.join(', ')}</li>`
          ).join('')}
        </ul>
        <br>
        <p>¿Deseas corregir automáticamente estos problemas?</p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '🔧 Corregir Automáticamente',
    cancelButtonText: '❌ Eliminar Documentos Inválidos',
    showDenyButton: true,
    denyButtonText: 'Cancelar',
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#dc3545'
  });
  
  if (result.isConfirmed) {
    await autoFixCategories(invalidDocs);
  } else if (result.isDismissed && result.dismiss !== Swal.DismissReason.cancel) {
    // Cancelar - no hacer nada
    return;
  } else {
    // Eliminar documentos inválidos
    await deleteInvalidDocuments(invalidDocs);
  }
}

// Corregir automáticamente las categorías
async function autoFixCategories(invalidDocs) {
  try {
    console.log('🔧 Corrigiendo categorías automáticamente...');
    
    const batch = db.batch();
    let fixedCount = 0;
    
    for (const doc of invalidDocs) {
      const docRef = db.collection('designs').doc(doc.id);
      const updates = {};
      
      // Corregir categoría si es inválida
      if (!VALID_CATEGORIES.includes(doc.currentCategory)) {
        // Asignar categoría por defecto basada en el nombre o características
        let suggestedCategory = 'INTERCLASES'; // Por defecto
        
        const name = doc.name.toLowerCase();
        if (name.includes('futsal') || name.includes('sala')) {
          suggestedCategory = 'FUTSALEROS';
        } else if (name.includes('oficial') || name.includes('barcelona') || name.includes('madrid')) {
          suggestedCategory = 'EQUIPOS OFICIALES';
        } else if (name.includes('internacional') || name.includes('mundial')) {
          suggestedCategory = 'INTERNACIONALES';
        }
        
        updates.category = suggestedCategory;
      }
      
      // Corregir tipo si es inválido
      if (!VALID_TYPES.includes(doc.currentType)) {
        // Si no tiene precio o precio es 0, es gratis, sino premium
        const price = parseFloat(doc.data.price) || 0;
        updates.type = price === 0 ? 'gratis' : 'premium';
      }
      
      if (Object.keys(updates).length > 0) {
        batch.update(docRef, updates);
        fixedCount++;
        console.log(`🔧 Corrigiendo "${doc.name}":`, updates);
      }
    }
    
    if (fixedCount > 0) {
      await batch.commit();
      
      Swal.fire({
        icon: 'success',
        title: '✅ Categorías Corregidas',
        html: `
          <p>Se corrigieron <strong>${fixedCount}</strong> documentos exitosamente.</p>
          <p>Las categorías ahora siguen el estándar de Design Reyes.</p>
        `,
        confirmButtonText: 'Perfecto'
      });
      
      // Forzar recarga del catálogo
      if (typeof forceReloadCatalog === 'function') {
        setTimeout(() => {
          forceReloadCatalog();
        }, 1000);
      }
    }
    
  } catch (error) {
    console.error('❌ Error corrigiendo categorías:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error corrigiendo categorías',
      text: error.message
    });
  }
}

// Eliminar documentos con categorías inválidas
async function deleteInvalidDocuments(invalidDocs) {
  try {
    const confirmResult = await Swal.fire({
      title: '⚠️ Confirmar Eliminación',
      html: `
        <p>¿Estás seguro de que deseas eliminar <strong>${invalidDocs.length}</strong> documentos con categorías inválidas?</p>
        <p style="color: #dc3545;"><strong>Esta acción no se puede deshacer.</strong></p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '🗑️ Sí, Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    });
    
    if (!confirmResult.isConfirmed) {
      return;
    }
    
    console.log('🗑️ Eliminando documentos con categorías inválidas...');
    
    const batch = db.batch();
    
    invalidDocs.forEach(doc => {
      const docRef = db.collection('designs').doc(doc.id);
      batch.delete(docRef);
    });
    
    await batch.commit();
    
    Swal.fire({
      icon: 'success',
      title: '🗑️ Documentos Eliminados',
      text: `Se eliminaron ${invalidDocs.length} documentos con categorías inválidas`,
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
      title: 'Error eliminando documentos',
      text: error.message
    });
  }
}

// Mostrar estadísticas de categorías
async function showCategoryStatistics() {
  try {
    const snapshot = await db.collection('designs').get();
    const stats = {
      total: snapshot.size,
      byCategory: {},
      byType: {}
    };
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const category = data.category || 'Sin categoría';
      const type = data.type || 'Sin tipo';
      
      // Contar por categoría
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      
      // Contar por tipo
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });
    
    const categoryList = Object.entries(stats.byCategory)
      .map(([cat, count]) => {
        const isValid = VALID_CATEGORIES.includes(cat);
        const icon = isValid ? '✅' : '❌';
        return `<li>${icon} ${cat}: ${count} diseños</li>`;
      }).join('');
    
    const typeList = Object.entries(stats.byType)
      .map(([type, count]) => {
        const isValid = VALID_TYPES.includes(type);
        const icon = isValid ? '✅' : '❌';
        return `<li>${icon} ${type}: ${count} diseños</li>`;
      }).join('');
    
    Swal.fire({
      title: '📊 Estadísticas de Categorías',
      html: `
        <div style="text-align: left;">
          <p><strong>Total de diseños:</strong> ${stats.total}</p>
          <br>
          <strong>Por categoría:</strong>
          <ul style="margin: 10px 0; padding-left: 20px;">
            ${categoryList}
          </ul>
          <br>
          <strong>Por tipo:</strong>
          <ul style="margin: 10px 0; padding-left: 20px;">
            ${typeList}
          </ul>
        </div>
      `,
      width: '500px',
      confirmButtonText: 'Entendido'
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error obteniendo estadísticas',
      text: error.message
    });
  }
}

// Hacer funciones globales
window.validateAndFixCategories = validateAndFixCategories;
window.showCategoryStatistics = showCategoryStatistics;
window.VALID_CATEGORIES = VALID_CATEGORIES;
window.VALID_TYPES = VALID_TYPES;

console.log('📂 Verificador de categorías cargado');