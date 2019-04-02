import socketio
import eventlet
import random
import string
from Player import Player
from Lobby import Lobby
from LobbyHandler import LobbyHandler

lobbyHandler = LobbyHandler()

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
    playerList = lobbyHandler.getLobby(io.get_session(sid)['lobbyCode']).getPlayerList()
    io.emit('playerList', playerList, room=sid)

@io.on('joinLobby')
def joinLobby(sid, data):
    userID = generateRandomString(10)
    with io.session(sid) as session:
        session['userID'] = userID
        session['lobbyCode'] = data['lobbyCode']
    io.emit('setID', {'userID' : userID, 'username' : data['username']}, room=sid)
    io.enter_room(sid, data['lobbyCode'])
    result = lobbyHandler.joinLobby(data['lobbyCode'], userID, data['username'])
    if(result == 200):
        io.emit('playerJoin', {'username' : data['username']}, room=data['lobbyCode'])
    io.emit('ack', {'type' : 'lobbyJoined', 'result' : result,'lobbyCode': data['lobbyCode']}, room=sid)

@io.on('createLobby')
def createLobby(sid, data):
    lobbyCode = generateRandomString(4)
    userID = generateRandomString(10)
    with io.session(sid) as session:
        session['userID'] = userID
        session['lobbyCode'] = lobbyCode
    io.enter_room(sid, lobbyCode)
    io.emit('setID', {'userID' : userID, 'username' : data['username']}, room=sid)
    lobbyHandler.createLobby(lobbyCode)
    result = lobbyHandler.joinLobby(lobbyCode, userID, data['username'])
    io.emit('ack', {'type' : 'lobbyCreated', 'result' : result,'lobbyCode': lobbyCode}, room=sid)

@io.on('auth')
def auth(sid, data):
    with io.session(sid) as session:
        session['userID'] = data['userID']
        session['lobbyCode'] = data['lobbyCode']
    io.enter_room(sid, data['lobbyCode'])
    if((not lobbyHandler.getLobby(data['lobbyCode']).getGameStarted()) and (data['page'] != 'lobby.html')):
        io.emit('redirect', {'page' : 'lobby.html'}, room=sid)

@io.on('requestInfo')
def requestInfo(sid, data):
    options = {
    'getPlayerList' : sendPlayerList
    }
    options[data['request']](sid)

@io.on('logout')
def logout(sid, data):
    lobbyHandler.getLobby(data['lobbyCode']).removePlayer(data['userID'])
# @io.on('disconnect')
# def disconnect(sid):
#     io.session_save()

@io.on('gameEvent')
def gameEvent(sid, data):
    if('lobbyCode' in io.get_session(sid)):
        lobbyCode = io.get_session(sid)['lobbyCode']
        userID = io.get_session(sid)['userID']
        io.emit('gameUpdate', lobbyHandler.getLobby(lobbyCode).processGameEvent(userID, data), room=lobbyCode)
    else:
        io.emit('error', {'errorType': 'Unknown lobbycode given in gameEvent'})

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 3000)), app)
