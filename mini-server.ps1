$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()

Write-Host "Servidor en http://localhost:8080"
Write-Host "Test: http://localhost:8080/test-catalog-load.html"
Write-Host "Ctrl+C para salir"

while ($true) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $url = $request.Url.LocalPath
    
    if ($url -eq "/") {
        $filePath = "templates\Index.html"
    } elseif ($url -eq "/test") {
        $filePath = "test-catalog-load.html"
    } else {
        $filePath = $url.TrimStart('/')
    }
    
    $fullPath = Join-Path $PWD $filePath
    
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $response.StatusCode = 404
    }
    
    $response.OutputStream.Close()
}