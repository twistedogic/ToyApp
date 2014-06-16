var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var winston = require('winston');
require('winston-logstash');

winston.add(winston.transports.Logstash, {
  port: 28777,
  node_name: 'my node name',
  host: '172.17.0.4'
});
winston.add(winston.transports.File, {
    filename: 'all-logs.log',
    handleExceptions: true
  });

var baseUrl = 'http://www.aastocks.com/tc/LTP/RTTopRank.aspx';
var quoteUrl = 'http://www.etnet.com.hk/www/eng/stocks/realtime/quote_ci_brief.php?code=';
var superquoteUrl = 'http://www.etnet.com.hk/www/eng/stocks/realtime/quote_super.php?code=';
app.get('/rise', function(req, res){
	console.log('calling');
	url = baseUrl + '?market=1&category=A';
	request(url, function(error, response, html){
		if(!error){
			var $ = cheerio.load(html);	
			var table = $('div .mainTable_c').html();
			var id, name, price, rise, volume, lastUpdate;
			var json = { id:"", name:"", price:"", rise:"", volume:"", lastUpdate:""};
			var row = [];
			$ = cheerio.load(table);	
			$('tr').each(function(i, elem) {
				row[i] = $(this).html();		
			});
			$ = cheerio.load(row[row.length - 1]);
			lastUpdate = $('td').children().text();	
			var col = [];
			for (var i = 1; i<row.length-1; i++){
				$ = cheerio.load(row[i]);
				$('td').each(function(k, elem) {
					col[k] = $(this).text().replace(/(\r\n|\n|\r|\t| |)/gm,"");
		        })
		        id = col[0];
				name = col[1];
				price = col[2];
				rise = col[3];
				volume = col[4];
				json.id = id;
				json.name = name;
				json.price = price;
				json.rise = rise;
				json.volume = volume;
				json.lastUpdate = lastUpdate;
				winston.log('info','testing',json);
				
	        }

		}
        res.send(json);
	})
})

app.get('/fall', function(req, res){
	console.log('calling');
	url = baseUrl + '?market=1&category=B';
	request(url, function(error, response, html){
		if(!error){
			var $ = cheerio.load(html);	
			var table = $('div .mainTable_c').html();
			var id, name, price, rise, volume, lastUpdate;
			var json = { id:"", name:"", price:"", rise:"", volume:"", lastUpdate:""};
			var row = [];
			$ = cheerio.load(table);	
			$('tr').each(function(i, elem) {
				row[i] = $(this).html();		
			});
			$ = cheerio.load(row[row.length - 1]);
			lastUpdate = $('td').children().text();	
			var col = [];
			for (var i = 1; i<row.length-1; i++){
				$ = cheerio.load(row[i]);
				$('td').each(function(k, elem) {
					col[k] = $(this).text().replace(/(\r\n|\n|\r|\t| |)/gm,"");
		        })
		        id = col[0];
				name = col[1];
				price = col[2];
				rise = col[3];
				volume = col[4];
				json.id = id;
				json.name = name;
				json.price = price;
				json.rise = rise;
				json.volume = volume;
				json.lastUpdate = lastUpdate;
				winston.log('info','testing',json);
				
	        }

		}
        res.send(json);
	})
})

app.get('/volume', function(req, res){
	console.log('calling');
	url = baseUrl + '?market=1&category=T';
	request(url, function(error, response, html){
		if(!error){
			var $ = cheerio.load(html);	
			var table = $('div .mainTable_c').html();
			var id, name, price, rise, volume, lastUpdate;
			var json = { id:"", name:"", price:"", rise:"", volume:"", lastUpdate:""};
			var row = [];
			$ = cheerio.load(table);	
			$('tr').each(function(i, elem) {
				row[i] = $(this).html();		
			});
			$ = cheerio.load(row[row.length - 1]);
			lastUpdate = $('td').children().text();	
			var col = [];
			for (var i = 1; i<row.length-1; i++){
				$ = cheerio.load(row[i]);
				$('td').each(function(k, elem) {
					col[k] = $(this).text().replace(/(\r\n|\n|\r|\t| |)/gm,"");
		        })
		        id = col[0];
				name = col[1];
				price = col[2];
				rise = col[3];
				volume = col[4];
				json.id = id;
				json.name = name;
				json.price = price;
				json.rise = rise;
				json.volume = volume;
				json.lastUpdate = lastUpdate;
				winston.log('info','testing',json);
				
	        }

		}
        res.send(json);
	})
})

app.get('/deal', function(req, res){
	console.log('calling');
	url = baseUrl + '?market=1&category=V';
	request(url, function(error, response, html){
		if(!error){
			var $ = cheerio.load(html);	
			var table = $('div .mainTable_c').html();
			var id, name, price, rise, volume, lastUpdate;
			var json = { id:"", name:"", price:"", rise:"", volume:"", lastUpdate:""};
			var row = [];
			$ = cheerio.load(table);	
			$('tr').each(function(i, elem) {
				row[i] = $(this).html();		
			});
			$ = cheerio.load(row[row.length - 1]);
			lastUpdate = $('td').children().text();	
			var col = [];
			for (var i = 1; i<row.length-1; i++){
				$ = cheerio.load(row[i]);
				$('td').each(function(k, elem) {
					col[k] = $(this).text().replace(/(\r\n|\n|\r|\t| |)/gm,"");
		        })
		        id = col[0];
				name = col[1];
				price = col[2];
				rise = col[3];
				volume = col[4];
				json.id = id;
				json.name = name;
				json.price = price;
				json.rise = rise;
				json.volume = volume;
				json.lastUpdate = lastUpdate;
				winston.log('info','testing',json);
				
	        }

		}
        res.send(json);
	})
})

app.get('/quote/:stockId', function(req, res){
	var stock = req.param("stockId");
	var options = {
		url: superquoteUrl + stock,
		followRedirect: false,
		headers:{
			'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36'
		}
	};

	var report, id, name, price, change, high, low, close, open, shareTr, turnover, NoTr, AmountT, VWAP, BuySell, ShortSell, monthHigh, monthLow, D10SMA, D20SMA, D14RSI, RiskReturnRate, lastUpdate;
	var json = { 
		id:"",
		name:"",
		price:"",
		change:"",
		high:"",
		low:"",
		close:"",
		open:"",
		shareTr:"",
		turnover:"",
		NoTr:"",
		AmountT:"",
		VWAP:"",
		BuySell:"",
		ShortSell:"",
		monthHigh:"",
		monthLow:"",
		D10SMA:"",
		D20SMA:"",
		D14RSI:"",
		RiskReturnRate:"",
		lastUpdate:""
	};
	request(options, function(error, response, html){
		if(!error && response.statusCode == 200){
			var $ = cheerio.load(html);
			var table = $('#left').html();
			lastUpdate = $('div #disclaimer').text().replace(/(\r\n|\n|\r|\t| |)/gm,"");
			var row = [];
			$ = cheerio.load(table);
			$('table').each(function(i, elem) {
				row[i] = $(this).html();
			});
			var col = [];
			$ = cheerio.load(row[0]);
			temp = $('tr td').text().replace(/(\r\n|\n|\r| |)/gm,"").split("\t");
		    id = $('.stockName').children().first().text().replace(/(\r\n|\n|\r|\t| |)/gm,"");
			name = $('.stockName').children().last().text().replace(/(\r\n|\n|\r|\t| |)/gm,"");
			price = $('.number').text().replace(/(\r\n|\n|\r|\t| |)/gm,"");
			change = temp[temp.length-1];
			console.log('work here');
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
			winston.log('info','testing',json);
			report = json;
		} else {
			console.log(error);
			console.log(response.statusCode);
			report = response.statusCode;
		}
	})
	res.send(report);
})



app.listen('8080')
console.log('Magic happens on port 8080');
exports = module.exports = app; 	