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
app.get('/', (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(1);
    console.log('Hello World, this is the TEST mode!!!!');
    console.log(JSON.stringify(user).length);
    res.json({message: 'Hello World, this is the TEST mode!!!!'});
});

const now = () => new Date().toISOString();
// expressの一般的なエラーのレスポンス。引数としてエラー文字列を含めて呼び出す
const error_response = (res, error_message) => res.json({error: error_message});

const get_user_with_permission = (REQ) => db.prepare(`
`).get(REQ.body.name, REQ.body.password);

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

