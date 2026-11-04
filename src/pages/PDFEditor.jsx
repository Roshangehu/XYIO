import React, { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import {
  FileText,
  Upload,
  Download,
  Pencil,
  Highlighter,
  Type,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Trash2,
} from "lucide-react";

import "./PDFEditor.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PDFEditor() {
  const [file, setFile] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [mode, setMode] = useState("draw");
  const [color, setColor] = useState("#e63946");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const pdfCanvasRef = useRef(null);
  const annotationCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const overlays = useRef({});
  const drawing = useRef(false);

  // Load PDF
  const handleFile = async (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    if (selected.type !== "application/pdf") {
      setMessage("Please select a valid PDF file.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const buffer = await selected.arrayBuffer();

      const loadedPdf = await pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
      }).promise;

      setFile(selected);
      setPdf(loadedPdf);
      setTotalPages(loadedPdf.numPages);
      setPageNumber(1);
      overlays.current = {};
    } catch (error) {
      console.error(error);
      setMessage("Unable to open this PDF.");
    }

    setLoading(false);
  };

  // Render PDF page
  useEffect(() => {
    if (!pdf) return;

    let cancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(pageNumber);

        const viewport = page.getViewport({ scale: 1.4 });

        const pdfCanvas = pdfCanvasRef.current;
        const annotationCanvas = annotationCanvasRef.current;

        if (!pdfCanvas || !annotationCanvas || cancelled) return;

        const context = pdfCanvas.getContext("2d");

        pdfCanvas.width = viewport.width;
        pdfCanvas.height = viewport.height;

        annotationCanvas.width = viewport.width;
        annotationCanvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        if (cancelled) return;

        const savedOverlay = overlays.current[pageNumber];

        const overlayContext = annotationCanvas.getContext("2d");

        overlayContext.clearRect(
          0,
          0,
          annotationCanvas.width,
          annotationCanvas.height
        );

        if (savedOverlay) {
          const image = new Image();

          image.onload = () => {
            if (!cancelled) {
              overlayContext.drawImage(
                image,
                0,
                0,
                annotationCanvas.width,
                annotationCanvas.height
              );
            }
          };

          image.src = savedOverlay;
        }
      } catch (error) {
        console.error(error);
        setMessage("Unable to render this page.");
      }
    };

    renderPage();

    return () => {
      cancelled = true;
    };
  }, [pdf, pageNumber]);

  // Save current page annotations
  const saveOverlay = () => {
    const canvas = annotationCanvasRef.current;

    if (!canvas) return;

    overlays.current[pageNumber] = canvas.toDataURL("image/png");
  };

  // Mouse/touch coordinates
  const getPosition = (e) => {
    const canvas = annotationCanvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  // Start drawing
  const startDrawing = (e) => {
    if (mode === "text") {
      addText(e);
      return;
    }

    drawing.current = true;

    const canvas = annotationCanvasRef.current;
    const context = canvas.getContext("2d");

    const { x, y } = getPosition(e);

    context.beginPath();
    context.moveTo(x, y);

    context.strokeStyle = color;
    context.lineWidth = mode === "highlight" ? 18 : 3;
    context.lineCap = "round";
    context.lineJoin = "round";

    if (mode === "highlight") {
      context.globalAlpha = 0.35;
    } else {
      context.globalAlpha = 1;
    }

    canvas.setPointerCapture(e.pointerId);
  };

  // Continue drawing
  const draw = (e) => {
    if (!drawing.current) return;

    const canvas = annotationCanvasRef.current;
    const context = canvas.getContext("2d");

    const { x, y } = getPosition(e);

    context.lineTo(x, y);
    context.stroke();
  };

  // Stop drawing
  const stopDrawing = () => {
    if (!drawing.current) return;

    drawing.current = false;

    const context = annotationCanvasRef.current.getContext("2d");
    context.globalAlpha = 1;

    saveOverlay();
  };

  // Add text annotation
  const addText = (e) => {
    const text = window.prompt("Enter your text:");

    if (!text) return;

    const canvas = annotationCanvasRef.current;
    const context = canvas.getContext("2d");

    const { x, y } = getPosition(e);

    context.font = "22px Arial";
    context.fillStyle = color;
    context.fillText(text, x, y);

    saveOverlay();
  };

  // Clear current page annotations
  const clearAnnotations = () => {
    const canvas = annotationCanvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);

    delete overlays.current[pageNumber];
  };

  // Navigate pages
  const changePage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    saveOverlay();
    setPageNumber(nextPage);
  };

  // Download edited PDF
  const downloadPDF = async () => {
    if (!file) return;

    setLoading(true);
    setMessage("");

    try {
      saveOverlay();

      const buffer = await file.arrayBuffer();

      const editedPdf = await PDFDocument.load(buffer);

      for (const [pageIndex, imageData] of Object.entries(overlays.current)) {
        const page = editedPdf.getPage(Number(pageIndex) - 1);

        const imageBytes = await fetch(imageData).then((res) =>
          res.arrayBuffer()
        );

        const image = await editedPdf.embedPng(imageBytes);

        const { width, height } = page.getSize();

        page.drawImage(image, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }

      const bytes = await editedPdf.save();

      const blob = new Blob([bytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `edited-${file.name}`;

      link.click();

      URL.revokeObjectURL(url);

      setMessage("Edited PDF downloaded successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Unable to save the edited PDF.");
    }

    setLoading(false);
  };

  const removeFile = () => {
    setFile(null);
    setPdf(null);
    setTotalPages(0);
    setPageNumber(1);
    overlays.current = {};
    setMessage("");
  };

  return (
    <div className="pdf-editor-page">
      <div className="pdf-editor-container">

        <div className="pdf-editor-heading">
          <div className="pdf-editor-icon">
            <FileText size={30} />
          </div>

          <h1>PDF Editor</h1>

          <p>
            Draw, highlight, and add text to your PDF documents.
          </p>
        </div>

        {!file ? (
          <label className="pdf-editor-upload">
            <Upload size={42} />

            <h3>Upload your PDF</h3>

            <p>Select a PDF document to start editing.</p>

            <span>Select PDF</span>

            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFile}
              hidden
            />
          </label>
        ) : (
          <div className="pdf-editor-workspace">

            <div className="pdf-editor-toolbar">

              <div className="pdf-editor-tools">

                <button
                  className={mode === "draw" ? "active" : ""}
                  onClick={() => setMode("draw")}
                  title="Draw"
                >
                  <Pencil size={19} />
                  <span>Draw</span>
                </button>

                <button
                  className={mode === "highlight" ? "active" : ""}
                  onClick={() => setMode("highlight")}
                  title="Highlight"
                >
                  <Highlighter size={19} />
                  <span>Highlight</span>
                </button>

                <button
                  className={mode === "text" ? "active" : ""}
                  onClick={() => setMode("text")}
                  title="Add text"
                >
                  <Type size={19} />
                  <span>Text</span>
                </button>

              </div>

              <div className="pdf-editor-colors">
                <label htmlFor="editor-color">Color</label>

                <input
                  id="editor-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>

              <button
                className="pdf-editor-clear"
                onClick={clearAnnotations}
                title="Clear annotations on this page"
              >
                <Trash2 size={18} />
                <span>Clear page</span>
              </button>

              <button
                className="pdf-editor-close"
                onClick={removeFile}
                title="Remove PDF"
              >
                <X size={19} />
              </button>

            </div>

            <div className="pdf-editor-filename">
              <FileText size={18} />
              <span>{file.name}</span>
            </div>

            <div
              className="pdf-editor-canvas-area"
              ref={containerRef}
            >
              <div className="pdf-editor-canvas-wrapper">

                <canvas ref={pdfCanvasRef} />

                <canvas
                  ref={annotationCanvasRef}
                  className="pdf-editor-annotation"
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerCancel={stopDrawing}
                  onPointerLeave={stopDrawing}
                />

              </div>
            </div>

            <div className="pdf-editor-bottom">

              <div className="pdf-editor-pagination">

                <button
                  onClick={() => changePage(pageNumber - 1)}
                  disabled={pageNumber === 1}
                >
                  <ChevronLeft size={20} />
                </button>

                <span>
                  Page {pageNumber} of {totalPages}
                </span>

                <button
                  onClick={() => changePage(pageNumber + 1)}
                  disabled={pageNumber === totalPages}
                >
                  <ChevronRight size={20} />
                </button>

              </div>

              <button
                className="pdf-editor-download"
                onClick={downloadPDF}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="pdf-editor-spin" size={19} />
                ) : (
                  <Download size={19} />
                )}

                {loading ? "Processing..." : "Download PDF"}
              </button>

            </div>
          </div>
        )}

        {message && (
          <div className="pdf-editor-message">
            {message}
          </div>
        )}

        <div className="pdf-editor-info">
          <h2>What can you do?</h2>

          <div className="pdf-editor-features">

            <div>
              <Pencil size={23} />
              <h3>Draw</h3>
              <p>Draw directly on your PDF pages.</p>
            </div>

            <div>
              <Highlighter size={23} />
              <h3>Highlight</h3>
              <p>Highlight important information.</p>
            </div>

            <div>
              <Type size={23} />
              <h3>Add Text</h3>
              <p>Insert text annotations anywhere.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}