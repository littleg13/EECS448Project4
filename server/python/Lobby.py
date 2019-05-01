import math
import random
from Player import Player
from datetime import datetime
import noise
import numpy as np

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
        self.spawnPosList = []
        self.powerUpSpawnList = []
        self.blockSize = 30
        self.powerupTypes = ['multiShot', 'buildWall', 'increaseMoveDist', 'healthPack']
        self.turnsSinceLastPowerupSpawn = 0
        self.powerups = {}
        self.addedPowerup = False
        self.initMap()
        random.shuffle(self.colorList)
        random.shuffle(self.spawnPosList)
        self.powerUpSpawnList = self.spawnPosList
        random.shuffle(self.powerUpSpawnList)

    def initMap(self):
        """Creates the Map

        Initializes values of the map array to create walls and borders

        Args:
            boardDimensions (int): Dimensions of the board
        """
        shape = (self.boardDimensions*25, self.boardDimensions*25)
        scale = 100.0
        octaves = 6
        persistence = 0.5
        lacunarity = 2.0
        world = np.zeros(shape)
        seed = random.randint(0,shape[0])
        for i in range(shape[0]):
            for j in range(shape[1]):
                world[i][j] = noise.pnoise2(i/scale,
                                            j/scale,
                                            octaves=octaves,
                                            persistence=persistence,
                                            lacunarity=lacunarity,
                                            repeatx=shape[0],
                                            repeaty=shape[0],
                                            base=seed)
        for i in range(0,self.boardDimensions):
            self.map.append([])
            for j in range(0,self.boardDimensions):
                if i is 0 or j is 0 or i is self.boardDimensions-1 or j is self.boardDimensions-1:
                    self.map[i].append(-1)
                else:
                    ratio = round(shape[0]/ (self.boardDimensions-2))
                    subset = world[(i-1)*ratio:i*ratio,(j-1)*ratio:j*ratio]
                    value = round((np.mean(subset)+1)/2 - 0.05)
                    self.map[i].append(value)
        for i in range(0,self.boardDimensions):
            for j in range(0,self.boardDimensions):
                if(self.map[i][j] == 0):
                    if(len(self.spawnPosList) == 0):
                        self.spawnPosList.append({'x': j, 'y': i})
                    else:
                        canPlace = True
                        for spawnPos in self.spawnPosList:
                            if(self.getDistance(j, spawnPos['x'], i, spawnPos['y']) <= 3):
                                canPlace = False
                                break
                        if(canPlace):
                            self.spawnPosList.append({'x': j, 'y': i})




    def getDistance(self,x1,x2,y1,y2):
        return math.sqrt(math.pow(x1-x2,2)+math.pow(y1-y2,2))

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
            self.colorList.append(self.players[userID].color)
            self.spawnPosList.append({'x': self.players[userID].xPos, 'y': self.players[userID].yPos})
            del self.players[userID]
            return True
        return False

    def updateSeen(self, userID):
        #self.players[userID].setLastSeen(datetime.now)
        pass

    def advanceTurn(self, numOfTurns):
        self.updatePowerups()
        self.turn = (self.turn + numOfTurns) % len(self.order)
        self.players[self.order[self.turn]].resetDistance()

    def updatePowerups(self):
        if(len(self.powerUpSpawnList) > 0):
            self.turnsSinceLastPowerupSpawn += 1
            if (random.random() < (self.turnsSinceLastPowerupSpawn * 0.2)): # Add powerup
                self.addedPowerup = True
                self.turnsSinceLastPowerupSpawn = 0
                pos = self.powerUpSpawnList.pop(0)
                while True:
                    pointTaken = False
                    for playerId, player in self.players.items():
                        if (math.floor(player.xPos + 0.5) == pos['x'] and math.floor(player.yPos + 0.5) == pos['y']):
                            pointTaken = True
                            break
                    if (pointTaken):
                        self.powerUpSpawnList.append(pos)
                        pos = self.powerUpSpawnList.pop(0)
                    else:
                        break
                if (pos['x'] not in self.powerups):
                    self.powerups[pos['x']] = {}
                self.powerups[pos['x']][pos['y']] = random.choice(self.powerupTypes)

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
            outboundData (dictionary): contains the updated information of the game
        """
        self.refreshLastUsedTime()
        player = self.players[userID]
        outboundData = {}
        if userID == self.order[self.turn]:
            if data['eventType'] == 'playerMove':
                outboundData['eventType'] = 'playerMove'
                outboundData['userID'] = userID
                distance = math.sqrt((player.xPos-data['newPos'][0])**2 + (player.yPos-data['newPos'][1])**2)
                player.distanceLeft = max(player.distanceLeft - distance, 0)
                print("Processing move with distanceLeft of: ", player.distanceLeft)
                print("Dir is: ", player.direction)
                player.direction = data['newDir']%(math.pi * 2)
                print("And is now: ", player.direction)
                outboundData['newDir'] = data['newDir']
                outboundData['newPos'] = [player.xPos, player.yPos]
                print("Is move fair?", player.distanceLeft > 0)
                if player.distanceLeft > 0:
                    player.xPos = data['newPos'][0]
                    player.yPos = data['newPos'][1]
                    outboundData['newPos'] = data['newPos']
                    if (self.checkForPowerupCollision(userID, player)):
                        if('healthPack' in player.powerups):
                            player.health = min(100, player.health + 20)
                            player.powerups.remove('healthPack')
                            outboundData['updateHealth'] = player.health
                        elif('increaseMoveDist' in player.powerups):
                            player.distanceLeft += 5
                            player.powerups.remove('increaseMoveDist')
                            outboundData['updateMoveDistance'] = player.distanceLeft
                        outboundData['playerPowerups'] = player.powerups
                        outboundData['powerupsOnMap'] = self.powerups
            elif data['eventType'] == 'playerFire':
                turnsToAdvance = 1
                count = int(math.pow(3,player.powerups.count('multiShot')))
                outboundData['count'] = count
                collisionData = {}
                for i in range(0, count):
                    outboundData[i] = {}
                    directionOffset = 0
                    if(count > 1):
                        directionOffset = ((i-math.floor(count/2))/math.floor(count/2)) * math.pi/6
                    collisionData[i] = self.checkBulletCollision(userID, player, data['power'], data['spin'], directionOffset)
                    if(collisionData[i][0] is 'map'):
                        outboundData['mapUpdate'] = self.map
                    elif(collisionData[i][0] != 'edge'):
                        newHealth = self.players[collisionData[i][0]].health - 20
                        if(newHealth <= 0):
                            newHealth = 0
                            self.order.remove(collisionData[i][0])
                            if (len(self.order) == 1):
                                outboundData['gameOver'] = userID
                            turnsToAdvance = 0
                            self.players[collisionData[i][0]].alive = False
                        self.players[collisionData[i][0]].health = newHealth
                        outboundData[i]['playerHit'] = collisionData[i][0]
                        outboundData[i]['newHealth'] = newHealth
                    self.advanceTurn(turnsToAdvance)
                    if (self.addedPowerup):
                        self.addedPowerup = False
                        outboundData['powerupsOnMap'] = self.powerups
                    outboundData[i]['xPos'] = collisionData[i][2]
                    outboundData[i]['yPos'] = collisionData[i][3]
                    outboundData[i]['distance'] = collisionData[i][1]
                outboundData['power'] = data['power']
                outboundData['spin'] = data['spin']
                outboundData['eventType'] = 'playerFire'
                outboundData['userID'] = userID
                player.powerups = []
                outboundData['powerups'] = player.powerups
            elif data['eventType'] == 'placeBlock':
                print("Player placed block")
                print(player.powerups)
                if 'buildWall' not in player.powerups:
                    return outboundData
                direction = player.direction
                xPos = player.xPos + 0.5 + 1.5 * math.sin( direction )
                yPos = player.yPos + 0.5 - 1.5 * math.cos( direction )
                col = math.floor( xPos )
                row = math.floor( yPos )
                if self.getDistanceToPlayer([col, row], player) > 3:
                    print("Place block failed due to being too far away.")
                    print("Player is at (", player.xPos, ", ", player.yPos, "). With direction: ", direction)
                    print("Tried to place at (", col, ", ", row, ").")
                    print("That distance is: ", self.getDistanceToPlayer([col, row], player))
                print("Attempting to place block at (", col, ", ", row, ").")
                print("Maps value there is: ", self.map[row][col])
                if (self.map[row][col] == 0):
                    self.map[row][col] = 1
                outboundData['eventType'] = 'blockPlaced'
                outboundData['mapUpdate'] = [ row, col ]
                print(outboundData)
        return outboundData

    def checkForPowerupCollision(self, userID, player):
        playerxPos = math.floor(player.xPos + 0.5)
        playeryPos = math.floor(player.yPos + 0.5)
        if (playerxPos in self.powerups):
            if (playeryPos in self.powerups[playerxPos]):
                player.powerups.append(self.powerups[playerxPos][playeryPos])
                self.powerUpSpawnList.append({'x': playerxPos, 'y': playeryPos})
                del self.powerups[playerxPos][playeryPos]
                return True
        return False

    def checkBulletCollision(self, userID, player, power, spin, directionOffset):
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
        direction = player.direction + directionOffset
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
        return [collidedWith, finalDistance, position[0]-math.sin(direction)*increment, position[1]+math.cos(direction)*increment]

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
