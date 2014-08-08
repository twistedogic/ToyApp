var express = require('express');
var fs = require('fs');
var request = require('request');
var app     = express();
var winston = require('winston');

// ENV config
var port = process.env.PORT || '3000';
require('winston-logstash');
var api_key = 'key-3z2nwyjiq240lyqp6sz3t3a852toy9i2';
var domain = 'twistedogic.mailgun.org';
var Mailgun = require('mailgun-js');
var mailgun = new Mailgun({apiKey: api_key, domain: domain});

winston.add(winston.transports.Logstash, {
  port: 28777,
  node_name: 'my node name',
  host: '172.17.0.4'
});
winston.add(winston.transports.File, {
    filename: 'all-logs.log',
    handleExceptions: true
  });
  
// parameter
var lower = 9.30;
var higher = 9.33;
var lowersent = 0;
var highersent = 0;
var baseUrl = 'http://finance.yahoo.com/d/quotes.csv?';
var quoteUrl = 'http://www.etnet.com.hk/www/eng/stocks/realtime/quote_ci_brief.php?code=';
var superquoteUrl = 'http://www.etnet.com.hk/www/eng/stocks/realtime/quote_super.php?code=';

// long poll
setInterval(function() {
	url = baseUrl + 's=6823.HK+0008.HK&f=snl1b4vrgh';
	request(url, function(error, response, html){
		if(!error){
		    console.log(html);
		    var row = html.split("\n");
		    for (var i = 0;i < row.length; i++){
		        console.log(row[i]);
		        console.log(i);
		    }
		    var date = new Date();
// 		    if (row[2] < lower && lowersent == 0){
// 			    lowersent = 1;
// 			    highersent = 0;
// 			    var data = {
// 			        from: 'Automated Alarm <me@twistedogic.mailgun.org>',
// 			        to: 'jordan.yy.li@pccw.com',
// 			        subject: row[1] + ' ' + row[0] + ' has dropped below threshold' ,
// 			        text: 'Alert!'+ ' ' + row[2]
	
// 			    };
// 			    mailgun.messages().send(data, function (error, body) {
// 			        console.log(body);
// 			    });
// 			} else if (report.price > higher && highersent == 0){
// 			    lowersent = 0;
// 			    highersent = 1;
// 			    var data = {
// 			        from: 'Automated Alarm <me@twistedogic.mailgun.org>',
// 			        to: 'jordan.yy.li@pccw.com',
// 			        subject: report.name + ' ' + report.id + ' has rised above threshold' ,
// 			        text: 'Alert!'+ ' ' + report.price
	
// 			    };
// 			    mailgun.messages().send(data, function (error, body) {
// 			        console.log(body);
// 			    });
// 			}
		}
	})
}, 1000);

app.listen(port)
console.log('server started ' + port);
exports = module.exports = app; 	
