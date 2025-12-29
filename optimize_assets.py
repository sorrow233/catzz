import json
import os
import shutil
from PIL import Image

# Configuration
SOURCE_IMAGES_DIR = 'pixiv_data/images'
METADATA_PATH = 'pixiv_data/metadata.json'
EXISTING_GALLERY_DATA = 'src/data/gallery_data.json'
OUTPUT_DATA_DIR = 'src/data' # Keeping it in src/data for now as the app seems to use relative paths like src/data/...
OUTPUT_THUMB_DIR = 'pixiv_data/thumbnails' # Generating in pixiv_data/thumbnails to serve them? 
# Wait, if I server from pixiv_data/thumbnails, I need to make sure that path is accessible.
# The user's code uses `src/data/gallery_data.json`.
# `pixiv_data` is at root. 
# `TimelineSection.js` uses `pixiv_data/metadata.json`.
# So `pixiv_data` is accessible via web server.

# We will generate thumbnails in `pixiv_data/thumbnails`.
os.makedirs(OUTPUT_THUMB_DIR, exist_ok=True)
os.makedirs(OUTPUT_DATA_DIR, exist_ok=True)

def generate_thumbnail(image_path, thumb_path):
    if os.path.exists(thumb_path):
        return True
    
    try:
        with Image.open(image_path) as img:
            # Calculate new height to maintain aspect ratio, width 400
            target_width = 400
            width_percent = (target_width / float(img.size[0]))
            target_height = int((float(img.size[1]) * float(width_percent)))
            
            # Resize
            img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
            
            # Save as WebP
            img.save(thumb_path, 'WEBP', quality=80)
            print(f"Generated thumbnail: {thumb_path}")
            return True
    except Exception as e:
        print(f"Error generating thumbnail for {image_path}: {e}")
        return False

# 1. Load Data
# We prefer gallery_data.json because it has the remote_urls (which are important for high-res view)
# But we also want to ensure we have all items.
# Let's verify if gallery_data has everything metadata has. 
# For now, let's just use gallery_data.json as the source since migration_script.py generated it.

try:
    with open(EXISTING_GALLERY_DATA, 'r') as f:
        gallery_data = json.load(f)
except FileNotFoundError:
    print("gallery_data.json not found, falling back to metadata.json")
    with open(METADATA_PATH, 'r') as f:
        gallery_data = json.load(f)

new_gallery_data = []

for item in gallery_data:
    # Identify local image path
    # item['local_path'] looks like "images/123_title.jpg"
    # Our script runs from root, so it is "pixiv_data/images/..."
    
    relative_path = item.get('local_path', '')
    if not relative_path:
        print(f"Skipping item {item['id']} - no local_path")
        new_gallery_data.append(item)
        continue
        
    # The current local_path in json includes "images/" prefix?
    # Let's check: "local_path": "images/138045922_..."
    # So full path is pixiv_data/images/...
    
    full_local_path = os.path.join('pixiv_data', relative_path)
    
    if not os.path.exists(full_local_path):
        print(f"Warning: Image file not found: {full_local_path}")
        # Keep item but maybe without thumbnail
        new_gallery_data.append(item)
        continue
        
    # Generate Thumbnail
    # Filename without ext
    filename = os.path.basename(full_local_path)
    name_no_ext = os.path.splitext(filename)[0]
    thumb_filename = f"{name_no_ext}.webp"
    thumb_path = os.path.join(OUTPUT_THUMB_DIR, thumb_filename)
    
    if generate_thumbnail(full_local_path, thumb_path):
        # Update Item
        item['thumbnail_url'] = f"pixiv_data/thumbnails/{thumb_filename}"
        
        # Also ensure we prioritize remote_url for 'url' if available, but for grid we will use thumbnail_url
        if 'remote_url' in item:
            item['original_url_display'] = item['remote_url'] # This is the high-res one
        else:
            item['original_url_display'] = item.get('url', f"pixiv_data/{relative_path}")
            
    new_gallery_data.append(item)

# Save New Data
output_json_path = 'src/data/gallery_data_optimized.json'
with open(output_json_path, 'w', encoding='utf-8') as f:
    json.dump(new_gallery_data, f, ensure_ascii=False, indent=2)

print(f" Optimization complete. Data saved to {output_json_path}")
print(f" Thumbnails saved to {OUTPUT_THUMB_DIR}")
