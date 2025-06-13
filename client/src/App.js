import React, { useState, useRef } from 'react';
import './App.css';

const BACKEND_URL = 'http://localhost:5001';

function App() {
  // State for voice
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const recognitionRef = useRef(null);

  // State for images and OCR
  const [images, setImages] = useState([]);
  const [ocrTexts, setOcrTexts] = useState([]);
  const [ocrLoading, setOcrLoading] = useState(false);

  // State for note, email, and status
  const [note, setNote] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  // Voice recording handlers
  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceText(transcript);
      setNote(prev => prev ? prev + '\n' + transcript : transcript);
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Image upload and OCR
  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
    setOcrTexts([]);
  };

  const handleOcr = async () => {
    if (images.length === 0) return;
    setOcrLoading(true);
    setStatus('');
    const formData = new FormData();
    images.forEach(img => formData.append('images', img));
    try {
      const res = await fetch(`${BACKEND_URL}/ocr`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.texts) {
        setOcrTexts(data.texts);
        setNote(prev => prev ? prev + '\n' + data.texts.join('\n') : data.texts.join('\n'));
      } else {
        setStatus('OCR failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setStatus('OCR error: ' + err.message);
    }
    setOcrLoading(false);
  };

  // Send email
  const handleSend = async () => {
    setStatus('Sending...');
    try {
      const res = await fetch(`${BACKEND_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Your Note',
          text: note,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('Email sent!');
      } else {
        setStatus('Send failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setStatus('Send error: ' + err.message);
    }
  };

  return (
    <div className="App" style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>Voice & Handwritten Notes</h2>
      {/* Voice Note Section */}
      <section style={{ marginBottom: 24 }}>
        <h3>Record Voice Note</h3>
        <button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        {voiceText && <div style={{ marginTop: 8 }}><b>Last Transcript:</b> {voiceText}</div>}
      </section>
      {/* Image Upload Section */}
      <section style={{ marginBottom: 24 }}>
        <h3>Upload Handwritten Notes (Images)</h3>
        <input type="file" accept="image/*" multiple onChange={handleImageChange} />
        <button onClick={handleOcr} disabled={ocrLoading || images.length === 0} style={{ marginLeft: 8 }}>
          {ocrLoading ? 'Processing...' : 'Extract Text from Images'}
        </button>
        {ocrTexts.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <b>Extracted Texts:</b>
            <ul>
              {ocrTexts.map((text, idx) => <li key={idx}>{text}</li>)}
            </ul>
          </div>
        )}
      </section>
      {/* Note Editor */}
      <section style={{ marginBottom: 24 }}>
        <h3>Review/Edit Note</h3>
        <textarea
          rows={8}
          style={{ width: '100%' }}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Your note will appear here..."
        />
      </section>
      {/* Email Section */}
      <section style={{ marginBottom: 24 }}>
        <h3>Send Note to Email</h3>
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '70%', marginRight: 8 }}
        />
        <button onClick={handleSend} disabled={!email || !note.trim()}>
          Send
        </button>
      </section>
      {/* Status */}
      {status && <div style={{ marginTop: 16, color: status.includes('error') || status.includes('failed') ? 'red' : 'green' }}>{status}</div>}
    </div>
  );
}

export default App;
