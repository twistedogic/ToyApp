var express = require('express');
var fs = require('fs');
var request = require('request');
var app     = express();
var Mailgun = require('mailgun-js');

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
	id:"6823.HK",
	low:9.47,
	high:9.95
},{
	id:"0008.HK",
	low:4.89,
	high:4.96
},{
    id:"0001.HK",
    low:140.9,
    high:144.1
}];
var jsonSchema = ["id","name","price","volume","high","low","ER","date"];
var sampleRate = 5000;
var timer = 0;
var lowSent = new Array(stockList.length+1).join('0').split('').map(parseFloat);
var highSent = lowSent;

// functions
function stockJSON(csv,schema,stockId){
	var lines=csv.split("\n");
	lines.pop();
	var result = [];
	if (lines.length === stockId.length){
	    for(var i=0;i<lines.length;i++){
	        var info = lines[i].replace(/\r|['"]+/g, '').split(",");
	        info.push(new Date());
	        var obj = {};
	        for (var j = 0; j < schema.length; j++){
	            obj[schema[j]] = info[j];
	        }
	        result.push(obj);
	    }
	} else {
	    console.log("error JSON");
	    result = ["error"];
	}
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

function thresholdAlert(stockData,stockId){
	var message = null;
	var state = null;
	if (stockData.price < stockId.low){
		message = {
			from: 'Automated Alarm <me@twistedogic.mailgun.org>',
			to: 'cloudogic@gmail.com',
			subject: stockData.name + ' ' + stockData.id + ' has FALL' ,
			html: '<h2 style="background-color:red;">' + stockData.price + '</h1>'
		};
		state = 0;
		console.log("low");
	} else if (stockData.price > stockId.high){
		message = {
			from: 'Automated Alarm <me@twistedogic.mailgun.org>',
			to: 'cloudogic@gmail.com',
			subject: stockData.name + ' ' + stockData.id + ' has RISE' ,
			html: '<h2 style="background-color:green;">' + stockData.price + '</h1>'
		};
		console.log("high");
		state = 2;
	}
	return [message, state];
}

function reportAlert(stockData){
	var data = {
		from: 'Automated Alarm <me@twistedogic.mailgun.org>',
		to: 'cloudogic@gmail.com',
		subject: 'Daily report',
		text: '<h2 style="background-color:red;">' + stockData.price + '</h1>'
	};
	return data;
}

function emailAlert(data){
	var sent = 0;
	if(data[0]){
		mailgun.messages().send(data, function (error, body) {});
		sent = 1;
		console.log(data);
	}
	return sent;
}
// long poll
var currentHigh = [];
var currentLow	= [];
setInterval(function(){
	console.log(timer/1000);
	timer = timer + sampleRate;
	if (timer > 3600000){
		timer = 0;
		currentLow = [0,0,0];
		currentHigh = [0,0,0];
		console.log("reset");
	}
	var list = stockUrl(stockList);
	console.log(list);
	url = baseUrl + 's=' + list + '&f=snl1vhgr';
	request(url, function(error, response, html){
		if(!error){
		    console.log(html);
			var stock = stockJSON(html,jsonSchema,stockList);
			if (stock.length > 1) {
			    for (var i = 0; i < stockList.length; i++){
				    var message = thresholdAlert(stock[i],stockList[i]);
				    if (message){
					    if (message[1] > 1) {
						    currentHigh[i] = 1;
						    currentLow[i] = 0;
				    	} else if (message[1] = 0) {
						    currentLow[i] = 1;
						    currentHigh[i] = 0;
					    }
				    }
			    }
			}
			console.log(stock);
			console.log(currentHigh);
			console.log(currentLow);
		}
	});
},sampleRate);

app.listen(port);
console.log('server started ' + port);
exports = module.exports = app;
