import pytest
from markdowntopdf import convert_markdown_to_pdf

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
