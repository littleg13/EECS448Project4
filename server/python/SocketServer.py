import socketio
import eventlet
import random
import string
from player import Player

lobbyList = {}

def generateRandomString(num):
    output = ""
    for i in range(num):
        letter = random.choice(string.ascii_uppercase)
        output += letter
    return output

# create a Socket.IO server
io = socketio.Server()
app = socketio.WSGIApp(io)


def sendPlayerList(sid):
    lobby = lobbyList[io.get_session(sid)['lobbyCode']]
    output = []
    for playerID, playerObject in lobby.items():
        output.append(playerObject.username)
    io.emit('playerList', output, room=sid)

@io.on('joinLobby')
def joinLobby(sid, data):
    print(data['username'],' joined ' , data['lobbyCode'], flush=True)
    io.enter_room(sid, data['lobbyCode'])
    userID = generateRandomString(10)
    io.emit('setID', {'userID' : userID, 'username' : data['username']}, room=sid)
    with io.session(sid) as session:
        session['userID'] = userID
        session['lobbyCode'] = data['lobbyCode']
    if(data['lobbyCode'] in lobbyList):
        lobbyList[data['lobbyCode']][io.get_session(sid)['userID']] = Player(data['username'])
        io.emit('playerJoin', {'username' : lobbyList[data['lobbyCode']][io.get_session(sid)['userID']].username}, room=data['lobbyCode'])
    else:
        io.emit('error', {'error' : 'Lobby does not exists'}, room=sid)

@io.on('createLobby')
def createLobby(sid, data):
    lobbyCode = generateRandomString(4)
    io.enter_room(sid, lobbyCode)
    io.emit('lobbyCreated', {'lobbyCode': lobbyCode}, room=sid)
    userID = generateRandomString(10)
    io.emit('setID', {'userID' : userID, 'username' : data['username']}, room=sid)
    with io.session(sid) as session:
        session['userID'] = userID
        session['lobbyCode'] = lobbyCode
    lobbyList[lobbyCode] = {userID: Player(data['username'])}

@io.on('auth')
def auth(sid, data):
    with io.session(sid) as session:
        session['userID'] = data['userID']
        session['lobbyCode'] = data['lobbyCode']
    io.enter_room(sid, data['lobbyCode'])

@io.on('requestInfo')
def requestInfo(sid, data):
    options = {
    'getPlayerList' : sendPlayerList
    }
    options[data['request']](sid)
# @io.on('disconnect')
# def disconnect(sid):
#     io.session_save()

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 3000)), app)

# json.dumps(list(map(lambda x:lobbyList[data['lobbyCode']][x].__dict__,lobbyList[data['lobbyCode']])))
