var TAFFY = require('node-taffydb').TAFFY;
var redis = require("redis")
  , subscriber = redis.createClient(6379, '10.0.42.1', {})
  , publisher  = redis.createClient(6379, '10.0.42.1', {});
var Mailgun = require('mailgun-js');
var api_key = 'key-3z2nwyjiq240lyqp6sz3t3a852toy9i2';
var domain = 'twistedogic.mailgun.org';
var mailgun = new Mailgun({apiKey: api_key, domain: domain});

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
var jsonSchema = ["id","name","price","change","high","low","close","open","shareTr","turnover","NoTr","AmountT","VWAP","BuySell","ShortSell","monthHigh","monthLow","D10SMA","D20SMA","D14RSI","RiskReturnRate","lastUpdate"];
var stockDB = TAFFY(stockList);

function thresholdAlert(stockData,stockId){
    var highKey = stockData.id + "highSent";
    var lowKey = stockData.id + "lowSent";
	var message = {};
	var Limit = stockDB({id:stockData.id}).first();
    publisher.ttl(highKey, function(err, reply) {
        // reply is null when the key is missing
        if (reply < 0){
            if (stockData.price > Limit.high){
		        message = {
			        from: 'Automated Alarm <me@twistedogic.mailgun.org>',
			        to: 'cloudogic@gmail.com, jordan.yy.li@pccw.com',
			        subject: stockData.name + ' ' + stockData.id + ' has RISE' ,
			        html: '<h1 style="background-color:green;">' + stockData.price + '</h1>'
		        };
		        emailAlert(highKey, message);
            }
        }
    });
    publisher.ttl(lowKey, function(err, reply) {
        // reply is null when the key is missing
        if (reply < 0){
            if (stockData.price < Limit.low){
		        message = {
			        from: 'Automated Alarm <me@twistedogic.mailgun.org>',
			        to: 'cloudogic@gmail.com, jordan.yy.li@pccw.com',
			        subject: stockData.name + ' ' + stockData.id + ' has FALL' ,
			        html: '<h1 style="background-color:red;">' + stockData.price + '</h1>'
		        };
		        console.log (message);
		        emailAlert(lowKey, message);
            }
        }
    });
}

function reportAlert(stockData,schema){
    var table = '<table style="width:300px"><tr>';
    var header;
    var content;
    for (var i = 0; i < schema.length; i++){
        temp = '<th>' + schema[i] + '</th>'
        header = header + temp;
    }
    table = table + header + '</tr>';
    for (var j = 0; j < stockData.length; i++){
        temp = '<tr>';
        temp = temp + '<td>' + stockData[i].id + '</td>';
        temp = temp + '<td>' + stockData[i].name + '</td>';
        temp = temp + '<td>' + stockData[i].price + '</td>';
        temp = temp + '<td>' + stockData[i].change + '</td>';
        temp = temp + '<td>' + stockData[i].high + '</td>';
        temp = temp + '<td>' + stockData[i].low + '</td>';
        temp = temp + '<td>' + stockData[i].close + '</td>';
        temp = temp + '<td>' + stockData[i].open + '</td>';
        temp = temp + '<td>' + stockData[i].shareTr + '</td>';
        temp = temp + '<td>' + stockData[i].turnover + '</td>';
        temp = temp + '<td>' + stockData[i].NoTr + '</td>';
        temp = temp + '<td>' + stockData[i].AmountT + '</td>';
        temp = temp + '<td>' + stockData[i].VWAP + '</td>';
        temp = temp + '<td>' + stockData[i].BuySell + '</td>';
        temp = temp + '<td>' + stockData[i].ShortSell + '</td>';
        temp = temp + '<td>' + stockData[i].monthHigh + '</td>';
        temp = temp + '<td>' + stockData[i].monthLow + '</td>';
        temp = temp + '<td>' + stockData[i].D10SMA + '</td>';
        temp = temp + '<td>' + stockData[i].D20SMA + '</td>';
        temp = temp + '<td>' + stockData[i].D14RSI + '</td>';
        temp = temp + '<td>' + stockData[i].RiskReturnRate + '</td>';
        temp = temp + '<td>' + stockData[i].lastUpdate + '</td>';
        temp = temp + '</tr>';
        content = content + temp;
    }
    table = table + content;
	var data = {
		from: 'Automated Alarm <me@twistedogic.mailgun.org>',
		to: 'cloudogic@gmail.com',
		subject: 'Daily report',
		html: table
	};
	return data;
}

function emailAlert(key,data){
    publisher.set(key, 10);
    publisher.expire(key, 900);
    console.log("send mail");
	mailgun.messages().send(data, function (error, body) {
	    console.log(error);
	    console.log(body);
	});
}


subscriber.on("message", function(channel, message) {
    if (channel === "DayEnd") {
        subscriber.get("report", function(error,reply){
            reportAlert(reply,schema);
        })
    } else {
        var data = JSON.parse(message);
        console.log(data.id + ": " + data.price);
        thresholdAlert(data,stockDB);
    }
});
for (var i = 0; i < stockList.length; i++){
    subscriber.subscribe(stockList[i].id);
}
subscriber.subscribe("DayEnd");
