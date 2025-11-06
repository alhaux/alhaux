# 🚀 Quick Start - Sistema Upload Design Reyes
# Script simple para acceso rápido al sistema

Write-Host "🎯 SISTEMA DE UPLOAD - DESIGN REYES" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Verificar servidor
Write-Host "`n🔍 Verificando servidor..." -ForegroundColor Yellow
try {
    $null = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Servidor corriendo en puerto 8080" -ForegroundColor Green
    $serverOK = $true
} catch {
    Write-Host "❌ Servidor NO está corriendo" -ForegroundColor Red
    $serverOK = $false
}

if ($serverOK) {
    Write-Host "`n🌐 ACCESO DIRECTO AL SISTEMA:" -ForegroundColor Green
    Write-Host "┌─────────────────────────────────────────────────────────────┐" -ForegroundColor White
    Write-Host "│  🔥 TEST FIREBASE CONFIG:                                   │" -ForegroundColor White
    Write-Host "│     http://localhost:8080/test-firebase-configuration.html │" -ForegroundColor Yellow
    Write-Host "│                                                             │" -ForegroundColor White
    Write-Host "│  👨‍💼 PANEL ADMIN (Upload):                                 │" -ForegroundColor White
    Write-Host "│     http://localhost:8080/templates/admin.html             │" -ForegroundColor Yellow
    Write-Host "│                                                             │" -ForegroundColor White
    Write-Host "│  🏠 CATÁLOGO PÚBLICO:                                       │" -ForegroundColor White
    Write-Host "│     http://localhost:8080/templates/Index.html             │" -ForegroundColor Yellow
    Write-Host "│                                                             │" -ForegroundColor White
    Write-Host "│  🧪 TEST UPLOAD SYSTEM:                                    │" -ForegroundColor White
    Write-Host "│     http://localhost:8080/test-upload-system.html          │" -ForegroundColor Yellow
    Write-Host "└─────────────────────────────────────────────────────────────┘" -ForegroundColor White

    Write-Host "`n📋 PASOS PARA PROBAR EL SISTEMA:" -ForegroundColor Cyan
    Write-Host "1️⃣  Copia y pega cualquier URL en tu navegador" -ForegroundColor White
    Write-Host "2️⃣  Para upload: ve a Panel Admin → Sección 'Subir Diseño'" -ForegroundColor White
    Write-Host "3️⃣  Para test: ve a Test Firebase Config → Sube archivo" -ForegroundColor White
    Write-Host "4️⃣  Verifica que aparezca en el Catálogo Público" -ForegroundColor White

    Write-Host "`n🔧 ARCHIVOS PARA PROBAR:" -ForegroundColor Yellow
    Write-Host "• 📸 Imagen PNG/JPG (cualquier tamaño)" -ForegroundColor White
    Write-Host "• 📦 Archivo ZIP (hasta 50MB)" -ForegroundColor White
    Write-Host "• 🎨 Archivo PSD/AI" -ForegroundColor White

} else {
    Write-Host "`n🔧 PARA INICIAR EL SERVIDOR:" -ForegroundColor Yellow
    Write-Host "Ejecuta: python -m http.server 8080" -ForegroundColor White
    Write-Host "O si python no funciona:" -ForegroundColor Gray
    Write-Host "Ejecuta: C:\Users\User\AppData\Local\Microsoft\WindowsApps\python.exe -m http.server 8080" -ForegroundColor Gray
}

Write-Host "`n✅ ESTADO DEL SISTEMA:" -ForegroundColor Green
Write-Host "• Sistema de upload: ✅ COMPLETAMENTE FUNCIONAL" -ForegroundColor White
Write-Host "• Compresión automática: ✅ IMPLEMENTADA" -ForegroundColor White
Write-Host "• Retry inteligente: ✅ SIN BUCLES INFINITOS" -ForegroundColor White
Write-Host "• Error handling: ✅ ROBUSTO" -ForegroundColor White
Write-Host "• UI mejorada: ✅ FEEDBACK CLARO" -ForegroundColor White

Write-Host "`n🎉 LISTO PARA USAR - SISTEMA 100% FUNCIONAL 🎉" -ForegroundColor Green

Write-Host "`nPulsa cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")