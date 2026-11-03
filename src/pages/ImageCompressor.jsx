import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Download,
  Image as ImageIcon,
  X,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Minimize2,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./ImageCompressor.css";

export default function ImageCompressor() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [quality, setQuality] = useState(70);
  const [compressedUrl, setCompressedUrl] = useState("");
  const [compressedSize, setCompressedSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, [preview, compressedUrl]);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!supportedTypes.includes(selectedFile.type)) {
      setMessage("Please select a JPG, PNG or WebP image.");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setCompressedUrl("");
    setCompressedSize(0);
    setMessage("");
  };

  const compressImage = () => {
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

      // Preserve transparency for PNG and WebP.
      // JPEG output uses a white background.
      if (file.type === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(image, 0, 0);

      const outputType =
        file.type === "image/png" ? "image/png" : "image/jpeg";

      const outputQuality =
        outputType === "image/png" ? undefined : quality / 100;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setMessage("Compression failed. Please try again.");
            setLoading(false);
            return;
          }

          const url = URL.createObjectURL(blob);

          setCompressedUrl(url);
          setCompressedSize(blob.size);

          if (blob.size >= file.size) {
            setMessage(
              "Compression completed, but the output is not smaller. Try lowering quality or use another format."
            );
          } else {
            setMessage("Image compressed successfully!");
          }

          setLoading(false);
        },
        outputType,
        outputQuality,
      );
    };

    image.onerror = () => {
      setMessage("Unable to load this image.");
      setLoading(false);
    };

    image.src = preview;
  };

  const downloadImage = () => {
    if (!compressedUrl || !file) return;

    const extension =
      file.type === "image/png" ? "png" : "jpg";

    const filename =
      file.name.replace(/\.[^/.]+$/, "") + "-compressed." + extension;

    const link = document.createElement("a");

    link.href = compressedUrl;
    link.download = filename;
    link.click();
  };

  const removeFile = () => {
    setFile(null);
    setPreview("");
    setCompressedUrl("");
    setCompressedSize(0);
    setMessage("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const reduction =
    file && compressedSize
      ? ((file.size - compressedSize) / file.size) * 100
      : 0;

  return (
    <div className="image-compressor-page">
      <div className="ic-container">

        <Link to="/" className="ic-back">
          <ArrowLeft size={17} /> Back to XYLO
        </Link>

        <div className="ic-heading">
          <span className="ic-icon">
            <Minimize2 size={27} />
          </span>

          <span className="ic-label">IMAGE OPTIMIZATION</span>

          <h1>Image Compressor</h1>

          <p>
            Reduce image file sizes while maintaining visual quality.
            Free, secure and processed directly in your browser.
          </p>
        </div>

        <div className="ic-card">

          {!file ? (
            <div
              className="ic-upload"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files[0]);
              }}
            >
              <Upload size={38} />

              <h3>Drop your image here</h3>

              <p>or click to browse files</p>

              <button type="button">
                Choose Image
              </button>

              <small>Supported: JPG, PNG, WebP</small>

              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="ic-workspace">

              <div className="ic-file-header">
                <div>
                  <ImageIcon size={21} />

                  <div>
                    <strong>{file.name}</strong>
                    <small>{formatSize(file.size)}</small>
                  </div>
                </div>

                <button onClick={removeFile} aria-label="Remove image">
                  <X size={19} />
                </button>
              </div>

              <div className="ic-preview">
                <img src={preview} alt="Original image preview" />
              </div>

              <div className="ic-quality">
                <label>
                  Compression Quality
                  <strong>{quality}%</strong>
                </label>

                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => {
                    setQuality(Number(e.target.value));
                    setCompressedUrl("");
                    setCompressedSize(0);
                    setMessage("");
                  }}
                  disabled={loading}
                />

                <div>
                  <span>Smaller file</span>
                  <span>Better quality</span>
                </div>
              </div>

              <button
                className="ic-compress-button"
                onClick={compressImage}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="ic-spin" size={19} />
                    Compressing...
                  </>
                ) : (
                  <>
                    <Minimize2 size={19} />
                    Compress Image
                  </>
                )}
              </button>

              {compressedUrl && (
                <div className="ic-result">

                  <h3>
                    <CheckCircle size={19} />
                    Compression Result
                  </h3>

                  <div className="ic-stats">
                    <div>
                      <span>Original Size</span>
                      <strong>{formatSize(file.size)}</strong>
                    </div>

                    <div>
                      <span>Compressed Size</span>
                      <strong>{formatSize(compressedSize)}</strong>
                    </div>

                    <div>
                      <span>Size Change</span>
                      <strong>
                        {reduction > 0
                          ? `${reduction.toFixed(1)}% smaller`
                          : `${Math.abs(reduction).toFixed(1)}% larger`}
                      </strong>
                    </div>
                  </div>

                  <button
                    className="ic-download-button"
                    onClick={downloadImage}
                  >
                    <Download size={19} />
                    Download Compressed Image
                  </button>

                </div>
              )}

            </div>
          )}

          {message && (
            <div className="ic-message">
              {compressedUrl && <CheckCircle size={17} />}
              {message}
            </div>
          )}

        </div>

        <div className="ic-info">
          <h2>How to compress images</h2>

          <div>
            <span>01</span>
            <p>Upload your image.</p>
          </div>

          <div>
            <span>02</span>
            <p>Adjust the compression quality.</p>
          </div>

          <div>
            <span>03</span>
            <p>Compress and download your image.</p>
          </div>
        </div>

        <div className="ic-privacy">
          Your images are processed locally in your browser.
          They are not uploaded to our servers.
        </div>

      </div>
    </div>
  );
}