import { exec } from 'child_process';
import process from 'process';


function build() {
    console.log('\n👷 Starting build process ⏳');

    const buildProcess = exec('vite build ./games/pong -c ./vite.config.js');

    buildProcess.stdout.on('data', (data) => process.stdout.write(data));
    buildProcess.stderr.on('data', (data) => process.stderr.write(data));

    buildProcess.on('close', (code) => {
        if (code === 0) console.log('\n🎉 Build process completed successfully');
        else console.error('\n❌ Build process failed');
    });
}

build();
