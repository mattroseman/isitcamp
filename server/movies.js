const fs = require('fs');
const readline = require('readline');

const Trie = require('./trie.js');

class Movie {
  constructor(title, numVotes=0, year=null) {
    this.title = title;
    this.numVotes = numVotes;
    this.year = year;
  }

  /*
   * compare takes another movie object, and determines if this movie should be ranked lower, the same, or higher than otherMovie.
   * :return: -1 if this movie should be ranked before otherMovie, 0 if they should be ranked the same, and 1 if otherMovie should be ranked before.
   */
  compare(otherMovie) {
    if (this.numVotes > otherMovie.numVotes) {
      return -1;
    }

    if (this.numVotes < otherMovie.numVotes) {
      return 1;
    }

    if (this.numVotes === otherMovie.numVotes) {
      if (this.title.length < otherMovie.title.length) {
        return -1;
      }

      if (this.title.length > otherMovie.title.length) {
        return 1;
      }
    }

    return 0;
  }
}

class MovieTrie extends Trie {
  constructor() {
    super();

    // log memory usage before trie is generated
    const beforeUsed = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`The script uses approximately ${Math.round(beforeUsed * 100) / 100} MB`);

    this.generateMovieTrie().then(() => {
      // log memory usage after trie is generated
      const used = process.memoryUsage().heapUsed / 1024 / 1024;
      console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
    });
  }

  /*
   * generateMovieTrie returns a promise that resolves with a Trie object containing all movie titles
   */
  generateMovieTrie() {
    return new Promise((resolve) => {
      // read in the list of movies and their associated data
      const moviesFileInStream = fs.createReadStream('./server/data/movies.csv', 'utf8');

      const rl = readline.createInterface({
        input: moviesFileInStream,
        crlfDelay: Infinity
      });

      let moviesAdded = 0;

      // for each movie read in, add it to the trie
      rl.on('line', (line) => {
        const data = line.split(',');
        const movieTitle = data[0];
        const movieYear = data[1] !== 'null' ? data[1] : null;
        const movieNumVotes = isFinite(parseInt(data[2])) ? parseInt(data[2]) : 0;
        const movie = new Movie(movieTitle, movieNumVotes, movieYear);

        this.addWord(movieTitle, movie);

        // if the movie has the prefix 'the ', also add the substring without the 'the ' prefix
        if (movieTitle.substr(0, 4).toLowerCase() === 'the ' ) {
          this.addWord(movieTitle.substr(4), movie);
        }

        moviesAdded += 1;
      });

      rl.on('close', () => {
        console.log('movies added: ' + moviesAdded);

        resolve();
      });
    });
  }

  /*
   * getMovieTitlesFromPrefix returns a promise that resolves with a list of movie titles that begin with the given prefix
   */
  async getMovieTitlesFromPrefix(prefix) {
    prefix = prefix.toLowerCase();

    // get movies that start with the given prefix
    const movies = await this.getWords(prefix);
    console.log(`gotten list of ${movies.length} suggestions for prefix: ${prefix}`);

    // iterate through them and get the top 10 ones with most votes
    const topMovies = this.getTopMoviesByNumVotes(movies, 10);

    // sort the top movies by numVotes
    topMovies.sort((a, b) => {
      return a.compare(b);
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
      if (duplicateMovieTitles.has(movie.title) && isFinite(parseInt(movie.year))) {
        movie.title += ` (${movie.year})`;
      }

      return movie.title;
    });

    return movieTitles;
  }

  /*
   * getTopMoviesByNumVotes iterates through the given list of movies and grabs the top 10 by number of votes, or movie title length as secondary comparison
   * returns a list of 10 movie objects
   */
  getTopMoviesByNumVotes(movies, count=10) {
    const topMovies = movies.slice(0, count);

    movies.slice(count).forEach((movie) => {
      // get the movie in topMovies with the lowest number of votes
      let minTopMovieIndex = 0;
      const minTopMovie = topMovies.reduce((currentMinTopMovie, topMovie, i) => {
        if (topMovie.compare(currentMinTopMovie) < 0) {
          minTopMovieIndex = i;
          return topMovie;
        }

        return currentMinTopMovie;
      }, topMovies[0])

      // if movieNumVotes is greater than that movie, replace it in topMovies
      if (movie.compare(minTopMovie) < 0) {
        topMovies[minTopMovieIndex] = movie;
      }
    });

    return topMovies;
  }
}

module.exports.MovieTrie = MovieTrie;
