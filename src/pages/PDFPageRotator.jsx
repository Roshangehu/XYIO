import { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import {
  Upload,
  FileText,
  Download,
  RotateCw,
  RotateCcw,
  X
} from "lucide-react";

import "./PDFPageRotator.css";

export default function PDFPageRotator() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [range, setRange] = useState("all");
  const [rotation, setRotation] = useState(90);
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
      setRange("all");
    } catch {
      alert("Unable to read this PDF file.");
    }

    e.target.value = "";
  };

  const getSelectedPages = () => {
    if (range.trim().toLowerCase() === "all") {
      return Array.from({ length: pageCount }, (_, i) => i);
    }

    const pages = new Set();

    for (const part of range.split(",")) {
      const trimmed = part.trim();

      if (/^\d+$/.test(trimmed)) {
        const page = Number(trimmed);

        if (page < 1 || page > pageCount) {
          throw new Error("Invalid page number.");
        }

        pages.add(page - 1);
      } else if (/^\d+-\d+$/.test(trimmed)) {
        const [start, end] = trimmed.split("-").map(Number);

        if (start < 1 || end > pageCount || start > end) {
          throw new Error("Invalid page range.");
        }

        for (let i = start; i <= end; i++) {
          pages.add(i - 1);
        }
      } else {
        throw new Error("Enter a valid range, such as 1-3,5.");
      }
    }

    return [...pages].sort((a, b) => a - b);
  };

  const rotatePDF = async () => {
    if (!file) return;

    try {
      setLoading(true);

      const selectedPages = getSelectedPages();

      if (selectedPages.length === 0) {
        throw new Error("Please select at least one page.");
      }

      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);

      const pages = pdf.getPages();

      selectedPages.forEach((index) => {
        const currentRotation = pages[index].getRotation().angle;

        pages[index].setRotation(
          degrees((currentRotation + rotation) % 360)
        );
      });

      const outputBytes = await pdf.save();

      const blob = new Blob([outputBytes], {
        type: "application/pdf"
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "xylo-rotated.pdf";
      link.click();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

    } catch (error) {
      alert(error.message || "Unable to rotate PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rotator-page">
      <div className="rotator-container">

        <div className="rotator-heading">
          <span className="tool-label">PDF TOOLS</span>

          <h1>Rotate PDF</h1>

          <p>
            Rotate PDF pages in seconds.
            Choose the pages and the rotation angle you need.
          </p>
        </div>

        {!file ? (
          <div className="rotator-upload-box">
            <Upload size={40} />

            <h2>Select a PDF file</h2>

            <p>Upload the PDF you want to rotate.</p>

            <label className="rotator-upload-button">
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
          <div className="rotator-workspace">

            <div className="rotator-file-card">
              <FileText size={27} />

              <div>
                <strong>{file.name}</strong>

                <span>
                  {pageCount} pages ·{" "}
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setPageCount(0);
                  setRange("all");
                }}
                title="Remove file"
              >
                <X />
              </button>
            </div>

            <div className="rotator-options">

              <h2>Choose pages</h2>

              <p>
                Select which pages you want to rotate.
              </p>

              <input
                type="text"
                value={range}
                onChange={(e) => setRange(e.target.value)}
                placeholder="all or 1-3,5,7"
              />

              <small>
                Type "all" to rotate every page.
                Available pages: 1 to {pageCount}.
              </small>

              <h2 className="rotation-title">
                Select rotation angle
              </h2>

              <div className="rotation-options">

                {[90, 180, 270].map((angle) => (
                  <button
                    key={angle}
                    className={
                      rotation === angle ? "rotation-active" : ""
                    }
                    onClick={() => setRotation(angle)}
                  >
                    <RotateCw
                      size={23}
                      style={{ transform: `rotate(${angle}deg)` }}
                    />

                    <span>{angle}°</span>
                  </button>
                ))}

              </div>

              <div className="rotation-info">
                <RotateCcw size={18} />

                <span>
                  Rotation is applied clockwise.
                </span>
              </div>

            </div>

            <button
              className="rotator-download-button"
              onClick={rotatePDF}
              disabled={loading || !range.trim()}
            >
              {loading ? (
                "Rotating PDF..."
              ) : (
                <>
                  <RotateCw size={19} />
                  Rotate PDF
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