class PlayerCard {
  rootDiv     : HTMLElement;
  userID      : string;
  playerName  : string;
  health      : number;
  sprite      : Layer;
  parent      : HTMLElement;
  constructor( userID : string, playerName : string, health : number, sprite : Layer ) {
    this.userID = userID;
    this.playerName = playerName;
    this.health = health;
    this.sprite = sprite;
    this.rootDiv = null;
    this.parent = null;
  }

  buildCard = () : void => {
    let cardDiv = document.createElement( "div" );
    cardDiv.classList.add( "playerCard" );
    cardDiv.setAttribute( "id", "info" + this.userID );

    let usernameDiv = document.createElement( "div" );
    usernameDiv.classList.add( "username" );
    usernameDiv.innerHTML = this.playerName;

    let healthDiv = document.createElement( "div" );
    let curHealthDiv = document.createElement( "div" );
    healthDiv.classList.add( "tankHealth" );
    curHealthDiv.classList.add( "curTankHealth" );
    healthDiv.appendChild( curHealthDiv );
    curHealthDiv.style.width = this.health + "%";

    let spriteDiv = document.createElement( "div" );
    spriteDiv.classList.add( "tankSprite" );
    cardDiv.appendChild( usernameDiv );
    cardDiv.appendChild( spriteDiv );
    cardDiv.appendChild( healthDiv );
    this.sprite.attachToParent( spriteDiv );
    this.rootDiv = cardDiv;
  }

  setParent = ( parent : HTMLElement ) : void => {
    this.parent = parent;
    if( this.rootDiv != null ) { this.parent.appendChild( this.rootDiv ); }
  }

  updateHealth = ( newHealth : number ) : void => {
    console.log( "Update health to: " + newHealth );
    let healthDiv = this.rootDiv.getElementsByClassName( "tankHealth" )[0];
    let curHealthDiv = healthDiv.getElementsByClassName( "curTankHealth" )[0];
    curHealthDiv.style.width = newHealth + "%";
  }
}
