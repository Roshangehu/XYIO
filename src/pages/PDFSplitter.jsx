import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import {
  Upload,
  FileText,
  Download,
  Scissors,
  X
} from "lucide-react";
import "./PDFSplitter.css";

export default function PDFSplitter() {
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

  const splitPDF = async () => {
    if (!file || !range.trim()) return;

    try {
      setLoading(true);

      // Parse ranges such as 1-3,5,7-9
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
          throw new Error("Use a valid format like 1-3,5,7-9.");
        }
      }

      const selectedPages = [...pages].sort((a, b) => a - b);

      if (selectedPages.length === 0) {
        throw new Error("Please select at least one page.");
      }

      const originalBytes = await file.arrayBuffer();
      const originalPDF = await PDFDocument.load(originalBytes);

      const zip = new JSZip();

      // Create one PDF for each selected page
      for (const pageIndex of selectedPages) {
        const newPDF = await PDFDocument.create();

        const [copiedPage] = await newPDF.copyPages(
          originalPDF,
          [pageIndex]
        );

        newPDF.addPage(copiedPage);

        const pdfBytes = await newPDF.save();

        zip.file(`page-${pageIndex + 1}.pdf`, pdfBytes);
      }

      const zipBlob = await zip.generateAsync({
        type: "blob"
      });

      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "xylo-split-pdf.zip";
      link.click();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

    } catch (error) {
      alert(error.message || "Unable to split PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pdf-splitter-page">
      <div className="splitter-container">

        <div className="splitter-heading">
          <span className="tool-label">PDF TOOLS</span>
          <h1>Split PDF</h1>
          <p>
            Separate your PDF into individual pages.
            Select the pages you want and download them together.
          </p>
        </div>

        {!file ? (
          <div className="split-upload-box">
            <Upload size={40} />

            <h2>Select a PDF file</h2>
            <p>Upload the document you want to split.</p>

            <label className="split-upload-button">
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
          <div className="split-workspace">

            <div className="split-file-card">
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

            <div className="split-options">
              <h2>Choose pages</h2>

              <p>
                Enter page numbers or ranges separated by commas.
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

              <div className="split-example">
                <strong>Example:</strong>
                <span>1-3,5,7-9</span>
                <p>
                  Creates separate PDFs for pages 1, 2, 3, 5, 7, 8 and 9.
                </p>
              </div>
            </div>

            <button
              className="split-download-button"
              onClick={splitPDF}
              disabled={loading || !range.trim()}
            >
              {loading ? (
                "Splitting PDF..."
              ) : (
                <>
                  <Scissors size={19} />
                  Split PDF & Download ZIP
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