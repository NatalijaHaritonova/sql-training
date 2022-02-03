import { Database } from "../src/database";
import { ACTORS, DIRECTORS, GENRES, KEYWORDS, MOVIES, MOVIE_ACTORS, MOVIE_DIRECTORS, MOVIE_GENRES, MOVIE_KEYWORDS, MOVIE_RATINGS } from "../src/table-names";
import { minutes } from "./utils";

describe("Queries Across Tables", () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.fromExisting("06", "07");
  }, minutes(3));

  it(
    "should select top three directors ordered by total budget spent in their movies",
    async done => {
      const query = `SELECT full_name AS director, ROUND(SUM (budget_adjusted), 2) AS total_budget
      FROM ${MOVIE_DIRECTORS}
      INNER JOIN ${DIRECTORS} director ON ${MOVIE_DIRECTORS}.director_id = director.id
      INNER JOIN ${MOVIES} movie ON ${MOVIE_DIRECTORS}.movie_id = movie.id
      GROUP BY full_name
      ORDER BY ROUND(SUM (budget_adjusted), 2) DESC
      LIMIT 3`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          director: "Ridley Scott",
          total_budget: 722882143.58
        },
        {
          director: "Michael Bay",
          total_budget: 518297522.1
        },
        {
          director: "David Yates",
          total_budget: 504100108.5
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top 10 keywords ordered by their appearance in movies",
    async done => {
      const query = `SELECT COUNT(*) AS count, keyword
      FROM ${KEYWORDS}
      INNER JOIN ${MOVIE_KEYWORDS} movieKeywords ON ${KEYWORDS}.id = movieKeywords.keyword_id
      INNER JOIN ${MOVIES} movies ON movieKeywords.movie_id = movies.id
      GROUP BY keyword
      ORDER BY count DESC
      LIMIT 10`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          keyword: "woman director",
          count: 162
        },
        {
          keyword: "independent film",
          count: 115
        },
        {
          keyword: "based on novel",
          count: 85
        },
        {
          keyword: "duringcreditsstinger",
          count: 82
        },
        {
          keyword: "biography",
          count: 78
        },
        {
          keyword: "murder",
          count: 66
        },
        {
          keyword: "sex",
          count: 60
        },
        {
          keyword: "revenge",
          count: 51
        },
        {
          keyword: "sport",
          count: 50
        },
        {
          keyword: "high school",
          count: 48
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select all movies called Life and return amount of actors",
    async done => {
      const query = `SELECT COUNT(*) AS count, original_title
      FROM ${MOVIES}
      INNER JOIN ${MOVIE_ACTORS} movieactors ON ${MOVIES}.id = movieactors.movie_id
      INNER JOIN ${ACTORS} actors ON actors.id = movieactors.actor_id
      WHERE original_title = 'Life'`;
      const result = await db.selectSingleRow(query);

      expect(result).toEqual({
        original_title: "Life",
        count: 12
      });

      done();
    },
    minutes(3)
  );

  it(
    "should select three genres which has most ratings with 5 stars",
    async done => {
      const query = `SELECT COUNT(*) AS five_stars_count, genre
      FROM ${GENRES}
      INNER JOIN ${MOVIE_GENRES} moviegenres ON ${GENRES}.id = moviegenres.genre_id
      INNER JOIN ${MOVIE_RATINGS} movieratings ON movieratings.movie_id = moviegenres.movie_id
      WHERE rating = 5
      GROUP BY genre           
      ORDER BY five_stars_count DESC
      LIMIT 3`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          genre: "Drama",
          five_stars_count: 15052
        },
        {
          genre: "Thriller",
          five_stars_count: 11771
        },
        {
          genre: "Crime",
          five_stars_count: 8670
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top three genres ordered by average rating",
    async done => {
      const query = `SELECT genre, ROUND(AVG(rating), 2) AS avg_rating
      FROM ${GENRES}
      INNER JOIN ${MOVIE_GENRES} moviegenres ON ${GENRES}.id = moviegenres.genre_id
      INNER JOIN ${MOVIE_RATINGS} movieratings ON moviegenres.movie_id = movieratings.movie_id
      GROUP BY genre
      ORDER BY avg_rating DESC
      LIMIT 3`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          genre: "Crime",
          avg_rating: 3.79
        },
        {
          genre: "Music",
          avg_rating: 3.73
        },
        {
          genre: "Documentary",
          avg_rating: 3.71
        }
      ]);

      done();
    },
    minutes(3)
  );
});
