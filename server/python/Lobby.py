class Lobby:
    def __init__(self, lobbyCode):
        self.gameState = 'none'
        self.players = {}
        self.lobbyCode = lobbyCode

    def appendPlayer(self, playerID, playerObject):
        self.players[playerID] = playerObject
        
    def checkForPlayer(self, playerID):
        return(playerID in self.players)
