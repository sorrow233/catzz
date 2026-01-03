import json
import urllib.parse
import re

# The user provided URLs
NEW_URLS = [
    "https://blog.catzz.work/file/1767459018889_68559847_COMITIA124 お品書き.webp",
    "https://blog.catzz.work/file/1767459021851_68686407_星星坠落的傍晚.webp",
    "https://blog.catzz.work/file/1767459017524_69338337_屋上の遊園地.webp",
    "https://blog.catzz.work/file/1767459019808_69553890_Location Unknown.webp",
    "https://blog.catzz.work/file/1767459016330_70526434_さくらちゃんアニメ塗り.webp",
    "https://blog.catzz.work/file/1767459022763_71033422_覚醒ネフティス.webp",
    "https://blog.catzz.work/file/1767459020013_71359340_魔女の部屋.webp",
    "https://blog.catzz.work/file/1767459021061_71794922_普段に使われるライティング方を描いてみた.webp",
    "https://blog.catzz.work/file/1767459019006_72055179_雨の日.webp",
    "https://blog.catzz.work/file/1767459020922_72200609_雨の日2.webp",
    "https://blog.catzz.work/file/1767459018238_72668704_PAIN.webp",
    "https://blog.catzz.work/file/1767459020744_72955418_新しい日の.webp",
    "https://blog.catzz.work/file/1767459020524_73205835_私を連れて帰れるニャー.webp",
    "https://blog.catzz.work/file/1767459021867_73838366_水鏡.webp",
    "https://blog.catzz.work/file/1767459018007_74451722_通りすがりJK.webp",
    "https://blog.catzz.work/file/1767459021179_93821718_胡桃と香菱のハロウィン.webp",
    "https://blog.catzz.work/file/1767459021586_100669875_ネコと散歩.webp",
    "https://blog.catzz.work/file/1767459025370_101805095_ラムレーズンパンケーキ.webp",
    "https://blog.catzz.work/file/1767459025932_102387252_ドミノ少女.webp",
    "https://blog.catzz.work/file/1767459019605_102852101_寡欲しゅーず.webp",
    "https://blog.catzz.work/file/1767459019407_103829884_寄りかかる.webp",
    "https://blog.catzz.work/file/1767459019410_104979521_202301練習まとめ.webp",
    "https://blog.catzz.work/file/1767459028795_106031896_lil lull.webp",
    "https://blog.catzz.work/file/1767459026428_109645771_ライブペインティング始めた.webp",
    "https://blog.catzz.work/file/1767459022627_111294212_NewJeans.webp",
    "https://blog.catzz.work/file/1767459021972_111668251_情緒と理芽図書館に探る.webp",
    "https://blog.catzz.work/file/1767459021331_112052584_Cytokine NITRO.webp",
    "https://blog.catzz.work/file/1767459029969_112087392_自転車.webp",
    "https://blog.catzz.work/file/1767459022507_112167497_I feel serene.webp",
    "https://blog.catzz.work/file/1767459026287_112901502_空を湿らす雨.webp",
    "https://blog.catzz.work/file/1767459027614_113114668_繫華街.webp",
    "https://blog.catzz.work/file/1767459022742_113390096_City Light.webp",
    "https://blog.catzz.work/file/1767459031402_113575664_寒くなってきたらラーメン食べたくなった.webp",
    "https://blog.catzz.work/file/1767459025186_113793915_目的地知らず.webp",
    "https://blog.catzz.work/file/1767459029213_114011113_大人ごっこ.webp",
    "https://blog.catzz.work/file/1767459027927_116302432_君がいない季節.webp",
    "https://blog.catzz.work/file/1767459026788_116686084_Shelter of Blooming Life.webp",
    "https://blog.catzz.work/file/1767459028783_116952992_幸祜伍番街で春猿火を助ける.webp",
    "https://blog.catzz.work/file/1767459025098_119558538_The Waiting.webp",
    "https://blog.catzz.work/file/1767459024831_127416960_瞬き.webp",
    "https://blog.catzz.work/file/1767459025257_127425513_夜雨.webp",
    "https://blog.catzz.work/file/1767459026047_129351877_100日チャレンジ1日目10日目.webp",
    "https://blog.catzz.work/file/1767459033275_129779664_100日チャレンジ11日目20日目.webp",
    "https://blog.catzz.work/file/1767459031281_130085857_100日チャレンジ21日目30日目.webp",
    "https://blog.catzz.work/file/1767459034880_130449095_100日チャレンジ31日目40日目.webp",
    "https://blog.catzz.work/file/1767459033136_131188010_100日チャレンジ41日目60日目.webp",
    "https://blog.catzz.work/file/1767459036160_131571863_100日チャレンジ61日目70日目.webp",
    "https://blog.catzz.work/file/1767459027212_131979178_100日チャレンジ71日目80日目.webp",
    "https://blog.catzz.work/file/1767459036387_137779301_Solitude.webp",
    "https://blog.catzz.work/file/1767459029463_138045922_感觉有点冷可以开始放寒假了吗.webp"
]

JSON_FILE = 'src/data/gallery_data.json'

def parse_id_from_url(url):
    # Extracts ID from URL, assuming format .../_<ID>_<TITLE>.webp or similar
    # e.g. .../1767459018889_68559847_COMITIA124...
    # The pattern in the new URLs seems to be: timestamp_ID_Title.webp
    # e.g. 1767459018889_68559847_...
    
    # Try to find the pattern: digits_digits_...
    filename = url.split('/')[-1]
    
    # Pattern: <Timestamp?>_<ID>_<Title>
    matches = re.match(r'^\d+_(\d+)_', filename)
    if matches:
        return int(matches.group(1))
        
    return None

def main():
    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    id_map = {item['id']: item for item in data}
    updated_count = 0
    matched_ids = set()
    
    encoded_urls_map = {}
    
    # Pre-process URLs to handle potential encoding logic desired by user or matching
    # User's input has spaces and non-ascii. We should generally encode them for the JSON but `gallery_data.json` seems to store them raw (chinese chars etc).
    # Wait, the previous JSON showed `remote_url` has encoded Chinese chars: e.g. %E6%84...
    # But the raw user input has unencoded chars.
    # The `GallerySection.js` uses `encodeURIComponent` wrapper for wsrv.nl, but direct usage might need valid URLs.
    # Standard practice: URL-encode path segments.
    # We should encode the new URLs before saving to JSON if the previous ones were encoded.
    
    # Let's check previous format from snippet:
    # "remote_url": "https://blog.catzz.work/file/...%E6%84%9F%E8%A7%89..."
    # So yes, we should encode the specialized part.
    
    for url in NEW_URLS:
        item_id = parse_id_from_url(url)
        if item_id and item_id in id_map:
            matched_ids.add(item_id)
            encoded_url = urllib.parse.quote(url, safe=':/')
            # Fix: quote encodes everything except safe.
            # But the domain 'blog.catzz.work' and 'file' are safe.
            # Actually, standard `quote` on the full URL might encode the ':' in https.
            # safe=':/' preserves the protocol and slashes.
            
            id_map[item_id]['remote_url'] = encoded_url
            id_map[item_id]['url'] = encoded_url # updating main url as well
            updated_count += 1
            print(f"Updated {item_id}: {encoded_url}")
        else:
            print(f"WARNING: Could not match URL to ID or ID not found: {url}")

    # Check for missing
    all_ids = set(id_map.keys())
    missing_ids = all_ids - matched_ids
    
    if missing_ids:
        print(f"\nMissing URLs for {len(missing_ids)} items:")
        for mid in missing_ids:
            print(f"ID: {mid} - Title: {id_map[mid]['title']}")
    else:
        print("\nAll items matched successfully!")
        
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"\nSaved {updated_count} updates to {JSON_FILE}")

if __name__ == '__main__':
    main()
