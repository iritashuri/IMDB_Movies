# 🎥 IMDB Movie Finder 🎥
## Web Scrapper for IMDB movies

IMDB Movie Finder is a command line script based on nodeJS that will allow the user to get movie information based on movie title searched

## Features
The movie information includes:
- Title
- Genres
- MPAA Rating
- Duration
- Directors
- Stars

## External libraries used
- [Pupeteer](https://github.com/puppeteer/puppeteer) - High-level API to control Chrome or Chromium over the DevTools Protocol

## Getting Started

Preparations:
```sh
$ git clone https://github.com/iritashuri/IMDB_Movies.git
$ cd IMDB_Movies
$ npm install 
```

Usage:
```sh
$ node IMDB_movies_scraper.js <title to search>
i.e. -$ node IMDB_movies_scraper.js matrix
```

The movie finder will look for all of the movies that contains the command line argument provided, and will write the results into a file named `movies.txt` in a pipe separated format.

`movies.txt` example:
```sh
The Matrix|Action, Sci-Fi|R|2h 16min|Lana Wachowski, Lilly Wachowski|
The Matrix Reloaded|Action, Sci-Fi|R|2h 18min|Lana Wachowski, Lilly Wachowski| 
The Matrix Revolutions|Action, Sci-Fi|R|2h 9min|Lana Wachowski, Lilly Wachowski| 
```
