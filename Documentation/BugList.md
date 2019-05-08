# Bug List

* Server Crashes
  * There are still some errors that cause the server to crash. They are rare
  but because of how SocketIO works, they are not easy to detect on the server
  side. Currently to recover from this we just restart the server. In the past
  these have been caused by things like popping from an empty list or doing a
  lookup on a dictionary with a bad key.


* No check for number of spawn points
  * Currently spawn points are generated procedurally along with the map. This
  means we do not have the same number of spawn points on each map. We do no
  checks currently on how many we found in the current map and if we are about
  to run out. Because of this if more players join a lobby than there are spawn
  points for that map, the server will crash when it tries to pop from an empty
  list. This isnt a problem because most games have only 4 players. For most
  maps the max number of players is not smaller than 10.


* Code clean up
  * While not specifically a bug, we were working up until the code freeze time
  meaning we didn't get the chance to go back and clean up our code. There are a
  couple places where unused code was left in the code base. Also, there are
  multiple places where prints for debugs were left in. Removing those would
  probably speed up code execution by quite a bit.


* Client server desync
  * We ran into a bug that in some cases a tanks movements were shown to the
  player taking their turn but not to any of the other players. When this
  happened it usually required a refresh by the frozen client to fix. We found
  one reason it happened and corrected it but we are not certain that fixed it
  completely. We have not seen it since we corrected the what we though the
  issue was but even still, its most likely still possible in remote cases.


* Clearing client interface after a match
  * A lot of information and GUI elements are stored in memory on the client
  side. After a game is finished this information is not cleaned up perfectly
  and can cause issues if the page is not reloaded (to clear the JS instance
  and restart it) before another game is started. This could be easily fixed
  by forcing a client refresh after all games but we did not discover this bug
  before code freeze.


* Power ups are handled poorly
  * Currently, when a player picks up a power up, this is broadcast to all
  clients in the game and displayed for all players. However, this information
  is not passed on page load. This means if a client refreshed between the time
  someone picked up a power up and used it, the refreshed client would not see
  that the player has a power up.
