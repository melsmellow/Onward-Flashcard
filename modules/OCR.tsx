"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";

type Props = {
  title: string;
  count?: number; // Optional prop
};

const OCR: React.FC<Props> = ({ title, count = 0 }) => {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleOCR = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(
        image, // File object or URL
        "eng", // Language
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
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Tesseract OCR with Next.js</h1>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-4"
      />
      <button
        onClick={handleOCR}
        disabled={!image || loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Processing..." : "Run OCR"}
      </button>
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Extracted Text:</h2>
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
};

export default OCR;
