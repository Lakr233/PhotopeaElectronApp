#!/usr/bin/env node

const { makeUniversalApp } = require('@electron/universal');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function runDebug() {
    console.log('🚀 Starting universal app build...');
    
    try {
        execSync('pkill -9 photopea || true');
        execSync('CSC_IDENTITY_AUTO_DISCOVERY=false pnpm electron-builder --mac --arm64 --publish=never', { stdio: 'inherit' });
        execSync('open dist/mac-arm64/Photopea.app', { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    runDebug();
}

module.exports = { runDebug };
