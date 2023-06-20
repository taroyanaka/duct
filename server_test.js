const express = require('express');
const validator = require('validator');
const app = express();







// en: should return null with invalid credentials
// ja: 無効な認証情報でnullを返すべき
// en: should return null with non-existent username
// ja: 存在しないユーザー名でnullを返すべき
const get_user_with_permission = (REQ) => {
    // overwrite_password関数はID/PASSWORDの秘匿化のための応急処置として使用する
    // glitch.comにおいてpravateな情報を扱う場合は、.dataフォルダに格納する
    // REQ.body.nameがlines[0]と一致し、
    // REQ.body.passwordがlines[2]と一致する場合に
    // REQ.body.passwordをlines[1]に書き換える関数
    // overwrite_passwordを一行関数で
    const overwrite_password = (REQ) => {
        const FILE_NAME = './.data/for_overwriting_id_password.csv';
        // csvファイルを読み込んで','でsplitしてconsole.logする
        const fs = require('fs');
        const line = fs.readFileSync(FILE_NAME, 'utf8').split(',');    
        const result = REQ.body.name === line[0] && REQ.body.password === line[2] ? line[1] : REQ.body.password;
        return [REQ.body.name, result];
    };
    // 本番環境においてはoverwrite_passwordを実行
    // [REQ.body.name, REQ.body.password] = overwrite_password(req, line);

    // 無効な認証情報でnullを返す
    if (REQ.body.name === '' || REQ.body.password === '' || REQ.body.name === undefined || REQ.body.password === undefined || REQ.body.name === null || REQ.body.password === null
        || REQ.body.name.length > 20 || REQ.body.password.length > 20 || REQ.body.name.length < 4 || REQ.body.password.length < 4
        || REQ.body.name.includes(' ') || REQ.body.password.includes(' ')
        || REQ.body.name.includes('　') || REQ.body.password.includes('　')
    ) {
        return null;
    }
    //  存在しないユーザー名でnullを返す
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
        return null;
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

const error_check_for_insert_link = (link) => {
    const WHITE_LIST_URL_ARRAY = [
        'https://www.yahoo.co.jp/',
        'https://www.google.co.jp/',
        'https://www.youtube.com/',
    ];    
    const reserved_words = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'DELETE', 'UPDATE', 'DROP', 'ALTER', 'CREATE', 'TABLE', 'INTO', 'VALUES', 'AND', 'OR', 'NOT', 'NULL', 'TRUE', 'FALSE'];
    const is_include_WHITE_LIST_URL = (target_url_str) => WHITE_LIST_URL_ARRAY.some((WHITE_LIST_URL) => target_url_str.startsWith(WHITE_LIST_URL));
    switch (true) {
        case link === undefined: return {res: 'linkが空です', status: 400}; break;
        case reserved_words.includes(link): return {res: 'SQLの予約語を含む場合はエラー', status: 400}; break;
        // URLが2000文字より大きい時はエラー
        case link.length > 2000: return {res: 'URLが長すぎます', status: 400}; break;
        // リンクが正しいURLの形式でないときに400 Bad Requestを返す。validator.jsを使ってチェックする break;
        case !validator.isURL(link): return {res: 'URLの形式が正しくありません', status: 400}; break;
        case !is_include_WHITE_LIST_URL(link): return {res: '許可されていないURLです', status: 400}; break;
        default: return {res: 'OK', status: 200}; break;
    }
};
app.post('/insert_link', (req, res) => {
    try {        
        const error_check_result = error_check_for_insert_link(req.body.link);
        error_check_result.status === 200 ? null : (()=>{throw new Error(error_check_result)})();

        const user = get_user_with_permission(req);
        user || user.writable ? null : (()=>{throw new Error({res: 'ユーザーが書き込み権限を持っていません', status: 403})})();

        // 同じlinkが存在するなら、エラーを返す
        const link_exists = db.prepare(`SELECT * FROM links WHERE link = ?`).get(req.body.link);
        link_exists ? (()=>{throw new Error({res: '同じリンクがすでに存在します', status: 400})})()
            : null;

        const result = db.prepare(`
        INSERT INTO links (user_id, link, created_at, updated_at) VALUES (?, ?, ?, ?)
        `).run(user.user_id, req.body.link, now(), now());

        res.status(200)
            .json(result);
        
    } catch (error) {
        console.log(error);
        res.status(error.status).json({error: error.res});
    }
});


app.post('/just_a_test', (req, res) => {
    try {
        const user = get_user_with_permission(req);
        console.log(user);
        if(user.name === 'testuser' && user.password === 'password') {
            res.status(200).json({res: 'OK'});
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({error: error});
    }
});



// test.jsのためにexportする
module.exports = app;
// test.jsのためにget_user_with_permissionをexportする
module.exports.get_user_with_permission = get_user_with_permission;
// test.jsのためにerror_check_for_insert_linkをexportする
module.exports.error_check_for_insert_link = error_check_for_insert_link;

