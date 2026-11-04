import { useState } from "react";
import {
  Upload,
  Copy,
  Download,
  Image as ImageIcon,
  Check,
  X,
} from "lucide-react";
import "./ImageToBase64.css";

export default function ImageToBase64() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [base64, setBase64] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const fileName = file?.name || "image";

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setError("");
    setFile(selectedFile);
    setBase64("");
    setCopied(false);

    const reader = new FileReader();

    reader.onload = () => {
      setPreview(reader.result);
      setBase64(reader.result);
    };

    reader.onerror = () => {
      setError("Unable to read this image.");
    };

    reader.readAsDataURL(selectedFile);
  };

  const copyBase64 = async () => {
    try {
      await navigator.clipboard.writeText(base64);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy. Please select and copy the text manually.");
    }
  };

  const downloadBase64 = () => {
    if (!file || !base64) return;

    const blob = new Blob([base64], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${fileName}.txt`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const removeFile = () => {
    setFile(null);
    setPreview("");
    setBase64("");
    setError("");
    setCopied(false);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="ib-page">
      <div className="ib-container">
        <header className="ib-header">
          <div className="ib-icon">
            <ImageIcon size={26} />
          </div>

          <h1>Image to Base64</h1>

          <p>
            Convert your images into Base64 strings for use in HTML, CSS,
            JavaScript, and other applications.
          </p>
        </header>

        {!file ? (
          <label className="ib-upload">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleFile(e.target.files[0])}
            />

            <Upload size={38} />
            <h3>Upload an Image</h3>
            <p>Click to browse or select an image from your device</p>
            <span>Supports common image formats</span>
          </label>
        ) : (
          <div className="ib-workspace">
            <section className="ib-panel">
              <div className="ib-panel-heading">
                <h3>Selected Image</h3>

                <button className="ib-remove" onClick={removeFile}>
                  <X size={16} />
                  Remove
                </button>
              </div>

              <div className="ib-preview">
                <img src={preview} alt="Selected image" />
              </div>

              <div className="ib-file-info">
                <span>{file.name}</span>
                <span>{formatSize(file.size)}</span>
                <span>{file.type || "Unknown format"}</span>
              </div>
            </section>

            <section className="ib-panel ib-output">
              <div className="ib-panel-heading">
                <h3>Base64 Output</h3>
                <span className="ib-badge">Generated</span>
              </div>

              <textarea
                className="ib-textarea"
                value={base64}
                readOnly
                spellCheck="false"
                placeholder="Your Base64 string will appear here..."
              />

              <div className="ib-output-info">
                <span>Characters: {base64.length.toLocaleString()}</span>
                <span>Format: Data URL</span>
              </div>

              <div className="ib-actions">
                <button
                  className="ib-copy"
                  onClick={copyBase64}
                  disabled={!base64}
                >
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                  {copied ? "Copied!" : "Copy Base64"}
                </button>

                <button
                  className="ib-download"
                  onClick={downloadBase64}
                  disabled={!base64}
                >
                  <Download size={17} />
                  Download TXT
                </button>
              </div>
            </section>

            <section className="ib-usage">
              <h3>How to use Base64 in HTML</h3>

              <pre>
                <code>{`<img src="${base64.slice(0, 45)}..." alt="Image" />`}</code>
              </pre>

              <p>
                Replace the shortened example with the complete Base64 string
                to display your image.
              </p>
            </section>
          </div>
        )}

        {error && <p className="ib-error">{error}</p>}

        <footer className="ib-footer">
          <span>🔒 100% Private</span>
          <span>Free to use</span>
          <span>No file uploads</span>
        </footer>
      </div>
    </div>
  );
}