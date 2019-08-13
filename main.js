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
</html>`;
//character encoding for the email
const charset = "UTF-8";
//create a new SES object
var ses = new AWS.SES();
//specify the params to pass to the API
var emailParams = {
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

var tableName = 'RatingsPage';

var dynamodb = new AWS.DynamoDB.DocumentClient();

var usattUrl = 'https://usatt.simplycompete.com/t/search?embedded=true';

function checkAndNotify() {
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

		var readParams = {
			TableName: tableName,
			Key:{
				"Main":"true"
			}
		};

		dynamodb.get(readParams, function(err, data) {
			if(err){
				console.log("unable to read");
			} else {
				console.log("read success", JSON.stringify(data, null, 2));

				var dbTournamentCount = data.Item.Info.Tournaments;
				console.log("tournament count: " + dbTournamentCount);

				if (tournamentCountCurrent!=null && tournamentCountCurrent>dbTournamentCount) {

					var writeParams = {
						TableName: tableName,
						Key:{
							"Main":"true"
						},
						UpdateExpression:"set Info.Tournaments = :t",
						ExpressionAttributeValues:{
							":t":tournamentCountCurrent
						},
						ReturnValues:"UPDATED_NEW"
					};

					dynamodb.update(writeParams, function(err, data) {
						if (err) {
							console.log("err:", JSON.stringify(err, null, 2));
						} else {
							console.log("write success:", JSON.stringify(data, null, 2));

							//send the email
							ses.sendEmail(emailParams, function(err, data) {
								if(err) {
									console.log("error sending email: "+ err.message);
								} else {
									console.log("email sent! message ID: " + data.messageId);
								}
							});
						}
					});
				}
			}
		});
	});

}).on("error", (err) => {
	console.log("Error: " + err.message);
});
}//end func checkAndNotify

exports.checkAndNotify = checkAndNotify;
