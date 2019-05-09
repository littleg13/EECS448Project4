/**
 * This class handles the HTML code associated with player information displayed
 * on the right-hand side of the game view.
 */
class PlayerCard {
  /**
   * Initialized to null, once card is built this points to the HTML element
   * that contains the remaining HTML elements within the playercard.
   */
  rootDiv     : HTMLElement;
  /**
   * Unique identifier for the player. Used to set element ids such that it won't
   * conflict with other playercards.
   */
  userID      : string;
  /**
   * Display name for the player that is to be displayed in text.
   */
  playerName  : string;
  /**
   * Used to calculate the width of the red-styled div to display player health.
   */
  health      : number;
  /**
   * The rendering Layer that contains the player sprite. Allows for a display of
   * the player image off of the gameview canvas.
   */
  sprite      : Layer;
  /**
   * The parent element that the playercard is attached to. Initialized to null,
   * and needs to be actively called after building the card itself.
   */
  parent      : HTMLElement;
  /**
   * @param userID the userID that uniquely identifies the player
   * @param playerName the player's chosen display name
   * @param health the player's current health. Displayed as a healthbar using divs.
   * @param sprite the Layer that is used to render the player's sprite. This layer is rendered independently of the rest of the gameview.
   */
  constructor( userID : string, playerName : string, health : number, sprite : Layer ) {
    this.userID = userID;
    this.playerName = playerName;
    this.health = health;
    this.sprite = sprite;
    this.rootDiv = null;
    this.parent = null;
  }

  /**
   * Builds the necessary HTML elements to be appended to the DOM.
   */
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

  /**
   * Attaches the playercard to a container once the card has been built.
   * @param parent the HTML element that will contain the player card elements
   */
  setParent = ( parent : HTMLElement ) : void => {
    this.parent = parent;
    if( this.rootDiv != null ) { this.parent.appendChild( this.rootDiv ); }
  }

  /**
   * This method updates the playercard's displayed health.
   * @param newHealth the new health amount to be displayed, out of 100.
   */
  updateHealth = ( newHealth : number ) : void => {
    console.log( "Update health to: " + newHealth );
    let healthDiv = this.rootDiv.getElementsByClassName( "tankHealth" )[0];
    let curHealthDiv = healthDiv.getElementsByClassName( "curTankHealth" )[0];
    if( curHealthDiv instanceof HTMLElement ) curHealthDiv.style.width = newHealth + "%";
  }

  /**
   * This method updates the playercard's styling class depending on the argument isTurn
   * @param isTurn a boolean that represents whether or not to style the playercard as active. Default is false.
   */
  setTurn = ( isTurn : boolean = false ) : void => {
    if( isTurn ) this.rootDiv.classList.add( "isTurn" );
    else this.rootDiv.classList.remove( "isTurn" );
  }
}
