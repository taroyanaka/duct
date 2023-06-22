const request = require('supertest');
const app = require('./server_test');

const sqlite3 = require('better-sqlite3');

// Create an in-memory database
let db = sqlite3(':memory:');






const { get_user_with_permission } = require('./server_test.js');
const { error_check_for_insert_link } = require('./server_test.js');

describe('get_user_with_permission', () => {
  beforeAll(() => {
    // Create a test database with some sample data
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


    global.db = db;
  });

  // Test getting a user with valid credentials
  it('should return a user with valid credentials', () => {
    const req = { body: { name: 'testuser', password: 'password' } };
    const user = get_user_with_permission(req, db);
    expect(user.username).toEqual('testuser');
    expect(user.user_permission).toEqual('admin');
    expect(user.deletable).toEqual(1);
    expect(user.writable).toEqual(1);
    expect(user.readable).toEqual(1);
    expect(user.likable).toEqual(1);
    expect(user.commentable).toEqual(1);
  });

  // Test getting a user with invalid credentials
  it('should return null with invalid credentials', () => {
    const req = { body: { name: 'testuser', password: 'wrongpassword' } };
    const user = get_user_with_permission(req, db);
    expect(user).toBeNull();
  });

  // Test getting a user with non-existent username
  it('should return null with non-existent username', () => {
    const req = { body: { name: 'nonexistentuser', password: 'password' } };
    const user = get_user_with_permission(req, db);
    expect(user).toBeNull();
  });

  // Test getting a user with SQL injection attempt
  it('should return null with SQL injection attempt', () => {
    const req = { body: { name: "testuser'; DROP TABLE users; --", password: 'password' } };
    const user = get_user_with_permission(req, db);
    expect(user).toBeNull();
  });

// name: 'testuser', password: 'password'が存在するか確認する
it('is user exist', () => {
    const req = { body: { name: 'testuser', password: 'password' } };
    const user = get_user_with_permission(req, db);
    expect(user).not.toBeNull();
});


// error_check_for_insert_linkをテストする
it('error_check_for_insert_link', () => {
    // const WHITE_LIST_URL_ARRAY = [
    //     'https://www.yahoo.co.jp/',
    //     'https://www.google.co.jp/',
    //     'https://www.youtube.com/',
    // ];
    //  case link === undefined: return {res: 'linkが空です', status: 400}; break;
    expect(error_check_for_insert_link(undefined)).toEqual({res: 'linkが空です', status: 400});
    //  case reserved_words.includes(link): return {res: 'SQLの予約語を含む場合はエラー', status: 400}; break;
    expect(error_check_for_insert_link('SELECT')).toEqual({res: 'SQLの予約語を含む場合はエラー', status: 400});
    // case !validator.isURL(link): return {res: 'URLの形式が正しくありません', status: 400};
    expect(error_check_for_insert_link('https::///google.co.jp')).toEqual({res: 'URLの形式が正しくありません', status: 400});
    // case link.length > 2000: return {res: 'URLが長すぎます', status: 400}; break;
    expect(error_check_for_insert_link('https://google.co.jp/'.repeat(1000))).toEqual({res: 'URLが長すぎます', status: 400});
    //  case !is_include_WHITE_LIST_URL(link): return {res: '許可されていないURLです', status: 400}; break;
    expect(error_check_for_insert_link('https://hogehoge.com/')).toEqual({res: '許可されていないURLです', status: 400});
    // default: return {res: 'OK', status: 200};
    expect(error_check_for_insert_link('https://www.yahoo.co.jp/')).toEqual({res: 'OK', status: 200});
    expect(error_check_for_insert_link('https://www.google.co.jp/')).toEqual({res: 'OK', status: 200});
    expect(error_check_for_insert_link('https://www.youtube.com/')).toEqual({res: 'OK', status: 200});
});

// user || user.writable ? null : (()=>{throw new Error({res: 'ユーザーが書き込み権限を持っていません', status: 403})})();
it('user || user.writable ? null : (()=>{throw new Error({res: \'ユーザーが書き込み権限を持っていません\', status: 403})})();', () => {
    const req = { body: { name: 'testuser', password: 'password' } };
    const user = get_user_with_permission(req, db);
    expect(user).not.toBeNull();
    expect(user.writable).toEqual(1);
    expect(user.user_permission).toEqual('admin');
    expect(user.username).toEqual('testuser');
    expect(user.commentable).toEqual(1);
    expect(user.deletable).toEqual(1);
    expect(user.likable).toEqual(1);
    expect(user.readable).toEqual(1);
});

// const link_exists = db.prepare(`SELECT * FROM links WHERE link = ?`).get(req.body.link);
// link_exists ? (()=>{throw new Error({res: '同じリンクがすでに存在します', status: 400})})()
//     : null;
it('link_exists ? (()=>{throw new Error({res: \'同じリンクがすでに存在します\', status: 400})})() : null;', () => {
    // まずinsertする
        // CREATE TABLE links (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   link TEXT NOT NULL,
//   user_id INTEGER NOT NULL,
//   created_at DATETIME NOT NULL,
//   updated_at DATETIME NOT NULL,
//   FOREIGN KEY (user_id) REFERENCES users(id)
// );
    // すでに存在する場合はエラー
    const link_exists = db.prepare(`SELECT * FROM links WHERE link = ?`).get('https://www.google.co.jp/');
    expect(link_exists).not.toBeNull();
    // 存在しない場合はOK
    const link_not_exists = db.prepare(`SELECT * FROM links WHERE link = ?`).get('https://www.yahoo.co.jp/');
    expect(link_not_exists).toBeUndefined();

});

// insertしたものを削除
// !!!! in memoryだから不要 !!!!
// afterAll(() => {
//     // do something after all tests
//     // db.prepare(`DELETE FROM links WHERE link = ?`).run('https://www.google.co.jp/');
// });



});



























































let req = { body: { name: 'testuser', password: 'password' } };
let user = get_user_with_permission(req, db);
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

