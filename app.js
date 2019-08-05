const https = require('https');
const cheerio = require('cheerio');

//AWS SES Config
//load the AWS SDK
const AWS = require('aws-sdk');
//sender email
const sender = "Ratings Update <ratings.update@gmail.com>";
//recipient
const recipient = "veggieman999@gmail.com";
//subject line
const subject = "Ratings Update";
//email body for recipients for non-HTML email clients
const body_text = "Nottify has found a new tournament processed for ratings";
//html body
const body_html = `<html>
<head></head>
<body>
	<h1>Nottify has found a new tournament processed for ratings</h1>
	<p>Email sent with Amazon SES using the AWS SDK for JavaScript in Node.js</p>
</body>
</html?`;
//character encoding for the email
const charset = "UTF-8";
//create a new SES object
var ses = new AWS.SES();
//specify the params to pass to the API
var params = {
	Source: sender,
	Destination: {
		ToAddresses: [
			recipient
		],
	},
	Message: {
		Subject: {
			Data: subject,
			Charset: charset
		},
		Body: {
			Text: {
				Data: body_text,
				Charset: charset
			},
			Html: {
				Data: body_html,
				Charset: charset
			}
		}
	}
};
//end AWS SES config

var usattUrl = 'https://usatt.simplycompete.com/t/search?embedded=true';
var minutes = 10, timeInterval = minutes * 60 * 1000;

//globally store the tournamentCount var to check for diffs. Update if changed
var tournamentCountGlobal = 7350;


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
		var tournamentCountCurrent = parseInt($("#list-tournament > p > strong").html(), 10);
		if (tournamentCountCurrent != null) {
			console.log("tournament count: " + tournamentCountCurrent);

			if (tournamentCountCurrent > tournamentCountGlobal) {
				//try to send the email
				ses.sendEmail(params, function(err, data) {
					if(err) {
						console.log(err.message);
					} else {
						console.log("Email sent! Message ID: ", data.messageId);
					}
				});

				//update tournamentCountGlobal
				tournamentCountGlobal = tournamentCountCurrent;
			}
		}
	});

	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
}//end func reqAndParse()
