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
