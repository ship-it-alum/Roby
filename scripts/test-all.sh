#!/bin/bash

set -e

echo "=== Running All Tests ==="
echo ""

echo "1. Testing Solana Program..."
cd program
cargo test-bpf
cd ..
echo "Program tests: PASSED"
echo ""

echo "2. Building SDK..."
cd sdk
npm install
npm run build
echo "SDK build: SUCCESS"
echo ""

echo "3. Testing SDK..."
npm test
echo "SDK tests: PASSED"
echo ""

echo "4. Building API..."
cd ../api
npm install
npm run build
echo "API build: SUCCESS"
echo ""

echo "=== All Tests Passed ==="















