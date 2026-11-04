import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Upload,
  FileText,
  Download,
  X,
  FileCheck
} from "lucide-react";
import "./PDFPageExtractor.css";

export default function PDFPageExtractor() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [range, setRange] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = async (e) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    if (selected.type !== "application/pdf") {
      alert("Please select a valid PDF file.");
      return;
    }

    try {
      const bytes = await selected.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);

      setFile(selected);
      setPageCount(pdf.getPageCount());
      setRange(`1-${pdf.getPageCount()}`);
    } catch {
      alert("Unable to read this PDF file.");
    }

    e.target.value = "";
  };

  const extractPages = async () => {
    if (!file || !range.trim()) return;

    try {
      setLoading(true);

      const pages = new Set();
      const parts = range.split(",");

      for (const part of parts) {
        const trimmed = part.trim();

        if (/^\d+$/.test(trimmed)) {
          const page = Number(trimmed);

          if (page < 1 || page > pageCount) {
            throw new Error("Invalid page number.");
          }

          pages.add(page - 1);
        } else if (/^\d+-\d+$/.test(trimmed)) {
          const [start, end] = trimmed.split("-").map(Number);

          if (
            start < 1 ||
            end > pageCount ||
            start > end
          ) {
            throw new Error("Invalid page range.");
          }

          for (let i = start; i <= end; i++) {
            pages.add(i - 1);
          }
        } else {
          throw new Error(
            "Enter a valid format, such as 1-3,5,7-9."
          );
        }
      }

      const selectedPages = [...pages].sort((a, b) => a - b);

      if (selectedPages.length === 0) {
        throw new Error("Please select at least one page.");
      }

      const originalBytes = await file.arrayBuffer();
      const originalPDF = await PDFDocument.load(originalBytes);

      const extractedPDF = await PDFDocument.create();

      const copiedPages = await extractedPDF.copyPages(
        originalPDF,
        selectedPages
      );

      copiedPages.forEach((page) => {
        extractedPDF.addPage(page);
      });

      const pdfBytes = await extractedPDF.save();

      const blob = new Blob([pdfBytes], {
        type: "application/pdf"
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "xylo-extracted-pages.pdf";
      link.click();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

    } catch (error) {
      alert(error.message || "Unable to extract pages.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="extractor-page">
      <div className="extractor-container">

        <div className="extractor-heading">
          <span className="tool-label">PDF TOOLS</span>
          <h1>Extract PDF Pages</h1>
          <p>
            Select the pages you need and create a new PDF
            containing only those pages.
          </p>
        </div>

        {!file ? (
          <div className="extract-upload-box">
            <Upload size={40} />

            <h2>Select a PDF file</h2>
            <p>Upload the PDF from which you want to extract pages.</p>

            <label className="extract-upload-button">
              Choose PDF File
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFile}
                hidden
              />
            </label>

            <span>
              Your files are processed locally in your browser.
            </span>
          </div>
        ) : (
          <div className="extract-workspace">

            <div className="extract-file-card">
              <FileText size={27} />

              <div>
                <strong>{file.name}</strong>
                <span>
                  {pageCount} pages · {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setPageCount(0);
                  setRange("");
                }}
                title="Remove file"
              >
                <X />
              </button>
            </div>

            <div className="extract-options">
              <h2>Select pages to extract</h2>

              <p>
                Enter individual page numbers or page ranges.
                Separate multiple selections with commas.
              </p>

              <input
                type="text"
                value={range}
                onChange={(e) => setRange(e.target.value)}
                placeholder="Example: 1-3, 5, 7-9"
              />

              <small>
                Available pages: 1 to {pageCount}
              </small>

              <div className="extract-example">
                <strong>Example: 1-3,5,7-9</strong>
                <p>
                  Your new PDF will contain pages 1, 2, 3, 5, 7, 8 and 9.
                </p>
              </div>
            </div>

            <button
              className="extract-download-button"
              onClick={extractPages}
              disabled={loading || !range.trim()}
            >
              {loading ? (
                "Extracting pages..."
              ) : (
                <>
                  <FileCheck size={19} />
                  Extract Pages
                  <Download size={19} />
                </>
              )}
            </button>

          </div>
        )}

      </div>
    </div>
  );
}