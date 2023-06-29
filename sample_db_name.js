const test_mode = () => true;
// const test_mode = () => false;

function db_init(DB) {

    // DB.nameがduct_test.sqlite3ではない場合は終了する
    const CHECK_DB_RES = DB.name !== './duct_test.sqlite3' ? 'DB.nameが./duct_test.sqlite3ではありません' : null;
    if(CHECK_DB_RES === 'DB.nameが./duct_test.sqlite3ではありません') {
        return
    }
    const db = DB;

    // user_permissionテーブルを削除する
    db.exec('DROP TABLE IF EXISTS user_permission;');

    // usersテーブルを削除する
    db.exec('DROP TABLE IF EXISTS users;');

    // linksテーブルを削除する
    db.exec('DROP TABLE IF EXISTS links;');

    // likesテーブルを削除する
    db.exec('DROP TABLE IF EXISTS likes;');

    // links_tagsテーブルを削除する
    db.exec('DROP TABLE IF EXISTS links_tags;');

    // tagsテーブルを削除する
    db.exec('DROP TABLE IF EXISTS tags;');

    // commentsテーブルを削除する
    db.exec('DROP TABLE IF EXISTS comments;');

    // comment_repliesテーブルを削除する
    db.exec('DROP TABLE IF EXISTS comment_replies;');

    // user_permissionテーブルを作成する
    db.exec(`
    CREATE TABLE user_permission (
        id INTEGER PRIMARY KEY,
        permission TEXT NOT NULL,
        readable INTEGER NOT NULL,
        writable INTEGER NOT NULL,
        deletable INTEGER NOT NULL, 
        likable INTEGER NOT NULL,
        commentable INTEGER NOT NULL,
        data_limit INTEGER NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
    );
    `);

    // usersテーブルを作成する
    db.exec(`
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_permission_id INTEGER NOT NULL,
        username TEXT NOT NULL,
        userpassword TEXT NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (user_permission_id) REFERENCES user_permission(id)
    );
    `);

    // linksテーブルを作成する
    db.exec(`
    CREATE TABLE links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        link TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    `);

    // likesテーブルを作成する
    db.exec(`
    CREATE TABLE likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        link_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (link_id) REFERENCES link(id)
    );
    `);

    // links_tagsテーブルを作成する
    db.exec(`
    CREATE TABLE links_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        link_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
    );
    `);

    // tagsテーブルを作成する
    db.exec(`
    CREATE TABLE tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag TEXT NOT NULL
    );
    `);

    // commentsテーブルを作成する
    db.exec(`
    CREATE TABLE comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        link_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        comment TEXT NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (link_id) REFERENCES link(id)
    );
    `);

    // comment_repliesテーブルを作成する
    db.exec(`
    CREATE TABLE comment_replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        comment_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        reply TEXT NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (comment_id) REFERENCES comments(id)
    );
    `);

    // user_permissionテーブルにレコードを挿入する
    db.exec(`
    INSERT INTO user_permission (
        id,
        permission,
        readable,
        writable,
        deletable,
        likable,
        commentable,
        data_limit,
        created_at,
        updated_at
    ) VALUES (
        1,
        'guest',
        1,
        0,
        0,
        0,
        0,
        200,
        DATETIME('now'),
        DATETIME('now')
    );
    `);

    db.exec(`
    INSERT INTO user_permission (
        id,
        permission,
        readable,
        writable,
        deletable,
        likable,
        commentable,
        data_limit,
        created_at,
        updated_at
    ) VALUES (
        2,
        'user',
        1,
        1,
        1,
        1,
        1,
        40000,
        DATETIME('now'),
        DATETIME('now')
    );
    `);

    db.exec(`
    INSERT INTO user_permission (
        id,
        permission,
        readable,
        writable,
        deletable,
        likable,
        commentable,
        data_limit,
        created_at,
        updated_at
    ) VALUES (
        3,
        'pro',
        1,
        1,
        1,
        1,
        1,
        400000,
        DATETIME('now'),
        DATETIME('now')
    );
    `);

    // usersテーブルにレコードを挿入する
    db.exec(`
    INSERT INTO users (
        user_permission_id,
        username,
        userpassword,
        created_at,
        updated_at
    ) VALUES (
        1,
        'GUEST',
        'GUEST_PASS',
        DATETIME('now'),
        DATETIME('now')
    );
    `);

    db.exec(`
    INSERT INTO users (
        user_permission_id,
        username,
        userpassword,
        created_at,
        updated_at
    ) VALUES (
        2,
        'user1',
        'user_pass1',
        DATETIME('now'),
        DATETIME('now')
    );
    `);

    db.exec(`
    INSERT INTO users (
        user_permission_id,
        username,
        userpassword,
        created_at,
        updated_at
    ) VALUES (
        2,
        'user2',
        'user_pass2',
        DATETIME('now'),
        DATETIME('now')
    );
    `);

    db.exec(`
    INSERT INTO users (
        user_permission_id,
        username,
        userpassword,
        created_at,
        updated_at
    ) VALUES (
        3,
        'pro1',
        'pro_pass1',
        DATETIME('now'),
        DATETIME('now')
    );
    `);

    db.exec(`
    INSERT INTO users (
        user_permission_id,
        username,
        userpassword,
        created_at,
        updated_at
    ) VALUES (
        3,
        'testuser',
        'password',
        DATETIME('now'),
        DATETIME('now')
    );
    `);
}

const sqlite = require('better-sqlite3');

// test_modeがtrueの時は、テスト用のDBのduct_test.sqlite3を使う。falseの時はduct.sqlite3を使う
const db = test_mode() === true ? new sqlite('./duct_test.sqlite3') : new sqlite('./duct.sqlite3');
test_mode() === true ? db_init(db) : null;
