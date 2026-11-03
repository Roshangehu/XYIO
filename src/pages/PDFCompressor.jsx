import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import {
  Upload,
  FileText,
  Download,
  X,
  Zap,
  CheckCircle,
  FileDown
} from "lucide-react";

import "./PDFCompressor.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function PDFCompressor() {
  const [file, setFile] = useState(null);
  const [level, setLevel] = useState("balanced");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const compressionSettings = {
    light: {
      scale: 1.5,
      quality: 0.85,
      label: "Light"
    },
    balanced: {
      scale: 1.2,
      quality: 0.65,
      label: "Recommended"
    },
    strong: {
      scale: 0.9,
      quality: 0.45,
      label: "Strong"
    }
  };

  const handleFile = (e) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      alert("Please select a valid PDF file.");
      return;
    }

    setFile(selected);
    setResult(null);
    setProgress(0);

    e.target.value = "";
  };

  const compressPDF = async () => {
    if (!file) return;

    let pdfDocument = null;

    try {
      setLoading(true);
      setProgress(0);
      setResult(null);

      const settings = compressionSettings[level];

      const bytes = await file.arrayBuffer();

      pdfDocument = await pdfjsLib.getDocument({
        data: new Uint8Array(bytes)
      }).promise;

      const compressedPDF = await PDFDocument.create();

      const totalPages = pdfDocument.numPages;

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        const page = await pdfDocument.getPage(pageNumber);

        const viewport = page.getViewport({
          scale: settings.scale
        });

        const canvas = document.createElement("canvas");

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Unable to create canvas.");
        }

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        await page.render({
          canvasContext: context,
          viewport
        }).promise;

        const imageBlob = await new Promise((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Image compression failed."));
            },
            "image/jpeg",
            settings.quality
          );
        });

        const imageBytes = await imageBlob.arrayBuffer();

        const embeddedImage = await compressedPDF.embedJpg(imageBytes);

        const pdfPage = compressedPDF.addPage([
          embeddedImage.width,
          embeddedImage.height
        ]);

        pdfPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height
        });

        canvas.width = 0;
        canvas.height = 0;

        page.cleanup();

        setProgress(Math.round((pageNumber / totalPages) * 100));
      }

      const outputBytes = await compressedPDF.save({
        useObjectStreams: true
      });

      const blob = new Blob([outputBytes], {
        type: "application/pdf"
      });

      const originalSize = file.size;
      const compressedSize = blob.size;

      const savedBytes = originalSize - compressedSize;

      const savedPercentage = Math.max(
        0,
        ((savedBytes / originalSize) * 100)
      );

      setResult({
        blob,
        originalSize,
        compressedSize,
        savedPercentage
      });

    } catch (error) {
      console.error(error);

      alert(
        error?.message ||
        "Unable to compress this PDF. Please try another file."
      );

    } finally {
      if (pdfDocument) {
        await pdfDocument.destroy();
      }

      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!result) return;

    const url = URL.createObjectURL(result.blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "xylo-compressed.pdf";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const formatSize = (bytes) => {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(2)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="compressor-page">

      <div className="compressor-container">

        <div className="compressor-heading">

          <span className="tool-label">ADVANCED PDF TOOLS</span>

          <h1>Compress PDF</h1>

          <p>
            Reduce your PDF file size and make documents
            easier to share, upload and store.
          </p>

        </div>

        {!file ? (

          <div className="compress-upload-box">

            <Upload size={42} />

            <h2>Select your PDF file</h2>

            <p>
              Upload the PDF document you want to compress.
            </p>

            <label className="compress-upload-button">

              Choose PDF File

              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFile}
                hidden
              />

            </label>

            <span>
              Your files are processed locally in your browser.
            </span>

          </div>

        ) : (

          <div className="compress-workspace">

            <div className="compress-file-card">

              <FileText size={30} />

              <div>

                <strong>{file.name}</strong>

                <span>
                  Original size: {formatSize(file.size)}
                </span>

              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  setProgress(0);
                }}
                disabled={loading}
                title="Remove file"
              >
                <X />
              </button>

            </div>

            {!result && (

              <div className="compress-options">

                <h2>Choose compression level</h2>

                <p>
                  Select how much you want to reduce your PDF size.
                </p>

                <div className="compression-levels">

                  {Object.entries(compressionSettings).map(
                    ([key, settings]) => (

                      <button
                        key={key}
                        className={
                          level === key
                            ? "compression-active"
                            : ""
                        }
                        onClick={() => setLevel(key)}
                        disabled={loading}
                      >

                        <Zap size={22} />

                        <strong>{settings.label}</strong>

                        <span>
                          {key === "light" && "Better visual quality"}
                          {key === "balanced" && "Good balance of quality and size"}
                          {key === "strong" && "Smaller file size"}
                        </span>

                      </button>

                    )
                  )}

                </div>

                <div className="compression-warning">
                  <strong>Note:</strong> This compression method converts
                  PDF pages into images. Text selection, hyperlinks,
                  forms and some document features will not be preserved.
                </div>

              </div>

            )}

            {loading && (

              <div className="compression-progress">

                <div className="progress-heading">

                  <span>Compressing your PDF...</span>

                  <strong>{progress}%</strong>

                </div>

                <div className="progress-track">

                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />

                </div>

                <p>
                  Please keep this tab open while processing.
                </p>

              </div>

            )}

            {result && (

              <div className="compression-result">

                <CheckCircle size={38} />

                <h2>Compression completed!</h2>

                <p>Your compressed PDF is ready.</p>

                <div className="size-comparison">

                  <div>

                    <span>Original size</span>

                    <strong>
                      {formatSize(result.originalSize)}
                    </strong>

                  </div>

                  <div>

                    <span>New size</span>

                    <strong>
                      {formatSize(result.compressedSize)}
                    </strong>

                  </div>

                </div>

                {result.compressedSize < result.originalSize ? (

                  <div className="saved-info">
                    Saved {result.savedPercentage.toFixed(1)}% space!
                  </div>

                ) : (

                  <div className="saved-info">
                    This PDF could not be reduced further.
                  </div>

                )}

                <button
                  className="compress-download-button"
                  onClick={downloadPDF}
                >
                  <Download size={19} />
                  Download Compressed PDF
                </button>

                <button
                  className="compress-again-button"
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                    setProgress(0);
                  }}
                >
                  Compress Another PDF
                </button>

              </div>

            )}

            {!result && !loading && (

              <button
                className="compress-start-button"
                onClick={compressPDF}
              >

                <FileDown size={20} />

                Compress PDF

              </button>

            )}

          </div>

        )}

      </div>

    </div>
  );
}