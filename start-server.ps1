# Servidor HTTP simple en PowerShell
$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

Write-Host "🚀 Servidor iniciado en http://localhost:$port"
Write-Host "📊 Test de catálogo: http://localhost:$port/test-catalog-load.html"
Write-Host "🏠 Página principal: http://localhost:$port/templates/Index.html"
Write-Host "Presiona Ctrl+C para detener"

$listener.Start()

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $url = $request.Url.LocalPath
        Write-Host "📥 Solicitud: $url"
        
        # Determinar archivo a servir
        $filePath = ""
        if ($url -eq "/") {
            $filePath = "templates\Index.html"
        } elseif ($url -eq "/test") {
            $filePath = "test-catalog-load.html"
        } else {
            $filePath = $url.TrimStart('/')
        }
        
        $fullPath = Join-Path $PWD $filePath
        
        if (Test-Path $fullPath -PathType Leaf) {
            $content = Get-Content $fullPath -Raw -Encoding UTF8
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
            
            # Determinar tipo de contenido
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
            switch ($ext) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css"  { $response.ContentType = "text/css" }
                ".js"   { $response.ContentType = "application/javascript" }
                ".png"  { $response.ContentType = "image/png" }
                ".jpg"  { $response.ContentType = "image/jpeg" }
                ".svg"  { $response.ContentType = "image/svg+xml" }
                default { $response.ContentType = "text/plain" }
            }
            
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            Write-Host "✅ Servido: $filePath"
        } else {
            $response.StatusCode = 404
            $response.StatusDescription = "Not Found"
            $errorContent = "404 - Archivo no encontrado: $url"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorContent)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            Write-Host "❌ 404: $filePath"
        }
        
        $response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
    Write-Host "🛑 Servidor detenido"
}