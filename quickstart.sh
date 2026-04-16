#!/bin/bash
# Quick Start Script for Reel Magic AI
# This script guides you through initial setup

set -e

echo "🎬 Reel Magic AI - Quick Start Setup"
echo "===================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or later."
    echo "   Download from: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed."
    echo ""
    echo "Install FFmpeg:"
    echo "  macOS:    brew install ffmpeg"
    echo "  Ubuntu:   sudo apt-get install ffmpeg"
    echo "  Windows:  https://ffmpeg.org/download.html"
    exit 1
fi

echo "✅ FFmpeg is installed: $(ffmpeg -version | head -1)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Create .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your OpenAI API key"
    echo "   Get a key from: https://platform.openai.com/api-keys"
    echo ""
    echo "   Then run: npm run dev"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🚀 Ready to run!"
echo ""
echo "Start development server:"
echo "  npm run dev"
echo ""
echo "Or start production server:"
echo "  npm run build"
echo "  npm start"
echo ""
echo "Server will run at: http://localhost:3000"
echo ""
echo "Test the API:"
echo "  curl http://localhost:3000/health"
echo ""
echo "Full integration test:"
echo "  ./test-api.sh path/to/video.mp4"
echo ""
echo "Documentation:"
echo "  README.md       - Project overview"
echo "  API.md          - Complete API reference"
echo "  INTEGRATION.md  - Integration examples"
echo ""
