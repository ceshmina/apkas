create schema blog;

create table if not exists blog.entries (
  id serial primary key,
  title text not null,
  content text not null,
  created_at timestamp not null default now(),
  updated_at timestamp
);

create table if not exists blog.tags (
  id serial primary key,
  name text not null,
  created_at timestamp not null default now(),
  updated_at timestamp
);

create table if not exists blog.entry_tags (
  entry_id integer references blog.entries(id),
  tag_id integer references blog.tags(id),
  primary key (entry_id, tag_id)
);

insert into blog.entries (title, content, created_at) values
  ('ブログのテスト', 'これはブログのテストです。', '2025-01-01 00:00:00'),
  ('ブログのテスト2', 'これはブログのテスト2です。', '2025-01-02 00:00:00'),
  ('ブログのテスト3', 'これはブログのテスト3です。', '2025-02-01 00:00:00')
;

insert into blog.tags (name, created_at) values
  ('タグ1', '2025-01-01 00:00:00'),
  ('タグ2', '2025-01-01 00:00:00')
;

insert into blog.entry_tags (entry_id, tag_id) values
  (1, 1),
  (3, 1),
  (3, 2)
;


create schema diary;

create table diary.locations (
  id serial primary key,
  name text not null,
  created_at timestamp not null default now(),
  updated_at timestamp
);

create table if not exists diary.entries (
  id serial primary key,
  title text,
  date date not null,
  content text not null,
  location_id integer references diary.locations(id),
  created_at timestamp not null default now(),
  updated_at timestamp
);

insert into diary.locations (name) values
  ('Tokyo, Japan'),
  ('Paris, France')
;

insert into diary.entries (title, date, content, location_id, created_at) values
  ('日記のテスト', '2025-01-01', 'これは日記のテストです。', 1, '2025-01-01 00:00:00'),
  ('日記のテスト2', '2025-01-02', 'これは日記のテスト2です。', 1, '2025-01-02 00:00:00'),
  ('日記のテスト3', '2025-01-03', 'これは日記のテスト3です。', 2, '2025-01-03 00:00:00'),
  ('日記のテスト4', '2025-02-01', 'これは日記のテスト4です。', 1, '2025-02-01 00:00:00'),
  ('日記のテスト5', '2025-02-02', 'これは日記のテスト5です。', 2, '2025-02-02 00:00:00')
;
