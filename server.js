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


const R = require('ramda');
const express = require('express');
const sqlite = require('better-sqlite3');
const db = new sqlite('./duct.sqlite3');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());
const port = 8000;
app.listen(port, "0.0.0.0", () => console.log(`App listening!! at http://localhost:${port}`) );
// app.listen(port, () => console.log(`App listening!! at http://localhost:${port}`) );

const now = () => new Date().toISOString();
// expressの一般的なエラーのレスポンス。引数としてエラー文字列を含めて呼び出す
const error_response = (res, error_message) => res.json({error: error_message});

const get_user_with_permission = (REQ) =>  db.prepare(`
SELECT users.id AS user_id, users.username AS username, user_permission.permission AS user_permission,
user_permission.deletable AS deletable,
user_permission.writable AS writable,
user_permission.readable AS readable,
user_permission.likable AS likable,
user_permission.commentable AS commentable
FROM users
LEFT JOIN user_permission ON users.user_permission_id = user_permission.id
WHERE users.username = ? AND users.userpassword = ?
`).get(REQ.body.name, REQ.body.password);

app.get('/', (req, res) => {
    console.log('Hello World, this is the TEST mode!!!!');
    res.json({message: 'Hello World, this is the TEST mode!!!!'});
});

// get_user_with_permission
app.post('/get_user_with_permission', (req, res) => {
    try {
        // console.log('get_user_with_permission');
        const result = get_user_with_permission(req);
        res.json(result);
    } catch (error) {
        console.log(error);
        error_response(res, error);
    }
});

// read_all
app.get('/read_all', (req, res) => {
  try {
    const pre_result = db.prepare(`
      SELECT

    `).all();

    const result = pre_result.map(parent => {
      const tags = db.prepare(`
        SELECT
        WHERE brabra = ?
      `).all(id);

      const comments = db.prepare(`
      SELECT
      WHERE brabra = ?
      `).all(id);

        const comments_and_replies = comments.map(comment => {
            const comment_replies = db.prepare(`
            SELECT
            WHERE brabra = ?    
            `).all(id);
            return {
                ...comment,
                comment_replies,
            }
        });

      return {
        ...parent,
        dups,
        tags,
        comments_and_replies,
      };
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    error_response(res, '原因不明のエラー' + error);
  }
});

