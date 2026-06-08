// src/components/FloatingChat.jsx
import React, { useState } from 'react';

function FloatingChat({ currentPage, userRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello! I'm your Moris AgroConnect assistant. How can I help you with ${currentPage} today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Replace with real Anthropic Claude API call (page 7)
      // For demo, using simulated response
      setTimeout(() => {
        const assistantMessage = { 
          role: 'assistant', 
          content: `I'm helping with your ${currentPage} request. For demo purposes, this shows the AI chat working! In production, I'd connect to Claude API.` 
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);

      // REAL API CALL (uncomment when you have API key)
      /*
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'YOUR_ANTHROPIC_API_KEY'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20241022',
          max_tokens: 1000,
          system: `You are Moris AgroConnect assistant. Current page: ${currentPage}. User role: ${userRole}. Help with orders, inventory, delivery, sustainability.`,
          messages: messages.concat(userMessage).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content[0].text }]);
      */
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          zIndex: 1000,
          fontSize: '24px'
        }}
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '350px',
            height: '500px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            border: '1px solid #ddd'
          }}
        >
          {/* Header */}
          <div style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '12px',
            borderRadius: '12px 12px 0 0',
            fontWeight: 'bold'
          }}>
            🌾 Moris AgroConnect Assistant
            <button
              onClick={() => setIsOpen(false)}
              style={{
                float: 'right',
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.role === 'user' ? '#28a745' : '#f1f1f1',
                  color: msg.role === 'user' ? 'white' : 'black',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  maxWidth: '80%',
                  wordWrap: 'break-word'
                }}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', color: '#888', padding: '8px' }}>
                Typing...
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '12px',
            borderTop: '1px solid #ddd',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '20px',
                border: '1px solid #ddd',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                cursor: 'pointer'
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingChat;