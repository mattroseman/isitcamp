const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const Trie = require('./trie.js');

let app = express();

// Set up a whitelist and check against it:
var whitelist = ['http://localhost:3000', 'isitcamp.com', 'www.isitcamp.com', 'http://isitcamp.com', 'http://www.isitcamp.com']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error(origin + ' not allowed by CORS'))
    }
  }
}

// Then pass them to cors:
app.use(cors(corsOptions));

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
