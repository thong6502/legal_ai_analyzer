import io
import pytesseract
from PIL import Image

def process_image(binary_data):
    image = Image.open(io.BytesIO(binary_data))
    text = pytesseract.image_to_string(image)
    return text