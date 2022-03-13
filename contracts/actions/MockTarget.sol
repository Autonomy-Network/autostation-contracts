pragma solidity 0.8.6;


import "../FundsRouter.sol";


contract MockTarget {
    
    address public immutable routerUserVeriForwarder;
    FundsRouter public immutable fundsRouter;
    uint public x;
    address public addr;
    uint public y;


    constructor(address routerUserVeriForwarder_, FundsRouter fundsRouter_) {
        routerUserVeriForwarder = routerUserVeriForwarder_;
        fundsRouter = fundsRouter_;
    }

    function setX(uint newX) public payable {
        x = newX;
    }

    function setY(uint newY) public payable {
        y = newY;
    }

    function setYVerify(address user, uint newY) public payable {
        require(msg.sender == routerUserVeriForwarder, "MockTarget: not userForw");
        y = newY;
    }

    function callWithdrawETH(uint amount) public {
        fundsRouter.withdrawETH(payable(address(this)), amount);
    }

    receive() external payable {}
}