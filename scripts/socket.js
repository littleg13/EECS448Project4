let socket = io('http://localhost:3000');

function lobbySetup() {
  document.getElementById('lobbyCode').innerHTML = localStorage.lobbyCode;
  socket.emit('requestInfo', {request : "getPlayerList"});
};

function joinLobby() {
  lobbyCode = document.getElementById('lobbyCode').value;
  name = document.getElementById('username').value;
  socket.emit('joinLobby', {lobbyCode : lobbyCode, username : name});

};

function createLobby() {
  name = document.getElementById('username').value;
  socket.emit('createLobby', {username : name});
};

function logout() {
  socket.emit('logout', {lobbyCode : localStorage.lobbyCode, userID : localStorage.userID})
  localStorage.clear();
  window.location.href = 'index.html';
}

socket.on('message', function (data) {
    console.log(data);
});

socket.on('ack', function (data) {
  switch (data['type']) {
    case 'lobbyCreated':
      break;
    case 'lobbyJoined':
        if(data['result'] == 0){
          alert('The lobby you tried to join does not exist');
          return;
        }
        else if (data['result'] == 1) {
          alert('The lobby you tried to join has already started the game');
          return;
        }
      break;
  }
  console.log("Lobby created/joined: " + data);
  localStorage.setItem('lobbyCode', data['lobbyCode']);
  document.location.href='lobby.html';
});

socket.on('setID', function (data) {
  console.log("Setting ID");
  localStorage.setItem('userID', data['userID']);
  localStorage.setItem('username', data['username']);
});

socket.on('connect', function (data) {
  console.log("authing server")
  if(localStorage.userID){
    let url = window.location.pathname;
    url = url.substring(url.lastIndexOf('/')+1);
    socket.emit('auth', {userID : localStorage.userID, lobbyCode : localStorage.lobbyCode, page : url});
  }
});

socket.on('error', function (data) {
  console.log(data);
});

socket.on('redirect', function (data) {
  window.location.href = data['page'];
});

socket.on('clearStorage', function (data) {
  localStorage.clear();
  window.location.href = 'index.html';
});


socket.on('playerJoin', function (data) {
  console.log("Player joined: " + data)
  newPlayer = document.createElement("h3");
  newPlayer.innerHTML = data['username'];
  document.getElementById('wrapper').appendChild(newPlayer);
});

socket.on('playerList', function (data) {
  console.log("Player list: " + data);
  document.getElementById('loadingTag').style.display = "none";
  for (let i = 0; i < data.length; i++) {
    newPlayer = document.createElement("h3");
    newPlayer.innerHTML = data[i];
    document.getElementById('wrapper').appendChild(newPlayer);
  };
});
