// Acesta este codul complet pentru fisierul src/App.jsx

import React, { useState } from "react";

function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const extractText = async () => {
    if (!image) return;
    setLoading(true);
    setResult("Procesare imagine...");

    try {
      console.log("Trimitem imagine cu lungimea:", image.length);
      console.log("Primele caractere din imagine:", image.slice(0, 100));

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
                {
                  type: "text",
                  text: "Te rog extrage exact tot textul vizibil din această imagine. Nu interpreta, doar afișează cuvintele găsite.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: image,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
        }),
      });

      const data = await response.json();
      console.log("Răspuns complet de la API:", JSON.stringify(data, null, 2));

      if (data.choices && data.choices.length > 0) {
        setResult(data.choices[0].message.content);
      } else {
        setResult("Nu s-a detectat niciun text.");
      }
    } catch (error) {
      console.error("Eroare API:", error);
      setResult("A apărut o eroare la extragerea textului.");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>OCR AI Agent</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <br /><br />
      <input type="file" accept="image/*" capture="environment" onChange={handleCapture} />
      <br /><br />
      {image && <img src={image} alt="upload" style={{ maxWidth: "100%" }} />}
      <br /><br />
      <button onClick={extractText} disabled={loading}>
        {loading ? "Extrage text..." : "Extrage text"}
      </button>
      <br /><br />
      <div><strong>Rezultat:</strong></div>
      <pre>{result}</pre>
    </div>
  );
}

export default App;
