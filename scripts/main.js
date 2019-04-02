let game = new Game(20);

let interval = setInterval(mainLoop, Math.floor(1000/32));

var handleKeyDown = function (evt) {
  game.keys[ evt.key ] = true;
}

var handleKeyUp = function (evt) {
  game.keys[ evt.key ] = false;
}
window.addEventListener('keydown', handleKeyDown, true);
window.addEventListener('keyup', handleKeyUp, true);
function mainLoop() {
  game.gameTick();
}
