import math
import random
from datetime import datetime

class Lobby:
    def __init__(self, lobbyCode):
        self.gameStarted = False
        self.players = {}
        self.lobbyCode = lobbyCode
        print("Created Lobby with code: " + self.lobbyCode)
        self.order = []
        self.turn = 0
        self.colorList = ['blue', 'limeGreen', 'blueViolet', 'deepPink', 'darkOrange', 'gold', 'red', 'deepSkyBlue']
        random.shuffle(self.colorList)

    def appendPlayer(self, userID, playerObject):
        self.players[userID] = playerObject
        self.players[userID].setColor(self.colorList.pop())

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
            colorList += self.players[userID].color
            del self.players[userID]
            return True
        return False

    def updateSeen(self, userID):
        #self.players[userID].setLastSeen(datetime.now)
        pass
    def advanceTurn(self):
        self.turn = (self.turn + 1) % len(self.order)
        self.players[self.order[self.turn]].resetDistance()

    def getTurn(self):
        return self.order[self.turn]

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
        if userID == self.order[self.turn]:
            if data['eventType'] == 'playerMove':
                distance = math.sqrt((player.xPos-data['newPos'][0])**2 + (player.yPos-data['newPos'][1])**2)
                player.distanceLeft  -= distance
                if player.distanceLeft > 0:
                    player.xPos = data['newPos'][0]
                    player.yPos = data['newPos'][1]
                    player.direction = data['newDir']
                    outboundData['eventType'] = 'playerMove'
                    outboundData['userID'] = userID
                    outboundData['newPos'] = data['newPos']
                    outboundData['newDir'] = data['newDir']
                else:
                    print("no mas mover para ti")
                print("Moving ID: " + userID)
                print(data['newPos'])
            # Check that move is legal
            # Change player pos on server side
            # Return new data packet to be broadcast
            elif data['eventType'] == 'playerFire':
                self.advanceTurn()
                outboundData['eventType'] = 'playerFire'
                outboundData['userID'] = userID
        print(outboundData)
        return outboundData
