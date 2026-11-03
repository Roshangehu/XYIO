import React, { useState } from "react";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  FileText,
  Upload,
  Download,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";
import "./PDFToWord.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PDFToWord() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFile = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    if (selected.type !== "application/pdf") {
      setMessage("Please select a valid PDF file.");
      return;
    }

    setFile(selected);
    setMessage("");
  };

  const convertPDF = async () => {
    if (!file) return;

    setLoading(true);
    setMessage("");

    try {
      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      }).promise;

      const paragraphs = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .filter((item) => item.str !== undefined)
          .map((item) => item.str)
          .join(" ");

        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: pageText || " ",
                size: 22,
              }),
            ],
            spacing: {
              after: 200,
            },
          })
        );
      }

      const doc = new Document({
        sections: [
          {
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);

      const outputName = file.name.replace(/\.pdf$/i, "") + ".docx";

      saveAs(blob, outputName);

      setMessage("Your Word document is ready!");
    } catch (error) {
      console.error(error);
      setMessage("Conversion failed. Please try another PDF.");
    }

    setLoading(false);
  };

  return (
    <div className="pdf-word-page">
      <div className="pdf-word-container">

        <div className="pdf-word-heading">
          <div className="pdf-word-icon">
            <FileText size={30} />
          </div>

          <h1>PDF to Word</h1>

          <p>
            Convert your PDF files into editable Word documents.
            Fast, free, and secure.
          </p>
        </div>

        <div className="pdf-word-upload">

          {!file ? (
            <label className="pdf-word-dropzone">
              <Upload size={42} />

              <h3>Choose a PDF file</h3>

              <p>Drag and drop your PDF here or browse files</p>

              <span className="pdf-word-browse">
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
            <div className="pdf-word-file">
              <FileText size={35} />

              <div className="pdf-word-file-info">
                <h3>{file.name}</h3>
                <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>

              <button
                className="pdf-word-remove"
                onClick={() => {
                  setFile(null);
                  setMessage("");
                }}
              >
                <X size={20} />
              </button>
            </div>
          )}

          {file && (
            <button
              className="pdf-word-convert"
              onClick={convertPDF}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="pdf-word-spin" size={19} />
                  Converting...
                </>
              ) : (
                <>
                  <Download size={19} />
                  Convert to Word
                </>
              )}
            </button>
          )}

          {message && (
            <div className="pdf-word-message">
              {message.includes("ready") && (
                <CheckCircle size={18} />
              )}
              {message}
            </div>
          )}

        </div>

        <div className="pdf-word-info">
          <h2>How it works</h2>

          <div className="pdf-word-steps">
            <div>
              <span>01</span>
              <h3>Upload PDF</h3>
              <p>Select the PDF you want to convert.</p>
            </div>

            <div>
              <span>02</span>
              <h3>Convert</h3>
              <p>We extract the readable text from your PDF.</p>
            </div>

            <div>
              <span>03</span>
              <h3>Download</h3>
              <p>Get your editable Word document.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}