$filePath = ".\templates\admin.html"
$content = Get-Content $filePath -Raw -Encoding UTF8

# Reemplazar el contenido de la primera área de upload (imagen)
$pattern1 = '<div class="upload-icon">[^<]*</div>\s*<div class="upload-text">Arrastra tu imagen de preview aquí</div>\s*<div class="upload-hint">o haz clic para seleccionar \(PNG, JPG, WEBP\) - Máximo 5MB</div>\s*<input type="file" id="designImage" accept="image/\*" required />'

$replacement1 = '<div class="upload-content" id="imageInitialContent">
                  <div class="upload-icon">🖼️</div>
                  <div class="upload-text">Arrastra tu imagen aquí</div>
                  <div class="upload-hint">PNG, JPG, WEBP - Máximo 5MB</div>
                  <button type="button" class="upload-button" onclick="document.getElementById(''designImage'').click()">
                    Seleccionar archivo
                  </button>
                </div>
                
                <div class="preview-container" id="imagePreview" style="display: none;">
                  <div class="image-preview">
                    <img id="previewImg" src="" alt="Preview">
                    <div class="preview-overlay">Cambiar imagen</div>
                  </div>
                  <div class="file-name" id="imageFileName"></div>
                </div>
                
                <input type="file" id="designImage" class="file-input" accept="image/*" required>'

$content = $content -replace $pattern1, $replacement1

# Reemplazar el contenido de la segunda área de upload (archivo)
$pattern2 = '<div class="upload-icon">[^<]*</div>\s*<div class="upload-text">Arrastra el archivo del diseño aquí</div>\s*<div class="upload-hint">Archivo principal para descarga \(ZIP, PSD, AI, PDF, etc\.\) - Máximo 50MB</div>\s*<input type="file" id="designFile" accept="[^"]*" required />'

$replacement2 = '<div class="upload-content" id="fileInitialContent">
                  <div class="upload-icon">📁</div>
                  <div class="upload-text">Arrastra tu archivo aquí</div>
                  <div class="upload-hint">ZIP, PSD, AI, PDF, etc. - Máximo 50MB</div>
                  <button type="button" class="upload-button" onclick="document.getElementById(''designFile'').click()">
                    Seleccionar archivo
                  </button>
                </div>
                
                <div class="file-success" id="fileSuccess" style="display: none;">
                  <div class="success-icon">📦</div>
                  <div class="success-text">Archivo subido correctamente</div>
                  <div class="file-name" id="fileFileName"></div>
                </div>
                
                <input type="file" id="designFile" class="file-input" accept=".zip,.rar,.psd,.ai,.pdf,.svg,.eps,.png,.jpg,.jpeg" required>'

$content = $content -replace $pattern2, $replacement2

# Guardar el archivo actualizado
Set-Content $filePath $content -Encoding UTF8

Write-Host "✅ Upload areas actualizadas exitosamente"