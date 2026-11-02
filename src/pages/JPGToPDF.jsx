import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Upload,
  Image as ImageIcon,
  Download,
  X,
  ArrowUp,
  ArrowDown,
  FileText
} from "lucide-react";

import "./JPGToPDF.css";

export default function JPGToPDF() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState("fit");

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);

    const validFiles = selected.filter((file) =>
      ["image/jpeg", "image/png"].includes(file.type)
    );

    if (validFiles.length !== selected.length) {
      alert("Only JPG, JPEG and PNG images are supported.");
    }

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
      updated[index]
    ];

    setFiles(updated);
  };

  const createPDF = async () => {
    if (files.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    try {
      setLoading(true);

      const pdf = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();

        let image;

        if (file.type === "image/jpeg") {
          image = await pdf.embedJpg(bytes);
        } else {
          image = await pdf.embedPng(bytes);
        }

        const imageWidth = image.width;
        const imageHeight = image.height;

        let pageWidth = imageWidth;
        let pageHeight = imageHeight;

        if (pageSize === "a4") {
          const a4Width = 595.28;
          const a4Height = 841.89;

          const scale = Math.min(
            a4Width / imageWidth,
            a4Height / imageHeight
          );

          pageWidth = a4Width;
          pageHeight = a4Height;

          const scaledWidth = imageWidth * scale;
          const scaledHeight = imageHeight * scale;

          const page = pdf.addPage([pageWidth, pageHeight]);

          page.drawImage(image, {
            x: (pageWidth - scaledWidth) / 2,
            y: (pageHeight - scaledHeight) / 2,
            width: scaledWidth,
            height: scaledHeight
          });

          continue;
        }

        const page = pdf.addPage([pageWidth, pageHeight]);

        page.drawImage(image, {
          x: 0,
          y: 0,
          width: imageWidth,
          height: imageHeight
        });
      }

      const pdfBytes = await pdf.save();

      const blob = new Blob([pdfBytes], {
        type: "application/pdf"
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "xylo-images-to-pdf.pdf";
      link.click();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

    } catch (error) {
      console.error(error);
      alert("Unable to create PDF. Please check your images.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="jpg-pdf-page">
      <div className="jpg-pdf-container">

        <div className="jpg-pdf-heading">
          <span className="tool-label">PDF TOOLS</span>

          <h1>JPG to PDF</h1>

          <p>
            Convert multiple images into one PDF document.
            Arrange your images and download your PDF.
          </p>
        </div>

        <div className="jpg-upload-box">
          <Upload size={40} />

          <h2>Select your images</h2>

          <p>Upload JPG, JPEG or PNG images.</p>

          <label className="jpg-upload-button">
            Choose Images

            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleFiles}
              hidden
            />
          </label>

          <span>
            Your images are processed locally in your browser.
          </span>
        </div>

        {files.length > 0 && (
          <div className="jpg-workspace">

            <div className="jpg-files-heading">
              <h2>Selected images ({files.length})</h2>

              <button onClick={() => setFiles([])}>
                Clear all
              </button>
            </div>

            <div className="jpg-file-list">

              {files.map((file, index) => (
                <div className="jpg-file-item" key={`${file.name}-${index}`}>

                  <ImageIcon size={25} />

                  <div className="jpg-file-info">
                    <strong>{file.name}</strong>

                    <span>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
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

                  <button
                    onClick={() => removeFile(index)}
                    title="Remove image"
                  >
                    <X size={19} />
                  </button>

                </div>
              ))}

            </div>

            <div className="jpg-options">
              <h2>PDF settings</h2>

              <p>Choose the page size for your PDF.</p>

              <div className="jpg-size-options">

                <button
                  className={pageSize === "fit" ? "jpg-size-active" : ""}
                  onClick={() => setPageSize("fit")}
                >
                  <FileText size={22} />
                  <strong>Fit to Image</strong>
                  <span>Page matches image dimensions</span>
                </button>

                <button
                  className={pageSize === "a4" ? "jpg-size-active" : ""}
                  onClick={() => setPageSize("a4")}
                >
                  <FileText size={22} />
                  <strong>A4 Size</strong>
                  <span>Images fit inside A4 pages</span>
                </button>

              </div>
            </div>

            <button
              className="jpg-create-button"
              onClick={createPDF}
              disabled={loading || files.length === 0}
            >
              {loading ? (
                "Creating PDF..."
              ) : (
                <>
                  <FileText size={19} />
                  Convert to PDF
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