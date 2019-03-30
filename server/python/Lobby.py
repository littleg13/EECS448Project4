class Lobby:
    def __init__(self, lobbyCode):
        self.gameStarted = False
        self.players = {}
        self.lobbyCode = lobbyCode
        print("Created Lobby with code: " + self.lobbyCode)

    def appendPlayer(self, userID, playerObject):
        self.players[userID] = playerObject

    def checkForPlayer(self, userID):
        return(userID in self.players)

    def getPlayerByID(self, userID):
        return self.players[userID]

    def getLobbyCody(self):
        return self.lobbyCode

    def getPlayerList(self):
        output = []
        for playerID, playerObject in self.players.items():
            output.append(playerObject.username)
        return output

    def getGameStarted(self):
        return self.gameStarted

    def startGame(self):
        if(not self.gameStarted):
            self.gameStarted = True

    def removePlayer(self, userID):
        if(self.checkForPlayer(userID)):
            del self.players[userID]
            return True
        return False
