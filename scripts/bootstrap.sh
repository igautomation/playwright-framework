#!/bin/bash

echo "🚀 Bootstrapping framework environment..."

# Step 1: Check Node.js version
echo "🔎 Checking Node.js..."
node -v || { echo "❌ Node.js is not installed. Please install Node 18+"; exit 1; }

# Step 2: Install dependencies
echo "📦 Installing NPM dependencies..."
npm install

# Step 3: Setup .env file if missing
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "✅ .env file created from .env.example"
  else
    echo "⚠️  No .env.example found. Create .env manually."
  fi
else
  echo "✔ .env already exists"
fi

# Step 4: Husky install
if [ -d .husky ]; then
  echo "🔧 Setting up Husky..."
  npx husky install
  echo "✔ Husky hooks initialized"
else
  echo "ℹ️  Husky not configured. You can run: npx husky-init"
fi

# Step 5: Validate Allure CLI
echo "🔎 Checking Allure CLI..."
npx allure --version || echo "⚠️  Allure not installed globally. Tests will still work, but HTML reports require Allure."

# Step 6: Final status
echo "✅ Framework setup complete. You can now run:"
echo "   npx framework run --tags \"@api\""
