from Player import Player
from Lobby import Lobby

class LobbyHandler:
    def __init__(self):
        self.lobbyList = {}

    def createLobby(self, lobbyCode):
        self.lobbyList[lobbyCode] = Lobby(lobbyCode)
    def joinLobby(self, lobbyCode, userID, username):
        result = 0
        if(self.isLobby(lobbyCode)):
            lobby = self.lobbyList[lobbyCode]
            if(not lobby.getGameStarted()):
                lobby.appendPlayer(userID, Player(username))
                result = 200
            else:
                result = 1
        return result
    def getLobby(self, lobbyCode):
        return self.lobbyList[lobbyCode]
    def isLobby(self, lobbyCode):
        return(lobbyCode in self.lobbyList)
