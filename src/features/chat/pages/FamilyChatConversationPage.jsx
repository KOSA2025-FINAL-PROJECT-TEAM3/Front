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

// SockJS 오류 방지용
window.global = window;

let Stomp = null;
let SockJS = null;

export const FamilyChatConversationPage = () => {
  const navigate = useNavigate();
  const { familyGroupId } = useParams();
  const roomId = Number(familyGroupId) || 1;

  // 현재 사용자 ID (나중에 로그인 정보 연동 가능)
  const currentUserId = 1;

  const messageListRef = useRef(null);
  const stompRef = useRef(null);

  // 스크롤 보정용
  const prevScrollHeightRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingPast, setIsLoadingPast] = useState(false);

  // 중복 로딩 방지
  const isFetchingRef = useRef(false);

  /**
   * 서버에서 메시지 조회 (DESC → 화면에서는 ASC 유지)
   */
  const loadMessages = useCallback(
    async (pageNum) => {
      if (!hasMore) return;

      try {
        isFetchingRef.current = true;

        if (pageNum > 0) {
          setIsLoadingPast(true);
          await new Promise((r) => setTimeout(r, 800));
        }

        const res = await fetch(
          `http://localhost:8082/family-chat/rooms/${roomId}/messages?page=${pageNum}&size=50`
        );
        const data = await res.json();

        if (!data || data.length === 0) {
          setHasMore(false);
          return;
        }

        if (messageListRef.current) {
          prevScrollHeightRef.current = messageListRef.current.scrollHeight;
        }

        // prepend
        setMessages((prev) => [...data, ...prev]);
      } catch (err) {
        console.error("메시지 로드 실패", err);
      } finally {
        isFetchingRef.current = false;
        setIsInitialLoading(false);
        setIsLoadingPast(false);
      }
    },
    [roomId, hasMore]
  );

  /**
   * 과거 메시지 로딩 후 스크롤 보정
   */
  useLayoutEffect(() => {
    if (prevScrollHeightRef.current && messageListRef.current) {
      const container = messageListRef.current;

      const newHeight = container.scrollHeight;
      const oldHeight = prevScrollHeightRef.current;

      container.scrollTop = newHeight - oldHeight;

      prevScrollHeightRef.current = null;
    }
  }, [messages]);

  // 첫 로딩
  useEffect(() => {
    loadMessages(0);
  }, []);

  /**
   * 스크롤 상단 도달 → 과거 메시지 로딩
   */
  const handleScroll = () => {
    const box = messageListRef.current;
    if (!box) return;

    if (isFetchingRef.current) return;
    if (!hasMore) return;

    if (box.scrollTop < 50) {
      isFetchingRef.current = true;
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const box = messageListRef.current;
    if (!box) return;

    box.addEventListener("scroll", handleScroll);
    return () => box.removeEventListener("scroll", handleScroll);
  }, [hasMore]);

  useEffect(() => {
    if (page > 0) loadMessages(page);
  }, [page]);

  /**
   * WebSocket 연결
   */
  useEffect(() => {
    connectWebSocket();
    return () => disconnectWebSocket();
  }, []);

  const connectWebSocket = async () => {
    try {
      const stompModule = await import("@stomp/stompjs");
      const sockModule = await import("sockjs-client");

      Stomp = stompModule.Stomp;
      SockJS = sockModule.default;

      const socket = new SockJS("http://localhost:8082/ws");
      const client = Stomp.over(socket);
      client.debug = () => { };

      client.connect(
        {},
        () => {
          client.subscribe(`/topic/family/${roomId}`, (msg) => {
            const body = JSON.parse(msg.body);

            setMessages((prev) => {
              // 서버 메시지 id 기준 중복 제거
              if (body.id && prev.some((m) => m.id === body.id)) {
                return prev;
              }
              return [...prev, body];
            });

            setTimeout(() => {
              if (messageListRef.current) {
                messageListRef.current.scrollTop =
                  messageListRef.current.scrollHeight;
              }
            }, 10);
          });
        },
        (err) => console.error("WebSocket Error:", err)
      );

      stompRef.current = client;
    } catch (err) {
      console.error("WS 로드 실패:", err);
    }
  };

  const disconnectWebSocket = () => {
    try {
      stompRef.current?.disconnect();
    } catch { }
  };

  /**
   * 메시지 전송 (낙관적 UI 포함)
   */
  const handleSendMessage = async (content) => {
    if (!content.trim() || !stompRef.current) return;

    const payload = {
      roomId,
      familyMemberId: currentUserId,
      memberNickname: "tester",
      content,
    };

    setIsSending(true);

    try {
      // 서버에 전송
      stompRef.current.send(
        `/app/family/${roomId}`,
        {},
        JSON.stringify(payload)
      );

      // 낙관적 렌더
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
  };

  /**
   * 첫 로딩 시 자동 스크롤 맨 아래
   */
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
