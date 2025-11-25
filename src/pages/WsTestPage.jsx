import { useEffect, useRef, useState } from "react";

window.global = window; // SockJS용

let Stomp = null;
let SockJS = null;

const ROOM_ID = 1; // 테스트용 채팅방 ID

export default function WebSocketTest() {
  const stompRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    // 초기: 메시지 로드 + WS 연결
    loadMessages();
    connect();

    // 언마운트 시 disconnect
    return () => disconnect();
  }, []);

  // ✅ 기존 메시지 리스트 가져오기 (REST)
  const loadMessages = async () => {
    try {
      const res = await fetch(
        `http://localhost:8082/family-chat/rooms/${ROOM_ID}/messages?page=0&size=50`,
      );
      if (!res.ok) {
        console.error("메시지 로드 실패", res.status);
        return;
      }
      const data = await res.json();
      setMessages(data || []);
    } catch (err) {
      console.error("메시지 로드 에러:", err);
    }
  };

  // ✅ WebSocket 연결
  const connect = async () => {
    const stompModule = await import("@stomp/stompjs");
    const sockModule = await import("sockjs-client");

    Stomp = stompModule.Stomp;
    SockJS = sockModule.default;

    const wsUrl = "http://localhost:8082/ws"; // 백엔드 WebSocket 엔드포인트
    const socket = new SockJS(wsUrl);
    const client = Stomp.over(socket);

    client.debug = () => {}; // 디버그 로그 끔

    client.connect(
      {},
      () => {
        console.log("WS CONNECTED!!");

        // ✅ /topic/family/1 구독 → 새 메시지 오면 상태에 추가
        client.subscribe(`/topic/family/${ROOM_ID}`, (msg) => {
          try {
            const body = JSON.parse(msg.body);
            console.log("RECEIVED:", body);
            setMessages((prev) => [...prev, body]);
          } catch (e) {
            console.error("메시지 파싱 실패:", e);
          }
        });
      },
      (err) => console.error("WS ERROR:", err),
    );

    stompRef.current = client;
  };

  const disconnect = () => {
    try {
      stompRef.current?.disconnect();
      console.log("DISCONNECTED");
    } catch (e) {
      console.warn("disconnect 에러 무시:", e);
    }
  };

  // ✅ 메시지 전송 (WebSocket → SocketController → DB저장 + 브로드캐스트)
  const sendMessage = () => {
    if (!stompRef.current) {
      alert("웹소켓이 아직 연결되지 않았습니다.");
      return;
    }
    if (!content.trim()) return;

    const payload = {
      roomId: ROOM_ID,
      familyMemberId: 1,       // 테스트용 고정값
      memberNickname: "tester", // 테스트용 닉네임
      content: content.trim(),
    };

    stompRef.current.send(
      `/app/family/${ROOM_ID}`, // FamilyChatSocketController @MessageMapping("/family/{roomId}")
      {},
      JSON.stringify(payload),
    );

    // 입력창 비우기
    setContent("");
  };

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 600,
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h2>가족 채팅방 테스트 (roomId = {ROOM_ID})</h2>

      {/* 메시지 리스트 */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 8,
          padding: 10,
          height: 300,
          overflowY: "auto",
          marginBottom: 16,
        }}
      >
        {messages.length === 0 && (
          <div style={{ color: "#888" }}>메시지가 없습니다.</div>
        )}
        {messages.map((m) => (
          <div
            key={m.messageId || `${m.familyMemberId}-${m.createdAt}-${Math.random()}`}
            style={{
              marginBottom: 8,
              padding: 6,
              borderRadius: 6,
              background: "#f5f5f5",
            }}
          >
            <div style={{ fontSize: 12, color: "#555" }}>
              <strong>{m.memberNickname || "익명"}</strong>
              {m.createdAt && (
                <span style={{ marginLeft: 8, fontSize: 11, color: "#999" }}>
                  {m.createdAt}
                </span>
              )}
            </div>
            <div>{m.content}</div>
          </div>
        ))}
      </div>

      {/* 입력 + 버튼 */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="메시지를 입력하세요..."
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 4,
            border: "1px solid #ccc",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "8px 16px",
            borderRadius: 4,
            border: "none",
            background: "#4a7cff",
            color: "white",
            cursor: "pointer",
          }}
        >
          보내기
        </button>
      </div>
    </div>
  );
}
