const puppeteer = require('puppeteer');
const fs = require('fs');

const IMDB_URL = 'https://www.imdb.com/';
const FILE_NAME = 'movies.txt';


class Movie {
	constructor(title, genres, rating, duration, directors, stars) {
		this.title = title;
		this.genres = genres;
		this.MPAA_rating = rating;
		this.duration = duration;
		this.directors = directors;
		this.stars = stars;
	}

	to_string() {
		return `${this.title}|${this.genres.join(', ')}|${this.MPAA_rating}|` +
			`${this.duration}|${this.directors.join(', ')}|${this.stars.join(', ')}`;
	}
}


class MovieSearcher {
	constructor(title) {
		this.title = title;
		this.url = IMDB_URL;
		this.movies = [];
	}

	// Get the links of all maching movies information page 
	async get_movies_info_links(callback) {
		const search_url = `${this.url}find?q=${this.title.join('+')}&s=tt&ttype=ft&ref_=fn_ft`;

		const browser = await puppeteer.launch()
		const page = await browser.newPage();

		await page.goto(search_url, { waitUntil: 'networkidle2' });

		// The following code will run on the browser
		let data = await page.evaluate((title) => {
			let links = [];

			// Extract link and push it to the list
			document.querySelectorAll('.result_text a').forEach((element) => {
				// Make sure the movie title is maching to the searching title (IMDB search is fuzzy)
				if (element.innerText.toLocaleLowerCase().includes(title)) {
					links.push(element.href);
				}
			});

			return links;
		}, this.title.join(" ").toLocaleLowerCase());

		await browser.close();
		callback(data);
	};

	// Get information of all maching movies
	get_movies_info_list() {
		this.get_movies_info_links(async (movies_url) => {
			try {
				let browser = await puppeteer.launch()
				let page = await browser.newPage();

				// Go over every movie information page and extract the necessary data
				for (const url of movies_url) {
					await page.goto(url, { waitUntil: 'networkidle2' });

					// The following code will run on the browser
					let data = await page.evaluate(() => {
						if (document.querySelector('[class^="SubNav__SubNavContentBlock"]').hasChildNodes()) {
							return null;
						}

						// Get movie title
						let title = document.querySelector('[class^="TitleHeader__TitleText"]').innerText;

						// Get movie genres
						let genres = [];
						document.querySelectorAll('[class^="GenresAndPlot__GenreChip"]').forEach((e) => {
							genres.push(e.innerText);
						});

						// Get movie MPAA rating
						let rating_element = document.querySelector('[data-testid="storyline-certificate"]  span');
						let rating = rating_element ? rating_element.innerText.split(' ')[1] : '';

						// Get movie duration
						let duration_element = document.querySelector('[data-testid="title-techspec_runtime"]  .ipc-metadata-list-item__content-container .ipc-inline-list__item .ipc-metadata-list-item__list-content-item');
						let duration = duration_element !== null ? duration_element.innerText : '';

						// Get movie directors and stars
						let directors = [];
						let stars = [];

						document.querySelectorAll('[class^="PrincipalCredits__PrincipalCreditsPanelWideScreen"] [data-testid="title-pc-principal-credit"]').forEach(e => {
							const span_label = e.querySelector('span[class="ipc-metadata-list-item__label"]');
							const a_label = e.querySelector('a');

							const insert_directors_stars = (label_txt) => {
								let query = '[class="ipc-metadata-list-item__content-container"] a';

								// Directors case
								if (label_txt.includes('Director')) {
									e.querySelectorAll(query).forEach(a => {
										directors.push(a.innerText)
									});
								}

								// Star case
								else if (label_txt.includes('Star')) {
									e.querySelectorAll(query).forEach(a => {
										stars.push(a.innerText)
									});
								}
							};

							span_label && insert_directors_stars(span_label.innerText);
							a_label && insert_directors_stars(a_label.innerText);
						});

						return { title, genres, rating, duration, directors, stars };
					});
					console.log(data);
					if (data) {
						let { title, genres, rating, duration, directors, stars } = data;
						this.movies.push(new Movie(title, genres, rating, duration, directors, stars))
					}
				}
				await browser.close();

				this.write_movies_to_file();
			} catch (error) {
				console.log(error);
			}
		});
	};

	// Write the movies data to a file
	write_movies_to_file() {
		const file = fs.createWriteStream(FILE_NAME);
		file.on('error', (err) => {
			console.log(err);
		});
		this.movies.forEach((movie) => {
			file.write(`${movie.to_string()} \n`);
		});
		file.end();
	};
}


const main = () => {
	let my_movie_searcher = new MovieSearcher(process.argv.slice(2));
	my_movie_searcher.get_movies_info_list();
}

main();
