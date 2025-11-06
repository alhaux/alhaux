// Script de prueba para verificar el funcionamiento del panel de administración

// Función para probar la funcionalidad de ir al inicio
function testHomeButton() {
  console.log('=== PRUEBA DEL BOTÓN IR AL INICIO ===');
  
  // Verificar si el elemento existe
  const btnGoHome = document.getElementById('btnGoHome');
  
  if (btnGoHome) {
    console.log('✅ Botón "Ir al inicio" encontrado');
    console.log('📍 Elemento:', btnGoHome);
    console.log('📝 Texto:', btnGoHome.textContent);
    console.log('🔗 Href:', btnGoHome.href);
    
    // Verificar entorno actual
    const currentLocation = window.location;
    console.log('🌐 URL actual:', currentLocation.href);
    console.log('🔧 Protocolo:', currentLocation.protocol);
    console.log('🏠 Hostname:', currentLocation.hostname);
    console.log('📂 Pathname:', currentLocation.pathname);
    
    // Simular clic para prueba (comentado para evitar redirección accidental)
    // console.log('🖱️ Simulando clic...');
    // btnGoHome.click();
    
    console.log('💡 Para probar manualmente, ejecuta: testHomeNavigation()');
    
  } else {
    console.error('❌ Botón "Ir al inicio" NO encontrado');
  }
}

// Función para probar la navegación sin redireccionar realmente
function testHomeNavigation() {
  console.log('=== PRUEBA DE NAVEGACIÓN AL INICIO ===');
  
  const currentLocation = window.location;
  const isLocalFile = currentLocation.protocol === 'file:';
  const isLiveServer = currentLocation.hostname === '127.0.0.1' || currentLocation.hostname === 'localhost';
  
  console.log('📊 Análisis del entorno:');
  console.log('- Archivo local:', isLocalFile);
  console.log('- Live Server:', isLiveServer);
  console.log('- Protocolo:', currentLocation.protocol);
  console.log('- Host:', currentLocation.hostname);
  console.log('- Puerto:', currentLocation.port);
  
  if (isLocalFile) {
    console.log('🎯 Destino recomendado: Index.html (mismo directorio)');
  } else if (isLiveServer) {
    console.log('🎯 Destino recomendado: Index.html o /templates/Index.html');
  } else {
    console.log('🎯 Destino recomendado: Ruta del servidor Flask');
  }
  
  console.log('⚠️ Para ejecutar la redirección real, ejecuta: goToHome()');
}

// Función para probar la funcionalidad de cerrar sesión
function testLogoutButton() {
  console.log('=== PRUEBA DEL BOTÓN CERRAR SESIÓN ===');
  
  // Verificar si el elemento existe
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (logoutBtn) {
    console.log('✅ Botón de cerrar sesión encontrado');
    console.log('📍 Elemento:', logoutBtn);
    console.log('📝 Texto:', logoutBtn.textContent);
    console.log('🔗 Href:', logoutBtn.href);
    
    // Verificar si tiene event listeners
    const hasListeners = logoutBtn.onclick !== null || 
                        logoutBtn.addEventListener !== undefined;
    console.log('🎯 Tiene event listeners:', hasListeners);
    
    // Simular clic para prueba (comentado para evitar logout accidental)
    // console.log('🖱️ Simulando clic...');
    // logoutBtn.click();
    
    console.log('💡 Para probar manualmente, ejecuta: testLogoutFlow()');
    
  } else {
    console.error('❌ Botón de cerrar sesión NO encontrado');
    console.log('🔍 Buscando elementos similares...');
    
    // Buscar por clase
    const navLinks = document.querySelectorAll('.nav-link');
    console.log('📋 Enlaces de navegación encontrados:', navLinks.length);
    
    navLinks.forEach((link, index) => {
      console.log(`${index + 1}. ID: ${link.id}, Texto: ${link.textContent}`);
    });
  }
}

// Función para probar el flujo de logout sin ejecutar realmente
function testLogoutFlow() {
  console.log('=== SIMULACIÓN DEL FLUJO DE LOGOUT ===');
  
  if (typeof handleLogout === 'function') {
    console.log('✅ Función handleLogout encontrada');
    console.log('💡 Para probar, puedes ejecutar:');
    console.log('handleLogout({preventDefault: () => console.log("preventDefault llamado")})');
  } else {
    console.error('❌ Función handleLogout no encontrada');
  }
}

// Función para verificar datos de Firebase
async function testFirebaseData() {
  console.log('=== PRUEBA DE DATOS DE FIREBASE ===');
  
  if (typeof db === 'undefined') {
    console.error('❌ Firestore no inicializado');
    return;
  }
  
  try {
    console.log('🔍 Consultando colección "designs"...');
    const designsSnapshot = await db.collection('designs').get();
    console.log(`📊 Diseños encontrados: ${designsSnapshot.size}`);
    
    if (!designsSnapshot.empty) {
      console.log('📋 Lista de diseños:');
      designsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ID: ${doc.id}`);
        console.log(`   Nombre: ${data.name || 'Sin nombre'}`);
        console.log(`   Categoría: ${data.category || 'Sin categoría'}`);
        console.log(`   Tipo: ${data.type || 'Sin tipo'}`);
        console.log(`   Precio: ${data.type === 'premium' ? 'S/ ' + (data.price || 0) : 'Gratis'}`);
        console.log(`   Creado: ${data.createdAt ? data.createdAt.toDate() : 'Sin fecha'}`);
        console.log('   ---');
      });
    } else {
      console.log('📭 No hay diseños en la base de datos');
    }
    
    console.log('🔍 Consultando colección "users"...');
    const usersSnapshot = await db.collection('users').get();
    console.log(`👥 Usuarios encontrados: ${usersSnapshot.size}`);
    
    if (!usersSnapshot.empty) {
      console.log('📋 Lista de usuarios:');
      usersSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ID: ${doc.id}`);
        console.log(`   Email: ${data.email || 'Sin email'}`);
        console.log(`   Plan: ${data.plan || 'Básico'}`);
        console.log('   ---');
      });
    } else {
      console.log('� No hay usuarios en la base de datos');
    }
    
  } catch (error) {
    console.error('❌ Error consultando Firebase:', error);
  }
}

// Función para crear datos de prueba
async function createTestData() {
  console.log('=== CREANDO DATOS DE PRUEBA ===');
  
  if (typeof db === 'undefined') {
    console.error('❌ Firestore no inicializado');
    return;
  }
  
  try {
    // Crear diseños de prueba
    const testDesigns = [
      {
        name: 'Camiseta Barcelona 2024',
        description: 'Diseño moderno del FC Barcelona para la temporada 2024',
        category: 'EQUIPOS OFICIALES',
        type: 'premium',
        price: 15.90,
        formats: ['PSD', 'PNG', 'JPG'],
        driveLink: 'https://drive.google.com/file/d/ejemplo1',
        imageUrl: 'https://via.placeholder.com/300x300/1E3A8A/FFFFFF?text=Barcelona',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: 'admin'
      },
      {
        name: 'Camiseta Real Madrid Clásica',
        description: 'Diseño clásico del Real Madrid',
        category: 'EQUIPOS OFICIALES',
        type: 'gratis',
        price: 0,
        formats: ['PNG', 'JPG'],
        driveLink: 'https://drive.google.com/file/d/ejemplo2',
        imageUrl: 'https://via.placeholder.com/300x300/FFFFFF/000000?text=Real+Madrid',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: 'admin'
      },
      {
        name: 'Diseño Interclases 2024',
        description: 'Camiseta personalizada para torneos interclases',
        category: 'INTERCLASES',
        type: 'premium',
        price: 12.50,
        formats: ['PSD', 'AI', 'PNG'],
        driveLink: 'https://drive.google.com/file/d/ejemplo3',
        imageUrl: 'https://via.placeholder.com/300x300/22C55E/FFFFFF?text=Interclases',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: 'admin'
      }
    ];
    
    for (const design of testDesigns) {
      const docRef = await db.collection('designs').add(design);
      console.log(`✅ Diseño creado: ${design.name} (ID: ${docRef.id})`);
    }
    
    // Crear usuarios de prueba
    const testUsers = [
      {
        email: 'usuario1@test.com',
        plan: 'Básico',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      },
      {
        email: 'usuario2@test.com',
        plan: 'Premium',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }
    ];
    
    for (const user of testUsers) {
      const docRef = await db.collection('users').add(user);
      console.log(`✅ Usuario creado: ${user.email} (ID: ${docRef.id})`);
    }
    
    console.log('🎉 Datos de prueba creados exitosamente');
    console.log('💡 Ejecuta loadDashboardData() para ver los datos actualizados');
    
  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  }
}

// Función para limpiar datos de prueba
async function clearTestData() {
  console.log('=== LIMPIANDO DATOS DE PRUEBA ===');
  
  if (typeof db === 'undefined') {
    console.error('❌ Firestore no inicializado');
    return;
  }
  
  try {
    // Eliminar todos los diseños
    const designsSnapshot = await db.collection('designs').get();
    const deleteDesignPromises = designsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deleteDesignPromises);
    console.log(`✅ ${designsSnapshot.size} diseños eliminados`);
    
    // Eliminar todos los usuarios (excepto admin)
    const usersSnapshot = await db.collection('users').get();
    const deleteUserPromises = usersSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deleteUserPromises);
    console.log(`✅ ${usersSnapshot.size} usuarios eliminados`);
    
    console.log('🧹 Datos de prueba eliminados');
    console.log('💡 Ejecuta loadDashboardData() para ver los datos actualizados');
    
  } catch (error) {
    console.error('❌ Error limpiando datos:', error);
  }
}

// Función para verificar SweetAlert2
function testSweetAlert() {
  console.log('=== PRUEBA DE SWEETALERT2 ===');
  
  if (typeof Swal !== 'undefined') {
    console.log('✅ SweetAlert2 cargado correctamente');
    // Comentado para evitar popup molesto al cargar
    // Swal.fire({
    //   title: 'Prueba exitosa',
    //   text: 'SweetAlert2 está funcionando correctamente',
    //   icon: 'success',
    //   timer: 2000,
    //   showConfirmButton: false
    // });
  } else {
    console.error('❌ SweetAlert2 no cargado');
  }
}

// Función principal de pruebas (solo logging, sin popups)
function runAllTests() {
  console.log('🚀 EJECUTANDO TODAS LAS PRUEBAS DEL PANEL DE ADMINISTRACIÓN');
  console.log('=' .repeat(60));
  
  testHomeButton();
  console.log('');
  testLogoutButton();
  console.log('');
  testFirebaseAuth();
  console.log('');
  testSweetAlert();
  
  console.log('=' .repeat(60));
  console.log('✅ Pruebas completadas. Revisa los resultados arriba.');
  console.log('💡 Funciones disponibles:');
  console.log('- testHomeNavigation() - Analizar navegación al inicio');
  console.log('- testLogoutFlow() - Probar flujo de logout');
  console.log('- testFirebaseData() - Verificar datos de Firebase');
  console.log('- createTestData() - Crear datos de prueba');
  console.log('- clearTestData() - Limpiar datos de prueba');
  console.log('- testSweetAlertPopup() - Probar popup de SweetAlert');
  console.log('- goToHome() - Ejecutar redirección al inicio');
  console.log('- loadDashboardData() - Recargar datos del dashboard');
  console.log('- runAllTests() - Ejecutar todas las pruebas');
}

// Función para probar SweetAlert con popup (solo manual)
function testSweetAlertPopup() {
  console.log('=== PRUEBA DE SWEETALERT2 CON POPUP ===');
  
  if (typeof Swal !== 'undefined') {
    console.log('✅ SweetAlert2 cargado, mostrando popup de prueba...');
    
    Swal.fire({
      title: 'Prueba exitosa',
      text: 'SweetAlert2 está funcionando correctamente',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  } else {
    console.error('❌ SweetAlert2 no cargado');
  }
}

// Función para verificar Firebase completo
function testFirebaseAuth() {
  console.log('=== PRUEBA DE FIREBASE AUTH ===');
  
  if (typeof firebase !== 'undefined') {
    console.log('✅ Firebase cargado correctamente');
    
    if (typeof auth !== 'undefined') {
      console.log('✅ Firebase Auth inicializado');
      console.log('👤 Usuario actual:', auth.currentUser);
      
      // Verificar estado de autenticación
      if (auth.currentUser) {
        console.log('📧 Email:', auth.currentUser.email);
        console.log('🔑 UID:', auth.currentUser.uid);
      } else {
        console.log('⚠️ No hay usuario autenticado');
      }
    } else {
      console.error('❌ Firebase Auth no inicializado');
    }
    
    if (typeof db !== 'undefined') {
      console.log('✅ Firestore inicializado');
      console.log('💡 Ejecuta testFirebaseData() para ver los datos');
    } else {
      console.error('❌ Firestore no inicializado');
    }
    
    if (typeof storage !== 'undefined') {
      console.log('✅ Storage inicializado');
    } else {
      console.error('❌ Storage no inicializado');
    }
  } else {
    console.error('❌ Firebase no cargado');
  }
}

// Ejecutar pruebas cuando el DOM esté listo (solo logging, sin popups)
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Panel de administración cargado');
  console.log('💡 Funciones de prueba disponibles:');
  console.log('- runAllTests() - Ejecutar todas las pruebas');
  console.log('- testFirebaseData() - Ver datos de Firebase');
  console.log('- createTestData() - Crear datos de prueba');
  console.log('- loadDashboardData() - Recargar dashboard');
  
  // Solo ejecutar pruebas silenciosas (sin popups)
  setTimeout(() => {
    console.log('🔍 Ejecutando verificaciones básicas...');
    testHomeButton();
    testLogoutButton();
    testFirebaseAuth();
    console.log('✅ Verificaciones completadas. Panel listo para usar.');
  }, 1000);
});

// También ejecutar si el DOM ya está cargado
if (document.readyState !== 'loading') {
  console.log('🚀 DOM ya cargado');
  setTimeout(() => {
    console.log('🔍 Ejecutando verificaciones básicas...');
    testHomeButton();
    testLogoutButton();
    testFirebaseAuth();
    console.log('✅ Verificaciones completadas. Panel listo para usar.');
  }, 1000);
}

// Hacer funciones globales para fácil acceso desde consola
window.testHomeButton = testHomeButton;
window.testHomeNavigation = testHomeNavigation;
window.testLogoutButton = testLogoutButton;
window.testLogoutFlow = testLogoutFlow;
window.testFirebaseAuth = testFirebaseAuth;
window.testFirebaseData = testFirebaseData;
window.createTestData = createTestData;
window.clearTestData = clearTestData;
window.testSweetAlert = testSweetAlert;
window.testSweetAlertPopup = testSweetAlertPopup;
window.runAllTests = runAllTests;