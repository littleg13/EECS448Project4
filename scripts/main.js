// let socket = io("https://448.cuzzo.net");
let socket = io('http://localhost:3000')
var wrapper = document.getElementById("wrapper");
var game = null;
var gameTickUpdateInt, sendServerUpdateInt;

/**
  * A helper function that changes which div is visible in the main#wrapper
  * element.
  * @arg {string} id the id of the element to be displayed
  */
var makeActive = (id) => {
  Array.from(wrapper.getElementsByTagName("div")).map((elem) => {
    if(elem.id == id) {elem.classList.add("active")}
    else {elem.classList.remove("active");}
 });
};

/**
  * A helper function that handles user input for selecting a username. If input
  * is valid, the username will be set in localStorage.
  */
var pickUsername = () => {
  let name = document.getElementById("username").value;
  if(name === "") {alert("Name cannot be blank, please try again."); return;}

  localStorage.setItem("username", document.getElementById("username").value.toUpperCase());
  makeActive("splash2");
};

/**
  * A helper function that moves the user to the Join a Lobby screen.
  * This is called by a button in the splash2 view.
  */
var loadJoin = () => {
  wrapper.children.title.innerHTML = "Join a Lobby";
  makeActive("join")
};

/**
  * This emits a signal to the server that a new lobby is requested.
  * It changes the view to waiting.
  * It is called by a button on the splash2 view.
  */
var createLobby = () => {
  let name = localStorage.username;
  socket.emit("createLobby", {username : name.toUpperCase()});

  makeActive("waiting");
};

/**
  * A function that sends a signal to the server to be added to a lobby. The
  * lobby is specified by a 4 letter string in a text input on the join view.
  * It changes the view to waiting.
  * It is called by a button on the join view.
  */
var joinLobby = () => {
  let lobbyCode = document.getElementById("lobbyCode").value.toUpperCase();
  let name = localStorage.username;

  if(lobbyCode === "") {alert("Lobby code cannot be blank!"); return;}

  socket.emit("joinLobby", {lobbyCode : lobbyCode, username: name});
  makeActive("waiting");
};

/**
  * A function that sends a signal to the server to begin the game. It changes
  * the view to waiting.
  * It is called by a button on the lobbyMenu view.
  */
var startGame = () => {
  makeActive("waiting");
  socket.emit("startGame", {});
};

/**
  * A function that clears the localStorage and emits a signal to the server to
  * announce the user has left.
  * It is called by buttons on the lobbyMenu and game views.
  */
var logout = () => {
  socket.emit("logout", {lobbyCode : localStorage.lobbyCode, userID : localStorage.userID});
  localStorage.clear();
  window.location.reload();
};

/**
  * A function that signals the server to request the selected lobby's player
  * list. It sets the lobbyName element in the lobbyMenu view to the lobbyCode.
  * This is called by the moveToLobby socket handler.
  */
var setupLobbyMenu = () => {
  document.getElementById("lobbyName").innerHTML = localStorage.lobbyCode;
  socket.emit("requestInfo", {request : "getPlayerList", fullInfo : true});
};

/**
  * A function that creates &lt;li&gt; elements within the lobbyList &lt;ul&gt;
  * element in the lobbyMenu view. It is called by the "playerList" signal
  * socket signal handler.
  */
var updateLists = () => {
  if(game === null) return;

  var lobbyList = document.getElementById("lobbyList");
  lobbyList.innerHTML = "";
  for(userID in game.tanks) {
    let newListItem = document.createElement("li");
    newListItem.innerHTML = game.tanks[userID].username;
    lobbyList.appendChild(newListItem);
 }
};

/**
  * The event handler for the setID signal from the server. It sets the userID
  * as generated by the server. This is stored in localStorage.
  * @param {Object} data data packet received
  * @param {string} data.userID the assigned ID string for the player
  */
var setIDHandler = (data) => {
  localStorage.userID = data.userID;
};
socket.on("setID", setIDHandler);

/**
  * The event handler for the moveToLobby signal from the server. It determines
  * if the request to join or create a lobby was successful or not. If not, it
  * creates an alert with the relevant error message and returns user to the
  * join view. If the server signals success, the Game object is instantiated.
  * The lobbyCode is set in localStorage as sent by the server, the lobbyMenu
  * view is setup and made visible, and a request for the player list is sent.
  * @param {Object} data data packet received
  * @param {string} data.type A string that distinguishes between a successful
  * join and a successful create
  * @param {number} data.result a numeric error code for failure
  */
var moveToLobbyHandler = (data) => {
  if(data["type"] == "lobbyJoined") {
    if(data["result"] == 0) {
      alert("The lobby you tried to join does not exist.");
      makeActive("join");
      return;
    } else if(data["result"] == 1) {
      alert("The lobby you tried to join has already started the game");
      makeActive("join");
      return;
    }
  }

  game = new Game(20);
  localStorage.lobbyCode = data["lobbyCode"];
  setupLobbyMenu();
  makeActive("lobbyMenu");
  socket.emit("requestInfo", {request : "getPlayerList", fullInfo : true});
};
socket.on("moveToLobby", moveToLobbyHandler);

/**
  * The event handler for the playerList signal from the server. It stores the
  * list of players sent by the server into new Tank objects in the current
  * Game object. It then calls updateLists to update the lobbyMenu view.
  * @param {Object} data data packet received
  * @param {Object[]} data.users Associative array of player information. Ordered by
  * userIDs.
  */
var playerListHandler = (data) => {
  if(game) {
    for(let user in data) {
      let userData = data[user];
      game.addTank(user, userData['username'], userData['xPos'], userData['yPos'], userData['direction'], userData['distanceLeft'], userData['color'], userData['health']);
    }
  }
  updateLists();
};
socket.on("playerList", playerListHandler);

/**
  * The event handler for the playerJoin signal from the server. It prompts the
  * client to request the playerList to update the Game object.
  * @param {Object} data Data is disregarded as a request for the full list is then sent
  */
var playerJoinHandler = (data) => {
  socket.emit("requestInfo", {request : "getPlayerList", fullInfo : true});
};
socket.on("playerJoin", playerJoinHandler);

/**
  * The event handler for the gameStart signal from the server. The client sends
  * requsets to the server for the current turn and map. The view is switched
  * from the wrapper element to the div#game element which contains the canvas.
  * The Game object then has its startGame method called to begin rendering and
  * calling server updates.
  * @param {Object} data an empty data object. the server sends no information on gameStart
  */
var gameStartHandler = (data) => {
  socket.emit("requestInfo", {request : "getTurn"});
  socket.emit("requestInfo", {request : "getMap"});
  wrapper.style.display = "none";
  document.getElementById("game").style.display = "block";
  localStorage.gameActive = true;
  game.startGame();
};
socket.on("gameStart" , gameStartHandler);

/**
  * The event handler for the mapUpdate signal from the server. The received
  * map data is sent to the Game object to be stored.
  * @param {Object} data data packet received
  * @param {number[][]} data.map Array of integers that represents the current map
  */
var mapUpdateHandler = (data) => {
  game.updateMap(data.map);
};
socket.on("mapUpdate", mapUpdateHandler);

/**
  * The event handler for the socket connect signal. It detects if the user has
  * a set userID in localStorage before verifying if the server has matching
  * data through an auth request.
  * @param {Object} data data packet received
  * @param {string} data.userID string with unique userID
  * @param {string} data.lobbyCode string with lobbyCode
  */
var connectHandler = (data) => {
  if(localStorage.userID) {
    let url = window.location.pathname;
    url = url.substring(url.lastIndexOf("/")+1);
    socket.emit("auth", {userID : localStorage.userID, lobbyCode : localStorage.lobbyCode, page : url});
  }
};
socket.on("connect", connectHandler);

/**
  * The event handler for the clearStorage signal from the server. This allows
  * the server to prompt the client to clear localStorage. It causes the client
  * to reload the index page.
  * @param {Object} data Empty data packet. Server does not send data on clearStorage
  */
var clearStorageHandler = (data) => {
  localStorage.clear();
  window.location.href = "index.html";
};
socket.on("clearStorage", clearStorageHandler);

/**
  * The event handler for the gameUpdate signal from the server.
  * @param {Object} data
  * @param {string} data.eventType playerMove, playerFire or advanceTurn. Tells
  * client which event type to update for.
  */
var gameUpdateHandler = (data) => {
  switch(data["eventType"]) {
    case "playerMove":
      if(localStorage.userID != data["userID"]) {
        game.updateTankPosition(data["userID"],
                                data["newPos"][0], data["newPos"][1],
                                data["newDir"]);
      }
      break;
    case "playerFire":
      if(data.mapUpdate) {
        game.updateMap(data.mapUpdate);
      }
      else if (data.playerHit) {
        game.updateTankhealth(data.playerHit, data.newHealth)
        if(data.gameOver) {
          game.endGame(data.gameOver);
          delete localStorage.userID;
          delete localStorage.lobbyCode;
          clearInterval(sendServerUpdateInt);
          makeActive( "splash2" );
        }
      }
      if(data.userID == localStorage.userID) {
        game.resetPlayerShot();
      }
      game.fire(data["userID"], 5, .1, data.distance);
      break;
     case "advanceTurn":
      game.advanceTurn(data["userID"]);
      break;
  }
};
socket.on("gameUpdate", gameUpdateHandler);

/**
  * Event handler for key down events. It is attached to the window object.
  * Updates the global list of keys which is a boolean list indexed by key strings.
  * @param{Event} evt The event object which gives access to key information.
  */
var handleKeyDown = (evt) => {
  if (game.turn == localStorage.userID) {
    game.keys[ evt.key ] = true;
  }
}

/**
  * Event handler for key up events. It is attached to the window object.
  * Updates the global list of keys which is a boolean list indexed by key strings.
  * @param{Event} evt The event object which gives access to key information.
  */
var handleKeyUp = (evt) => {
  game.keys[ evt.key ] = false;
}


/**
  * Function that is set on an interval to regularly update the server if the
  * player's client has new information.
  */
function sendServerUpdate() {
  myTurn = game.turn == localStorage.userID;
  if(myTurn) {
    if(game.playerMoved()) {
      myPos = game.getPlayerPos();
      myDir = game.getPlayerDir();
      game.resetLastMoved();
      socket.emit("gameEvent", {eventType: "playerMove",
                                newPos: myPos,
                                newDir: myDir});
    }
    else if (game.getPlayerShot()) {
      socket.emit("gameEvent", {eventType: "playerFire"});
    }
  }
}

/**
  * Main function. It is run on window load to set user view to an appropriate
  * view depending on currently stored valid user information.
  */
var main = () => {
  if(!localStorage.username) {
    makeActive("splash");
    data = {};
 } else if(!localStorage.lobbyCode || !localStorage.userID) {
    makeActive("splash2");
 } else {
    handleResize();
    wrapper.style.display = "none";
    socket.emit("requestInfo", {request : "getPlayerList", fullInfo : true});
    socket.emit("requestInfo", {request : "getMap"});
    game = new Game(20);
 }
};

window.addEventListener("load", main);
