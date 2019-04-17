from Lobby import Lobby
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

    def createLobby(self, lobbyCode):
        self.lobbyList[lobbyCode] = Lobby(lobbyCode)

    def joinLobby(self, lobbyCode, userID, username):
        result = 0
        if(self.isLobby(lobbyCode)):
            lobby = self.lobbyList[lobbyCode]
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
            self.matchmakingLobbyCode = self.generateRandomString(4)
            self.createLobby(self.matchmakingLobbyCode)
        lobby = self.lobbyList[self.matchmakingLobbyCode]
        self.joinLobby(self.matchmakingLobbyCode, userID, username)
        if lobby.getNumberofPlayers() > 3:
            lobby.startGame()
            self.matchmakingLobbyCode = ""
        return self.matchmakingLobbyCode
