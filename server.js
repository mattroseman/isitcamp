const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const readline = require('readline');

const Trie = require('./trie.js');

let app = express();

if (process.env.NODE_ENV !== 'production') {
  console.log('allow requests from any domain');
  app.all('*', cors());
  /*
  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  */
}

app.use(express.static(path.join(__dirname, 'client/dist/')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/public/index.html'))
});

const port = process.env.PORT || 5000;
app.listen(port);

const beforeUsed = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`The script uses approximately ${Math.round(beforeUsed * 100) / 100} MB`);

let movieTrie = new Trie();
generateTrie().then((result) => {
  movieTrie = result;

  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
});

app.get('/movies', (req, res) => {
  console.log('getting movie suggestions for prefix ' + req.query.prefix);
  let prefix = req.query.prefix.toLowerCase();
  /*
  if (prefix.substr(0, 4) === 'the ') {
    prefix = prefix.substr(4);
  }
  */

  const movies = movieTrie.getWords(prefix)
    .sort((a, b) => {
      // if neither have votes, sort by word length
      if (b.numVotes === null && a.numVotes === null) {
        return a.length - b.length;
      }

      // if one doesn't have votes, rank it below the one that does
      if (b.numVotes === null) {
        return -1;
      }
      if (a.numVotes === null) {
        return 1;
      }

      return parseInt(b.numVotes, 10) - parseInt(a.numVotes, 10);
    })
    .slice(0, 10);

  const duplicateMovieTitles = movies.reduce((duplicateMovieTitles, movie, i, movies) => {
    movies.forEach((duplicateMovie, j) => {
      if (duplicateMovie.title === movie.title && i !== j) {
        duplicateMovieTitles.add(movie.title);
      }
    });

    return duplicateMovieTitles;
  }, new Set());

  const movieTitles = movies.map((movie) => {
    if (duplicateMovieTitles.has(movie.title) && movie.year !== null) {
      movie.title += ` (${movie.year})`;
    }

    console.log(`movie: ${movie.title} has ${movie.numVotes} votes`);
    return movie.title;
  });

  console.log(movieTitles);

  const response = JSON.stringify({
    'movieTitles': movieTitles
  });
  res.send(response);
});

function generateTrie() {
  return new Promise((resolve) => {
    const movieTrie = new Trie();

    const moviesFileInStream = fs.createReadStream('./data/movies.csv', 'utf8');

    const rl = readline.createInterface({
      input: moviesFileInStream,
      crlfDelay: Infinity
    });

    let moviesAdded = 0;

    rl.on('line', (line) => {
      const data = line.split(',');
      const movieTitle = data[0];
      const movieYear = data[1] !== 'null' ? data[1] : null;
      const movieNumVotes = data[2] !== 'null' ? parseInt(data[2], 10) : null;

      movieTrie.addWord(movieTitle, {
        title: movieTitle,
        year: movieYear,
        numVotes: movieNumVotes
      });

      if (movieTitle.substr(0, 4).toLowerCase() === 'the ' ) {
        movieTrie.addWord(movieTitle.substr(4), {
          title: movieTitle,
          year: movieYear,
          numVotes: movieNumVotes
        });
      }

      moviesAdded += 1;
    });

    rl.on('close', () => {
      console.log('movies added: ' + moviesAdded);

      resolve(movieTrie);
    });
  });
}
