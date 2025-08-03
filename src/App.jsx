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
        // Pentru testare cu poza fixă, debifează următoarea linie și comentează următoarea:
        // const imageUrl = "https://ocr.space/Content/Images/receipt-ocr-original.jpg";
        const imageUrl = file
          ? `data:image/jpeg;base64,${base64Image}`
          : "https://ocr.space/Content/Images/receipt-ocr-original.jpg";

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
                      url: imageUrl,
                    },
                  },
                ],
              },
            ],
            max_tokens: 1000,
          }),
        });

        const data = await response.json();
        console.log("OpenAI response:", data);

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

    if (file) {
      reader.readAsDataURL(file);
    } else {
      // Dacă vrei să testezi poza fixă fără fișier:
      // setText("Test poza fixă în curs...");
      // extractText(null);
    }
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
