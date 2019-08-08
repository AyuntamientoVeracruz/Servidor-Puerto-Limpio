const GTApi = require("../NetworkLayer/GTApi");
const _ = require("lodash");
const moment = require("moment-timezone");
const FBServices = require("../NetworkLayer/FBServices");

checkInZoneExceptions = async () => {
  var toDate = new Date();
  var fromDate = new Date(toDate.getTime() - 600000);

  try {
    const exceptions = await GTApi.fetchInZoneExceptions(fromDate, toDate);

    var filteredExceptions = filterExceptionsByTimeRange(
      exceptions,
      fromDate,
      toDate
    );

    const logRecords = await GTApi.fetchLogRecordsForExceptions(
      filteredExceptions
    );
    filteredExceptions = addLogRecordsToExceptions(
      filteredExceptions,
      logRecords
    );

    const addresses = await GTApi.fetchAddressForExceptions(filteredExceptions);
    filteredExceptions = addAddressesToExceptions(
      filteredExceptions,
      addresses
    );

    const zones = await GTApi.fetchZonesForExceptions(filteredExceptions);
    filteredExceptions = addZonesToExceptions(filteredExceptions, zones);

    matchExceptionsWitchActiveSchedule(filteredExceptions);
  } catch (error) {
    console.log(error);
  }
};

matchExceptionsWitchActiveSchedule = async exceptions => {
  try {
    const schedule = await FBServices.fetchActiveSchedule();
    checkMatches(exceptions, schedule);
  } catch (error) {
    console.log(error);
  }
};

checkMatches = async (exceptions, schedule) => {
  _.forEach(exceptions, exception => {
    const { zone, device, activeFrom } = exception;
    const exceptionSchedule = schedule[zone.id];
    const horaEntrada = moment(activeFrom).tz("America/Mexico_City");
    if (exceptionSchedule) {
      if (exceptionSchedule.unidadAsignada === device.id) {
        FBServices.sentInZoneExceptionNotification(exception);
      }
    }
  });
};

filterExceptionsByTimeRange = (exceptions, fromDate, toDate) => {
  var toDateTime = toDate.getTime();
  var fromDateTime = fromDate.getTime();
  var filteredExceptions = [];

  _.forEach(exceptions, exceptionEvent => {
    const { activeFrom } = exceptionEvent;
    const activeFromDate = new Date(activeFrom);
    const activeFromDateTime = activeFromDate.getTime();
    if (
      activeFromDateTime >= fromDateTime &&
      activeFromDateTime <= toDateTime
    ) {
      filteredExceptions.push(exceptionEvent);
    }
  });

  return filteredExceptions;
};

addLogRecordsToExceptions = (exceptions, logRecords) => {
  _.forEach(logRecords, (records, index) => {
    const record = records[0];
    exceptions[index].gpsRecord = record;
  });
  return exceptions;
};

addAddressesToExceptions = (exceptions, addreses) => {
  _.forEach(addreses, (address, index) => {
    exceptions[index].address = address[0];
  });
  return exceptions;
};

addZonesToExceptions = (exceptions, zones) => {
  _.forEach(zones, (zoneResult, index) => {
    const zone = zoneResult[0];
    exceptions[index].zone = zone;
  });
  return exceptions;
};

module.exports = { checkInZoneExceptions };
