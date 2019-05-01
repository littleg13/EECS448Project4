from LobbyHandler import LobbyHandler
from Lobby import Lobby
import random
import string

output = open("testResults.txt", "w+")
print("***TESTING SESSION***\n")
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
        print('Lobby Code: ', lobbyCode , '\n')
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
        for i in range(0, 4):
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

def playerList():
    try:
        lobbyCode = testLobbyHandler.createLobby()
        for i in range(0, 4):
            userID = generateRandomString(10)
            testLobbyHandler.joinLobby(lobbyCode, userID, "testUser"+str(i) )
        print(testLobbyHandler.getLobby(lobbyCode).getPlayerList(), '\n')
        flag = True
    except:
        flag = False
    return flag

def removePlayer():
    try:
        lobbyCode = testLobbyHandler.createLobby()
        for i in range(0, 4):
            userID = generateRandomString(10)
            testLobbyHandler.joinLobby(lobbyCode, userID, "testUser"+str(i) )
        testLobbyHandler.getLobby(lobbyCode).removePlayer("testUser0")
        if( (len(testLobbyHandler.getLobby(lobbyCode).getPlayerList())) == 3):
            flag = False
        else:
            flag = True
    except:
        flag = False
    return flag

def processEvent():
    try:
        testLobby = Lobby(generateRandomString(4))
        userID = generateRandomString(10)

def main():
    print("Connect to Server and Create Lobby: ")
    if(CreateLobby()):
        print("Passed\n")
    else:
        print("Failed\n")

    print("Populate Lobby with multiple players: ")
    if(JoinLobby()):
        print("Passed\n")
    else:
        print("Failed\n")

    print("Create and populate matchmaking Lobby: ")
    if(Matchmaking()):
        print("Passed\n")
    else:
        print("Failed\n")

    print("Create a game and start it: ")
    if(startGame()):
        print("Passed\n")
    else:
        print("Failed\n")

    print("Create a game with 4 players and return player list: ")
    if(playerList()):
        print("Passed\n")
    else:
        print("Failed\n")

    print("Remove a player from a game: ")
    if(removePlayer()):
        print("Passed\n")
    else:
        print("Failed\n")

    print("Process Game Events ")
    if(processEvent()):
        print("Passed\n")
    else:
        print("Failed\n")

main()
output.close()
