const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/movies/", async (request, response) => {
  const getMovie = `
    SELECT 
     movie_name AS movieName
    
    FROM 
    movie;`;
  const movies = await db.all(getMovie);
  response.send(movies);
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  const addMovie = `
  INSERT INTO 
  movie (director_id, movie_name, lead_actor) 
  VALUES 
  ('${directorId}', '${movieName}', '${leadActor}');`;
  const addedMovie = await db.run(addMovie);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovie = `
  SELECT 
  movie_id AS movieId,
  director_id AS directorId,
   movie_name AS  movieName,
   lead_actor AS leadActor
  FROM 
  movie
  WHERE 
  movie_id = ${movieId};`;

  const player = await db.get(getMovie);
  response.send(player);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;

  const updateMovie = `
    UPDATE 
    movie 
    SET 
     director_id= '${directorId}',
    movie_name = '${movieName}',
   lead_actor = '${leadActor}'
    WHERE 
     movie_id  = ${movieId};`;
  await db.run(updateMovie);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovie = `
    DELETE FROM 
    movie 
    WHERE
   movie_id = ${movieId};`;

  await db.run(deleteMovie);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectors = `
    SELECT 
    director_id AS directorId,
    director_name AS directorName
    
    FROM 
    director;`;
  const directors = await db.all(getDirectors);
  response.send(directors);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getDirector = `
  SELECT 
  movie.movie_name AS movieName
  FROM 
  movie
  NATURAL JOIN director 
  WHERE 
  movie.director_id = ${directorId};`;

  const director = await db.all(getDirector);
  response.send(director);
});

module.exports = app;
