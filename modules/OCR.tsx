"use client";

import { useRef, useState } from "react";
import Tesseract from "tesseract.js";

type Props = {
  title: string;
  count?: number; // Optional prop
};

const OCR: React.FC<Props> = ({ title, count = 0 }) => {
  const [image, setImage] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImageSrc(URL.createObjectURL(file)); // Preview uploaded image
    }
  };

  const startCamera = async () => {
    setUseCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: "environment" } }, // Requesting the back camera
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Camera Error:", error);
      alert("Failed to access the camera.");
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        setImageSrc(dataUrl); // Set preview from camera capture
        setUseCamera(false);

        // Stop the camera stream
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const handleOCR = async () => {
    if (!imageSrc) return;

    setLoading(true);
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(
        imageSrc, // Can accept Base64 or File URLs
        "eng",
        {
          logger: (info) => console.log(info), // Progress updates
        }
      );
      setText(text);
    } catch (error) {
      console.error("OCR Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-16 ">
      <h1 className="text-xl font-bold m-2">Tesseract OCR with Next.js</h1>

      {/* Image Upload Option */}
      <div className="mb-4">
        <label className="block mb-2">Upload Image:</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>

      {/* Camera Option */}
      {!useCamera ? (
        <button
          onClick={startCamera}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Take Picture with Camera
        </button>
      ) : (
        <div className="mt-4">
          <video ref={videoRef} className="border rounded mb-2" autoPlay />
          <button
            onClick={captureImage}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Capture Picture
          </button>
        </div>
      )}

      {/* Image Preview */}
      {imageSrc && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Preview:</h2>
          <img src={imageSrc} alt="Preview" className="border rounded" />
        </div>
      )}

      {/* OCR Button */}
      <button
        onClick={handleOCR}
        disabled={!imageSrc || loading}
        className="bg-blue-500 text-white px-4 py-2 mt-4 rounded disabled:opacity-50"
      >
        {loading ? "Processing..." : "Run OCR"}
      </button>

      {/* OCR Result */}
      {text && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Extracted Text:</h2>
          <p className="whitespace-pre-wrap">{text}</p>
        </div>
      )}

      {/* Hidden Canvas for Camera Capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default OCR;
