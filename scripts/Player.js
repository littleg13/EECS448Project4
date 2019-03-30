var Player = function() {
  this.xPos;
  this.yPos;
  this.dir; // Degree in radians from straight up
  this.health;

  this.render() {
    ctx.translate( Math.floor(this.xPos), Math.floor(this.yPos) );
    ctx.rotate( this.dir );
    ctx.fillStyle = 'grey';
    ctx.fillRect( 0, 0, 7, 20 );
    ctx.fillRect( 15, 0, 7, 20 );
    ctx.fillStyle = 'red';
    cxx.fillRect( 5, 5, 10, 10 );
    ctx.resetTransform();
  }
}
