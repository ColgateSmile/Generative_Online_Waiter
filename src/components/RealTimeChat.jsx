import React, { useState, useRef } from "react";

const RealTimeChat = ({ sendMessage }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [websocket, setWebsocket] = useState(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  const REALTIME_ENDPOINT = "wss://api.openai.com/v1/realtime";

  const startListening = async () => {
    try {
      setListening(true);

      // Set up WebSocket connection
      const ws = new WebSocket(REALTIME_ENDPOINT);
      ws.onopen = () => {
        console.log("WebSocket connected.");
        ws.send(
          JSON.stringify({
            type: "start",
            data: {
              apiKey: API_KEY,
              format: "audio/wav",
              language: "en-US",
            },
          })
        );
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "transcript") {
          setTranscript(message.data.text);
        } else if (message.type === "response") {
          setResponse(message.data.text);
          sendMessage(message.data.text);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected.");
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      setWebsocket(ws);

      // Set up microphone access and recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
        if (websocket?.readyState === WebSocket.OPEN) {
          websocket.send(event.data); // Send audio data in chunks
        }
      };

      mediaRecorder.start(100); // Capture audio every 100ms
      mediaRecorderRef.current = mediaRecorder;

      // Start visualization
      startVisualization(stream);
    } catch (error) {
      console.error("Error starting microphone:", error);
      setListening(false);
    }
  };

  const stopListening = () => {
    setListening(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (websocket) {
      websocket.close();
    }
    stopVisualization();
  };

  const startVisualization = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyzer = audioContext.createAnalyser();
    source.connect(analyzer);

    analyzer.fftSize = 256;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");

    const render = () => {
      analyzer.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = "#f5f5f5";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }

      requestAnimationFrame(render);
    };
    render();
  };

  const stopVisualization = () => {
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="real-time-chat">
      <button onClick={listening ? stopListening : startListening}>
        {listening ? "Stop Listening" : "Start Speaking"}
      </button>
      <canvas
        ref={canvasRef}
        width="400"
        height="100"
        style={{
          display: "block",
          margin: "20px auto",
          backgroundColor: "#eee",
          borderRadius: "10px",
          border: "1px solid #ddd",
        }}
      ></canvas>
      <div className="transcript">
        <h4>Transcript:</h4>
        <p>{transcript || "Start speaking to see your transcript here."}</p>
      </div>
      <div className="response">
        <h4>AI Response:</h4>
        <p>{response || "AI will respond here."}</p>
      </div>
    </div>
  );
};

export default RealTimeChat;
