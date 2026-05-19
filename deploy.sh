#!/bin/bash
# Simple deployment script for Student Task Planner

echo "🚀 Student Task Planner - GitHub Deployment Script"
echo "=================================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
fi

# Add all files
echo "📝 Adding files to Git..."
git add .

# Commit
echo "💾 Creating commit..."
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update Student Task Planner"
fi
git commit -m "$commit_msg"

# Check if remote exists
if ! git remote | grep -q origin; then
    echo ""
    echo "🔗 Setting up GitHub remote..."
    read -p "Enter your GitHub username: " username
    git remote add origin https://github.com/$username/student-task-planner.git
    git branch -M main
fi

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Done! Your code is now on GitHub!"
echo ""
echo "🌐 Next steps:"
echo "1. Go to https://render.com and sign up"
echo "2. Create a new Web Service"
echo "3. Connect your GitHub repository"
echo "4. Your app will be live in minutes!"
echo ""
