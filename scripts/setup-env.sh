#!/bin/bash
# ForMedics Orchestrator Setup Utility

echo "🛠  Configuring local development environment..."

# Create .env from example if missing
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env from template."
fi

# Ensure dependencies are locked
npm install

echo "🎉 Environment ready. Run 'node scripts/simulate-search-spike.js' to see the Netflix Gradient in action."