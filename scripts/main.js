var socket = io( "http://" + ( window.location.hostname ) + ":3000" );
var wrapper = document.getElementById("wrapper");
var game = null;
var gameTickUpdateInt, sendServerUpdateInt;

wrapper.makeActive = ( id ) => {
  Array.from( wrapper.getElementsByTagName( "div" )).map( ( elem ) => {
    if( elem.id == id ) { elem.classList.add( "active" ) }
    else { elem.classList.remove( "active" ); }
  });
};

var pickUsername = () => {
  let name = document.getElementById( "username" ).value;
  if( name === "" ) { alert( "Name cannot be blank, please try again." ); return; }

  localStorage.setItem( "username", document.getElementById( "username" ).value.toUpperCase() );
  wrapper.makeActive( "splash2" );
};

var loadJoin = () => {
  wrapper.children.title.innerHTML = "Join a Lobby";
  wrapper.makeActive( "join" );
};

var createLobby = () => {
  let name = localStorage.getItem( "username" );
  socket.emit( "createLobby", { username : name.toUpperCase() } );

  wrapper.makeActive( "waiting" );
};

var joinLobby = () => {
  let lobbyCode = document.getElementById( "lobbyCode" ).value.toUpperCase();
  let name = localStorage.getItem( "username" );

  if( lobbyCode === "" ) { alert( "Lobby code cannot be blank!" ); return; }

  socket.emit( "joinLobby", { lobbyCode : lobbyCode, username: name } );
  wrapper.makeActive( "waiting" );
};

var startGame = () => {
  wrapper.makeActive( "waiting" );
  socket.emit( "startGame", {} );
};

var logout = () => {
  socket.emit( "logout", { lobbyCode : localStorage.getItem("lobbyCode"), userID : localStorage.getItem("userID") });
  localStorage.clear();
  window.location.reload();
};

var updateLists = () => {
  if( game === null ) return;

  var lobbyList = document.getElementById("lobbyList");
  lobbyList.innerHTML = "";
  for( userID in game.tanks ) {
    let newListItem = document.createElement( "li" );
    newListItem.innerHTML = game.tanks[ userID ].username;
    lobbyList.appendChild( newListItem );
  }
}

socket.on( "setID", (data) => {
  console.log( "Setting ID" );
  localStorage.setItem( "userID", data["userID"] );
  localStorage.setItem( "username", data["username"] );
})

socket.on( "moveToLobby", ( data ) => {
  if( data["type"] == "lobbyJoined" ) {
    if( data["result"] == 0 ) {
      alert( "The lobby you tried to join does not exist." );
      wrapper.makeActive( "join" );
      return;
    } else if( data["result"] == 1 ) {
      alert( "The lobby you tried to join has already started the game" );
      wrapper.makeActive( "join" );
      return;
    }
  }
  console.log( "Lobby created/joined: " + data );
  game = new Game( 20 );
  localStorage.setItem( "lobbyCode", data["lobbyCode"] );
  document.getElementById("lobbyName").innerHTML = data["lobbyCode"];
  wrapper.makeActive( "lobbyMenu" );
  socket.emit( "requestInfo", { request : "getPlayerList", fullInfo : true } );
});

socket.on( "playerList", function (data) {
  console.log(data);
  if (game) {
    for(let user in data) {
      let userData = data[user];
      game.addTank(user, userData['username'], userData['xPos'], userData['yPos'], userData['direction'], userData['distanceLeft'], userData['color']);
    }
  }
  updateLists();
});

socket.on( "playerJoin", ( data ) => {
  console.log( "Player Joined: " + data );
  socket.emit( "requestInfo", { request : "getPlayerList", fullInfo : true } );
});

socket.on( "gameStart" , ( data ) => {
  wrapper.makeActive( "game" );
  game.begin();
});

socket.on( "error", ( data ) => { console.log( data ); } );

socket.on('connect', function (data) {
  console.log("authing server")
  if(localStorage.userID) {
    let url = window.location.pathname;
    url = url.substring(url.lastIndexOf('/')+1);
    socket.emit('auth', {userID : localStorage.userID, lobbyCode : localStorage.lobbyCode, page : url});
    socket.emit('requestInfo', {request : 'getPlayerList', fullInfo : true});
    socket.emit('requestInfo', {request : 'getTurn'});
  }
});

socket.on('gameUpdate', function (data) {
  switch(data['eventType']) {
    case 'playerMove':
      if (localStorage.userID != data['userID']) {
        game.updateTankPosition(data['userID'], data['newPos'][0], data['newPos'][1], data['newDir'])
      }
      break;
    case 'playerFire':
      game.fire(data['userID'], 0, 0);
      break;
    case 'advanceTurn':
      game.advanceTurn(data['userID']);
      break;
  }
});

var handleKeyDown = function (evt) {
  if (game.turn == localStorage.userID) {
    game.keys[ evt.key ] = true;
  }
}

var handleKeyUp = function (evt) {
    game.keys[ evt.key ] = false;
}

function mainLoop() {
  game.gameTick();
}

function sendServerUpdate() {
  myTurn = game.turn == localStorage.userID;
  if(myTurn){
    if (game.playerMoved()) {
      myPos = game.getPlayerPos();
      myDir = game.getPlayerDir();
      game.resetLastMoved();
      socket.emit('gameEvent', {eventType: 'playerMove', newPos: myPos, newDir: myDir});
    }
    else if (game.getPlayerShot()) {
      socket.emit('gameEvent', {eventType: 'playerFire'});
      game.resetPlayerShot();
    }
  }
}
