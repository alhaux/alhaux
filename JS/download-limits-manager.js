// Sistema de gestión de límites de descarga - Design Reyes

// Verificar y resetear límites diarios si es necesario
async function checkAndResetDailyLimits() {
  try {
    const user = auth.currentUser;
    if (!user) return;

    // Obtener fecha actual (inicio del día)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verificar si hay un reset pendiente desde ayer
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Obtener datos del usuario
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    if (!userData) return;

    const lastReset = userData.lastDailyReset ? userData.lastDailyReset.toDate() : null;
    
    // Si no se ha hecho reset hoy, actualizar
    if (!lastReset || lastReset < today) {
      await db.collection('users').doc(user.uid).update({
        lastDailyReset: firebase.firestore.FieldValue.serverTimestamp(),
        dailyDownloadsUsed: 0 // Reset contador diario
      });
      
      console.log('✅ Límites diarios reseteados para el usuario');
    }

  } catch (error) {
    console.error('Error verificando reset diario:', error);
  }
}

// Obtener estadísticas de descarga en tiempo real
async function getDownloadStats(userId) {
  try {
    // Obtener datos del usuario
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData) {
      return {
        membership: 'free',
        todayCount: 0,
        dailyLimit: 7,
        totalDownloads: 0,
        remaining: 7
      };
    }

    const membership = userData.membership || 'free';
    
    // Límites por membresía
    const membershipLimits = {
      'free': 7,
      'basic': 13, 
      'premium': 30,
      'elite': -1 // Ilimitado
    };

    const dailyLimit = membershipLimits[membership];

    // Obtener fecha actual (inicio del día)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Contar descargas del día actual
    const downloadsToday = await db.collection('downloads')
      .where('userId', '==', userId)
      .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(today))
      .get();

    // Contar total de descargas
    const totalDownloads = await db.collection('downloads')
      .where('userId', '==', userId)
      .get();

    const todayCount = downloadsToday.size;
    const remaining = dailyLimit === -1 ? '∞' : Math.max(0, dailyLimit - todayCount);

    return {
      membership,
      todayCount,
      dailyLimit: dailyLimit === -1 ? '∞' : dailyLimit,
      totalDownloads: totalDownloads.size,
      remaining,
      isUnlimited: dailyLimit === -1
    };

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return {
      membership: 'free',
      todayCount: 0,
      dailyLimit: 7,
      totalDownloads: 0,
      remaining: 7
    };
  }
}

// Actualizar el display de estadísticas en tiempo real
async function updateDownloadDisplay(userId) {
  try {
    const stats = await getDownloadStats(userId);
    
    // Actualizar elementos del DOM si existen
    const todayElement = document.getElementById('descargasHoy');
    const totalElement = document.getElementById('descargasCount');
    
    if (todayElement) {
      todayElement.textContent = `${stats.todayCount} / ${stats.dailyLimit}`;
      
      // Aplicar colores según el progreso
      if (!stats.isUnlimited) {
        const percentage = stats.todayCount / stats.dailyLimit;
        if (percentage >= 0.9) {
          todayElement.style.color = '#ff6b6b';
          todayElement.style.fontWeight = 'bold';
        } else if (percentage >= 0.7) {
          todayElement.style.color = '#ffd93d';
          todayElement.style.fontWeight = '600';
        } else {
          todayElement.style.color = '#51cf66';
          todayElement.style.fontWeight = '500';
        }
      } else {
        todayElement.style.color = '#51cf66';
        todayElement.style.fontWeight = '500';
      }
    }
    
    if (totalElement) {
      totalElement.textContent = stats.totalDownloads;
    }

    return stats;

  } catch (error) {
    console.error('Error actualizando display:', error);
  }
}

// Mostrar widget de progreso flotante (opcional)
function showDownloadWidget(stats) {
  if (stats.isUnlimited) return; // No mostrar para elite
  
  const percentage = (stats.todayCount / stats.dailyLimit) * 100;
  
  // Solo mostrar si está por encima del 50%
  if (percentage < 50) return;
  
  const widgetId = 'download-progress-widget';
  let widget = document.getElementById(widgetId);
  
  // Crear widget si no existe
  if (!widget) {
    widget = document.createElement('div');
    widget.id = widgetId;
    widget.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px;
      border-radius: 10px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      border: 1px solid #6236ff;
      max-width: 200px;
    `;
    document.body.appendChild(widget);
  }
  
  const color = percentage >= 90 ? '#ff6b6b' : percentage >= 70 ? '#ffd93d' : '#51cf66';
  
  widget.innerHTML = `
    <div style="text-align: center; margin-bottom: 10px;">
      <strong>📊 Descargas Hoy</strong>
    </div>
    <div style="margin-bottom: 8px;">
      <strong>${stats.todayCount} / ${stats.dailyLimit}</strong> utilizadas
    </div>
    <div style="background: #333; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
      <div style="background: ${color}; height: 100%; width: ${percentage}%; border-radius: 4px; transition: width 0.3s ease;"></div>
    </div>
    <div style="font-size: 10px; color: #ccc; text-align: center;">
      ${stats.remaining} restantes
    </div>
  `;
  
  // Auto-ocultar después de 10 segundos
  setTimeout(() => {
    if (widget && widget.parentNode) {
      widget.remove();
    }
  }, 10000);
}

// Inicializar sistema de límites cuando se carga la página
function initDownloadLimitsSystem() {
  // Verificar reset diario al cargar
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      await checkAndResetDailyLimits();
      
      // Actualizar display si estamos en el dashboard
      if (window.location.pathname.includes('dashboard.html')) {
        await updateDownloadDisplay(user.uid);
      }
    }
  });
}

// Hacer funciones globales
window.checkAndResetDailyLimits = checkAndResetDailyLimits;
window.getDownloadStats = getDownloadStats;
window.updateDownloadDisplay = updateDownloadDisplay;
window.showDownloadWidget = showDownloadWidget;
window.initDownloadLimitsSystem = initDownloadLimitsSystem;

// Auto-inicializar
if (typeof auth !== 'undefined') {
  initDownloadLimitsSystem();
}

console.log('📊 Sistema de límites de descarga cargado');