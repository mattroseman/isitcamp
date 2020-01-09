const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

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

const movieTrie = generateTrie();

const used = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);

app.get('/movies', (req, res) => {
  console.log('getting movie suggestions for prefix ' + req.query.prefix);
  const movieTitles = Array.from(movieTrie.getWords(req.query.prefix))
    .sort((a, b) => {
      // if neither have votes, sort by word length
      if (b.info.numVotes === undefined && a.info.numVotes === undefined) {
        return a.word.length - b.word.length;
      }

      // if one doesn't have votes, rank it below the one that does
      if (b.info.numVotes === undefined) {
        return -1;
      }
      if (a.info.numVotes === undefined) {
        return 1;
      }

      return parseInt(b.info.numVotes, 10) - parseInt(a.info.numVotes, 10);
    })
    .slice(0, 10)
    .map((movie) => {
      // console.log(`movie: ${movie.word} has ${movie.info.numVotes} votes`);
      return movie.word;
    });
  console.log(movieTitles);

  const response = JSON.stringify({
    'movieTitles': movieTitles
  });
  res.send(response);
});

function generateTrie() {
  const movieTrie = new Trie();
  const movies = JSON.parse(fs.readFileSync('./data/movies.json', 'utf8'));

  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);

  let moviesAdded = 0;
  for (let movieId in movies) {
    const movie = movies[movieId];

    movieTrie.addWord(movie.title, movie.title, {
      year: movie.year,
      rating: movie.rating,
      numVotes: movie.numVotes
    });
    moviesAdded += 1;

    if (movie.title.substr(0, 4).toLowerCase() === 'the ') {
      movieTrie.addWord(movie.title.substr(4), movie.title, {
        year: movie.year,
        rating: movie.rating,
        numVotes: movie.numVotes
      });
    }
  }

  console.log('movies added: ' + moviesAdded);

  return movieTrie;
}
