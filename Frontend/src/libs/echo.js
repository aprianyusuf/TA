import Echo from 'laravel-echo';
import { io } from 'socket.io-client';

window.io = io;

const echo = new Echo({
  broadcaster: 'reverb',
  host: 'http://localhost:6001', // or your server's public IP/domain with port
  client: io,
});

export default echo;
