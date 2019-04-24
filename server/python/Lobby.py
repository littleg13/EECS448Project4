import math
import random
from Player import Player
from datetime import datetime

class Lobby:
    """Collection of players and all of their interactions

    The lobby contains a dictionary of players, and handles all of the game logic,
    and game state information.

    Args:
        lobbyCode (string) : Code required to enter a particular lobby
    """
    def __init__(self, lobbyCode):
        self.timeLobbyWasLastUsed = datetime.now()
        self.host = ""
        self.gameStarted = False
        self.players = {}
        self.lobbyCode = lobbyCode
        self.order = []
        self.turn = 0
        self.map = []
        self.boardDimensions = 20
        self.colorList = ['blue', 'limeGreen', 'blueViolet', 'deepPink', 'darkOrange', 'gold', 'red', 'deepSkyBlue']
        self.spawnPosList = [{'x': 2, 'y': 3}, {'x': 5,'y': 5}, {'x': 9,'y': 4}, {'x': 9,'y': 15}, {'x': 4,'y': 10}, {'x': 15,'y': 10}, {'x': 2,'y': 16}, {'x': 17,'y': 3}, {'x': 10,'y': 10}]
        self.blockSize = 30
        random.shuffle(self.colorList)
        random.shuffle(self.spawnPosList)
        self.initMap()

    def initMap(self):
        """Creates the Map

        Initializes values of the map array to create walls and borders

        Args:
            boardDimensions (int): Dimensions of the board
        """
        for i in range(0, self.boardDimensions):
            self.map.append([])
            for j in range(0, self.boardDimensions):
                if i is 0 or j is 0 or i is self.boardDimensions-1 or j is self.boardDimensions-1:
                    self.map[i].append(-1)
                elif(((i is 4 or i is 15) and (4 <= j <=8 or 11 <= j <= 15)) or ((j is 4 or j is 15) and (4 <= i <=8 or 11 <= i <= 15)) ):
                    self.map[i].append(1)
                else:
                    self.map[i].append(0)

    def appendPlayer(self, userID, username):
        self.players[userID] = Player(username, self.spawnPosList.pop())
        self.players[userID].setColor(self.colorList.pop())

    def getMap(self):
        return self.map

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
            self.colorList += self.players[userID].color
            self.spawnPosList.append({'x': self.players[userID].xPos, 'y': self.players[userID].yPos})
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

    def getHost(self):
        return self.host

    def startGame(self, userID):
        if (self.gameStarted or userID != self.host):
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

    def refreshLastUsedTime(self):
        self.timeLobbyWasLastUsed = datetime.now()

    def processGameEvent(self, userID, data):
        """Handles Game Events

        Updates the information of every player after ones moves or fires

        Args:
            userID (string): Unique key generated for the player that performed
                             the action
            data (dictionary): contains the type of event, and all of the details
                               involved in that event.

        Returns:
            outBoundData (dictionary): contains the updated information of the game
        """
        self.refreshLastUsedTime()
        player = self.players[userID]
        outboundData = {}
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
            elif data['eventType'] == 'playerFire':
                collisionData = self.checkBulletCollision(userID, player, data['power'], data['spin'])
                turnsToAdvance = 1
                if(collisionData[0] is 'map'):
                    outboundData['mapUpdate'] = self.map
                elif(collisionData[0] != 'edge'):
                    newHealth = self.players[collisionData[0]].health - 20
                    if(newHealth <= 0):
                        newHealth = 0
                        self.order.remove(collisionData[0])
                        if (len(self.order) == 1):
                            outboundData['gameOver'] = userID
                        turnsToAdvance = 0
                        self.players[collisionData[0]].alive = False
                    self.players[collisionData[0]].health = newHealth
                    outboundData['playerHit'] = collisionData[0]
                    outboundData['newHealth'] = newHealth
                self.advanceTurn(turnsToAdvance)
                outboundData['distance'] = collisionData[1]
                outboundData['power'] = data['power']
                outboundData['spin'] = data['spin']
                outboundData['eventType'] = 'playerFire'
                outboundData['userID'] = userID
        return outboundData

    def checkBulletCollision(self, userID, player, power, spin):
        """Handles the collision of bullets

        Checks if the bullet will collide with either a wall or a player, and
        generates updated game information

        Args:
            userID (string): Unique key generated for the player that fired
            player (object): The entire player object of the player that fired
            power (int) : Power of the projectile fired(set to
                          zero in first release)
            spin (int) : Spin of the projectile fired(set to zero in first release)

        Returns:
            array [string, float]: first element is the ID of the player that was collided with,
                 or false if there was no collision. Second element is the
                 distance from the player who shot to whatever it collided with

        """
        position = [player.xPos + 0.5, player.yPos + 0.5]
        direction = player.direction
        spin = spin/5
        increment = 0.1
        collided = False
        collidedWith = ''
        finalDistance = 0
        while(not collided):
            collidedPlayerUserID = self.isPositionInPlayerBounds(position)
            if collidedPlayerUserID and collidedPlayerUserID != userID:
                collidedWith = collidedPlayerUserID
                collided = True
            elif self.map[math.floor(position[1])][math.floor(position[0])] != 0:
                collided = True
                if(self.map[math.floor(position[1])][math.floor(position[0])] != -1):
                    self.map[math.floor(position[1])][math.floor(position[0])] -= 1
                    collidedWith = 'map'
                else:
                    collidedWith = 'edge'
            position[0] =  math.sin(direction)*increment + position[0]
            position[1] =  -math.cos(direction)*increment + position[1]
            finalDistance += increment
            direction += max(0, finalDistance - power) * spin*math.pi/(180)

            if(abs(player.direction - direction) >= 3/4 * 2*math.pi):
                collided = True
                collidedWith = 'edge'
        return [collidedWith, finalDistance]

    def getDistanceToPlayer(self, position, player):
        return math.sqrt(math.pow(position[0] - (player.xPos + 0.5), 2) + math.pow(position[1] - (player.yPos+0.5), 2))

    def isPositionInPlayerBounds(self, position):
        """Checks to see if the given position is inside another player

        Checks to see if the position will result in a collision between the
        object at the position, and any player on the board

        Args:
            position (arrray): Contains the x and y coordinates of the object
                               given

        Returns:
            playerID (string) : returns the player ID of the player that
                                experienced the collision, or false if there was
                                no collision.

        """
        for playerID in self.order:
            player = self.players[playerID]
            x = (position[0] - (player.xPos + 0.5))*math.sin(player.direction) + (position[1] - (player.yPos + 0.5))*math.cos(player.direction)
            y = (position[0] - (player.xPos + 0.5))*math.cos(player.direction) - (position[1] - (player.yPos + 0.5))*math.sin(player.direction)
            if -1/2 <= x <= 1/2:
                if -1/2 <= y <= 1/2:
                    return playerID
        return False

    def getNumberofPlayers(self):
        return len(self.players)
