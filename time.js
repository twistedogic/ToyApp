var moment = require("moment");
var time = moment().zone('+0800').format("YYYY-MM-DD HH:mm");
var day = moment().zone('+0800').format("HH:mm");
var normal = moment(9, "HH").format('LLL');
normal = moment('20:00').isBefore(day);
console.log(time);
console.log(day);
console.log(normal);