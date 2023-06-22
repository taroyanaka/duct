const { test_mode } = require('./server.js');
// test_modeがtrueであることを確認する。trueでない場合はテストを実施しない
console.log('test_mode() is: ', test_mode());

// test_modeがfalseであることを確認する。falseでない場合はテストを実施しない
if(test_mode() === false) {
  console.log('test_modeがfalseのためテストを実施しません');
  process.exit();
};

const { db } = require('./server.js');
console.log('DB is: ', db.name);
// db.nameが':memory:'であることを確認する。':memory:'でない場合はテストを実施しない
const { get_user_with_permission } = require('./server.js');
const { error_check_for_insert_link } = require('./server.js');
const { error_check_for_insert_tag } = require('./server.js');
const { get_tag_id_by_tag_name } = require('./server.js');
const { insert_tag } = require('./server.js');
const { make_tag_and_insert_tag } = require('./server.js');


if(test_mode() === true && db.name === ':memory:') {
  console.log('テスト開始');


db.exec(`
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL,
  userpassword TEXT NOT NULL,
  user_permission_id INTEGER NOT NULL
)
`);
db.exec(`
CREATE TABLE user_permission (
  id INTEGER PRIMARY KEY,
  permission TEXT NOT NULL,
  deletable INTEGER NOT NULL,
  writable INTEGER NOT NULL,
  readable INTEGER NOT NULL,
  likable INTEGER NOT NULL,
  commentable INTEGER NOT NULL
)
`);
db.exec(`
INSERT INTO user_permission (permission, deletable, writable, readable, likable, commentable)
VALUES ('admin', 1, 1, 1, 1, 1)
`);
db.exec(`
INSERT INTO users (username, userpassword, user_permission_id)
VALUES ('testuser', 'password', 1)
`);
// linkテーブルを作成
// CREATE TABLE links (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   link TEXT NOT NULL,
//   user_id INTEGER NOT NULL,
//   created_at DATETIME NOT NULL,
//   updated_at DATETIME NOT NULL,
//   FOREIGN KEY (user_id) REFERENCES users(id)
// );
db.exec(`
CREATE TABLE links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

const now = () => new Date().toISOString();
db.prepare(`INSERT INTO links (link, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)`).run('https://www.google.co.jp/', 1, now(), now());





















































let req = { body: { name: 'testuser', password: 'password' } };
let user = get_user_with_permission(req
  , db);
// expect(user.username).toEqual('testuser');
user.username === 'testuser' ? "" : console.log('user.username is not testuser');
// expect(user.user_permission).toEqual('admin');
user.user_permission === 'admin' ? "" : console.log('user.user_permission is not admin');
// expect(user.deletable).toEqual(1);
user.deletable === 1 ? "" : console.log('user.deletable is not 1');
// expect(user.writable).toEqual(1);
user.writable === 1 ? "" : console.log('user.writable is not 1');
// expect(user.readable).toEqual(1);
user.readable === 1 ? "" : console.log('user.readable is not 1');
// expect(user.likable).toEqual(1);
user.likable === 1 ? "" : console.log('user.likable is not 1');
// expect(user.commentable).toEqual(1);
user.commentable === 1 ? "" : console.log('user.commentable is not 1');


req = { body: { name: 'testuser', password: 'wrongpassword' } };
user = get_user_with_permission(req, db);
// expect(user).toBeNull();
user === null ? "" : console.log('user is not null');


req = { body: { name: 'nonexistentuser', password: 'password' } };
user = get_user_with_permission(req, db);
// expect(user).toBeNull();
user === null ? "" : console.log('user is not null');


req = { body: { name: "testuser'; DROP TABLE users; --", password: 'password' } };
user = get_user_with_permission(req, db);
// expect(user).toBeNull();
user === null ? "" : console.log('user is not null');


req = { body: { name: 'testuser', password: 'password' } };
user = get_user_with_permission(req, db);
// expect(user).not.toBeNull();
user === null ? console.log('user is null') : "";



// expect(error_check_for_insert_link(undefined)).toEqual({res: 'linkが空です', status: 400});
error_check_for_insert_link(undefined) === null ? console.log('error_check_for_insert_link(undefined) is null') : "";
// expect(error_check_for_insert_link('SELECT')).toEqual({res: 'SQLの予約語を含む場合はエラー', status: 400});
error_check_for_insert_link('SELECT') === null ? console.log('error_check_for_insert_link(SELECT) is null') : "";
// expect(error_check_for_insert_link('https::///google.co.jp')).toEqual({res: 'URLの形式が正しくありません', status: 400});
error_check_for_insert_link('https::///google.co.jp') === null ? console.log('error_check_for_insert_link(https::///google.co.jp) is null') : "";
// expect(error_check_for_insert_link('https://google.co.jp/'.repeat(1000))).toEqual({res: 'URLが長すぎます', status: 400});
error_check_for_insert_link('https://google.co.jp/'.repeat(1000)) === null ? console.log('error_check_for_insert_link(https://google.co.jp/.repeat(1000)) is null') : "";
// expect(error_check_for_insert_link('https://hogehoge.com/')).toEqual({res: '許可されていないURLです', status: 400});
error_check_for_insert_link('https://hogehoge.com/') === null ? console.log('error_check_for_insert_link(https://hogehoge.com/) is null') : "";
// expect(error_check_for_insert_link('https://www.yahoo.co.jp/')).toEqual({res: 'OK', status: 200});
error_check_for_insert_link('https://www.yahoo.co.jp/') === null ? console.log('error_check_for_insert_link(https://www.yahoo.co.jp/) is null') : "";
// expect(error_check_for_insert_link('https://www.google.co.jp/')).toEqual({res: 'OK', status: 200});
error_check_for_insert_link('https://www.google.co.jp/') === null ? console.log('error_check_for_insert_link(https://www.google.co.jp/) is null') : "";
// expect(error_check_for_insert_link('https://www.youtube.com/')).toEqual({res: 'OK', status: 200});
error_check_for_insert_link('https://www.youtube.com/') === null ? console.log('error_check_for_insert_link(https://www.youtube.com/) is null') : "";


req = { body: { name: 'testuser', password: 'password' } };
user = get_user_with_permission(req, db);
// expect(user).not.toBeNull();
user === null ? console.log('user is null') : "";
// expect(user.writable).toEqual(1);
user.writable === 1 ? "" : console.log('user.writable is not 1');
// expect(user.user_permission).toEqual('admin');
user.user_permission === 'admin' ? "" : console.log('user.user_permission is not admin');
// expect(user.username).toEqual('testuser');
user.username === 'testuser' ? "" : console.log('user.username is not testuser');
// expect(user.commentable).toEqual(1);
user.commentable === 1 ? "" : console.log('user.commentable is not 1');
// expect(user.deletable).toEqual(1);
user.deletable === 1 ? "" : console.log('user.deletable is not 1');
// expect(user.likable).toEqual(1);
user.likable === 1 ? "" : console.log('user.likable is not 1');
// expect(user.readable).toEqual(1);
user.readable === 1 ? "" : console.log('user.readable is not 1');


const link_exists = db.prepare(`SELECT * FROM links WHERE link = ?`).get('https://www.google.co.jp/');
// expect(link_exists).not.toBeNull();
link_exists === null ? console.log('link_exists is null') : "";
const link_not_exists = db.prepare(`SELECT * FROM links WHERE link = ?`).get('https://www.yahoo.co.jp/');
// expect(link_not_exists).toBeUndefined();
link_not_exists === undefined ? "" : console.log('link_not_exists is not undefined');



const test_error_check_for_insert_tag = () => {
let result = error_check_for_insert_tag(undefined);
result.status === false ? "" : console.log('result.status is not false');
result.res === 'tagが空です' ? "" : console.log('result.res is not tagが空です');

  result = error_check_for_insert_tag('test!');
result.status === false ? ''  : console.log('result.status is not false');
result.res === '記号を含む場合はエラー' ? '' : console.log('result.res is not 記号を含む場合はエラー');

result = error_check_for_insert_tag('test tag');
result.status === false ? '' : console.log('result.status is not false');
result.res === '空白を含む場合はエラー' ? '' : console.log('result.res is not 空白を含む場合はエラー');

  result = error_check_for_insert_tag('testlong');
result.status === false ? '' : console.log('result.status is not false');
result.res === '7文字以上はエラー' ? '' : console.log('result.res is not 7文字以上はエラー');

  result = error_check_for_insert_tag('SELECT');
result.status === false ? '' : console.log('result.status is not false');
result.res === 'SQLの予約語を含む場合はエラー' ? '' : console.log('result.res is not SQLの予約語を含む場合はエラー');

  result = error_check_for_insert_tag('test');
result.status === true ? '' : console.log('result.status is not true');
result.res === 'OK' ? '' : console.log('result.res is not OK');
};
test_error_check_for_insert_tag();











};

console.log('テスト完了');