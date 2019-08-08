var manager = require("./SchedulesManager");
var ExceptionsManager = require("./Managers/ExceptionsManager");
var FBService = require("./NetworkLayer/FBServices");
var GTApi = require("./NetworkLayer/GTApi");
var cron = require("node-cron");

const UPDATE_NIGHT_ACTIVE_ROUTE = "0-59/5 18-23 * * *";
const UPDATE_EVENING_ACTIVE_ROUTE = "0-59/5 14-17 * * *";
const UPDATE_MORNING_ACTIVE_ROUTE = "0-59/5 4-13 * * *";
const COPY_YESTERDAY_SCHEDULE = "00 15 03 * * *";
const RENOVATE_GEOTAB_SESSION_ID = "00 24 05 * * *";
const UPDATE_FIREBASE_ROUTES = "5-59/30 2-11 * * *";
const UPDATE_FIREBASE_TRUCKS = "5-59/30 2-11 * * *";
const CHECK_IN_ZONE_EXCEPTIONS = "0-59/10 5-23 * * *";
const SAVE_TODAY_SCHEDULE_TO_DISK = "0-59/20 01-23 * * *";

init = async () => {
  FBService.initializeApp();
  await FBService.recoverLastSchedule();
  await GTApi.getCredentials();
};

cron.schedule(SAVE_TODAY_SCHEDULE_TO_DISK, () => {
  FBService.saveTodayScheduleToDisk();
});

cron.schedule(UPDATE_NIGHT_ACTIVE_ROUTE, () => {
  manager.updateActiveSchedule("Nocturno");
});

cron.schedule(UPDATE_EVENING_ACTIVE_ROUTE, () => {
  manager.updateActiveSchedule("Vespertino");
});

cron.schedule(UPDATE_MORNING_ACTIVE_ROUTE, () => {
  manager.updateActiveSchedule("Matutino");
});

cron.schedule(UPDATE_FIREBASE_ROUTES, () => {
  manager.updateRoutes();
});

cron.schedule(UPDATE_FIREBASE_TRUCKS, () => {
  manager.updateTrucks();
});

cron.schedule(COPY_YESTERDAY_SCHEDULE, () => {
  manager.updateTodaySchedule();
});

cron.schedule(RENOVATE_GEOTAB_SESSION_ID, async () => {
  GTApi.getCredentials();
});

cron.schedule(CHECK_IN_ZONE_EXCEPTIONS, async () => {
  ExceptionsManager.checkInZoneExceptions();
});

init();
