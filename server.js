const express = require('express');
const path = require('path');
const fs = require('fs');

const Trie = require('./trie.js');

let app = express();

if (process.env.NODE_ENV !== 'production') {
  console.log('allow requests from any domain');
  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
}

app.use(express.static(path.join(__dirname, 'client/dist/')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/public/index.html'))
});

const port = process.env.PORT || 5000;
app.listen(port);

const movieTrie = new Trie();
const movieTitles = fs.readFileSync('./data/movieTitles.txt', 'utf8')

let moviesAdded = 0;
for (let movieTitle of movieTitles.split('\n')) {
  // console.log('movies added: ' + moviesAdded);
  movieTrie.addWord(movieTitle);
  moviesAdded += 1;

  if (movieTitle.substr(0, 4).toLowerCase() === 'the ') {
    movieTrie.addWord(movieTitle.substr(4), movieTitle);
  }
}
const used = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);

console.log('movies added: ' + moviesAdded);

app.get('/movies', (req, res) => {
  console.log('getting movie suggestions for prefix ' + req.query.prefix);
  const movieTitles = Array.from(movieTrie.getWords(req.query.prefix))
    .sort((a, b) => {
      return a.length - b.length || a.localeCompare(b);
    })
    .slice(0, 10);
  console.log(movieTitles);
  const response = JSON.stringify({
    'movieTitles': movieTitles
  });
  res.send(response);
});
