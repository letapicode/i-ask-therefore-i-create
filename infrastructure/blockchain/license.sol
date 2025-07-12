// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PluginLicense {
    mapping(string => address) public licenseOwners;

    function issueLicense(string memory key, address to) public {
        require(licenseOwners[key] == address(0), "exists");
        licenseOwners[key] = to;
    }

    function transferLicense(string memory key, address to) public {
        require(licenseOwners[key] == msg.sender, "not owner");
        licenseOwners[key] = to;
    }
}
