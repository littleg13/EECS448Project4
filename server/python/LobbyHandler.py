from Lobby import Lobby
from datetime import datetime
import random
import string

class LobbyHandler:
    """Central Spot to handle lobbies on the server

    Deals with creation of lobbies and players joining lobbies using the lobby
    code
    """
    def __init__(self):
        self.lobbyList = {}
        self.matchmakingLobbyCode = "";

    def generateRandomString(self, num):
        output = ""
        for i in range(num):
            letter = random.choice(string.ascii_uppercase)
            output += letter
        return output

    def createLobby(self):
        self.checkForDeadLobbies()
        codeToCheck = self.generateRandomString(4)
        while (codeToCheck in self.lobbyList.keys()):
            codeToCheck = self.generateRandomString(4)
        self.lobbyList[codeToCheck] = Lobby(codeToCheck)
        return codeToCheck

    def checkForDeadLobbies(self):
        lobbiesToDelete = []
        for lobbyCode, lobby in self.lobbyList.items():
            timeDiff = (datetime.now() - lobby.timeLobbyWasLastUsed).total_seconds()
            if (timeDiff > 30 or lobby.getNumberofPlayers() == 0):
                lobbiesToDelete.append(lobbyCode)
        for lobbyCode in lobbiesToDelete:
            del self.lobbyList[lobbyCode]

    def joinLobby(self, lobbyCode, userID, username):
        result = 0
        if(self.isLobby(lobbyCode)):
            lobby = self.lobbyList[lobbyCode]
            if (lobby.getNumberofPlayers() == 0):
                lobby.host = userID
            if(not lobby.getGameStarted()):
                lobby.appendPlayer(userID, username)
                result = 200
            else:
                result = 1
        return result

    def getLobby(self, lobbyCode):
        return self.lobbyList[lobbyCode]

    def isLobby(self, lobbyCode):
        return(lobbyCode in self.lobbyList)

    def enterMatchmaking(self, userID, username):
        if self.matchmakingLobbyCode == "":
            self.matchmakingLobbyCode = self.createLobby()
        lobby = self.lobbyList[self.matchmakingLobbyCode]
        self.joinLobby(self.matchmakingLobbyCode, userID, username)
        lobby.host = "matchmaking"
        gameStarted = False
        if lobby.getNumberofPlayers() > 3:
            gameStarted = True
            lobby.startGame("matchmaking")
            self.matchmakingLobbyCode = ""
        return {'lobbyCode': self.matchmakingLobbyCode, 'gameStarted': gameStarted}
