class Player:
    def __init__(self, username):
        self.username = username
        self.lastSeen = 0
        self.xPos = 5
        self.yPos = 5
        self.distanceLeft = 5
        self.direction = 0
        self.color = 'black'
        self.health = 100
        self.alive = True
        print("Created player with name: " + self.username)

    def __str__(self):
        return self.username

    def getUserName(self):
        return self.username

    def setLastSeen(self, time):
        self.lastSeen = time

    def getLastSeen(self):
        return lastSeen

    def getPos(self):
        return {'xPos': self.xPos, 'yPos': self.yPos, 'direction': self.direction}

    def setColor(self, color):
        self.color = color
        print("Player with name " + self.username + " is now color: " + self.color)

    def resetDistance(self):
        self.distanceLeft = 5

    def toDictionary(self):
        output = {}
        output['username'] = self.username
        output['xPos'] = self.xPos
        output['yPos'] = self.yPos
        output['direction'] = self.direction
        output['distanceLeft'] = self.distanceLeft
        output['color'] = self.color
        return output
