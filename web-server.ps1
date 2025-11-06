# Servidor web simple para testing del proyecto
param(
    [int]$Port = 8080
)

Write-Host "🚀 Iniciando servidor web en puerto $Port..." -ForegroundColor Green

try {
    # Crear listener HTTP
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$Port/")
    $listener.Start()

    Write-Host "✅ Servidor ejecutándose en http://localhost:$Port" -ForegroundColor Cyan
    Write-Host "📱 Admin Panel: http://localhost:$Port/templates/admin.html" -ForegroundColor Yellow
    Write-Host "🏠 Index: http://localhost:$Port/templates/Index.html" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Presiona Ctrl+C para detener" -ForegroundColor Red

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath
        if ($path -eq "/") { $path = "/templates/Index.html" }
        
        $filePath = Join-Path $PWD ($path.TrimStart('/'))
        
        Write-Host "📥 $path" -ForegroundColor Gray
        
        if (Test-Path $filePath) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css" { "text/css" }
                ".js" { "application/javascript" }
                ".json" { "application/json" }
                ".png" { "image/png" }
                ".jpg" { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".gif" { "image/gif" }
                ".svg" { "image/svg+xml" }
                ".ico" { "image/x-icon" }
                default { "application/octet-stream" }
            }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errorMessage = "404 - Archivo no encontrado: $path"
            $errorBytes = [System.Text.Encoding]::UTF8.GetBytes($errorMessage)
            $response.OutputStream.Write($errorBytes, 0, $errorBytes.Length)
            Write-Host "❌ 404: $path" -ForegroundColor Red
        }
        
        $response.OutputStream.Close()
    }
}
catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}
finally {
    if ($listener -and $listener.IsListening) {
        $listener.Stop()
        Write-Host "🛑 Servidor detenido" -ForegroundColor Yellow
    }
}