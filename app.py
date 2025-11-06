from flask import Flask, render_template, redirect, url_for, request, jsonify
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime

# Inicializa la aplicación Flask
app = Flask(__name__)

# Configuración para subida de archivos
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Asegurarse de que existe el directorio de uploads
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Función para verificar extensiones permitidas
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ===== RUTAS PRINCIPALES =====

# Página principal
@app.route('/')
def index():
    # El archivo real se llama Index.html (con I mayúscula)
    return render_template('Index.html')

# Página de login
@app.route('/login')
def login():
    return render_template('login.html')

# Página de registro
@app.route('/register')
def register():
    # Coincidir con el nombre real del archivo en templates (registro.html)
    return render_template('registro.html')

# Página dashboard (área privada o catálogo)
@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

# Panel de administración
@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/api/upload-design', methods=['POST'])
def upload_design():
    if 'design' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['design']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Guardar información del diseño
        design_data = {
            'title': request.form.get('title', 'Sin título'),
            'description': request.form.get('description', ''),
            'price': float(request.form.get('price', 0)),
            'drive_link': request.form.get('drive_link', ''),
            'image_path': '/static/uploads/' + filename,
            'created_at': datetime.now().isoformat()
        }
        
        # Guardar en JSON
        designs_file = 'static/data/designs.json'
        os.makedirs('static/data', exist_ok=True)
        
        try:
            with open(designs_file, 'r') as f:
                designs = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            designs = []
        
        designs.append(design_data)
        
        with open(designs_file, 'w') as f:
            json.dump(designs, f, indent=2)
            
        return jsonify({'success': True, 'design': design_data})
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/get-designs')
def get_designs():
    try:
        with open('static/data/designs.json', 'r') as f:
            designs = json.load(f)
        return jsonify(designs)
    except FileNotFoundError:
        return jsonify([])

@app.route('/api/register-sale', methods=['POST'])
def register_sale():
    sale_data = {
        'design_id': request.json.get('design_id'),
        'customer_email': request.json.get('customer_email'),
        'amount': request.json.get('amount'),
        'date': datetime.now().isoformat()
    }
    
    sales_file = 'static/data/sales.json'
    os.makedirs('static/data', exist_ok=True)
    
    try:
        with open(sales_file, 'r') as f:
            sales = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        sales = []
    
    sales.append(sale_data)
    
    with open(sales_file, 'w') as f:
        json.dump(sales, f, indent=2)
        
    return jsonify({'success': True, 'sale': sale_data})

# Redirección automática al index si la ruta no existe
@app.errorhandler(404)
def page_not_found(e):
    return redirect(url_for('index'))

# ===== EJECUCIÓN LOCAL =====
if __name__ == '__main__':
    app.run(debug=True, port=5500)
