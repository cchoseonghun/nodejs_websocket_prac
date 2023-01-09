const http = require('http');
const fs = require('fs');
const ws = new require('ws');

const wss = new ws.Server({ noServer: true });

const clients = new Set();  // 여러 개를 처리해주기 위해

// const accept = (req, res) => {
function accept(req, res) {
  // 연결 시 헤더에 upgrade라는 문자열이 포함되어 있을 때
  if (req.url == '/ws' 
  && req.headers.upgrade
  && req.headers.upgrade.toLowerCase() == 'websocket' 
  && req.headers.connection.match(/\bupgrade\b/i)) {
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);

  } else if (req.url == '/') {
    // index.html
    fs.createReadStream('./index.html').pipe(res);

  } else {
    // page not found
    res.writeHead(404);
    res.end();
  }
}

// const onSocketConnect = (ws) => {
function onSocketConnect(ws) {
  clients.add(ws);
  console.log(`new connection`);

  // ws.on('message', (message) => {
  ws.on('message', function(message) {
    const obj = JSON.parse(message);

    console.log('message received: ', obj);

    for (let client of clients) {  // 각각의 클라이언트에 전달
      client.send(JSON.stringify(obj));  // send로 클라이언트에 전송
    }
  });

  // ws.on('close', () => {
  ws.on('close', function() {
    console.log(`connection closed`);
    clients.delete(ws);  // 배열에서 제거
  });
}

http.createServer(accept).listen(8080);