import React, { useState, useRef } from "react";

function App() {
  const [imageData, setImageData] = useState(null);
  const [textResult, setTextResult] = useState("");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvasRef.current.toDataURL("image/png");
    setImageData(dataUrl);
  };

  const extractText = async () => {
    if (!imageData) return;
    setLoading(true);
    setTextResult("");

    try {
      console.log("Trimitem imagine la OpenAI...");
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Extrage textul din această imagine." },
                { type: "image_url", image_url: { url: imageData } },
              ],
            },
          ],
          max_tokens: 1000,
        }),
      });

      const data = await response.json();
      console.log("Răspuns API:", data);

      const result =
        data.choices?.[0]?.message?.content || "Nu s-a detectat text.";
      setTextResult(result);
    } catch (err) {
      console.error("Eroare API:", err);
      setTextResult("A apărut o eroare la extragerea textului.");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>OCR AI Agent</h1>

      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <br /><br />

      <button onClick={startCamera}>Deschide camera</button>
      <button onClick={capturePhoto} style={{ marginLeft: "10px" }}>
        Fă poză
      </button>

      <div style={{ marginTop: "20px" }}>
        <video ref={videoRef} autoPlay playsInline style={{ maxWidth: "100%" }} />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      {imageData && (
        <div style={{ marginTop: "20px" }}>
          <img src={imageData} alt="Preview" style={{ maxWidth: "100%", border: "1px solid #ccc" }} />
        </div>
      )}

      <br />
      <button onClick={extractText} disabled={loading}>
        {loading ? "Extrage text..." : "Extrage text"}
      </button>

      {textResult && (
        <div style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
          <h3>Text extras:</h3>
          <p>{textResult}</p>
        </div>
      )}
    </div>
  );
}

export default App;
