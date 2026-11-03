import { useEffect, useState } from "react";
import {
  Upload,
  Download,
  Image as ImageIcon,
  RefreshCw,
  X,
  Lock,
  Unlock,
} from "lucide-react";
import "./ImageResizer.css";

export default function ImageResizer() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [resizedUrl, setResizedUrl] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [aspectLocked, setAspectLocked] = useState(true);
  const [quality, setQuality] = useState(90);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [outputSize, setOutputSize] = useState(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (resizedUrl) URL.revokeObjectURL(resizedUrl);
    };
  }, [preview, resizedUrl]);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(selectedFile.type)) {
      setError("Please select a JPG, PNG, or WebP image.");
      return;
    }

    setError("");
    setFile(selectedFile);
    setResizedUrl("");
    setOutputSize(null);

    const imageUrl = URL.createObjectURL(selectedFile);
    setPreview(imageUrl);

    const image = new window.Image();

    image.onload = () => {
      setOriginalWidth(image.naturalWidth);
      setOriginalHeight(image.naturalHeight);
      setWidth(image.naturalWidth);
      setHeight(image.naturalHeight);
    };

    image.onerror = () => {
      setError("Unable to load this image.");
    };

    image.src = imageUrl;
  };

  const handleWidthChange = (value) => {
    setWidth(value);

    if (aspectLocked && originalWidth > 0 && value !== "") {
      const newHeight = Math.round(
        (Number(value) / originalWidth) * originalHeight
      );
      setHeight(newHeight);
    }
  };

  const handleHeightChange = (value) => {
    setHeight(value);

    if (aspectLocked && originalHeight > 0 && value !== "") {
      const newWidth = Math.round(
        (Number(value) / originalHeight) * originalWidth
      );
      setWidth(newWidth);
    }
  };

  const resizeImage = () => {
    if (!file) return;

    const newWidth = Number(width);
    const newHeight = Number(height);

    if (
      !Number.isInteger(newWidth) ||
      !Number.isInteger(newHeight) ||
      newWidth <= 0 ||
      newHeight <= 0
    ) {
      setError("Enter valid positive width and height values.");
      return;
    }

    if (newWidth > 10000 || newHeight > 10000) {
      setError("Maximum allowed width or height is 10,000 pixels.");
      return;
    }

    if (newWidth * newHeight > 40000000) {
      setError("Image dimensions are too large. Try smaller dimensions.");
      return;
    }

    setError("");
    setLoading(true);
    setResizedUrl("");

    const image = new window.Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        setError("Your browser could not process this image.");
        setLoading(false);
        return;
      }

      if (file.type === "image/jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, newWidth, newHeight);
      }

      context.drawImage(image, 0, 0, newWidth, newHeight);

      const outputType = file.type;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Unable to resize this image.");
            setLoading(false);
            return;
          }

          const url = URL.createObjectURL(blob);
          setResizedUrl(url);
          setOutputSize(blob.size);
          setLoading(false);
        },
        outputType,
        quality / 100
      );
    };

    image.onerror = () => {
      setError("Unable to process this image.");
      setLoading(false);
    };

    image.src = preview;
  };

  const downloadImage = () => {
    if (!resizedUrl || !file) return;

    const extension =
      file.type === "image/jpeg"
        ? "jpg"
        : file.type === "image/png"
        ? "png"
        : "webp";

    const link = document.createElement("a");
    link.href = resizedUrl;
    link.download = `xylo-resized.${extension}`;
    link.click();
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const removeFile = () => {
    setFile(null);
    setPreview("");
    setResizedUrl("");
    setWidth("");
    setHeight("");
    setOriginalWidth(0);
    setOriginalHeight(0);
    setOutputSize(null);
    setError("");
  };

  return (
    <div className="ir-page">
      <div className="ir-container">
        <div className="ir-header">
          <div className="ir-icon">
            <ImageIcon size={26} />
          </div>

          <h1>Image Resizer</h1>

          <p>
            Resize images to your preferred dimensions without installing
            anything. Your files stay on your device.
          </p>
        </div>

        {!file ? (
          <label className="ir-upload">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFile(e.target.files[0])}
              hidden
            />

            <Upload size={38} />

            <h3>Upload an Image</h3>
            <p>Click to browse or select an image from your device</p>
            <span>Supports JPG, PNG and WebP</span>
          </label>
        ) : (
          <div className="ir-workspace">
            <div className="ir-preview-section">
              <div className="ir-section-heading">
                <h3>Original Image</h3>

                <button className="ir-remove" onClick={removeFile}>
                  <X size={16} />
                  Remove
                </button>
              </div>

              <div className="ir-image-preview">
                <img src={preview} alt="Original" />
              </div>

              <div className="ir-original-info">
                <span>{file.name}</span>
                <span>
                  {originalWidth} × {originalHeight} px
                </span>
                <span>{formatSize(file.size)}</span>
              </div>
            </div>

            <div className="ir-settings">
              <h3>Resize Settings</h3>

              <div className="ir-dimensions">
                <div className="ir-input-group">
                  <label>Width (px)</label>
                  <input
                    type="number"
                    min="1"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                  />
                </div>

                <button
                  className={`ir-lock ${aspectLocked ? "active" : ""}`}
                  onClick={() => setAspectLocked(!aspectLocked)}
                  title={
                    aspectLocked
                      ? "Unlock aspect ratio"
                      : "Lock aspect ratio"
                  }
                >
                  {aspectLocked ? <Lock size={18} /> : <Unlock size={18} />}
                </button>

                <div className="ir-input-group">
                  <label>Height (px)</label>
                  <input
                    type="number"
                    min="1"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                  />
                </div>
              </div>

              <p className="ir-hint">
                {aspectLocked
                  ? "Aspect ratio is locked. Changing one dimension updates the other."
                  : "Aspect ratio is unlocked. You can set both dimensions independently."}
              </p>

              {file.type !== "image/png" && (
                <div className="ir-quality">
                  <div className="ir-quality-heading">
                    <label>Image Quality</label>
                    <strong>{quality}%</strong>
                  </div>

                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                  />
                </div>
              )}

              <button
                className="ir-resize-btn"
                onClick={resizeImage}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="ir-spin" />
                    Resizing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={18} />
                    Resize Image
                  </>
                )}
              </button>

              {error && <p className="ir-error">{error}</p>}
            </div>

            {resizedUrl && (
              <div className="ir-result">
                <div className="ir-section-heading">
                  <h3>Resized Image</h3>
                  <span className="ir-success">Ready to download</span>
                </div>

                <div className="ir-image-preview">
                  <img src={resizedUrl} alt="Resized" />
                </div>

                <div className="ir-result-info">
                  <span>
                    {width} × {height} px
                  </span>
                  <span>{formatSize(outputSize)}</span>
                </div>

                <button className="ir-download" onClick={downloadImage}>
                  <Download size={18} />
                  Download Resized Image
                </button>
              </div>
            )}
          </div>
        )}

        <div className="ir-footer">
          <span>🔒 100% Private</span>
          <span>Free to use</span>
          <span>No file uploads</span>
        </div>
      </div>
    </div>
  );
}