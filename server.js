// const test_mode = () => true;
const test_mode = () => false;


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


function db_init2(DB) {
    try {
    console.log('db_init start');

    // DB.nameがduct_test.sqlite3ではない場合は終了する
    const CHECK_DB_RES = DB.name === './duct_test.sqlite3' ? 'OK' : 'ERROR';
    console.log('CHECK_DB_RES', CHECK_DB_RES);
    if(CHECK_DB_RES === 'ERROR') {
        console.log(CHECK_DB_RES);
        (()=>{throw new Error('test dbでは無い')})()
    }
    const { exec } = require('child_process');

    // const command = 'sqlite3 ./duct_test.sqlite3 < ./init.sql';
    const command = 'sqlite3 ' + DB.name +  ' < ./init.sql';

    exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);

    console.log('db_init done');
    });
    } catch (error) {
        console.log('db_init error');
        console.log(error);
    }
}

function db_close2(DB) {
    try {
    console.log('db_close start');

    // DB.nameがduct_test.sqlite3ではない場合は終了する
    const CHECK_DB_RES = DB.name === './duct_test.sqlite3' ? 'OK' : 'ERROR';
    console.log('CHECK_DB_RES', CHECK_DB_RES);
    if(CHECK_DB_RES === 'ERROR') {
        console.log(CHECK_DB_RES);
        (()=>{throw new Error('test dbでは無い')})()
    }
    const { exec } = require('child_process');

    const command = 'sqlite3 ' + DB.name +  ' < ./drop_all_table.sql';

    exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);

    console.log('db_close done');
    });
    } catch (error) {
        console.log('db_close error');
        console.log(error);
    }
}

// const R = require('ramda');
const validator = require('validator');
const express = require('express');
const sqlite = require('better-sqlite3');


// test_modeがtrueの時は、テスト用のDBのduct_test.sqlite3を使う。falseの時はduct.sqlite3を使う
const db = test_mode() === true ? new sqlite('./duct_test.sqlite3') : new sqlite('./duct.sqlite3');


// dbをexportする
// const db = new sqlite('./duct.sqlite3');


const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());
const port = 8000;
app.listen(port, "0.0.0.0", () => console.log(`App listening!! at http://localhost:${port}`) );

const now = () => new Date().toISOString();
// expressの一般的なエラーのレスポンス。引数としてエラー文字列を含めて呼び出す。statusコードも含めて返す
const error_response = (res, status_code, error_message) => res.status(status_code).json({error: error_message});


// test_mode() === trueかつNAMEとPASSWORDが一致し、test_modeがTEST_MODEである時にduct_test.sqlite3を初期化する
app.post('/test_db_init', (req, res) => {
try {
    req.body.test_mode === 'TEST_MODE' ? null : (()=>{throw new Error('test_modeがTEST_MODEでは無い')})();
    // overwrite_password関数はID/PASSWORDの秘匿化のための応急処置として使用する
    // ローカル環境でも.dataという隠しフォルダを使うことで、秘匿化を実現する
    // glitch.comにおいてpravateな情報を扱う場合は、.dataフォルダに格納する
    // REQ.body.nameがlines[0]と一致し、
    // REQ.body.passwordがlines[2]と一致する場合に'OK'を返す
    const overwrite_password_FOR_TEST = (REQ) => {
        try {
        const FILE_NAME = './.data/TEST_MODE_for_overwriting_id_password.csv';
        const fs = require('fs');
        const line = fs.readFileSync(FILE_NAME, 'utf8').split(',');
        console.log(
            'REQ.body.name,', REQ.body.name,
            'line[0],', line[0],
            'REQ.body.password,', REQ.body.password,
            'line[2],', line[2]
        )
        const result = REQ.body.name === line[0] && REQ.body.password === line[2] ? 'OK' : 'ERROR';
        if (result === 'ERROR') {
            return 'ERROR';
        };
        // return [REQ.body.name, result];
        return 'OK';
        } catch (error) {
            (()=>{throw new Error('無効な認証(overwrite_password)')})()
        }
    };
    // console.log(req.body.test_mode);
    // console.log(overwrite_password_FOR_TEST(req));
    const test_can = (overwrite_password_FOR_TEST(req) === 'OK' && req.body.test_mode === 'TEST_MODE')
        ? 'OK'
        : (()=>{throw new Error('権限がありません')})();
    // test_mode() === trueかつNAMEとPASSWORDが一致し、test_modeがTEST_MODEである時にduct_test.sqlite3を初期化する
    (test_mode() === true && test_can === 'OK') ? db_init2(db) : (()=>{throw new Error('何かのエラー')})();
    (req.body.test_mode_close !== undefined && req.body.test_mode_close) === 'TEST_MODE_CLOSE' ? db_close2(db) : null;
    res.status(200)
        .json({result: 'success'
            // ,message: 'test_db_init done'
        });
    } catch (error) {
        res.status(400).json({result: 'fail', message: error.message});
    }
});



// en: should return null with invalid credentials
// ja: 無効な認証情報でnullを返すべき
// en: should return null with non-existent username
// ja: 存在しないユーザー名でnullを返すべき
const get_user_with_permission = (REQ) => {
    try {
    // overwrite_password関数はID/PASSWORDの秘匿化のための応急処置として使用する
    // glitch.comにおいてpravateな情報を扱う場合は、.dataフォルダに格納する
    // REQ.body.nameがlines[0]と一致し、
    // REQ.body.passwordがlines[2]と一致する場合に
    // REQ.body.passwordをlines[1]に書き換える関数
    // overwrite_passwordを一行関数で
    const overwrite_password = (REQ) => {
        try {
        const FILE_NAME = './.data/for_overwriting_id_password.csv';
        // csvファイルを読み込んで','でsplitしてconsole.logする
        const fs = require('fs');
        const line = fs.readFileSync(FILE_NAME, 'utf8').split(',');
        const result = REQ.body.name === line[0] && REQ.body.password === line[2] ? line[1] : REQ.body.password;
        return [REQ.body.name, result];
        } catch (error) {
            (()=>{throw new Error('無効な認証(overwrite_password)')})()
        }
    };
    // 本番環境においてはoverwrite_passwordを実行
    // [REQ.body.name, REQ.body.password] = overwrite_password(req, line);

    // 無効な認証情報をエラーで返す
    if (REQ.body.name === '' || REQ.body.password === '' || REQ.body.name === undefined || REQ.body.password === undefined || REQ.body.name === null || REQ.body.password === null
        || REQ.body.name.length > 20 || REQ.body.password.length > 20 || REQ.body.name.length < 4 || REQ.body.password.length < 4
        || REQ.body.name.includes(' ') || REQ.body.password.includes(' ')
        || REQ.body.name.includes('　') || REQ.body.password.includes('　')
    ) {
        (()=>{throw new Error('無効な認証')})();
    }
    //  存在しないユーザー名も無効な認証で返す
    if (db.prepare(`
    SELECT users.id AS user_id, users.username AS username, user_permission.permission AS user_permission,
    user_permission.deletable AS deletable,
    user_permission.writable AS writable,
    user_permission.readable AS readable,
    user_permission.likable AS likable,
    user_permission.commentable AS commentable
    FROM users
    LEFT JOIN user_permission ON users.user_permission_id = user_permission.id
    WHERE users.username = ? AND users.userpassword = ?
    `).get(REQ.body.name, REQ.body.password) === undefined) {
        (()=>{throw new Error('無効な認証')})();
    }

    return db.prepare(`
    SELECT users.id AS user_id, users.username AS username, user_permission.permission AS user_permission,
    user_permission.deletable AS deletable,
    user_permission.writable AS writable,
    user_permission.readable AS readable,
    user_permission.likable AS likable,
    user_permission.commentable AS commentable
    FROM users
    LEFT JOIN user_permission ON users.user_permission_id = user_permission.id
    WHERE users.username = ? AND users.userpassword = ?
    `).get(REQ.body.name, REQ.body.password)
         ? db.prepare(`
         SELECT users.id AS user_id, users.username AS username, user_permission.permission AS user_permission,
         user_permission.deletable AS deletable,
         user_permission.writable AS writable,
         user_permission.readable AS readable,
         user_permission.likable AS likable,
         user_permission.commentable AS commentable
         FROM users
         LEFT JOIN user_permission ON users.user_permission_id = user_permission.id
         WHERE users.username = ? AND users.userpassword = ?
         `).get(REQ.body.name, REQ.body.password)
         : (()=>{throw new Error('無効な認証')})();
    } catch (error) {
        console.log(error.message);
        res.status(400).json({result: 'fail', message: error.message});
    }
};




app.get('/', (req, res) => {
    console.log('Hello World, this is the TEST mode!!!!');
    res.json({message: 'Hello World, this is the TEST mode!!!!'});
});

app.get('/read_all', (req, res) => {
    try {
    const read_query = (req) => {
        try {
            // req.bodyに ASC,DESC,TAG,USERがある場合は、それぞれの条件に合わせてSQL文を変更する関数
            const REQ_TAG = req.query.tag ? req.query.tag : null;
            // REQ_TAGがtagsテーブルに存在しない場合は、エラーを返す
            //   db.prepare(`SELECT * FROM tags WHERE tag = ?`).get(REQ_TAG) === undefined ? (()=>{throw new Error('そんなタグねえよ')})() : null;
            const USER = req.query.user ? req.query.user : null;
            // req.query.userがSQLとして不正な場合は、エラーを返す
            USER
                ? db.prepare(`SELECT * FROM users WHERE username = ?`).get(USER) === undefined
                    ? (()=>{throw new Error('不正なクエリ')})() : null
                : null;

            const WHERE_TAG_AND_USER = REQ_TAG && USER ? ' WHERE tags.tag = @tag AND users.username = @user ' : null;
            const WHERE_TAG = REQ_TAG ? ' WHERE tags.tag = @tag ' : null;
            const WHERE_USER = USER ? ' WHERE users.username = @user ' : null;
            const WHERE = WHERE_TAG_AND_USER || WHERE_TAG || WHERE_USER || null;

            const ORDER_BY = req.query.order_by === 'ASC' ? 'ASC' : 'DESC';
            const ORDER_BY_COLUMN = req.query.order_by_column ? req.query.order_by_column : 'links.id';
            // req.query.tagがある場合cross tableでtagsテーブルを結合する
            const tag_join_option = req.query.tag ? ' LEFT JOIN links_tags ON links.id = links_tags.link_id LEFT JOIN tags ON links_tags.tag_id = tags.id' : '';

            //   `${STANDARD_READ_QUERY} ${WHERE} ORDER BY ${ORDER_BY_COLUMN} ${ORDER_BY}`
            // WHEREがある場合のSQL文
            const STANDARD_READ_QUERY_1 = `
            SELECT
            links.id AS id, links.link AS link, links.created_at AS created_at, links.updated_at AS updated_at,
            users.id AS user_id, users.username AS username,
            (SELECT COUNT(*) FROM likes WHERE likes.link_id = links.id) AS like_count
            FROM links
            LEFT JOIN users ON links.user_id = users.id
            LEFT JOIN likes ON links.id = likes.link_id`
            + tag_join_option
            + WHERE
            + ' ORDER BY @order_by_column ' + ORDER_BY
            ;

            //   `${STANDARD_READ_QUERY} ORDER BY ${ORDER_BY_COLUMN} ${ORDER_BY}`
            // WHEREがない場合のSQL文
            const STANDARD_READ_QUERY_2 = `
            SELECT
            links.id AS id, links.link AS link, links.created_at AS created_at, links.updated_at AS updated_at,
            users.id AS user_id, users.username AS username,
            (SELECT COUNT(*) FROM likes WHERE likes.link_id = links.id) AS like_count
            FROM links
            LEFT JOIN users ON links.user_id = users.id
            LEFT JOIN likes ON links.id = likes.link_id`
            + tag_join_option
            + ' ORDER BY @order_by_column ' + ORDER_BY
            ;

            const QUERY_WITH_PARAM_OBJ = WHERE
                ? {query_type: 1, query: STANDARD_READ_QUERY_1, order_by_column: ORDER_BY_COLUMN, tag: REQ_TAG, user: USER}
                : {query_type: 2, query: STANDARD_READ_QUERY_2, order_by_column: ORDER_BY_COLUMN};
            return QUERY_WITH_PARAM_OBJ;
        } catch (error) {
            (()=>{throw new Error(error.message)})();
        }
    };

    const QUERY_WITH_PARAM_OBJ = read_query(req);
      const pre_result = 
        QUERY_WITH_PARAM_OBJ.query_type === 1
            ?
                db.prepare(
                    QUERY_WITH_PARAM_OBJ.query
                ).all(
                    {
                    tag: QUERY_WITH_PARAM_OBJ.tag,
                    user: QUERY_WITH_PARAM_OBJ.user,
                    order_by_column: QUERY_WITH_PARAM_OBJ.order_by_column
                    }
                )
            :
                db.prepare(
                    QUERY_WITH_PARAM_OBJ.query
                ).all(
                    {
                    order_by_column: QUERY_WITH_PARAM_OBJ.order_by_column
                    }
                );
            ;

            const result = pre_result.map(parent => {
              const tags = db.prepare(`
                SELECT
                tags.id AS id, tags.tag AS tag
                FROM tags
                LEFT JOIN links_tags ON tags.id = links_tags.tag_id
                WHERE links_tags.link_id = ?
              `).all(parent.id);
        
              const comments = db.prepare(`
                SELECT
                comments.id AS id, comments.comment AS comment, comments.created_at AS created_at, comments.updated_at AS updated_at,
                users.id AS user_id, users.username AS username
                FROM comments
                LEFT JOIN links ON comments.link_id = links.id
                LEFT JOIN users ON comments.user_id = users.id
                WHERE links.id = ?
              `).all(parent.id);
        
                const comments_and_replies = (comments ? comments : []).map(comment => {
                    const comment_replies = db.prepare(`
                    SELECT
                    comment_replies.id AS id, comment_replies.reply AS reply, comment_replies.created_at AS created_at, comment_replies.updated_at AS updated_at,
                    users.id AS user_id, users.username AS username
                    FROM comment_replies
                    LEFT JOIN comments ON comment_replies.comment_id = comments.id
                    LEFT JOIN users ON comment_replies.user_id = users.id
                    WHERE comments.id = ?
                    `).all(comment.id);
                    return {
                        ...comments,
                        comment_replies,
                    }
                });
        
              return {
                ...parent,
                tags,
                comments_and_replies,
              };
            });
        
        // res.json(QUERY_WITH_PARAM_OBJ);
        // res.json('test');
        // res.json(pre_result);
    res.status(200)
        .json({result: 'success'
            ,message: response.lastInsertRowid
        });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({result: 'fail', message: error.message});
    }
});
  



// linkのデータを削除する
app.post('/delete_link', (req, res) => {
    try {
        const user = get_user_with_permission(req);
        user || user.deletable ? null : (()=>{throw new Error('権限がありません')})();
        // // linkに紐づくlike、comment、comment_replyが存在するなら、それらを削除する
        db.prepare(`SELECT * FROM likes WHERE link_id = ? AND user_id = ?`).get(req.body.id, user.user_id) ? db.prepare(`DELETE FROM likes WHERE link_id = ? AND user_id = ?`).run(req.body.id, user.user_id) : null;
        db.prepare(`SELECT * FROM comment_replies LEFT JOIN comments ON comment_replies.comment_id = comments.id WHERE comments.link_id = ? AND comment_replies.user_id = ?`).get(req.body.id, user.user_id) ? db.prepare(`DELETE FROM comment_replies LEFT JOIN comments ON comment_replies.comment_id = comments.id WHERE comments.link_id = ? AND comment_replies.user_id = ?`).run(req.body.id, user.user_id) : null;
        db.prepare(`SELECT * FROM comments WHERE link_id = ? AND user_id = ?`).get(req.body.id, user.user_id) ? db.prepare(`DELETE FROM comments WHERE link_id = ? AND user_id = ?`).run(req.body.id, user.user_id) : null;
        // linkに紐づくlinks_tagsを削除し、tagが他のlinkに紐づいていなければ、tagも削除する
        const tags = db.prepare(`SELECT * FROM links_tags WHERE link_id = ?`).all(req.body.id) || [];
        tags.forEach(tag => {
            const tag_links = db.prepare(`SELECT * FROM links_tags WHERE tag_id = ?`).all(tag.tag_id);
            tag_links.length === 1 ? db.prepare(`DELETE FROM tags WHERE id = ?`).run(tag.tag_id) : null;
        });
        db.prepare(`SELECT * FROM links_tags WHERE link_id = ?`).all(req.body.id).length ? db.prepare(`DELETE FROM links_tags WHERE link_id = ?`).run(req.body.id) : null;
        // linkを削除する
        db.prepare(`SELECT * FROM links WHERE id = ? AND user_id = ?`).get(req.body.id, user.user_id) ? db.prepare(`DELETE FROM links WHERE id = ? AND user_id = ?`).run(req.body.id, user.user_id) : (()=>{throw new Error('削除するlinkが見つかりません')})();
        res.status(200).json({result: 'success'});
    } catch (error) {
        console.log(error);
        res.status(400).json({result: 'fail', message: error.message});
    }
});

// linkに紐づくlikeをインクリメントする、既にlikeが存在する場合はデクリメントする、1ユーザー1linkにつき1likeまで。
app.post('/like_increment_or_decrement', (req, res) => {
    try {
        const user = get_user_with_permission(req);
        user || user.likable ? null : (()=>{throw new Error('権限がありません')})();

        const error_check = (user_id, link_id) => {
            const user_exists = db.prepare(`SELECT * FROM users WHERE id = ?`).get(user_id);
            const link_exists = db.prepare(`SELECT * FROM links WHERE id = ?`).get(link_id);
            return !user_exists ?  (()=>{throw new Error('no existing user_id should return 400')})() :
                    !link_exists ? (()=>{throw new Error('no existing link_id should return 400')})() :
                    null;
        };
        error_check(req.body.user_id, req.body.link_id);

        const like_exists = db.prepare(`SELECT * FROM likes WHERE user_id = ? AND link_id = ?`).get(user.user_id, req.body.link_id)
            ? true
            : (()=>{throw new Error('そんなlikeは無えよ')})();
        const response = like_exists
            ? db.prepare(`DELETE FROM likes WHERE user_id = ? AND link_id = ?`).run(user.user_id, req.body.link_id)
            : db.prepare(`INSERT INTO likes (user_id, link_id, created_at, updated_at) VALUES (?, ?, ?, ?)`).run(user.user_id, req.body.link_id, now(), now());
        // res.status(200).json({message: 'success', result: result});
        res.status(200).json({result: 'success', message: response});
    } catch (error) {
        console.log(error);
        error: 
        res.status(400).json({result: 'fail', message: error.message});
    }
});



const error_check_for_insert_tag = (tag) => {
    const reserved_words = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'DELETE', 'UPDATE', 'DROP', 'ALTER', 'CREATE', 'TABLE', 'INTO', 'VALUES', 'AND', 'OR', 'NOT', 'NULL', 'TRUE', 'FALSE'];
    // 空白を含むかチェックする1行の関数。大文字の空白もチェックする。含まれていたらtrueを返す
    const checkForSpaces = (tag) => {
        console.log('checkForSpaces');
        // console.log(tag);
        const spaces = [' ', '　'];
        // tagの中に空白が含まれているかチェックする。含まれていたらtrueを返す
        const hoge = spaces.some((space) => tag.includes(space));
        console.log('hoge is', hoge);

        return spaces.some((space) => tag.includes(space));
    }
    // 記号が含まれているかチェックする1行の関数。含まれていたらtrueを返す
    const checkForSymbols = (tag) => {
        console.log('checkForSymbols');
        const symbols = ['-', '#', '!', '$', '@', '%', '^', '&', '*', '(', ')', '_', '+', '|', '~', '=', '`', '{', '}', '[', ']', ':', '"', ';', '\'', '<', '>', '?', ',', '.', '/', ' '];
        return symbols.some((symbol) => tag.includes(symbol));
    };    
    switch (true) {
        case tag === undefined: return 'tagが空です'; break;
        // checkForSymbolsに空白チェックが含まれるため、先にチェックする
        case checkForSpaces(tag) : return '空白を含む場合はエラー'; break;
        // /^[-#!$@%^&*()_+|~=`{}\[\]:";'<>?,.\/ ]$/を含む場合はエラー。'記号を含む場合はエラー'を返す
        case checkForSymbols(tag) : return '記号を含む場合はエラー'; break;
        case tag.length > 7: return '7文字以上はエラー'; break;
        case reserved_words.includes(tag): return 'SQLの予約語を含む場合はエラー'; break;
        default: return 'OK'; break;
    }
};
// tagにデータをレコード挿入するエンドポイント
// 既に存在する場合は、既存のタグを返す
// 存在しない場合は、新規にタグを作成して返す
// 既存のタグを返す場合は、links_tagsにレコードを挿入する
// 新規にタグを作成して返す場合は、tagsにレコードを挿入して、links_tagsにレコードを挿入する
app.post('/insert_tag', (req, res) => {
    try {
        const get_tag_id_by_tag_name_for_insert_tag = (TAG) => {
            const tag = db.prepare(`SELECT id, tag FROM tags WHERE tag = ?`).get(TAG)
                ? db.prepare(`SELECT id, tag FROM tags WHERE tag = ?`).get(TAG).id
                : null;
                return tag;
        };
        const insert_tag_for_insert_tag = (REQ, TAG) => {
            try {
            // linkに対して既に同じタグがついているかチェックし、ついていたらエラーを返す
            db.prepare(`
            SELECT
            tags.id AS id, tags.tag AS tag
            FROM tags
            LEFT JOIN links_tags ON tags.id = links_tags.tag_id
            WHERE links_tags.link_id = ?
            AND tags.tag = ?
                `).get(REQ.body.link_id, TAG.tag)
                    ? (()=>{throw new Error('既に同じタグがついています')})()
                    : null;

                
            const RESULT = db.prepare(`INSERT INTO links_tags (link_id, tag_id, created_at, updated_at) VALUES (?, ?, ?, ?)`).run(REQ.body.link_id, TAG.id, now(), now())
                ? res.json({message: 'success'})
                    : (()=>{throw new Error('links_tagsにレコードを挿入できませんでした')})();
            console.log('RESULT is', RESULT);
            // return RESULT ? RESULT.id : null;
            return RESULT;
            } catch (error) {
                (()=>{throw new Error('既に同じタグがついているか、何かのタグの新規追加エラー')})()
            }
        };
        const make_tag_and_insert_tag_for_insert_tag = (TAG, LINK_ID) => {
            try {
            // linkに対して既に同じタグがついているかチェックし、ついていたらエラーを返す
            db.prepare(`
            SELECT
            tags.id AS id, tags.tag AS tag
            FROM tags
            LEFT JOIN links_tags ON tags.id = links_tags.tag_id
            WHERE links_tags.link_id = ?
            AND tags.tag = ?
            `).get(LINK_ID, TAG)
                    ? (()=>{throw new Error('既に同じタグがついています')})()
                    : null;

            db.prepare(`INSERT INTO tags (tag) VALUES (?)`).run(TAG)
                ? null
                // : (()=>{throw new Error({res: 'tagsにレコードを挿入できませんでした', status: 500})})();
                : (()=>{throw new Error('tagsにレコードを挿入できませんでした')})();
            const newTag = db.prepare(`SELECT id, tag FROM tags WHERE tag = ?`).get(TAG)
                ? db.prepare(`SELECT id, tag FROM tags WHERE tag = ?`).get(TAG)
                : (()=>{throw new Error('tagsにレコードを挿入できませんでした')})();
            db.prepare(`INSERT INTO links_tags (link_id, tag_id, created_at, updated_at) VALUES (?, ?, ?, ?)`).run(LINK_ID, newTag.id, now(), now())
                ? null
                // : (()=>{throw new Error({res: 'links_tagsにレコードを挿入できませんでした', status: 500})})();
                : (()=>{throw new Error('links_tagsにレコードを挿入できませんでした')})();
            return newTag;
            } catch (error) {
                (()=>{throw new Error('既に同じタグがついているか、何かの既存タグ追加エラー')})()
            }
        };
    const error_check_result = error_check_for_insert_tag(req.body.tag);
    error_check_result === 'OK' ? null : (()=>{throw new Error(error_check_result)})();
    const user = get_user_with_permission(req);
    user || user.writable ? null : (()=>{throw new Error('書き込み権限がありません')})();
console.log('get_tag_id_by_tag_name_for_insert_tag');
    const tag = get_tag_id_by_tag_name_for_insert_tag(req.body.tag) ? req.body.tag : null;
    tag ? insert_tag_for_insert_tag(req, tag) : make_tag_and_insert_tag_for_insert_tag(req.body.tag, req.body.link_id);

    // res.status(200).json({result: 'success insert tag'});
    // res.status(200).json({message: 'success', result: result});
    res.status(200)
        .json({result: 'success'
            // ,message: response.lastInsertRowid
        });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({result: 'fail', message: error.message});
    }
});

app.post('/get_tags_for_autocomplete', (req, res) => {
    try {
    console.log(req.body.tag);
    const user = get_user_with_permission(req);
    user.readable === 1 ? null : (()=>{throw new Error('読み込み権限がありません')})();
    const tags = 
        req.body.tag === undefined ?
            db.prepare(`SELECT * FROM tags LIMIT 100`).all() :
            db.prepare(`SELECT * FROM tags WHERE tag LIKE '%${req.body.tag}%' LIMIT 100`).all();

    res.status(200)
        .json({result: 'success'
            ,message: tags
        });
    } catch (error) {
    console.log(error);
    // error_response(res, 'ERROR: ' + error);
    res.status(400).json({result: 'fail', message: error.message});
    }
});

// commentsのデータを挿入する
// 1ユーザーにつき1つのlinkに対して1つのcommentしか挿入できない。
// commentの文字数はuser_permissionのdata_limitに依存する。commentの文字数がdata_limitを超える場合はエラー
// 空の場合はエラー。記号を含む場合はエラー。空白を含む場合はエラー。SQLの予約語を含む場合はエラー。
// 300文字以上はエラー。既に同じcommentが存在する場合はエラー
const error_check_insert_comment = (comment, DATA_LIMIT) => {
    const reserved_words = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'DELETE', 'UPDATE', 'DROP', 'ALTER', 'CREATE', 'TABLE', 'INTO', 'VALUES', 'AND', 'OR', 'NOT', 'NULL', 'TRUE', 'FALSE'];
    switch (true) {
        case comment === undefined: return 'commentが空の場合はエラー'; break;
        case comment.length > DATA_LIMIT: return 'commentの文字数がdata_limitを超える場合はエラー'; break;
        case comment.length === 0: return '0文字の場合はエラー'; break;
        case comment.match(/[!-/:-@[-`{-~]/g): return '記号を含む場合はエラー'; break;
        case comment.match(/\s/g): return '空白を含む場合はエラー'; break;
        case comment.length > 300: return '300文字以上はエラー'; break;
        case reserved_words.includes(comment): return 'SQLの予約語を含む場合はエラー'; break;
        default: return 'OK'; break;
    }
}
app.post('/insert_comment', (req, res) => {
    try {
        const user = get_user_with_permission(req);
        user || user.commentable ? null : (()=>{throw new Error('権限がありません')})();

        const error_check_result = error_check_insert_comment(req.body.comment, user.data_limit);
        error_check_result === 'OK' ? null : (()=>{throw new Error(error_check_result)})();

        db.prepare(`SELECT COUNT(*) AS count FROM comments WHERE user_id = ? AND link_id = ?`).get(user.user_id, req.body.link_id).count > 0 ? (()=>{throw new Error('既に同じcommentが存在する場合はエラー')})() : null;

        const result = db.prepare(`INSERT INTO comments (user_id, link_id, comment, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`).run(user.user_id, req.body.link_id, req.body.comment, now(), now());
    res.status(200)
        .json({result: 'success'
            // ,message: response.lastInsertRowid
        });
    } catch (error) {
        console.log(error);
        console.log(error.message);
        res.status(400).json({result: 'fail', message: error.message});
    }
});

app.post('/delete_comment', (req, res) => {
    try {
        const user = get_user_with_permission(req);
        user || user.commentable ? null : (()=>{throw new Error('権限がありません')})();
        // commentに紐づくcomment_replyがある場合は、comment_replyのレコードを削除す
        db.prepare(`SELECT * FROM comment_replies WHERE comment_id = ? AND user_id = ?`).get(req.body.comment_id, user.user_id)
            ?
            db.prepare(`DELETE FROM comment_replies WHERE comment_id = ? AND user_id = ?`).run(req.body.comment_id, user.user_id)
            : null;
        db.prepare(`SELECT * FROM comments WHERE id = ? AND user_id = ?`).get(req.body.comment_id, user.user_id)
            ?
            db.prepare(`DELETE FROM comments WHERE id = ? AND user_id = ?`).run(req.body.comment_id, user.user_id)
            : (()=>{throw new Error('権限がありません')})();
    res.status(200)
        .json({result: 'success'
            // ,message: response.lastInsertRowid
        });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({result: 'fail', message: error.message});
    }
    //     res.json({message: 'success'});
    // } catch (error) {
    //     console.log(error);
    //     error_response(res, '原因不明のエラー' + error);
    // }
});

// comment_repliesのデータを挿入する
// 1ユーザーにつき1つのcommentに対して1つのcomment_replyしか挿入できない。
// comment_replyの文字数はuser_permissionのdata_limitに依存する。comment_replyの文字数がdata_limitを超える場合はエラー
// 空の場合はエラー。記号を含む場合はエラー。空白を含む場合はエラー。SQLの予約語を含む場合はエラー。
// 10文字以上はエラー。既に同じcomment_replyが存在する場合はエラー
const error_check_insert_comment_reply = (comment_reply, DATA_LIMIT) => {
    const reserved_words = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'DELETE', 'UPDATE', 'DROP', 'ALTER', 'CREATE', 'TABLE', 'INTO', 'VALUES', 'AND', 'OR', 'NOT', 'NULL', 'TRUE', 'FALSE'];
    switch (true) {
        case comment_reply === undefined: return 'comment_replyが空の場合はエラー'; break;
        case comment_reply.length > DATA_LIMIT: return 'comment_replyの文字数がdata_limitを超える場合はエラー'; break;
        case comment_reply.length === 0: return '0文字の場合はエラー'; break;
        case comment_reply.match(/[!-/:-@[-`{-~]/g): return '記号を含む場合はエラー'; break;
        case comment_reply.match(/\s/g): return '空白を含む場合はエラー'; break;
        case comment_reply.length > 10: return '10文字以上はエラー'; break;
        case reserved_words.includes(comment_reply): return 'SQLの予約語を含む場合はエラー'; break;
        default: return 'OK'; break;
    }
}
app.post('/insert_comment_reply', (req, res) => {
    try {
        const user = get_user_with_permission(req);
        user || user.commentable ? null : (()=>{throw new Error('権限がありません')})();

        const error_check_result = error_check_insert_comment_reply(req.body.comment_reply, user.data_limit);
        error_check_result === 'OK'
            ? null
            : (()=>{throw new Error(error_check_result)})();

        db.prepare(`SELECT COUNT(*) AS count FROM comment_replies WHERE user_id = ? AND comment_id = ?`).get(user.user_id, req.body.comment_id).count > 0
            ? (()=>{throw new Error('既に同じcomment_replyが存在する場合はエラー')})()
            : null;

        const response =
            db.prepare(`INSERT INTO comment_replies (user_id, comment_id, reply, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`)
                .run(user.user_id, req.body.comment_id, req.body.comment_reply, now(), now());
    res.status(200)
        .json({result: 'success'
            ,message: response.lastInsertRowid
        });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({result: 'fail', message: error.message});
    }
});

app.post('/delete_comment_reply', (req, res) => {
    try {
        const user = get_user_with_permission(req);
        user || user.commentable ? null : (()=>{throw new Error('権限がありません')})();
        db.prepare(`SELECT * FROM comment_replies WHERE id = ? AND user_id = ?`).get(req.body.comment_reply_id, user.user_id)
            ?
            db.prepare(`DELETE FROM comment_replies WHERE id = ? AND user_id = ?`).run(req.body.comment_reply_id, user.user_id)
            : (()=>{throw new Error('権限がありません')})();
        // res.json({message: 'success'});
        res.status(200)
            .json({result: 'success'
                // ,message: result.lastInsertRowid
            });
    } catch (error) {
        console.log(error);
        error_response(res, '原因不明のエラー' + error);
    }
});










































































const error_check_for_insert_link = (link) => {
    const WHITE_LIST_URL_ARRAY = [
        'https://yanaka.dev/',
        'https://www.yahoo.co.jp/',
        'https://www.google.co.jp/',
        'https://www.youtube.com/',
    ];    
    const reserved_words = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'DELETE', 'UPDATE', 'DROP', 'ALTER', 'CREATE', 'TABLE', 'INTO', 'VALUES', 'AND', 'OR', 'NOT', 'NULL', 'TRUE', 'FALSE'];
    const is_url = (url) => (/^(https?):\/\/[^\s/$.?#].[^\s]*$/i).test(url);
    const is_include_WHITE_LIST_URL = (target_url_str) => WHITE_LIST_URL_ARRAY.some((WHITE_LIST_URL) => target_url_str.startsWith(WHITE_LIST_URL));

    !is_url(link) ? console.log('URLの形式が正しくありません') : null;
    console.log('link is' + link + '!!');

    switch (true) {
    case link === undefined:
        return 'linkが空です';
    case reserved_words.includes(link):
        return 'SQLの予約語を含む場合はエラー';
    case link.length > 2000:
        return 'URLが長すぎます';
    case !is_url(link):
        return 'URLの形式が正しくありません';
    case !is_include_WHITE_LIST_URL(link):
        return '許可されていないURLです';
    default:
        return 'OK';
    }
    // !is_url(link) ? (()=>{throw new Error('URLの形式が正しくありません')})() : null;
    // console.log('link is' + link + '!!');
    // return !is_url(link) ? 'URLの形式が正しくありません' : null;
};
// linkにデータをレコード挿入するエンドポイント
// 正しいリンクが挿入されたときに200を返しresultをjsonで返す
// リンクが空のときに400 Bad Requestを返す
// リンクが正しいURLの形式でないときに400 Bad Requestを返す
// リンクがホワイトリストに含まれていないときに403 Forbiddenを返す
// リンクが300文字より長いときに400 Bad Requestを返す
// リンクがSQLの予約語を含むときに400 Bad Requestを返す
// リンクがすでにデータベースに存在するときに400 Bad Requestを返す
// ユーザーがログインしていないときに401 Unauthorizedを返す
// ユーザーが書き込み権限を持っていないときに403 Forbiddenを返す
app.post('/insert_link', (req, res) => {
    try {
        // console.log(req.body.link);
        const error_check_result = error_check_for_insert_link(req.body.link);
        console.log("error_check_result");
        console.log(error_check_result);
        // error_check_result.status === 200 ? null : (()=>{throw new Error(error_check_result.res)})();
        error_check_result === 'OK' ? null : (()=>{throw new Error(error_check_result)})();

        const user = get_user_with_permission(req);
        user || user.writable ? null : (()=>{throw new Error('権限がありません')})();
        // 同じlinkが存在するなら、エラーを返す
        const link_exists = db.prepare(`SELECT * FROM links WHERE link = ?`).get(req.body.link);
        link_exists ? (()=>{throw new Error('同じlinkが存在します')})() : null;

        const result = db.prepare(`
        INSERT INTO links (user_id, link, created_at, updated_at) VALUES (?, ?, ?, ?)
        `).run(user.user_id, req.body.link, now(), now());
        // result === undefined ? (()=>{throw new Error('原因不明のinsertエラー')})() : null;
        response === undefined ? (()=>{throw new Error('原因不明のinsertエラー')})() : null;

        // console.log(result);
        res.status(200)
            .json({result: 'success'
                ,message: response.lastInsertRowid
            });
    } catch (error) {
        console.log(error);
        console.log(error.message);
        res.status(400).json({result: 'fail', message: error.message});
    }
});


