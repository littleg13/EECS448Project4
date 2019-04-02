let socket = io('http://localhost:3000');
let game = new Game(20);
let gameTickUpdateInt = setInterval(mainLoop, Math.floor(1000/32));
let sendServerUpdateInt = setInterval(sendServerUpdate, 40);
let myTurn = true;

socket.on('connect', function (data) {
  console.log("authing server")
  if(localStorage.userID){
    let url = window.location.pathname;
    url = url.substring(url.lastIndexOf('/')+1);
    socket.emit('auth', {userID : localStorage.userID, lobbyCode : localStorage.lobbyCode, page : url});
  }
});

socket.on('redirect', function (data) {
  window.location.href = data['page'];
});

socket.on('clearStorage', function (data) {
  localStorage.clear();
  window.location.href = 'index.html';
});

socket.on('gameUpdate', function (data) {
  switch(data['eventType']) {
    case 'playerMove':
      break;
    case 'playerFire':
      break;
    case 'newPlayerTurn':
      // myTurn = True;
      break;
  }
});

var handleKeyDown = function (evt) {
  if (myTurn) {
    game.keys[ evt.key ] = true;
  }
}

var handleKeyUp = function (evt) {
  if (myTurn) {
    game.keys[ evt.key ] = false;
  }
}

window.addEventListener('keydown', handleKeyDown, true);
window.addEventListener('keyup', handleKeyUp, true);
function mainLoop() {
  game.gameTick();
}

function sendServerUpdate() {
  if (myTurn && game.playerMoved()) {
    myPos = game.getPlayerPos();
    console.log(myPos);
    socket.emit('gameEvent', {type: 'move', newPos: myPos});
  }
}
