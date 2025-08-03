import React, { useState } from "react";

const App = () => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const extractText = async () => {
    if (!image) {
      alert("Selectează o imagine mai întâi.");
      return;
    }

    setLoading(true);
    setText("");

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer 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`, // înlocuiește cu cheia ta reală
        },
        body: JSON.stringify({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Extrage tot textul vizibil din această imagine." },
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

      const output = data?.choices?.[0]?.message?.content;
      if (output) {
        setText(output);
      } else {
        setText("⚠️ Nu s-a detectat niciun text. Încearcă o imagine mai clară.");
      }
    } catch (error) {
      console.error(error);
      setText("A apărut o eroare. Verifică consola pentru detalii.");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", textAlign: "center", padding: 20 }}>
      <h2>OCR AI Agent 📸</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="fileInput"
      />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="cameraInput"
      />

      <div style={{ margin: "20px 0" }}>
        <button onClick={() => document.getElementById("fileInput").click()}>
          Alege imagine
        </button>{" "}
        <button onClick={() => document.getElementById("cameraInput").click()}>
          Fă poză cu camera
        </button>
      </div>

      {image && (
        <div style={{ marginBottom: 20 }}>
          <img src={image} alt="Preview" style={{ maxWidth: "100%", borderRadius: 8 }} />
          <div>
            <button onClick={extractText} disabled={loading}>
              {loading ? "Se procesează..." : "Extrage text"}
            </button>
          </div>
        </div>
      )}

      {text && (
        <div style={{ marginTop: 20, textAlign: "left", whiteSpace: "pre-wrap" }}>
          <h4>Text extras:</h4>
          <div>{text}</div>
        </div>
      )}
    </div>
  );
};

export default App;

