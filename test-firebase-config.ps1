# Script para verificar y corregir configuración de Firebase Storage
# Ejecutar con: .\test-firebase-config.ps1

Write-Host "🔥 Firebase Storage Configuration Checker" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Verificar si el servidor está corriendo
Write-Host "`n📡 Verificando servidor local..." -ForegroundColor Yellow
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        $serverRunning = $true
        Write-Host "✅ Servidor local corriendo en puerto 8080" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Servidor local no disponible" -ForegroundColor Red
    Write-Host "💡 Ejecuta: python -m http.server 8080" -ForegroundColor Yellow
}

# Abrir página de configuración si el servidor está corriendo
if ($serverRunning) {
    Write-Host "`n🌐 Intentando abrir página de prueba de Firebase..." -ForegroundColor Yellow
    
    # Intentar diferentes navegadores
    $browsers = @(
        "C:\Program Files\Google\Chrome\Application\chrome.exe",
        "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    )
    
    $browserFound = $false
    foreach ($browser in $browsers) {
        if (Test-Path $browser) {
            Start-Process $browser "http://localhost:8080/test-firebase-configuration.html"
            Write-Host "✅ Abriendo con: $($browser | Split-Path -Leaf)" -ForegroundColor Green
            $browserFound = $true
            break
        }
    }
    
    # Si no encuentra navegadores específicos, usar Start-Process con URL
    if (-not $browserFound) {
        try {
            Start-Process "http://localhost:8080/test-firebase-configuration.html"
            Write-Host "✅ Abriendo con navegador predeterminado" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ No se pudo abrir automáticamente el navegador" -ForegroundColor Yellow
            Write-Host "📋 Abre manualmente: http://localhost:8080/test-firebase-configuration.html" -ForegroundColor Cyan
        }
    }
    
    # Esperar un momento y mostrar instrucciones
    Start-Sleep 2
    Write-Host "`n🎯 URLS IMPORTANTES:" -ForegroundColor Cyan
    Write-Host "🔥 Test Firebase: http://localhost:8080/test-firebase-configuration.html" -ForegroundColor White
    Write-Host "👨‍💼 Panel Admin: http://localhost:8080/templates/admin.html" -ForegroundColor White
    Write-Host "🏠 Catálogo: http://localhost:8080/templates/Index.html" -ForegroundColor White
    Write-Host "🧪 Test Upload: http://localhost:8080/test-upload-system.html" -ForegroundColor White
    
    Write-Host "`n📋 INSTRUCCIONES DE PRUEBA:" -ForegroundColor Cyan
    Write-Host "1. 🔑 Inicia sesión con tu cuenta de administrador" -ForegroundColor White
    Write-Host "2. 📤 Selecciona un archivo de prueba (imagen o ZIP)" -ForegroundColor White
    Write-Host "3. 🚀 Sube el archivo y verifica que funcione" -ForegroundColor White
    Write-Host "4. 📋 Ejecuta las pruebas de reglas de Storage" -ForegroundColor White
    Write-Host "5. 📊 Revisa el log de actividad para errores" -ForegroundColor White
} else {
    Write-Host "`n🔧 PASOS PARA CORREGIR:" -ForegroundColor Yellow
    Write-Host "1. Abre PowerShell en la carpeta del proyecto" -ForegroundColor White
    Write-Host "2. Ejecuta: python -m http.server 8080" -ForegroundColor White
    Write-Host "3. Vuelve a ejecutar este script" -ForegroundColor White
}

Write-Host "`n🔍 REGLAS DE STORAGE RECOMENDADAS:" -ForegroundColor Cyan
Write-Host @"
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura a todos para archivos del catálogo
    match /designs/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Carpeta de uploads temporales
    match /uploads/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // Archivos de prueba
    match /test_uploads/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
"@ -ForegroundColor Gray

Write-Host "`n🛠️ SI ENCUENTRAS ERRORES:" -ForegroundColor Yellow
Write-Host "• 'storage/retry-limit-exceeded' → Archivo muy grande o conexión lenta" -ForegroundColor White
Write-Host "• 'storage/unauthorized' → Reglas de Storage muy restrictivas" -ForegroundColor White
Write-Host "• 'storage/unknown' → Problema de conectividad" -ForegroundColor White
Write-Host "• Modal stuck 'Reintentando' → Error en manejo de promesas JS" -ForegroundColor White

Write-Host "`n✅ SOLUCIONES IMPLEMENTADAS:" -ForegroundColor Green
Write-Host "• Sistema de compresión automática para archivos grandes" -ForegroundColor White
Write-Host "• Retry inteligente con delays progresivos" -ForegroundColor White
Write-Host "• Manejo robusto de errores con logging detallado" -ForegroundColor White
Write-Host "• UI mejorada con feedback en tiempo real" -ForegroundColor White

Write-Host "`nPulsa cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")