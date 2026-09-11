#!/bin/bash

cd /home/ec2-user/flowboard/flowboard-backend

source venv/bin/activate

nohup uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    > fastapi.log 2>&1 &