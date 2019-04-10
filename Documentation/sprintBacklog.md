# Sprint Backlog

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
