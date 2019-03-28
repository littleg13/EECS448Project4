let socket = io('http://localhost:3000');

function lobbySetup() {
  document.getElementById('lobbyCode').innerHTML = localStorage.lobbyCode;
  socket.emit('requestInfo', {request : "getPlayerList"});
};

function joinLobby() {
  lobbyCode = document.getElementById('lobbyCode').value;
  name = document.getElementById('username').value;
  socket.emit('joinLobby', {lobbyCode : lobbyCode, username : name});
  localStorage.setItem('lobbyCode', lobbyCode);
  document.location.href='lobby.html'
};

function createLobby() {
  name = document.getElementById('username').value;
  socket.emit('createLobby', {username : name});
  document.location.href='lobby.html';
};

socket.on('message', function (data) {
    console.log(data);
});

socket.on('lobbyCreated', function (data) {
    console.log(data);
    localStorage.setItem('lobbyCode', data['lobbyCode']);
});

socket.on('setID', function (data) {
  localStorage.setItem('userID', data['userID']);
  localStorage.setItem('username', data['username']);
});

socket.on('connect', function (data) {
  if(localStorage.userID){
    socket.emit('auth', {userID : localStorage.userID, lobbyCode : localStorage.lobbyCode});
  }
});

socket.on('error', function (data) {
  console.log(data['error']);
});

socket.on('playerJoin', function (data) {
  console.log("Player joined: " + data)
  newPlayer = document.createElement("h3");
  newPlayer.innerHTML = data['username'];
  document.getElementById('wrapper').appendChild(newPlayer);
});

socket.on('playerList', function (data) {
  console.log("Player list: " + data);
  for (let i = 0; i < data.length; i++) {
    newPlayer = document.createElement("h3");
    newPlayer.innerHTML = data[i];
    document.getElementById('wrapper').appendChild(newPlayer);
  };
});
