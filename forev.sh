#!/bin/bash
trap "exit" INT
while true
do
npm start
sleep 2
done