import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to keep (essential production scripts)
const keepFiles = [
  'seedSubscriptionPlans.js',
  'setupStripeProducts.js',
  'CLEANUP_SCRIPTS.md'
];

// Patterns to delete
const deletePatterns = [
  /^test/i,
  /^check/i,
  /^diagnose/i,
  /^debug/i,
  /^fix/i,
  /^verify/i,
  /^compare/i,
  /^find/i,
  /^list/i,
  /^show/i,
  /^activate/i,
  /^process/i,
  /^refresh/i,
  /^clear/i,
  /^fetch/i,
  /^relink/i,
  /^migrate/i,
  /^populate/i,
  /^extract/i,
  /^audit/i,
  /^validate/i,
  /^regenerate/i,
  /^update/i,
  /^add/i,
  /^mark/i,
  /^link/i,
  /^upload/i,
  /^seed/i
];

const scriptsDir = path.join(__dirname, 'backend', 'scripts');

console.log('🧹 Starting cleanup...\n');

let deletedCount = 0;
let keptCount = 0;

try {
  const files = fs.readdirSync(scriptsDir);
  
  files.forEach(file => {
    // Skip if in keep list
    if (keepFiles.includes(file)) {
      console.log(`✅ Keeping: ${file}`);
      keptCount++;
      return;
    }
    
    // Check if matches delete pattern
    const shouldDelete = deletePatterns.some(pattern => pattern.test(file));
    
    if (shouldDelete && file.endsWith('.js')) {
      const filePath = path.join(scriptsDir, file);
      fs.unlinkSync(filePath);
      console.log(`🗑️  Deleted: ${file}`);
      deletedCount++;
    } else if (file.endsWith('.js')) {
      console.log(`✅ Keeping: ${file}`);
      keptCount++;
    }
  });
  
  console.log(`\n✨ Cleanup complete!`);
  console.log(`📊 Deleted: ${deletedCount} files`);
  console.log(`📊 Kept: ${keptCount} files`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
