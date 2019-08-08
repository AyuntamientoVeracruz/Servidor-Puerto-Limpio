var admin = require("firebase-admin");
var serviceAccount = require("../firebase.json");
var datesHandler = require("../DatesHandler");
const fs = require("fs");

const LAST_SCHE_FILENAME = "lastSchedule.json";

module.exports.initializeApp = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "firebasedatabaseurl"
  });
};

module.exports.saveTodayScheduleToDisk = () => {
  const { year, month, day } = datesHandler.getTodayComponents();
  var todayScheduleRef = admin
    .database()
    .ref("historial")
    .child(year)
    .child(month)
    .child(day);

  return new Promise((resolve, reject) => {
    todayScheduleRef
      .once("value")
      .then(snapshot => {
        let jsonSchedule = snapshot.val();
        let data = JSON.stringify(jsonSchedule);
        fs.writeFileSync(LAST_SCHE_FILENAME, data);
        resolve();
      })
      .catch(reject);
  });
};

module.exports.recoverLastSchedule = async () => {
  try {
    await this.verifyTodaySchedule();
    let data = fs.readFileSync(LAST_SCHE_FILENAME);
    let schedule = JSON.parse(data);
    await updateTodaySchedule(schedule);
  } catch (error) {
    console.log(error);
  }
};

module.exports.getActiveSchedule = () => {
  var db = admin.database();
  var ref = db.ref("horarioActivo");

  return new Promise((resolve, reject) => {
    ref
      .once("value")
      .then(snapshot => {
        let activeSchedule = snapshot.val();
        if (activeSchedule) {
          resolve(activeSchedule);
        } else {
          reject(
            "No existe un horario activo,favor de crear un horario para el dia de hoy"
          );
        }
      })
      .catch(reason => {
        reject(reason);
      });
  });
};

module.exports.getTurnSchedule = turn => {
  const { year, month, day } = datesHandler.getTodayComponents();
  var scheduleRef = admin
    .database()
    .ref("historial")
    .child(year)
    .child(month)
    .child(day)
    .child(turn);

  return new Promise((resolve, reject) => {
    scheduleRef
      .once("value")
      .then(snapshot => {
        let schedule = snapshot.val();
        if (schedule) {
          resolve(schedule);
        } else {
          reject(
            `No existe un horario ${turn} para el dia ${year} - ${month} - ${day}`
          );
        }
      })
      .catch(reason => reject(reason));
  });
};

module.exports.updateActiveSchedule = schedule => {
  var activeScheduleRef = admin.database().ref("horarioActivo");

  return new Promise((resolve, reject) => {
    activeScheduleRef
      .set(schedule)
      .then(() => resolve())
      .catch(reason => reject(reason));
  });
};

module.exports.fetchActiveSchedule = () => {
  var activeScheduleRef = admin.database().ref("horarioActivo");

  return new Promise((resolve, reject) => {
    activeScheduleRef
      .once("value")
      .then(snapshot => {
        const schedule = snapshot.val();
        if (schedule) {
          resolve(schedule);
        } else {
          reject("No existe un horario activo");
        }
      })
      .catch(reason => reject(reason));
  });
};

module.exports.updateRoutes = routes => {
  var routesRef = admin.database().ref("rutas");

  return new Promise((resolve, reject) => {
    routesRef
      .set(routes)
      .then(() => resolve())
      .catch(reason => reject(reason));
  });
};

module.exports.updateTrucks = routes => {
  var routesRef = admin.database().ref("unidades");

  return new Promise((resolve, reject) => {
    routesRef
      .set(routes)
      .then(() => resolve())
      .catch(reason => reject(reason));
  });
};

module.exports.verifyTodaySchedule = () => {
  const { year, month, day } = datesHandler.getTodayComponents();
  var todayScheduleRef = admin
    .database()
    .ref("historial")
    .child(year)
    .child(month)
    .child(day);

  return new Promise((resolve, reject) => {
    todayScheduleRef
      .once("value")
      .then(snapshot => {
        let schedule = snapshot.val();
        if (schedule) {
          reject(
            `Ya existe un horario para el dia ${year} - ${month} - ${day}`
          );
        } else {
          resolve();
        }
      })
      .catch(reason => reject(reason));
  });
};

module.exports.updateTodaySchedule = schedule => {
  const { year, month, day } = datesHandler.getTodayComponents();
  var todayScheduleRef = admin
    .database()
    .ref("historial")
    .child(year)
    .child(month)
    .child(day);

  return new Promise((resolve, reject) => {
    todayScheduleRef
      .update(schedule)
      .then(_ => resolve())
      .catch(reason => reject(reason));
  });
};

module.exports.getYesterdarSchedule = () => {
  const { year, month, day } = datesHandler.getYesterdayComponents();
  var yesterdayScheduleRef = admin
    .database()
    .ref("historial")
    .child(year)
    .child(month)
    .child(day);

  return new Promise((resolve, reject) => {
    yesterdayScheduleRef
      .once("value")
      .then(snapshot => {
        const schedule = snapshot.val();
        if (schedule) {
          resolve(schedule);
        } else {
          reject(
            `No existe un horario para el dia ${year} - ${month} - ${day}`
          );
        }
      })
      .catch(reason => reject(reason));
  });
};

getVehicleName = async deviceId => {
  var db = admin.database();
  var ref = db.ref("unidades");
  var vehicleRef = ref.child(deviceId).child("nombre");

  return new Promise((resolve, reject) => {
    vehicleRef.once("value", snapshot => {
      let name = snapshot.val();
      if (name) {
        resolve(name);
      } else {
        resolve("Sin Asignar");
      }
    });
  });
};

module.exports.sentInZoneExceptionNotification = async exception => {
  const { zone, device } = exception;
  const { name, comment } = zone;

  let vehicleName = await getVehicleName(device.id);

  var topic = zone.id;

  const body = `El camión ${vehicleName} ya se encuentra en la ruta ${name} que comprende ${comment}`;


  var message = {
    data: {
      vehicleName: vehicleName,
      zoneName: zone.name
    },
    android: {
      priority: "normal",
      notification: {
        title: "Atención",
        body: body,
        sound: "default"
      }
    },
    apns: {
      headers: {
        "apns-priority": "10"
      },
      payload: {
        aps: {
          alert: {
            title: "Atención",
            body: body,
            sound: "default"
          },
          sound: "default"
        }
      }
    },
    topic: topic
  };

  admin.messaging().send(message);
};
