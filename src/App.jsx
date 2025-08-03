import React, { useState } from "react";

const App = () => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    sendImageToOpenAI(file);
  };

  const sendImageToOpenAI = async (file) => {
    setLoading(true);
    setText("");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result.split(",")[1];

      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer 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`,
          },
          body: JSON.stringify({
            model: "gpt-4-vision-preview",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image}`,
                    },
                  },
                  {
                    type: "text",
                    text: "Extrage tot textul din această imagine.",
                  },
                ],
              },
            ],
            max_tokens: 1000,
          }),
        });

        const data = await response.json();
        const extractedText = data.choices?.[0]?.message?.content || "Niciun text găsit.";
        setText(extractedText);
      } catch (err) {
        console.error("Eroare la trimiterea către OpenAI:", err);
        setText("A apărut o eroare.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>OCR AI Agent</h1>

      <div style={{ marginBottom: "15px" }}>
        <label>
          <strong>Alege din galerie:</strong>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </label>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>
          <strong>Fă o poză cu camera:</strong>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      {image && (
        <div>
          <h3>Previzualizare imagine:</h3>
          <img src={image} alt="Imagine selectată" style={{ maxWidth: "100%", marginBottom: "20px" }} />
        </div>
      )}

      {loading && <p>Se procesează imaginea...</p>}

      {text && (
        <div>
          <h3>Text extras:</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{text}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
