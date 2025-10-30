# Component System Setup Guide

## ✅ What's Been Done:

- Created `components/nav.html` - Reusable navigation component
- Created `components/footer.html` - Reusable footer component
- Created `scripts/components.js` - JavaScript to load components
- Updated `index.html` and `services.html` to use the component system

## 📝 How to Convert Remaining Pages:

### For each remaining page (about.html, contact.html, booking.html, admin.html, client-portal.html, login.html):

### 1. Replace Navigation Section:

**Find this:**

```html
<!-- Navigation -->
<nav class="navbar">
  <div class="nav-container">
    <!-- ... entire nav content ... -->
  </div>
</nav>
```

**Replace with:**

```html
<!-- Navigation Placeholder -->
<div id="nav-placeholder"></div>
```

### 2. Replace Footer Section:

**Find this:**

```html
<!-- Footer -->
<footer class="footer">
  <div class="footer-content">
    <!-- ... entire footer content ... -->
  </div>
</footer>
```

**Replace with:**

```html
<!-- Footer Placeholder -->
<div id="footer-placeholder"></div>
```

### 3. Add Component Script:

**Find this (at the end of body):**

```html
<script src="scripts/main.js"></script>
</body>
```

**Replace with:**

```html
<script src="scripts/components.js"></script>
<script src="scripts/main.js"></script>
</body>
```

## 🚀 Benefits:

- **Single Source of Truth**: Change nav/footer once, updates everywhere
- **Consistent Branding**: No more mismatched navigation across pages
- **Easy Maintenance**: Add new nav items or footer content in one place
- **Automatic Active States**: JavaScript handles highlighting current page
- **Fallback Support**: If components fail to load, fallback HTML is shown

## 🔧 How the System Works:

1. `components.js` loads when page starts
2. Fetches `nav.html` and `footer.html` components
3. Injects them into placeholder divs
4. Sets up navigation functionality (mobile menu, active states)
5. Automatically highlights the current page in navigation

## 📱 Smart Features:

- **Responsive**: Mobile hamburger menu still works
- **Active States**: Current page is automatically highlighted
- **Error Handling**: Fallback HTML if components don't load
- **Performance**: Components load in parallel for speed

## ✏️ Making Changes:

- **Update Navigation**: Edit `components/nav.html`
- **Update Footer**: Edit `components/footer.html`
- **Add New Pages**: Just follow the conversion steps above

## 🎯 Quick Conversion Commands:

You can manually edit each file, or use the patterns above. The key is:

1. Replace nav section with `<div id="nav-placeholder"></div>`
2. Replace footer section with `<div id="footer-placeholder"></div>`
3. Add `<script src="scripts/components.js"></script>` before main.js

That's it! Your code will be much more maintainable. 🎉
