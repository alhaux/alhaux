$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()

Write-Host "Servidor en http://localhost:8080" -ForegroundColor Green
Write-Host "Upload test: http://localhost:8080/test-upload-debug.html" -ForegroundColor Cyan
Write-Host "Debug: http://localhost:8080/debug-firebase.html" -ForegroundColor Cyan
Write-Host "Index: http://localhost:8080/templates/Index.html" -ForegroundColor Cyan

while ($true) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $url = $request.Url.LocalPath
        Write-Host "-> $url"
        
        $filePath = switch ($url) {
            "/" { "templates\Index.html" }
            "/test" { "test-upload-debug.html" }
            "/debug" { "debug-firebase.html" }
            default { $url.TrimStart('/') }
        }
        
        $fullPath = Join-Path $PWD $filePath
        
        if (Test-Path $fullPath) {
            $content = Get-Content $fullPath -Raw -Encoding UTF8
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
            
            $ext = [System.IO.Path]::GetExtension($fullPath)
            $contentType = if ($ext -eq ".html") { "text/html; charset=utf-8" } 
                          elseif ($ext -eq ".css") { "text/css" }
                          elseif ($ext -eq ".js") { "application/javascript" }
                          else { "text/plain" }
                          
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            
            try {
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } catch {
                # Ignorar errores de cliente desconectado
            }
        } else {
            $response.StatusCode = 404
            Write-Host "404: $filePath" -ForegroundColor Red
        }
        
        try {
            $response.OutputStream.Close()
        } catch {
            # Ignorar errores al cerrar
        }
    } catch {
        if ($_.Exception.Message -notlike "*anuló*") {
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}