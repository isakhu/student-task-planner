# 📦 How to Put Your Project on GitHub

## 🎯 What You Need

1. A GitHub account (free) - [Sign up here](https://github.com/signup)
2. Git installed on your computer
3. Your project files (already done! ✅)

---

## 📝 Step-by-Step Instructions

### Step 1: Check if Git is Installed

Open your terminal and type:
```bash
git --version
```

If you see a version number, you're good! If not, [install Git](https://git-scm.com/downloads).

### Step 2: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click the **+** icon in the top right
3. Click **New repository**
4. Fill in:
   - **Repository name**: `student-task-planner`
   - **Description**: "A web app to help students manage tasks with deadlines"
   - **Public** (so others can see it)
   - **Don't** check "Initialize with README" (we already have one)
5. Click **Create repository**

### Step 3: Connect Your Project to GitHub

GitHub will show you commands. Copy them or use these:

```bash
# Make sure you're in your project folder
cd student-task-planner

# Initialize git repository
git init

# Add all your files
git add .

# Create your first commit
git commit -m "Initial commit - Student Task Planner app"

# Connect to GitHub (replace YOUR_USERNAME with your actual username)
git remote add origin https://github.com/YOUR_USERNAME/student-task-planner.git

# Rename branch to main
git branch -M main

# Push your code to GitHub
git push -u origin main
```

### Step 4: Enter Your Credentials

When prompted:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your password)

#### How to Create a Personal Access Token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **Generate new token (classic)**
3. Give it a name: "Student Task Planner"
4. Check: `repo` (full control of private repositories)
5. Click **Generate token**
6. **Copy the token** (you won't see it again!)
7. Use this token as your password when pushing

### Step 5: Verify Upload

1. Go to your GitHub repository page
2. Refresh the page
3. You should see all your files! 🎉

---

## 🎉 Your Project is Now on GitHub!

Your repository URL will be:
```
https://github.com/YOUR_USERNAME/student-task-planner
```

---

## 📤 Making Updates Later

When you make changes to your code:

```bash
# Add changed files
git add .

# Commit with a message describing what you changed
git commit -m "Added new feature"

# Push to GitHub
git push
```

---

## 🌐 Next Step: Deploy Your App

Now that your code is on GitHub, you can deploy it so anyone can use it!

**Easiest option: Render.com (Free)**

1. Go to [Render.com](https://render.com)
2. Sign up with your GitHub account
3. Click **New +** → **Web Service**
4. Select your `student-task-planner` repository
5. Settings:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: Free
6. Click **Create Web Service**
7. Wait 2-3 minutes
8. Your app is live! 🚀

---

## 📋 Files Created for Deployment

I've added these files to make deployment easy:

- ✅ **requirements.txt** - Lists Python packages needed
- ✅ **Procfile** - Tells Heroku how to run your app
- ✅ **runtime.txt** - Specifies Python version
- ✅ **vercel.json** - Configuration for Vercel deployment
- ✅ **.gitignore** - Tells Git which files to ignore
- ✅ **DEPLOYMENT.md** - Detailed deployment guide
- ✅ **QUICK_START.md** - 5-minute deployment guide

---

## 🎓 What This Means

By putting your project on GitHub:
- ✅ **Backup** - Your code is safe in the cloud
- ✅ **Portfolio** - Show employers your work
- ✅ **Collaboration** - Others can contribute
- ✅ **Deployment** - Easy to host online
- ✅ **Version Control** - Track all changes

---

## 🆘 Common Issues

### "Permission denied"
- Use a Personal Access Token instead of password
- Make sure you have write access to the repository

### "Repository not found"
- Check the URL is correct
- Make sure the repository exists on GitHub

### "Failed to push"
- Pull first: `git pull origin main`
- Then push: `git push origin main`

---

## 🎯 Summary

```bash
# One-time setup
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/student-task-planner.git
git branch -M main
git push -u origin main

# Future updates
git add .
git commit -m "Description of changes"
git push
```

**That's it! Your project is now on GitHub! 🎉**
