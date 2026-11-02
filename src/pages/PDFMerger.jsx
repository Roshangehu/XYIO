import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, FileText, X, Download, ArrowUp, ArrowDown } from "lucide-react";
import "./PDFMerger.css";

export default function PDFMerger() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);

    const validFiles = selected.filter(
      (file) => file.type === "application/pdf"
    );

    setFiles((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index, direction) => {
    const updated = [...files];
    const target = index + direction;

    if (target < 0 || target >= updated.length) return;

    [updated[index], updated[target]] = [
      updated[target],
      updated[index],
    ];

    setFiles(updated);
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      alert("Please select at least two PDF files.");
      return;
    }

    try {
      setLoading(true);

      const mergedPDF = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);

        const pages = await mergedPDF.copyPages(
          pdf,
          pdf.getPageIndices()
        );

        pages.forEach((page) => mergedPDF.addPage(page));
      }

      const mergedBytes = await mergedPDF.save();

      const blob = new Blob([mergedBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "xylo-merged.pdf";
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Unable to merge PDFs. Please check your files.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pdf-merger-page">
      <div className="merger-container">
        <div className="merger-heading">
          <span className="tool-label">PDF TOOLS</span>
          <h1>Merge PDF</h1>
          <p>
            Combine multiple PDF files into one document.
            Simple, fast and secure.
          </p>
        </div>

        <div className="upload-box">
          <Upload size={38} />

          <h2>Select PDF files</h2>
          <p>Choose two or more PDF files to combine.</p>

          <label className="upload-button">
            Choose PDF Files
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFiles}
              hidden
            />
          </label>

          <span className="privacy-note">
            Your files are processed locally in your browser.
          </span>
        </div>

        {files.length > 0 && (
          <div className="selected-files">
            <div className="files-heading">
              <h2>Selected files ({files.length})</h2>
              <button onClick={() => setFiles([])}>Clear all</button>
            </div>

            {files.map((file, index) => (
              <div className="file-item" key={`${file.name}-${index}`}>
                <FileText size={24} />

                <div className="file-info">
                  <strong>{file.name}</strong>
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>

                <button
                  onClick={() => moveFile(index, -1)}
                  disabled={index === 0}
                  title="Move up"
                >
                  <ArrowUp size={17} />
                </button>

                <button
                  onClick={() => moveFile(index, 1)}
                  disabled={index === files.length - 1}
                  title="Move down"
                >
                  <ArrowDown size={17} />
                </button>

                <button onClick={() => removeFile(index)} title="Remove">
                  <X size={19} />
                </button>
              </div>
            ))}

            <button
              className="merge-button"
              onClick={mergePDFs}
              disabled={loading || files.length < 2}
            >
              <Download size={19} />
              {loading ? "Merging PDFs..." : "Merge PDF"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}