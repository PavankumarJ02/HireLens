"""
Service module for parsing PDF documents and extracting text using pdfplumber.
Handles clean formatting and invalid files gracefully.
"""

import io
import re
import pdfplumber

class PDFParsingError(Exception):
    """Custom exception raised when PDF parsing fails due to corrupt or unreadable data."""
    pass

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract clean plain text from PDF file bytes.
    Args:
        file_bytes (bytes): The raw byte content of the PDF file.
    Returns:
        str: Cleaned text extracted from the PDF.
    Raises:
        PDFParsingError: If the file is empty, corrupt, or has no extractable text.
    """
    if not file_bytes:
        raise PDFParsingError("PDF file is empty.")

    extracted_text_list = []
    try:
        # Use io.BytesIO to read file from bytes stream
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            if not pdf.pages:
                raise PDFParsingError("PDF document has no pages.")
            
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text_list.append(text)
    except Exception as e:
        raise PDFParsingError(f"Failed to parse PDF document. It might be corrupt: {str(e)}") from e

    # Combine extracted pages and strip excess spaces
    full_text = "\n".join(extracted_text_list).strip()
    if not full_text:
        raise PDFParsingError("No readable text could be extracted from the PDF.")

    # Clean excessive whitespace and empty lines
    # Replace multiple spaces with a single space
    cleaned_text = re.sub(r'[ \t]+', ' ', full_text)
    # Replace three or more consecutive line breaks with double line break
    cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)

    return cleaned_text.strip()
