"""
Service module for resume security and validation.
"""

class ResumeValidationError(Exception):
    """Exception raised when resume file validation fails."""
    pass

def validate_file(filename: str, file_bytes: bytes) -> str:
    """
    Validates the uploaded resume file bytes and filename.
    Only .pdf and .txt are accepted.
    Empty files must be rejected.
    PDF extension must be case-insensitive and bytes must begin with the %PDF- signature.
    TXT must be valid UTF-8 and contain no null bytes.
    
    Returns:
        str: "pdf" or "txt" for valid files.
    Raises:
        ResumeValidationError: If validation fails.
    """
    if not file_bytes or len(file_bytes) == 0:
        raise ResumeValidationError("Empty file is not allowed.")

    if not filename:
        raise ResumeValidationError("Filename is missing.")

    lower_filename = filename.lower()
    if lower_filename.endswith('.pdf'):
        # Check PDF signature
        if not file_bytes.startswith(b'%PDF-'):
            raise ResumeValidationError("Invalid PDF file: Missing %PDF- signature.")
        return "pdf"
        
    elif lower_filename.endswith('.txt'):
        # Check TXT null bytes
        if b'\x00' in file_bytes:
            raise ResumeValidationError("Invalid TXT file: File contains null bytes.")
        
        # Check UTF-8 validity
        try:
            file_bytes.decode('utf-8')
        except UnicodeDecodeError as e:
            raise ResumeValidationError("Invalid TXT file: File is not valid UTF-8.") from e
        return "txt"
        
    else:
        raise ResumeValidationError("Unsupported file extension. Only .pdf and .txt files are allowed.")
