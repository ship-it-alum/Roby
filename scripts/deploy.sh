#!/bin/bash

set -e

echo "=== Roby Deployment Script ==="
echo ""

NETWORK=${1:-devnet}

echo "Building Solana program..."
cd program
cargo build-bpf
cd ..

echo ""
echo "Deploying to $NETWORK..."

if [ "$NETWORK" = "mainnet" ]; then
    echo "WARNING: Deploying to mainnet!"
    read -p "Are you sure? (yes/no) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
    solana config set --url mainnet-beta
elif [ "$NETWORK" = "devnet" ]; then
    solana config set --url devnet
else
    echo "Invalid network: $NETWORK"
    echo "Usage: ./deploy.sh [devnet|mainnet]"
    exit 1
fi

PROGRAM_ID=$(solana program deploy program/target/deploy/roby_program.so | grep "Program Id:" | awk '{print $3}')

echo ""
echo "=== Deployment Successful ==="
echo "Program ID: $PROGRAM_ID"
echo "Network: $NETWORK"
echo ""
echo "Update your .env files with:"
echo "PROGRAM_ID=$PROGRAM_ID"
echo ""



























