from datetime import datetime

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

    def updateSeen(self, userID):
        #self.players[userID].setLastSeen(datetime.now)
        pass

    def startGame(self):
        if (gameStarted):
            return False
        else:
            gameStarted = True
            return True

    def processGameEvent(self, userID, data):
        print("In processGameEvent. Data is: ")
        print(data)
        if data['type'] == 'move':
            print("Moving ID: " + userID)
            print(newPos)
            # Check that move is legal
            # Change player pos on server side
            # Return new data packet to be broadcast
            pass
        elif data['type'] == 'fire':
            print("Firing ID: " + userID);
            pass
