import math
from datetime import datetime

class Lobby:
    def __init__(self, lobbyCode):
        self.gameStarted = False
        self.players = {}
        self.lobbyCode = lobbyCode
        print("Created Lobby with code: " + self.lobbyCode)
        self.order = []
        self.turn = 0

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
        if (self.gameStarted):
            return False
        else:
            self.gameStarted = True
            for playerID, playerObject in self.players.items():
                self.order.append(playerID)
            return True

    def getPlayersInfo(self):
        output = {}
        for playerID, playerObject in self.players.items():
            output[playerID] = playerObject.toDictionary()
        return output

    def processGameEvent(self, userID, data):
        player = self.players[userID]
        outboundData = {}
        # print("In processGameEvent. Data is: ")
        # print(data)
        if data['eventType'] == 'move':
            if userID == self.order[self.turn]:
                distance = math.sqrt((player.xPos-data['newPos'][0])**2 + (player.yPos-data['newPos'][1])**2)
                player.distanceLeft  -= distance
                if player.distanceLeft > 0:
                    player.xPos = data['newPos'][0]
                    player.yPos = data['newPos'][1]
                    outboundData['type'] = 'playerMove'
                    outboundData['userID'] = userID
                    outboundData['newPos'] = data['newPos']
                else:
                    print("no mas mover para ti")
            print("Moving ID: " + userID)
            print(data['newPos'])
            # Check that move is legal
            # Change player pos on server side
            # Return new data packet to be broadcast
            pass
        elif data['type'] == 'fire':
            print("Firing ID: " + userID);
            pass
