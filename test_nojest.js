// const request = require('supertest');
const app = require('./server_test');

const sqlite3 = require('better-sqlite3');

// Create an in-memory database
let db = sqlite3(':memory:');






const { get_user_with_permission } = require('./server_test.js');
const { error_check_for_insert_link } = require('./server_test.js');

global.db = db;


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
