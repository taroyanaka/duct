// package.json for glitch.com

// {
//     "name": "web_service",
//     "version": "1.0.0",
//     "description": "",
//     "main": "server.js",
//     "scripts": {
//       "start": "node server.js",
//       "test": "echo \"Error: no test specified\" && exit 1"
//     },
//     "author": "",
//     "license": "ISC",
//     "dependencies": {
//       "better-sqlite3": "^8.4.0",
//       "cors": "^2.8.5",
//       "express": "^4.18.2",
//       "ramda": "^0.29.0",
//       "validator": "^13.9.0",
//       "body-parser": "^1.20.2"
//     },
//      "engines": {
//         "node": "16.x"
//     }
//   }


// -- sqlite3で全てのテーブルとそのデータを削除するクエリ
// DROP TABLE IF EXISTS user_permission;
// DROP TABLE IF EXISTS users;
// DROP TABLE IF EXISTS links;
// DROP TABLE IF EXISTS likes;
// DROP TABLE IF EXISTS links_tags;
// DROP TABLE IF EXISTS tags;
// DROP TABLE IF EXISTS comments;
// DROP TABLE IF EXISTS comment_replies;

// -- ja: データ制限量
// -- en: Data limit

// -- ユーザーの権限のテーブル。カラムはIDはと名前と作成日と更新日を持つ。IDは自動的に増加する
// -- カラムの中には、一般ユーザー、ゲストユーザーがある
// -- ゲストユーザーはreadだけできる。一般ユーザーはread,write,deleteができる
// CREATE TABLE user_permission (
//   id INTEGER PRIMARY KEY,

//   permission TEXT NOT NULL,
//   readable INTEGER NOT NULL,
//   writable INTEGER NOT NULL,
//   deletable INTEGER NOT NULL, 
//   likable INTEGER NOT NULL,
//   commentable INTEGER NOT NULL,
//   data_limit INTEGER NOT NULL,

//   created_at DATETIME NOT NULL,
//   updated_at DATETIME NOT NULL
// );

// -- ユーザーのテーブル。カラムはIDはと名前とパスワードと作成日と更新日を持つ。IDは自動的に増加する
// CREATE TABLE users (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   user_permission_id INTEGER NOT NULL,
//   username TEXT NOT NULL,
//   userpassword TEXT NOT NULL,
//   created_at DATETIME NOT NULL,
//   updated_at DATETIME NOT NULL,
//   FOREIGN KEY (user_permission_id) REFERENCES user_permission(id)
// );

// -- linksというブログのようなサービスのテーブル。IDは自動的に増加する。userのIDを外部キーとして持つ
// CREATE TABLE links (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   link TEXT NOT NULL,
//   user_id INTEGER NOT NULL,
//   created_at DATETIME NOT NULL,
//   updated_at DATETIME NOT NULL,
//   FOREIGN KEY (user_id) REFERENCES users(id)
// );


// -- likesというブログの高評価ボタンのようなサービスのテーブル。IDは自動的に増加する。linkのIDを外部キーとして持つ
// CREATE TABLE likes (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   link_id INTEGER NOT NULL,
//   user_id INTEGER NOT NULL,
//   created_at DATETIME NOT NULL,
//   updated_at DATETIME NOT NULL,
//   FOREIGN KEY (link_id) REFERENCES link(id)
// );

// -- linksとtagsの中間テーブル
// CREATE TABLE links_tags (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   link_id INTEGER NOT NULL,
//   tag_id INTEGER NOT NULL,
//   created_at DATETIME NOT NULL,
//   updated_at DATETIME NOT NULL
// );

// -- tagsというブログのタグのようなサービスのテーブル。IDは自動的に増加する。links_tagsを外部キーとして持つ
// CREATE TABLE tags (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   tag TEXT NOT NULL
// );

// CREATE TABLE comments (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   link_id INTEGER NOT NULL,
//   user_id INTEGER NOT NULL,
//   comment TEXT NOT NULL,
//   created_at DATETIME NOT NULL,
//   updated_at DATETIME NOT NULL,
//   FOREIGN KEY (link_id) REFERENCES link(id)
// );

// CREATE TABLE comment_replies (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   comment_id INTEGER NOT NULL,
//   user_id INTEGER NOT NULL,
//   reply TEXT NOT NULL,
//   created_at DATETIME NOT NULL,
//   updated_at DATETIME NOT NULL,
//   FOREIGN KEY (comment_id) REFERENCES comments(id)
// );



// -- user_permissionにレコード挿入する
// INSERT INTO user_permission (id, permission,
// readable,
// writable,
// deletable,
// likable,
// commentable,
// data_limit,
// created_at, updated_at) VALUES (1, 'guest', 1, 0, 0, 0, 0,
// 200,
// DATETIME('now'), DATETIME('now'));
// INSERT INTO user_permission (id, permission,
// readable,
// writable,
// deletable,
// likable,
// commentable,
// data_limit,
// created_at, updated_at) VALUES (2, 'user', 1, 1, 1, 1, 1,
// 40000,
// DATETIME('now'), DATETIME('now'));

// INSERT INTO user_permission (id, permission,
// readable,
// writable,
// deletable,
// likable,
// commentable,
// data_limit,
// created_at, updated_at) VALUES (3, 'pro', 1, 1, 1, 1, 1,
// 400000,
// DATETIME('now'), DATETIME('now'));


// -- usersにデータをレコード挿入する
// INSERT INTO users (user_permission_id, username, userpassword, created_at, updated_at) VALUES (1, 'GUEST', 'GUEST_PASS', DATETIME('now'), DATETIME('now'));
// INSERT INTO users (user_permission_id, username, userpassword, created_at, updated_at) VALUES (2, 'user1', 'user_pass1', DATETIME('now'), DATETIME('now'));
// INSERT INTO users (user_permission_id, username, userpassword, created_at, updated_at) VALUES (2, 'user2', 'user_pass2', DATETIME('now'), DATETIME('now'));
// INSERT INTO users (user_permission_id, username, userpassword, created_at, updated_at) VALUES (3, 'pro1', 'pro_pass1', DATETIME('now'), DATETIME('now'));


// const R = require('ramda');
// const express = require('express');
// const sqlite = require('better-sqlite3');
// const db = new sqlite('./duct.sqlite3');
// const app = express();
// const bodyParser = require('body-parser');
// app.use(bodyParser.json());
// const cors = require('cors');
// const e = require('express');
// app.use(cors());
// const port = 8000;
// app.listen(port, "0.0.0.0", () => console.log(`App listening!! at http://localhost:${port}`) );
// app.listen(port, () => console.log(`App listening!! at http://localhost:${port}`) );


const request = require('supertest');
const app = require('./app');
const db = require('./db');


describe('POST /insert_link', () => {
  beforeAll(() => {
    // Create a test user with write permission
    db.prepare(`
      INSERT INTO users (username, password, permission) VALUES (?, ?, ?)
    `).run('testuser', 'testpassword', 'write');
  });

  afterAll(() => {
    // Delete the test user
    db.prepare(`
      DELETE FROM users WHERE username = ?
    `).run('testuser');
  });

  it('should return a 200 status code', async () => {
    const response = await request(app)
      .post('/insert_link')
      .send({ link: 'https://www.google.com/' })
      .set('Authorization', 'Bearer testuser:testpassword');
    expect(response.statusCode).toBe(200);
  });

  it('should insert a new link into the database', async () => {
    const response = await request(app)
      .post('/insert_link')
      .send({ link: 'https://www.yahoo.com/' })
      .set('Authorization', 'Bearer testuser:testpassword');
    const link = db.prepare(`
      SELECT * FROM links WHERE link = ?
    `).get('https://www.yahoo.com/');
    expect(link).toBeTruthy();
  });

  it('should return an error if the link is empty', async () => {
    const response = await request(app)
      .post('/insert_link')
      .send({ link: '' })
      .set('Authorization', 'Bearer testuser:testpassword');
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty('error');
  });

  it('should return an error if the link is not a valid URL', async () => {
    const response = await request(app)
      .post('/insert_link')
      .send({ link: 'not a valid URL' })
      .set('Authorization', 'Bearer testuser:testpassword');
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty('error');
  });

  it('should return an error if the link is not in the whitelist', async () => {
    const response = await request(app)
      .post('/insert_link')
      .send({ link: 'https://www.facebook.com/' })
      .set('Authorization', 'Bearer testuser:testpassword');
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty('error');
  });

  it('should return an error if the link is too long', async () => {
    const longLink = 'https://www.' + 'a'.repeat(300) + '.com/';
    const response = await request(app)
      .post('/insert_link')
      .send({ link: longLink })
      .set('Authorization', 'Bearer testuser:testpassword');
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty('error');
  });

  it('should return an error if the link contains SQL reserved words', async () => {
    const response = await request(app)
      .post('/insert_link')
      .send({ link: 'SELECT * FROM users' })
      .set('Authorization', 'Bearer testuser:testpassword');
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty('error');
  });

  it('should return an error if the user does not have write permission', async () => {
    // Create a test user without write permission
    db.prepare(`
      INSERT INTO users (username, password, permission) VALUES (?, ?, ?)
    `).run('testuser2', 'testpassword', 'read');
    const response = await request(app)
      .post('/insert_link')
      .send({ link: 'https://www.google.com/' })
      .set('Authorization', 'Bearer testuser2:testpassword');
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty('error');
    // Delete the test user
    db.prepare(`
      DELETE FROM users WHERE username = ?
    `).run('testuser2');
  });

  it('should return an error if the link already exists in the database', async () => {
    const response = await request(app)
      .post('/insert_link')
      .send({ link: 'https://www.google.com/' })
      .set('Authorization', 'Bearer testuser:testpassword');
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty('error');
  });
});