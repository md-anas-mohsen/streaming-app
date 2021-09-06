DROP DATABASE streaming_app;

CREATE DATABASE streaming_app;

\c streaming_app;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS app_content (
    content_id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_name VARCHAR NOT NULL,
    content_type VARCHAR(10) NOT NULL CHECK(UPPER(content_type) in ('MULTIPLE', 'SINGLE')), 
    category VARCHAR(30) NOT NULL,
    start_date VARCHAR(4) NOT NULL,
    end_date VARCHAR(4),
    image VARCHAR NOT NULL,
    cover_image VARCHAR,
    description VARCHAR NOT NULL,
    cast_members VARCHAR,
    production_house VARCHAR,
    writer VARCHAR,
    director VARCHAR,
    producer VARCHAR
);

CREATE TABLE IF NOT EXISTS app_sources (
    source_id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    source_name VARCHAR NOT NULL,
    source_url VARCHAR NOT NULL 
);

CREATE TABLE IF NOT EXISTS content_sources (
    content_id UUID NOT NULL,
    source_id UUID NOT NULL,
    season VARCHAR NOT NULL,
    episode VARCHAR NOT NULL,
    Primary KEY (content_id, source_id),
    Foreign KEY (content_id) REFERENCES app_content(content_id),
    Foreign KEY (source_id) REFERENCES app_sources(source_id)
);

INSERT INTO app_content (content_name, content_type, category, start_date, end_date, image, cover_image, description, cast_members, production_house, writer, director, producer)
VALUES (
    'Stranger Things', 
    'MULTIPLE', 
    'Horror',
    '2016',
    '', 
    'https://upload.wikimedia.org/wikipedia/en/7/7a/ST3LambertPoster.png',
    'https://c.saavncdn.com/932/Stranger-Things-Soundtrack-from-the-Netflix-Original-Series-Season-3-English-2019-20190703191952-500x500.jpg', --cover image
    'In 1980s Indiana, a group of young friends witness supernatural forces and secret government exploits. As they search for answers, the children unravel a series of extraordinary mysteries.', --description
    'Winona Ryder, David Harbour, Finn Wolfhard, Millie Bobby Brown',
    'Netflix',
    'Matt Duffer, Ross Duffer, Jessie Nickson-Lopez',
    'Matt Duffer, Ross Duffer, Shawn Levy',
    'Matt Duffer, Ross Duffer, Shawn Levy, Dan Cohen, Cindy Holland, Brian Wright, Matt Thunell, Karl Gajdusek, Iain Paterson'
),
(
    'The Departed', --name
    'SINGLE', --type
    'Crime', --category
    '2006', --start date
    '2006', --end date
    'https://upload.wikimedia.org/wikipedia/en/5/50/Departed234.jpg', --image
    'https://irs.www.warnerbros.com/hero-banner-v2-tablet-jpeg/movies/media/browser/the_departed_banner.jpg', --cover image
    'An undercover agent and a spy constantly try to counter-attack each other in order to save themselves from being exposed in front of the authorities. Meanwhile, both try to infiltrate an Irish gang.', --description
    'Jack Nicholson, Leonardo Di Caprio, Matt Damon, Mark Wahlberg, Martin Sheen, Vera Farmiga', --cast members
    'Warner Bros', --production house
    'William Monahan, Alan Mak', --writer
    'Martin Scorsese', --director
    'Brad Pitt, Brad Grey, Graham King, Gianni Nunnari' --producers
),
(
    'Lost', --name
    'MULTIPLE', --type
    'Mystery', --category
    '2004', --start date
    '2010', --end date
    'https://flxt.tmsimg.com/assets/p185013_b_v8_af.jpg', --image
    'https://images2.minutemediacdn.com/image/upload/c_fill,g_auto,h_1248,w_2220/v1555445654/shape/mentalfloss/lost-primary.png?itok=PrI4_QEB', --cover image
    'The survivors of a plane crash find themselves stranded on a mysterious island. They are forced to work together for their survival when they realise that they are not alone on the island.', --description
    'Jorge Garcia, Josh Holloway, Yunjin Kim, Evangeline Lilly', --cast members
    'abc', --production house
    'Damon Lindelof, Paul Dini', --writer
    'JJ Abrams', --director
    'Damon Lindelof, JJ Abrams, Carlton Cuse' --producers
),
(
    'Interstellar', --name
    'SINGLE', --type
    'Sci Fi', --category
    '2014', --start date
    '2014', --end date
    'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_FMjpg_UX1000_.jpg', --image
    'https://cdn.onebauer.media/one/empire-tmdb/films/157336/images/xu9zaAevzQ5nnrsXN6JcahLnG4i.jpg?format=jpg&quality=80&width=850&ratio=16-9&resize=aspectfill', --cover image
    'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.', --description
    'Matthew McConaughey, Anne Hathaway, Jessica Chastain, Bill Irwin, Ellen Burstyn, Michael Caine', --cast members
    'Paramount Pictures, Warner Bros, Syncopy, Legendary Pictures, Lynda Obst Productions', --production house
    'Jonathan Nolan, Christopher Nolan', --writer
    'Christopher Nolan', --director
    'Emma Thomas, Christopher Nolan, Lynda Obst' --producers
),
(
    'The Imitation Game', --name
    'SINGLE', --type
    'War', --category
    '2014', --start date
    '2014', --end date
    'https://m.media-amazon.com/images/M/MV5BOTgwMzFiMWYtZDhlNS00ODNkLWJiODAtZDVhNzgyNzJhYjQ4L2ltYWdlXkEyXkFqcGdeQXVyNzEzOTYxNTQ@._V1_.jpg', --image
    'https://api.time.com/wp-content/uploads/2014/11/imitation-game.jpg', --cover image
    'Alan Turing, a British mathematician, joins the cryptography team to decipher the German enigma code. With the help of his fellow mathematicians, he builds a machine to crack the codes., along with a team of researchers, to find a new planet for humans.', --description
    'Benedict Cumberbatch, Keira Knightley, Matthew Goode, Rory Kinnear, Charles Dance, Mark Strong', --cast members
    'Black Bear Pictures, Bristol Automotive, Orange Corp', --production house
    'Graham Moore', --writer
    'Morten Tyldum', --director
    'Nora Grossman, Ido Ostrowsky, Teddy Schwarzman' --producers
);
