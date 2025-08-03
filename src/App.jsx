import React, { useState } from "react";

const App = () => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const extractText = async (file) => {
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
            Authorization: `Bearer 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`, // pune cheia ta aici
          },
          body: JSON.stringify({
            model: "gpt-4-vision-preview",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Te rog să recunoști tot textul scris în această imagine, indiferent cât de mic sau greu de citit, și să îl returnezi exact.",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 1000,
          }),
        });

        const data = await response.json();

        // Logare pentru depanare
        console.log("Răspuns complet de la OpenAI:", data);

        if (!response.ok) {
          setText(`Eroare API: ${data.error?.message || "Unknown error"}`);
          setLoading(false);
          return;
        }

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

    reader.readAsDataURL(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    extractText(file);
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
        </div>
      )}

      {loading && <p>Se procesează imaginea...</p>}

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

