import React, { useState, useRef } from "react";

const RealTimeChat = ({ sendMessage }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const websocketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);

  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  const REALTIME_ENDPOINT =
    "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";

  const startListening = async () => {
    try {
      setListening(true);

      // Initialize WebSocket connection
      const ws = new WebSocket(REALTIME_ENDPOINT, [], {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "OpenAI-Beta": "realtime=v1",
        },
      });

      ws.onopen = () => {
        console.log("WebSocket connected.");
        // Configure session
        ws.send(
          JSON.stringify({
            type: "session.update",
            session: {
              voice: "alloy",
              instructions:
                "You are a friendly and helpful assistant. Speak in a warm and engaging tone.",
            },
          })
        );
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("WebSocket message received:", message);

        if (message.type === "conversation.item.created") {
          if (message.item.type === "message") {
            if (message.item.role === "user") {
              setTranscript(message.item.content[0]?.text || "");
            } else if (message.item.role === "assistant") {
              setResponse(message.item.content[0]?.text || "");
              sendMessage(message.item.content[0]?.text || "");
            }
          }
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected.");
        setListening(false);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setListening(false);
      };

      websocketRef.current = ws;

      // Setup microphone access and recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      mediaRecorder.ondataavailable = (event) => {
        if (websocketRef.current?.readyState === WebSocket.OPEN) {
          websocketRef.current.send(
            JSON.stringify({
              type: "input_audio_buffer.append",
              audio: event.data,
            })
          );
        }
      };

      mediaRecorder.start(100); // Record chunks every 100ms
      mediaRecorderRef.current = mediaRecorder;

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

    if (websocketRef.current) {
      websocketRef.current.close();
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
      if (!canvasCtx) return;

      analyzer.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = "#f5f5f5";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        canvasCtx.fillRect(
          x,
          canvas.height - barHeight / 2,
          barWidth,
          barHeight / 2
        );
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
