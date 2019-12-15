CREATE TABLE posts (
    ID serial PRIMARY KEY,
    timestmp TIMESTAMP NOT NULL,
    neighbourhood TEXT NOT NULL,
    username TEXT NOT NULL,
    user_score numeric NOT NULL,
    post_text TEXT NOT NULL,
    post_score numeric NOT NULL,
    num_reposts INT NOT NULL,
    sent_score numeric NOT NULL,
    sent_magnitude numeric NOT NULL
);

CREATE TABLE reposts (
    ID serial PRIMARY KEY,
    post_ID serial references posts(ID),
    timestmp TIMESTAMP NOT NULL,
    neighbourhood TEXT NOT NULL,
    username TEXT NOT NULL,
    user_score numeric NOT NULL,
);

CREATE TABLE hashtags (
    ID serial PRIMARY KEY,
    post_ID serial references posts(ID),
    contents TEXT NOT NULL,
    timestmp TIMESTAMP NOT NULL,
    neighbourhood TEXT NOT NULL,
    username TEXT NOT NULL,
    user_score numeric NOT NULL,
);

