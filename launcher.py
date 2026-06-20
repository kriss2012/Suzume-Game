"""Suzume Doors — Desktop launcher (pywebview + PyInstaller)"""
import sys, os, webview

def get_base_path():
    if hasattr(sys, 'frozen'):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))

if __name__ == '__main__':
    base_dir = get_base_path()
    html_path = os.path.join(base_dir, 'Suzume Doors.html')
    
    if not os.path.exists(html_path):
        html_path = os.path.abspath('Suzume Doors.html')
        
    url = 'file:///' + html_path.replace('\\', '/')
    
    icon_path = os.path.join(base_dir, 'assets', 'icon.png')
    if not os.path.exists(icon_path):
        icon_path = os.path.abspath('assets/icon.png')
        
    window = webview.create_window(
        title      = 'Suzume — Close the Doors',
        url        = url,
        width      = 1920,
        height     = 1080,
        resizable  = True,
        fullscreen = False,
        min_size   = (1280, 720),
    )
    webview.start(gui='edgechromium', icon=icon_path if os.path.exists(icon_path) else None)
