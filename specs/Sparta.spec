methods {
    getContractAddress() returns address envfree
    getToken0DepositAddress() returns address envfree
    getToken1DepositAddress() returns address envfree
    token0Balance(address) returns uint256 envfree
    token1Balance(address) returns uint256 envfree
    owner() returns address envfree
    token0Amount() returns uint256 envfree
    token1Amount() returns uint256 envfree
    K() returns uint256 envfree

    // ERC20 functions
    balanceOf(address) returns uint256 => DISPATCHER(true)
}

rule addLiqDecreasesBalanceIncreasesLPForUser(env e, method f, address user) {

    // require (getToken0DepositAddress() == getToken1DepositAddress());
    require (user == owner() && user != currentContract);
    init_pool(e);

    uint256 balanceToken0Before = token0Balance(user);
    uint256 balanceToken1Before = token1Balance(user);

    uint contractToken0BalanceBefore = token0Balance(currentContract);
    uint contractToken1BalanceBefore = token1Balance(currentContract);
    
    add_liquidity(e);
    // calldataarg args;
    // f(e, args);
    
    uint256 balanceToken0After = token0Balance(user);
    uint256 balanceToken1After = token1Balance(user);

    uint contractToken0BalanceAfter = token0Balance(currentContract);
    uint contractToken1BalanceAfter = token1Balance(currentContract);

    assert (balanceToken0Before >= balanceToken0After && balanceToken1Before >= balanceToken1After), "user's token balance increased after add_liq()";
    assert (contractToken0BalanceBefore <= contractToken0BalanceAfter && contractToken1BalanceBefore >= contractToken1BalanceAfter), "contracts's token balance decreased after add_liq()";
}