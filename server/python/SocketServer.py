import socketio
import eventlet

# create a Socket.IO server
io = socketio.Server()
app = socketio.WSGIApp(io)

@io.on('connect')
def connect(sid, env):
    print('connect ', sid)

@io.on('message')
def printMessage(sid, message):
    print(sid,': ' , message)

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 3000)), app)