const zlib = require('zlib');
const https = require('https');
const fs = require('fs');
const readline = require('readline');
const mongoose = require('mongoose');

const { Movie } = require('./models.js');

const globalStartTime = new Date();

// load database environment variables
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;

// config mongoose
mongoose.set('useFindAndModify', false);

// connect to database
const mongoUrl = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;
mongoose.connect(mongoUrl, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => {
    console.log('connected to database');
    downloadBasicsFile();
    // processRatingsFile();
  })
  .catch((err) => {
    console.error('connection error: ' + err);
  });

function downloadBasicsFile() {
  console.log('downloading IMDb basics file');

  const startTime = new Date();

  const imdbBasicsFileOutStream = fs.createWriteStream('./data/title.basics.tsv', {flags: 'w'});
  const unzip = zlib.createUnzip();
  https.get('https://datasets.imdbws.com/title.basics.tsv.gz', (res) => {
    res.pipe(unzip).pipe(imdbBasicsFileOutStream).on('finish', () => {
      const timeTook = Math.round((new Date() - startTime) / 1000);
      console.log(`IMDb basics file downloaded. took: ${timeTook}s`);
      processBasicsFile();
    });
  });
}

function processBasicsFile() {
  console.log('processing IMDb basics file');

  let startTime = new Date();

  const imdbBasicsFileInStream = fs.createReadStream('./data/title.basics.tsv', 'utf8');

  const rl = readline.createInterface({
    input: imdbBasicsFileInStream,
    crlfDelay: Infinity
  });

  const upsertOperations = [];

  rl.on('line', (line) => {
    const data = line.split('\t');

    // if this isn't a movie
    if (data[1] !== 'movie') {
      return;
    }

    const id = data[0];
    let title = data[2];
    const year = isFinite(parseInt(data[5])) ? parseInt(data[5]) : null;

    upsertOperations.push({
      updateOne: {
        filter: { _id: id },
        update: { title: title, year: year },
        upsert: true
      }
    });
  });

  rl.on('close', () => {
    let timeTook = Math.round((new Date() - startTime) / 1000);
    console.log(`IMDb basics file processed. took: ${timeTook}s`);

    console.log('bulk writing movie upserts');

    startTime = new Date();

    Movie.bulkWrite(upsertOperations)
      .then((res) => {
        console.log(`${res.upsertedCount} new documents added`);
        console.log(`${res.modifiedCount} documents updated`);

        timeTook = Math.round((new Date() - startTime) / 1000);
        console.log(`took: ${timeTook}s`);

        downloadRatingsFile();
      })
      .catch((err) => {
        console.error(`error adding documents: ${err}`);
      });
  });
}

function downloadRatingsFile() {
  console.log('downloading IMDb ratings file');

  const startTime = new Date();

  const imdbRatingsFileOutStream = fs.createWriteStream('./data/title.ratings.tsv', {flags: 'w'});
  const unzip = zlib.createUnzip();
  https.get('https://datasets.imdbws.com/title.ratings.tsv.gz', (res) => {
    res.pipe(unzip).pipe(imdbRatingsFileOutStream).on('finish', () => {
      const timeTook = Math.round((new Date() - startTime) / 1000);
      console.log(`IMDb ratings file downloaded. took: ${timeTook}s`);

      processRatingsFile();
    });
  });
}

function processRatingsFile() {
  console.log('processing IMDb ratings file');

  let startTime = new Date();

  const imdbRatingsFileInStream = fs.createReadStream('./data/title.ratings.tsv', 'utf8');

  const rl = readline.createInterface({
    input: imdbRatingsFileInStream,
    crlfDelay: Infinity
  });

  const upsertOperations = [];

  rl.on('line', (line) => {
    const data = line.split('\t');
    const id = data[0];
    const rating = isFinite(parseInt(data[1])) ? parseInt(data[1]) : null;
    const numVotes = isFinite(parseInt(data[2])) ? parseInt(data[2]) : null;

    // TODO it may be faster to do a query by id here and only add the upserts that will actually update
    // TODO a bunch of id exists queries may be faster than the one big bulkWrite query
    // TODO could also store list of ids from first part to save time here
    upsertOperations.push({
      updateOne: {
        filter: { _id: id },
        update: { rating: rating, numVotes: numVotes },
      }
    });
  });

  rl.on('close', () => {
    let timeTook = Math.round((new Date() - startTime) / 1000);
    console.log(`IMDb ratings file downloaded. took: ${timeTook}s`);

    console.log('bulk writing movie upserts');

    startTime = new Date();

    Movie.bulkWrite(upsertOperations)
      .then((res) => {
        console.log(`${res.upsertedCount} new documents added`);
        console.log(`${res.modifiedCount} documents updated`);

        timeTook = Math.round((new Date() - startTime) / 1000);
        console.log(`movie list generated. took ${timeTook}`);

        timeTook = Math.round((new Date() - globalStartTime) / 1000);
        console.log(`total time: ${timeTook}s`);
      })
      .catch((err) => {
        console.error(`error adding documents: ${err}`);
      });
  });
}
