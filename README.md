# Minesweeper448

Implementation of a multiplayer tank game using Python3 and HTML5 + JavaScript + CSS.
It is the third group project for "Group" in EECS 448, Spring 2019 at KU.

## Getting Started

In order to play the game, there are a few prerequisite packages to install.

### Prerequisites

This project relies on Python3 and the socket.io library for python.



To install them on Ubuntu/Debian, open a command line and enter:

```
sudo apt-get install python3 
sudo pip install socketio-python
```

On Windows and MacOS, you can download the Python3 stable release at:

https://www.python.org/downloads/release/python-372/

The binary installers include pip, a python utility to install modules. To use pip to install PyQt5, run:
```
python -m pip install 
```

### Installing

Once Python3 is installed, you can download the project as a .zip archive or clone the repository in the command line with:
```
git clone https://github.com/Cuzzo01/EECS448Project3.git
```

Move the following files to a web server's public html folder so you can access them using your web browser:
 * index.html
 * styles.css
 * images/
 * scripts/
Note, include the contents of both images/ and scripts/.

To begin the game's sockets server:
```
cd /Path/To/Game/Directory/server/python/
python3 SocketServer.py
```

## Built With

* [Python3](https://www.python.org/)
* [Sphinx](http://www.sphinx-doc.org/en/master/) - Documentation generator tool for Python.
* [JSDoc](http://usejsdoc.org/) - Documentation generator tool for JavaScript.
* [Socket.IO](https://socket.io/) - Socket.IO library for handling WebSockets interaction (client-side)
* [Python-Socket.IO](https://python-socketio.readthedocs.io/en/latest/index.html) - Socket.IO library for handling WebSockets interaction (server-side)

## Authors

* [Cameron Kientz](https://github.com/C256k145)
* [Grady Wright](https://github.com/littleg13)
* [Ian Hierl](https://github.com/IanHierl)
* [Nick Marcuzzo](https://github.com/Cuzzo01)
