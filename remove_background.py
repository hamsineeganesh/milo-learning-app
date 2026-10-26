
import os
from PIL import Image
from collections import deque


def flood_fill_transparency(img_path, out_path, threshold=225):
    if not os.path.exists(img_path):
        print(f"ERROR: Image not found: {img_path}")
        return

    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    visited = set()
    queue = deque()

    # Find near-white pixels along the image edges
    for x in range(width):
        for y in (0, height - 1):
            r, g, b, a = pixels[x, y]
            if min(r, g, b) >= threshold:
                queue.append((x, y))
                visited.add((x, y))

    for y in range(height):
        for x in (0, width - 1):
            r, g, b, a = pixels[x, y]
            if min(r, g, b) >= threshold and (x, y) not in visited:
                queue.append((x, y))
                visited.add((x, y))

    # Remove connected white background
    while queue:
        cx, cy = queue.popleft()
        r, g, b, a = pixels[cx, cy]
        brightness = min(r, g, b)

        if brightness >= threshold + 15:
            pixels[cx, cy] = (r, g, b, 0)
        else:
            alpha = int(255 * (threshold + 15 - brightness) / 15)
            alpha = max(0, min(255, alpha))
            pixels[cx, cy] = (r, g, b, alpha)

        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = cx + dx, cy + dy

            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited:
                    nr, ng, nb, _ = pixels[nx, ny]
                    if min(nr, ng, nb) >= threshold:
                        visited.add((nx, ny))
                        queue.append((nx, ny))

    # Crop using visible pixels only
    alpha_channel = img.getchannel("A")
    bbox = alpha_channel.getbbox()

    if bbox:
        padding = 15
        left = max(0, bbox[0] - padding)
        top = max(0, bbox[1] - padding)
        right = min(width, bbox[2] + padding)
        bottom = min(height, bbox[3] + padding)
        img = img.crop((left, top, right, bottom))

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path, "PNG")
    print(f"SUCCESS: {out_path} | Size: {img.size}")


# Source images generated in Antigravity
brain_dir = (
    r"C:\Users\prkar\.gemini\antigravity-ide\brain"
    r"\7e2cfce7-be23-4f86-bbac-740c67fc7099"
)

# Project assets folder
target_dir = (
    r"C:\Users\prkar\Downloads"
    r"\little_seed_innovative_fixed\milo\assets"
)

images = [
    ("milo_puppy_1793050020002.jpg", "milo.png"),
    ("character_mira_1793050048203.jpg", "char_mira.png"),
    ("character_piper_1793050075889.jpg", "char_piper.png"),
    ("character_kai_1793050097379.jpg", "char_kai.png"),
    ("character_leo_1793050122551.jpg", "char_leo.png"),
]

for source_name, output_name in images:
    source_path = os.path.join(brain_dir, source_name)
    output_path = os.path.join(target_dir, output_name)

    flood_fill_transparency(
        source_path,
        output_path,
        threshold=225
    )

print("Background removal process finished.")
