require("@nomicfoundation/hardhat-toolbox");
require("hardhat-tracer");
// tdly.setup(); // comment this if you want to run on local 

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.9" },
      { version: "0.8.17" },
      { version: "0.8.4" }
    ]
  }
};
