const WebSocket = require('ws'); // 웹소켓
const DB = require('./db.js'); // DB 관련 내용 쓰는 함수 예시
const db = new DB(); // DB 객체를 만든다.

const CREATE = require('./create.js'); // 방이 만들어졌을 때 하는 클래스

const wss = new WebSocket.Server({ port: 8005 });

const maxClients = 5; // 최대 접속 인원수
let rooms = {}; // 방 배열
let joinuserTemp = 1; // 사용 가능한 유저 번호

db.LogMsg(); // DB 로그 메시지

wss.on('connection', function connection(ws) {
  ws.user = genKey(5); // 임시적으로 유저의 이름을 할당 시켜준다.

  var create = new CREATE(); // 방 생성 객체를 new로 선언
  console.log(ws.user);

  ws.on('message', function message(data) {
    console.log(JSON.parse(data)); // 들어온 메시지를 로그로 확인
    const obj = JSON.parse(data);
    const type = obj.type;
    const params = obj.params;

    switch (type) {
      case 'create':
        //create(params);
        create.create(params, rooms, ws, db);
        break;
      case 'join':
        join(params);
        break;
      case 'leave':
        leave(params);
        break;
      default:
        console.warn(`Type: ${type} unknown`);
        break;
    }
  });

  function generalInformation(ws) {
    let obj;
    if (ws['room'] != undefined) {
      obj = {
        type: 'info',
        params: {
          room: ws['room'],
          'no-clients': rooms[ws['room']].length,
        },
      };
    } else {
      obj = {
        type: 'info',
        params: {
          room: 'no room',
        },
      };
    }

    ws.send(JSON.stringify(obj));
  }

  function create(params) {
    // 분리하기 전에 임시로 방 이름 할당하고 생성. 예제 3 로직에선 없어도 되는 함수
    const room = genKey(5);
    console.log('room id: ', room);
    rooms[room] = [ws];
    ws['room'] = room;

    generalInformation(ws);
  }

  function genKey(length) {
    // 임시 유저 이름을 할당
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  function join(params) {
    const room = params.code;
    if (!Object.keys(rooms).includes(room)) {
      console.warn(`Room ${room} does not exist!`); // 방이 없으면 존재하지 않는다는 메시지
      return;
    }

    if (rooms[room].length >= maxClients) {
      // maxClients 이상 못들어가게 막는 코드
      console.warn(`Room ${room} is full!`);
      return;
    }

    rooms[room].push(ws);
    ws['room'] = room;

    generalInformation(ws);

    let UserList = '';

    for (let i = 0; i < rooms[room].length; i++) {
      UserList += '<br>User: ' + rooms[room][i].user;
    }
    joinuserTemp += 1;

    obj = {
      type: 'info',
      params: {
        room: ws['room'],
        UserList: 'TTT: ' + UserList,
      },
    };

    for (let i = 0; i < rooms[room].length; i++) {
      rooms[room][i].send(JSON.stringify(obj));
    }
  }

  function leave(params) {
    // 방을 나갈 경우
    const room = ws.room;

    if (rooms[room].length > 0) {
      rooms[room] = rooms[room].filter((so) => so !== ws);

      ws['room'] = undefined;

      if (rooms[room].length == 0) {
        // 방에 0명이 되었을 때
        close(room);
      }
    }

    function close(room) {
      // 방을 제거한다.
      if (rooms.length > 0) {
        rooms = rooms.filter((key) => key !== room);
      }
    }
  }
});
