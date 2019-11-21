CREATE TABLE users (
    id serial primary key,
    user_name varchar(32) not null,
    password varchar(60) not null,
    email varchar(32),
    created timestamp default now() not null
);

CREATE TABLE entries (
    id serial primary key,
    user_id integer not null references users(id) on delete cascade,
    entry_id uuid default uuid_generate_v4() not null,
    feeling smallint not null,
    title varchar(50),
    body text,
    privacy smallint not null,
    created timestamp default now() not null
);
