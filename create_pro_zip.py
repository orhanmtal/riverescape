import zipfile
import os

def create_zip(zip_name, folder_path):
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                file_path = os.path.join(root, file)
                # Create arcname with forward slashes
                arcname = os.path.relpath(file_path, folder_path).replace(os.path.sep, '/')
                zipf.write(file_path, arcname)
    print(f"Zip created successfully: {zip_name}")

if __name__ == "__main__":
    create_zip('RiverEscapeElite_Yandex_v1.99.70.12_FINAL_PRO.zip', 'www')
