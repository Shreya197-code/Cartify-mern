import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const ChatAssistant = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi there! I'm your Cartify AI Shopping Assistant. Ask me anything about our products, recommendations, or your order status!",
      suggestedProducts: []
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const headers = { "Content-Type": "application/json" };
      if (user?.token) {
        headers["Authorization"] = `Bearer ${user.token}`;
      }

      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: data.reply || "Here is what I found for you.",
            suggestedProducts: data.suggestedProducts || []
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I couldn't reach the AI service right now. Please try again or browse our shop.",
            suggestedProducts: []
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Network issue. Please make sure the server is running and try again.",
          suggestedProducts: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-3.5 text-white shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/40"
          title="Open AI Shopping Assistant"
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-200 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white"></span>
          </span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="font-semibold text-sm tracking-wide">Ask Cartify AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="flex h-[560px] w-[370px] sm:w-[420px] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">Cartify AI Assistant</h3>
                <p className="text-xs text-blue-100">Live Catalog & Orders Grounded</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="flex items-center gap-2 border-b border-gray-100 bg-slate-50/80 px-4 py-2 text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => { setInput("Show best gifts under ₹1500"); }}
              className="whitespace-nowrap rounded-full border border-gray-200 bg-white px-3 py-1 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition"
            >
              🎁 Under ₹1500
            </button>
            <button
              onClick={() => { setInput("Where is my latest order?"); }}
              className="whitespace-nowrap rounded-full border border-gray-200 bg-white px-3 py-1 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition"
            >
              📦 Track my order
            </button>
            <button
              onClick={() => { setInput("What are top rated electronics?"); }}
              className="whitespace-nowrap rounded-full border border-gray-200 bg-white px-3 py-1 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition"
            >
              ⚡ Top Electronics
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>

                {/* Suggested Product Cards */}
                {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2 w-full max-w-[90%]">
                    {msg.suggestedProducts.map((prod) => (
                      <Link
                        key={prod._id}
                        to={`/product/${prod._id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm transition hover:border-blue-400 hover:shadow-md"
                      >
                        {prod.imageUrl ? (
                          <img src={prod.imageUrl} alt={prod.name} className="h-12 w-12 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-400 text-xs">No img</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-gray-900 truncate">{prod.name}</p>
                          <p className="text-xs text-blue-600 font-bold">₹{prod.price}</p>
                        </div>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">View</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-xs py-2 px-3 bg-white rounded-xl w-fit border border-gray-100">
                <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600 [animation-delay:0.2s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-purple-600 [animation-delay:0.4s]"></div>
                <span>Cartify AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 bg-white p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about products, orders..."
                className="flex-1 bg-transparent py-1.5 text-sm text-gray-800 outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="rounded-xl bg-blue-600 p-2 text-white transition hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;
