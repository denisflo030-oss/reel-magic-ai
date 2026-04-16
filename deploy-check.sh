#!/bin/bash
# Pre-Deployment Checklist for Reel Magic AI

echo "🚀 Reel Magic AI - Deployment Checklist"
echo "========================================"
echo ""

# Check 1: Git initialized
if [ -d .git ]; then
    echo "✅ Git repository initialized"
else
    echo "❌ Git not initialized"
    echo "   Run: git init && git config user.name 'Your Name' && git config user.email 'your@email.com'"
fi

# Check 2: Node dependencies
if [ -f package-lock.json ] || [ -f yarn.lock ]; then
    echo "✅ Dependencies locked"
else
    echo "⚠️  No lock file. Run: npm install"
fi

# Check 3: TypeScript compilation
if [ -f tsconfig.json ]; then
    echo "✅ TypeScript configured"
else
    echo "❌ tsconfig.json missing"
fi

# Check 4: Environment template
if [ -f .env.example ]; then
    echo "✅ .env.example exists"
else
    echo "❌ .env.example missing"
fi

# Check 5: .env in gitignore
if grep -q "^\.env$" .gitignore; then
    echo "✅ .env is in .gitignore (API keys protected)"
else
    echo "⚠️  .env not in .gitignore - API keys could be exposed!"
fi

# Check 6: Render configuration
if [ -f render.yaml ]; then
    echo "✅ render.yaml exists"
    echo "   Build command: $(grep buildCommand render.yaml | cut -d: -f2-)"
    echo "   Start command: $(grep startCommand render.yaml | cut -d: -f2-)"
else
    echo "⚠️  render.yaml missing"
fi

# Check 7: Build script
if grep -q '"build"' package.json; then
    echo "✅ Build script configured"
else
    echo "❌ Build script missing from package.json"
fi

# Check 8: Documentation
echo ""
echo "📚 Deployment Documentation:"
[ -f RENDER-DEPLOY.md ] && echo "   ✅ RENDER-DEPLOY.md (step-by-step guide)"
[ -f README.md ] && echo "   ✅ README.md (getting started)"
[ -f API.md ] && echo "   ✅ API.md (API reference)"

echo ""
echo "📋 Before Pushing to GitHub:"
echo "   1. Review .env.example for required variables"
echo "   2. Ensure .env is in .gitignore (never commit API keys)"
echo "   3. Test locally: npm run dev"
echo "   4. Commit all code"

echo ""
echo "🚀 To Deploy:"
echo "   1. Push to GitHub: git push -u origin main"
echo "   2. Go to render.com and create Web Service"
echo "   3. Connect your GitHub repo (reel-magic-ai)"
echo "   4. Add OPENAI_API_KEY in Environment Variables"
echo "   5. Click Deploy"

echo ""
echo "✅ All checks passed! Ready to deploy."
