#!/bin/bash
set -e

PROJECT_DIR=/home/ec2-user/workflow-management-system

cd $PROJECT_DIR

git pull origin master

echo "Deploying backend..."

cd flowboard-backend

source venv/bin/activate

pip install -r requirements.txt

sudo systemctl restart flowboard

echo "Deploying frontend..."

cd ../flowboard-frontend

mkdir -p build

tar -xzf /home/ec2-user/flowboard-build.tgz -C build

sudo rm -rf /usr/share/nginx/html/*
sudo cp -r build/* /usr/share/nginx/html/

sudo systemctl restart nginx

echo "Deployment completed"