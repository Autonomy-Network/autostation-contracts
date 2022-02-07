
// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.11;


contract TimeConditions {

  // Mapping a user to last execution date of its ongoing requests
  // - because a user can have multiple requests, we introduce an arbitrary requestID (also refered as `callID`)
  // - user are responsible to manage & remember their used requestID
  mapping(address => mapping(uint256 => uint256)) public userToIDtoLastExecTime;


  /** @dev Forward an arbitrary call if the function is called at the correct time,
    *   i.e. after `notBeforeTime` but before `notAfterTime`.
    *   Note: any ETH sent to this function will be forwarded to the `target`. 
    *
    * @param notBeforeTime if the function is called before this timestamp it will fail
    * @param notAfterTime if the function is called after this timestamp it will fail
    * @param target address that will be called if the requets is successfull.
    * @param params encoded arguments that will be forwarded to the `target` address if the requets is successful.
    *
    * @return success wether or not the forwarded transaction has succeeded.
    * @return returnedData the returned result of the forwarded transaction.
    */
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

  /** @dev Forward an arbitrary call if the function has been called at least `secondsSinceLastCall` since last time.
    *   Note: any ETH sent to this function will be forwarded to the `target`.
    *
    * @param originalSender the address of the user calling,
    *   request with same `originalSender` & same `callID` are considered to be the same,
    *   this is used only to store & retreive the amount of time between request.
    * @param callID an arbitrary request ID,
    *   request with same `originalSender` & same `callID` are considered to be the same,
    *   this is used only to store & retreive the amount of time between request.
    * @param secondsSinceLastCall number of seconds that should have passed since last call for this requets to be successfully forwarded.
    * @param target address that will be called if the requets is successfull.
    * @param params encoded arguments that will be forwarded to the `target` address if the requets is successful.
    *
    * @return success wether or not the forwarded transaction has succeeded.
    * @return returnedData the returned result of the forwarded transaction.
    */
  function executeAfter(
    address originalSender,
    uint256 callID,
    uint256 secondsSinceLastCall,
    address payable target,
    bytes memory params
  ) public payable returns(bool success, bytes memory returnedData) {

    // immediately execute the first time
    if (userToIDtoLastExecTime[originalSender][callID] == 0) {

      userToIDtoLastExecTime[originalSender][callID] = block.timestamp; // solhint-disable-line not-rely-on-time

    } else {

      uint256 nextExecTime = userToIDtoLastExecTime[originalSender][callID] + secondsSinceLastCall;
      require(block.timestamp > nextExecTime, "Error: too early!"); // solhint-disable-line not-rely-on-time

      // update last execution time
      userToIDtoLastExecTime[originalSender][callID] += secondsSinceLastCall;
    }

    // execute target function
    // solhint-disable-next-line indent, bracket-align, avoid-low-level-calls
    (success, returnedData) = target.call{value: msg.value}(params);
  }

}
