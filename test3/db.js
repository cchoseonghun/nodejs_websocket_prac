const DB = function () {
  console.log('ReadInfo'); // DB가 준비됨
};

DB.prototype.LogMsg = function () {
  // DB의 메시지 함수
  console.log('DBConnect');
};

module.exports = DB;
