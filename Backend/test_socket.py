import socketio
sio = socketio.Client()

@sio.event
def connect():
    print("✅ SOCKET CONNECTED!")
    sio.emit('raw_frame', {'rid': 123, 'frame': b'test'})
    sio.sleep(1)
    sio.disconnect()

@sio.event
def success(data):
    print(f"🟢 Backend OK: {data}")

print("🔗 Testing LOCALHOST first...")
sio.connect('http://127.0.0.1:8080')  # ← Changed to localhost!
sio.wait()
