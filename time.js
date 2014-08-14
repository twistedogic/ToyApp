var moment = require("moment");
var time = moment().zone('+0800').format("YYYY-MM-DD HH:mm");
var day = moment().unix();
var normal = moment(1, "HH:mm").unix();
var diff = moment(day).isBefore(normal);
console.log(time);
console.log(day);
console.log(normal);
console.log(diff);