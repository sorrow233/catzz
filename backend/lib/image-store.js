const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

class ImageStore {
    constructor({ artworkDir, publicArtworkPath, maxWidth, quality }) {
        this.artworkDir = artworkDir;
        this.publicArtworkPath = publicArtworkPath;
        this.maxWidth = maxWidth;
        this.quality = quality;
    }

    async save(artworkId, pageIndex, imageBuffer) {
        await fs.mkdir(this.artworkDir, { recursive: true });
        const pageSuffix = pageIndex === 0 ? '' : `_p${pageIndex}`;
        const fileName = `${artworkId}${pageSuffix}.webp`;
        const outputPath = path.join(this.artworkDir, fileName);
        const temporaryPath = `${outputPath}.tmp`;

        await sharp(imageBuffer)
            .rotate()
            .resize({ width: this.maxWidth, withoutEnlargement: true })
            .webp({ quality: this.quality, effort: 5 })
            .toFile(temporaryPath);
        await fs.rename(temporaryPath, outputPath);

        return `${this.publicArtworkPath}/${fileName}`;
    }
}

module.exports = { ImageStore };
