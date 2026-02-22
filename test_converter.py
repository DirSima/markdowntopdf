import pytest
from fastapi.testclient import TestClient
from markdowntopdf import convert_markdown_to_pdf
from api import app

client = TestClient(app)

def test_conversion_success(tmp_path):
    # Create a temporary markdown file
    md_file = tmp_path / "test.md"
    md_file.write_text("# Test Title\n\nThis is a test.")
    
    pdf_file = tmp_path / "test.pdf"
    
    result_path = convert_markdown_to_pdf(str(md_file), str(pdf_file))
    
    assert result_path == str(pdf_file)
    assert pdf_file.exists()
    assert pdf_file.stat().st_size > 0

def test_conversion_default_output(tmp_path):
    # Create a temporary markdown file
    md_file = tmp_path / "test.md"
    md_file.write_text("# Test Title")
    
    result_path = convert_markdown_to_pdf(str(md_file))
    
    expected_pdf = md_file.with_suffix(".pdf")
    assert result_path == str(expected_pdf)
    assert expected_pdf.exists()

def test_file_not_found():
    with pytest.raises(FileNotFoundError):
        convert_markdown_to_pdf("non_existent_file.md")

def test_api_convert_success(tmp_path):
    # Test the FastAPI endpoint directly with an uploaded file
    md_content = b"# API Test\n\nTesting the fastAPI conversion endpoint."
    
    # Send a multipart form-data request
    response = client.post(
        "/api/convert",
        files={"file": ("test_api.md", md_content, "text/markdown")}
    )
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "filename=\"test_api.pdf\"" in response.headers["content-disposition"]
    
    # Verify the returned content is not empty
    assert len(response.content) > 0

def test_api_convert_invalid_extension():
    # Send a non-md file
    response = client.post(
        "/api/convert",
        files={"file": ("test_api.txt", b"Invalid extension text", "text/plain")}
    )
    
    assert response.status_code == 400
    assert "Only .md files are allowed" in response.json()["detail"]
