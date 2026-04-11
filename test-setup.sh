#!/bin/bash

# Test setup script for OpenCode Pets Plugin

echo "🐱 OpenCode Pets Plugin Test Setup"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f ".opencode/plugins/pets.tsx" ]; then
    echo "❌ Error: pets.tsx not found in .opencode/plugins/"
    exit 1
fi

echo "✅ Plugin file found"

# Check configuration
if [ -f ".opencode/tui.json" ]; then
    echo "✅ Configuration file exists"
    echo ""
    echo "Current configuration:"
    cat .opencode/tui.json | grep -A 20 "pet"
else
    echo "❌ Configuration file not found"
    exit 1
fi

echo ""
echo "=================================="
echo "📝 Installation Instructions:"
echo ""
echo "1. Copy .opencode/ to your project:"
echo "   cp -r .opencode/ /path/to/your/project/"
echo ""
echo "2. Ensure OpenCode is installed:"
echo "   opencode --version"
echo ""
echo "3. Navigate to your project and run:"
echo "   cd /path/to/your/project"
echo "   opencode"
echo ""
echo "4. Your pet should appear in the sidebar!"
echo ""
echo "=================================="
echo "🎮 Available test configurations:"
echo ""
echo "• Cat (Whiskers):    cp .opencode/tui.json .opencode/tui.json"
echo "• Dog (Buddy):       cp .opencode/tui.dog.json .opencode/tui.json"
echo "• Corgi (Peanut):    cp .opencode/tui.example.json .opencode/tui.json"
echo "• Ghost (Casper):    cp .opencode/tui.ghost.json .opencode/tui.json"
echo ""
