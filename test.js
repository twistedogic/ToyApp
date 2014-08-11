var express = require('express');
var fs = require('fs');
var request = require('request');
var app     = express();
var Mailgun = require('mailgun-js');
var cheerio = require('cheerio');
var redis = require("redis")
  , publisher  = redis.createClient(6379, '10.0.42.1', {});
//log
// var winston = require('winston');
// require('winston-logstash');
// winston.add(winston.transports.Logstash, {
//   port: 28777,
//   node_name: 'my node name',
//   host: '172.17.0.4'
// });
// winston.add(winston.transports.File, {
//     filename: 'all-logs.log',
//     handleExceptions: true
// });
// ENV config
var port = process.env.PORT || '3000';
var api_key = 'key-3z2nwyjiq240lyqp6sz3t3a852toy9i2';
var domain = 'twistedogic.mailgun.org';
var mailgun = new Mailgun({apiKey: api_key, domain: domain});

  
// parameter
var baseUrl = 'http://finance.yahoo.com/d/quotes.csv?';
var stockList = [
{
	id:"06823",
	low:9.47,
	high:9.95
},{
	id:"00008",
	low:4.89,
	high:4.96
},{
    id:"00001",
    low:140.9,
    high:144.1
}];
var sampleRate = 5000;
var timer = 0;
var lowSent = new Array(stockList.length+1).join('0').split('').map(parseFloat);
var highSent = lowSent;

// functions
function stockUrl(stockId){
	var urlString = [];
	for (var i = 0; i < stockId.length; i++){
		var options = {
			url: 'http://www.etnet.com.hk/www/eng/stocks/realtime/quote_super.php?code=' + stockId[i].id,
			followRedirect: false,
			headers:{
				'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36'
			}
		};
		urlString.push(options);
	}
	return urlString;
}

function stockJSON(stockUrl,stockId){
	for (var i = 0; i < stockUrl.length; i++) {
		request(stockUrl[i], function(error, response, html){
			if(!error && response.statusCode == 200){
				var $ = cheerio.load(html);
				var table = $('#left').html();
				lastUpdate = new Date();
				var row = [];
				$ = cheerio.load(table);
				$('table').each(function(j, elem) {
					row[j] = $(this).html();
				});
				var col = [];
				$ = cheerio.load(row[0]);
				temp = $('tr td').text().replace(/(\r\n|\n|\r| |)/gm,"").split("\t");
			    id = $('.stockName').children().first().text().replace(/(\r\n|\n|\r|\t| |)/gm,"");
				name = $('.stockName').children().last().text().replace(/(\r\n|\n|\r|\t| |)/gm,"");
				price = $('.number').text().replace(/(\r\n|\n|\r|\t| |)/gm,"");
				change = temp[temp.length-1];
				$ = cheerio.load(row[1]);
				$('tr').each(function(k, elem) {
					col[k] = $(this).children().last().text().replace(/(\r\n|\n|\r|\t| |)/gm,"");
				})
				high = col[0];
				low = col[1];
				close = col[2];
				open = col[3];
				shareTr = col[4];
				turnover = col[5];
				NoTr = col[6];

				var col = [];
				$ = cheerio.load(row[2]);
				$('tr').each(function(k, elem) {
					col[k] = $(this).children().last().text().replace(/(\r\n|\n|\r|\t| |)/gm,"");
				})
				AmountT = col[0];
				VWAP = col[1];
				BuySell = col[2];
				ShortSell = col[3];
				monthHigh = col[4];
				monthLow = col[5];
				D10SMA = col[6];
				D20SMA = col[7];
				D14RSI = col[8];
				RiskReturnRate = col[9];
				var json = {}; 
				json.id = id;
				json.name = name;
				json.price = price;
				json.change = change;
				json.high = high;
				json.low = low;
				json.close = close;
				json.open = open;
				json.shareTr = shareTr;
				json.turnover = turnover;
				json.NoTr = NoTr;
				json.AmountT = AmountT;
				json.VWAP = VWAP;
				json.BuySell = BuySell;
				json.ShortSell = ShortSell;
				json.monthHigh = monthHigh;
				json.monthLow = monthLow;
				json.D10SMA = D10SMA;
				json.D20SMA = D20SMA;
				json.D14RSI = D14RSI;
				json.RiskReturnRate = RiskReturnRate;
				json.lastUpdate = lastUpdate;
			} else {
				console.log(error);
				console.log(response.statusCode);
				json = response.statusCode;
			}
			publisher.publish(json.id, JSON.stringify(json));
		});
	}
}

// long poll
setInterval(function(){
    stockJSON(stockUrl(stockList));
},sampleRate);

app.listen(port);
console.log('server started ' + port);
exports = module.exports = app;
