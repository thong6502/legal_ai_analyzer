import docx
import io

def process_word(binary_data):
    doc = docx.Document(io.BytesIO(binary_data))
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text