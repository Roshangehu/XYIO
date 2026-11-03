import React, { useState, useRef } from "react";
import {
FileText,
Upload,
Download,
Loader2,
CheckCircle,
X,
} from "lucide-react";
import "./WordToPDF.css";

export default function WordToPDF() {
const [file, setFile] = useState(null);
const [htmlContent, setHtmlContent] = useState("");
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const contentRef = useRef(null);

const handleFile = async (e) => {
const selected = e.target.files[0];


if (!selected) return;

if (!selected.name.toLowerCase().endsWith(".docx")) {
  setMessage("Please select a valid DOCX file.");
  e.target.value = "";
  return;
}

setFile(selected);
setHtmlContent("");
setMessage("");
setLoading(true);

try {
  // Load Mammoth only when a DOCX file is uploaded
  const mammoth = await import("mammoth");

  const arrayBuffer = await selected.arrayBuffer();

  const result = await mammoth.convertToHtml({
    arrayBuffer,
  });

  setHtmlContent(result.value);

  if (!result.value.trim()) {
    setMessage("No readable content found in this document.");
  }
} catch (error) {
  console.error(error);
  setMessage("Unable to read this Word document.");
  setFile(null);
  setHtmlContent("");
} finally {
  setLoading(false);
  e.target.value = "";
}


};

const convertToPDF = async () => {
if (!contentRef.current || !file) return;


setLoading(true);
setMessage("");

try {
  // Load html2pdf only when conversion is requested
  const html2pdfModule = await import("html2pdf.js");
  const html2pdf = html2pdfModule.default;

  const options = {
    margin: [12, 12, 12, 12],
    filename: file.name.replace(/\.docx$/i, ".pdf"),
    image: {
      type: "jpeg",
      quality: 0.98,
    },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
    pagebreak: {
      mode: ["css", "legacy"],
    },
  };

  await html2pdf()
    .set(options)
    .from(contentRef.current)
    .save();

  setMessage("PDF downloaded successfully!");
} catch (error) {
  console.error(error);
  setMessage("Conversion failed. Please try again.");
} finally {
  setLoading(false);
}


};

const removeFile = () => {
setFile(null);
setHtmlContent("");
setMessage("");
};

return ( <div className="word-pdf-page"> <div className="word-pdf-container"> <div className="word-pdf-heading"> <div className="word-pdf-icon"> <FileText size={30} /> </div>


      <h1>Word to PDF</h1>

      <p>
        Convert your Word documents into PDF files.
        Simple, fast, and secure.
      </p>
    </div>

    <div className="word-pdf-upload">
      {!file ? (
        <label className="word-pdf-dropzone">
          <Upload size={42} />

          <h3>Choose a Word document</h3>

          <p>Upload your DOCX file to get started</p>

          <span className="word-pdf-browse">
            Select DOCX
          </span>

          <input
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFile}
            hidden
          />
        </label>
      ) : (
        <div className="word-pdf-file">
          <FileText size={35} />

          <div className="word-pdf-file-info">
            <h3>{file.name}</h3>
            <p>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>

          <button
            className="word-pdf-remove"
            onClick={removeFile}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>
      )}

      {file && (
        <button
          className="word-pdf-convert"
          onClick={convertToPDF}
          disabled={loading || !htmlContent}
        >
          {loading ? (
            <>
              <Loader2 className="word-pdf-spin" size={19} />
              Processing...
            </>
          ) : (
            <>
              <Download size={19} />
              Convert to PDF
            </>
          )}
        </button>
      )}

      {message && (
        <div className="word-pdf-message">
          {message.includes("successfully") && (
            <CheckCircle size={18} />
          )}
          {message}
        </div>
      )}
    </div>

    {htmlContent && (
      <div className="word-pdf-preview-section">
        <h2>Document Preview</h2>

        <div className="word-pdf-preview">
          <div
            ref={contentRef}
            className="word-pdf-document"
            dangerouslySetInnerHTML={{
              __html: htmlContent,
            }}
          />
        </div>
      </div>
    )}

    <div className="word-pdf-info">
      <h2>How it works</h2>

      <div className="word-pdf-steps">
        <div>
          <span>01</span>
          <h3>Upload DOCX</h3>
          <p>Select your Word document.</p>
        </div>

        <div>
          <span>02</span>
          <h3>Preview</h3>
          <p>Review the extracted document content.</p>
        </div>

        <div>
          <span>03</span>
          <h3>Download PDF</h3>
          <p>Convert and save your PDF file.</p>
        </div>
      </div>
    </div>
  </div>
</div>


);
}
