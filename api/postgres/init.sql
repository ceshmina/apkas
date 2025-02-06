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
  ('Tokyo, Japan')
;

insert into diary.entries (title, date, content, location_id) values
  ('日記のテスト', '2025-01-01', 'これは日記のテストです。', 1)
;
