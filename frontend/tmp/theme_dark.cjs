const fs = require('fs');
const path = require('path');

const directoryPath = 'd:/Venorum/frontend/src/pages';
const files = fs.readdirSync(directoryPath).map(file => path.join(directoryPath, file));

files.forEach(file => {
  if (file.endsWith('.jsx')) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Reset backgrounds
    content = content.replace(/bg-white\b/g, 'bg-luxury-black');
    content = content.replace(/bg-white\/90/g, 'bg-luxury-black/90');
    content = content.replace(/bg-white\/80/g, 'bg-luxury-black/80');
    content = content.replace(/bg-white\/60/g, 'bg-luxury-black/60');
    content = content.replace(/bg-\[\#fcfcfc\]/g, 'bg-luxury-gray');
    content = content.replace(/bg-\[\#f8f5ef\]/g, 'bg-luxury-gray');
    
    // Convert 'bg-luxury-cream' and 'creamdark' (if any remain)
    content = content.replace(/bg-luxury-creamdark/g, 'bg-luxury-gray');
    content = content.replace(/bg-luxury-cream/g, 'bg-luxury-black');

    // 2. Adjust Text colors
    content = content.replace(/text-gray-900/g, 'text-luxury-white');
    content = content.replace(/text-luxury-charcoal/g, 'text-luxury-white');
    content = content.replace(/text-gray-600/g, 'text-gray-400');
    content = content.replace(/text-gray-500/g, 'text-gray-400');
    content = content.replace(/text-black/g, 'text-white');

    // 3. Button colors (Reversing previous white theme button mappings)
    content = content.replace(/bg-gray-900 text-white/g, 'bg-luxury-gold text-luxury-black');
    
    // 4. Border colors
    content = content.replace(/border-gray-200/g, 'border-luxury-gold/20');
    content = content.replace(/border-gray-300/g, 'border-luxury-gold/30');

    // Fix Rates map issues (e.g., 'via-white to-white' -> 'via-luxury-black to-luxury-black')
    content = content.replace(/via-white to-white/g, 'via-luxury-black to-luxury-black');

    // Clean up scattered duplicate glass mappings if present
    content = content.replace(/bg-luxury-black\/60 backdrop-blur-md shadow-sm border border-luxury-gold\/10/g, 'glass');
    content = content.replace(/bg-luxury-black\/60 backdrop-blur-md shadow-sm border border-luxury-gold\/20/g, 'glass');
    
    fs.writeFileSync(file, content);
  }
});

console.log('All pages converted to Deep Dark Theme successfully.');
