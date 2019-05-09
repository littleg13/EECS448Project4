# User Manual.

## Table of contents:

* [Installing on a new server](#Installing-on-a-new-server)
  * [Prerequisites](Prerequisites)
  *	[Installing server-side files](#Installing-server-side-files)
	* [Installing client-side files](#Installing-client-side-files)

* [Playing the game](#Playing-the-game)
	* [Splash screens](#Splash-screens)
	*	[Joining a lobby, creating a lobby and matchmaking](#Lobbies)
	* [Gameplay, controls and display](#Gameplay)

## Installing on a new server.
A user may play the game without installing any files by navigating to https://448.cuzzo.net. The following instructions, however, allow a user to install the game on their own web server.

### Prerequisites:
The game server is run on top of a traditional HTTP server, such as Apache or Nginx. The user should follow the installation instructions provided with whichever HTTP server they prefer for installation. Each server will configure a default root directory for the webhost and may be configured to use an alternative directory for the website hosting the game. This directory will be referred to as the “root directory” throughout this document.

A second server, written in Python, is necessary to run the game. In order for this server to work, the new server must have python3 installed along with a few extra modules. Python3 may be downloaded and installed by following the directions at the following web page:

https://www.python.org/download/releases/3.0/

Please make sure you install pip3, the Python Package Installer as well. More information on pip3 can be found at:

https://pip.pypa.io/en/stable/

Once these are installed, open either a terminal or a command line interface to install the necessary Python packages. The command to enter is:
```bash
		pip3 install numpy noise eventlet python-socketio
```

### Installing server-side files:

The contents of the folder `./server/python` may be located anywhere that the user may execute a script file from. This additional server runs on `port 3000` by default. This may be changed by editing the `./server/python/SocketServer.py` file at `line 201`, but it is best to use port-forwarding as certain ports, such as those below, and including, 1023 require elevated user privileges to be used. Port forwarding depends on your individual setup and cannot be covered here.

In case the user wishes to edit this port, the line to edit is shown below, with the port number highlighted:

![Screenshot]](/UserManualImages/ServerSocketEdit.PNG)

### Installing the client-side files:
Move the following files into this root directory, or a subdirectory of the root directory:

*	index.html
*	styles.css

As well as the following directories and their contents:
*	./images/*
*	./scripts/*

Such that you have the following sitemap:
*	path/to/project/
	* images/
		*	wild_oliva.png
	*	scripts/
		*	cards.js
		*	effects.js
		*	entity.js
		*	game.js
		*	icons.js
		*	main.js
		*	map.js
		*	render.js
		*	sidebar.js
		*	socket.io.js
		*	tank.js
  *	index.html
  *	styles.css

To configure the client-side code to connect to your new server, you must edit `./scripts/main.js` at the first line. Where it says:

![Screenshot](/UserManualImages/ClientSocketURLDefault.png)

Replace `https://448.cuzzo.net` with your `http://your.domain.net:xxxx`, where `xxxx` is your chosen port number. Example given below:

![Screenshot](/UserManualImages/ClientSocketURLEdit.png)

### Starting game server:

Once you have both the server-side and client-side installations complete, you will need to start the Python server. This may be done in the command line by navigating in a terminal or command line to the location of the `./sever/python/` directory and entering the command:
```bash
	> cd ./server/python/
	> ./SocketServer.py
```

To check that the installation is correct, and that your game server is up and running, navigate in a web browser to the your URL, such as:

`www.domain-name.net/path/to/project/index.html`

where `path/to/project/` is the relative path to the files from the root directory. If the additional Python3 server is not running, you will see the following screen:

![Screenshot](/UserManualImages/ConnectError.PNG)

Common issues include mismatching port numbers between client and server, as well as inadequate permissions on client-side files and directories. A web server running on a Linux-based operating system requires read and execution permissions for the directories your files are in and read permissions for the files that you want to serve. You can use the chmod command to edit file permissions within a Linux terminal. More information on chmod here:

https://ss64.com/bash/chmod.html

## Playing the game

### Splash Screens

At the initial splash screen (pictured below), you will be prompted to enter a username that will be displayed to all players in your game match. Click the “Enter Username” button to proceed.

![Screenshot](/UserManualImages/Splash1.PNG)

The second splash screen (pictured below), gives three options on how to join a specific game match, referred to as a lobby.

![Screenshot](/UserManualImages/Splash2.PNG)

### Lobbies

#### Find a Lobby

This option automatically matches players with 3 other players who also select this option. You’ll be immediately moved into a lobby, covered below.

#### Join a Lobby

If you have a friend you wish to play with, and you have their four-letter lobby code, select “Join a Lobby”. You’ll be brought to the following screen, where you will enter that four-letter lobby code. The server ignores lower- and upper-case distinctions.

![Screenshot](/UserManualImages/JoinLobby.PNG)

#### Create a Lobby

If you wish to start a game and then invite friends, select “Create a Lobby”. This will automatically redirect you to the Lobby page with a newly created Lobby, that can only be joined with the appropriate lobby code.

#### Lobby Page

The next page you will see is the lobby page. This page shows the current list of players in your game match, as well as prominently displaying the lobby code in case you wish to invite any further players. In the case that you created this game lobby, you will see the following screen:

![Screenshot](/UserManualImages/LobbyCreated.PNG)

Note that only the creator of a lobby can start the game, and that lobbies created with the “Find a Game” option will automatically begin once four players have been added. The lobby code in the above example is “OQIB” and will look the same and be found in the same place regardless of how you joined the lobby.

### Gameplay

A typical game will look like:

![Screenshot](/UserManualImages/NewGame.PNG)

In the upper left-hand side of the screen you will see a minimap of the current gameboard. On the right-hand side you see the player cards. At the bottom you see the chat box, currently out of view. In the bottom left, the Exit button allows you to leave the game at any time. In the center is the gameboard itself.

#### Righthand Sidebar

On the right-hand sidebar are the player cards. Your player card is always displayed at the top, with your spin and power sliders beneath it. The other players’ cards are displayed beneath those. The active player’s card will always be shown with a blue background and stick out slightly to the left. The red bar beneath each tank icon is that tank’s current health.
Gameboard and controls

#### Gameboard and controls
The gameboard is a 20 by 20 tile grid, where the outermost rows and columns are full of unbreakable wall tiles. The rest of the tiles are either wall or floor tiles, where each wall tile can be removed by hitting it with a bullet. Each player’s tank corresponds to the tank icon on their player card. When it is your turn, as it is in the screenshots above, you will see a yellow circle beneath your tank that shows the remaining amount of distance you can travel on your turn.

On your turn, you control your tank’s movement with the follow keys:

| Key | Action |
| --- | --- |
| Up Arrow | Move forward |
| Down Arrow | Move backward |
| Left Arrow | Turn counterclockwise |
| Right Arrow	| Turn clockwise |

You can end your turn by firing with the `spacebar`.

To reach other players’ tanks around corners, you can curve your bullets by adjust the spin and power of your shot. Spin determines the direction and how tightly your bullet will curve – negative spin meaning it’ll curve to the left of your tank, positive to the right – while power determines how far your bullet will go before it begins to curve – the more power, the longer before it curves. The power and spin sliders are controlled with the following keys:

| Key | Action |
| --- | --- |
| W | Increase power |
| S | Decrease power |
| A | Decrease spin (more to the left) |
| D | Increase spin (more to the right) |

Their current values are displayed below the sliders.

#### Powerups
Powerups spawn randomly across the board between turns. There are four powerups with the following effects:

| Name | Effect | Image |
| --- | --- | --- |
| Health pack | Restores your tank’s health by 20 | ![Screenshot](/UserManualImages/HealthPackPowerup.png) |
| Increased distance | Increases the amount of distance you’re able to move this turn by 5 tiles | ![Screenshot](/UserManualImages/DistancePowerup.png) |
| Multishot | Allows you to fire 3 times as many bullets at once. These powerups multiply one another. | ![Screenshot](/UserManualImages/MultishotPowerup.png) |
| Wall | Allows you to place a new wall tile in front of your tank this turn. They are placed by pressing the `E key` anytime during your turn. | ![Screenshot](/UserManualImages/WallPowerup.png) |

Health pack and increased distance powerups are used automatically, whereas the multishot powerups will be used when you fire to end your turn, and the wall powerups are used by pressing the `E key` anytime during your turn. Multishot and wall powerups are removed at the end of your turn no matter what.

#### Chat Box

The chat box allows players to send messages to one another. To open the chat box click the “Show Chat” tab. Messages will appear like so:

![Screenshot](/UserManualImages/ChatBox.PNG)

Your messages will be right-aligned and colored blue, while other players’ messages will be left-aligned and grey. The display name for the player is underneath the message’s text.
If your chat box is not visible and you receive a message, the “Show Chat” tab will turn red. You can hide the chat box again by clicking the “Hide Chat” tab.
