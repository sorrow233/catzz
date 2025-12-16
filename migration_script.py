
import json
import urllib.parse
import os

# User provided URLs
remote_urls = [
"https://blog.catzz.work/file/1765900357798_1-1.png",
"https://blog.catzz.work/file/1765900356416_68559847_COMITIA124 お品書き.jpg",
"https://blog.catzz.work/file/1765900358693_68686407_星星坠落的傍晚.jpg",
"https://blog.catzz.work/file/1765900357085_69338337_屋上の遊園地.jpg",
"https://blog.catzz.work/file/1765900357584_69553890_Location Unknown ◐.jpg",
"https://blog.catzz.work/file/1765900358559_70526434_さくらちゃんアニメ塗り.jpg",
"https://blog.catzz.work/file/1765900358474_71033422_覚醒ネフティス.jpg",
"https://blog.catzz.work/file/1765900362972_71359340_魔女の部屋.jpg",
"https://blog.catzz.work/file/1765900354504_71794922_普段に使われるライティング方を描いてみた.jpg",
"https://blog.catzz.work/file/1765900356195_72055179_雨の日.jpg",
"https://blog.catzz.work/file/1765900360331_72200609_雨の日2.jpg",
"https://blog.catzz.work/file/1765900363060_72668704_PAIN.jpg",
"https://blog.catzz.work/file/1765900364030_72955418_新しい日の.jpg",
"https://blog.catzz.work/file/1765900356929_73205835_「私を連れて帰れるニャー？」.jpg",
"https://blog.catzz.work/file/1765900363426_73838366_水鏡.jpg",
"https://blog.catzz.work/file/1765900364036_74451722_通りすがりJK.jpg",
"https://blog.catzz.work/file/1765900358676_93821718_胡桃と香菱のハロウィン.jpg",
"https://blog.catzz.work/file/1765900361972_100669875_ネコと散歩.jpg",
"https://blog.catzz.work/file/1765900363108_101805095_ラムレーズン・パンケーキ.jpg",
"https://blog.catzz.work/file/1765900362705_102387252_ドミノ少女.jpg",
"https://blog.catzz.work/file/1765900358677_102852101_寡欲＠しゅーず.jpg",
"https://blog.catzz.work/file/1765900358653_103829884_寄りかかる.jpg",
"https://blog.catzz.work/file/1765900367251_104979521_202301練習まとめ.jpg",
"https://blog.catzz.work/file/1765900367408_106031896_lil lull.jpg",
"https://blog.catzz.work/file/1765900358824_109645771_ライブペインティング始めた.jpg",
"https://blog.catzz.work/file/1765900361408_111294212_NewJeans.jpg",
"https://blog.catzz.work/file/1765900363994_111668251_情緒と理芽、図書館に探る.jpg",
"https://blog.catzz.work/file/1765900366348_112052584_Cytokine NITRO.jpg",
"https://blog.catzz.work/file/1765900367042_112087392_自転車.jpg",
"https://blog.catzz.work/file/1765900363554_112167497_I feel serene.jpg",
"https://blog.catzz.work/file/1765900367258_112901502_空を湿らす雨.jpg",
"https://blog.catzz.work/file/1765900369147_113114668_繫華街.jpg",
"https://blog.catzz.work/file/1765900367596_113390096_City Light.jpg",
"https://blog.catzz.work/file/1765900368047_113575664_寒くなってきたらラーメン食べたくなった.jpg",
"https://blog.catzz.work/file/1765900362650_113793915_目的地知らず.jpg",
"https://blog.catzz.work/file/1765900364317_114011113_大人ごっこ.jpg",
"https://blog.catzz.work/file/1765900365334_116302432_君がいない季節.jpg",
"https://blog.catzz.work/file/1765900371696_116686084_Shelter of Blooming Life.jpg",
"https://blog.catzz.work/file/1765900367427_116952992_幸祜、伍番街で春猿火を助ける.jpg",
"https://blog.catzz.work/file/1765900367881_119558538_-The Waiting-.jpg",
"https://blog.catzz.work/file/1765900363923_127416960_瞬き.jpg",
"https://blog.catzz.work/file/1765900367518_127425513_夜雨.jpg",
"https://blog.catzz.work/file/1765900363974_129351877_100日チャレンジ　1日目～10日目.jpg",
"https://blog.catzz.work/file/1765900364037_129779664_100日チャレンジ　11日目～20日目.jpg",
"https://blog.catzz.work/file/1765900367757_130085857_100日チャレンジ　21日目～30日目.jpg",
"https://blog.catzz.work/file/1765900374464_130449095_100日チャレンジ　31日目～40日目.jpg",
"https://blog.catzz.work/file/1765900370551_131188010_100日チャレンジ　41日目～60日目.jpg",
"https://blog.catzz.work/file/1765900369749_131571863_100日チャレンジ　61日目～70日目.jpg",
"https://blog.catzz.work/file/1765900374506_131979178_100日チャレンジ　71日目～80日目.jpg",
"https://blog.catzz.work/file/1765900369016_137779301_Solitude.jpg",
"https://blog.catzz.work/file/1765900371563_138045922_感觉有点冷可以开始放寒假了吗.jpg"
]

def encode_url(url):
    parts = urllib.parse.urlsplit(url)
    # Encode only the path, keeping the domain safe
    encoded_path = urllib.parse.quote(parts.path)
    # Reconstruct
    return urllib.parse.urlunsplit((parts.scheme, parts.netloc, encoded_path, parts.query, parts.fragment))

# Create a map of ID -> Encoded URL
id_map = {}
special_map = {} # For 1-1.png

for url in remote_urls:
    # Handle the Chinese characters by encoding immediately for storage
    encoded_url = encode_url(url)
    
    # Extract ID
    # Pattern: file/TIMESTAMP_ID_Title
    # We look for the numeric ID after the timestamp (or just matching the known IDs)
    basename = os.path.basename(urllib.parse.unquote(url)) # decode to regex match
    
    if "1-1.png" in basename:
        special_map["1-1"] = encoded_url
        continue
        
    parts = basename.split('_')
    # Usually: [Timestamp, ID, Title...]
    # Let's try to find the ID. It's usually the 2nd part if splitting by _. 
    # But checking the User input: 1765900356416_68559847_...
    # Yes, 2nd part.
    if len(parts) >= 2 and parts[1].isdigit():
        img_id = int(parts[1])
        id_map[img_id] = encoded_url
    else:
        # Fallback or log?
        pass

# Load Metadata
metadata_path = '/Users/kang/Documents/catzz/pixiv_data/metadata.json'
with open(metadata_path, 'r') as f:
    metadata = json.load(f)

# Merge
new_data = []
for item in metadata:
    item_id = item['id']
    if item_id in id_map:
        item['remote_url'] = id_map[item_id]
        item['url'] = id_map[item_id] # Use 'url' as the primary key for the app
    else:
        # If no remote URL found, what to do? 
        # For now, keep local_path but warn?
        # Actually, let's just keep it.
        item['url'] = f"pixiv_data/{item['local_path']}" 
    
    new_data.append(item)

# Ensure directory exists
os.makedirs('/Users/kang/Documents/catzz/src/data', exist_ok=True)

# Write to src/data/gallery_data.json
with open('/Users/kang/Documents/catzz/src/data/gallery_data.json', 'w', encoding='utf-8') as f:
    json.dump(new_data, f, ensure_ascii=False, indent=2)

# Write special map to another file or just print it for me to use in Carousel
with open('/Users/kang/Documents/catzz/src/data/carousel_assets.json', 'w', encoding='utf-8') as f:
    json.dump(special_map, f, ensure_ascii=False, indent=2)

print("Migration complete.")
