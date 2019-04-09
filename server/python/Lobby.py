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
        self.map = []
        self.boardDimensions = 20
        self.colorList = ['blue', 'limeGreen', 'blueViolet', 'deepPink', 'darkOrange', 'gold', 'red', 'deepSkyBlue']
        self.blockSize = 30
        random.shuffle(self.colorList)
        self.initMap()

    def initMap(self):
        for i in range(0, self.boardDimensions):
            self.map.append([])
            for j in range(0, self.boardDimensions):
                if i is 0 or j is 0 or i is self.boardDimensions-1 or j is self.boardDimensions-1:
                    self.map[i].append(-1)
                else:
                    self.map[i].append(0)

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

    def removePlayer(self, userID):
        if(self.checkForPlayer(userID)):
            colorList += self.players[userID].color
            del self.players[userID]
            return True
        return False

    def updateSeen(self, userID):
        #self.players[userID].setLastSeen(datetime.now)
        pass

    def advanceTurn(self, numOfTurns):
        self.turn = (self.turn + numOfTurns) % len(self.order)
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
                    player.direction = data['newDir']%(math.pi * 2)
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
                collidedWith = self.checkBulletCollision(userID, player, 0, 0)
                turnsToAdvance = 1
                if(collidedWith is 'map'):
                    outboundData['mapUpdate'] = self.map
                elif(collidedWith != 'edge'):
                    newHealth = self.players[collidedWith].health - 20
                    if(newHealth <= 0):
                        newHealth = 0
                        print(collidedWith)
                        print(self.order)
                        self.order.remove(collidedWith)
                        if (len(self.order) == 1):
                            outboundData['gameOver'] = userID
                        turnsToAdvance = 0
                        self.players[collidedWith].alive = False
                    self.players[collidedWith].health = newHealth
                    outboundData['playerHit'] = collidedWith
                    outboundData['newHealth'] = newHealth
                self.advanceTurn(turnsToAdvance)
                outboundData['eventType'] = 'playerFire'
                outboundData['userID'] = userID
        print(outboundData)
        return outboundData

    def checkBulletCollision(self, userID, player, power, spin):
        print("Checking bullet collision for: " + userID)
        position = [player.xPos, player.yPos]
        increment = 0.1
        collided = False
        collidedWith = ''
        while(not collided):
            collidedPlayerUserID = self.isPositionInPlayerBounds(position)
            if collidedPlayerUserID and collidedPlayerUserID != userID:
                collidedWith = collidedPlayerUserID
                collided = True
            elif self.map[round(position[0])-1][round(position[1])-1] != 0:
                collided = True
                if(self.map[round(position[0])-1][round(position[1])-1] != -1):
                    self.map[round(position[0])-1][round(position[1])-1] -= 1
                    collidedWith = 'map'
                else:
                    collidedWith = 'edge'
            position[0] =  math.sin(player.direction)*increment + position[0];
            position[1] =  -math.cos(player.direction)*increment + position[1];
        return collidedWith

    def isPositionInPlayerBounds(self, position):
        for playerID in self.order:
            player = self.players[playerID]
            x = (position[0] - player.xPos)*math.sin(player.direction) + (position[1] - player.yPos)*math.cos(player.direction)
            y = (position[0] - player.xPos)*math.cos(player.direction) - (position[1] - player.yPos)*math.sin(player.direction)
            if -1/2 <= x <= 1/2:
                if -1/2 <= y <= 1/2:
                    return playerID
        return False
    # def checkBulletCollision(self, player):
    #     print("Bullet starting at: ")
    #     print(player.getPos())
    #     movementDirection = player.direction
    #     bulletPos = {'xPos': player.xPos, 'yPos': player.yPos}
    #     movementDirectionNorm = (math.pi / 2) - movementDirection
    #     print("X Delta: " + str(math.cos(movementDirectionNorm) * 1) + ". Y Delta: " + str(math.sin(movementDirectionNorm) * 1))
    #     # HARD CODED VALUES, LOOK INTO FINDING BOARD DEMENTIONS SOMEHOW
    #     while ((0 <= bulletPos['xPos'] <= 30) and (0 <= bulletPos['yPos'] <= 30)):
    #         bulletPos['xPos'] += math.cos(movementDirectionNorm) * 1
    #         bulletPos['xPos'] += math.sin(movementDirectionNorm) * 1
    #         print("Bullet still on board: ")
    #         print(bulletPos)
    #     print(bulletPos)
