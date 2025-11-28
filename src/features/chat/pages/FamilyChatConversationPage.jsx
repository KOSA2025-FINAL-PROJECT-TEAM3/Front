import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "@shared/components/layout/MainLayout";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import styles from "./FamilyChatConversationPage.module.scss";

// window.global = window; // 순수 WebSocket 사용 시 이 줄은 굳이 필요 없습니다.

export const FamilyChatConversationPage = () => {
  const navigate = useNavigate();
  const { familyGroupId } = useParams();
  const roomId = Number(familyGroupId) || 1;

  const [currentUserId, setCurrentUserId] = useState(1); 

  const messageListRef = useRef(null);
  const stompClientRef = useRef(null); // stompRef 이름을 좀 더 명확하게 변경

  const token = localStorage.getItem("amapill_token");
  const prevScrollHeightRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingPast, setIsLoadingPast] = useState(false);

  const isFetchingRef = useRef(false);

  // ... (loadMessages, useLayoutEffect, token parsing 로직은 기존과 동일하므로 유지) ...
  const loadMessages = useCallback(async (pageNum) => {
      // (기존 코드 유지)
      if (!hasMore) return;
      if (!token) return;
      try {
        isFetchingRef.current = true;
        if (pageNum > 0) {
          setIsLoadingPast(true);
          await new Promise((r) => setTimeout(r, 800));
        }
        const res = await fetch(
          `http://localhost:8080/api/family-chat/rooms/${roomId}/messages?page=${pageNum}&size=50`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (!data || data.length === 0) {
          setHasMore(false);
          return;
        }
        if (messageListRef.current) {
          prevScrollHeightRef.current = messageListRef.current.scrollHeight;
        }
        setMessages((prev) => [...data, ...prev]);
      } catch (err) {
        console.error("메시지 로드 실패", err);
      } finally {
        isFetchingRef.current = false;
        setIsInitialLoading(false);
        setIsLoadingPast(false);
      }
    }, [roomId, hasMore, token]);

  useLayoutEffect(() => {
    if (prevScrollHeightRef.current && messageListRef.current) {
      const container = messageListRef.current;
      const newHeight = container.scrollHeight;
      const oldHeight = prevScrollHeightRef.current;
      container.scrollTop = newHeight - oldHeight;
      prevScrollHeightRef.current = null;
    }
  }, [messages]);

  useEffect(() => {
    if (!token) return;
    try {
      const payloadPart = token.split('.')[1];
      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      if (payload.userId) setCurrentUserId(Number(payload.userId));
    } catch (err) {
      console.error('토큰 파싱 실패', err);
    }
    loadMessages(0);
  }, [token, loadMessages]);
  
  // 스크롤 핸들러 유지
  const handleScroll = useCallback(() => {
    const box = messageListRef.current;
    if (!box || isFetchingRef.current || !hasMore) return;
    if (box.scrollTop < 50) {
      isFetchingRef.current = true;
      setPage((prev) => prev + 1);
    }
  }, [hasMore]);

  useEffect(() => {
    const box = messageListRef.current;
    if (!box) return;
    box.addEventListener("scroll", handleScroll);
    return () => box.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (page > 0) loadMessages(page);
  }, [page, loadMessages]);


  // ============================================================
  // 🔥 [수정됨] WebSocket 연결 로직 (SockJS 제거 -> 순수 WS 적용)
  // ============================================================
  const connectWebSocket = useCallback(async () => {
    try {
      // SockJS는 import 하지 않습니다.
      const stompModule = await import("@stomp/stompjs");
      const { Client } = stompModule;

      // ✅ 1. Client 객체 생성 (최신 방식)
      const client = new Client({
        // ✅ 2. 주소 변경: http:// -> ws:// (Nginx 80포트 -> /ws 경로)
        brokerURL: "ws://localhost/ws/", 

        // 필요한 경우 헤더 추가
        connectHeaders: {
           Authorization: `Bearer ${token}`, 
        },

        // 디버깅용 (배포 시 제거 가능)
        debug: (str) => {
          console.log(str);
        },

        // 자동 재연결 설정 (SockJS보다 끊김 처리가 강력함)
        reconnectDelay: 5000, 
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      // ✅ 3. 연결 성공 시 실행될 콜백
      client.onConnect = () => {
        console.log("✅ WebSocket Connected (Pure WS)!");
        
        client.subscribe(`/topic/family/${roomId}`, (msg) => {
          const body = JSON.parse(msg.body);

          setMessages((prev) => {
            if (body.id && prev.some((m) => m.id === body.id)) {
              return prev;
            }
            return [...prev, body];
          });

          setTimeout(() => {
            if (messageListRef.current) {
              messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
            }
          }, 10);
        });
      };

      // 에러 핸들링
      client.onStompError = (frame) => {
        console.error("❌ Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      };
      
      client.onWebSocketError = (event) => {
          console.error("❌ WebSocket Error", event);
      }

      // 연결 시작
      client.activate();
      stompClientRef.current = client;

    } catch (err) {
      console.error("WS 로드 실패:", err);
    }
  }, [roomId, token]);

  const disconnectWebSocket = () => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate(); // disconnect() 대신 deactivate() 사용
    }
  };

  // ============================================================
  // [수정 끝]
  // ============================================================

  const handleSendMessage = useCallback(async (content) => {
    if (!content.trim() || !stompClientRef.current || !stompClientRef.current.connected) return;

    const payload = {
      roomId,
      familyMemberId: currentUserId,
      memberNickname: "tester",
      content,
    };

    setIsSending(true);

    try {
      // Client 객체에서는 publish()를 사용합니다.
      stompClientRef.current.publish({
        destination: `/app/family/${roomId}`,
        body: JSON.stringify(payload),
      });

      setMessages((prev) => [
        ...prev,
        {
          ...payload,
          id: null,
          createdAt: new Date().toISOString(),
        },
      ]);

      setTimeout(() => {
        if (messageListRef.current) {
          messageListRef.current.scrollTop =
            messageListRef.current.scrollHeight;
        }
      }, 10);
    } catch (err) {
      console.error("메시지 전송 실패", err);
    } finally {
      setIsSending(false);
    }
  }, [roomId, currentUserId]);

  useEffect(() => {
    if (token) {
      connectWebSocket();
    }
    return () => disconnectWebSocket();
  }, [token, connectWebSocket]);

  // ... (나머지 UI 렌더링 코드는 동일)
  useEffect(() => {
    if (!isInitialLoading && page === 0 && messages.length > 0) {
      if (messageListRef.current) {
        setTimeout(() => {
          messageListRef.current.scrollTop =
            messageListRef.current.scrollHeight;
        }, 10);
      }
    }
  }, [messages, isInitialLoading, page]);

  const handleBack = () => navigate(-1);

  return (
    <MainLayout showBottomNav={false}>
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={handleBack}>
            뒤로
          </button>
          <h2 className={styles.title}>가족채팅</h2>
        </header>

        <div className={styles.messageList} ref={messageListRef}>
          {isInitialLoading && (
            <div className={styles.loading}>
              <p>로딩중...</p>
            </div>
          )}

          {isLoadingPast && (
            <div className={styles.loadingPast}>
              <p>이전 메시지 불러오는 중...</p>
            </div>
          )}

          {messages.map((m, i) => (
            <ChatMessage
              key={m.id || m.messageId || i}
              message={m}
              isMe={m.familyMemberId === currentUserId}
            />
          ))}
        </div>

        <ChatInput onSend={handleSendMessage} disabled={isSending} />
      </div>
    </MainLayout>
  );
};

export default FamilyChatConversationPage;
