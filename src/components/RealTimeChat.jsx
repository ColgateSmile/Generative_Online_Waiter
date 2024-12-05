import React, { useState, useEffect } from "react";

const RealTimeChat = ({ sendMessage }) => {
  const [listening, setListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [transcript, setTranscript] = useState("");

  // Initialize Speech Recognition API
  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const lastTranscript = event.results[event.results.length - 1][0].transcript;
      setTranscript(lastTranscript);
      sendMessage(lastTranscript); // Send the transcript as a message
    };

    setSpeechRecognition(recognition);
  }, [sendMessage]);

  const toggleListening = () => {
    if (!speechRecognition) return;
    if (listening) {
      speechRecognition.stop();
    } else {
      speechRecognition.start();
    }
  };

  return (
    <div className="real-time-chat">
      <button onClick={toggleListening}>
        {listening ? "Stop Listening" : "Start Speaking"}
      </button>
      {listening && <p>Listening... Speak now!</p>}
    </div>
  );
};

export default RealTimeChat;
