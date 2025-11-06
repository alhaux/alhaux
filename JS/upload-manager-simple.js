// Upload Manager Simplificado - Solo imagen preview + Google Drive
// Design Reyes Admin Panel

class SimpleDesignUploader {
  constructor() {
    this.formats = [];
    this.currentImageFile = null;
    this.uploadCancelled = false;
    this.initializeElements();
    this.bindEvents();
  }

  initializeElements() {
    // Elementos para imagen de preview
    this.fileUploadArea = document.getElementById('fileUploadArea');
    this.designImage = document.getElementById('designImage');
    this.imgPreview = document.getElementById('imgPreview');
    this.previewArea = document.getElementById('previewArea');
    this.previewInfo = document.getElementById('previewInfo');
    
    // Elementos del formulario
    this.formatsContainer = document.getElementById('formatsContainer');
    this.designPriceType = document.getElementById('designPriceType');
    this.priceWrapper = document.getElementById('priceWrapper');
    this.uploadForm = document.getElementById('uploadDesignForm');
    this.btnUpload = document.getElementById('btnUploadDesign');
    this.loadingSpinner = document.getElementById('loadingSpinner');
    this.btnText = document.getElementById('btnText');
    this.tagInput = this.formatsContainer?.querySelector('.tag-input');
    
    // Google Drive URL input
    this.googleDriveInput = document.getElementById('googleDriveUrl');
  }

  bindEvents() {
    // Evento del formulario
    if (this.uploadForm) {
      this.uploadForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Eventos de imagen
    if (this.designImage) {
      this.designImage.addEventListener('change', (e) => this.handleImageChange(e));
    }

    // Drag and drop para imagen
    if (this.fileUploadArea) {
      this.fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.fileUploadArea.classList.add('dragover');
      });

      this.fileUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        this.fileUploadArea.classList.remove('dragover');
      });

      this.fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        this.fileUploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
          this.designImage.files = files;
          this.handleImageChange({ target: { files: files } });
        }
      });
    }

    // Cambio de tipo de precio
    if (this.designPriceType) {
      this.designPriceType.addEventListener('change', () => this.togglePriceField());
    }

    // Eventos de formatos/tags
    if (this.tagInput) {
      this.tagInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.addFormat();
        }
      });
    }

    // Preview updates
    this.bindPreviewUpdates();
  }

  handleImageChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    this.currentImageFile = file;
    
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.showImagePreview(e.target.result, file.name);
    };
    reader.readAsDataURL(file);

    console.log('✅ Imagen seleccionada:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  }

  showImagePreview(src, fileName) {
    if (this.imgPreview && this.previewArea) {
      this.imgPreview.src = src;
      this.imgPreview.style.display = 'block';
      
      // Ocultar placeholder
      const placeholder = this.previewArea.querySelector('div');
      if (placeholder) {
        placeholder.style.display = 'none';
      }
    }
    
    this.updatePreview();
  }

  togglePriceField() {
    const priceType = this.designPriceType?.value;
    if (this.priceWrapper) {
      this.priceWrapper.style.display = priceType === 'premium' ? 'block' : 'none';
    }
    this.updatePreview();
  }

  addFormat() {
    const input = this.tagInput;
    if (!input) return;

    const format = input.value.trim();
    if (format && !this.formats.includes(format)) {
      this.formats.push(format);
      this.renderFormats();
      input.value = '';
      this.updatePreview();
    }
  }

  removeFormat(format) {
    const index = this.formats.indexOf(format);
    if (index > -1) {
      this.formats.splice(index, 1);
      this.renderFormats();
      this.updatePreview();
    }
  }

  renderFormats() {
    if (!this.formatsContainer) return;

    // Limpiar tags existentes
    const existingTags = this.formatsContainer.querySelectorAll('.tag');
    existingTags.forEach(tag => tag.remove());

    // Agregar tags
    this.formats.forEach(format => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.innerHTML = `${format} <span class="tag-remove" onclick="uploader.removeFormat('${format}')">&times;</span>`;
      this.formatsContainer.insertBefore(tag, this.tagInput);
    });
  }

  bindPreviewUpdates() {
    // Actualizar preview cuando cambien los campos
    const fields = ['designName', 'designCategory', 'designPriceType', 'designPrice'];
    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('input', () => this.updatePreview());
        field.addEventListener('change', () => this.updatePreview());
      }
    });
  }

  updatePreview() {
    if (!this.previewInfo) return;

    const name = document.getElementById('designName')?.value || '-';
    const category = document.getElementById('designCategory')?.value || '-';
    const priceType = document.getElementById('designPriceType')?.value || '-';
    const price = document.getElementById('designPrice')?.value || '0';
    
    const priceDisplay = priceType === 'premium' ? `S/ ${price}` : 'Gratis';
    const typeDisplay = priceType === 'premium' ? '💎 Premium' : '🆓 Gratis';

    // Actualizar elementos de preview
    const previewName = document.getElementById('previewName');
    const previewCategory = document.getElementById('previewCategory');
    const previewType = document.getElementById('previewType');
    const previewPrice = document.getElementById('previewPrice');
    const previewFormats = document.getElementById('previewFormats');

    if (previewName) previewName.textContent = name;
    if (previewCategory) previewCategory.textContent = category;
    if (previewType) previewType.textContent = typeDisplay;
    if (previewPrice) previewPrice.textContent = priceDisplay;
    if (previewFormats) previewFormats.textContent = this.formats.join(', ') || '-';

    // Mostrar panel de preview si hay imagen
    if (this.currentImageFile && this.previewInfo) {
      this.previewInfo.style.display = 'block';
    }
  }

  async handleFormSubmit(event) {
    event.preventDefault();
    
    const btnUpload = this.btnUpload;
    const btnText = this.btnText;
    const loadingSpinner = this.loadingSpinner;
    
    try {
      // Resetear bandera de cancelación
      this.uploadCancelled = false;
      
      // Validar imagen
      if (!this.currentImageFile) {
        throw new Error('Por favor selecciona una imagen de preview');
      }

      // Verificar enlace de Google Drive
      const googleDriveUrl = this.googleDriveInput?.value.trim();
      if (!googleDriveUrl) {
        throw new Error('Por favor ingresa el enlace de Google Drive');
      }

      // Validar URL de Google Drive
      if (!googleDriveUrl.includes('drive.google.com')) {
        throw new Error('El enlace debe ser de Google Drive (drive.google.com)');
      }

      // Obtener datos del formulario
      const formData = new FormData(this.uploadForm);
      const designData = {
        name: formData.get('designName'),
        description: formData.get('designDesc'),
        category: formData.get('designCategory'),
        priceType: formData.get('designPriceType'),
        price: parseFloat(formData.get('designPrice')) || 0,
        formats: this.formats,
        googleDriveUrl: googleDriveUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Validar campos requeridos
      if (!designData.name || !designData.category || !designData.priceType) {
        throw new Error('Por favor completa todos los campos requeridos');
      }

      console.log('📝 Datos del diseño:', designData);

      // Mostrar estado de carga
      btnUpload.disabled = true;
      loadingSpinner.style.display = 'inline-block';
      btnText.textContent = 'Subiendo imagen...';

      // Mostrar SweetAlert de progreso
      const imageSizeMB = (this.currentImageFile.size / 1024 / 1024).toFixed(2);
      
      if (typeof Swal !== 'undefined' && Swal.fire) {
        try {
          Swal.fire({
            title: '📤 Subiendo diseño',
            html: `<div class="upload-info">
              <p><strong>Imagen:</strong> ${this.currentImageFile.name} (${imageSizeMB}MB)</p>
              <p><strong>Descarga:</strong> Google Drive</p>
              <br>
              <div class="upload-status">Subiendo imagen preview...</div>
            </div>`,
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
              if (Swal.showLoading) {
                Swal.showLoading();
              }
            }
          });
        } catch (swalError) {
          console.warn('Error en SweetAlert:', swalError);
        }
      }
      
      // Subir solo la imagen
      const safeDesignName = designData.name.replace(/[^a-zA-Z0-9]/g, '_');
      console.log('🚀 Iniciando upload de imagen...');
      
      const imageUrl = await this.uploadImageWithRetry(
        this.currentImageFile, 
        `designs/images/${safeDesignName}_${Date.now()}`
      );
      
      console.log('✅ Imagen subida exitosamente:', imageUrl);

      // Guardar en Firestore
      btnText.textContent = 'Guardando información...';
      const docRef = await db.collection('designs').add({
        ...designData,
        imageUrl: imageUrl
      });

      console.log('✅ Diseño guardado con ID:', docRef.id);

      // Recargar catálogo
      try {
        if (typeof forceReloadCatalog === 'function') {
          console.log('🔄 Sincronizando catálogo...');
          await forceReloadCatalog();
          console.log('✅ Catálogo sincronizado');
        }
      } catch (catalogError) {
        console.warn('⚠️ Error al sincronizar catálogo:', catalogError);
      }

      // Mostrar éxito
      btnText.textContent = '¡Éxito!';
      btnUpload.classList.add('success-animation');
      
      if (typeof Swal !== 'undefined' && Swal.fire) {
        Swal.fire({
          icon: 'success',
          title: '🎉 ¡Diseño subido exitosamente!',
          html: `<div>
            <p>El diseño "<strong>${designData.name}</strong>" se ha guardado correctamente</p>
            <p style="color: #666; font-size: 14px; margin-top: 10px;">
              ✅ Imagen preview subida<br>
              ✅ Enlace de Google Drive guardado<br>
              ✅ Guardado en base de datos<br>
              ✅ Catálogo actualizado
            </p>
          </div>`,
          showCancelButton: true,
          confirmButtonText: '🌐 Ver en Catálogo',
          cancelButtonText: '✅ Continuar',
          confirmButtonColor: '#28a745',
          cancelButtonColor: '#6c757d'
        }).then((result) => {
          if (result.isConfirmed) {
            window.open('/templates/Index.html', '_blank');
          }
        });
      } else {
        alert('✅ Diseño subido exitosamente');
      }

      // Reset del formulario
      this.resetForm();

    } catch (error) {
      console.error('❌ Error en upload:', error);
      
      btnText.textContent = 'Error';
      
      if (typeof Swal !== 'undefined' && Swal.fire) {
        Swal.fire({
          icon: 'error',
          title: '❌ Error al subir diseño',
          text: error.message,
          confirmButtonText: 'Reintentar'
        });
      } else {
        alert(`❌ Error: ${error.message}`);
      }
    } finally {
      // Restaurar botón
      btnUpload.disabled = false;
      loadingSpinner.style.display = 'none';
      btnText.textContent = 'Subir diseño';
      
      setTimeout(() => {
        btnUpload.classList.remove('success-animation');
      }, 3000);
    }
  }

  async uploadImageWithRetry(file, path, maxRetries = 3) {
    console.log(`🔄 [UPLOAD] Iniciando upload: ${file.name} → ${path}`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🚀 [UPLOAD] Intento ${attempt}/${maxRetries}`);
        
        // Comprimir imagen si es necesaria
        const finalFile = await this.compressImageIfNeeded(file);
        
        // Crear referencia de Firebase Storage
        const storageRef = firebase.storage().ref(path);
        
        // Subir archivo
        const uploadTask = storageRef.put(finalFile);
        
        // Manejar progreso
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`📊 [UPLOAD] Progreso: ${progress.toFixed(1)}%`);
          }
        );
        
        // Esperar a que termine
        await uploadTask;
        
        // Obtener URL de descarga
        const downloadURL = await storageRef.getDownloadURL();
        console.log(`✅ [UPLOAD] Éxito en intento ${attempt}: ${downloadURL}`);
        
        return downloadURL;
        
      } catch (error) {
        console.error(`❌ [UPLOAD] Error en intento ${attempt}:`, error);
        
        if (attempt === maxRetries) {
          throw new Error(`Upload fallido después de ${maxRetries} intentos: ${error.message}`);
        }
        
        // Esperar antes del siguiente intento
        const delay = attempt * 2000; // 2s, 4s, 6s
        console.log(`⏳ [UPLOAD] Esperando ${delay}ms antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async compressImageIfNeeded(file) {
    console.log(`📊 [COMPRESSION] Analizando archivo: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    
    // Si es menor a 500KB, no comprimir
    if (file.size < 500 * 1024) {
      console.log(`✅ [COMPRESSION] Archivo pequeño, sin compresión necesaria`);
      return file;
    }
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          // Determinar calidad y tamaño según el tamaño del archivo
          let quality = 0.8;
          let maxWidth = 1920;
          
          if (file.size > 3 * 1024 * 1024) { // > 3MB
            quality = 0.6;
            maxWidth = 1280;
          } else if (file.size > 1 * 1024 * 1024) { // > 1MB
            quality = 0.7;
            maxWidth = 1600;
          }
          
          // Calcular nuevas dimensiones
          let { width, height } = img;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          // Configurar canvas
          canvas.width = width;
          canvas.height = height;
          
          // Dibujar imagen comprimida
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir a blob
          canvas.toBlob((blob) => {
            const originalSizeMB = (file.size / 1024 / 1024).toFixed(2);
            const compressedSizeMB = (blob.size / 1024 / 1024).toFixed(2);
            const compressionRatio = ((1 - blob.size / file.size) * 100).toFixed(1);
            
            console.log(`✅ [COMPRESSION] ${originalSizeMB}MB → ${compressedSizeMB}MB (${compressionRatio}% reducción)`);
            
            // Crear nuevo File con el blob comprimido
            const compressedFile = new File([blob], file.name, {
              type: blob.type,
              lastModified: Date.now()
            });
            
            resolve(compressedFile);
          }, file.type, quality);
        };
        
        img.src = URL.createObjectURL(file);
      });
      
    } catch (error) {
      console.warn('⚠️ [COMPRESSION] Error en compresión, usando archivo original:', error);
      return file;
    }
  }

  resetForm() {
    // Reset archivos
    this.currentImageFile = null;
    
    // Reset formulario
    if (this.uploadForm) {
      this.uploadForm.reset();
    }
    
    // Reset formatos
    this.formats = [];
    this.renderFormats();
    
    // Reset preview
    if (this.imgPreview) {
      this.imgPreview.style.display = 'none';
      this.imgPreview.src = '';
    }
    
    if (this.previewInfo) {
      this.previewInfo.style.display = 'none';
    }
    
    // Mostrar placeholder
    if (this.previewArea) {
      const placeholder = this.previewArea.querySelector('div');
      if (placeholder) {
        placeholder.style.display = 'block';
      }
    }
    
    // Reset Google Drive URL
    if (this.googleDriveInput) {
      this.googleDriveInput.value = '';
    }
    
    console.log('🔄 Formulario reseteado');
  }
}

// Inicializar cuando cargue la página
let uploader;
document.addEventListener('DOMContentLoaded', () => {
  uploader = new SimpleDesignUploader();
  console.log('✅ Simple Design Uploader inicializado');
});