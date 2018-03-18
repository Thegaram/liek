#!/bin/bash

rm -rf ./bin
mkdir bin 
solc --bin -o ./bin Liek.sol
solc --abi -o ./bin Liek.sol
mv ./bin/Liek.abi ./bin/Liek.json
