# Servidor HTTP simple para testing
$port = 8080
Write-Host "🚀 Iniciando servidor en puerto $port..."

# Usar .NET HttpListener
Add-Type -AssemblyName System.Net.Http

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "✅ Servidor ejecutándose en http://localhost:$port"
Write-Host "📊 Test: http://localhost:$port/test-catalog-load.html"
Write-Host "🏠 Index: http://localhost:$port/templates/Index.html"
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor"

try {
    while ($true) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $url = $request.Url.LocalPath
        Write-Host "📥 $url"
        
        # Mapear rutas
        $filePath = switch ($url) {
            "/" { "templates/Index.html" }
            "/test" { "test-catalog-load.html" }
            default { $url.TrimStart('/') }
        }
        
        $fullPath = Join-Path $PWD $filePath
        
        if (Test-Path $fullPath) {
            $content = [System.IO.File]::ReadAllBytes($fullPath)
            
            # Tipo de contenido
            $ext = [System.IO.Path]::GetExtension($fullPath)
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css" { "text/css" }
                ".js" { "application/javascript" }
                ".png" { "image/png" }
                ".jpg" { "image/jpeg" }
                ".svg" { "image/svg+xml" }
                default { "text/plain" }
            }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
            Write-Host "✅ Servido"
        } else {
            $response.StatusCode = 404
            $errorBytes = [System.Text.Encoding]::UTF8.GetBytes("404 - Not Found")
            $response.OutputStream.Write($errorBytes, 0, $errorBytes.Length)
            Write-Host "❌ 404"
        }
        
        $response.OutputStream.Close()
    }
} catch {
    Write-Host "⚠️ Error: $_"
} finally {
    $listener.Stop()
    Write-Host "🛑 Servidor detenido"
}