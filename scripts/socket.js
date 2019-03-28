let socket = io('https://448.cuzzo.net');

function joinLobby() {
  lobbyCode = document.getElementById('lobbyCode').value;
  name = document.getElementById('username').value;
  socket.emit('joinLobby', {lobbyCode : lobbyCode, username : name});
};

function createLobby() {
  name = document.getElementById('username').value;
  socket.emit('createLobby', {username : name});
};

socket.on('message', function (data) {
    console.log(data);
});

socket.on('lobbyCreated', function (data) {
    console.log(data);
    
});

socket.on('setID', function (data) {
  localStorage.setItem('userID', data['userID']);
});

socket.on('connect', function (data) {
  if(localStorage.userID){
    socket.emit('auth', {userID : localStorage.userID});
  }
});

socket.on('error', function (data) {
  console.log(data['error']);
});
