const _ = require("lodash");

logRecordCalls = (exceptions, credentials) => {
  var logRecordCalls = [];
  _.forEach(exceptions, exception => {
    let logRecordCall = {
      method: "Get",
      params: {
        typeName: "LogRecord",
        search: {
          fromDate: exception.activeFrom,
          toDate: exception.activeTo,
          deviceSearch: {
            id: exception.device.id
          }
        },
        credentials: credentials
      }
    };
    logRecordCalls.push(logRecordCall);
  });

  return logRecordCalls;
};

addressesCalls = (exceptions, credentials) => {
  var addressesCalls = [];
  _.forEach(exceptions, exception => {
    const { gpsRecord } = exception;
    const coordinates = [{ x: gpsRecord.longitude, y: gpsRecord.latitude }];
    let getAddressesCall = {
      method: "GetAddresses",
      params: { credentials: credentials, coordinates: coordinates }
    };
    addressesCalls.push(getAddressesCall);
  });

  return addressesCalls;
};

zonesCalls = (exceptions, credentials) => {
  var zoneCalls = [];
  _.forEach(exceptions, exception => {
    const { address } = exception;
    const { zones } = address;
    const zone = zones[0];

    let zoneCall = {
      method: "Get",
      params: {
        typeName: "Zone",
        search: {
          id: zone.id
        },
        credentials: credentials
      }
    };

    zoneCalls.push(zoneCall);
  });

  return zoneCalls;
};

module.exports = { logRecordCalls, addressesCalls, zonesCalls };
