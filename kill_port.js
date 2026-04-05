const { execSync } = require('child_process');
try {
    const output = execSync('netstat -ano | findstr :5000').toString();
    const lines = output.trim().split('\n');
    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') {
            try {
                execSync(`taskkill /F /PID ${pid}`);
                console.log(`Killed PID ${pid}`);
            } catch (e) {}
        }
    });
} catch (err) {
    console.log('No processes found on port 5000');
}
