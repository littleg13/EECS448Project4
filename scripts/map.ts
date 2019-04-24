class Map extends Renderable {
  tiles : MapTile[][];
  constructor() {
    super();
  }

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

  update = ( tiles: number[][] ) : void => {
    this.tiles = tiles.map( ( row ) => {
      return row.map( ( val ) => {
      if( val === 0 ) return new FloorTile();
      else return new WallTile();
      });
    });
  }
}

class MapTile extends Renderable {
  above : MapTile;
  below : MapTile;
  left  : MapTile;
  right : MapTile;
  isBlocking : boolean;
  constructor() {
    super();
    this.isBlocking = false;
  }
}

class WallTile extends MapTile {
  constructor() {
    super();
    this.isBlocking = true;
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
