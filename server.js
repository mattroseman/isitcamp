const express = require('express');
const path = require('path');
const fs = require('fs');

const Trie = require('./trie.js');

let app = express();

app.use(express.static(path.join(__dirname, 'client/dist/')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/public/index.html'))
});

const port = process.env.PORT || 5000;
app.listen(port);

const movieTrie = new Trie();
const movieTitles = fs.readFileSync('./data/movieTitles.txt', 'utf8')

for (let movieTitle of movieTitles.split('\n')) {
  movieTrie.addWord(movieTitle);

  if (movieTitle.substr(0, 4).toLowerCase() === 'the ') {
    movieTrie.addWord(movieTitle.substr(4), movieTitle);
  }
}

app.get('/movies', (req, res) => {
  console.log('getting movie suggestions for prefix ' + req.query.prefix);
  console.log(movieTrie.getWords(req.query.prefix));
  const movieTitles = Array.from(movieTrie.getWords(req.query.prefix))
    .sort((a, b) => {
      return a.length - b.length || a.localeCompare(b);
    })
    .slice(0, 10);
  const response = JSON.stringify({
    'movieTitles': movieTitles
  });
  res.send(response);
});
