#!/bin/sh

last_line=""

while true;
do
        if ! pgrep -x "ipfs" > /dev/null
        then
                echo $(date '+%Y %b %d %H:%M') stopped >> /root/ipfs_checker_logs.txt
                ipfs daemon &
                sleep 20;
                address="$(ipfs add -r liek_landingpage/ | tail -1 | awk  '{print $2}')"
                ipfs pin add -r $address
        fi
        sleep 60;
done