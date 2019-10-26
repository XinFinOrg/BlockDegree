const PaymentLog = require("../models/payment_token");
const CoursePrice = require("../models/coursePrice");
const BurnLog = require("../models/burn_logs");
const User = require("../models/user");
const Web3 = require("web3");
const uuidv4 = require("uuid/v4");
const abiDecoder = require("abi-decoder");
const axios = require("axios");

const eventEmitter = require("./txnConfirmation").em;
const coursePrice = require("../models/coursePrice");
const PaymentLog = require("../models/payment_token");

const contractConfig = require("../config/smartContractConfig");
const keyConfig = require("../config/keyConfig").mainnetPrivateKey;

const xdceAddrMainnet = contractConfig.address.xdceMainnet;
const xdceABI = contractConfig.XdceABI;
const xdceOwnerPubAddr = "0x4F85F740aCDCf01DF73Be4EB9558247E573097ff";
const blockdegreePubAddr = "0x4F85F740aCDCf01DF73Be4EB9558247E573097ff";
const burnAddress = "0x0000000000000000000000000000000000000000";

const XDCE = "xdce";

abiDecoder.addABI(xdceABI);



// eventEmitter.on("burnToken", handleBurnToken);
