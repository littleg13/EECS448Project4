import socketio
import eventlet
import random
import string
from player import Player

def generateRandomString(num):
    output = ""
    for i in range(num):
        letter = random.choice(string.ascii_uppercase)
        output += letter
    return output

# create a Socket.IO server
io = socketio.Server()
app = socketio.WSGIApp(io)

lobbyList = {}

# @io.on('connect')
# def connect(sid, env):
#     print(env, flush=True)

@io.on('joinLobby')
def joinLobby(sid, data):
    print(data['username'],' joined ' , data['lobbyCode'], flush=True)
    io.enter_room(sid, data['lobbyCode'])
    userID = generateRandomString(10)
    io.emit('setID', {'userID' : userID}, room=sid)
    with io.session(sid) as session:
        session['userID'] = userID
    if(data['lobbyCode'] in lobbyList):
        lobbyList[data['lobbyCode']][io.get_session(sid)['userID']] = Player(data['username'])
        io.emit('message', lobbyList[data['lobbyCode']][io.get_session(sid)['userID']].username + ' joined the room', room=data['lobbyCode'])
    else:
        io.emit('error', {'error' : 'Lobby does not exists'}, room=sid)

@io.on('createLobby')
def createLobby(sid, data):
    lobbyCode = generateRandomString(4)
    io.enter_room(sid, lobbyCode)
    io.emit('lobbyCreated', {'lobbyCode': lobbyCode}, room=sid)
    userID = generateRandomString(10)
    io.emit('setID', {'userID' : userID}, room=sid)
    with io.session(sid) as session:
        session['userID'] = userID
    lobbyList[lobbyCode] = {userID: Player(data['username'])}


@io.on('auth')
def auth(sid, data):
    with io.session(sid) as session:
        session['userID'] = data['userID']
# @io.on('disconnect')
# def disconnect(sid):
#     io.session_save()

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 3000)), app)
