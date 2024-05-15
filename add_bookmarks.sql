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
