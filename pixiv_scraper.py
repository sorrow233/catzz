import os
import json
import time
import requests

# Configuration
USER_ID = "1056186"
LIMIT = 50
OUTPUT_DIR = "pixiv_data"
IMAGES_DIR = os.path.join(OUTPUT_DIR, "images")
METADATA_FILE = os.path.join(OUTPUT_DIR, "metadata.json")

# Headers - Mimic a real browser to avoid some basic blocking
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.pixiv.net/",
    "Accept-Language": "en-US,en;q=0.9",
}

# Optional: Add PHPSESSID if public access is restricted
# cookie = input("Enter PHPSESSID (leave empty if strictly public): ").strip()
# if cookie:
#     HEADERS["Cookie"] = f"PHPSESSID={cookie}"

def ensure_dirs():
    if not os.path.exists(IMAGES_DIR):
        os.makedirs(IMAGES_DIR)
        print(f"Created directory: {IMAGES_DIR}")

def get_artwork_ids(user_id):
    url = f"https://www.pixiv.net/ajax/user/{user_id}/profile/all"
    print(f"Fetching artwork list from {url}...")
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        data = response.json()
        
        if data['error']:
            print(f"Error fetching profile: {data['message']}")
            return []

        # 'illusts' key contains a dict of ID -> null (or similar)
        # We need to sort by ID descending (newest first)
        illusts = data['body']['illusts']
        if not illusts:
             print("No illustrations found or profile is private.")
             return []
             
        # illusts is a dict where keys are IDs. Convert to list of ints, sort desc.
        ids = sorted([int(x) for x in illusts.keys()], reverse=True)
        return ids
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return []

def get_artwork_details(illust_id):
    url = f"https://www.pixiv.net/ajax/illust/{illust_id}"
    # print(f"Fetching details for ID {illust_id}...")
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        data = response.json()
        
        if data['error']:
            print(f"Error fetching details for {illust_id}: {data['message']}")
            return None
            
        return data['body']
    except Exception as e:
        print(f"Failed to fetch details for {illust_id}: {e}")
        return None

def download_image(url, filename):
    path = os.path.join(IMAGES_DIR, filename)
    if os.path.exists(path):
        print(f"  Skipping {filename} (already exists)")
        return True
        
    print(f"  Downloading {filename}...")
    try:
        # Important: Pixiv requires Referer header for images
        img_headers = HEADERS.copy()
        img_headers["Referer"] = "https://www.pixiv.net/"
        
        response = requests.get(url, headers=img_headers, stream=True)
        response.raise_for_status()
        
        with open(path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"  Failed to download image: {e}")
        return False

def main():
    ensure_dirs()
    
    all_ids = get_artwork_ids(USER_ID)
    print(f"Found {len(all_ids)} total artworks.")
    
    target_ids = all_ids[:LIMIT]
    print(f"Processing most recent {len(target_ids)} artworks...")
    
    metadata_list = []
    
    try:
        for i, illust_id in enumerate(target_ids):
            print(f"[{i+1}/{len(target_ids)}] Processing ID: {illust_id}")
            
            details = get_artwork_details(illust_id)
            if not details:
                continue
                
            # Extract relevant info
            title = details.get('title', 'Untitled')
            desc = details.get('description', '') # often contains HTML
            tags = [t['tag'] for t in details.get('tags', {}).get('tags', [])]
            create_date = details.get('createDate', '')
            
            # Images
            image_url = details['urls'].get('regular')
            if not image_url:
                image_url = details['urls'].get('original')
                
            if not image_url:
                print("  No suitable image URL found.")
                continue
                
            # Filename
            ext = image_url.split('.')[-1]
            filename = f"{illust_id}_{title.replace('/', '_')}.{ext}"
            
            # Download
            if download_image(image_url, filename):
                local_path = os.path.join("images", filename)
                
                metadata_list.append({
                    "id": illust_id,
                    "title": title,
                    "description": desc,
                    "tags": tags,
                    "created_at": create_date,
                    "original_url": image_url,
                    "local_path": local_path,
                    "pixiv_url": f"https://www.pixiv.net/artworks/{illust_id}"
                })
                
            # Be nice to the server
            time.sleep(1)

    except KeyboardInterrupt:
        print("\nScript interrupted! Saving progress...")
    except Exception as e:
        print(f"\nAn error occurred: {e}")
        print("Saving progress...")
    finally:
        # Save metadata
        with open(METADATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(metadata_list, f, ensure_ascii=False, indent=2)
            
        print(f"\nDone! Scraped {len(metadata_list)} items.")
        print(f"Metadata saved to {METADATA_FILE}")
        print(f"Images saved to {IMAGES_DIR}")

if __name__ == "__main__":
    main()
