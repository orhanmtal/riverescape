from PIL import Image, ImageFilter
import os

base_dir = r'C:\Users\Admin\.gemini\antigravity\brain\f7a612bb-2faa-4614-8544-d41f49f36cab'
# Using your 1st and 3rd original images for desktop
paths = [
    os.path.join(base_dir, 'media__1778528308744.jpg'),
    os.path.join(base_dir, 'media__1778528308890.jpg')
]

target_w, target_h = 1920, 1080

for i, p in enumerate(paths):
    if not os.path.exists(p):
        continue
        
    img = Image.open(p)
    
    # 1. Background (Blurred)
    bg = img.copy()
    bg_w, bg_h = bg.size
    bg_ratio = max(target_w / bg_w, target_h / bg_h)
    bg = bg.resize((int(bg_w * bg_ratio), int(bg_h * bg_ratio)), Image.Resampling.LANCZOS)
    # Crop to fill
    bg_left = (bg.width - target_w) / 2
    bg_top = (bg.height - target_h) / 2
    bg = bg.crop((bg_left, bg_top, bg_left + target_w, bg_top + target_h))
    bg = bg.filter(ImageFilter.GaussianBlur(radius=20))
    
    # 2. Foreground (Sharp, Centered)
    fg = img.copy()
    fg_w, fg_h = fg.size
    fg_ratio = target_h / fg_h
    fg = fg.resize((int(fg_w * fg_ratio), target_h), Image.Resampling.LANCZOS)
    
    # Composite
    final = bg.copy()
    fg_x = int((target_w - fg.width) / 2)
    final.paste(fg, (fg_x, 0))
    
    # Save
    out_path = os.path.join(base_dir, f'desktop_ss{i+1}_honest_16_9.png')
    final.save(out_path)
    print(f'Saved Honest Desktop SS: {out_path}')
