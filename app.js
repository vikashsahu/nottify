const http = require('http');
const cheerio = require('cheerio');

const hostname = '127.0.0.1';
const port = 3000;

var options = {
	host: 'usatt.simplycompete.com',
	port: 80,
	path: '/t/search?embedded=true'
};

const server = http.createServer((req, res) => {

	var minutes = 5, timeInterval = minutes * 60 * 1000;
	setInterval(function() {
		http.get(options, function(res) {
			console.log("Got response: " + res);

			//chunk is the HTML document
			res.on("data", function(chunk) {
				//console.log("Body: " + chunk);
			
				//pass the HTML document into cheerio so we can parse it
				const $ = cheerio.load(chunk);
				var tournamentCount = $( "#list-tournament > p > strong" ).html();
				if (tournamentCount != null) {
					console.log("tournament count: " + tournamentCount);
				}
			});
		}).on('error', function(e) {
			console.log("Got error: " + e.message);
		});
	}, timeInterval);

	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	res.end('Hello World\n');
});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});