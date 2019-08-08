const FBService = require("./NetworkLayer/FBServices");
const GTApi = require("./NetworkLayer/GTApi");
const _ = require("lodash");

updateActiveSchedule = async turn => {
  try {
    const schedule = await FBService.getTurnSchedule(turn);
    await FBService.updateActiveSchedule(schedule);
  } catch (error) {
    console.log(error);
  }
};

updateTodaySchedule = async () => {
  try {
    await FBService.verifyTodaySchedule();
    const yesterdaySchedule = await FBService.getYesterdarSchedule();
    await FBService.updateTodaySchedule(yesterdaySchedule);
  } catch (error) {
    console.log(error);
  }
};

updateRoutes = async () => {
  try {
    const geofences = await GTApi.fetchGeofences();
    const routes = convertGeofencesToRoutes(geofences);
    await FBService.updateRoutes(routes);
  } catch (error) {
    console.log(error);
  }
};

updateTrucks = async () => {
  try {
    const devices = await GTApi.fetchDevices();
    const trucks = convertDevicesToTruckData(devices);
    await FBService.updateTrucks(trucks);
  } catch (error) {
    console.log(error);
  }
};

convertDevicesToTruckData = devices => {
  modifiedDevices = _.map(devices, device => {
    return { id: device.id, nombre: device.name };
  });
  return _.keyBy(modifiedDevices, "id");
};

convertGeofencesToRoutes = geofences => {
  modifiedGeofences = _.map(geofences, geofence => {
    return { id: geofence.id, comment: geofence.comment, name: geofence.name };
  });
  return _.keyBy(modifiedGeofences, "id");
};

module.exports = {
  updateActiveSchedule,
  updateRoutes,
  updateActiveSchedule,
  updateTodaySchedule,
  updateTrucks
};
