import { useEffect, useState } from "react";
import {
  Upload,
  Download,
  Scissors,
  X,
  RefreshCw,
} from "lucide-react";
import "./ImageCropper.css";

export default function ImageCropper() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [croppedUrl, setCroppedUrl] = useState("");
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);

  const [quality, setQuality] = useState(90);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    };
  }, [preview, croppedUrl]);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(selectedFile.type)) {
      setError("Please select a JPG, PNG, or WebP image.");
      return;
    }

    setError("");
    setFile(selectedFile);
    setCroppedUrl("");

    const url = URL.createObjectURL(selectedFile);
    setPreview(url);

    const image = new window.Image();

    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;

      setImageWidth(width);
      setImageHeight(height);
      setCropX(0);
      setCropY(0);
      setCropWidth(width);
      setCropHeight(height);
    };

    image.onerror = () => {
      setError("Unable to load this image.");
    };

    image.src = url;
  };

  const cropImage = () => {
    if (!file) return;

    const x = Number(cropX);
    const y = Number(cropY);
    const width = Number(cropWidth);
    const height = Number(cropHeight);

    if (
      !Number.isInteger(x) ||
      !Number.isInteger(y) ||
      !Number.isInteger(width) ||
      !Number.isInteger(height) ||
      x < 0 ||
      y < 0 ||
      width <= 0 ||
      height <= 0
    ) {
      setError("Enter valid crop dimensions and positions.");
      return;
    }

    if (x + width > imageWidth || y + height > imageHeight) {
      setError("The crop area must remain inside the original image.");
      return;
    }

    if (width * height > 40000000) {
      setError("Crop area is too large. Try smaller dimensions.");
      return;
    }

    setError("");
    setLoading(true);
    setCroppedUrl("");

    const image = new window.Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        setError("Your browser could not process this image.");
        setLoading(false);
        return;
      }

      context.drawImage(
        image,
        x,
        y,
        width,
        height,
        0,
        0,
        width,
        height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Unable to crop this image.");
            setLoading(false);
            return;
          }

          setCroppedUrl(URL.createObjectURL(blob));
          setLoading(false);
        },
        file.type,
        quality / 100
      );
    };

    image.onerror = () => {
      setError("Unable to process this image.");
      setLoading(false);
    };

    image.src = preview;
  };

  const resetCrop = () => {
    setCropX(0);
    setCropY(0);
    setCropWidth(imageWidth);
    setCropHeight(imageHeight);
    setCroppedUrl("");
    setError("");
  };

  const removeFile = () => {
    setFile(null);
    setPreview("");
    setCroppedUrl("");
    setImageWidth(0);
    setImageHeight(0);
    setCropX(0);
    setCropY(0);
    setCropWidth(0);
    setCropHeight(0);
    setError("");
  };

  const downloadImage = () => {
    if (!croppedUrl || !file) return;

    const extension =
      file.type === "image/jpeg"
        ? "jpg"
        : file.type === "image/png"
        ? "png"
        : "webp";

    const link = document.createElement("a");
    link.href = croppedUrl;
    link.download = `xylo-cropped.${extension}`;
    link.click();
  };

  return (
    <div className="ic-page">
      <div className="ic-container">
        <header className="ic-header">
          <div className="ic-icon">
            <Scissors size={26} />
          </div>

          <h1>Image Cropper</h1>

          <p>
            Crop your images by selecting the exact area you want to keep.
            Everything happens directly in your browser.
          </p>
        </header>

        {!file ? (
          <label className="ic-upload">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => handleFile(e.target.files[0])}
            />

            <Upload size={38} />
            <h3>Upload an Image</h3>
            <p>Click to browse or select an image from your device</p>
            <span>Supports JPG, PNG and WebP</span>
          </label>
        ) : (
          <div className="ic-workspace">
            <section className="ic-panel">
              <div className="ic-panel-heading">
                <h3>Original Image</h3>

                <button className="ic-remove" onClick={removeFile}>
                  <X size={16} />
                  Remove
                </button>
              </div>

              <div className="ic-preview">
                <img src={preview} alt="Original" />
              </div>

              <p className="ic-image-info">
                Original dimensions: {imageWidth} × {imageHeight} px
              </p>
            </section>

            <section className="ic-panel">
              <h3 className="ic-settings-title">Crop Settings</h3>

              <div className="ic-fields">
                <div className="ic-field">
                  <label>X Position (px)</label>
                  <input
                    type="number"
                    min="0"
                    value={cropX}
                    onChange={(e) => setCropX(e.target.value)}
                  />
                </div>

                <div className="ic-field">
                  <label>Y Position (px)</label>
                  <input
                    type="number"
                    min="0"
                    value={cropY}
                    onChange={(e) => setCropY(e.target.value)}
                  />
                </div>

                <div className="ic-field">
                  <label>Crop Width (px)</label>
                  <input
                    type="number"
                    min="1"
                    value={cropWidth}
                    onChange={(e) => setCropWidth(e.target.value)}
                  />
                </div>

                <div className="ic-field">
                  <label>Crop Height (px)</label>
                  <input
                    type="number"
                    min="1"
                    value={cropHeight}
                    onChange={(e) => setCropHeight(e.target.value)}
                  />
                </div>
              </div>

              {file.type !== "image/png" && (
                <div className="ic-quality">
                  <div>
                    <label>Output Quality</label>
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

              <div className="ic-actions">
                <button className="ic-reset" onClick={resetCrop}>
                  <RefreshCw size={16} />
                  Reset
                </button>

                <button
                  className="ic-crop-btn"
                  onClick={cropImage}
                  disabled={loading}
                >
                  <Scissors size={17} />
                  {loading ? "Cropping..." : "Crop Image"}
                </button>
              </div>

              {error && <p className="ic-error">{error}</p>}

              <p className="ic-hint">
                X and Y define the starting point of your crop area. Width and
                height define how much of the image to keep.
              </p>
            </section>

            {croppedUrl && (
              <section className="ic-panel ic-result">
                <div className="ic-panel-heading">
                  <h3>Cropped Image</h3>
                  <span className="ic-success">Ready</span>
                </div>

                <div className="ic-preview ic-result-preview">
                  <img src={croppedUrl} alt="Cropped result" />
                </div>

                <p className="ic-image-info">
                  Cropped dimensions: {cropWidth} × {cropHeight} px
                </p>

                <button className="ic-download" onClick={downloadImage}>
                  <Download size={18} />
                  Download Cropped Image
                </button>
              </section>
            )}
          </div>
        )}

        <footer className="ic-footer">
          <span>🔒 100% Private</span>
          <span>Free to use</span>
          <span>No file uploads</span>
        </footer>
      </div>
    </div>
  );
}