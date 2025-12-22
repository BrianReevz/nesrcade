const fs = require('fs');
const path = require('path');

// File paths
const inputFile = path.join(__dirname, 'build', 'feed.json');
const backupFile = path.join(__dirname, 'build', 'feed.json.backup');
const outputFile = path.join(__dirname, 'build', 'feed.json');

console.log('Starting Firebase key replacement...');

try {
    // Read the original file
    console.log('Reading JSON file...');
    const jsonContent = fs.readFileSync(inputFile, 'utf8');
    
    // Create backup
    console.log('Creating backup...');
    fs.writeFileSync(backupFile, jsonContent);
    console.log(`Backup created: ${backupFile}`);
    
    // Replace problematic keys
    console.log('Replacing Firebase-incompatible keys...');
    let modifiedContent = jsonContent;
    
    // Replace "#" with "z_hash"
    const hashMatches = (modifiedContent.match(/"#":/g) || []).length;
    modifiedContent = modifiedContent.replace(/"#":/g, '"z_hash":');
    console.log(`Replaced ${hashMatches} instances of "#" with "z_hash"`);
    
    // Replace "*" with "z_star"
    const starMatches = (modifiedContent.match(/"\*":/g) || []).length;
    modifiedContent = modifiedContent.replace(/"\*":/g, '"z_star":');
    console.log(`Replaced ${starMatches} instances of "*" with "z_star"`);
    
    // Validate the modified JSON
    console.log('Validating modified JSON...');
    JSON.parse(modifiedContent);
    console.log('JSON validation passed!');
    
    // Write the modified content back to the file
    console.log('Writing modified JSON to file...');
    fs.writeFileSync(outputFile, modifiedContent);
    
    console.log('✅ Successfully replaced Firebase-incompatible keys!');
    console.log(`Total replacements: ${hashMatches + starMatches}`);
    console.log(`- "#" → "z_hash": ${hashMatches} instances`);
    console.log(`- "*" → "z_star": ${starMatches} instances`);
    
} catch (error) {
    console.error('❌ Error:', error.message);
    
    // If validation failed, restore from backup
    if (fs.existsSync(backupFile)) {
        console.log('Restoring from backup...');
        fs.copyFileSync(backupFile, outputFile);
        console.log('Backup restored successfully.');
    }
    
    process.exit(1);
} 