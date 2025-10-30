# GitHub Repository Setup Commands

# 1. Initialize Git repository (run in your project folder)

git init

# 2. Add all files to staging

git add .

# 3. Create initial commit

git commit -m "Initial commit: Complete massage therapy website with booking system"

# 4. Add GitHub remote (replace YOUR_USERNAME with your GitHub username)

git remote add origin https://github.com/YOUR_USERNAME/massage2wellness-website.git

# 5. Push to GitHub

git push -u origin main

# Alternative if you get errors about branch names:

git branch -M main
git push -u origin main

# ========================================

# OPTIONAL: Create .gitignore file

# ========================================

# Create .gitignore to exclude certain files:

echo "node_modules/" > .gitignore
echo ".DS_Store" >> .gitignore
echo "\*.log" >> .gitignore
echo ".env" >> .gitignore

# ========================================

# PROJECT STRUCTURE FOR GITHUB

# ========================================

# Your current structure:

# ├── index.html

# ├── services.html

# ├── about.html

# ├── contact.html

# ├── booking.html

# ├── login.html

# ├── client-portal.html

# ├── admin.html

# ├── components/

# │ ├── nav.html

# │ └── footer.html

# ├── scripts/

# │ ├── main.js

# │ ├── components.js

# │ ├── booking.js

# │ ├── admin.js

# │ ├── contact.js

# │ ├── login.js

# │ └── client-portal.js

# ├── styles/

# │ └── main.css

# ├── README.md

# └── COMPONENT_GUIDE.md

# ========================================

# RECOMMENDED REPOSITORY SETTINGS

# ========================================

# Repository Name: massage2wellness-website

# Description: Professional massage therapy business website with online booking system, client portal, and admin dashboard

# Topics: massage, wellness, booking-system, responsive-design, javascript, html, css

# License: MIT (or your preferred license)
