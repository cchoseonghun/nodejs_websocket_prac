const http = require('http');

const fs = require('fs');
const ws = new require('ws');
const wss = new ws.Server({ noServer: true });

const clients = new Set(); // 여러 클라이언트 관리

const accept = (req, res) => {
  // 연결 시 헤더에 upgrade라는 문자열이 포함되어 있을 때 -> 왜 upgrade인지?
  if (
    req.url == '/ws' &&
    req.headers.upgrade &&
    req.headers.upgrade.toLowerCase() == 'websocket' &&
    req.headers.connection.match(/\bupgrade\b/i)
  ) {
    // wss의 handleUpgrade와 req.socket, Buffer.alloc(0)에 대해 알아보기
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
  } else if (req.url == '/') {
    // index.html
    // 잘못된 요청일 경우 다시 index.html로 돌아가 재요청하기 위함??
    fs.createReadStream('./index.html').pipe(res);
  } else {
    // page not found
    res.writeHead(404);
    res.end();
  }
};

const onSocketConnect = (ws) => {
  clients.add(ws);
  console.log(`new connection`);

  ws.on('message', (message) => {
    const obj = JSON.parse(message);
    console.log('message received: ', obj);

    for (let client of clients) {
      // 각각의 클라이언트에
      client.send(JSON.stringify(obj)); // send로 클라이언트에 전송
    }
  });

  ws.on('close', () => {
    console.log(`connection closed`);
    clients.delete(ws); // 배열에서 제거
  });
};

http.createServer(accept).listen(8080);
