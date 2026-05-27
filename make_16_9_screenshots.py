import os
import zipfile
from PIL import Image, ImageFilter

def process_screenshots(input_folder="screenshots_input", output_folder="screenshots_output", zip_name="yandex_16_9_screenshots.zip"):
    # Create directories if they don't exist
    if not os.path.exists(input_folder):
        os.makedirs(input_folder)
        print(f"Lutfen dikey fotograflarini '{input_folder}' klasorune kopyala ve bu scripti tekrar calistir.")
        return

    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # 16:9 Target Size
    target_width = 1920
    target_height = 1080

    processed_files = []

    for filename in os.listdir(input_folder):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            img_path = os.path.join(input_folder, filename)
            try:
                # Open image
                original_img = Image.open(img_path).convert("RGBA")
                
                # 1. Create blurred background (stretch original to fill 1920x1080 and blur heavily)
                bg_img = original_img.resize((target_width, target_height))
                bg_img = bg_img.filter(ImageFilter.GaussianBlur(radius=30))
                
                # Darken background slightly to make main image pop
                bg_img = bg_img.point(lambda p: p * 0.7)

                # 2. Resize original image to fit height 1080 while keeping aspect ratio
                aspect_ratio = original_img.width / original_img.height
                new_w = int(target_height * aspect_ratio)
                new_h = target_height
                
                sharp_img = original_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                
                # 3. Paste sharp image into the center of the blurred background
                x_offset = (target_width - new_w) // 2
                
                # Combine
                bg_img.paste(sharp_img, (x_offset, 0), sharp_img)
                
                # Save as RGB to avoid PNG alpha issues on Yandex if any
                final_img = bg_img.convert("RGB")
                
                out_filename = f"16_9_{filename}"
                if not out_filename.endswith('.png'):
                    out_filename = out_filename.rsplit('.', 1)[0] + '.png'
                
                out_path = os.path.join(output_folder, out_filename)
                final_img.save(out_path, "PNG")
                processed_files.append(out_path)
                print(f"Isilendi: {filename} -> {out_filename}")
                
            except Exception as e:
                print(f"Hata olustu ({filename}): {e}")

    # Create ZIP
    if processed_files:
        with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file_path in processed_files:
                zipf.write(file_path, os.path.basename(file_path))
        print(f"\nISLEM TAMAM! Tum resimler 16:9 yapildi ve ZIP'lendi: {zip_name}")
    else:
        print("\nIslecek resim bulunamadi. Lutfen 'screenshots_input' klasorune resim ekle.")

if __name__ == "__main__":
    process_screenshots()
