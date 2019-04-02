let socket = io('https://448.cuzzo.net');

socket.on('connect', function (data) {
  console.log("authing server")
  if(localStorage.userID){
    let url = window.location.pathname;
    url = url.substring(url.lastIndexOf('/')+1);
    socket.emit('auth', {userID : localStorage.userID, lobbyCode : localStorage.lobbyCode, page : url});
  }
});

socket.on('redirect', function (data) {
  window.location.href = data['page'];
});

socket.on('error', function (data) {
  console.log(data);
});
