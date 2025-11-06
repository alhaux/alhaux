// Funcionalidad avanzada para subida de diseños - Design Reyes Admin Panel

class DesignUploader {
  constructor() {
    this.formats = [];
    this.currentImageFile = null;
    this.currentDesignFile = null;
    this.uploadCancelled = false; // Flag para cancelar uploads
    this.initializeElements();
    this.bindEvents();
    this.initializeModernUploadSystem();
  }

  initializeElements() {
    // Elementos para imagen de preview
    this.fileUploadArea = document.getElementById('fileUploadArea');
    this.designImage = document.getElementById('designImage');
    
    // Elementos para archivo de diseño
    this.fileUploadAreaDesign = document.getElementById('fileUploadAreaDesign');
    this.designFile = document.getElementById('designFile');
    
    // Elementos de estado moderno
    this.initialStateImage = document.getElementById('initialStateImage');
    this.previewStateImage = document.getElementById('previewStateImage');
    this.previewImage = document.getElementById('previewImage');
    this.previewFilename = document.getElementById('previewFilename');
    this.initialStateDesign = document.getElementById('initialStateDesign');
    this.successStateDesign = document.getElementById('successStateDesign');
    this.successFilename = document.getElementById('successFilename');
    
    // Otros elementos
    this.imgPreview = document.getElementById('imgPreview');
    this.previewArea = document.getElementById('previewArea');
    this.previewInfo = document.getElementById('previewInfo');
    this.formatsContainer = document.getElementById('formatsContainer');
    this.designPriceType = document.getElementById('designPriceType');
    this.priceWrapper = document.getElementById('priceWrapper');
    this.uploadForm = document.getElementById('uploadDesignForm');
    this.btnUpload = document.getElementById('btnUploadDesign');
    this.loadingSpinner = document.getElementById('loadingSpinner');
    this.btnText = document.getElementById('btnText');
    this.progressBar = document.getElementById('uploadProgress');
    this.progressFill = document.getElementById('progressFill');
    this.progressBarDesign = document.getElementById('uploadProgressDesign');
    this.progressFillDesign = document.getElementById('progressFillDesign');
    this.tagInput = this.formatsContainer?.querySelector('.tag-input');
  }

  initializeModernUploadSystem() {
    console.log('🎨 Inicializando sistema de upload moderno...');
    
    // Verificar que existen los elementos necesarios
    if (!this.fileUploadArea || !this.fileUploadAreaDesign) {
      console.warn('❌ Elementos de upload no encontrados');
      return;
    }
    
    console.log('✅ Sistema de upload moderno inicializado');
  }

  bindEvents() {
    // Eventos para imagen de preview
    this.fileUploadArea?.addEventListener('click', (e) => {
      if (!e.target.closest('.preview-overlay')) {
        this.designImage.click();
      }
    });
    this.fileUploadArea?.addEventListener('dragover', (e) => this.handleDragOver(e, 'image'));
    this.fileUploadArea?.addEventListener('dragleave', (e) => this.handleDragLeave(e, 'image'));
    this.fileUploadArea?.addEventListener('drop', (e) => this.handleDrop(e, 'image'));
    this.designImage?.addEventListener('change', (e) => this.handleFileChange(e, 'image'));

    // Eventos para archivo de diseño
    this.fileUploadAreaDesign?.addEventListener('click', (e) => {
      if (!e.target.closest('.success-hint')) {
        this.designFile.click();
      }
    });
    this.fileUploadAreaDesign?.addEventListener('dragover', (e) => this.handleDragOver(e, 'design'));
    this.fileUploadAreaDesign?.addEventListener('dragleave', (e) => this.handleDragLeave(e, 'design'));
    this.fileUploadAreaDesign?.addEventListener('drop', (e) => this.handleDrop(e, 'design'));
    this.designFile?.addEventListener('change', (e) => this.handleFileChange(e, 'design'));

    // Sistema de tags para formatos
    this.tagInput?.addEventListener('keydown', (e) => this.handleTagInput(e));

    // Cambio de tipo de precio
    this.designPriceType?.addEventListener('change', () => this.handlePriceTypeChange());

    // Actualización en tiempo real de la vista previa
    this.bindPreviewUpdates();

    // Envío del formulario
    this.uploadForm?.addEventListener('submit', (e) => this.handleFormSubmit(e));
  }

  bindPreviewUpdates() {
    const inputs = [
      'designName',
      'designCategory', 
      'designPrice'
    ];

    inputs.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('input', () => this.updatePreview());
        if (element.tagName === 'SELECT') {
          element.addEventListener('change', () => this.updatePreview());
        }
      }
    });
  }

  handleDragOver(e) {
    e.preventDefault();
    this.fileUploadArea.classList.add('dragover');
  }

  handleDragLeave() {
    this.fileUploadArea.classList.remove('dragover');
  }

  handleDrop(e) {
    e.preventDefault();
    this.fileUploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      this.processFile(files[0]);
    }
  }

  handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  processFile(file) {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      this.showError('Archivo inválido', 'Por favor selecciona una imagen válida (PNG, JPG, WEBP)');
      return;
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.showError('Archivo muy grande', 'El archivo no puede exceder los 10MB');
      return;
    }

    this.currentFile = file;
    this.displayImagePreview(file);
  }

  displayImagePreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewArea.style.display = 'none';
      this.imgPreview.src = e.target.result;
      this.imgPreview.style.display = 'block';
      this.updatePreview();
      
      // Animación de aparición
      this.imgPreview.style.opacity = '0';
      this.imgPreview.style.transform = 'scale(0.8)';
      
      setTimeout(() => {
        this.imgPreview.style.transition = 'all 0.3s ease';
        this.imgPreview.style.opacity = '1';
        this.imgPreview.style.transform = 'scale(1)';
      }, 100);
    };
    reader.readAsDataURL(file);
  }

  handleTagInput(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = this.tagInput.value.trim().toUpperCase();
      if (value && !this.formats.includes(value)) {
        this.addFormat(value);
        this.tagInput.value = '';
      }
    } else if (e.key === 'Backspace' && this.tagInput.value === '' && this.formats.length > 0) {
      this.removeFormat(this.formats[this.formats.length - 1]);
    }
  }

  addFormat(format) {
    this.formats.push(format);
    this.renderFormats();
    this.updatePreview();
    this.validateFormats();
  }

  removeFormat(format) {
    this.formats = this.formats.filter(f => f !== format);
    this.renderFormats();
    this.updatePreview();
    this.validateFormats();
  }

  renderFormats() {
    // Eliminar tags existentes
    const existingTags = this.formatsContainer.querySelectorAll('.tag');
    existingTags.forEach(tag => tag.remove());

    // Crear nuevos tags
    this.formats.forEach(format => {
      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.innerHTML = `
        ${format}
        <span class="tag-remove" onclick="designUploader.removeFormat('${format}')">×</span>
      `;
      this.formatsContainer.insertBefore(tag, this.tagInput);
    });

    // Actualizar campo oculto
    const formatsInput = document.getElementById('designFormats');
    if (formatsInput) {
      formatsInput.value = this.formats.join(', ');
    }
  }

  validateFormats() {
    const minFormats = 1;
    const maxFormats = 5;
    
    if (this.formats.length < minFormats) {
      this.showFieldError('formatsContainer', 'Agrega al menos un formato');
    } else if (this.formats.length > maxFormats) {
      this.showFieldError('formatsContainer', `Máximo ${maxFormats} formatos`);
    } else {
      this.clearFieldError('formatsContainer');
    }
  }

  handlePriceTypeChange() {
    const isPremium = this.designPriceType.value === 'premium';
    const priceInput = document.getElementById('designPrice');
    
    if (isPremium) {
      this.priceWrapper.style.display = 'block';
      priceInput.required = true;
      priceInput.focus();
    } else {
      this.priceWrapper.style.display = 'none';
      priceInput.required = false;
      priceInput.value = '';
    }
    
    this.updatePreview();
  }

  updatePreview() {
    const name = document.getElementById('designName')?.value || '-';
    const category = document.getElementById('designCategory')?.value || '-';
    const priceType = document.getElementById('designPriceType')?.value || '-';
    const price = document.getElementById('designPrice')?.value;
    
    const previewElements = {
      previewName: name,
      previewCategory: category,
      previewType: priceType === 'gratis' ? '🆓 Gratis' : '💎 Premium',
      previewPrice: priceType === 'premium' && price ? `$${price}` : (priceType === 'gratis' ? 'Gratis' : '-'),
      previewFormats: this.formats.length > 0 ? this.formats.join(', ') : '-'
    };

    Object.entries(previewElements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
    
    if (this.imgPreview.style.display === 'block') {
      this.previewInfo.style.display = 'block';
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }

    this.setLoadingState(true);
    
    try {
      // Simular subida con progreso
      await this.simulateUpload();
      
      // Aquí iría la lógica real de Firebase
      await this.uploadToFirebase();
      
      this.showSuccess();
      this.resetForm();
      
    } catch (error) {
      console.error('Error al subir diseño:', error);
      this.showError('Error al subir', 'Hubo un problema al subir el diseño. Inténtalo de nuevo.');
    } finally {
      this.setLoadingState(false);
    }
  }

  validateForm() {
    let isValid = true;
    
    // Validar campos requeridos
    const requiredFields = [
      { id: 'designName', message: 'El nombre es requerido' },
      { id: 'designDesc', message: 'La descripción es requerida' },
      { id: 'designCategory', message: 'Selecciona una categoría' },
      { id: 'designPriceType', message: 'Selecciona el tipo de diseño' },
      { id: 'designDriveLink', message: 'El enlace de descarga es requerido' }
    ];

    requiredFields.forEach(field => {
      const element = document.getElementById(field.id);
      if (!element.value.trim()) {
        this.showFieldError(field.id, field.message);
        isValid = false;
      } else {
        this.clearFieldError(field.id);
      }
    });

    // Validar precio si es premium
    if (this.designPriceType.value === 'premium') {
      const price = document.getElementById('designPrice').value;
      if (!price || parseFloat(price) <= 0) {
        this.showFieldError('designPrice', 'Ingresa un precio válido');
        isValid = false;
      }
    }

    // Validar formatos
    if (this.formats.length === 0) {
      this.showFieldError('formatsContainer', 'Agrega al menos un formato');
      isValid = false;
    }

    // Validar imagen
    if (!this.currentFile) {
      this.showError('Imagen requerida', 'Selecciona una imagen para el diseño');
      isValid = false;
    }

    // Validar URL de Drive
    const driveLink = document.getElementById('designDriveLink').value;
    if (driveLink && !this.isValidDriveUrl(driveLink)) {
      this.showFieldError('designDriveLink', 'URL de Google Drive inválida');
      isValid = false;
    }

    return isValid;
  }

  isValidDriveUrl(url) {
    const drivePattern = /^https:\/\/drive\.google\.com\//;
    return drivePattern.test(url);
  }

  showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    field.classList.add('error');
    
    // Crear o actualizar mensaje de error
    let errorMsg = field.parentNode.querySelector('.error-message');
    if (!errorMsg) {
      errorMsg = document.createElement('div');
      errorMsg.className = 'error-message';
      field.parentNode.appendChild(errorMsg);
    }
    
    errorMsg.textContent = message;
    errorMsg.classList.add('show');
  }

  clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    field.classList.remove('error');
    field.classList.add('success');
    
    const errorMsg = field.parentNode.querySelector('.error-message');
    if (errorMsg) {
      errorMsg.classList.remove('show');
    }
    
    setTimeout(() => field.classList.remove('success'), 2000);
  }

  async simulateUpload() {
    this.progressBar.style.display = 'block';
    
    for (let i = 0; i <= 100; i += 10) {
      this.progressFill.style.width = i + '%';
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }

  async uploadToFirebase() {
    // Aquí iría la lógica real de Firebase
    // Por ahora, solo simular
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  setLoadingState(loading) {
    this.btnUpload.disabled = loading;
    this.loadingSpinner.style.display = loading ? 'inline-block' : 'none';
    this.btnText.textContent = loading ? 'Subiendo...' : 'Subir diseño';
    
    if (!loading) {
      this.progressBar.style.display = 'none';
      this.progressFill.style.width = '0%';
    }
  }

  showSuccess() {
    this.btnUpload.classList.add('success-animation');
    this.btnText.textContent = '✅ Subido exitosamente';
    
    Swal.fire({
      icon: 'success',
      title: '¡Diseño subido!',
      text: 'El diseño se ha subido correctamente',
      confirmButtonColor: '#9c6bff',
      timer: 3000,
      timerProgressBar: true
    });
  }

  showError(title, text) {
    Swal.fire({
      icon: 'error',
      title: title,
      text: text,
      confirmButtonColor: '#9c6bff'
    });
  }

  // ===== MANEJADORES DE DRAG & DROP MEJORADOS =====

  handleDragOver(e, type) {
    e.preventDefault();
    e.stopPropagation();
    
    const uploadArea = type === 'image' ? this.fileUploadArea : this.fileUploadAreaDesign;
    if (!uploadArea) return;
    
    uploadArea.classList.add('dragover');
    
    // Efecto visual suave con animación
    uploadArea.style.transform = 'scale(1.02)';
    uploadArea.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    uploadArea.style.boxShadow = '0 8px 32px rgba(98, 54, 255, 0.4)';
  }

  handleDragLeave(e, type) {
    e.preventDefault();
    e.stopPropagation();
    
    const uploadArea = type === 'image' ? this.fileUploadArea : this.fileUploadAreaDesign;
    if (!uploadArea) return;
    
    // Solo remover el efecto si realmente salimos del área
    const rect = uploadArea.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      uploadArea.classList.remove('dragover');
      uploadArea.style.transform = 'scale(1)';
      uploadArea.style.boxShadow = '';
    }
  }

  handleDrop(e, type) {
    e.preventDefault();
    e.stopPropagation();
    
    const uploadArea = type === 'image' ? this.fileUploadArea : this.fileUploadAreaDesign;
    const fileInput = type === 'image' ? this.designImage : this.designFile;
    
    if (!uploadArea || !fileInput) return;
    
    // Resetear efectos visuales
    uploadArea.classList.remove('dragover');
    uploadArea.style.transform = 'scale(1)';
    uploadArea.style.boxShadow = '';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Validaciones específicas por tipo
      if (type === 'image') {
        if (!file.type.startsWith('image/')) {
          this.showError('Por favor selecciona solo archivos de imagen (PNG, JPG, WEBP)');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          this.showError('La imagen es demasiado grande. Máximo 5MB permitido.');
          return;
        }
      } else {
        const allowedExtensions = ['.zip', '.rar', '.psd', '.ai', '.pdf', '.svg', '.eps', '.png', '.jpg', '.jpeg'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {
          this.showError('Archivo no válido. Formatos permitidos: ZIP, RAR, PSD, AI, PDF, SVG, EPS, PNG, JPG');
          return;
        }
        if (file.size > 50 * 1024 * 1024) {
          this.showError('El archivo es demasiado grande. Máximo 50MB permitido.');
          return;
        }
      }
      
      // Simular selección en input
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
      
      // Procesar archivo
      if (type === 'image') {
        this.handleImageFileSelected(file);
      } else {
        this.handleDesignFileSelected(file);
      }
    }
  }

  handleFileChange(e, type) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (type === 'image') {
      this.handleImageFileSelected(file);
    } else {
      this.handleDesignFileSelected(file);
    }
  }

  // ===== MANEJADORES DE ARCHIVOS SELECCIONADOS =====

  handleImageFileSelected(file) {
    console.log('🖼️ Imagen seleccionada:', file.name);
    
    // Validar tamaño
    if (file.size > 5 * 1024 * 1024) {
      this.showError('La imagen es demasiado grande. Máximo 5MB permitido.');
      return;
    }
    
    this.currentImageFile = file;
    this.showImagePreview(file);
    
    // Llamar al sistema existente si existe
    if (typeof handleImageUpload === 'function') {
      handleImageUpload(file);
    }
    
    this.showSuccess(`Imagen "${file.name}" cargada correctamente`);
  }

  handleDesignFileSelected(file) {
    console.log('📦 Archivo de diseño seleccionado:', file.name);
    
    // Validar tamaño
    if (file.size > 50 * 1024 * 1024) {
      this.showError('El archivo es demasiado grande. Máximo 50MB permitido.');
      return;
    }
    
    this.currentDesignFile = file;
    this.showDesignFileSuccess(file);
    
    // Llamar al sistema existente si existe
    if (typeof handleDesignFileUpload === 'function') {
      handleDesignFileUpload(file);
    }
    
    this.showSuccess(`Archivo "${file.name}" cargado correctamente`);
  }

  // ===== FUNCIONES DE VISUALIZACIÓN CON ANIMACIONES =====

  showImagePreview(file) {
    if (!this.initialStateImage || !this.previewStateImage || !this.previewImage || !this.previewFilename) {
      console.warn('❌ Elementos de preview de imagen no encontrados');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      // Configurar imagen
      this.previewImage.src = e.target.result;
      this.previewFilename.textContent = file.name;
      
      // Animación de salida del estado inicial
      this.initialStateImage.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      this.initialStateImage.style.opacity = '0';
      this.initialStateImage.style.transform = 'scale(0.9)';
      
      setTimeout(() => {
        this.initialStateImage.style.display = 'none';
        this.previewStateImage.style.display = 'flex';
        this.previewStateImage.style.opacity = '0';
        this.previewStateImage.style.transform = 'scale(0.9)';
        
        // Animación de entrada del preview
        setTimeout(() => {
          this.previewStateImage.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
          this.previewStateImage.style.opacity = '1';
          this.previewStateImage.style.transform = 'scale(1)';
        }, 50);
      }, 300);
      
      console.log('✅ Preview de imagen mostrado');
    };
    
    reader.readAsDataURL(file);
  }

  showDesignFileSuccess(file) {
    if (!this.initialStateDesign || !this.successStateDesign || !this.successFilename) {
      console.warn('❌ Elementos de estado de éxito no encontrados');
      return;
    }
    
    // Configurar información del archivo
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    this.successFilename.textContent = `${file.name} (${fileSize} MB)`;
    
    // Animación de salida del estado inicial
    this.initialStateDesign.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    this.initialStateDesign.style.opacity = '0';
    this.initialStateDesign.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      this.initialStateDesign.style.display = 'none';
      this.successStateDesign.style.display = 'flex';
      this.successStateDesign.style.opacity = '0';
      this.successStateDesign.style.transform = 'scale(0.9)';
      
      // Animación de entrada con bounce
      setTimeout(() => {
        this.successStateDesign.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        this.successStateDesign.style.opacity = '1';
        this.successStateDesign.style.transform = 'scale(1)';
      }, 50);
    }, 300);
    
    console.log('✅ Estado de éxito mostrado para archivo de diseño');
  }

  // ===== FUNCIONES DE RESET =====

  resetImageUploadState() {
    if (this.initialStateImage && this.previewStateImage) {
      this.previewStateImage.style.display = 'none';
      this.initialStateImage.style.display = 'flex';
      this.initialStateImage.style.opacity = '1';
      this.initialStateImage.style.transform = 'scale(1)';
      this.initialStateImage.style.transition = '';
    }
    this.currentImageFile = null;
    if (this.designImage) this.designImage.value = '';
  }

  resetDesignFileUploadState() {
    if (this.initialStateDesign && this.successStateDesign) {
      this.successStateDesign.style.display = 'none';
      this.initialStateDesign.style.display = 'flex';
      this.initialStateDesign.style.opacity = '1';
      this.initialStateDesign.style.transform = 'scale(1)';
      this.initialStateDesign.style.transition = '';
    }
    this.currentDesignFile = null;
    if (this.designFile) this.designFile.value = '';
  }

  resetAllUploadStates() {
    this.resetImageUploadState();
    this.resetDesignFileUploadState();
    console.log('🔄 Estados de upload reiniciados');
  }

  // ===== FUNCIONES DE UTILIDAD =====

  showError(message) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'error',
        title: 'Error de archivo',
        text: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        background: '#1a1a1a',
        color: '#ff4444'
      });
    } else {
      alert(message);
    }
  }

  showSuccess(message) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'success',
        title: 'Archivo cargado',
        text: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#1a1a1a',
        color: '#44ff44'
      });
    }
  }

  // ===== COMPRESIÓN DE IMÁGENES =====
  async compressImage(file, quality = 0.8, maxWidthOrHeight = 1920) {
    return new Promise((resolve) => {
      console.log(`🗜️ Iniciando compresión: calidad ${quality}, max ${maxWidthOrHeight}px`);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = function() {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        let { width, height } = img;
        console.log(`📐 Dimensiones originales: ${width}x${height}`);
        
        // Para archivos muy grandes, ser más agresivo con el redimensionado
        let targetMax = maxWidthOrHeight;
        if (file.size > 10 * 1024 * 1024) {
          targetMax = Math.min(maxWidthOrHeight, 800); // Max 800px para archivos >10MB
        } else if (file.size > 5 * 1024 * 1024) {
          targetMax = Math.min(maxWidthOrHeight, 1024); // Max 1024px para archivos >5MB
        }
        
        if (width > height) {
          if (width > targetMax) {
            height = (height * targetMax) / width;
            width = targetMax;
          }
        } else {
          if (height > targetMax) {
            width = (width * targetMax) / height;
            height = targetMax;
          }
        }
        
        console.log(`📐 Nuevas dimensiones: ${Math.round(width)}x${Math.round(height)}`);
        
        canvas.width = width;
        canvas.height = height;
        
        // Dibujar imagen redimensionada con mejor calidad
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a blob con compresión ajustable
        canvas.toBlob((blob) => {
          // Si el blob comprimido es más pequeño, usarlo; si no, usar el original
          const finalFile = blob && blob.size < file.size ? blob : file;
          
          // Crear nuevo File object con nombre original
          const compressedFile = new File([finalFile], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          
          const originalSizeMB = (file.size/1024/1024).toFixed(2);
          const finalSizeMB = (finalFile.size/1024/1024).toFixed(2);
          const reductionPercent = ((1 - finalFile.size/file.size) * 100).toFixed(1);
          
          console.log(`🗜️ Compresión completada: ${originalSizeMB}MB → ${finalSizeMB}MB (${reductionPercent}% reducción)`);
          resolve(compressedFile);
        }, file.type, quality);
      };
      
      img.onerror = function() {
        console.error('❌ Error al cargar imagen para compresión');
        resolve(file); // Devolver original si hay error
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // ===== VERIFICACIÓN DE CONEXIÓN =====
  async checkConnection() {
    try {
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch (error) {
      console.warn('⚠️ Verificación de conexión falló:', error);
      return false;
    }
  }

  // ===== SISTEMA DE UPLOAD COMPLETAMENTE REVISADO =====
  async uploadFileWithRetry(file, path, maxRetries = 3, retryDelay = 3000) {
    let lastError;
    
    console.log(`� [UPLOAD] Iniciando: ${file.name} (${(file.size/1024/1024).toFixed(2)}MB)`);
    console.log(`📁 [UPLOAD] Ruta destino: ${path}`);
    
    // Verificar Firebase Storage
    if (!firebase || !firebase.storage) {
      throw new Error('Firebase Storage no está disponible');
    }
    
    // Comprimir imagen si es necesario
    if (file.type.startsWith('image/')) {
      console.log(`📏 [COMPRESSION] Archivo original: ${(file.size/1024/1024).toFixed(2)}MB`);
      
      if (file.size > 500 * 1024) { // >500KB
        console.log('🗜️ [COMPRESSION] Comprimiendo imagen...');
        try {
          file = await this.compressImage(file, 0.8, 1920);
          console.log(`✅ [COMPRESSION] Resultado: ${(file.size/1024/1024).toFixed(2)}MB`);
        } catch (compressionError) {
          console.warn('⚠️ [COMPRESSION] Error en compresión, usando archivo original:', compressionError);
        }
      }
      
      if (file.size > 3 * 1024 * 1024) { // >3MB
        console.log('🗜️ [COMPRESSION] Compresión adicional...');
        try {
          file = await this.compressImage(file, 0.6, 1280);
          console.log(`✅ [COMPRESSION] Resultado adicional: ${(file.size/1024/1024).toFixed(2)}MB`);
        } catch (compressionError) {
          console.warn('⚠️ [COMPRESSION] Error en compresión adicional:', compressionError);
        }
      }
    }
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Verificar cancelación
      if (this.uploadCancelled) {
        console.log('🚫 [UPLOAD] Cancelado por usuario');
        throw new Error('Upload cancelado');
      }
      
      try {
        console.log(`📤 [UPLOAD] Intento ${attempt}/${maxRetries}`);
        
        // Crear referencia única
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniquePath = `${path}/${timestamp}_${randomId}_${safeFileName}`;
        
        console.log(`🎯 [STORAGE] Creando referencia: ${uniquePath}`);
        const storageRef = firebase.storage().ref(uniquePath);
        
        // Metadata completa
        const metadata = {
          contentType: file.type || 'application/octet-stream',
          customMetadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
            attempt: attempt.toString(),
            fileSize: file.size.toString()
          }
        };
        
        console.log(`📋 [METADATA] Configurado:`, metadata);
        
        // Timeout dinámico
        const baseTimeout = 60000; // 1 minuto base
        const sizeTimeout = Math.ceil(file.size / (1024 * 1024)) * 15000; // +15s por MB
        const totalTimeout = Math.min(baseTimeout + sizeTimeout, 300000); // Max 5 minutos
        
        console.log(`⏱️ [TIMEOUT] ${(totalTimeout/1000).toFixed(0)}s para ${(file.size/1024/1024).toFixed(2)}MB`);
        
        // Ejecutar upload con manejo robusto
        const downloadURL = await this.executeUpload(storageRef, file, metadata, totalTimeout, attempt, maxRetries);
        
        console.log(`🎉 [SUCCESS] Upload completado en intento ${attempt}`);
        console.log(`🔗 [URL] ${downloadURL}`);
        
        return downloadURL;
        
      } catch (error) {
        lastError = error;
        console.error(`❌ [ERROR] Intento ${attempt} falló:`, error.message);
        console.error(`📄 [ERROR] Detalles:`, error);
        
        // Si no es el último intento, esperar
        if (attempt < maxRetries) {
          const delay = retryDelay * attempt; // Delay lineal: 3s, 6s, 9s
          console.log(`⏳ [RETRY] Esperando ${delay}ms antes del intento ${attempt + 1}`);
          
          // Mostrar en UI
          this.updateRetryUI(attempt, maxRetries, delay);
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // Todos los intentos fallaron
    console.error(`💥 [FAILED] Falló después de ${maxRetries} intentos. Último error:`, lastError);
    throw new Error(`Upload falló: ${lastError?.message || 'Error desconocido'}`);
  }
  
  // ===== EJECUCIÓN DE UPLOAD CON MANEJO ROBUSTO =====
  async executeUpload(storageRef, file, metadata, timeout, attempt, maxRetries) {
    return new Promise((resolve, reject) => {
      let isResolved = false;
      
      // Timeout de seguridad
      const timeoutHandle = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          console.error(`⏰ [TIMEOUT] Operación tardó más de ${timeout}ms`);
          reject(new Error(`Timeout de ${(timeout/1000).toFixed(0)} segundos`));
        }
      }, timeout);
      
      try {
        console.log(`🚀 [FIREBASE] Iniciando put() con Firebase Storage`);
        const uploadTask = storageRef.put(file, metadata);
        
        uploadTask.on('state_changed', 
          // Progreso
          (snapshot) => {
            if (isResolved) return;
            
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            const transferred = (snapshot.bytesTransferred / 1024 / 1024).toFixed(2);
            const total = (snapshot.totalBytes / 1024 / 1024).toFixed(2);
            
            console.log(`📊 [PROGRESS] ${progress.toFixed(1)}% (${transferred}/${total}MB)`);
            
            // Actualizar UI
            this.updateProgressUI(file, progress);
            
            // Actualizar modal si está visible
            if (typeof Swal !== 'undefined' && Swal.isVisible && Swal.isVisible()) {
              try {
                Swal.update({
                  title: `📤 Subiendo ${file.type.startsWith('image/') ? 'imagen' : 'archivo'}`,
                  html: `
                    <div class="upload-progress">
                      <div class="progress-bar" style="width: ${progress}%; background: #6236ff; height: 20px; border-radius: 10px; transition: width 0.3s;"></div>
                      <p style="margin-top: 10px;">${progress.toFixed(1)}% - ${transferred}MB de ${total}MB</p>
                      <p style="color: #666; font-size: 14px;">Intento ${attempt} de ${maxRetries}</p>
                    </div>
                  `,
                  allowOutsideClick: false,
                  showConfirmButton: false
                });
              } catch (swalError) {
                console.warn('⚠️ [UI] Error actualizando SweetAlert:', swalError);
              }
            }
          },
          
          // Error
          (error) => {
            if (isResolved) return;
            isResolved = true;
            clearTimeout(timeoutHandle);
            
            console.error(`💥 [FIREBASE_ERROR] Error en state_changed:`, error);
            console.error(`📄 [FIREBASE_ERROR] Código:`, error.code);
            console.error(`📄 [FIREBASE_ERROR] Mensaje:`, error.message);
            
            reject(new Error(`Firebase error: ${error.message} (${error.code})`));
          },
          
          // Completado
          async () => {
            if (isResolved) return;
            
            try {
              console.log(`✅ [FIREBASE] Upload task completado, obteniendo URL...`);
              const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
              
              if (!downloadURL) {
                throw new Error('No se pudo obtener la URL de descarga');
              }
              
              isResolved = true;
              clearTimeout(timeoutHandle);
              
              console.log(`🔗 [URL] Obtenida exitosamente: ${downloadURL.substring(0, 80)}...`);
              resolve(downloadURL);
              
            } catch (urlError) {
              if (!isResolved) {
                isResolved = true;
                clearTimeout(timeoutHandle);
                console.error(`💥 [URL_ERROR] Error obteniendo URL:`, urlError);
                reject(new Error(`Error obteniendo URL: ${urlError.message}`));
              }
            }
          }
        );
        
      } catch (initError) {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeoutHandle);
          console.error(`💥 [INIT_ERROR] Error iniciando upload:`, initError);
          reject(new Error(`Error iniciando upload: ${initError.message}`));
        }
      }
    });
  }
  
  // ===== ACTUALIZACIÓN DE UI =====
  updateProgressUI(file, progress) {
    try {
      const progressBar = file.type.startsWith('image/') ? 
        document.getElementById('progressFill') : 
        document.getElementById('progressFillDesign');
      
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
        const container = progressBar.parentElement;
        if (container) {
          container.style.display = 'block';
        }
      }
    } catch (uiError) {
      console.warn('⚠️ [UI] Error actualizando progreso:', uiError);
    }
  }
  
  updateRetryUI(attempt, maxRetries, delay) {
    if (typeof Swal !== 'undefined' && Swal.isVisible && Swal.isVisible()) {
      try {
        Swal.update({
          title: `🔄 Reintentando... (${attempt}/${maxRetries})`,
          html: `
            <div class="retry-info">
              <p>El intento ${attempt} no fue exitoso</p>
              <p>Esperando ${(delay/1000).toFixed(0)} segundos antes del siguiente intento...</p>
              <div class="loading-spinner" style="margin: 20px auto; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #6236ff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
          `,
          allowOutsideClick: false,
          showCancelButton: true,
          cancelButtonText: 'Cancelar Upload',
          showConfirmButton: false
        }).then((result) => {
          if (result.isDismissed || result.isDenied) {
            this.uploadCancelled = true;
          }
        }).catch((swalError) => {
          console.warn('⚠️ [UI] Error en SweetAlert retry:', swalError);
        });
      } catch (updateError) {
        console.warn('⚠️ [UI] Error actualizando retry UI:', updateError);
      }
    }
  }

  // ===== FUNCIÓN DE UPLOAD SIMPLIFICADA PARA FORMULARIO =====
  async handleFormSubmit(event) {
    event.preventDefault();
    
    const btnUpload = document.getElementById('btnUploadDesign');
    const btnText = document.getElementById('btnText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    try {
      // Resetear bandera de cancelación
      this.uploadCancelled = false;
      
      // Validar imagen
      if (!this.currentImageFile) {
        throw new Error('Por favor selecciona una imagen de preview');
      }

      // Verificar enlace de Google Drive
      const googleDriveUrl = document.getElementById('googleDriveUrl').value.trim();
      if (!googleDriveUrl) {
        throw new Error('Por favor ingresa el enlace de Google Drive');
      }

      // Validar URL de Google Drive
      if (!googleDriveUrl.includes('drive.google.com')) {
        throw new Error('El enlace debe ser de Google Drive');
      }

      // Verificar conexión a internet antes de iniciar
      const hasConnection = await this.checkConnection();
      if (!hasConnection) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión e intenta nuevamente.');
      }

      // Mostrar estado de carga
      btnUpload.disabled = true;
      loadingSpinner.style.display = 'inline-block';
      btnText.textContent = 'Verificando datos...';

      // Obtener datos del formulario
      const formData = new FormData(this.uploadForm);
      const designData = {
        name: formData.get('designName'),
        description: formData.get('designDesc'),
        category: formData.get('designCategory'),
        priceType: formData.get('designPriceType'),
        price: formData.get('designPrice') || 0,
        formats: this.formats,
        googleDriveUrl: googleDriveUrl
      };
        category: formData.get('designCategory'),
        priceType: formData.get('designPriceType'),
        price: formData.get('designPrice') || 0,
        formats: this.formats,
        googleDriveUrl: googleDriveUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      console.log('📝 Datos del diseño:', designData);

      // Upload solo de imagen
      btnText.textContent = 'Subiendo imagen preview...';
      
      // Mostrar información de archivo al usuario
      const imageSizeMB = (this.currentImageFile.size / 1024 / 1024).toFixed(2);
      console.log(`📊 Imagen a subir: ${imageSizeMB}MB`);
      
      // Mostrar estimación de tiempo
      if (typeof Swal !== 'undefined' && Swal.fire) {
        try {
          Swal.fire({
            title: '📤 Subiendo diseño',
            html: `<div class="upload-info">
              <p><strong>Imagen:</strong> ${this.currentImageFile.name} (${imageSizeMB}MB)</p>
              <p><strong>Enlace:</strong> Google Drive</p>
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
          }).catch((swalError) => {
            console.warn('Error en SweetAlert inicial:', swalError);
          });
        } catch (initialSwalError) {
          console.warn('Error al inicializar SweetAlert:', initialSwalError);
        }
      }
      
      const safeDesignName = designData.name || 'diseno_sin_nombre';
      console.log('🚀 Iniciando upload de imagen...');
      const imageUrl = await this.uploadFileWithRetry(
        this.currentImageFile, 
        `designs/images/${safeDesignName.replace(/[^a-zA-Z0-9]/g, '_')}`
      );
      console.log('✅ Imagen subida exitosamente:', imageUrl);

      // Guardar en Firestore con enlace de Google Drive
      btnText.textContent = 'Guardando información...';
      const docRef = await db.collection('designs').add({
        ...designData,
        imageUrl: imageUrl
      });
        imageUrl: imageUrl,
        fileUrl: fileUrl
      });

      console.log('✅ Diseño guardado con ID:', docRef.id);

      // Recargar el catálogo inmediatamente
      try {
        if (typeof forceReloadCatalog === 'function') {
          console.log('🔄 Sincronizando catálogo automáticamente...');
          await forceReloadCatalog();
          console.log('✅ Catálogo sincronizado correctamente');
        } else {
          console.warn('⚠️ Función forceReloadCatalog no disponible');
        }
      } catch (catalogError) {
        console.error('⚠️ Error al sincronizar catálogo:', catalogError);
        // No fallar el upload por error de sincronización
      }

      // Mostrar éxito
      btnText.textContent = '¡Éxito!';
      btnUpload.classList.add('success-animation');
      
      // Verificar que SweetAlert esté disponible
      if (typeof Swal !== 'undefined' && Swal.fire) {
        Swal.fire({
          icon: 'success',
          title: '🎉 ¡Diseño subido exitosamente!',
          html: `<div>
            <p>El diseño "<strong>${designData.name}</strong>" se ha guardado correctamente</p>
            <p style="color: #666; font-size: 14px; margin-top: 10px;">
              ✅ Imagen subida<br>
              ✅ Archivo subido<br>
              ✅ Guardado en base de datos<br>
              ✅ Catálogo actualizado
            </p>
          </div>`,
          showConfirmButton: true,
          confirmButtonText: 'Ver en Catálogo',
          showCancelButton: true,
          cancelButtonText: 'Subir Otro',
          timer: 8000
        }).then((result) => {
          if (result.isConfirmed) {
            // Ir a la página principal
            window.location.href = 'Index.html';
          }
        }).catch((swalError) => {
          console.error('Error en SweetAlert:', swalError);
        });
      } else {
        // Fallback si SweetAlert no está disponible
        alert(`✅ ¡Diseño "${designData.name}" subido exitosamente!\n\n¿Ir al catálogo?`);
        if (confirm('¿Ver en catálogo?')) {
          window.location.href = 'Index.html';
        }
      }

      // Reset del formulario
      this.resetForm();

    } catch (error) {
      console.error('❌ Error en upload:', error);
      
      // Mostrar error específico
      let errorMessage = 'Error desconocido';
      let errorTitle = '❌ Error al subir diseño';
      
      if (error.message.includes('retry-limit-exceeded')) {
        errorTitle = '🔄 Límite de reintentos alcanzado';
        errorMessage = 'Los archivos son muy grandes o hay problemas de conexión. Recomendaciones:\n\n' +
                      '• Verifica tu conexión a internet\n' +
                      '• Intenta con archivos más pequeños\n' +
                      '• Si persiste, espera unos minutos e intenta nuevamente';
      } else if (error.message.includes('Upload timeout')) {
        errorTitle = '⏱️ Tiempo de espera agotado';
        errorMessage = 'La subida tardó demasiado. Esto puede deberse a:\n\n' +
                      '• Conexión lenta a internet\n' +
                      '• Archivos muy grandes\n' +
                      '• Problemas temporales del servidor';
      } else if (error.message.includes('storage/unauthorized')) {
        errorTitle = '🔒 Sin permisos';
        errorMessage = 'No tienes permisos para subir archivos. Contacta al administrador.';
      } else if (error.message.includes('storage/quota-exceeded')) {
        errorTitle = '💾 Espacio agotado';
        errorMessage = 'Se ha excedido el límite de almacenamiento. Contacta al administrador.';
      } else if (error.message.includes('storage/unknown')) {
        errorTitle = '❓ Error desconocido del servidor';
        errorMessage = 'Error del servidor de Firebase. Intenta nuevamente en unos minutos.';
      } else if (error.message.includes('network')) {
        errorTitle = '🌐 Error de conexión';
        errorMessage = 'Problema de conexión a internet. Verifica tu conexión e intenta nuevamente.';
      } else {
        errorMessage = error.message;
      }

      // Mostrar error con verificación de SweetAlert
      if (typeof Swal !== 'undefined' && Swal.fire) {
        Swal.fire({
          icon: 'error',
          title: errorTitle,
          text: errorMessage,
          footer: '<small>Si el problema persiste, contacta al soporte técnico</small>',
          confirmButtonText: 'Entendido',
          allowOutsideClick: false,
          customClass: {
            popup: 'swal-wide'
          }
        }).catch((swalError) => {
          console.error('Error en SweetAlert de error:', swalError);
        });
      } else {
        // Fallback si SweetAlert no está disponible
        alert(`${errorTitle}\n\n${errorMessage}`);
      }

      // Restaurar botón
      btnText.textContent = 'Subir diseño';
      btnUpload.classList.remove('success-animation');
      
    } finally {
      // Limpiar estado de carga
      btnUpload.disabled = false;
      loadingSpinner.style.display = 'none';
      
      // Limpiar barras de progreso
      ['progressFill', 'progressFillDesign'].forEach(id => {
        const progressBar = document.getElementById(id);
        if (progressBar) {
          progressBar.style.width = '0%';
        }
      });
    }
  }

  resetForm() {
    setTimeout(() => {
      this.uploadForm.reset();
      this.formats = [];
      this.currentFile = null;
      this.renderFormats();
      this.imgPreview.style.display = 'none';
      this.previewArea.style.display = 'block';
      this.previewInfo.style.display = 'none';
      this.priceWrapper.style.display = 'none';
      
      // Resetear botón
      this.btnUpload.classList.remove('success-animation');
      this.btnText.textContent = 'Subir diseño';
      
      // Limpiar errores
      document.querySelectorAll('.form-input').forEach(input => {
        input.classList.remove('error', 'success');
      });
      
      document.querySelectorAll('.error-message').forEach(msg => {
        msg.classList.remove('show');
      });
      
    }, 2000);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.designUploader = new DesignUploader();
  
  // Agregar funciones de reset al contexto global para compatibilidad
  window.resetAllUploadStates = () => window.designUploader?.resetAllUploadStates();
  window.resetImageUploadState = () => window.designUploader?.resetImageUploadState();
  window.resetDesignFileUploadState = () => window.designUploader?.resetDesignFileUploadState();
  
  console.log('🎨 Sistema de upload moderno completamente inicializado');
});

// ===== SISTEMA GLASSMORPHISM MEJORADO =====
class GlassmorphismUploader {
  constructor() {
    this.imageFile = null;
    this.designFile = null;
    this.init();
  }

  init() {
    this.setupImageUpload();
    this.setupFileUpload();
  }

  setupImageUpload() {
    const uploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('designImage');
    const initialContent = document.getElementById('imageInitialContent');
    const previewContainer = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const fileName = document.getElementById('imageFileName');

    if (!uploadArea || !fileInput) return;

    // Click para abrir selector
    uploadArea.addEventListener('click', (e) => {
      if (!e.target.closest('.preview-overlay') && !e.target.closest('.upload-button')) {
        fileInput.click();
      }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
    uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
    uploadArea.addEventListener('drop', (e) => this.handleImageDrop(e));

    // File input change
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.handleImageFile(file);
    });

    // Preview click para cambiar
    if (previewContainer) {
      previewContainer.addEventListener('click', () => fileInput.click());
    }
  }

  setupFileUpload() {
    const uploadArea = document.getElementById('fileUploadAreaDesign');
    const fileInput = document.getElementById('designFile');
    const initialContent = document.getElementById('fileInitialContent');
    const successContainer = document.getElementById('fileSuccess');
    const fileName = document.getElementById('fileFileName');

    if (!uploadArea || !fileInput) return;

    // Click para abrir selector
    uploadArea.addEventListener('click', (e) => {
      if (!e.target.closest('.upload-button')) {
        fileInput.click();
      }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
    uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
    uploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));

    // File input change
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.handleDesignFile(file);
    });

    // Success click para cambiar
    if (successContainer) {
      successContainer.addEventListener('click', () => fileInput.click());
    }
  }

  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Solo remover si realmente salimos del área
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      e.currentTarget.classList.remove('dragover');
    }
  }

  handleImageDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (this.validateImageFile(file)) {
        this.handleImageFile(file);
      }
    }
  }

  handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (this.validateDesignFile(file)) {
        this.handleDesignFile(file);
      }
    }
  }

  validateImageFile(file) {
    // Validar tipo
    if (!file.type.startsWith('image/')) {
      this.showError('Por favor selecciona solo archivos de imagen (PNG, JPG, WEBP)');
      return false;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showError('La imagen es demasiado grande. Máximo 5MB permitido.');
      return false;
    }

    return true;
  }

  validateDesignFile(file) {
    // Validar extensión
    const allowedExtensions = ['.zip', '.rar', '.psd', '.ai', '.pdf', '.svg', '.eps'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      this.showError('Archivo no válido. Formatos permitidos: ZIP, RAR, PSD, AI, PDF, SVG, EPS');
      return false;
    }

    // Validar tamaño (50MB)
    if (file.size > 50 * 1024 * 1024) {
      this.showError('El archivo es demasiado grande. Máximo 50MB permitido.');
      return false;
    }

    return true;
  }

  handleImageFile(file) {
    if (!this.validateImageFile(file)) return;

    this.imageFile = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewImg = document.getElementById('previewImg');
      const fileName = document.getElementById('imageFileName');
      const initialContent = document.getElementById('imageInitialContent');
      const previewContainer = document.getElementById('imagePreview');

      if (previewImg && fileName && initialContent && previewContainer) {
        previewImg.src = e.target.result;
        fileName.textContent = file.name;

        // Animación de transición
        this.fadeOut(initialContent, () => {
          this.fadeIn(previewContainer);
        });
      }
    };
    reader.readAsDataURL(file);

    this.showSuccess(`Imagen "${file.name}" cargada correctamente`);
  }

  handleDesignFile(file) {
    if (!this.validateDesignFile(file)) return;

    this.designFile = file;
    
    const fileName = document.getElementById('fileFileName');
    const initialContent = document.getElementById('fileInitialContent');
    const successContainer = document.getElementById('fileSuccess');

    if (fileName && initialContent && successContainer) {
      const fileSize = (file.size / 1024 / 1024).toFixed(2);
      fileName.textContent = `${file.name} (${fileSize} MB)`;

      // Animación de transición
      this.fadeOut(initialContent, () => {
        this.fadeIn(successContainer);
      });
    }

    this.showSuccess(`Archivo "${file.name}" cargado correctamente`);
  }

  fadeOut(element, callback) {
    element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    element.style.opacity = '0';
    element.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      element.style.display = 'none';
      if (callback) callback();
    }, 300);
  }

  fadeIn(element) {
    element.style.display = 'flex';
    element.style.opacity = '0';
    element.style.transform = 'scale(0.9)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'scale(1)';
    }, 50);
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showNotification(message, type) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        backdrop-filter: blur(10px);
        animation: slideIn 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
        ${type === 'error' 
            ? 'background: rgba(239, 68, 68, 0.9); border: 1px solid #ef4444;' 
            : 'background: rgba(16, 185, 129, 0.9); border: 1px solid #10b981;'
        }
    `;
    notification.textContent = message;

    // Agregar estilos de animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remover después de 4 segundos
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      }, 300);
    }, 4000);
  }
}

// Inicializar sistema glassmorphism cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  window.glassmorphismUploader = new GlassmorphismUploader();
  console.log('🎨 Sistema Glassmorphism inicializado');
});

// Exportar para uso global
window.DesignUploader = DesignUploader;