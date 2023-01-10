const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.set('view engine', 'ejs'); // 렌더링 엔딩 모드를 ejs로 설정
app.set('views', __dirname + '/views'); // ejs가 있는 폴더를 지정

app.get('/', (req, res) => {
  res.render('index'); // index.ejs를 사용자에게 전달
});

io.on('connection', (socket) => {  // 연결이 들어오면 실행되는 이벤트
  // socket 변수에는 실행 시점에 연결한 상대와 연결된 소켓의 객체가 들어있다.

  // socket.emit으로 현재 연결한 상대에게 신호를 보낼 수 있다.
  // socket.emit('usercount', io.engine.clientsCount);  // 연결된 유저에게만
  io.emit('usercount', io.engine.clientsCount);         // 전체에게

  // on 함수로 이벤트를 정의해 신호를 수신할 수 있다.
  socket.on('message', (msg) => {
    // msg에는 클라이언트에서 전송한 매개변수가 들어온다.
    // 이러한 매개변수의 수에는 제한이 없다.
    console.log('Message received: ', msg);

    // io.emit으로 연결된 모든 소켓들에 신호를 보낼 수 있다.
    io.emit('message', msg);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log('server on :: ', PORT);
});
