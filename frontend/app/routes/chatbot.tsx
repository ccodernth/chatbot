import React, { useState, useRef, useEffect } from "react";

interface ChatMessage {
  from: "user" | "bot";
  text: string;
}

export default function Chatbot() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  async function sendMessage() {
    if (!message) return;
    setChat((chat) => [...chat, { from: "user", text: message }]);
    setMessage("");

    try {
      const res = await fetch("/api/chatbot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setChat((chat) => [...chat, { from: "bot", text: data.message || JSON.stringify(data) }]);
    } catch {
      setChat((chat) => [...chat, { from: "bot", text: "Hata oluştu" }]);
    }
  }

  // Sohbet kutusunu en sona kaydırmak için
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Chatbot</h1>
      <div
        className="border rounded-md p-4 h-72 overflow-y-auto mb-4 bg-white shadow"
      >
        {chat.map((c, i) => (
          <div
            key={i}
            className={`mb-2 flex ${
              c.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg ${
                c.from === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <span className="font-semibold">{c.from === "user" ? "Sen" : "Bot"}:</span> {c.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="flex">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mesajını yaz..."
          className="flex-grow border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-600 text-white px-6 py-2 rounded-r-md hover:bg-indigo-700 transition"
        >
          Gönder
        </button>
      </div>
    </main>
  );
}
