#!/usr/bin/env python3

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


def sendPlayerList(sid, data):
    fullInfo = data['fullInfo']
    playerList = None
    if fullInfo:
        playerList = lobbyHandler.getLobby(io.get_session(sid)['lobbyCode']).getPlayersInfo()
    else:
        playerList = lobbyHandler.getLobby(io.get_session(sid)['lobbyCode']).getPlayerList()
    io.emit('playerList', playerList, room=sid)

def sendTurn(sid, data):
    turn = lobbyHandler.getLobby(io.get_session(sid)['lobbyCode']).getTurn()
    io.emit('gameUpdate', {'eventType' : 'advanceTurn', 'userID' : turn}, room=sid)

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
    io.emit('moveToLobby', {'type' : 'lobbyJoined', 'result' : result,'lobbyCode': data['lobbyCode']}, room=sid)

@io.on('createLobby')
def createLobby(sid, data):
    print('fuck')
    lobbyCode = generateRandomString(4)
    userID = generateRandomString(10)
    with io.session(sid) as session:
        session['userID'] = userID
        session['lobbyCode'] = lobbyCode
    io.enter_room(sid, lobbyCode)
    io.emit('setID', {'userID' : userID, 'username' : data['username']}, room=sid)
    lobbyHandler.createLobby(lobbyCode)
    result = lobbyHandler.joinLobby(lobbyCode, userID, data['username'])
    io.emit('moveToLobby', {'type' : 'lobbyCreated', 'result' : result,'lobbyCode': lobbyCode}, room=sid)

@io.on('auth')
def auth(sid, data):
    with io.session(sid) as session:
        session['userID'] = data['userID']
        session['lobbyCode'] = data['lobbyCode']
    io.enter_room(sid, data['lobbyCode'])
    if (not lobbyHandler.isLobby(data['lobbyCode'])):
        io.emit('clearStorage', {}, room=data['lobbyCode'])
        return
    elif lobbyHandler.getLobby(data['lobbyCode']).getGameStarted():
        io.emit('gameStart', {}, room=data['lobbyCode'])
    else:
        if (not lobbyHandler.getLobby(data['lobbyCode']).updateSeen(data['userID'])):
            pass


@io.on('requestInfo')
def requestInfo(sid, data):
    options = {
    'getPlayerList' : sendPlayerList,
    'getTurn' : sendTurn
    }
    options[data['request']](sid, data)

@io.on('logout')
def logout(sid, data):
    lobbyHandler.getLobby(data['lobbyCode']).removePlayer(data['userID'])
# @io.on('disconnect')
# def disconnect(sid):
#     io.session_save()

@io.on('startGame')
def startGame(sid, data):
    lobbyCode = io.get_session(sid)['lobbyCode']
    lobbyHandler.getLobby(lobbyCode).startGame()
    io.emit('gameStart', {}, room=io.get_session(sid)['lobbyCode'])

@io.on('gameEvent')
def gameEvent(sid, data):
    print("Got game update. Type is: " + data['eventType'] + ".");
    if('lobbyCode' in io.get_session(sid)):
        print("Game update from player with active session")
        lobbyCode = io.get_session(sid)['lobbyCode']
        userID = io.get_session(sid)['userID']
        gameUpdate = lobbyHandler.getLobby(lobbyCode).processGameEvent(userID, data)
        io.emit('gameUpdate', gameUpdate , room=lobbyCode)
        if('eventType' in gameUpdate):
            if(gameUpdate['eventType'] == 'playerFire'):
                io.emit('gameUpdate', {'eventType' : 'advanceTurn', 'userID' :  lobbyHandler.getLobby(lobbyCode).getTurn()})
    else:
        print("Game update from player with no active session")
        io.emit('error', {'errorType': 'Unknown lobbycode given in gameEvent'})

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 3000)), app)
