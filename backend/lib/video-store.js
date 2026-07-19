const fs = require('node:fs/promises');
const path = require('node:path');

class VideoStore {
    constructor(filePath) {
        this.filePath = filePath;
    }

    async read() {
        try {
            return JSON.parse(await fs.readFile(this.filePath, 'utf8'));
        } catch (error) {
            if (error.code === 'ENOENT') return [];
            throw error;
        }
    }

    async write(videos) {
        await fs.mkdir(path.dirname(this.filePath), { recursive: true });
        const temporaryPath = `${this.filePath}.tmp`;
        await fs.writeFile(temporaryPath, `${JSON.stringify(videos, null, 2)}\n`, 'utf8');
        await fs.rename(temporaryPath, this.filePath);
    }
}

module.exports = { VideoStore };
