const zlib = require('zlib');
const https = require('https');
const fs = require('fs');
const readline = require('readline');

const unzip = zlib.createUnzip();

const imdbFileOutStream = fs.createWriteStream('./data/title.basics.tsv', 'utf8');
https.get('https://datasets.imdbws.com/title.basics.tsv.gz', (res) => {
  res.pipe(unzip).pipe(imdbFileOutStream);
});

const fileInStream = fs.createReadStream('./data/title.basics.tsv', 'utf8');
const fileOutStream = fs.createWriteStream('./data/movieTitles.txt', {flags: 'w'});

const rl = readline.createInterface({
  input: fileInStream,
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  const data = line.split('\t');

  if (data.length >= 2 && data[1] === 'movie') {
    if (data.length >= 3 && data[2] !== '\\N') {
      fileOutStream.write(data[2] + '\n');
    }
  }
});
