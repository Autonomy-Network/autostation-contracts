pragma solidity 0.8.6;


interface IUniswapV2Router02 {
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) external pure returns (uint amountIn);
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);
}


/**
* @notice   UniswapV2Amounts effectively checks the current price of
*           trading pairs on UniswapV2
* @author   @quantafire (James Key)
*/
contract UniswapV2Amounts {
    
    IUniswapV2Router02 public immutable uni;

    constructor(IUniswapV2Router02 uni_) {
        uni = uni_;
    }

    /**
    * @notice   This checks the result of UniswapV2's `getAmountsOut`
    *           for the given trading pair and requires that it's above
    *           `minAmountOut`. Note this does not actually perform a
    *           trade, only checks the resulting prices of a hypothetical
    *           trade.
    * @param srcToken   The token to be sold.
    * @param destToken  The token to be bought.
    * @param amountIn   The amount of `srcToken` to sell.
    * @param minAmountOut   The minimum amount of `destToken` to receive
    *                       where the tx won't revert.
    */
    function amountOutGreaterThan(
        address srcToken,
        address destToken,
        uint amountIn,
        uint minAmountOut
    ) external view returns (uint[] memory amountsOut) {
        address[] memory path = new address[](2);
        path[0] = srcToken;
        path[1] = destToken;
        amountsOut = uni.getAmountsOut(amountIn, path);

        require(amountsOut[amountsOut.length-1] >= minAmountOut, "UniswapV2Amounts: output too low");
    }
}