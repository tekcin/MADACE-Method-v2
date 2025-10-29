#!/bin/bash
# MADACE-Method v3.0 - Gemma3 4B Setup Script
# This script ships with the product and sets up the default local LLM

set -e

echo "==========================================="
echo "MADACE-Method v3.0 - Gemma3 4B Setup"
echo "==========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    echo "Please install Docker from: https://www.docker.com/get-started"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Create data directories
echo "📁 Creating data directories..."
mkdir -p madace-data/config
mkdir -p madace-data/agents
mkdir -p madace-data/workflows
mkdir -p logs/caddy

echo "✅ Data directories created"
echo ""

# Start Docker services
echo "🚀 Starting MADACE services..."
docker-compose up -d

echo "⏳ Waiting for services to initialize..."
sleep 15

# Check if Ollama is running
echo "🔍 Checking Ollama service..."
if ! docker ps | grep -q ollama; then
    echo "❌ Error: Ollama container failed to start"
    echo "Run 'docker-compose logs ollama' for details"
    exit 1
fi

echo "✅ Ollama is running"
echo ""

# Pull Gemma3 4B model
echo "📥 Downloading Gemma3 4B model (3.3GB)..."
echo "This may take 2-5 minutes depending on your internet connection..."
echo ""

if docker exec ollama ollama pull gemma3; then
    echo ""
    echo "✅ Gemma3 4B model downloaded successfully!"
else
    echo ""
    echo "❌ Error: Failed to download Gemma3 4B model"
    echo "Run 'docker logs ollama' for details"
    exit 1
fi

echo ""

# Verify model is available
echo "🔍 Verifying Gemma3 4B installation..."
if docker exec ollama ollama list | grep -q gemma3; then
    echo "✅ Gemma3 4B is installed and ready"
else
    echo "❌ Warning: Gemma3 4B not found in model list"
    echo "Run 'docker exec ollama ollama list' to check available models"
fi

echo ""
echo "==========================================="
echo "🎉 Setup Complete!"
echo "==========================================="
echo ""
echo "MADACE is now running with Gemma3 4B!"
echo ""
echo "📍 Web UI: http://localhost:3000"
echo "🤖 LLM Test: http://localhost:3000/llm-test"
echo "📖 Documentation: http://localhost:3000/docs"
echo ""
echo "To add more models:"
echo "  docker exec ollama ollama pull llama3.1"
echo "  docker exec ollama ollama pull mistral"
echo ""
echo "To list installed models:"
echo "  docker exec ollama ollama list"
echo ""
echo "To stop services:"
echo "  docker-compose down"
echo ""
echo "To restart services:"
echo "  docker-compose up -d"
echo ""
echo "==========================================="
