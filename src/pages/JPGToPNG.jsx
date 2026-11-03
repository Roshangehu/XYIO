import React, { useState, useRef } from "react";
import {
  Upload,
  Download,
  Image as ImageIcon,
  X,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./JPGToPNG.css";

export default function JPGToPNG() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [convertedUrl, setConvertedUrl] = useState("");

  const inputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!["image/jpeg", "image/jpg"].includes(selectedFile.type)) {
      setMessage("Please select a valid JPG image.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setConvertedUrl("");
    setMessage("");
  };

  const convertImage = () => {
    if (!file || !preview) return;

    setLoading(true);
    setMessage("");

    const image = new window.Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setMessage("Unable to process this image.");
        setLoading(false);
        return;
      }

      ctx.drawImage(image, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setMessage("Conversion failed. Please try again.");
            setLoading(false);
            return;
          }

          const url = URL.createObjectURL(blob);

          setConvertedUrl(url);
          setMessage("Image converted successfully!");
          setLoading(false);
        },
        "image/png",
      );
    };

    image.onerror = () => {
      setMessage("Unable to process this image.");
      setLoading(false);
    };

    image.src = preview;
  };

  const downloadImage = () => {
    if (!convertedUrl || !file) return;

    const link = document.createElement("a");

    link.href = convertedUrl;
    link.download = `${file.name.replace(/\.(jpe?g)$/i, "")}.png`;

    link.click();
  };

  const removeFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);

    setFile(null);
    setPreview("");
    setConvertedUrl("");
    setMessage("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="jpg-png-page">
      <div className="jpg-png-container">

        <Link to="/" className="jpg-png-back">
          <ArrowLeft size={17} /> Back to XYLO
        </Link>

        <div className="jpg-png-heading">
          <span className="jpg-png-icon">
            <ImageIcon size={28} />
          </span>

          <span className="jpg-png-label">IMAGE CONVERTER</span>

          <h1>JPG to PNG Converter</h1>

          <p>
            Convert JPG images into high-quality PNG files.
            Free, secure and processed directly in your browser.
          </p>
        </div>

        <div className="jpg-png-card">

          {!file ? (
            <div
              className="jpg-png-upload"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files[0]);
              }}
            >
              <Upload size={38} />

              <h3>Drop your JPG image here</h3>

              <p>or click to browse files</p>

              <button type="button">
                Choose JPG Image
              </button>

              <small>Supported formats: JPG, JPEG</small>

              <input
                ref={inputRef}
                type="file"
                accept=".jpg,.jpeg,image/jpeg"
                hidden
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="jpg-png-workspace">

              <div className="jpg-png-file-header">
                <div>
                  <ImageIcon size={20} />

                  <div>
                    <strong>{file.name}</strong>
                    <small>
                      {(file.size / 1024).toFixed(2)} KB
                    </small>
                  </div>
                </div>

                <button onClick={removeFile} aria-label="Remove image">
                  <X size={19} />
                </button>
              </div>

              <div className="jpg-png-preview">
                <img src={preview} alt="JPG preview" />
              </div>

              {!convertedUrl ? (
                <button
                  className="jpg-png-convert"
                  onClick={convertImage}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="spin" size={19} />
                      Converting...
                    </>
                  ) : (
                    "Convert to PNG"
                  )}
                </button>
              ) : (
                <button
                  className="jpg-png-download"
                  onClick={downloadImage}
                >
                  <Download size={19} />
                  Download PNG
                </button>
              )}
            </div>
          )}

          {message && (
            <div className="jpg-png-message">
              {convertedUrl && <CheckCircle size={17} />}
              {message}
            </div>
          )}

        </div>

        <div className="jpg-png-info">
          <h2>How to convert JPG to PNG</h2>

          <div>
            <span>01</span>
            <p>Upload your JPG image.</p>
          </div>

          <div>
            <span>02</span>
            <p>Convert it into PNG format.</p>
          </div>

          <div>
            <span>03</span>
            <p>Download your converted PNG image.</p>
          </div>
        </div>

        <div className="jpg-png-privacy">
          Your images are processed locally in your browser.
          They are not uploaded to our servers.
        </div>

      </div>
    </div>
  );
}