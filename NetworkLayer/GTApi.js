const axios = require("axios");
const config = require("../config");
const MultiCallCreator = require("../Utilities/GTMulticallCreators");
const _ = require("lodash");
const { farm, host, userName, password, database } = config;

generateCredentialFromActiveSessionId = () => {
  const { GT_SESSION_ID } = process.env;
  if (GT_SESSION_ID) {
    return { userName, database, sessionId: GT_SESSION_ID };
  } else {
    return null;
  }
};

handleGTError = error => {
  const { code } = error;
  if (code === -32000) {
    getCredentials();
  }
};

getCredentials = async () => {
  try {
    await authToken();
  } catch (error) {
    console.log(error);
  }
};

authToken = () => {
  const body = new GeoTabRequestBodyEncapsulator("Authenticate", {
    userName,
    password,
    database
  });

  return new Promise((resolve, reject) => {
    axios
      .post(`https://${farm}.${host}/apiv1`, body)
      .then(async ({ data }) => {
        const { result, error } = data;
        if (error) {
          const { message } = error;
          reject(message);
        } else {
          const { credentials } = result;
          const { sessionId } = credentials;
          process.env.GT_SESSION_ID = sessionId;
          resolve();
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

fetchGeofences = () => {
  const body = new GeoTabRequestBodyEncapsulator("Get", {
    typeName: "Zone",
    credentials: generateCredentialFromActiveSessionId()
  });

  return new Promise((resolve, reject) => {
    axios
      .post(`https://${farm}.${host}/apiv1`, body)
      .then(({ data }) => {
        const { result, error } = data;
        if (error) {
          handleGTError(error);
          const { message } = error;
          reject(message);
        } else {
          resolve(result);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

fetchDevices = () => {
  const body = new GeoTabRequestBodyEncapsulator("Get", {
    typeName: "Device",
    credentials: generateCredentialFromActiveSessionId()
  });

  return new Promise((resolve, reject) => {
    axios
      .post(`https://${farm}.${host}/apiv1`, body)
      .then(({ data }) => {
        const { result, error } = data;
        if (error) {
          handleGTError(error);
          const { message } = error;
          reject(message);
        } else {
          resolve(result);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

fetchInZoneExceptions = (fromDate, toDate) => {
  const body = new GeoTabRequestBodyEncapsulator("Get", {
    typeName: "ExceptionEvent",
    credentials: generateCredentialFromActiveSessionId(),
    search: {
      ruleSearch: { id: "aMTv7JOSZpUqqsbePvnF26w" },
      includeZoneStopRules: false,
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString()
    }
  });

  return new Promise((resolve, reject) => {
    axios
      .post(`https://${farm}.${host}/apiv1`, body)
      .then(({ data }) => {
        const { result, error } = data;
        if (error) {
          handleGTError(error);
          const { message } = error;
          reject(message);
        } else {
          resolve(result);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

fetchLogRecordsForExceptions = async exceptions => {
  const credentials = generateCredentialFromActiveSessionId();
  const body = new GeoTabRequestBodyEncapsulator("ExecuteMultiCall", {
    credentials,
    calls: MultiCallCreator.logRecordCalls(exceptions, credentials)
  });

  return new Promise((resolve, reject) => {
    axios
      .post(`https://${farm}.${host}/apiv1`, body)
      .then(({ data }) => {
        const { result, error } = data;
        if (error) {
          handleGTError(error);
          const { message } = error;
          reject(message);
        } else {
          resolve(result);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

fetchAddressForExceptions = async exceptions => {
  const credentials = generateCredentialFromActiveSessionId();
  const body = new GeoTabRequestBodyEncapsulator("ExecuteMultiCall", {
    credentials,
    calls: MultiCallCreator.addressesCalls(exceptions, credentials)
  });

  return new Promise((resolve, reject) => {
    axios
      .post(`https://${farm}.${host}/apiv1`, body)
      .then(({ data }) => {
        const { result, error } = data;
        if (error) {
          handleGTError(error);
          const { message } = error;
          reject(message);
        } else {
          resolve(result);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

fetchZonesForExceptions = async exceptions => {
  const credentials = generateCredentialFromActiveSessionId();
  const body = new GeoTabRequestBodyEncapsulator("ExecuteMultiCall", {
    credentials,
    calls: MultiCallCreator.zonesCalls(exceptions, credentials)
  });

  return new Promise((resolve, reject) => {
    axios
      .post(`https://${farm}.${host}/apiv1`, body)
      .then(({ data }) => {
        const { result, error } = data;
        if (error) {
          handleGTError(error);
          const { message } = error;
          reject(message);
        } else {
          resolve(result);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

module.exports = {
  authToken,
  fetchGeofences,
  getCredentials,
  fetchInZoneExceptions,
  generateCredentialFromActiveSessionId,
  fetchLogRecordsForExceptions,
  fetchAddressForExceptions,
  fetchZonesForExceptions,
  fetchDevices
};

class GeoTabRequestBodyEncapsulator {
  constructor(method, params) {
    this.method = method;
    this.params = params;
  }
}
