const LOOPS = function () {
  let loop;
  let fps = 1;
  let gameloopTimeCount = 0;

  this.LogMsg = function () {
    console.log('GAMELOOPS');
  };

  this.StartLoops = function (params, rooms, ws, db, room) {
    loop = setInterval(() => {
      gameloopTimeCount += 1;
      console.log('Looping: ', gameloopTimeCount);

      obj = {
        type: 'info',
        params: {
          room: ws['room'],
          loopTimeCount: gameloopTimeCount,
        },
      }; // JSON 포맷 형식

      for (let i = 0; i < rooms[room].length; i++) {
        // 방 안에 있는 모든 사람들에게 전달
        rooms[room][i].send(JSON.stringify(obj));
      }
    }, 1000 / fps); // 1초당 메시지를 전달한다.
  };
};

module.exports = LOOPS;
