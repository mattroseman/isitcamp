const fs = require('fs');
const readline = require('readline');

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
