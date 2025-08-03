import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

export default function OCRChatApp() {
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setOcrText("");
    setResponse("");
  };

  const runOCR = async () => {
    if (!image) return;
    setLoadingOCR(true);
    const { data } = await Tesseract.recognize(image, 'eng+ron');
    setOcrText(data.text);
    setLoadingOCR(false);
  };

  const askAI = async () => {
    if (!ocrText || !question) return;
    setLoadingAI(true);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer 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`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "Extrage insighturi din textul extras cu OCR." },
          { role: "user", content: `Textul extras: ${ocrText}` },
          { role: "user", content: question }
        ]
      })
    });

    const data = await res.json();
    setResponse(data.choices?.[0]?.message?.content || "Eroare AI.");
    setLoadingAI(false);
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">OCR + AI Assistant</h1>

      <input type="file" accept="image/*" onChange={handleImageUpload} className="block" />

      <button onClick={runOCR} disabled={loadingOCR || !image} className="bg-blue-500 text-white px-4 py-2 rounded">
        {loadingOCR ? "Extrage text..." : "Rulează OCR"}
      </button>

      {ocrText && (
        <textarea className="w-full h-40 border rounded p-2" value={ocrText} readOnly />
      )}

      {ocrText && (
        <div className="space-y-2">
          <textarea
            placeholder="Întreabă ceva despre textul extras..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full h-24 border rounded p-2"
          />
          <button onClick={askAI} disabled={loadingAI} className="bg-green-500 text-white px-4 py-2 rounded">
            {loadingAI ? "Răspund..." : "Întreabă AI"}
          </button>
        </div>
      )}

      {response && (
        <div className="bg-gray-100 p-3 rounded-xl">
          <strong>Răspuns AI:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
