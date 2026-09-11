#!/bin/bash

set -e

cd /home/ec2-user/flowboard/flowboard-backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate

pip install --upgrade pip

pip install -r requirements.txt