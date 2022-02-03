
// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.11;


contract TimeConditions {

  mapping(address => mapping(uint256 => uint256)) public userToIDtoLastExecTime;

  function executeAt(
    uint256 notBeforeTime,
    uint256 notAfterTime,
    address payable target,
    bytes memory params
  ) public payable returns(bool success, bytes memory returnedData) {

    /* solhint-disable not-rely-on-time */
    require(block.timestamp > notBeforeTime, "Error: too early!");
    require(block.timestamp < notAfterTime, "Error: too late!");
    /* solhint-enable not-rely-on-time */

    // execute target function
    // solhint-disable-next-line indent, bracket-align, avoid-low-level-calls
    (success, returnedData) = target.call{value: msg.value}(params);
  }

  function executeReccuring(
    address originalSender,
    uint256 callID,
    uint256 secondsBetweenCalls,
    address payable target,
    bytes memory params
  ) public payable returns(bool success, bytes memory returnedData) {

    uint256 nextExecTime = userToIDtoLastExecTime[originalSender][callID] + secondsBetweenCalls;
    require(block.timestamp > nextExecTime, "Error: too early!"); // solhint-disable-line not-rely-on-time

    // update last execution time
    userToIDtoLastExecTime[originalSender][callID] += secondsBetweenCalls;

    // execute target function
    // solhint-disable-next-line indent, bracket-align, avoid-low-level-calls
    (success, returnedData) = target.call{value: msg.value}(params);
  }

}