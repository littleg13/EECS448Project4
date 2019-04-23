/**
* @class Holds the Game's state data
* @param {number} mapDim the size of the gameboard
  */
class Game {
  constructor(mapDim) {
    /**
     * HTML5 Canvas 2D context
     */
    this.ctx;
    /**
      * 2D array of numbers to represent the map
      */
    this.map = [];
    this.mapDim = mapDim;
    /**
      * Float that contains the current scale for display on small screens
      */
    this.scale;
    /**
      * Associative array of user data by userID
      */
    this.tanks = {};
    /**
      * UserID of player whose turn it currently is
      */
    this.turn = '';
    /**
      * Distance in tiles for a user before end of turn
      */
    this.distLeftThisTurn = 5;
    this.gridBoxDim = 40;
    /**
      * Normalized tile size for render calls
      */
    this.geometryDim = 40;
    /**
      * List of bullet objects currently active to render.
      */
    this.bullets = [];
    /**
      * List of keys with their current state (true for pressed, false for not)
      */
    this.keys = [];

    this.keyTimes = {}
    /**
      * Bool that records whether or not a transmit to server is needed
      */
    this.movedSinceLastTransmit = false;
    /**
      * Bool that records if player has fired on their turn
      */
    this.playerShot = false;
    /**
      * Bool for if game has started
      */
    this.begun = false;
    /**
      * Bool for if game has been won.
      */
    this.won = false;

    this.gameUpdate = {}

    this.initCanvas();
  }

  /**
    * Attaches event handlers for key strokes and begins method call intervals.
    */
  startGame() {
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    gameTickUpdateInt = setInterval(mainLoop, Math.floor(1000/32));
    sendServerUpdateInt = setInterval(sendServerUpdate, 40);
    this.begun = true;
  }

  /**
    * Prepares canvas element for rendering and sets properties needed for rendering
    */
  initCanvas() {
    this.canvas = document.getElementById('canvas');
    this.width = canvas.width;
    this.height = canvas.height;
    this.gridBoxDim = this.width / this.mapDim;
    this.scale = this.gridBoxDim / this.geometryDim;
    this.ctx = canvas.getContext('2d');
  }

  /**
    * Draws the background for the game.
    */
  renderMap() {
    this.ctx.save();
    this.ctx.fillStyle = "#906030";
    this.ctx.scale( this.scale, this.scale );
    this.ctx.fillRect( 0, 0, this.geometryDim * this.mapDim, this.geometryDim * this.mapDim );
    let tank = this.tanks[ localStorage.userID ];
    if( this.turn == localStorage.userID && tank.distanceLeft > 0 ) {
      this.ctx.beginPath();
      this.ctx.arc( ( tank.xPos + 0.5 ) * this.geometryDim,
                    ( tank.yPos + 0.5 ) * this.geometryDim,
                    ( tank.distanceLeft + 0.5 ) * this.geometryDim,
                    0, Math.PI * 2 );
      this.ctx.fillStyle = 'rgba( 238, 255, 0, 0.5 )';
      this.ctx.fill();
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
    }
    for( let row = 0; row < this.map.length; row++ ) {
      for( let col = 0; col < this.map[row].length; col++ ) {
        this.ctx.save();
        this.ctx.translate( col * this.geometryDim, row * this.geometryDim, this.geometryDim, this.geometryDim );
        if( this.map[row][col] != -0 ) {
          this.ctx.fillStyle = "#000000";
          this.ctx.fillRect( 0, 0, 40, 40 );
          this.ctx.fillStyle = "#C0C0C0";
          this.ctx.fillRect(  1,  2, 18, 7 );
          this.ctx.fillRect( 21,  2, 18, 7 );
          this.ctx.fillStyle = "#A0A0A0";
          this.ctx.fillRect(  1, 11,  8, 7 );
          this.ctx.fillRect( 11, 11, 18, 7 );
          this.ctx.fillRect( 31, 11,  8, 7 );
          this.ctx.fillStyle = "#909090";
          this.ctx.fillRect(  1, 20, 18, 7 );
          this.ctx.fillRect( 21, 20, 18, 7 );
          this.ctx.fillStyle = "#606060";
          this.ctx.fillRect(  1, 29,  8, 7 );
          this.ctx.fillRect( 11, 29, 18, 7 );
          this.ctx.fillRect( 31, 29,  8, 7 );
        }
        this.ctx.restore();
      }
    }
    this.ctx.restore();
  }

  /**
    * Sets the stored map to the passed array.
    * @param {number[][]} map 2D numerical array representing the map.
    */
  updateMap(map) {
    this.map = map
  }

  updateGameElements(){
    if(this.gameUpdate.health){
      this.updateTankhealth(this.gameUpdate.health[0], this.gameUpdate.health[1]);
    }
    if(this.gameUpdate.map){
      console.log(this.gameUpdate.map)
      game.updateMap(this.gameUpdate.map);
    }
    if(this.gameUpdate.advanceTurn){
      this.advanceTurn(this.gameUpdate.advanceTurn);
    }
    if(this.gameUpdate.gameOver){
      this.endGame(this.gameUpdate.gameOver);
      delete localStorage.userID;
      delete localStorage.lobbyCode;
    }
  }
  /**
    * Adds tank with passed properties to tanks list.
    * @param {string} userID used to uniquely identify a player
    * @param {string} username the displayed username for the player
    * @param {number} xPos the horizontal position of the player
    * @param {number} yPos the vertical position of the player
    * @param {number} direction the direction in radians of the player
    * @param {number} distanceLeft the distance the player may move remaining this turn
    * @param {string} color the color to render the player in
    * @param {number} health the health of the player
    */
  addTank(userID, username, xPos, yPos, direction, distanceLeft, color, health) {
    this.tanks[userID] = new Tank(username, xPos, yPos, direction, distanceLeft, color, health);
  }

  updateTankPosition(userID, newXPos, newYPos, newDirection) {
    this.tanks[userID].xPos = newXPos;
    this.tanks[userID].yPos = newYPos;
    this.tanks[userID].direction = newDirection;
  }

  updateTankhealth(userID, newHealth) {
    if( newHealth == 0 ) {
      this.killTank( userID );
    }
    let playerIcon = document.getElementById( "display-" + userID );
    this.tanks[userID].health = newHealth;
  }

  killTank( userID ) {
    this.tanks[userID].alive = false;
  }

  renderTanks() {
    for( let key in this.tanks ) {
      let tank = this.tanks[key];
      if (tank.alive) {
        this.renderTank( key, tank );
      }
    }
  }

  populateSidebar() {
    let userInfoDiv = document.getElementById('userInfo');
    let lobbyInfoDiv = document.getElementById('lobbyInfo');
    for(let userID in this.tanks){
      let tank = this.tanks[userID];
      if(document.getElementById('info'+userID) === null){
        let cardDiv = this.makePlayerCardDiv(userID, tank.username, tank.color)
        if(userID == localStorage.userID){
          userInfoDiv.appendChild(cardDiv);
        }
        else{
          lobbyInfoDiv.appendChild(cardDiv);
        }
      }
    }
  }

  makePlayerCardDiv(userID, username, color) {
    let cardDiv = document.createElement('div');
    cardDiv.classList.add('playerCard');
    cardDiv.setAttribute('id', 'info'+userID);
    let usernameDiv = document.createElement('div');
    usernameDiv.classList.add('username');
    usernameDiv.innerHTML = username;
    let healthDiv = document.createElement('div');
    healthDiv.classList.add('tankHealth');
    healthDiv.innerHTML = '100/100';
    let colorDiv = document.createElement('div');
    colorDiv.classList.add('tankColor');
    colorDiv.innerHTML = 'Color: '
    let swatch = document.createElement('div');
    swatch.classList.add('colorSwatch');
    swatch.style.backgroundColor = color;
    colorDiv.appendChild(swatch);
    cardDiv.appendChild(usernameDiv);
    cardDiv.appendChild(healthDiv);
    cardDiv.appendChild(colorDiv);
    return cardDiv;
  }

  updateSidebar() {

  }

  renderTank(userID, tank) {
    this.ctx.save();
    this.ctx.scale( this.scale, this.scale );
    this.ctx.translate( this.geometryDim * (tank.xPos + 0.5), this.geometryDim * (tank.yPos + 0.5) );

    // Health bar and username text
    this.ctx.fillStyle = "black";
    this.ctx.font = "15px Arial";
    this.ctx.fillText( tank.username, - this.geometryDim / 2, 40);
    this.ctx.fillRect( - this.geometryDim / 2, this.geometryDim + 10, this.geometryDim, 10 );
    this.ctx.fillStyle = tank.color;
    this.ctx.fillRect( - this.geometryDim / 2 + 2, this.geometryDim + 12, ( this.geometryDim - 4 ) * ( tank.health / 100 ), 6 );

    // Tank icon, rotation for direction
    this.ctx.rotate( tank.direction );

    this.ctx.fillStyle = 'black';
    this.ctx.fillRect( -17, -17, 34, 34 );
    this.ctx.fillRect( 5, -15, 10, 30 );
    this.ctx.fillStyle = 'grey';
    this.ctx.fillRect( -15, -15, 10, 30 );
    this.ctx.fillRect( 5, -15, 10, 30 );
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect( -7.5, -22, 15, 39 );
    this.ctx.fillStyle = tank.color;
    this.ctx.fillRect( -5.5, -20, 11, 35 );
    this.ctx.restore();
  }

  renderBullets() {
    this.ctx.save();
    this.ctx.scale( this.scale, this.scale );
    for(let i = 0; i < this.bullets.length; i++) {
      let bullet = this.bullets[i];
      bullet.xPos += Math.sin( bullet.direction ) * 0.5;
      bullet.yPos -= Math.cos( bullet.direction ) * 0.5;
      bullet.distanceTraveled += 0.5;
      if(bullet.distanceTraveled <= bullet.distanceToTravel){
        this.ctx.save();
        this.ctx.fillStyle = 'grey';
        this.ctx.strokeStyle = 'black';
        this.ctx.translate( (bullet.xPos + 0.5) * this.geometryDim, (bullet.yPos + 0.5) * this.geometryDim );
        this.ctx.rotate( bullet.direction );
        this.ctx.beginPath();
        this.ctx.moveTo( -5,  5 );
        this.ctx.lineTo(  5,  5 );
        this.ctx.lineTo(  5, -10 );
        this.ctx.arc( 0, -10, 5, 0, Math.PI, true );
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = '#303030';
        this.ctx.fillRect( -4, 2, 8, 2 );
        this.ctx.restore();
      }
      else{
        this.bullets.pop(i);
        if(this.bullets.length == 0){
          this.updateGameElements();
        }
      }
      bullet.direction += Math.max(0, bullet.distanceTraveled - bullet.power) * bullet.curve*Math.PI/(180);

    }


    this.ctx.restore();
  }

  fire(shooterID, power, curve, dist) {
    let shooter = this.tanks[shooterID];
    if(shooter.canShoot){
      var proj = { xPos: shooter.xPos,
                   yPos: shooter.yPos,
                   direction: shooter.direction,
                   distanceToTravel: dist, distanceTraveled: 0,
                   power: power,
                   curve: curve};
      this.bullets.push(proj);
      this.tanks[shooterID].canShoot = false;
    }
  }

  /**
    *
    */
  checkMapCollision(obj, linearVelocity, rotationalVelocity) {
    let increment = -linearVelocity;
    let map = this.map;
    // Straight distance between center of "Tank" corner of "Tank"
    let dimension = obj.size/(2*this.geometryDim);
    let toReturn = true;
    let canvas = this.ctx;
    let corners = [[dimension, dimension+increment],
      [dimension, -dimension+increment],
      [-dimension, dimension+increment],
      [-dimension, -dimension+increment]];
    corners.forEach(function(corner) {
      let x = (corner[0])*Math.cos(obj.direction + rotationalVelocity) - (corner[1])*Math.sin(obj.direction + rotationalVelocity);
      let y = (corner[0])*Math.sin(obj.direction + rotationalVelocity) + (corner[1])*Math.cos(obj.direction + rotationalVelocity);
      x += obj.xPos;
      y += obj.yPos;
      // canvas.fillStyle = 'red';
      // canvas.fillRect((x+0.45)*30, (y+0.45)*30, 3, 3);

      x = Math.round(x);
      y = Math.round(y);
      if(map[y][x] != 0){
        toReturn = corner;
        return;
      }
    });
    return(toReturn);
  }

  /**
    * Process the current input state if it is the users turn.
    */
  processInput() {
    let player = this.tanks[localStorage.userID];
    if( this.turn != localStorage.userID ) return;
    if( this.keys["ArrowLeft"] || this.keys["A"] ) {
      if(this.checkMapCollision(player, 0, -0.1) == true) {
        player.direction -= 0.1;
        this.movedSinceLastTransmit = true;
      }
    }
    if( this.keys["ArrowRight"] || this.keys["D"] ) {
      if(this.checkMapCollision(player, 0, 0.1) == true) {
        player.direction += 0.1;
        this.movedSinceLastTransmit = true;
      }
    }
    if( this.keys[" "] ) {
      if( player.canShoot && !this.playerShot ){
        this.playerShot = true;
      }
      this.keys[" "] = false
    }

    if( player.distanceLeft <= 0 ) return;                // Cancel if no more moving
    let deltaPos = Math.min( player.distanceLeft, 0.1 );  // Constrain movement w/in dist limit

    if( this.keys["ArrowUp"] || this.keys["W"] ) {
      if(this.checkMapCollision(player, 0.1, 0) == true) {
        player.xPos += Math.sin( player.direction ) * deltaPos;
        player.yPos -= Math.cos( player.direction ) * deltaPos;
        player.distanceLeft -= deltaPos;
        this.movedSinceLastTransmit = true;
      }
    }
    if( this.keys["ArrowDown"] || this.keys["S"] ) {
      if(this.checkMapCollision(player, -0.1, 0) == true) {
        player.xPos -= Math.sin( player.direction ) * deltaPos;
        player.yPos += Math.cos( player.direction ) * deltaPos;
        player.distanceLeft -= deltaPos;
        this.movedSinceLastTransmit = true;
      }
    }
    player.distanceLeft = Math.max( 0.0, player.distanceLeft );
  }

  recordKeyPress(key){
    if(!game.keys['spaceDown']){
      this.keyTimes[key] = new Date();
      game.keys['spaceDown'] = true;
    }
  }

  /**
    * A function that contains the rendering and processing calls for each frame.
    */
  gameTick() {
    this.renderMap();
    this.renderTanks();
    this.processInput();
    this.renderBullets();
  }

  /**
    * Sets the current turn to the given user
    * @param {string} userID the unique userID of the given player
    */
  advanceTurn(userID) {
    this.tanks[userID].canShoot = true;
    if(this.turn != ''){
      this.tanks[userID].distanceLeft = 5;
    }
    this.turn = userID;
    document.getElementById('turn').innerHTML = 'Turn: ' + this.tanks[userID].username;
  }

  /**
    * A getter for this.movedSinceLastTransmit
    * @return {bool} this.movedSinceLastTransmit
    */
  playerMoved() {
    return this.movedSinceLastTransmit;
  }

  /**
    * A getter for this.playerShot
    * @return {bool} this.playerShot
    */
  getPlayerShot() {
    return this.playerShot;
  }

  /**
    * A setter for this.playerShot
    */
  resetPlayerShot() {
    this.playerShot = false;
  }

  /**
    * A getter for [this.xPos, this.yPos]
    * @return {number[]} player position in [x, y] format
    */
  getPlayerPos() {
    return [this.tanks[localStorage.userID].xPos, this.tanks[localStorage.userID].yPos];
  }

  /**
    * A getter for this.direction
    * @return {number} this.direction mod 2PI
    */
  getPlayerDir() {
    return (this.tanks[localStorage.userID].direction) % (Math.PI * 2);
  }

  /**
    * A setter for this.movedSinceLastTransmit
    */
  resetLastMoved() {
    this.movedSinceLastTransmit = false;
  }

  /**
    * Method called on gameOver. Alerts with the winner's username.
    * @param {string} winningUserID
    */
  endGame( winningUserID ) {
    this.won = true;
    alert( "Game over. Winner is: " + game.tanks[winningUserID].username );
  }

  showMsg(username, text) {
    let messageWindow = document.getElementById('messageWindow');
    let msg = document.createElement('div');
    msg.classList.add('message');

    let sender = document.createElement('div');
    sender.classList.add('sender');
    sender.innerHTML = username + ": ";
    msg.appendChild(sender);

    let content = document.createElement('div');
    content.classList.add('content');
    content.innerHTML = text;
    msg.appendChild(content);

    msg.setAttribute('content', text);
    messageWindow.insertAdjacentElement("beforeend", msg);
  }

};
