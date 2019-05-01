from LobbyHandler import LobbyHandler
from Lobby import Lobby
import random
import string

lobbyCode = ''
testLobbyHandler = LobbyHandler()

def generateRandomString(num):
    output = ""
    for i in range(num):
        letter = random.choice(string.ascii_uppercase)
        output += letter
    return output

def CreateLobby():
    try:
        lobbyCode = testLobbyHandler.createLobby()
        print('Lobby Code: ', lobbyCode )
        flag = True
    except:
        flag = False
    return flag

def JoinLobby():
    try:
        for i in range(0, 3):
            userID = generateRandomString(10)
            testLobbyHandler.joinLobby(lobbyCode, userID, "testUser"+str(i) )
        flag = True
    except:
        flag = False
    return flag

def Matchmaking():
    try:
        for i in range(0, 3):
            userID = generateRandomString(10)
            testLobbyHandler.enterMatchmaking(userID,"testUser"+str(i))
        flag = True
    except:
        flag = False
    return flag

def startGame():
    try:
        testLobby = Lobby(generateRandomString(4))
        userID = generateRandomString(10)
        testLobby.startGame(userID)
        flag = True
    except:
        flag = False
    return flag

def main():
    print("Connect to Server and Created Lobby: ")
    if(CreateLobby()):
        print("Passed")
    else:
        print("Failed")

    print("Populate Lobby with multiple players: ")
    if(JoinLobby()):
        print("Passed")
    else:
        print("Failed")

    print("Creates and populates matchmaking Lobby: ")
    if(Matchmaking()):
        print("Passed")
    else:
        print("Failed")

    print("Creates a game and starts it: ")
    if(startGame()):
        print("Passed")
    else:
        print("Failed")
main()
