from PIL import Image
import os

base_dir = r'C:\Users\Admin\.gemini\antigravity\brain\f7a612bb-2faa-4614-8544-d41f49f36cab'
paths = [
    os.path.join(base_dir, 'media__1778528308744.jpg'),
    os.path.join(base_dir, 'media__1778528308797.jpg'),
    os.path.join(base_dir, 'media__1778528308890.jpg'),
    os.path.join(base_dir, 'media__1778528308918.jpg'),
    os.path.join(base_dir, 'media__1778528308928.jpg')
]

target_w, target_h = 1080, 1920

for i, p in enumerate(paths):
    if not os.path.exists(p):
        print(f"File not found: {p}")
        continue
        
    img = Image.open(p)
    img_w, img_h = img.size
    
    # Calculate ratio to cover target (Fill/Crop)
    ratio = max(target_w / img_w, target_h / img_h)
    new_w = int(img_w * ratio)
    new_h = int(img_h * ratio)
    
    # Resize
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Center crop
    left = (new_w - target_w) / 2
    top = (new_h - target_h) / 2
    right = (new_w + target_w) / 2
    bottom = (new_h + target_h) / 2
    
    img = img.crop((left, top, right, bottom))
    
    # Save as PNG for high quality
    out_path = os.path.join(base_dir, f'ss{i+1}_yandex_9_16.png')
    img.save(out_path)
    print(f'Saved: {out_path}')
