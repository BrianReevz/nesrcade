const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, push, child } = require('firebase/database');

// Firebase configuration
const firebaseConfig = {
  databaseURL: "https://nes-r-cade-feed-default-rtdb.firebaseio.com",
  // Add your Firebase config here if you have API keys
  // apiKey: "your-api-key",
  // authDomain: "your-auth-domain",
  // projectId: "your-project-id",
  // storageBucket: "your-storage-bucket",
  // messagingSenderId: "your-messaging-sender-id",
  // appId: "your-app-id"
};

// File paths
const jsonFile = path.join(__dirname, 'build', 'feed.json');

// Initialize Firebase
let app, database;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  process.exit(1);
}

// Function to upload data to Firebase
async function uploadToFirebase(data, path = '/') {
  try {
    const dbRef = ref(database, path);
    await set(dbRef, data);
    console.log(`✅ Successfully uploaded data to Firebase at path: ${path}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to upload to Firebase at path: ${path}:`, error.message);
    return false;
  }
}

// Function to upload data in chunks (for large datasets)
async function uploadInChunks(data, basePath = '/', chunkSize = 100) {
  console.log(`📦 Uploading data in chunks of ${chunkSize} items...`);
  
  if (data.categories && Array.isArray(data.categories)) {
    let successCount = 0;
    let failureCount = 0;
    
    // Upload main feed data first
    const mainData = {
      title: data.title,
      description: data.description,
      background: data.background,
      thumbnail: data.thumbnail,
      longTitle: data.longTitle
    };
    
    const mainSuccess = await uploadToFirebase(mainData, basePath);
    if (mainSuccess) successCount++; else failureCount++;
    
    // Upload categories in chunks
    for (let i = 0; i < data.categories.length; i++) {
      const category = data.categories[i];
      const categoryPath = `${basePath}/categories/${i}`;
      
      try {
        // Upload category metadata
        const categoryData = {
          title: category.title,
          longTitle: category.longTitle,
          description: category.description
        };
        
        const categorySuccess = await uploadToFirebase(categoryData, categoryPath);
        if (categorySuccess) successCount++; else failureCount++;
        
        // Upload items in chunks
        if (category.items && Array.isArray(category.items)) {
          for (let j = 0; j < category.items.length; j += chunkSize) {
            const chunk = category.items.slice(j, j + chunkSize);
            const chunkPath = `${categoryPath}/items`;
            
            try {
              const chunkData = {};
              chunk.forEach((item, index) => {
                chunkData[j + index] = item;
              });
              
              const chunkSuccess = await uploadToFirebase(chunkData, chunkPath);
              if (chunkSuccess) successCount++; else failureCount++;
              
              console.log(`📤 Uploaded chunk ${Math.floor(j / chunkSize) + 1} for category "${category.title}"`);
              
              // Small delay to avoid overwhelming Firebase
              await new Promise(resolve => setTimeout(resolve, 100));
              
            } catch (error) {
              console.error(`❌ Failed to upload chunk for category "${category.title}":`, error.message);
              failureCount++;
            }
          }
        }
        
      } catch (error) {
        console.error(`❌ Failed to upload category "${category.title}":`, error.message);
        failureCount++;
      }
    }
    
    console.log(`\n📊 Upload Summary:`);
    console.log(`✅ Successful uploads: ${successCount}`);
    console.log(`❌ Failed uploads: ${failureCount}`);
    
    return { successCount, failureCount };
  } else {
    // If no categories, upload as single object
    return await uploadToFirebase(data, basePath);
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Firebase upload...');
  console.log('📖 Reading JSON file...');
  
  try {
    // Read and parse JSON file
    const jsonContent = fs.readFileSync(jsonFile, 'utf8');
    const jsonData = JSON.parse(jsonContent);
    
    console.log(`📊 JSON file loaded successfully`);
    console.log(`📁 File size: ${(jsonContent.length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📋 Categories: ${jsonData.categories ? jsonData.categories.length : 0}`);
    
    if (jsonData.categories) {
      const totalItems = jsonData.categories.reduce((sum, cat) => sum + (cat.items ? cat.items.length : 0), 0);
      console.log(`🎮 Total items: ${totalItems}`);
    }
    
    console.log('\n⏳ Starting upload to Firebase...');
    
    // Upload to Firebase
    const result = await uploadInChunks(jsonData, '/feed', 50);
    
    if (result && result.successCount > 0) {
      console.log('\n🎉 Upload completed successfully!');
      console.log(`🌐 Your feed is now available at: https://nes-r-cade-feed-default-rtdb.firebaseio.com/feed`);
    } else {
      console.log('\n⚠️ Upload completed with some issues. Check the logs above.');
    }
    
  } catch (error) {
    console.error('❌ Error during upload:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === '--help' || command === '-h') {
  console.log(`
🚀 Firebase Feed Uploader

Usage:
  node upload-to-firebase.js [options]

Options:
  --help, -h     Show this help message
  --chunk-size   Set chunk size for uploads (default: 50)
  --path         Set Firebase path (default: /feed)

Examples:
  node upload-to-firebase.js
  node upload-to-firebase.js --chunk-size 100
  node upload-to-firebase.js --path /my-feed

Note: Make sure you have the Firebase SDK installed:
  npm install firebase
  `);
  process.exit(0);
}

// Run the main function
main(); 