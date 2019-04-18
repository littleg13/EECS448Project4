class Map extends Renderable {
  tiles : MapTile[][];
  constructor() { super(); }

  render = ( ctx: CanvasRenderingContext2D ) : void => {
    ctx.save();
    for( let i = 0; i < this.tiles.length; i++ ) {
      let row = this.tiles[i];
      ctx.save();
      for( let j = 0; j < row.length; j++ ) {
        let tile = row[j];
        tile.render( ctx );
        ctx.translate( 40, 0 );
      }
      ctx.restore();
      ctx.translate( 0, 40 );
    }
    ctx.restore();
  }
}

class MapTile extends Renderable {
  above : MapTile;
  below : MapTile;
  left  : MapTile;
  right : MapTile;
  constructor() {
    super();
  }
}

class WallTile extends MapTile {
  constructor() {
    super();
  }

  render = ( ctx: CanvasRenderingContext2D ) : void => {
    ctx.fillStyle = "#000000";
    ctx.fillRect( 0, 0, 40, 40 );
    ctx.fillStyle = "#C0C0C0";
    ctx.fillRect(  1,  2, 18, 7 );
    ctx.fillRect( 21,  2, 18, 7 );
    ctx.fillStyle = "#A0A0A0";
    ctx.fillRect(  1, 11,  8, 7 );
    ctx.fillRect( 11, 11, 18, 7 );
    ctx.fillRect( 31, 11,  8, 7 );
    ctx.fillStyle = "#909090";
    ctx.fillRect(  1, 20, 18, 7 );
    ctx.fillRect( 21, 20, 18, 7 );
    ctx.fillStyle = "#606060";
    ctx.fillRect(  1, 29,  8, 7 );
    ctx.fillRect( 11, 29, 18, 7 );
    ctx.fillRect( 31, 29,  8, 7 );
  }
}

class FloorTile extends MapTile {
  constructor() {
    super();
  }

  render = ( ctx: CanvasRenderingContext2D ) : void => {
    ctx.fillStyle = "#963";
    ctx.fillRect( 0, 0, 40, 40 );
  }
}
