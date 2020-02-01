const zlib = require('zlib');
const https = require('https');
const fs = require('fs');
const readline = require('readline');
const mongoose = require('mongoose');

const { Movie } = require('./models.js');

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

  const imdbBasicsFileOutStream = fs.createWriteStream('./data/title.basics.tsv', {flags: 'w'});
  const unzip = zlib.createUnzip();
  https.get('https://datasets.imdbws.com/title.basics.tsv.gz', (res) => {
    res.pipe(unzip).pipe(imdbBasicsFileOutStream).on('finish', processBasicsFile);
  });
}

function processBasicsFile() {
  console.log('processing IMDb basics file');

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
    console.log('bulk writing movie upserts');
    Movie.bulkWrite(upsertOperations)
      .then((res) => {
        console.log(`${res.upsertedCount} new documents added`);
        console.log(`${res.modifiedCount} documents updated`);

        downloadRatingsFile();
      })
      .catch((err) => {
        console.error(`error adding documents: ${err}`);
      });
  });
}

function downloadRatingsFile() {
  console.log('downloading IMDb ratings file');

  const imdbRatingsFileOutStream = fs.createWriteStream('./data/title.ratings.tsv', {flags: 'w'});
  const unzip = zlib.createUnzip();
  https.get('https://datasets.imdbws.com/title.ratings.tsv.gz', (res) => {
    res.pipe(unzip).pipe(imdbRatingsFileOutStream).on('finish', processRatingsFile);
  });
}

function processRatingsFile() {
  console.log('processing IMDb ratings file');

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

    upsertOperations.push({
      updateOne: {
        filter: { _id: id },
        update: { rating: rating, numVotes: numVotes },
      }
    });
  });

  rl.on('close', () => {
    console.log('bulk writing movie upserts');
    Movie.bulkWrite(upsertOperations)
      .then((res) => {
        console.log(`${res.upsertedCount} new documents added`);
        console.log(`${res.modifiedCount} documents updated`);

        console.log('finished generating movie list');
      })
      .catch((err) => {
        console.error(`error adding documents: ${err}`);
      });
  });
}
