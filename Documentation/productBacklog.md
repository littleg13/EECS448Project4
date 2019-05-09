# Sprint 1 Backlog

## Completed

* Real-time movement updates
  * One players movement should be visible to all players in near real time.
  * Difficulty: Medium


* Show bullet collisions visually
  * When a bullet impacts an object it should not travel past that object. It should disappear on contact.
  * Difficulty: Medium


* Map destruction
  * Some walls should disappear when hit by a bullet. This applies to only interior walls. Walls on the edge of the map are not able to be broken.
  * Difficulty: Easy


* Detect bullet collisions
  * The game must know when a shot impacts a player or a wall in order to subtract health from the play or destroy the wall.
  * Difficulty: Hard


* Turn based gameplay
  * The game needs to track player turns, and advance to the next player when the previous player finishes their turn.
  * Difficulty: Easy


* Handle player death
  * When a tank loses all its health it should be removed from the field and that player should not have a turn from then on.
  * Difficulty: Medium


* Multiplayer lobby system
  * Players should be able to create lobbies and join previously created lobbied. This is handled over web sockets as it creates a cleaner feel that does not rely on page reloads.
  * Difficulty: Hard


* Update game visually
  * Game updates should be processed and shown visually using an HTML canvas.
  * Difficulty: Medium

## Incomplete

None

# Sprint 2 Backlog

## Completed

* Procedural Map Generation
  * A new map is generated procedurally for each match.
  * Difficulty: Medium

* Power-ups
  * Four powerups have been added to the game, including healthpacks, multishot, wall building, and increased move distance.
  * Difficulty: Hard

* Clean up visuals
  * Rendering system is now more organized. Walls are removed and health updates on impact from bullet. Additional user interface components were added, such as player cards.
  * Difficulty: Medium

* Restrict initial view of the map
  * This addition resulted in less enjoyable gameplay and was removed after initially being implemented.
  * Difficulty: Hard

* Matchmaking
  * Players can now join a match-making lobby that fills as other users select this option.
  * Difficulty: Hard

* Chat
  * A chat box is now found at the bottom of the page.
  * Difficulty: Easy

* Improve game UI
  * Additional user interface components, such as the player cards on the right-hand side, have been added. Sprites and icons used in the game were improved with a new graphics class system, which added more animation to tanks and explosion effects on bullet impact.
  * Difficulty: Medium
  
## Incomplete

* Add admin or overview page
  * We plan to add a page that would display number of active games/users as well as other interesting info on the current state of the server. This would most likely be restricted to admin access only.
  * Difficulty: Hard
