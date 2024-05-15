-- q_as link_id, id, question, answer, created_at, updated_at
-- f_i_bs link_id, id, fill, sentence, created_at, updated_at
-- i_t_ns link_id, id, label, uri, created_at, updated_at

-- sqlite3で全てのテーブルとそのデータを削除するクエリ
DROP TABLE IF EXISTS user_datas;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS skill_likes;

DROP TABLE IF EXISTS bookmarks;


DROP TABLE IF EXISTS user_permission;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS links;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS links_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS comment_replies;




CREATE TABLE user_datas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT NOT NULL, -- 24 length string
  password TEXT NOT NULL, -- hashed 12 length string, english and number
  weight_num INTEGER NOT NULL,
  user_type TEXT NOT NULL, -- 'company', 'customer'
  offline_online INTEGER NOT NULL, -- 0 for offline, 1 for online
  skills_id_array TEXT NOT NULL, -- JSON string
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
  -- FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill TEXT NOT NULL, -- 24 length string
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE skill_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id INTEGER NOT NULL,
  like_volume INTEGER NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (skill_id) REFERENCES skills(id)
);

-- ユーザーの権限のテーブル。カラムはIDはと名前と作成日と更新日を持つ。IDは自動的に増加する
-- カラムの中には、一般ユーザー、ゲストユーザーがある
-- ゲストユーザーはreadだけできる。一般ユーザーはread,write,deleteができる
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

-- ユーザーのテーブル。カラムはIDはと名前とパスワードと作成日と更新日を持つ。IDは自動的に増加する
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_permission_id INTEGER NOT NULL,
  username TEXT NOT NULL,
  userpassword TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (user_permission_id) REFERENCES user_permission(id)
);

-- usersが所有するお気に入りのtagのテーブル。IDは自動的に増加する。userのIDを外部キーとして持つ。bookmarsというテーブル名
-- usersと1:1の関係,tagsと1:1の関係
CREATE TABLE bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- linksというブログのようなサービスのテーブル。IDは自動的に増加する。userのIDを外部キーとして持つ
CREATE TABLE links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link TEXT NOT NULL,

  data_type TEXT NOT NULL, -- 'q_a', 'f_i_b', 'i_t_n',
  data_json_str TEXT NOT NULL, -- JSON string

  user_id INTEGER NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);


-- likesというブログの高評価ボタンのようなサービスのテーブル。IDは自動的に増加する。linkのIDを外部キーとして持つ
CREATE TABLE likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (link_id) REFERENCES links(id)
);

-- linksとtagsの中間テーブル
CREATE TABLE links_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- tagsというブログのタグのようなサービスのテーブル。IDは自動的に増加する。links_tagsを外部キーとして持つ
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag TEXT NOT NULL
);

CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  comment TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (link_id) REFERENCES links(id)
);

CREATE TABLE comment_replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  reply TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (comment_id) REFERENCES comments(id)
);



-- user_permissionにレコード挿入する
INSERT INTO user_permission (id, permission,
readable,
writable,
deletable,
likable,
commentable,
data_limit,
created_at, updated_at) VALUES (1, 'guest', 1, 0, 0, 0, 0,
200,
DATETIME('now'), DATETIME('now'));
INSERT INTO user_permission (id, permission,
readable,
writable,
deletable,
likable,
commentable,
data_limit,
created_at, updated_at) VALUES (2, 'user', 1, 1, 1, 1, 1,
40000,
DATETIME('now'), DATETIME('now'));

INSERT INTO user_permission (id, permission,
readable,
writable,
deletable,
likable,
commentable,
data_limit,
created_at, updated_at) VALUES (3, 'pro', 1, 1, 1, 1, 1,
400000,
DATETIME('now'), DATETIME('now'));

INSERT INTO user_permission (id, permission,
readable,
writable,
deletable,
likable,
commentable,
data_limit,
created_at, updated_at) VALUES (4, 'test', 1, 1, 1, 1, 1,
1000,
DATETIME('now'), DATETIME('now'));


-- usersにデータをレコード挿入する
INSERT INTO users (user_permission_id, username, userpassword, created_at, updated_at) VALUES (1, 'GUEST', 'GUEST_PASS', DATETIME('now'), DATETIME('now'));
INSERT INTO users (user_permission_id, username, userpassword, created_at, updated_at) VALUES (2, 'user1', 'user_pass1', DATETIME('now'), DATETIME('now'));
INSERT INTO users (user_permission_id, username, userpassword, created_at, updated_at) VALUES (2, 'user2', 'user_pass2', DATETIME('now'), DATETIME('now'));
INSERT INTO users (user_permission_id, username, userpassword, created_at, updated_at) VALUES (3, 'pro1', 'pro_pass1', DATETIME('now'), DATETIME('now'));
INSERT INTO users (user_permission_id, username, userpassword, created_at, updated_at) VALUES (4, 'testuser', 'duct_mean_fuckst1ck', DATETIME('now'), DATETIME('now'));

-- skillsテーブルにTESTという文字列のレコードを挿入する

INSERT INTO skills (skill, created_at, updated_at) VALUES ('TEST', DATETIME('now'), DATETIME('now'));
-- user_datasにadmin_userを挿入する
-- user_name: 'admin_user'
-- password: 'taro'
-- weight_num: 0
-- user_type: 'company'
-- offline_online: 0
-- skills_id_array: [0]
-- created_at: now(),
-- updated_at: now(),


-- INSERT INTO user_datas (user_name, password, weight_num, user_type, offline_online, skills_id_array, created_at, updated_at) VALUES ('admin_user', 'taro', 0, 'company', 0, '[0]', DATETIME('now'), DATETIME('now'));