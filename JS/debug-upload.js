// Debug script para diagnosticar problemas de upload
console.log('🐛 Debug script cargado');

// Verificar Firebase
if (typeof firebase !== 'undefined') {
    console.log('✅ Firebase disponible');
    if (firebase.firestore) {
        console.log('✅ Firestore disponible');
    }
    if (firebase.storage) {
        console.log('✅ Storage disponible');
    }
} else {
    console.error('❌ Firebase no disponible');
}

// Verificar SweetAlert
if (typeof Swal !== 'undefined') {
    console.log('✅ SweetAlert disponible');
} else {
    console.error('❌ SweetAlert no disponible');
}

// Verificar Upload Manager
if (typeof DesignUploader !== 'undefined') {
    console.log('✅ DesignUploader disponible');
} else {
    console.error('❌ DesignUploader no disponible');
}

// Verificar Catalog Sync
if (typeof forceReloadCatalog !== 'undefined') {
    console.log('✅ forceReloadCatalog disponible');
} else {
    console.error('❌ forceReloadCatalog no disponible');
}

// Debug de elementos DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏗️ DOM cargado, verificando elementos...');
    
    const elements = [
        'btnUploadDesign',
        'btnText', 
        'loadingSpinner',
        'fileUploadArea',
        'fileUploadAreaDesign'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ Elemento ${id} encontrado`);
        } else {
            console.error(`❌ Elemento ${id} NO encontrado`);
        }
    });
});

// Interceptar errores globales
window.addEventListener('error', (event) => {
    console.error('🚨 Error global capturado:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Promise rechazada:', event.reason);
});