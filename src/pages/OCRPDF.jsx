import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { createWorker } from "tesseract.js";

import {
  FileSearch,
  Upload,
  Download,
  Copy,
  Check,
  Loader2,
  FileText,
  X,
  ScanText,
} from "lucide-react";

import "./OCRPDF.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function OCRPDF() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFile = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    if (selected.type !== "application/pdf") {
      setMessage("Please select a valid PDF file.");
      return;
    }

    setFile(selected);
    setExtractedText("");
    setProgress(0);
    setMessage("");
  };

  const performOCR = async () => {
    if (!file) return;

    setLoading(true);
    setProgress(0);
    setMessage("");
    setExtractedText("");

    let worker;

    try {
      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      }).promise;

      worker = await createWorker("eng", 1, {
        logger: (info) => {
          if (info.status === "recognizing text") {
            setProgress(Math.round(info.progress * 100));
          }
        },
      });

      let completeText = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        setMessage(`Processing page ${pageNum} of ${pdf.numPages}...`);

        const page = await pdf.getPage(pageNum);

        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        const result = await worker.recognize(canvas);

        completeText +=
          `\n\n--- Page ${pageNum} ---\n\n` +
          result.data.text;

        setExtractedText(completeText);

        setProgress(
          Math.round((pageNum / pdf.numPages) * 100)
        );
      }

      setMessage("OCR completed successfully!");
    } catch (error) {
      console.error(error);
      setMessage("OCR failed. Please try another PDF.");
    } finally {
      if (worker) {
        await worker.terminate();
      }

      setLoading(false);
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage("Unable to copy text.");
    }
  };

  const downloadText = () => {
    if (!extractedText) return;

    const blob = new Blob([extractedText], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = file.name.replace(/\.pdf$/i, "") + "-ocr.txt";

    link.click();

    URL.revokeObjectURL(url);
  };

  const removeFile = () => {
    setFile(null);
    setExtractedText("");
    setProgress(0);
    setMessage("");
    setCopied(false);
  };

  return (
    <div className="ocr-page">
      <div className="ocr-container">

        <div className="ocr-heading">
          <div className="ocr-icon">
            <ScanText size={30} />
          </div>

          <h1>OCR PDF</h1>

          <p>
            Extract readable text from scanned PDFs and image-based
            documents.
          </p>
        </div>

        <div className="ocr-upload-card">

          {!file ? (
            <label className="ocr-dropzone">
              <Upload size={42} />

              <h3>Upload your PDF</h3>

              <p>
                Choose a scanned or image-based PDF to extract text.
              </p>

              <span className="ocr-browse">
                Select PDF
              </span>

              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFile}
                hidden
              />
            </label>
          ) : (
            <div className="ocr-file">
              <FileText size={35} />

              <div className="ocr-file-info">
                <h3>{file.name}</h3>
                <p>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <button
                className="ocr-remove"
                onClick={removeFile}
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
          )}

          {file && (
            <button
              className="ocr-start-button"
              onClick={performOCR}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="ocr-spin" size={19} />
                  Extracting Text...
                </>
              ) : (
                <>
                  <FileSearch size={19} />
                  Extract Text
                </>
              )}
            </button>
          )}

          {loading && (
            <div className="ocr-progress-section">
              <div className="ocr-progress-info">
                <span>Processing PDF</span>
                <span>{progress}%</span>
              </div>

              <div className="ocr-progress-track">
                <div
                  className="ocr-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p>{message}</p>
            </div>
          )}

          {!loading && message && (
            <div className="ocr-message">
              {message}
            </div>
          )}

        </div>

        {extractedText && (
          <div className="ocr-result-card">

            <div className="ocr-result-header">
              <div>
                <h2>Extracted Text</h2>
                <p>
                  Your OCR results are ready.
                </p>
              </div>

              <div className="ocr-result-actions">
                <button onClick={copyText}>
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                  {copied ? "Copied" : "Copy"}
                </button>

                <button onClick={downloadText}>
                  <Download size={17} />
                  Download TXT
                </button>
              </div>
            </div>

            <textarea
              className="ocr-text-output"
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              spellCheck={false}
            />

          </div>
        )}

        <div className="ocr-info">
          <h2>How OCR works</h2>

          <div className="ocr-steps">

            <div>
              <span>01</span>
              <h3>Upload PDF</h3>
              <p>Select a scanned PDF document.</p>
            </div>

            <div>
              <span>02</span>
              <h3>Recognize Text</h3>
              <p>OCR identifies characters on each page.</p>
            </div>

            <div>
              <span>03</span>
              <h3>Get Results</h3>
              <p>Copy or download the extracted text.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}