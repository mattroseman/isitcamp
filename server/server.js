const express = require('express');
const path = require('path');
const cors = require('cors');

const { MovieTrie } = require('./movies.js');

/* TESTING CODE */
/*
const blocked = require('blocked');
blocked(function(ms) {
    console.log(`Blocked for ${ms}ms`);
}, {threshold:1, interval: 1000});
*/
/* END TESTING CODE */

let app = express();

// SETUP CORS (if not in production mode)
if (process.env.NODE_ENV !== 'production') {
  console.log('allow requests from any domain');
  app.all('*', cors());
}

// SETUP PUBLIC FILES
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(express.static(path.join(__dirname, '../client/public')));

// SETUP PATHS
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

const movieTrie = new MovieTrie();
app.get('/movies', (req, res, next) => {
  const prefix = req.query.prefix;

  console.log(`getting movies for prefix: ${prefix}`);

  const startTime = new Date() / 1000;

  movieTrie.getMovieTitlesFromPrefix(prefix)
    .then((movieTitles) => {
      console.log(`movie titles for prefix: ${prefix}\n${movieTitles}`);

      const endTime = new Date() / 1000;
      console.log(`${prefix} took ${endTime - startTime} seconds`);

      res.send(JSON.stringify({
        'movieTitles': movieTitles
      }));
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

// START APP
const port = process.env.PORT || 5000;
app.listen(port);
