import torch
from langchain.embeddings import HuggingFaceBgeEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from app.data_processor import image_process, pdf_processor, word_process, text_process

device = "cuda:0" if torch.cuda.is_available() else "cpu"

# Global variables
conversation_retriaval_chain = []
embeddings = None

def initialize_embeddings():
    """
    Initialize the embeddings using pre-trained model to represent the data.
    """
    global embeddings
    embeddings = HuggingFaceBgeEmbeddings(
        model_name="BAAI/bge-m3",
        model_kwargs={"device": device}
    )

def handle_upload(mime_type, file_name, binary_data):
    global embeddings
    if embeddings is None:
        initialize_embeddings()

    if mime_type == "application/pdf":
        text = pdf_processor.process_pdf(binary_data)
    elif mime_type == "image/jpeg" or mime_type == "image/png":
        text = image_process.process_image(binary_data)
    elif mime_type == "application/msword" or mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        text = word_process.process_word(binary_data)
    else:
        raise ValueError("Unsupported file type")
    

    # Split the text into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size = 1024,
        chunk_overlap = 64
    )
    chunks = text_splitter.split_text(text)

    # Create an embeddings db if it doesn't exist, else add to the existing one using chroma from the chunks
    db = Chroma(
    persist_directory="data/vectors",
    collection_name="LEGAL_DATA",
    embedding_function=embeddings
    )
    db.add_texts(chunks, metadatas=[{"source": file_name}] * len(chunks))

    print(f"Completed processing file: {file_name}")
