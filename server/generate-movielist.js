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
const DB_BULK_OP_MAX_SIZE = process.env.DB_BULK_OP_MAX_SIZE;

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
  console.log('downloading and processing IMDb basics file');

  const startTime = new Date();

  const newMoviesBuffer = [];
  let newMoviesTotalLength = 0;
  const insertionPromises = [];

  let basicInfo;
  try {
    basicInfo = await downloadBasicInfo();
  } catch (err) {
    console.error(`error downloading basic info file from IMDB: ${err}`);
  }

  for await (const line of basicInfo) {
    const basicInfo = processBasicInfo(line);

    // if this line was successfully processed, add it ot the new movies buffer
    if (basicInfo) {
      newMoviesBuffer.push({
        _id: basicInfo.id,
        title: basicInfo.title,
        year: basicInfo.year
      });

      newMoviesTotalLength++;
    }

    // if the buffer is filled up, insert the movies, and flush the buffer
    if (newMoviesBuffer.length >= DB_BULK_OP_MAX_SIZE) {
      try {
        insertionPromises.push(Movie.insertMany([...newMoviesBuffer], {ordered: false, lean: true}));
      } catch (err) {
        console.error(`error adding movies to db: ${err}`);
      }

      // reset the buffer for more movies
      newMoviesBuffer.length = 0;
    }
  }

  if (newMoviesTotalLength === 0) {
    console.log('no new movies to add to db');

    return;
  }

  // one final isnertMany to clear out newMovies buffer
  try {
    insertionPromises.push(Movie.insertMany([...newMoviesBuffer], {ordered: false, lean: true}));
  } catch (err) {
    console.error(`error adding movies to db: ${err}`);
  }

  console.log(`${newMoviesTotalLength} new documents added`);

  // wait for all the insertions to finish
  await Promise.all(insertionPromises);

  console.log('IMDb basics file downloaded and processed');

  console.log(`${Math.round((new Date() - startTime) / 1000)}s`);
}

/*
 * downloadBasicInfo queries IMDb to get the basiv movie info file, uncompresses it and returns a
 * readline interface that'll fire a 'line' event for each line of the file.
 * @return: a readline interface for the downloaded file
 */
async function* downloadBasicInfo() {
  // download and unzip the basics file
  const unzippedStream = await new Promise((resolve, reject) => {
    const unzip = zlib.createUnzip();

    https.get(IMDB_BASIC_FILE_URL, (res) => {
      resolve(res.pipe(unzip));
    }).on('error', (err) => {
      reject(err);
    });
  });

  // iterate over the unzipped chunks of the stream yielding complete lines
  let previous = '';
  for await (const chunk of unzippedStream) {
    previous += chunk;

    while (true) {
      const eolIndex = previous.indexOf('\n');
      if (eolIndex < 0) {
        break;
      }

      // if eol is in previous, split it and yield everything up to it
      const line = previous.slice(0, eolIndex);
      yield line;

      // then reset previous to everything after the eol
      previous = previous.slice(eolIndex + 1);
    }
  }

  if (previous.length > 0) {
    yield previous;
  }
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
