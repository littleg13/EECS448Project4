const socket = io( "https://448.cuzzo.net" );
//const socket = io( "http://192.168.1.100:3000" );
var wrapper = document.getElementById( "wrapper" );
var title   = document.getElementById( "title" );
var game = null;
var gameTickUpdateInt, sendServerUpdateInt;
var error;

/**
  * A helper function that changes which div is visible in the main#wrapper
  * element.
  * @arg {string} the id of the element to be displayed
  */
var makeActive = ( id ) => {
  console.log( "Make " + id + " Active" );
  Array.from(wrapper.getElementsByTagName("div")).forEach((elem) => {
    if( elem.id == id ) elem.classList.add("active");
    else elem.classList.remove("active");
 });
};

/**
  * A helper function that handles user input for selecting a username. If input
  * is valid, the username will be set in localStorage.
  */
var pickUsername = () => {
  console.log( "Username Picked" );
  let name = document.getElementById("username").value.toUpperCase();
  if(name === "") { alert("Name cannot be blank, please try again."); return; }
  localStorage.username = name;
  makeActive( "splash2" );
};

var enterMatchmaking = () => {
  console.log( "Joining matchmaking" );
  socket.emit( "enterMatchmaking", { username : localStorage.username } );
  makeActive( "waiting" );
};

/**
  * A helper function that moves the user to the Join a Lobby screen.
  * This is called by a button in the splash2 view.
  */
var loadJoin = () => {
  console.log( "Load Join Page" );
  wrapper.children.title.innerHTML = "Join a Lobby";
  makeActive("join")
};

/**
  * This emits a signal to the server that a new lobby is requested.
  * It changes the view to waiting.
  * It is called by a button on the splash2 view.
  */
var createLobby = () => {
  console.log( "Send Create Lobby Request" );
  let name = localStorage.username;
  socket.emit("createLobby", { username : name.toUpperCase() } );
  makeActive("waiting");
};

/**
  * A function that sends a signal to the server to be added to a lobby. The
  * lobby is specified by a 4 letter string in a text input on the join view.
  * It changes the view to waiting.
  * It is called by a button on the join view.
  */
var joinLobby = () => {
  console.log( "Send Join Lobby Request" );
  let lobbyCode = document.getElementById("lobbyCode").value.toUpperCase();
  let name = localStorage.username;

  if(lobbyCode === "") {alert("Lobby code cannot be blank!"); return;}

  socket.emit("joinLobby", { lobbyCode : lobbyCode, username: name } );
  makeActive("waiting");
};

/**
  * A function that sends a signal to the server to begin the game. It changes
  * the view to waiting.
  * It is called by a button on the lobbyMenu view.
  */
var startGame = () => {
  console.log( "Waiting" );
  makeActive( "waiting" );
  socket.emit( "startGame", {} );
};

/**
  * A function that clears the localStorage and emits a signal to the server to
  * announce the user has left.
  * It is called by buttons on the lobbyMenu and game views.
  */
var logout = () => {
  console.log( "Logout" );
  socket.emit("logout", { lobbyCode : localStorage.lobbyCode, userID : localStorage.userID });
  localStorage.clear();
  window.location.reload();
};

var reattemptConnect = () => {
  if( socket.connected ) {
    console.log( "Cannot reattempt connection -> Already connected." );
    return;
  }
  console.log( "Reattemping connection" );
  title.style.display = "block";
  makeActive( "waiting" );
  socket.open();
}

/**
  * A function that signals the server to request the selected lobby's player
  * list. It sets the lobbyName element in the lobbyMenu view to the lobbyCode.
  * This is called by the moveToLobby socket handler.
  */
var setupLobbyMenu = () => {
  console.log( "Set up Lobby Menu" );
  document.getElementById('startGame').style.display = 'none';
  document.getElementById("lobbyName").innerHTML = localStorage.lobbyCode;
  socket.emit("requestInfo", {request : "getPlayerList", fullInfo : true});
  socket.emit("requestInfo", {request : "getHost"});
};

/**
  * A function that creates &lt;li&gt; elements within the lobbyList &lt;ul&gt;
  * element in the lobbyMenu view. It is called by the "playerList" signal
  * socket signal handler.
  */
var updateLists = () => {
  console.log( "Player List Update" );
  if( game === null ) return;
  var lobbyList = document.getElementById("lobbyList");
  lobbyList.innerHTML = "";
  game.tanks.map( ( player ) => {
    let newListItem = document.createElement( "li" );
    newListItem.innerHTML = player.playerName;
    lobbyList.appendChild( newListItem );
  });
};

/**
  * The event handler for the setID signal from the server. It sets the userID
  * as generated by the server. This is stored in localStorage.
  * @param {Object} data data packet received
  * @param {string} data.userID the assigned ID string for the player
  */
var setIDHandler = (data) => {
  console.log( "Set UserID: " + data.userID );
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
  console.log( "Moving to Lobby" );
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
  if( game ) {
    game.tanks = [];
    for( let user in data ) {
      let userData = data[user];
      let direction = userData[ "direction" ] * 180.0 / Math.PI;
      game.addTank( user,               userData['username'],
                    userData['xPos'],   userData['yPos'],
                    direction,          userData['distanceLeft'],
                    userData['color'],  userData['health'] );
    }
    game.populateSidebar();
  }
  updateLists();
};
socket.on( "playerList", playerListHandler );

/**
  * The event handler for the playerJoin signal from the server. It prompts the
  * client to request the playerList to update the Game object.
  * @param {Object} data Data is disregarded as a request for the full list is then sent
  */
var playerJoinHandler = (data) => {
  console.log( "Player Join Received" );
  console.log( data );
  socket.emit( "requestInfo", { request : "getPlayerList", fullInfo : true } );
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
  if( !game ) { game = new Game( 20 ); }
  window.addEventListener( "keydown", handleKeyDown, true );
  window.addEventListener( "keyup", handleKeyUp, true );
  socket.emit( "requestInfo", { request : "getPlayerList", fullInfo : true } );
  socket.emit( "requestInfo", { request : "getMap" } );
  socket.emit( "requestInfo", { request : "getTurn" } );
  wrapper.style.display = "none";
  document.getElementById("game").style.display = "block";
  handleResize();
  localStorage.gameActive = true;
};
socket.on("gameStart" , gameStartHandler);

var gameInProgressHandler = ( data ) => {
  game = new Game( 20 );
  window.addEventListener( "keydown", handleKeyDown, true );
  window.addEventListener( "keyup", handleKeyUp, true );
  socket.emit( "requestInfo", { request : "getPlayerList", fullInfo : true } );
  socket.emit( "requestInfo", { request : "getMap" } );
  socket.emit( "requestInfo", { request : "getTurn" } );
  socket.emit( "requestInfo", { request : "getPowerups" } );
  wrapper.style.display = "none";
  document.getElementById("game").style.display = "block";
  handleResize();
  localStorage.gameActive = true;
}
socket.on( "gameInProgress", gameInProgressHandler );
/**
  * The event handler for the mapUpdate signal from the server. The received
  * map data is sent to the Game object to be stored.
  * @param {Object} data data packet received
  * @param {number[][]} data.map Array of integers that represents the current map
  */
var mapUpdateHandler = (data) => {
  console.log( "Map Update Received" );
  let mapData = data.map.map( ( row ) => {
    return row.map( ( val ) => {
      return parseInt( val );
    } );
  } );
  game.updateMap( mapData );
};
socket.on("mapUpdate", mapUpdateHandler);

var powerupsOnMapHandler = (data) => {
  let parsedUpdate = [];
  for( let col in data.powerups ) {
    for( let row in data.powerups[col] ) {
      let type = data.powerups[col][row];
      parsedUpdate.push( { row : parseInt( row ), col : parseInt( col ), type : type } );
    }
  }
  game.updatePowerups( parsedUpdate );
};

socket.on("powerupsOnMap", powerupsOnMapHandler);

/**
  * The event handler for the socket connect signal. It detects if the user has
  * a set userID in localStorage before verifying if the server has matching
  * data through an auth request.
  * @param {Object} data data packet received
  * @param {string} data.userID string with unique userID
  * @param {string} data.lobbyCode string with lobbyCode
  */
var connectHandler = (data) => {
  console.log( "Socket connect." );
  if( localStorage.userID && localStorage.lobbyCode ) {
    console.log( "Socket connected. userID and lobbyCode detected." );
    let url = window.location.pathname;
    url = url.substring(url.lastIndexOf("/")+1);
    socket.emit("auth", {userID : localStorage.userID, lobbyCode : localStorage.lobbyCode, page : url});
  }
  main();
};
socket.on("connect", connectHandler);

var errorHandler = ( data ) => {
  document.getElementById( "title" ).style.display = "none";
  makeActive( "connect_error" );
  error = data;
  socket.close();
}
socket.io.on("connect_error", errorHandler );

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
        game.updateTankPosition( data["userID"],
                                 data["newPos"][0], data["newPos"][1],
                                 data["newDir"] );
      }
      if( data.playerPowerups ) {
        console.log( data.playerPowerups );
        game.updateTankPowerups( data.userID, data.playerPowerups );
        if( data.updateHealth ) {
          game.updateTankHealth( data.userID, data.updateHealth );
        }
        else if( data.updateMoveDistance ) {
          game.updateTankDistanceLeft( data.userID, data.updateMoveDistance );
        }
      }
      break;
    case "playerFire":
      if( data.gameOver ) {
        game.endGame( data.gameOver );
        document.getElementById( "game" ).style.display = "none";
        wrapper.style.display = "block";
        makeActive( "splash2" );
      }
      for( let i = 0; i < data.count; i++ ) {
        let shot = data[i];
        let bulletHit = shot.bulletHit;
        directionOffset = 0;
        if( data.count > 1 ) {
          directionOffset = 30 * ( ( i - Math.floor(data.count/2) ) /
                                         Math.floor(data.count/2) );
        }
        game.fire( data.userID, data.power, data.spin, shot.distance, bulletHit, directionOffset );
      }
      game.getPlayer(data.userID).clearPowerups()
      game.getPlayer(data.userID).canShoot = false;
      break;
     case "advanceTurn":
      game.updateTurn( data["userID"] );
      break;
    case "blockPlaced":
      row = data['mapUpdate'][0];
      col = data['mapUpdate'][1];
      game.placeWall( row, col );
      break;
  }
  if( data.powerupsOnMap ) {
    let parsedUpdate = [];
    for( let col in data.powerupsOnMap ) {
      for( let row in data.powerupsOnMap[col] ) {
        let type = data.powerupsOnMap[col][row];
        parsedUpdate.push( { row : parseInt( row ), col : parseInt( col ), type : type } );
      }
    }
    game.updatePowerups( parsedUpdate );
  }
};
socket.on("gameUpdate", gameUpdateHandler);

var checkIfHost = (data) => {
  if (data['host'] == localStorage.userID) {
    document.getElementById('startGame').style.display = 'block';
  }
};
socket.on("lobbyHost", checkIfHost)

/**
  * Event handler for key down events. It is attached to the window object.
  * Updates the global list of keys which is a boolean list indexed by key strings.
  * @param{Event} evt The event object which gives access to key information.
  */
var handleKeyDown = (evt) => {
  if( document.activeElement != document.body ) return;
  let spinInpt = document.getElementById( "spinSlider" );
  let spinDisp = document.getElementById( "spinDisplay" );
  let powrInpt = document.getElementById( "powerSlider" );
  let powrDisp = document.getElementById( "powerDisplay" );
  switch( evt.key ) {
    case "a":
      spinInpt.stepDown();
      spinDisp.value = spinInpt.value;
      return;
    case "d":
      spinInpt.stepUp();
      spinDisp.value = spinInpt.value;
      return;
    case "s":
      powrInpt.stepDown();
      powrDisp.value = powrInpt.value;
      return;
    case "w":
      powrInpt.stepUp();
      powrDisp.value = powrInpt.value;
      return;
    default:
      break;
  }

  if( game.curTurn == localStorage.userID ) {
    game.keys[ evt.key ] = true;
  }
}

/**
  * Event handler for key up events. It is attached to the window object.
  * Updates the global list of keys which is a boolean list indexed by key strings.
  * @param{Event} evt The event object which gives access to key information.
  */
  var handleKeyUp = (evt) => {
    if( document.activeElement.getAttribute( "id" ) == "textBox" ) {
      if( evt.key == "Enter" ) sendMsg();
    }
    else {
      game.keys[ evt.key ] = false;
    }
  }

/**
  * Function that is set on an interval to regularly update the server if the
  * player's client has new information.
  */
function sendServerUpdate() {
  myTurn = game.curTurn == localStorage.userID;
  if( myTurn ) {
    if( game.getPlayerMoved() ) {
      myPos = game.getPlayerPos();
      myDir = game.getPlayerDir() * Math.PI / 180.0;
      game.setPlayerMoved( false );
      socket.emit("gameEvent", { eventType: "playerMove",
                                 newPos: myPos,
                                 newDir: myDir } );
    } else if( game.getPlayerShot() ) {
      let finalTime = new Date();
      let powr = document.getElementById( "powerSlider" ).valueAsNumber;
      let spin = document.getElementById( "spinSlider" ).valueAsNumber;
      socket.emit( "gameEvent", { eventType: "playerFire", power: powr, spin: spin } );
      game.setPlayerShot( false );
    } else if( game.getBuildWall() ) {
      socket.emit("gameEvent", { eventType: "placeBlock"});
      game.setBuildWall();
    } // returns pair : { row : , col : }
  }
}

/**
  * Main function. It is run on window load to set user view to an appropriate
  * view depending on currently stored valid user information.
  */
var main = () => {
  handleResize();
  if(!localStorage.username) {
    makeActive("splash");
  } else if( !localStorage.lobbyCode || !localStorage.userID ) {
    makeActive("splash2");
  } else {
    wrapper.style.display = "none";
    document.getElementById("game").style.display = "block"
  }
};

var sendMsg = () => {
  let textbox = document.getElementById('textBox');
  let text = textbox.value;
  textbox.value = "";
  if( text.length > 0 ) {
    socket.emit( "sendMsg", { content: text } );
  }
};

var chatMsg = ( data ) => {
  console.log( data );
  let senderID = data["senderID"];
  let content = data["content"];
  if( !document.getElementById( "chatToggle" ).checked ) {
    document.getElementById( "chatHeader" ).classList.add( "newMessage" );
  }
  game.showMsg( senderID, content );
};
socket.on( "chatMsg", chatMsg );

var resetChatHeader = () => {
  let header = document.getElementById( "chatHeader" );
  if( header.innerHTML == "Show Chat" ) { header.innerHTML = "Hide Chat"; }
  else { header.innerHTML = "Show Chat"; }
  document.getElementById( "chatHeader" ).classList.remove( "newMessage" );
}

const delay = 100;
var resizeTaskId = null;

var handleResize = ( evt ) => {
  if( game === null ) return;
  let size = Math.min( window.innerWidth, window.innerHeight );
  let gameBody = document.getElementById( "gameBody" );
  gameBody.style.width = size + "px";
  gameBody.style.height = size + "px";
}

window.addEventListener("resize", (evt) => {
  if( resizeTaskId !== null ) {
    clearTimeout( resizeTaskId );
  }

  resizeTaskId = setTimeout( () => {
    resizeTaskId = null;
    handleResize( evt );
  }, delay);
});

setTimeout( handleResize, 500 );
