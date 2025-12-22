# Feed Automation Tools

This directory contains automated tools for managing and uploading feed data to Firebase Realtime Database.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Upload to Firebase
```bash
npm run upload
```

## 📁 Files Overview

- **`upload-to-firebase.js`** - Main script to upload feed.json to Firebase
- **`validate-rom-urls.js`** - Script to validate all ROM URLs in the feed
- **`fix-firebase-keys.js`** - Script to fix Firebase-incompatible keys
- **`package.json`** - Node.js dependencies and scripts

## 🔧 Available Scripts

### Upload to Firebase
```bash
# Basic upload
npm run upload

# With custom options
node upload-to-firebase.js --chunk-size 100 --path /my-feed
```

### Validate ROM URLs
```bash
npm run validate
```

### Fix Firebase Keys
```bash
npm run fix-keys
```

### Show Help
```bash
npm run help
```

## ⚙️ Configuration

### Firebase Setup

1. **For Public Database (No Authentication Required):**
   The script is configured to work with your public Firebase Realtime Database at:
   ```
   https://nes-r-cade-feed-default-rtdb.firebaseio.com/
   ```

2. **For Private Database (Authentication Required):**
   If you need to use authentication, update the `firebaseConfig` in `upload-to-firebase.js`:
   ```javascript
   const firebaseConfig = {
     databaseURL: "https://nes-r-cade-feed-default-rtdb.firebaseio.com",
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     storageBucket: "your-storage-bucket",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-app-id"
   };
   ```

### Database Rules

Make sure your Firebase Realtime Database rules allow write access. For public access, your rules should look like:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

## 📊 Upload Process

The upload script:

1. **Reads** the `build/feed.json` file
2. **Validates** the JSON structure
3. **Uploads** data in chunks to avoid timeouts
4. **Organizes** data under `/feed` path in Firebase
5. **Provides** detailed progress and error reporting

### Data Structure in Firebase

```
/feed
├── title
├── description
├── background
├── thumbnail
├── longTitle
└── categories/
    ├── 0/
    │   ├── title
    │   ├── longTitle
    │   ├── description
    │   └── items/
    │       ├── 0
    │       ├── 1
    │       └── ...
    ├── 1/
    └── ...
```

## 🔍 URL Validation

The validation script checks all ROM URLs and generates reports:

- **`invalid-rom-urls.json`** - List of broken URLs
- **`rom-validation-report.json`** - Complete validation summary

## 🛠️ Troubleshooting

### Common Issues

1. **"Firebase initialization failed"**
   - Check your Firebase configuration
   - Ensure the database URL is correct

2. **"Permission denied"**
   - Check Firebase database rules
   - Ensure write permissions are enabled

3. **"Upload timeout"**
   - Reduce chunk size: `--chunk-size 25`
   - Check internet connection

4. **"Invalid JSON"**
   - Run `npm run fix-keys` first
   - Validate JSON structure manually

### Error Logs

All scripts provide detailed error logging. Check the console output for specific error messages and suggested solutions.

## 📈 Performance Tips

- **Chunk Size**: Use smaller chunks (25-50) for large datasets
- **Network**: Ensure stable internet connection
- **Timing**: Avoid peak hours for large uploads
- **Backup**: Always keep a backup of your feed.json file

## 🔗 Firebase Database URL

Your feed will be available at:
```
https://nes-r-cade-feed-default-rtdb.firebaseio.com/feed
```

## 📝 License

MIT License - feel free to modify and distribute as needed. 