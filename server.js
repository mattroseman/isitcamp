const express = require('express');
const path = require('path');
const cors = require('cors');

/* TESTING CODE */
/*
const blocked = require('blocked');
blocked(function(ms) {
    console.log(`Blocked for ${ms}ms`);
}, {threshold:1, interval: 1000});
*/
/* END TESTING CODE */

const movies = require('./movies.js');

let app = express();

// SETUP CORS (if not in production mode)
if (process.env.NODE_ENV !== 'production') {
  console.log('allow requests from any domain');
  app.all('*', cors());
}

// SETUP PUBLIC FILES
app.use(express.static(path.join(__dirname, 'client/dist')));
app.use(express.static(path.join(__dirname, 'client/public')));

// SETUP PATHS
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/public/index.html'));
});

app.get('/movies', async (req, res, next) => {
  const prefix = req.query.prefix;

  console.log(`getting movies for prefix: ${prefix}`);

  movies.getMovieTitlesFromPrefix(prefix)
    .then((movieTitles) => {
      console.log(`movie titles for prefix: ${prefix}\n${movieTitles}`);
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
