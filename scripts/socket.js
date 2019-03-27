let socket = io('https://448.cuzzo.net');
function connect() {
  socket.emit('joinLobby', {id : 'lobbyCode'})
};

socket.on('message', function (data) {
    console.log(data);
  });
