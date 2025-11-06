# Servidor HTTP con Python - Más estable que PowerShell
import http.server
import socketserver
import os
import webbrowser
from threading import Timer

# Configuración
PORT = 5500
HOST = "127.0.0.1"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Añadir headers para evitar cache y mejorar compatibilidad
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        # Log más limpio
        print(f"[{self.address_string()}] {format % args}")

def open_browser():
    """Abrir navegador después de 2 segundos"""
    webbrowser.open(f'http://{HOST}:{PORT}/templates/Index.html')

if __name__ == "__main__":
    # Cambiar al directorio del proyecto
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print(f"🚀 Iniciando servidor en http://{HOST}:{PORT}")
    print(f"📁 Directorio: {os.getcwd()}")
    print(f"🏠 Página principal: http://{HOST}:{PORT}/templates/Index.html")
    print(f"⚙️ Admin: http://{HOST}:{PORT}/templates/admin.html")
    print(f"🔧 Debug: http://{HOST}:{PORT}/debug-firebase.html")
    print("Presiona Ctrl+C para detener")
    print("-" * 50)
    
    # Configurar servidor
    with socketserver.TCPServer((HOST, PORT), MyHTTPRequestHandler) as httpd:
        # Abrir navegador automáticamente
        Timer(2.0, open_browser).start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Servidor detenido")
            httpd.shutdown()