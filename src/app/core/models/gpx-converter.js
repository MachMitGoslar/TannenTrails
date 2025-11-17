#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * GPX to JSON Converter
 * Converts GPX track points to JSON format: [[lat, lng, alt], ...]
 */

function parseGpxToJson(gpxContent) {
  const trackPoints = [];
  
  // More flexible regex to handle multiline and spacing variations
  const trkptRegex = /<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>\s*<ele>([^<]+)<\/ele>/gs;
  
  let match;
  while ((match = trkptRegex.exec(gpxContent)) !== null) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    const alt = parseFloat(match[3]);
    
    // Validate the parsed values
    if (!isNaN(lat) && !isNaN(lng) && !isNaN(alt)) {
      // Add to array in [lat, lng, alt] format
      trackPoints.push([lat, lng, alt]);
    }
  }
  
  // If the above regex fails, try a different approach
  if (trackPoints.length === 0) {
    console.log('🔍 Trying alternative parsing method...');
    
    // Split by trkpt tags and parse each one
    const trkptSections = gpxContent.split('<trkpt');
    
    for (let i = 1; i < trkptSections.length; i++) {
      const section = trkptSections[i];
      
      // Extract lat and lon from the opening tag
      const latMatch = section.match(/lat="([^"]+)"/);
      const lonMatch = section.match(/lon="([^"]+)"/);
      
      // Extract elevation
      const eleMatch = section.match(/<ele>([^<]+)<\/ele>/);
      
      if (latMatch && lonMatch && eleMatch) {
        const lat = parseFloat(latMatch[1]);
        const lng = parseFloat(lonMatch[1]);
        const alt = parseFloat(eleMatch[1]);
        
        if (!isNaN(lat) && !isNaN(lng) && !isNaN(alt)) {
          trackPoints.push([lat, lng, alt]);
        }
      }
    }
  }
  
  return trackPoints;
}

function convertGpxFile() {
  // Look for GPX files in the current directory
  const currentDir = __dirname;
  const possibleFiles = [
    path.join(currentDir, 'gpx'),
    path.join(currentDir, 'track.gpx'),
    path.join(currentDir, 'route.gpx'),
    path.join(currentDir, 'data.gpx'),
    path.join(currentDir, '..', '..', '..', 'assets', 'track.gpx'),
    path.join(currentDir, '..', '..', '..', 'assets', 'route.gpx')
  ];
  
  let gpxFilePath = null;
  
  // Find the first existing GPX file
  for (const filePath of possibleFiles) {
    try {
      if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
        gpxFilePath = filePath;
        break;
      }
    } catch (error) {
      // Continue to next file
    }
  }
  
  if (!gpxFilePath) {
    console.log('❌ No GPX file found. Please place a GPX file in one of these locations:');
    possibleFiles.forEach(file => console.log('   -', file));
    console.log('\n📝 Creating sample GPX file...');
    
    // Create a sample GPX file for demonstration
    const sampleGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TannenTails">
  <trk>
    <name>Sample Forest Trail</name>
    <trkseg>
      <trkpt lat="47.6062" lon="-122.3321">
        <ele>56.0</ele>
      </trkpt>
      <trkpt lat="47.6063" lon="-122.3322">
        <ele>58.0</ele>
      </trkpt>
      <trkpt lat="47.6064" lon="-122.3323">
        <ele>60.0</ele>
      </trkpt>
      <trkpt lat="47.6065" lon="-122.3324">
        <ele>62.0</ele>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;
    
    const samplePath = path.join(currentDir, 'sample-track.gpx');
    fs.writeFileSync(samplePath, sampleGpx);
    console.log('✅ Created sample GPX file:', samplePath);
    gpxFilePath = samplePath;
  }
  
  const outputPath = path.join(currentDir, 'track-points.json');
  
  try {
    // Read the GPX file
    const gpxContent = fs.readFileSync(gpxFilePath, 'utf8');
    console.log('📖 Reading GPX file from:', gpxFilePath);
    console.log('📁 File size:', gpxContent.length, 'characters');
    console.log('🔍 Contains trkpt tags:', gpxContent.includes('<trkpt'));
    console.log('🔍 Contains ele tags:', gpxContent.includes('<ele>'));

    // Show a snippet of the content to understand the format
    const firstTrkptIndex = gpxContent.indexOf('<trkpt');
    if (firstTrkptIndex !== -1) {
      const snippet = gpxContent.substring(firstTrkptIndex, firstTrkptIndex + 300);
      console.log('📋 First track point snippet:\n', snippet);
    }
    
    // Parse GPX to JSON
    const trackPoints = parseGpxToJson(gpxContent);
    console.log(`✅ Parsed ${trackPoints.length} track points`);
    
    // Create the output object
    const output = {
      metadata: {
        name: 'Erlebnisspfad Goslar',
        description: 'Track points for TannenTrails forest experience path',
        totalPoints: trackPoints.length,
        format: '[latitude, longitude, altitude]',
        generatedAt: new Date().toISOString()
      },
      trackPoints: trackPoints
    };
    
    // Write to JSON file
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`💾 Saved to: ${outputPath}`);
    
    // Display sample data
    console.log('\n📊 Sample data:');
    console.log('First 5 points:');
    trackPoints.slice(0, 5).forEach((point, index) => {
      console.log(`  ${index + 1}: [${point[0]}, ${point[1]}, ${point[2]}]`);
    });
    
    // Generate TypeScript interface
    generateTypeScriptInterface(outputPath);
    
  } catch (error) {
    console.error('❌ Error converting GPX:', error.message);
    process.exit(1);
  }
}

function generateTypeScriptInterface(jsonPath) {
  const tsInterfacePath = path.join(__dirname, 'track-points.model.ts');
  
  const tsContent = `/**
 * TannenTrails Track Points Model
 * Generated from GPX data
 */

export interface TrackPoint {
  /** [latitude, longitude, altitude] */
  coordinates: [number, number, number];
}

export interface TrackData {
  metadata: {
    name: string;
    description: string;
    totalPoints: number;
    format: string;
    generatedAt: string;
  };
  trackPoints: Array<[number, number, number]>;
}

// Type for individual coordinate arrays
export type CoordinateArray = [number, number, number];

// Helper functions
export function getLatitude(point: CoordinateArray): number {
  return point[0];
}

export function getLongitude(point: CoordinateArray): number {
  return point[1];
}

export function getAltitude(point: CoordinateArray): number {
  return point[2];
}

export function createTrackPoint(lat: number, lng: number, alt: number): CoordinateArray {
  return [lat, lng, alt];
}
`;
  
  fs.writeFileSync(tsInterfacePath, tsContent, 'utf8');
  console.log(`🔷 Generated TypeScript model: ${tsInterfacePath}`);
}

// Run the conversion
if (require.main === module) {
  console.log('🌲 TannenTrails GPX to JSON Converter\n');
  convertGpxFile();
}

module.exports = { parseGpxToJson, convertGpxFile };