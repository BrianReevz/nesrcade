const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// File paths
const jsonFile = path.join(__dirname, 'build', 'feed.json');

// Results storage
const results = {
    total: 0,
    valid: 0,
    invalid: 0,
    errors: [],
    invalidUrls: []
};

// Helper function to make HTTP request
function checkUrl(url) {
    return new Promise((resolve) => {
        try {
            const urlObj = new URL(url);
            const protocol = urlObj.protocol === 'https:' ? https : http;
            
            const req = protocol.get(url, {
                timeout: 10000, // 10 second timeout
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; ROM-Validator/1.0)'
                }
            }, (res) => {
                const statusCode = res.statusCode;
                if (statusCode >= 200 && statusCode < 400) {
                    resolve({ url, status: 'valid', statusCode });
                } else {
                    resolve({ url, status: 'invalid', statusCode, error: `HTTP ${statusCode}` });
                }
            });

            req.on('error', (error) => {
                resolve({ url, status: 'invalid', error: error.message });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({ url, status: 'invalid', error: 'Timeout' });
            });

        } catch (error) {
            resolve({ url, status: 'invalid', error: `Invalid URL: ${error.message}` });
        }
    });
}

// Function to extract all ROM URLs from JSON
function extractRomUrls(jsonData) {
    const urls = [];
    
    function traverse(obj, path = '') {
        if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
                const currentPath = path ? `${path}.${key}` : key;
                
                if (key === 'rom' && typeof value === 'string') {
                    urls.push({ url: value, path: currentPath });
                } else if (Array.isArray(value)) {
                    value.forEach((item, index) => {
                        traverse(item, `${currentPath}[${index}]`);
                    });
                } else if (typeof value === 'object') {
                    traverse(value, currentPath);
                }
            }
        }
    }
    
    traverse(jsonData);
    return urls;
}

// Main validation function
async function validateRomUrls() {
    console.log('🔍 Starting ROM URL validation...');
    
    try {
        // Read and parse JSON file
        console.log('📖 Reading JSON file...');
        const jsonContent = fs.readFileSync(jsonFile, 'utf8');
        const jsonData = JSON.parse(jsonContent);
        
        // Extract all ROM URLs
        console.log('🔍 Extracting ROM URLs...');
        const romUrls = extractRomUrls(jsonData);
        results.total = romUrls.length;
        
        console.log(`📊 Found ${romUrls.length} ROM URLs to validate`);
        console.log('⏳ Starting validation (this may take a while)...\n');
        
        // Validate URLs in batches to avoid overwhelming servers
        const batchSize = 5;
        const batches = [];
        
        for (let i = 0; i < romUrls.length; i += batchSize) {
            batches.push(romUrls.slice(i, i + batchSize));
        }
        
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            console.log(`\n🔄 Processing batch ${i + 1}/${batches.length} (${batch.length} URLs)...`);
            
            const batchPromises = batch.map(async (romUrl) => {
                const result = await checkUrl(romUrl.url);
                
                if (result.status === 'valid') {
                    results.valid++;
                    console.log(`✅ ${romUrl.path}: ${result.statusCode}`);
                } else {
                    results.invalid++;
                    results.invalidUrls.push({
                        path: romUrl.path,
                        url: romUrl.url,
                        error: result.error
                    });
                    console.log(`❌ ${romUrl.path}: ${result.error}`);
                }
                
                return result;
            });
            
            await Promise.all(batchPromises);
            
            // Small delay between batches to be respectful to servers
            if (i < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // Generate report
        console.log('\n' + '='.repeat(60));
        console.log('📋 VALIDATION REPORT');
        console.log('='.repeat(60));
        console.log(`Total URLs: ${results.total}`);
        console.log(`✅ Valid URLs: ${results.valid}`);
        console.log(`❌ Invalid URLs: ${results.invalid}`);
        console.log(`📊 Success Rate: ${((results.valid / results.total) * 100).toFixed(1)}%`);
        
        if (results.invalidUrls.length > 0) {
            console.log('\n❌ INVALID URLS:');
            console.log('-'.repeat(60));
            results.invalidUrls.forEach((item, index) => {
                console.log(`${index + 1}. ${item.path}`);
                console.log(`   URL: ${item.url}`);
                console.log(`   Error: ${item.error}`);
                console.log('');
            });
            
            // Save invalid URLs to a file
            const invalidUrlsFile = path.join(__dirname, 'build', 'invalid-rom-urls.json');
            fs.writeFileSync(invalidUrlsFile, JSON.stringify(results.invalidUrls, null, 2));
            console.log(`📄 Invalid URLs saved to: ${invalidUrlsFile}`);
        }
        
        // Save full report
        const reportFile = path.join(__dirname, 'build', 'rom-validation-report.json');
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: results.total,
                valid: results.valid,
                invalid: results.invalid,
                successRate: (results.valid / results.total) * 100
            },
            invalidUrls: results.invalidUrls
        };
        
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
        console.log(`📄 Full report saved to: ${reportFile}`);
        
    } catch (error) {
        console.error('❌ Error during validation:', error.message);
        process.exit(1);
    }
}

// Run the validation
validateRomUrls(); 