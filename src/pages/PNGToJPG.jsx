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
import "./PNGToJPG.css";

export default function PNGToJPG() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [quality, setQuality] = useState(90);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [convertedUrl, setConvertedUrl] = useState("");

  const inputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!["image/png"].includes(selectedFile.type)) {
      setMessage("Please select a valid PNG image.");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setMessage("");
    setConvertedUrl("");
  };

  const convertImage = () => {
    if (!file || !preview) return;

    setLoading(true);
    setMessage("");

    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;

      const ctx = canvas.getContext("2d");

      // JPG does not support transparency.
      // Use white as the background for transparent pixels.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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
        "image/jpeg",
        quality / 100,
      );
    };

    image.onerror = () => {
      setMessage("Unable to process this image.");
      setLoading(false);
    };

    image.src = preview;
  };

  const downloadImage = () => {
    if (!convertedUrl) return;

    const link = document.createElement("a");
    link.href = convertedUrl;
    link.download = `${file.name.replace(/\.png$/i, "")}.jpg`;
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
    <div className="png-jpg-page">
      <div className="png-jpg-container">

        <Link to="/" className="png-jpg-back">
          <ArrowLeft size={17} /> Back to XYLO
        </Link>

        <div className="png-jpg-heading">
          <span className="png-jpg-icon">
            <ImageIcon size={28} />
          </span>

          <span className="png-jpg-label">IMAGE CONVERTER</span>

          <h1>PNG to JPG Converter</h1>

          <p>
            Convert PNG images into JPG format quickly and easily.
            Free, secure and processed directly in your browser.
          </p>
        </div>

        <div className="png-jpg-card">

          {!file ? (
            <div
              className="png-jpg-upload"
              onClick={() => inputRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files[0]);
              }}
            >
              <Upload size={38} />

              <h3>Drop your PNG image here</h3>

              <p>or click to browse files</p>

              <button type="button">
                Choose PNG Image
              </button>

              <small>Supported format: PNG</small>

              <input
                ref={inputRef}
                type="file"
                accept="image/png"
                hidden
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="png-jpg-workspace">

              <div className="png-jpg-file-header">
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

              <div className="png-jpg-preview">
                <img src={preview} alt="PNG preview" />
              </div>

              <div className="png-jpg-quality">
                <label>
                  JPG Quality <strong>{quality}%</strong>
                </label>

                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  disabled={loading || !!convertedUrl}
                />

                <div>
                  <span>Smaller file</span>
                  <span>Better quality</span>
                </div>
              </div>

              {!convertedUrl ? (
                <button
                  className="png-jpg-convert"
                  onClick={convertImage}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="spin" size={19} />
                      Converting...
                    </>
                  ) : (
                    "Convert to JPG"
                  )}
                </button>
              ) : (
                <button
                  className="png-jpg-download"
                  onClick={downloadImage}
                >
                  <Download size={19} />
                  Download JPG
                </button>
              )}
            </div>
          )}

          {message && (
            <div className="png-jpg-message">
              {convertedUrl ? (
                <CheckCircle size={17} />
              ) : null}
              {message}
            </div>
          )}

        </div>

        <div className="png-jpg-info">
          <h2>How to convert PNG to JPG</h2>

          <div>
            <span>01</span>
            <p>Upload your PNG image.</p>
          </div>

          <div>
            <span>02</span>
            <p>Choose your preferred JPG quality.</p>
          </div>

          <div>
            <span>03</span>
            <p>Convert and download your JPG image.</p>
          </div>
        </div>

        <div className="png-jpg-privacy">
          Your images are processed locally in your browser.
          They are not uploaded to our servers.
        </div>

      </div>
    </div>
  );
}