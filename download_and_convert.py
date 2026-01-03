import json
import os
import requests
from PIL import Image
from io import BytesIO
import concurrent.futures

# Configuration
INPUT_JSON = 'src/data/gallery_data.json'
OUTPUT_DIR = 'optimized_images'
QUALITY = 90
MAX_WIDTH = 0 # Disable resizing

def process_image(item):
    try:
        url = item.get('remote_url') or item.get('url')
        if not url:
            return f"Skipped (No URL): {item.get('id')}"

        # Create filename from ID and Title to be identifiable, or just ID
        # sanitize title
        safe_title = "".join([c for c in item.get('title', '') if c.isalpha() or c.isdigit() or c==' ']).strip()
        filename = f"{item['id']}_{safe_title}.webp"
        filepath = os.path.join(OUTPUT_DIR, filename)

        # Always overwrite or check? User asked to redo, so we should overwrite if exists or just let it overwrite.
        # But previous script had "if os.path.exists return". 
        # We MUST remove that check or force overwrite.
        # Let's remove the check to force re-processing.
        
        print(f"Downloading: {url}")
        response = requests.get(url, timeout=30)
        if response.status_code != 200:
            return f"Failed to download {url}: Status {response.status_code}"

        img = Image.open(BytesIO(response.content))
        
        # No resizing, keep original dimensions for maximum quality
        
        # Save as WebP with high quality
        # lossless=False with high quality is usually better for photos/art than pure lossless (which can be huge)
        # But maybe user wants lossless? "In proper quality". 95 is usually the sweet spot.
        # If user complains again, we go lossless=True.
        img.save(filepath, 'WEBP', quality=QUALITY)
        return f"Saved: {filename}"
        
    except Exception as e:
        return f"Error processing {item.get('id')}: {str(e)}"

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    with open(INPUT_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Found {len(data)} images to process...")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(process_image, data))
        
    for res in results:
        print(res)

    print(f"\nDone! Images saved to ./{OUTPUT_DIR}")

if __name__ == "__main__":
    main()
