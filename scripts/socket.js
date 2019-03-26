let socket = io('https://448.cuzzo.net:3000');
socket.emit('message', { my: 'data' });

function connect() {
  socket.emit('message', { my: 'data' });
}