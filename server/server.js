const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const LOGGER = require('./logger.js');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import App from '../client/src/components/App.js';
const { MovieTrie } = require('./movies.js');

const app = express();

// Generate prerendered React index response
let preRenderedIndex;
const reactAppHTML = ReactDOMServer.renderToString(<App />);
fs.readFile(path.resolve('client/public/index.html'), 'utf8', (err, data) => {
  if (err) {
    LOGGER.error(`Something went wrong reading index.html:\n${err}`);
  }

  preRenderedIndex = data.replace(/<div id="root"><\/div>/, `<div id="root">${reactAppHTML}</div>`)

  LOGGER.debug('prerendered html generated');
});

// SETUP CORS (if not in production mode)
if (process.env.NODE_ENV !== 'production') {
  LOGGER.info('allow requests from any domain');
  app.all('*', cors());
}

// SETUP PATHS
app.get('/', (req, res) => {
  LOGGER.info(preRenderedIndex);
  res.send(preRenderedIndex);
});

// SETUP PUBLIC FILES
app.use(express.static(path.resolve('client/dist')));
app.use(express.static(path.resolve('client/public')));

const movieTrie = new MovieTrie();
app.get('/movies', (req, res, next) => {
  const startTime = new Date() / 1000;

  const prefix = req.query.prefix;

  const cancelToken = {
    cancelled: false
  };

  LOGGER.debug(`getting movies for prefix: ${prefix}`);

  movieTrie.getMovieTitlesFromPrefix(prefix, cancelToken)
    .then((movieTitles) => {
      const endTime = new Date() / 1000;
      LOGGER.debug(`${prefix} took ${endTime - startTime} seconds`);

      res.send(JSON.stringify({
        'movieTitles': movieTitles
      }));
    })
    .catch((err) => {
      if (err === 'getWords cancelled') {
        res.send(JSON.stringify({
          'movieTitles': []
        }));

        return;
      }
      next(err);
    });

  req.on('close', () => {
    LOGGER.debug(`${prefix} request closed`);
    cancelToken.cancelled = true;
  });

  setTimeout(() => {
    if (!cancelToken.cancelled) {
      LOGGER.debug(`${prefix} request timedout`);
      cancelToken.cancelled = true;
    }
  }, 3000);
});

// START APP
const port = process.env.PORT || 5000;
app.listen(port);
