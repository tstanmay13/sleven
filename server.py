#!/usr/bin/env python3
import ssl
import http.server
import socketserver
import os

# Generate self-signed certificate for HTTPS
os.system('''
openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" 2>/dev/null
''')

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        super().end_headers()

httpd = socketserver.TCPServer(('', 8443), MyHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(httpd.socket,
                               certfile='./server.pem',
                               server_side=True)

print("Server running at https://localhost:8443/")
print("Also accessible at https://192.168.4.70:8443/")
print("\nNOTE: You'll need to accept the security warning in Safari")
print("This is required for motion sensors to work on iOS 13+")

httpd.serve_forever()