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
const xdceOwnerPubAddr = "0x4f72d2cd0f4152f4185b2013fb45Cc3A9B89d99E";
const blockdegreePubAddr = "0x3C7a500D32C3A8317c943293c2a123A0456aa2D0";
const burnAddress = "0x0000000000000000000000000000000000000000";

const XDCE = "xdce";

abiDecoder.addABI(xdceABI);



// eventEmitter.on("burnToken", handleBurnToken);
