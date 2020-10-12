import 'core-js/stable';
import 'regenerator-runtime/runtime';

import express from 'express';
import cors from 'cors';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { ChunkExtractor } from '@loadable/server';
import path from 'path';
import fs from 'fs';

import LOGGER from './logger.js';

import App from '../client/components/App.js';
import { MovieTrie } from './movies.js';

const app = express();

// Generate prerendered React index response
let preRenderedIndex;

const statsFile = path.resolve('dist/loadable-stats.json');
const extractor = new ChunkExtractor({ statsFile });
const html = ReactDOMServer.renderToString(extractor.collectChunks(<App />));
const htmlScriptTags = extractor.getScriptTags();
const htmlStyleTags = extractor.getStyleTags();

fs.readFile(path.resolve('public/index.html'), 'utf8', (err, data) => {
  if (err) {
    LOGGER.error(`Something went wrong reading index.html:\n${err}`);
  }

  preRenderedIndex = data.replace(/<div id="root"><\/div>/, `<div id="root">${html}</div>`)
    .replace('</head>', `${htmlStyleTags}</head>`)
    .replace('</head>', `${htmlScriptTags}</head>`);

  LOGGER.debug('prerendered html generated');
});

// SETUP CORS (if not in production mode)
if (process.env.NODE_ENV !== 'production') {
  LOGGER.info('allow requests from any domain');
  app.all('*', cors());
}

// SETUP PATHS
app.get('/', (req, res) => {
  LOGGER.debug('sending prerendered React HTML');
  res.send(preRenderedIndex);
});

// SETUP PUBLIC FILES
app.use(express.static(path.resolve('dist')));
app.use(express.static(path.resolve('public')));

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
