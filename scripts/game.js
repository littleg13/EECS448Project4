class Game {
  constructor(mapDim) {
    this.ctx;
    this.map = [];
    this.mapDim = mapDim;
    this.scale;
    this.tanks = {};
    this.turn = '';
    this.distLeftThisTurn = 5;
    this.player;
    this.gridBoxDim;
    this.geometryDim = 40;                // normalized tile size
    this.bullets = [];
    this.keys = [];
    this.movedSinceLastTransmit = false;
    this.playerShot = false;
    this.begun = false;
    this.won = false;
    this.init();
  }

  init() {
    this.initCanvas();
  }

  startGame() {
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    gameTickUpdateInt = setInterval(mainLoop, Math.floor(1000/32));
    sendServerUpdateInt = setInterval(sendServerUpdate, 40);
    this.begun = true;
  }

  initCanvas() {
    this.canvas = document.getElementById('canvas');
    this.width = canvas.width;
    this.height = canvas.height;
    this.gridBoxDim = this.width / this.mapDim;
    this.scale = this.gridBoxDim / this.geometryDim;
    console.log(this.mapDim);
    this.ctx = canvas.getContext('2d');
  }


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

  updateMap(map) {
    this.map = map
  }

  addTank(userID, username, xPos, yPos, direction, distanceLeft, color) {
    this.tanks[userID] = new Tank(username ,xPos, yPos, direction, distanceLeft, color);
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
    console.log( newHealth );
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
      }

    }
    this.ctx.restore();
  }

  fire(shooterID, power, curve, dist) {
    let shooter = this.tanks[shooterID];
    if(shooter.canShoot){
      var proj = { xPos: shooter.xPos,
                   yPos: shooter.yPos,
                   direction: shooter.direction,
                   distanceToTravel: dist, distanceTraveled: 0 };
      this.bullets.push(proj);
      this.tanks[shooterID].canShoot = false;
    }
  }

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

  processInput() {
    let player = this.tanks[localStorage.userID];
    if( this.turn != localStorage.userID ) return;
    if( this.keys["ArrowLeft"] ) {
      if(this.checkMapCollision(player, 0, -0.1) == true) {
        player.direction -= 0.1;
        this.movedSinceLastTransmit = true;
      }
    }
    if( this.keys["ArrowRight"] ) {
      if(this.checkMapCollision(player, 0, 0.1) == true) {
        player.direction += 0.1;
        this.movedSinceLastTransmit = true;
      }
    }
    if( this.keys[" "] ) {
      if( player.canShoot && !this.playerShot ){
        this.playerShot = true;
      }
    }

    if( player.distanceLeft <= 0 ) return;                // Cancel if no more moving
    let deltaPos = Math.min( player.distanceLeft, 0.1 );  // Constrain movement w/in dist limit

    if( this.keys["ArrowUp"] ) {
      if(this.checkMapCollision(player, 0.1, 0) == true) {
        player.xPos += Math.sin( player.direction ) * deltaPos;
        player.yPos -= Math.cos( player.direction ) * deltaPos;
        player.distanceLeft -= deltaPos;
        this.movedSinceLastTransmit = true;
      }
    }
    if( this.keys["ArrowDown"] ) {
      if(this.checkMapCollision(player, -0.1, 0) == true) {
        player.xPos -= Math.sin( player.direction ) * deltaPos;
        player.yPos += Math.cos( player.direction ) * deltaPos;
        player.distanceLeft -= deltaPos;
        this.movedSinceLastTransmit = true;
      }
    }
    player.distanceLeft = Math.max( 0.0, player.distanceLeft );
  }

  gameTick() {
    this.renderMap();
    this.renderTanks();
    this.processInput();
    this.renderBullets();
  }

  advanceTurn(userID) {
    this.turn = userID;
    this.tanks[userID].canShoot = true;
    this.tanks[userID].distanceLeft = 5;
  }

  playerMoved() {
    return this.movedSinceLastTransmit;
  }

  getPlayerShot() {
    return this.playerShot;
  }

  resetPlayerShot() {
    this.playerShot = false;
  }

  getPlayerPos() {
    return [this.tanks[localStorage.userID].xPos, this.tanks[localStorage.userID].yPos];
  }

  getPlayerDir() {
    return (this.tanks[localStorage.userID].direction) % (Math.PI * 2);
  }

  resetLastMoved() {
    this.movedSinceLastTransmit = false;
  }

  //TODO make end game
  endGame( winningUserID ) {
    this.won = true;
    alert( "Game over. Winner is: " + game.tanks[winningUserID].username );
  }
};
