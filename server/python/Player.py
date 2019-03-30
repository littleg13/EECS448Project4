import json

class Player:
    def __init__(self, username):
        self.username = username
        print("Created player with name: " + self.username)

    def __str__(self):
        return self.username

    def getUserName(self):
        return self.username
