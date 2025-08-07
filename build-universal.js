#!/usr/bin/env node

const { makeUniversalApp } = require('@electron/universal');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function buildUniversal() {
    console.log('🚀 Starting universal app build...');
    
    try {
        // Build x64 and arm64 versions first
        console.log('🔨 Building x64 version...');
        execSync('CSC_IDENTITY_AUTO_DISCOVERY=false pnpm electron-builder --mac --x64 --publish=never', { stdio: 'inherit' });
        
        console.log('🔨 Building arm64 version...');
        execSync('CSC_IDENTITY_AUTO_DISCOVERY=false pnpm electron-builder --mac --arm64 --publish=never', { stdio: 'inherit' });
        
        // Find the built application paths
        const distPath = path.join(__dirname, 'dist');
        const macPath = path.join(distPath, 'mac');
        const macArm64Path = path.join(distPath, 'mac-arm64');
        
        // Find .app files
        let x64AppPath, arm64AppPath;
        
        if (fs.existsSync(macPath)) {
            const files = fs.readdirSync(macPath);
            const appFile = files.find(file => file.endsWith('.app'));
            if (appFile) {
                x64AppPath = path.join(macPath, appFile);
                console.log(`✅ Found x64 app: ${appFile}`);
            }
        }
        
        if (fs.existsSync(macArm64Path)) {
            const files = fs.readdirSync(macArm64Path);
            const appFile = files.find(file => file.endsWith('.app'));
            if (appFile) {
                arm64AppPath = path.join(macArm64Path, appFile);
                console.log(`✅ Found arm64 app: ${appFile}`);
            }
        }
        
        if (!x64AppPath || !arm64AppPath) {
            throw new Error('❌ Could not find the built application files');
        }
        
        // Create universal app
        const universalPath = path.join(distPath, 'mac-universal');
        if (!fs.existsSync(universalPath)) {
            fs.mkdirSync(universalPath, { recursive: true });
        }
        
        const outAppPath = path.join(universalPath, path.basename(x64AppPath));
        
        console.log('🔄 Creating universal app...');
        await makeUniversalApp({
            x64AppPath,
            arm64AppPath,
            outAppPath,
            mergeASARs: true, // Merge ASAR files to reduce app size
            force: true,
        });
        
        console.log(`🎉 Universal app created: ${outAppPath}`);
        
        // Display file size information
        const getAppSize = (appPath) => {
            try {
                const stats = execSync(`du -sh "${appPath}"`, { encoding: 'utf8' });
                return stats.trim().split('\t')[0];
            } catch (e) {
                return 'Unknown';
            }
        };
        
        console.log('\n📊 App Size Comparison:');
        console.log(`   x64 App: ${getAppSize(x64AppPath)}`);
        console.log(`   arm64 App: ${getAppSize(arm64AppPath)}`);
        console.log(`   Universal App: ${getAppSize(outAppPath)}`);
        
        console.log('\n✅ Build complete!');
        
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    buildUniversal();
}

module.exports = { buildUniversal };
