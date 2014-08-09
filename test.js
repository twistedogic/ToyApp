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
var baseUrl = 'http://finance.yahoo.com/d/quotes.csv?';
var stockList = [
{
	id:"6823.HK",
	low:9.47,
	high:9.95
},{
	id:"0008.HK",
	low:4.83,
	high:4.96
}];
var jsonSchema = {
	id:"",
	data:{}
};
var sampleRate = 1000;
var timer = 0;
var lowSent = new Array(stockList.length+1).join('0').split('').map(parseFloat);
var highSent = lowSent;

// functions
function stockJSON(csv,schema,stockId){
	var lines=csv.split("\n");
	lines.pop();
	var result = [];
	for(var i=0;i<lines.length;i++){
		var info = lines[i].replace(/\r|['"]+/g, '').split(",");
		var obj = schema;
		if (info[0] === stockId[i].id) {
			obj.id = info[0];
			obj.data.name = info[1];
			obj.data.price = info[2];
			obj.data.volume = info[3];
			obj.data.high = info[4];
			obj.data.low = info[5];
			obj.data.ER = info[6];
			obj.data.date = new Date();
			result.push(obj);
			console.log(obj);
		}
	}
	console.log(result);
	//return result; //JavaScript object
	return result; //JSON
}

function stockUrl(stockId){
	var urlString = stockId[0].id;
	for (var i = 1; i < stockId.length; i++){
		urlString = urlString + "+" + stockId[i].id;
	}
	return urlString;
}

function thresholdAlert(stockId,stockData){
	console.log(stockData.data.price +","+ stockId.low);
	if (stockData.data.price < stockId.low){
		var message = {
			from: 'Automated Alarm <me@twistedogic.mailgun.org>',
			to: 'cloudogic@gmail.com',
			subject: stockData.data.name + ' ' + stockData.id + ' has FALL' ,
			text: '<h2 style="background-color:red;">' + stockData.data.price + '</h1>'
		};
	} else if (stockData.data.price > stockId.high){
		var message = {
			from: 'Automated Alarm <me@twistedogic.mailgun.org>',
			to: 'cloudogic@gmail.com',
			subject: stockData.data.name + ' ' + stockData.id + ' has RISE' ,
			text: '<h2 style="background-color:green;">' + stockData.data.price + '</h1>'
		};
	} else {
		var message = null;
	}
	return message;
}

function reportAlert(stockData){
	var data = {
		from: 'Automated Alarm <me@twistedogic.mailgun.org>',
		to: 'cloudogic@gmail.com',
		subject: 'Daily report',
		text: '<h2 style="background-color:red;">' + stockData.data.price + '</h1>'
	};
	return data;
}

function emailAlert(data){
	if(data){
		mailgun.messages().send(data, function (error, body) {
			console.log(body);
		});
		sent = 1;
	} else {
		sent = 0;
	}
	return sent;
}
// long poll
setInterval(function(){
	timer = timer + sampleRate;
	if (timer > 3600000){
		timer = 0;
		lowSent = new Array(stockList.length+1).join('0').split('').map(parseFloat);
		highSent = lowSent;
	}
	list = stockUrl(stockList);
	console.log(list);
	url = baseUrl + 's=' + list + '&f=snl1vhgr';
	request(url, function(error, response, html){
		if(!error){
			var stock = stockJSON(html,jsonSchema,stockList);
			for (var i = 0; i < stockList.length; i++){
				if (highSent[i] <= 0){
					highSent[i] = emailAlert(thresholdAlert(stock[i],stockList[i]));
					lowSent[i] = lowSent[i] - highSent[i];
				} else if (lowSent[i] <= 0){
					lowSent[i] = emailAlert(thresholdAlert(stock[i],stockList[i]));
					highSent[i] = highSent[i] - lowSent[i];
				}
			}
		}
	});
},sampleRate);

app.listen(port);
console.log('server started ' + port);
exports = module.exports = app;
