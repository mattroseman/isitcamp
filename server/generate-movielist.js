const zlib = require('zlib');
const https = require('https');
const readline = require('readline');

const mongoose = require('mongoose');

const { Movie } = require('./models.js');


const IMDB_BASIC_FILE_URL = 'https://datasets.imdbws.com/title.basics.tsv.gz';
const IMDB_RATING_FILE_URL = 'https://datasets.imdbws.com/title.ratings.tsv.gz';

let preExistingMovieIds;
let movieIds;

// load database environment variables
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;

// config mongoose
mongoose.set('useFindAndModify', false);
const mongoUrl = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;

/*
 * addAllMoviesToDb downloads a list of current movies from IMDb, including data associated with the movies.
 * Then it adds all the movies to mongoDB.
 * @param checkForUpdates: if true will update all preexisting documents in the db.
 */
async function addAllMoviesToDb() {
  const startTime = new Date();

  // connect to database
  try {
    await mongoose.connect(mongoUrl, {useNewUrlParser: true, useUnifiedTopology: true});
    console.log('connected to database');
  } catch (err) {
    console.error('connection error: ' + err);
  }

  preExistingMovieIds = new Set(await Movie.getAllIds());
  console.log(`already ${preExistingMovieIds.size} movies in db`);

  // add movie info to db
  try {
    await addBasicInfoToDb();
  } catch (err) {
    console.error(`there was an error adding basic movie info to db: ${err}`);
  }

  movieIds = new Set(await Movie.getAllIds());

  try {
    await addRatingInfoToDb();
  } catch (err) {
    console.error(`there was an error updating movie rating info in db: ${err}`);
  }

  console.log('All movie data has been downloaded and updated');

  console.log('took: ' + Math.round(new Date() - startTime) / 1000 + 's');

  return;
}

/*
 * addBasicInfoToDb downloads the basic info from IMDb, and adds all basic movie info to the database
 */
async function addBasicInfoToDb() {
  return new Promise((resolve, reject) => {
    console.log('downloading and processing IMDb basics file');

    downloadBasicInfo().then((rl) => {
      const movieDocuments = [];

      rl.on('line', async (line) => {
        const basicInfo = processBasicInfo(line);

        // if this line was successfully processed, add it to the upsertOperations array
        if (basicInfo) {
          movieDocuments.push({
            _id: basicInfo.id,
            title: basicInfo.title,
            year: basicInfo.year
          });
        }
      });

      rl.on('close', async () => {
        console.log('IMDb basics file downloaded and processed');

        if (movieDocuments.length === 0) {
          console.log('no new movies to add to db');

          resolve();
          return;
        }

        console.log('adding basic movie info to db');
        try {
          await Movie.insertMany(movieDocuments);

          console.log(`${movieDocuments.length} new documents added`);
        } catch (err) {
          reject(`error adding documents: ${err}`);
        }

        resolve();
      });
    });
  });
}

/*
 * downloadBasicInfo queries IMDb to get the basiv movie info file, uncompresses it and returns a
 * readline interface that'll fire a 'line' event for each line of the file.
 * @return: a readline interface for the downloaded file
 */
async function downloadBasicInfo() {
  return new Promise((resolve, reject) => {
    const unzip = zlib.createUnzip();

    https.get(IMDB_BASIC_FILE_URL, (res) => {
      resolve(readline.createInterface({
        input: res.pipe(unzip),
        crlfDelay: Infinity
      }));
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/*
 * processBasicInfo takes a line from the IMDb basics info uncompressed download, grabs the relevant data
 * and returns it as an object
 * @param line: a string that's a tab seperated line from IMDb basics file
 * @return: an object that is the relevant data parsed out of the given line, null if the given line isn't a movie
 */
function processBasicInfo(line) {
  const data = line.split('\t');

  // if this isn't a movie
  if (data[1] !== 'movie') {
    return null;
  }

  const id = data[0];
  let title = data[2];
  const year = isFinite(parseInt(data[5])) ? parseInt(data[5]) : null;

  if (preExistingMovieIds.has(id)){
    return null;
  }

  return {
    id,
    title,
    year
  };
}

/*
 * addRatingInfoToDb downloads the rating info from IMDb, and adds all movie rating info to the database
 */
async function addRatingInfoToDb() {
  return new Promise((resolve, reject) => {
    console.log('downloading and processing IMDb ratings file');

    downloadRatingInfo().then((rl) => {
      const updateOperations = [];

      rl.on('line', async (line) => {
        const ratingInfo = processRatingInfo(line);

        // if this line was successfully processed, add it to the upsertOperations array
        if (ratingInfo) {
          updateOperations.push({
            updateOne: {
              filter: { _id: ratingInfo.id },
              update: { numVotes: ratingInfo.numVotes, rating: ratingInfo.rating }
            }
          });
        }
      });

      rl.on('close', async () => {
        console.log('IMDb ratings file downloaded and processed');

        if (updateOperations.length === 0) {
          console.log('no new movie ratings to add to db');

          resolve();
          return;
        }

        console.log('updating movie ratings in db');
        try {
          const res = await Movie.bulkWrite(updateOperations)

          console.log(`${res.modifiedCount} documents updated`);
        } catch (err) {
          reject(`error adding documents: ${err}`);
        }

        resolve();
      });
    });
  });
}

/*
 * downloadRatingInfo queries IMDb to get the movie ratings info file, uncompresses it and returns a
 * readline interface that'll fire a 'line' event for each line of the file.
 * @return: a readline interface for the downloaded file
 */
async function downloadRatingInfo() {
  return new Promise((resolve, reject) => {
    const unzip = zlib.createUnzip();

    https.get(IMDB_RATING_FILE_URL, (res) => {
      resolve(readline.createInterface({
        input: res.pipe(unzip),
        crlfDelay: Infinity
      }));
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/*
 * processRatingInfo takes a line from the IMDb movies ratings info uncompressed download, grabs the relevant data
 * and returns it as an object
 * @param line: a string that's a tab seperated line from IMDb ratings file
 * @return: an object that is the relevant data parsed out of the given line, null if the movie id isn't in the database
 */
function processRatingInfo(line) {
  const data = line.split('\t');
  const id = data[0];
  const rating = isFinite(parseInt(data[1])) ? parseInt(data[1]) : null;
  const numVotes = isFinite(parseInt(data[2])) ? parseInt(data[2]) : null;

  // if there isn't a movie for the current rating in the database, return null
  if (!movieIds.has(id)) {
    return null;
  }

  return {
    id,
    rating,
    numVotes
  };
}

(async () => {
  await addAllMoviesToDb();
})();
