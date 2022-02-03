
// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.11;


contract TimeConditions {

  function executeAt(
    uint256 notBeforeTime,
    uint256 notAfterTime,
    address payable target,
    bytes memory params
  ) public payable returns(bool, bytes memory) {

    /* solhint-disable not-rely-on-time */
    require(block.timestamp > notBeforeTime, "Error: too earlly!");
    require(block.timestamp < notAfterTime, "Error: too late!");
    /* solhint-enable not-rely-on-time */

    // execute target function
    (bool success, bytes memory returnedData) = target.call{value: msg.value}(params); // solhint-disable-line indent, bracket-align

    return (success, returnedData);
  }

}