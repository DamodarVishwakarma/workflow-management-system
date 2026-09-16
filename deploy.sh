#!/bin/bash
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-/home/ec2-user/workflow-management-system}"
BACKEND_DIR="${BACKEND_DIR:-$PROJECT_DIR/flowboard-backend}"
BUILD_ARCHIVE="${BUILD_ARCHIVE:-/home/ec2-user/flowboard-build.tgz}"
WEB_ROOT="${WEB_ROOT:-/usr/share/nginx/html}"
GIT_BRANCH="${GIT_BRANCH:-main}"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "Project directory not found: $PROJECT_DIR"
  exit 1
fi

cd "$PROJECT_DIR"

if [ -d .git ]; then
  git fetch origin "$GIT_BRANCH" || git fetch origin master || true
  git checkout "$GIT_BRANCH" || git checkout master || true
  git pull origin "$GIT_BRANCH" || git pull origin master || true
fi

echo "Deploying backend..."
cd "$BACKEND_DIR"

if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

# shellcheck disable=SC1091
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

sudo systemctl restart flowboard || true

echo "Deploying frontend..."
mkdir -p "$PROJECT_DIR/build"
rm -rf "$PROJECT_DIR/build"/*
tar -xzf "$BUILD_ARCHIVE" -C "$PROJECT_DIR/build"

sudo rm -rf "$WEB_ROOT"/*
sudo cp -r "$PROJECT_DIR/build"/* "$WEB_ROOT"/

sudo systemctl restart nginx

echo "Deployment completed"