let socket = io('http://localhost:3000');
let game = new Game(20);
let gameTickUpdateInt = setInterval(mainLoop, Math.floor(1000/32));
let sendServerUpdateInt = setInterval(sendServerUpdate, 40);


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

socket.on('playerList', function (data) {
  console.log(data);
  if (game) {
    for(let userID in data) {
      let tank = data[userID]
      if(userID != localStorage.userID) {
        game.addTank(userID, tank['username'], tank['xPos'], tank['yPos'], tank['direction'], tank['distanceLeft'], tank['color'])
      }
      else{
        game.addTank(userID, tank['username'], tank['xPos'], tank['yPos'], tank['direction'], tank['distanceLeft'], tank['color'])
      }
    }
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

window.addEventListener('keydown', handleKeyDown, true);
window.addEventListener('keyup', handleKeyUp, true);
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
