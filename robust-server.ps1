# Servidor HTTP mejorado con manejo de errores
$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "✅ Servidor iniciado en http://localhost:$port" -ForegroundColor Green
    Write-Host "📊 Test upload: http://localhost:$port/test-upload-debug.html" -ForegroundColor Cyan
    Write-Host "🔍 Debug Firebase: http://localhost:$port/debug-firebase.html" -ForegroundColor Cyan
    Write-Host "🏠 Página principal: http://localhost:$port/templates/Index.html" -ForegroundColor Cyan
    Write-Host "📈 Test catálogo: http://localhost:$port/test-catalog-load.html" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Presiona Ctrl+C para detener" -ForegroundColor Yellow

    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            $url = $request.Url.LocalPath
            Write-Host "📥 $($request.HttpMethod) $url" -ForegroundColor Gray
            
            # Mapear rutas
            $filePath = switch ($url) {
                "/" { "templates/Index.html" }
                "/test" { "test-upload-debug.html" }
                "/debug" { "debug-firebase.html" }
                "/catalog" { "test-catalog-load.html" }
                default { $url.TrimStart('/') }
            }
            
            $fullPath = Join-Path $PWD $filePath
            
            if (Test-Path $fullPath -PathType Leaf) {
                try {
                    $content = [System.IO.File]::ReadAllBytes($fullPath)
                    
                    # Tipo de contenido
                    $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
                    $contentType = switch ($ext) {
                        ".html" { "text/html; charset=utf-8" }
                        ".css" { "text/css; charset=utf-8" }
                        ".js" { "application/javascript; charset=utf-8" }
                        ".png" { "image/png" }
                        ".jpg" { "image/jpeg" }
                        ".jpeg" { "image/jpeg" }
                        ".svg" { "image/svg+xml" }
                        ".ico" { "image/x-icon" }
                        default { "text/plain; charset=utf-8" }
                    }
                    
                    $response.ContentType = $contentType
                    $response.ContentLength64 = $content.Length
                    $response.StatusCode = 200
                    
                    # Escribir con manejo de errores
                    try {
                        $response.OutputStream.Write($content, 0, $content.Length)
                        Write-Host "✅ Servido: $filePath" -ForegroundColor Green
                    } catch {
                        Write-Host "⚠️ Cliente desconectado durante envío" -ForegroundColor Yellow
                    }
                } catch {
                    Write-Host "❌ Error leyendo archivo: $_" -ForegroundColor Red
                    $response.StatusCode = 500
                }
            } else {
                Write-Host "❌ 404: $filePath" -ForegroundColor Red
                $response.StatusCode = 404
                $errorContent = "404 - Archivo no encontrado: $url"
                $errorBytes = [System.Text.Encoding]::UTF8.GetBytes($errorContent)
                
                try {
                    $response.ContentLength64 = $errorBytes.Length
                    $response.OutputStream.Write($errorBytes, 0, $errorBytes.Length)
                } catch {
                    Write-Host "⚠️ Cliente desconectado durante error 404" -ForegroundColor Yellow
                }
            }
            
            # Cerrar response de forma segura
            try {
                $response.OutputStream.Close()
            } catch {
                # Ignorar errores al cerrar
            }
            
        } catch [System.Net.HttpListenerException] {
            if ($_.Exception.ErrorCode -eq 995) {
                # Operación cancelada por el usuario (Ctrl+C)
                break
            } else {
                Write-Host "⚠️ Error de conexión (normal): $($_.Exception.Message)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "❌ Error inesperado: $_" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Error iniciando servidor: $_" -ForegroundColor Red
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    Write-Host "🛑 Servidor detenido" -ForegroundColor Red
}