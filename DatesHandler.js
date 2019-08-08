const moment = require("moment-timezone");

module.exports.getTodayComponents = () => {
  var now = moment().tz("America/Mexico_City");
  var month = now.month() + 1;
  var day = now.date();
  var year = now.year();

  return { year, month, day };
};

module.exports.getYesterdayComponents = () => {
  var yesterday = moment()
    .tz("America/Mexico_City")
    .add(-1, "day");

  var month = yesterday.month() + 1;
  var day = yesterday.date();
  var year = yesterday.year();

  return { year, month, day };
};
