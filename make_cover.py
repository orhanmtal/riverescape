import os
from PIL import Image, ImageFilter, ImageDraw, ImageFont

def make_yandex_cover():
    input_dir = r"c:\Users\Admin\.gemini\antigravity\scratch\RiverEscapeWeb\screenshots_input"
    output_path = r"c:\Users\Admin\.gemini\antigravity\scratch\RiverEscapeWeb\RiverEscape_Cover.png"

    # Find the first image in the screenshots_input folder
    input_path = None
    if os.path.exists(input_dir):
        for f in os.listdir(input_dir):
            if f.lower().endswith(('.png', '.jpg', '.jpeg')):
                input_path = os.path.join(input_dir, f)
                break

    if not input_path:
        print(f"HATA: Lutfen kapak yapmak istedigin o mavi resimli fotografi '{input_dir}' klasorunun icine at ve kodu tekrar calistir!")
        return

    # Target Yandex Cover Dimensions
    target_width = 800
    target_height = 470

    original_img = Image.open(input_path).convert("RGBA")

    # 1. Background: Stretch and Blur
    bg_img = original_img.resize((target_width, target_height))
    bg_img = bg_img.filter(ImageFilter.GaussianBlur(radius=20))
    bg_img = bg_img.point(lambda p: p * 0.6) # Darken background

    # 2. Main Image: Fit height
    aspect_ratio = original_img.width / original_img.height
    new_w = int(target_height * aspect_ratio)
    new_h = target_height
    
    sharp_img = original_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # 3. Paste main image in center
    x_offset = (target_width - new_w) // 2
    bg_img.paste(sharp_img, (x_offset, 0), sharp_img)

    # 4. Add a dark gradient at the bottom for text readability
    draw = ImageDraw.Draw(bg_img)
    gradient_height = 100
    for y in range(target_height - gradient_height, target_height):
        alpha = int(255 * ((y - (target_height - gradient_height)) / gradient_height))
        draw.line([(0, y), (target_width, y)], fill=(0, 0, 0, alpha))

    # 5. Add Text "RIVER ESCAPE ELITE"
    try:
        # Try to use a bold system font
        font_path = r"C:\Windows\Fonts\impact.ttf"
        if not os.path.exists(font_path):
            font_path = r"C:\Windows\Fonts\ariblk.ttf" # Arial Black
            
        font = ImageFont.truetype(font_path, 48)
    except:
        font = ImageFont.load_default()

    text = "RIVER ESCAPE ELITE"
    
    # Get text bounding box to center it
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    text_x = (target_width - text_width) // 2
    text_y = target_height - text_height - 30

    # Draw text with shadow
    shadow_offset = 3
    draw.text((text_x + shadow_offset, text_y + shadow_offset), text, font=font, fill=(0, 0, 0, 255))
    draw.text((text_x, text_y), text, font=font, fill=(255, 215, 0, 255)) # Gold color

    # Finalize and Save
    final_img = bg_img.convert("RGB")
    final_img.save(output_path, "PNG")
    print(f"Cover image successfully created at: {output_path}")

if __name__ == "__main__":
    make_yandex_cover()
