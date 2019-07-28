const https = require('https');
const cheerio = require('cheerio');

var usattUrl = 'https://usatt.simplycompete.com/t/search?embedded=true';
var minutes = 10, timeInterval = minutes * 60 * 1000;

//execute every 'minutes' number of minutes
setInterval(reqAndParse, timeInterval);

function reqAndParse() {
	https.get(usattUrl, (resp) => {
	let data = '';

	//a chunk of data has been received
	resp.on('data', (chunk) => {
		data += chunk;
	});

	//received the whole response
	resp.on('end', () => {
		//pass the HTML document into cheerio so we can parse it
		const $ = cheerio.load(data);

		//parse using the html selectors, similar to jQuery
		var tournamentCount = $("#list-tournament > p > strong").html();
		if (tournamentCount != null) {
			console.log("tournament count: " + tournamentCount);
		}
	});

	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
}//end reqAndParse
