# Firebase Setup Instructions

## 🔥 **Step 1: Firebase Console Setup**

1. Go to https://console.firebase.google.com/
2. Click **"Create a project"**
3. Project name: `massage2wellness`
4. **Continue** → **Continue** → **Create project**

## 🔧 **Step 2: Enable Services**

### Authentication:

1. **Authentication** → **Get started**
2. **Sign-in method** tab
3. Enable **Email/Password**
4. Click **Save**

### Firestore Database:

1. **Firestore Database** → **Create database**
2. **Start in test mode** → **Next**
3. Choose your region (closest to you)
4. **Done**

### Hosting (Optional - for deployment):

1. **Hosting** → **Get started**
2. Follow the setup wizard

## 🔑 **Step 3: Get Your Config**

1. **Project Settings** (gear icon) → **General** tab
2. Scroll to **"Your apps"**
3. Click **Web icon** `</>`
4. App nickname: `massage2wellness-web`
5. **Register app**
6. **Copy the config object** (you'll need this!)

```javascript
// Your config will look like this:
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
};
```

## 📝 **Step 4: Update Your Config**

1. Open `scripts/firebase-config.js`
2. Replace the placeholder config with your actual config
3. Save the file

## 🛡️ **Step 5: Set Up Security Rules**

1. In Firebase Console → **Firestore Database** → **Rules** tab
2. Copy the content from `firestore.rules` file
3. Paste it and **Publish**

## 🚀 **Step 6: Test Your Setup**

1. Start your local server: `npx http-server -p 8080 -c-1`
2. Go to the booking page
3. Try creating a test booking
4. Check Firebase Console → **Firestore Database** → **Data** tab
5. You should see your booking appear!

## 📊 **Step 7: Create Test Data (Optional)**

You can add some sample services to Firestore:

1. **Firestore Database** → **Data** tab
2. **Start collection** → Collection ID: `services`
3. Add documents with these fields:
   - `name`: "Swedish Massage"
   - `description`: "Relaxing full body massage"
   - `duration_minutes`: 60
   - `base_price`: 80
   - `is_active`: true

## 🔐 **Step 8: Create Admin User**

1. **Authentication** → **Users** tab
2. **Add user**
3. Email: `admin@massage2wellness.com`
4. Password: `admin123` (or your preference)
5. In **Firestore** → **Data** → Create collection `users`
6. Document ID: (use the UID from Authentication)
7. Add fields:
   - `email`: "admin@massage2wellness.com"
   - `role`: "admin"
   - `first_name`: "Admin"
   - `last_name`: "User"

## ✅ **Verification Checklist**

- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Firestore database created
- [ ] Config updated in `firebase-config.js`
- [ ] Security rules deployed
- [ ] Test booking works
- [ ] Admin user created
- [ ] Can see data in Firestore console

## 🚨 **Troubleshooting**

**Console Errors?**

- Check browser developer console for detailed error messages
- Verify your config is correct
- Make sure all Firebase services are enabled

**Data Not Saving?**

- Check Firestore rules
- Verify you're authenticated if required
- Look at the Network tab in browser dev tools

**Authentication Issues?**

- Double-check your email/password settings
- Verify the user exists in Authentication tab

## 📞 **Need Help?**

- Firebase Documentation: https://firebase.google.com/docs
- Check browser console for error details
- Verify each step was completed correctly

Once this is set up, your app will:
✅ Save bookings to Firestore instead of localStorage
✅ Handle contact form submissions
✅ Support real-time updates for admin dashboard
✅ Work across multiple devices and browsers
✅ Be ready for production deployment!
