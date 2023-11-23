const uuid = require("uuid/v4");
const _ = require("lodash");

const NFT = require("../models/nft");
const User = require("../models/user");
const mint = require("../helpers/nft/mint");

const tokenName = "Blockdegree Certificate",
  description = "Blockdegree Certificate belonging to user ";

const IPFS_PREFIX = "https://ipfs-gateway.xdc.network/";

/**
 *
 * @param {*} req
 * @param {*} res
 */
exports.MintNft = async (req, res) => {
  try {
    const { owner, certificateHash } = req.body;

    if (_.isEmpty(owner) || _.isEmpty(certificateHash)) {
      return res.json({
        status: false,
        error: "empty parameters",
      });
    }

    const email = req.user.email;

    const user = await User.findOne({ email });
    if (!user)
      return res.json({
        status: false,
        error: "user does not exist",
      });

    const hashExists = user.examData.certificateHash.some(
      (x) => x.clientHash === certificateHash
    );

    if (!hashExists) {
      return res.json({
        status: false,
        error: "hash does not exists",
      });
    }

    const nftExists = await NFT.findOne({
      $and: [{ certificateHash }, { status: "completed" }],
    });

    if (nftExists) {
      return res.json({
        status: false,
        error: "nft already exists",
      });
    }

    const name = user.name;
    const tokenDescription = description + name;
    const uniqueId = uuid();
    const tokenURI = IPFS_PREFIX + certificateHash;

    const newNFT = new NFT({
      uniqueId,
      certificateHash,
      email,
      status: "initiated",
      tokenData: {
        owner,
        name: tokenName,
        description: tokenDescription,
        tokenURI,
      },
    });

    await newNFT.save();

    res.json({ status: true, message: "processing  started..." });

    const receipt = await mint.Mint({
      owner,
      name: tokenName,
      description: tokenDescription,
      tokenURI,
    });

    if (receipt == null) {
      newNFT.status = "failed";
      await newNFT.save();
      return;
    }

    newNFT.transactionHash = receipt.transactionHash;
    newNFT.receipt = receipt;
    newNFT.status = "completed";
    await newNFT.save();

    for (let i = 0; i < user.examData.certificateHash.length; i++) {
      if (user.examData.certificateHash[i].clientHash === certificateHash) {
        user.examData.certificateHash[i].minted = true;
        user.examData.certificateHash[i].mintTx = receipt.transactionHash;
        break;
      }
    }

    user.markModified("examData");
    await user.save();

    console.log("NFT minted for", certificateHash);
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      error: "server error",
    });
  }
};
