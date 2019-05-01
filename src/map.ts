class Map extends Renderable {
  tiles : MapTile[][];
  toRedraw : number[][];    // tiles queued to be redrawn
  set : boolean // whether or not the map has been set w/ first update
  rowCount : number
  colCount : number
  constructor( mapDim : number ) {
    super();
    this.tiles = [];
    this.toRedraw = [];
    this.rowCount = mapDim;
    this.colCount = mapDim;
    this.set = false;
    for( let i = 0; i < mapDim; i++ ) {
      this.tiles[ i ] = [];
      this.toRedraw[ i ] = [];
      for( let j = 0; j < mapDim; j++ ) {
        this.tiles[ i ][ j ] = null;
        this.toRedraw[ i ][ j ] = null;
      }
    }
  }

  redrawRange = ( startRow : number, numRows : number,
                  startCol : number, numCols : number ) : void => {
    for( let row = startRow; row < startRow + numRows; row++ ) {
      for( let col = startCol; col < startCol + numCols; col++ ) {
        this.redraw( row, col );
      }
    }
  }

  redraw = ( row : number, col : number ) : void => {
    if( this.toRedraw[ row ][ col ] == null ) return;
    let val = this.toRedraw[ row ][ col ];
    if( val  < 0 ) this.tiles[ row ][ col ] = new OuterWallTile();
    if( val == 0 ) this.tiles[ row ][ col ] = new FloorTile();
    if( val >  0 ) this.tiles[ row ][ col ] = new WallTile( val );
    this.toRedraw[ row ][ col ] = null;
  }

  render = ( ctx: CanvasRenderingContext2D ) : void => {
    ctx.save();
    this.tiles.forEach( ( row : MapTile[], yIndex ) => {
      ctx.save();
      row.forEach( ( tile : MapTile, xIndex ) => {
        tile.render( ctx );
        ctx.translate( 40, 0 );
      } );
      ctx.restore();
      ctx.translate( 0, 40 );
    } );
    ctx.restore();
  }

  update = ( tiles: number[][] ) : void => {
    tiles.forEach( ( row, i ) => {
      row.forEach( ( val, j ) => {
        let compare = ( val < -1 && this.tiles[ i ][ j ] instanceof OuterWallTile ) ||
                      ( val == 0 && this.tiles[ i ][ j ] instanceof FloorTile ) ||
                      ( val  > 0 && this.tiles[ i ][ j ] instanceof WallTile);
        if( compare ) return;
        this.toRedraw[ i ][ j ] = val;
      } );
    } );
  }

  setTiles = ( tiles : number[][] ) : void => {
    tiles.forEach( ( row, i ) => {
      row.forEach( ( val, j ) => {
          if( val  < 0 ) { this.tiles[ i ][ j ] = new OuterWallTile(); };
          if( val == 0 ) { this.tiles[ i ][ j ] = new FloorTile(); };
          if( val >  0 ) { this.tiles[ i ][ j ] = new WallTile( val ); };
        } );

    } );
    this.redrawRange( 0, this.rowCount, 0, this.colCount );
    this.set = true;
  }

  getTile = ( row : number, col : number ) : MapTile => {
    return this.tiles[ row ][ col ];
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
      new RoundRect(  0,  0, 40, 40, 3, "#000000", "transparent" ),
      new RoundRect(  1,  2, 18,  7, 3, "#c0c0c0", "transparent" ),
      new RoundRect( 21,  2, 18,  7, 3, "#c0c0c0", "transparent" ),
      new RoundRect(  1, 11,  8,  7, 3, "#a0a0a0", "transparent" ),
      new RoundRect( 11, 11, 18,  7, 3, "#a0a0a0", "transparent" ),
      new RoundRect( 31, 11,  8,  7, 3, "#a0a0a0", "transparent" ),
      new RoundRect(  1, 20, 18,  7, 3, "#909090", "transparent" ),
      new RoundRect( 21, 20, 18,  7, 3, "#909090", "transparent" ),
      new RoundRect(  1, 29,  8,  7, 3, "#606060", "transparent" ),
      new RoundRect( 11, 29, 18,  7, 3, "#606060", "transparent" ),
      new RoundRect( 31, 29,  8,  7, 3, "#606060", "transparent" )
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

class OuterWallTile extends MapTile {
  constructor( ) {
    super();
    this.isBlocking = true;
    let items = [
      new RoundRect(  0,  0, 40, 40, 3, "#000000", "transparent" ),
      new RoundRect(  1,  2, 18,  7, 3, "#909090", "transparent" ),
      new RoundRect( 21,  2, 18,  7, 3, "#909090", "transparent" ),
      new RoundRect(  1, 11,  8,  7, 3, "#606060", "transparent" ),
      new RoundRect( 11, 11, 18,  7, 3, "#606060", "transparent" ),
      new RoundRect( 31, 11,  8,  7, 3, "#303030", "transparent" ),
      new RoundRect(  1, 20, 18,  7, 3, "#303030", "transparent" ),
      new RoundRect( 21, 20, 18,  7, 3, "#303030", "transparent" ),
      new RoundRect(  1, 29,  8,  7, 3, "#101010", "transparent" ),
      new RoundRect( 11, 29, 18,  7, 3, "#101010", "transparent" ),
      new RoundRect( 31, 29,  8,  7, 3, "#101010", "transparent" )
    ];
    this.items = new Collection( items );
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
