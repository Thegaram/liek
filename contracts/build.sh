#!/bin/bash

rm -rf ./bin
mkdir bin 
solc --bin -o ./bin/Liek.bin Liek.sol
solc --abi -o ./bin/Liek.json Liek.sol
