import React, { useState } from "react";

function App() {
  // Pornim cu imaginea fixă setată ca implicită
  const [image, setImage] = useState("https://whiteimage.biz/whiteimage/20250707_112841.jpg");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result); // imagine locală în base64
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result); // imagine locală în base64
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
      // Verificăm dacă image este URL sau base64
      let imageUrlForAPI = "";
      if (image.startsWith("http")) {
        // imagine URL public, trimitem direct linkul
        imageUrlForAPI = image;
      } else if (image.startsWith("data:image")) {
        // imagine base64 - **ATENȚIE** OpenAI nu acceptă base64 în image_url, deci trebuie încărcată undeva online
        setResult("Imaginea este locală (base64). Pentru OCR, încarcă imaginea pe un URL public.");
        setLoading(false);
        return;
      } else {
        setResult("Formatul imaginii nu este suportat.");
        setLoading(false);
        return;
      }

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
                    url: imageUrlForAPI,
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

      <div>
        <h3>Imagine curentă:</h3>
        {image && <img src={image} alt="upload" style={{ maxWidth: "100%", maxHeight: 400 }} />}
      </div>

      <br />

      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <br />
      <input type="file" accept="image/*" capture="environment" onChange={handleCapture} />

      <br /><br />
      <button onClick={extractText} disabled={loading}>
        {loading ? "Extrage text..." : "Extrage text"}
      </button>

      <br /><br />
      <div>
        <strong>Rezultat:</strong>
      </div>
      <pre>{result}</pre>
    </div>
  );
}

export default App;
