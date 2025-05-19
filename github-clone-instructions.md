# How to Clone This Repository to Your GitHub Account

Follow these steps to create a clone of this Playwright framework in your GitHub account:

## Step 1: Create a New Repository on GitHub

1. Go to [GitHub](https://github.com/) and sign in to your account
2. Click on the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "playwright-framework")
4. Add an optional description
5. Choose whether to make it public or private
6. Do NOT initialize the repository with a README, .gitignore, or license
7. Click "Create repository"

## Step 2: Push Your Local Repository to GitHub

After creating the empty repository on GitHub, you'll see instructions for pushing an existing repository. Use the following commands in your terminal:

```bash
# Add your new repository as a remote (replace YOUR_USERNAME with your GitHub username)
git remote add myfork https://github.com/YOUR_USERNAME/playwright-framework.git

# Push your code to the new repository
git push myfork main
# or if your default branch is 'master' instead of 'main':
# git push myfork master
```

## Step 3: Verify Your Clone

1. Go to your GitHub profile
2. Find your new repository
3. Confirm that all code has been successfully pushed

## Step 4: Keep Your Clone Updated (Optional)

If you want to keep your clone updated with the original repository:

```bash
# Add the original repository as upstream (if not already done)
git remote add upstream https://github.com/igautomation/playwright-framework.git

# Fetch changes from the original repository
git fetch upstream

# Merge changes from the original repository into your local branch
git merge upstream/main
# or if the default branch is 'master':
# git merge upstream/master

# Push the updated code to your GitHub repository
git push myfork
```

Now you have a complete clone of the Playwright framework in your GitHub account!