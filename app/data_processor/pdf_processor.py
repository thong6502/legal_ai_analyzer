from PyPDF2 import PdfReader
import io

def process_pdf(binary_data):
    pdf = PdfReader(io.BytesIO(binary_data))
    text = ""
    for page in pdf.pages:
        text += page.extract_text()
    return text