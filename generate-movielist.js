const zlib = require('zlib');
const https = require('https');
const fs = require('fs');
const readline = require('readline');

const movies = {};

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

  rl.on('line', (line) => {
    const data = line.split('\t');

    // if this isn't a movie
    if (data[1] !== 'movie') {
      return;
    }

    const id = data[0];
    let title = data[2];
    const year = data[5] === '\\N' ? null : data[5];

    movies[id] = {
      title: title,
      year: year
    };
  });

  rl.on('close', downloadRatingsFile);
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

  rl.on('line', (line) => {
    const data = line.split('\t');
    const id = data[0];
    const rating = data[1];
    const numVotes = data[2];

    if (id in movies) {
      movies[id]['rating'] = rating;
      movies[id]['numVotes'] = numVotes;
    }
  });

  rl.on('close', saveProcessedMovies);
}

function saveProcessedMovies() {
  const moviesJSON = JSON.stringify(movies);
  fs.writeFile('./data/movies.json', moviesJSON, (err) => {
    if (err) {
      console.log(err);
    }

    console.log('Done generating movies list');
  });

}

downloadBasicsFile();
