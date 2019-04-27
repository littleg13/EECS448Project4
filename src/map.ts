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
  items : Collection;
  constructor() {
    super();
    this.isBlocking = false;
  }
}

class WallTile extends MapTile {
  health : Counter;
  constructor( initHealth : number = 5 ) {
    super();
    this.isBlocking = true;
    let items = [
      new RoundRect(  0,  0, 40, 40, 3, "#000000", "rgba(0,0,0,0)" ),
      new RoundRect(  1,  2, 18,  7, 3, "#c0c0c0", "rgba(0,0,0,0)" ),
      new RoundRect( 21,  2, 18,  7, 3, "#c0c0c0", "rgba(0,0,0,0)" ),
      new RoundRect(  1, 11,  8,  7, 3, "#a0a0a0", "rgba(0,0,0,0)" ),
      new RoundRect( 11, 11, 18,  7, 3, "#a0a0a0", "rgba(0,0,0,0)" ),
      new RoundRect( 31, 11,  8,  7, 3, "#a0a0a0", "rgba(0,0,0,0)" ),
      new RoundRect(  1, 20, 18,  7, 3, "#909090", "rgba(0,0,0,0)" ),
      new RoundRect( 21, 20, 18,  7, 3, "#909090", "rgba(0,0,0,0)" ),
      new RoundRect(  1, 29,  8,  7, 3, "#606060", "rgba(0,0,0,0)" ),
      new RoundRect( 11, 29, 18,  7, 3, "#606060", "rgba(0,0,0,0)" ),
      new RoundRect( 31, 29,  8,  7, 3, "#606060", "rgba(0,0,0,0)" )
    ];
    this.items = new Collection( items );
    this.health = new Counter( initHealth );
  }

  onHit = ( damage : number ) : void => {
    this.health.dec( damage );
    this.update();
  }

  update = () : void => {
    let val = this.health.get();
    this.items.mapItems( ( item : Renderable ) => {
      if( item instanceof RoundRect ) {
        item.rad = val;
      }
      return item;
    } );
  }

  render = ( ctx : CanvasRenderingContext2D ) : void => {
    this.items.render( ctx );
  }
}

class FloorTile extends MapTile {
  constructor() {
    super();
  }

  render = ( ctx: CanvasRenderingContext2D ) : void => {
    ctx.fillStyle = "#963";
    ctx.fillRect( 0, 0, 40, 40 );
    let stone = new Path( 10, 10, "#303030", "#303060" );
    let shapes = [

    ];
    stone.addSegments( shapes );
    stone.render( ctx );
  }
}
