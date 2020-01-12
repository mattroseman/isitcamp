const fs = require('fs');
const readline = require('readline');

const Trie = require('./trie.js');

// CODE EXECUTED ON IMPORT
const beforeUsed = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`The script uses approximately ${Math.round(beforeUsed * 100) / 100} MB`);

let movieTrie = new Trie();
generateTrie().then((result) => {
  movieTrie = result;

  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
});

/*
 * getMovieTitlesFromPrefix returns a promise that resolves with a list of movie titles that begin with the given prefix
 */
async function getMovieTitlesFromPrefix(prefix) {
  prefix = prefix.toLowerCase();

  // get movies that start with the given prefix, iterate through them and get the top 10 ones with most votes
  const topMovies = [];
  const movies = await movieTrie.getWords(prefix);
  console.log(`gotten list of ${movies.length} suggestions for prefix: ${prefix}`);
  movies.forEach((movie) => {
    // get the number of votes this movie has, 0 if it's NaN
    const movieNumVotes = isFinite(parseInt(movie.numVotes, 10)) ? parseInt(movie.numVotes, 10) : 0;

    if (topMovies.length >= 10) {
      // if this movie has more votes than any movies in topMovies, replace that element in top movies
      for (let i = 0; i < topMovies.length; i++) {
        const topMovie = topMovies[i];
        const topMovieNumVotes = isFinite(parseInt(topMovie.numVotes, 10)) ? parseInt(topMovie.numVotes, 10) : 0;

        if (movieNumVotes > topMovieNumVotes) {
          topMovies[i] = movie;
          return;
        }

        if (movieNumVotes === topMovieNumVotes && movie.title.length < topMovie.title.length) {
          topMovies[i] = movie;
          return;
        }
      }
    } else {
      topMovies.push(movie);
    }
  });

  // find any duplicate movie titles in the top 10
  const duplicateMovieTitles = topMovies.reduce((duplicateMovieTitles, movie, i, movies) => {
    movies.forEach((duplicateMovie, j) => {
      if (duplicateMovie.title === movie.title && i !== j) {
        duplicateMovieTitles.add(movie.title);
      }
    });

    return duplicateMovieTitles;
  }, new Set());

  // append a movies release year to any movies that show up as duplicates
  const movieTitles = topMovies.map((movie) => {
    if (duplicateMovieTitles.has(movie.title) && isFinite(parseInt(movie.year, 10))) {
      movie.title += ` (${movie.year})`;
    }

    return movie.title;
  });

  return movieTitles;
}

/*
 * generateTrie returns a promise that resolves with a Trie object containing all movie titles
 */
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

module.exports = {
  getMovieTitlesFromPrefix: getMovieTitlesFromPrefix
}
