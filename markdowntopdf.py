import argparse
import sys
from pathlib import Path
from markdown_pdf import Section, MarkdownPdf

def convert_markdown_to_pdf(input_path: str, output_path: str = None) -> str:
    """
    Converts a Markdown file to a PDF file.
    
    Args:
        input_path: Path to the input Markdown file.
        output_path: Path to the output PDF file. If None, derived from input_path.
        
    Returns:
        The path to the generated PDF file.
    """
    input_file = Path(input_path)
    if not input_file.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")
        
    if output_path is None:
        output_path = str(input_file.with_suffix(".pdf"))
        
    # Read markdown content
    with open(input_file, "r", encoding="utf-8") as f:
        md_content = f.read()
        
    # Initialize PDF
    pdf = MarkdownPdf(toc_level=2)
    
    # Add section
    pdf.add_section(Section(md_content))
    
    # Save PDF
    pdf.save(output_path)
    
    return output_path

def main():
    parser = argparse.ArgumentParser(description="Convert Markdown to PDF")
    parser.add_argument("input", help="Path to the input Markdown file")
    parser.add_argument("-o", "--output", help="Path to the output PDF file (optional)")
    
    args = parser.parse_args()
    
    try:
        result_path = convert_markdown_to_pdf(args.input, args.output)
        print(f"Successfully converted '{args.input}' to '{result_path}'")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
