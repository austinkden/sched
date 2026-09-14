# Fixing Firebase Permission Denied Error for `/global/showDeviceIDs`

## Root Cause
The error `@firebase/database: FIREBASE WARNING: set at /global/showDeviceIDs failed: permission_denied` occurs because the Firebase Realtime Database Security Rules do not grant write (or read/write) permissions for the path `global` or `global/showDeviceIDs`.

When the admin panel triggers the "Hold to Show Device IDs" action, it writes to `db.ref('global/showDeviceIDs').set(true)` (and `set(false)` on release). Without rules allowing writes to `/global`, Firebase rejects the request.

---

## How to Fix

### Option 1: Update Database Rules in Firebase Console (Recommended)

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. In the left panel, navigate to **Build** -> **Realtime Database**.
4. Click on the **Rules** tab at the top.
5. Update your database rules JSON to allow read and write access for `global` (or globally, depending on your authentication model):

```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "global": {
      ".read": true,
      ".write": true
    },
    "devices": {
      ".read": true,
      ".write": true
    }
  }
}
```

> **Note:** If your application uses unauthenticated public clients for screens and admin controls, setting `".read": true` and `".write": true` at the root or under `"global"` and `"devices"` allows clients and admins to sync device data and the `showDeviceIDs` toggle.

### Option 2: Fine-Grained Rules (If using Firebase Authentication)

If your Firebase project enforces user authentication for admin actions:

```json
{
  "rules": {
    "global": {
      ".read": true,
      ".write": "auth != null"
    },
    "devices": {
      ".read": true,
      "$deviceId": {
        ".write": true
      }
    }
  }
}
```

6. Click **Publish** in the Firebase Console to apply the updated rules.
