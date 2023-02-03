methods {
    getContractAddress() returns address envfree
    getToken0DepositAddress() returns address envfree
    getToken1DepositAddress() returns address envfree
    getTokenBalance(address, address) returns uint256 envfree
    recordedTokenBalance(address) returns uint256 envfree
    owner() returns address envfree
    token0Amount() returns uint256 envfree
    token1Amount() returns uint256 envfree
    K() returns uint256 envfree

    // ERC20 functions
    balanceOf(address) returns uint256 envfree => DISPATCHER(true)
}

rule addLiqDecreasesBalanceIncreasesLPForUser(env e0, method f) {

    // require (getToken0DepositAddress() == getToken1DepositAddress());
    // require (user == owner() && user != currentContract);
    require (e0.msg.sender == owner() && e0.msg.sender != currentContract);
    init_pool(e0);

    env e;
    uint256 balanceToken0Before = getTokenBalance(getToken0DepositAddress(), e.msg.sender);
    uint256 balanceToken1Before = getTokenBalance(getToken1DepositAddress(), e.msg.sender);

    uint contractToken0BalanceBefore = getTokenBalance(getToken0DepositAddress(), currentContract);
    uint contractToken1BalanceBefore = getTokenBalance(getToken1DepositAddress(), currentContract);
    
    add_liquidity(e); 
    
    uint256 balanceToken0After = getTokenBalance(getToken0DepositAddress(), e.msg.sender);
    uint256 balanceToken1After = getTokenBalance(getToken1DepositAddress(), e.msg.sender);

    uint contractToken0BalanceAfter = getTokenBalance(getToken0DepositAddress(), currentContract);
    uint contractToken1BalanceAfter = getTokenBalance(getToken1DepositAddress(), currentContract);

    assert (balanceToken0Before >= balanceToken0After && balanceToken1Before >= balanceToken1After), 
        "user's token balance increased after add_liq()";
    assert (contractToken0BalanceBefore <= contractToken0BalanceAfter && 
        contractToken1BalanceBefore >= contractToken1BalanceAfter), "contracts's token balance decreased after add_liq()";
}

rule actualAndRecordedPoolBalanceEqual(env e0, method f) {
    
    require (e0.msg.sender == owner() && e0.msg.sender != currentContract);
    require (getToken0DepositAddress() == getToken1DepositAddress());
    init_pool(e0);

    uint contractToken0BalanceBefore = getTokenBalance(getToken0DepositAddress(), currentContract);
    uint recordedToken0BalanceBefore = recordedTokenBalance(getToken0DepositAddress());
    require contractToken0BalanceBefore == recordedToken0BalanceBefore;
    
    env e;
    // calldataarg args;
    // f(e, args);
    uint256 LPTokens;
    remove_liquidity(e, LPTokens);
    
    uint contractToken0BalanceAfter = getTokenBalance(getToken0DepositAddress(), currentContract);
    uint recordedToken0BalanceAfter = recordedTokenBalance(getToken0DepositAddress());

    assert (contractToken0BalanceAfter == recordedToken0BalanceAfter), "pool balance mismatch";
}