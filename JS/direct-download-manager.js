// Sistema de descarga directa para diseños - Design Reyes

// Función para descargar archivos directamente desde Firebase Storage
async function downloadDesign(designId, designName) {
  try {
    console.log(`🔄 Iniciando descarga de diseño: ${designId}`);
    
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Obtener datos del usuario para verificar membresía
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const userMembership = userData?.membership || 'free';
    
    // Mostrar indicador de descarga
    Swal.fire({
      title: '📥 Descargando...',
      text: `Preparando descarga de "${designName}"`,
      icon: 'info',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Obtener datos del diseño desde Firestore
    const designDoc = await db.collection('designs').doc(designId).get();
    
    if (!designDoc.exists) {
      throw new Error('Diseño no encontrado');
    }
    
    const designData = designDoc.data();
    
    // Verificar si el usuario tiene acceso
    const hasAccess = await checkDownloadAccess(designData);
    if (!hasAccess) {
      Swal.fire({
        icon: 'error',
        title: '🔒 Acceso Denegado',
        text: 'No tienes acceso a este diseño. Considera actualizar tu membresía.',
        confirmButtonText: 'Ver Membresías',
        showCancelButton: true,
        cancelButtonText: 'Cerrar'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = 'membresia.html';
        }
      });
      return;
    }

    // Verificar si existe el archivo en Storage
    if (!designData.downloadUrl && !designData.fileStoragePath) {
      throw new Error('Archivo no disponible para descarga');
    }

    let downloadUrl;
    
    // Si tiene enlace de Google Drive, usarlo
    if (designData.googleDriveUrl) {
      downloadUrl = designData.googleDriveUrl;
      console.log('📎 Usando enlace de Google Drive:', downloadUrl);
    }
    // Si ya tiene URL de descarga directa, usarla (para compatibilidad)
    else if (designData.downloadUrl) {
      downloadUrl = designData.downloadUrl;
      console.log('🔗 Usando URL de descarga directa:', downloadUrl);
    } 
    // Si tiene ruta de storage, generar URL (para diseños antiguos)
    else if (designData.fileStoragePath) {
      const storageRef = storage.ref(designData.fileStoragePath);
      downloadUrl = await storageRef.getDownloadURL();
      console.log('☁️ Generando URL desde Storage:', downloadUrl);
    }
    else {
      throw new Error('No se pudo obtener el enlace de descarga');
    }

    // Registrar la descarga
    await logDownload(designId, designData);

    // Si es un diseño premium y el usuario tiene acceso por membresía, 
    // NO registrar como venta individual (ya pagó por la membresía)
    // Solo registrar ventas directas si implementas compra individual en el futuro

    // Manejar diferentes tipos de descarga
    if (designData.googleDriveUrl) {
      // Para Google Drive, abrir en nueva pestaña
      console.log('🌐 Abriendo Google Drive en nueva pestaña');
      window.open(downloadUrl, '_blank');
      
      // Mostrar instrucciones para Google Drive
      Swal.fire({
        icon: 'info',
        title: '📁 Redirigiendo a Google Drive',
        html: `
          <p>Te estamos redirigiendo a Google Drive para descargar:</p>
          <p><strong>"${designName}"</strong></p>
          <br>
          <p style="color: #666; font-size: 14px;">
            💡 <strong>Instrucciones:</strong><br>
            1. Haz clic en el botón de descarga en Google Drive<br>
            2. El archivo se descargará automáticamente<br>
            3. Si no se abre automáticamente, 
            <a href="${downloadUrl}" target="_blank" style="color: #007bff;">haz clic aquí</a>
          </p>
        `,
        confirmButtonText: '✅ Entendido',
        timer: 8000,
        timerProgressBar: true
      });
    } else {
      // Para descargas directas (Firebase Storage u otros)
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${designName}.${getFileExtension(designData.fileName || 'design.zip')}`;
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Mostrar éxito para descarga directa
      Swal.fire({
        icon: 'success',
        title: '✅ ¡Descarga Iniciada!',
        text: `La descarga de "${designName}" debería comenzar automáticamente.`,
        timer: 3000,
        timerProgressBar: true
      });
    }

    // Mostrar progreso después de la descarga (solo para usuarios con membresía)
    if (userMembership !== 'free') {
      await showDownloadProgress(user.uid, userMembership);
    }

    console.log(`✅ Descarga iniciada exitosamente: ${designName}`);

  } catch (error) {
    console.error('❌ Error en descarga:', error);
    
    Swal.fire({
      icon: 'error',
      title: '❌ Error de Descarga',
      text: `No se pudo descargar "${designName}": ${error.message}`,
      confirmButtonText: 'Intentar de nuevo',
      showCancelButton: true,
      cancelButtonText: 'Cerrar'
    }).then((result) => {
      if (result.isConfirmed) {
        downloadDesign(designId, designName);
      }
    });
  }
}

// Verificar acceso de descarga según membresía
async function checkDownloadAccess(designData) {
  const user = auth.currentUser;
  
  if (!user) {
    return false; // No autenticado
  }

async function checkDownloadAccess(designData) {
  const user = auth.currentUser;
  if (!user) return false;

  // Diseños gratuitos siempre son accesibles para usuarios logueados
  if (designData.type === 'gratis' || parseFloat(designData.price) === 0) {
    return await checkDailyLimit(user.uid, 'free');
  }

  try {
    // Obtener datos del usuario
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    if (!userData) {
      return false;
    }

    const membership = userData.membership || 'free';
    const membershipStatus = userData.membershipStatus || 'active';

    // Si no tiene membresía activa, solo puede descargar diseños gratis con límite
    if (membershipStatus !== 'active' && membership === 'free') {
      return false; // No puede descargar diseños premium
    }

    // Verificar límites diarios según membresía
    return await checkDailyLimit(user.uid, membership);

  } catch (error) {
    console.error('Error verificando acceso:', error);
    return false;
  }
}

// Verificar límites diarios de descarga según membresía
async function checkDailyLimit(userId, membership) {
  try {
    // Límites por tipo de membresía
    const membershipLimits = {
      'free': 7,           // 7 descargas diarias (solo gratis)
      'basic': 13,         // 13 descargas diarias (premium)
      'premium': 30,       // 30 descargas diarias
      'elite': -1          // Ilimitado
    };

    const dailyLimit = membershipLimits[membership] || 7;
    
    // Si es ilimitado (elite)
    if (dailyLimit === -1) {
      return true;
    }

    // Obtener fecha actual (inicio del día)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Contar descargas del día actual
    const downloadsToday = await db.collection('downloads')
      .where('userId', '==', userId)
      .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(today))
      .get();

    const currentDownloads = downloadsToday.size;
    
    if (currentDownloads >= dailyLimit) {
      // Mostrar mensaje específico según membresía
      showLimitReachedMessage(membership, currentDownloads, dailyLimit);
      return false;
    }

    return true;

  } catch (error) {
    console.error('Error verificando límite diario:', error);
    return false;
  }
}

// Mostrar mensaje cuando se alcanza el límite de descargas
function showLimitReachedMessage(membership, currentDownloads, dailyLimit) {
  const membershipNames = {
    'free': '🆓 FREE',
    'basic': '⭐ BASIC',
    'premium': '💎 PREMIUM',
    'elite': '👑 ELITE'
  };

  const upgradeOptions = {
    'free': '⭐ BASIC ($10 USD) - 13 descargas diarias<br>💎 PREMIUM ($15 USD) - 30 descargas<br>👑 ELITE ($60 USD) - Descargas ilimitadas',
    'basic': '💎 PREMIUM ($15 USD) - 30 descargas diarias<br>👑 ELITE ($60 USD) - Descargas ilimitadas',
    'premium': '👑 ELITE ($60 USD) - Descargas ilimitadas'
  };

  Swal.fire({
    icon: 'warning',
    title: '📈 Límite de Descargas Alcanzado',
    html: `
      <div style="text-align: center;">
        <p><strong>Membresía actual:</strong> ${membershipNames[membership]}</p>
        <p><strong>Descargas hoy:</strong> ${currentDownloads}/${dailyLimit}</p>
        <hr style="margin: 20px 0;">
        <p><strong>💡 ¿Quieres más descargas?</strong></p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          ${upgradeOptions[membership] || 'Contacta con soporte para más información'}
        </div>
        <p><small>El límite se reinicia cada día a las 00:00</small></p>
      </div>
    `,
    confirmButtonText: '🚀 Upgrade Membresía',
    showCancelButton: true,
    cancelButtonText: 'Entendido',
    confirmButtonColor: '#6236ff'
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = 'membresia.html';
    }
  });
}
}

// Registrar descarga para estadísticas
async function logDownload(designId, designData) {
  try {
    const user = auth.currentUser;
    if (!user) return;

    await db.collection('downloads').add({
      userId: user.uid,
      designId: designId,
      designName: designData.name,
      designCategory: designData.category,
      designType: designData.type,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      userAgent: navigator.userAgent,
      ip: 'unknown' // Se podría obtener con un servicio externo
    });

    console.log(`📊 Descarga registrada: ${designData.name}`);
  } catch (error) {
    console.error('Error registrando descarga:', error);
    // No bloquear la descarga por error de registro
  }
}

// Obtener extensión de archivo
function getFileExtension(fileName) {
  return fileName.split('.').pop() || 'zip';
}

// Función para subir archivos a Firebase Storage (para admin)
async function uploadDesignFile(file, designId, progressCallback) {
  try {
    console.log(`🔄 Subiendo archivo: ${file.name}`);
    
    const fileName = `${designId}_${Date.now()}.${getFileExtension(file.name)}`;
    const storageRef = storage.ref(`designs/${fileName}`);
    
    const uploadTask = storageRef.put(file);
    
    // Manejar progreso
    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (progressCallback) {
          progressCallback(progress);
        }
        console.log(`📤 Progreso de subida: ${progress.toFixed(1)}%`);
      },
      (error) => {
        console.error('Error en subida:', error);
        throw error;
      }
    );

    // Esperar a que termine la subida
    await uploadTask;
    
    // Obtener URL de descarga
    const downloadUrl = await storageRef.getDownloadURL();
    const storagePath = `designs/${fileName}`;
    
    console.log(`✅ Archivo subido exitosamente: ${fileName}`);
    
    return {
      downloadUrl: downloadUrl,
      fileStoragePath: storagePath,
      fileName: fileName,
      fileSize: file.size
    };
    
  } catch (error) {
    console.error('❌ Error subiendo archivo:', error);
    throw new Error(`Error al subir archivo: ${error.message}`);
  }
}

// Función para manejar el click de descarga en el catálogo
async function handleDownloadClick(designId, designName, designType, designPrice) {
  const user = auth.currentUser;
  
  if (!user) {
    Swal.fire({
      title: '🔐 Iniciar Sesión',
      text: 'Debes iniciar sesión para descargar diseños',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Iniciar Sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = 'login.html';
      }
    });
    return;
  }

  // Si es gratis, descargar directamente
  if (designType === 'gratis' || parseFloat(designPrice) === 0) {
    await downloadDesign(designId, designName);
    return;
  }

  // Si es premium, verificar acceso primero
  const hasAccess = await checkDownloadAccess({ type: designType, price: designPrice });
  
  if (hasAccess) {
    await downloadDesign(designId, designName);
  } else {
    Swal.fire({
      icon: 'warning',
      title: '🔒 Membresía Requerida',
      html: `
        <p>Este diseño requiere una membresía activa.</p>
        <p><strong>Precio:</strong> S/ ${parseFloat(designPrice).toFixed(2)}</p>
        <p>Con una membresía Premium puedes acceder a todos los diseños.</p>
      `,
      confirmButtonText: '🎯 Ver Membresías',
      showCancelButton: true,
      cancelButtonText: 'Cerrar'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = 'membresia.html';
      }
    });
  }
}

// Registrar venta directa de diseño (para futuras implementaciones de compra individual)
async function recordDesignSale(designId, designData, paymentAmount) {
  try {
    const user = auth.currentUser;
    if (!user) return;

    // Registrar la venta en la colección 'purchases'
    await db.collection('purchases').add({
      userId: user.uid,
      userEmail: user.email,
      designId: designId,
      designName: designData.name,
      designCategory: designData.category,
      price: paymentAmount,
      currency: 'PEN',
      paymentMethod: 'direct', // vs 'membership'
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'completed'
    });

    console.log(`💰 Venta registrada: ${designData.name} - S/ ${paymentAmount}`);
    
    // Mostrar notificación de venta
    Swal.fire({
      icon: 'success',
      title: '💰 Venta Registrada',
      text: `+S/ ${paymentAmount} por venta de "${designData.name}"`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    });

  } catch (error) {
    console.error('Error registrando venta:', error);
  }
}

// Mostrar progreso de descargas después de una descarga exitosa
async function showDownloadProgress(userId, membership) {
  try {
    // Obtener fecha actual (inicio del día)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Contar descargas del día actual
    const downloadsToday = await db.collection('downloads')
      .where('userId', '==', userId)
      .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(today))
      .get();

    const currentDownloads = downloadsToday.size;
    
    // Límites por membresía
    const membershipLimits = {
      'free': 7,
      'basic': 13,
      'premium': 30,
      'elite': -1
    };

    const dailyLimit = membershipLimits[membership] || 7;
    
    if (dailyLimit === -1) return; // Elite ilimitado, no mostrar
    
    const remaining = dailyLimit - currentDownloads;
    const percentage = (currentDownloads / dailyLimit) * 100;
    
    // Mostrar notificación según el progreso
    if (remaining === 0) {
      // Límite alcanzado (ya manejado por checkDailyLimit)
      return;
    } else if (remaining <= 2) {
      // Cerca del límite
      showProgressNotification(currentDownloads, dailyLimit, remaining, 'warning');
    } else if (percentage >= 50) {
      // A mitad del límite
      showProgressNotification(currentDownloads, dailyLimit, remaining, 'info');
    }
    
  } catch (error) {
    console.error('Error mostrando progreso:', error);
  }
}

// Mostrar notificación de progreso
function showProgressNotification(current, limit, remaining, type) {
  const icons = {
    'info': 'ℹ️',
    'warning': '⚠️'
  };
  
  const colors = {
    'info': '#3085d6',
    'warning': '#f39c12'
  };
  
  const percentage = Math.round((current / limit) * 100);
  
  Swal.fire({
    icon: type,
    title: `${icons[type]} Progreso de descargas`,
    html: `
      <div style="text-align: center; margin: 15px 0;">
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
          <div style="font-size: 1.2em; margin-bottom: 10px;">
            <strong>${current} / ${limit}</strong> descargas utilizadas
          </div>
          <div style="background: #e9ecef; height: 20px; border-radius: 10px; overflow: hidden;">
            <div style="background: ${colors[type]}; height: 100%; width: ${percentage}%; border-radius: 10px; transition: width 0.3s ease;"></div>
          </div>
          <div style="margin-top: 8px; font-size: 0.9em; color: #666;">
            ${percentage}% del límite diario
          </div>
        </div>
        <p><strong>Te quedan ${remaining} descargas hoy</strong></p>
        ${remaining <= 2 ? '<p style="color: #e74c3c;"><small>⏰ ¡Considera upgradearte para más descargas!</small></p>' : ''}
      </div>
    `,
    showCancelButton: remaining <= 2,
    confirmButtonText: remaining <= 2 ? '🚀 Upgrade Ahora' : 'Continuar',
    cancelButtonText: 'Entendido',
    confirmButtonColor: '#6236ff',
    timer: remaining <= 2 ? null : 4000,
    timerProgressBar: remaining > 2
  }).then((result) => {
    if (result.isConfirmed && remaining <= 2) {
      window.location.href = 'membresia.html';
    }
  });
}

// Hacer funciones globales
window.downloadDesign = downloadDesign;
window.handleDownloadClick = handleDownloadClick;
window.uploadDesignFile = uploadDesignFile;
window.checkDownloadAccess = checkDownloadAccess;
window.recordDesignSale = recordDesignSale;
window.showDownloadProgress = showDownloadProgress;

console.log('📥 Sistema de descarga directa cargado');