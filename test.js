const app = require('./server');
// server.jsからtest_modeをexportする
// app.js
const { test_mode } = require('./server');
// test_modeがtrueであることを確認する。trueでない場合はテストを実施しない
// dbをserverからexportする
console.log(test_mode());

const { db } = require('./server');
// dbがin memoryであることを確認する。in memoryでない場合は強制終了する
// データベースがメモリ内に存在するかチェック
// console.log(db.name);
// db.name === ':memory:'
// db.nameが':memory:'であることを確認する。':memory:'でない場合は強制終了する


const { get_user_with_permission } = require('./server.js');
const { error_check_for_insert_link } = require('./server.js');
const { error_check_for_insert_tag } = require('./server.js');
const { get_tag_id_by_tag_name } = require('./server.js');
const { insert_tag } = require('./server.js');
const { make_tag_and_insert_tag } = require('./server.js');

console.log(db.name);


if(test_mode() === true && db.name === ':memory:') {
  
  
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
  
  
  
  
  
    it('should return an error if tag is undefined', () => {
      const result = error_check_for_insert_tag(undefined);
      expect(result).toEqual({ res: 'tagが空です', status: false });
    });
  
    it('should return an error if tag contains symbols', () => {
      const result = error_check_for_insert_tag('test!');
      expect(result).toEqual({ res: '記号を含む場合はエラー', status: false });
    });
  
    it('should return an error if tag contains spaces', () => {
      const result = error_check_for_insert_tag('test tag');
      expect(result).toEqual({ res: '空白を含む場合はエラー', status: false });
    });
  
    it('should return an error if tag is longer than 7 characters', () => {
      const result = error_check_for_insert_tag('testlongtag');
      expect(result).toEqual({ res: '7文字以上はエラー', status: false });
    });
  
    it('should return an error if tag contains SQL reserved words', () => {
      const result = error_check_for_insert_tag('SELECT');
      expect(result).toEqual({ res: 'SQLの予約語を含む場合はエラー', status: false });
    });
  
    it('should return success if tag is valid', () => {
      const result = error_check_for_insert_tag('testtag');
      expect(result).toEqual({ res: 'OK', status: true });
    });
  
  
  
  // insertしたものを削除
  // !!!! in memoryだから不要 !!!!
  // afterAll(() => {
  //     // do something after all tests
  //     // db.prepare(`DELETE FROM links WHERE link = ?`).run('https://www.google.co.jp/');
  // });
  
  
  
  });
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  // // get_tag_id_by_tag_name
  // // insert_tag
  // // make_tag_and_insert_tag
  // describe('about_tag_all', () => {
  //   beforeAll(() => {
  //         // -- linksとtagsの中間テーブル
  //         // CREATE TABLE links_tags (
  //         //   id INTEGER PRIMARY KEY AUTOINCREMENT,
  //         //   link_id INTEGER NOT NULL,
  //         //   tag_id INTEGER NOT NULL,
  //         //   created_at DATETIME NOT NULL,
  //         //   updated_at DATETIME NOT NULL
  //         // );
  
  //         // -- tagsというブログのタグのようなサービスのテーブル。IDは自動的に増加する。links_tagsを外部キーとして持つ
  //         // CREATE TABLE tags (
  //         //   id INTEGER PRIMARY KEY AUTOINCREMENT,
  //         //   tag TEXT NOT NULL
  //         // );
  //         db.exec(`
  //         CREATE TABLE links_tags (
  //             id INTEGER PRIMARY KEY AUTOINCREMENT,
  //             link_id INTEGER NOT NULL,
  //             tag_id INTEGER NOT NULL,
  //             created_at DATETIME NOT NULL,
  //             updated_at DATETIME NOT NULL
  //             )
  //         `);
  //         db.exec(`
  //         CREATE TABLE tags (
  //             id INTEGER PRIMARY KEY AUTOINCREMENT,
  //             tag TEXT NOT NULL
  //             )
  //         `);
  //         const now = () => new Date().toISOString();
  //         db.prepare(`INSERT INTO links_tags (link_id, tag_id, created_at, updated_at) VALUES (?, ?, ?, ?)`).run(1, 1, now(), now());
  //         db.prepare(`INSERT INTO tags (tag) VALUES (?)`).run('testtag');
  //   });
  
  
  //     it('should return tag_id if tag exists', () => {
  //         const tag_id = get_tag_id_by_tag_name('testtag', db);
  //         expect(tag_id).toEqual(1);
  //     });
  
  //     it('should return null if tag does not exist', () => {
  //         const tag_id = get_tag_id_by_tag_name('testtag2', db);
  //         expect(tag_id).toBeNull();
  //     });
  
  //     it('should insert tag', () => {
  //         const tag_id = insert_tag('testtag2', db);
  //         expect(tag_id).toEqual(2);
  //     });
  
  //     it('should insert tag', () => {
  //         const tag_id = make_tag_and_insert_tag('testtag3', db);
  //         expect(tag_id).toEqual(3);
  //     });
  // }
  // );

};