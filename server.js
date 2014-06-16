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
app.get('/rise', function(req, res){
	console.log('calling');
	url = baseUrl + '?market=1&category=A';

	request(url, function(error, response, html){
		if(!error){
			var $ = cheerio.load(html);
			var table = $('div .mainTable_c').html();
			var data;
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
					col[k] = $(this).text().replace(/(\r\n|\n|\r| |)/gm,"");
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
        res.send('Check your console!')
	})
})

app.listen('8080')
console.log('Magic happens on port 8080');
exports = module.exports = app; 	