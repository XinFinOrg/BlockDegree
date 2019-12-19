import _ from "lodash";
const web3 = require("web3");

export default function validate(fieldType, fieldValue) {
  switch (fieldType) {
    case "code": {
      // apha-numeric & underscore
      if (emptyStr(fieldValue)) {
        return false;
      }
      let re = /^[a-zA-Z0-9_]+$/;
      return re.test(fieldValue);
    }
    case "email": {
      if (emptyStr(fieldValue)) {
        return false;
      }
      let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(fieldValue);
    }
    case "integer": {
      let re = /^\d+$/;
      return re.test(fieldValue);
    }
    case "float": {
      let re = /^\d+\.?\d*$/;
      return re.test(fieldValue.toString());
    }
    case "address": {
      if (fieldValue.startsWith("xdc")) {
        fieldValue = "0x" + fieldValue.slice(2);
      }
      return web3.utils.isAddress(fieldValue);
    }
    case "text": {
      return !emptyStr(fieldValue);
    }
    default: {
      return new Error("Invalid field type");
    }
  }
}

// will check & return if the string is empty
function emptyStr(str) {
  if (_.isEmpty(str) || _.isEmpty(str.trim())) {
    return true;
  }
  return false;
}
