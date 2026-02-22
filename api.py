from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import tempfile
import shutil
from pathlib import Path
from markdowntopdf import convert_markdown_to_pdf

app = FastAPI(title="Markdown to PDF API")

# Allow CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.post("/api/convert")
async def convert_md_to_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.md'):
        raise HTTPException(status_code=400, detail="Only .md files are allowed")

    # Create a temporary directory to process the file securely
    temp_dir = tempfile.mkdtemp()
    
    try:
        # Save uploaded markdown to temp file
        md_path = os.path.join(temp_dir, file.filename)
        with open(md_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
            
        # Expected output pdf path
        pdf_path = str(Path(md_path).with_suffix(".pdf"))
        
        # Convert!
        result_pdf_path = convert_markdown_to_pdf(md_path, pdf_path)
        
        # Return the PDF file as a downloadable response
        return FileResponse(
            path=result_pdf_path, 
            filename=Path(result_pdf_path).name,
            media_type='application/pdf'
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")
    # Note: We aren't deleting the temp_dir here immediately because FileResponse happens asynchronously. 
    # In a fully rugged production setup, we'd use BackgroundTasks to clean it up.
