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
    """Emits a message that contains the list of players

        Given the lobbyCode, this function generates a the entire list of players
        in a lobby

        Args:
            sid (string): Unique ID of every Websocket
            data (data): Dictionary of all of the data necessary to obtain the
                         list of players
        """
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

def sendMap(sid, data):
    io.emit('mapUpdate', {'map' : lobbyHandler.getLobby(io.get_session(sid)['lobbyCode']).getMap()}, room=sid)

@io.on('joinLobby')
def joinLobby(sid, data):
    """Adds a user to a lobby upon request

        Creates a user ID, and creates a socket connection between the server
        and the new user

        Args:
            sid (string): Unique ID of every Websocket
            data (data): Dictionary of all of the data necessary to add the user
        """
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
    """Creates a lobby upon user request

        Creates a lobby and populates it with the user that created the lobby,
        then emits a message with the lobby information

        Args:
            sid (string): Unique ID of every Websocket
            data (data): Dictionary of all of the data necessary to add the user
        """
    lobbyCode = generateRandomString(4)
    userID = generateRandomString(10)
    with io.session(sid) as session:
        session['userID'] = userID
        session['lobbyCode'] = lobbyCode
    io.enter_room(sid, lobbyCode)
    io.emit('setID', {'userID' : userID, 'username' : data['username']}, room=sid)
    lobbyHandler.createLobby(lobbyCode)
    result = lobbyHandler.joinLobby(lobbyCode, userID, data['username'])
    io.emit('moveToLobby', {'type' : 'lobbyCreated', 'result' : result, 'lobbyCode': lobbyCode}, room=sid)

@io.on('auth')
def auth(sid, data):
    """Checks to see if a user is already in a game, and sends them back to it

        This sends the player back to the page they belong in if they refresh
        during the game, or sends them back to the title screen if there is no
        game for them

        Args:
            sid (string): Unique ID of every Websocket
            data (data): Dictionary of all of the data necessary to add the user
        """
    with io.session(sid) as session:
        session['userID'] = data['userID']
        session['lobbyCode'] = data['lobbyCode']
    io.enter_room(sid, data['lobbyCode'])
    if (not lobbyHandler.isLobby(data['lobbyCode'])):
        io.emit('clearStorage', {}, room=data['lobbyCode'])
        return
    elif lobbyHandler.getLobby(data['lobbyCode']).getGameStarted():
        io.emit('gameStart', {}, room=sid)
    else:
        if (not lobbyHandler.getLobby(data['lobbyCode']).updateSeen(data['userID'])):
            pass

@io.on('requestInfo')
def requestInfo(sid, data):
    options = {
    'getPlayerList' : sendPlayerList,
    'getTurn' : sendTurn,
    'getMap' : sendMap
    }
    options[data['request']](sid, data)

@io.on('logout')
def logout(sid, data):
    lobbyHandler.getLobby(data['lobbyCode']).removePlayer(data['userID'])

@io.on('startGame')
def startGame(sid, data):
    lobbyCode = io.get_session(sid)['lobbyCode']
    lobbyHandler.getLobby(lobbyCode).startGame()
    io.emit('gameStart', {}, room=io.get_session(sid)['lobbyCode'])

@io.on('enterMatchmaking')
def enterMatchmaking(sid, data):
    userID = generateRandomString(10)
    lobbyCode = lobbyHandler.enterMatchmaking(userID, data['username'])
    with io.session(sid) as session:
        session['userID'] = userID
        session['lobbyCode'] = lobbyCode
    io.emit('setID', {'userID' : userID, 'username' : data['username']}, room=sid)
    io.enter_room(sid, lobbyCode)
    io.emit('playerJoin', {'username' : data['username']}, room=lobbyCode)
    io.emit('moveToLobby', {'type' : 'lobbyJoined', 'result' : '200','lobbyCode': lobbyCode}, room=sid)

@io.on('gameEvent')
def gameEvent(sid, data):
    """Updates the current state of the game on the server side.

        Calls processGameEvent, which returns the information needed to update
        the game accurately, and then emits a message to all the sockets(users)
        connected to a lobby with the updated game information

        Args:
            sid (string): Unique ID of every Websocket
            data (data): Dictionary of all of the data necessary to add the user
        """
    if('lobbyCode' in io.get_session(sid)):
        lobbyCode = io.get_session(sid)['lobbyCode']
        userID = io.get_session(sid)['userID']
        gameUpdate = lobbyHandler.getLobby(lobbyCode).processGameEvent(userID, data)
        io.emit('gameUpdate', gameUpdate , room=lobbyCode)
        if('eventType' in gameUpdate):
            if(gameUpdate['eventType'] == 'playerFire'):
                io.emit('gameUpdate', {'eventType' : 'advanceTurn', 'userID' :  lobbyHandler.getLobby(lobbyCode).getTurn()}, room=lobbyCode)
    else:
        io.emit('error', {'errorType': 'Unknown lobbycode given in gameEvent'},  room=lobbyCode)

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 3000)), app)
