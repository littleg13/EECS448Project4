import socketio
import eventlet

# create a Socket.IO server
io = socketio.Server()
app = socketio.WSGIApp(io)

# @io.on('connect')
# def connect(sid, env):

@io.on('joinLobby')
def joinLobby(sid, lobbyCode):
    print(sid,' joined ' , lobbyCode['id'])
    io.enter_room(sid, lobbyCode['id'])
    io.emit('message', sid + ' joined the room', room=lobbyCode['id'])

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 3000)), app)
