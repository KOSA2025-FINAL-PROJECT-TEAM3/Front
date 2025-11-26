import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react"; // ⭐ useLayoutEffect 추가됨
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "@shared/components/layout/MainLayout";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import styles from "./FamilyChatConversationPage.module.scss";

// SockJS 오류 fix
window.global = window;

let Stomp = null;
let SockJS = null;

export const FamilyChatConversationPage = () => {
  const navigate = useNavigate();
  const { familyGroupId } = useParams();
  const roomId = Number(familyGroupId) || 1;

  const messageListRef = useRef(null);
  const stompRef = useRef(null);

  // ⭐ 스크롤 계산을 위한 Ref
  const prevScrollHeightRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingPast, setIsLoadingPast] = useState(false);

  const isFetchingRef = useRef(false);

  // =========================================
  // ⭐ 메시지 로딩 (서버 DESC → 화면 ASC)
  // =========================================
  const loadMessages = useCallback(
    async (pageNum) => {
      if (isFetchingRef.current || !hasMore) return;

      try {
        isFetchingRef.current = true;

        // 과거 메시지 로딩 효과
        if (pageNum > 0) {
          setIsLoadingPast(true);
          await new Promise((r) => setTimeout(r, 1000));
        }

        const res = await fetch(
          `http://localhost:8082/family-chat/rooms/${roomId}/messages?page=${pageNum}&size=30`
        );
        const data = await res.json();

        if (!data || data.length === 0) {
          setHasMore(false);
          return;
        }

        // DESC → ASC 변환
        const ascData = [...data].reverse();

        // 메시지 추가 전 현재 높이 저장
        if (messageListRef.current) {
          prevScrollHeightRef.current = messageListRef.current.scrollHeight;
        }

        // prepend 방식
        setMessages((prev) => [...ascData, ...prev]);
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

  // =========================================
  // ⭐ 스크롤 위치 보정 (과거 메시지 로딩 시 필수)
  // =========================================
  useLayoutEffect(() => {
    if (prevScrollHeightRef.current !== null && messageListRef.current) {
      const container = messageListRef.current;
      const currentScrollHeight = container.scrollHeight;

      container.scrollTop =
        currentScrollHeight - prevScrollHeightRef.current;

      prevScrollHeightRef.current = null;
    }
  }, [messages]);

  // 최초 메시지 로딩
  useEffect(() => {
    loadMessages(0);
  }, []);

  // =========================================
  // ⭐ 위로 스크롤하면 과거 메시지 로딩
  // =========================================
  const handleScroll = () => {
    if (!messageListRef.current) return;
    if (isFetchingRef.current || !hasMore) return;

    if (messageListRef.current.scrollTop < 50) {
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

  // =========================================
  // ⭐ WebSocket 연결
  // =========================================
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
      client.debug = () => {};

      client.connect(
        {},
        () => {
          console.log("WS Connected!");

          client.subscribe(`/topic/family/${roomId}`, (msg) => {
            const body = JSON.parse(msg.body);

            setMessages((prev) => [...prev, body]);

            setTimeout(() => {
              if (messageListRef.current) {
                messageListRef.current.scrollTop =
                  messageListRef.current.scrollHeight;
              }
            }, 10);
          });
        },
        (err) => console.error("WS ERROR:", err)
      );

      stompRef.current = client;
    } catch (err) {
      console.error("WS 로드 실패:", err);
    }
  };

  const disconnectWebSocket = () => {
    try {
      stompRef.current?.disconnect();
    } catch {}
  };

  // =========================================
  // ⭐ 메시지 전송
  // =========================================
  const handleSendMessage = async (content) => {
    if (!content.trim() || !stompRef.current) return;

    const payload = {
      roomId,
      familyMemberId: 1,
      memberNickname: "tester",
      content,
    };

    setIsSending(true);

    try {
      stompRef.current.send(
        `/app/family/${roomId}`,
        {},
        JSON.stringify(payload)
      );

      // 즉시 렌더 (낙관적 UI)
      setMessages((prev) => [
        ...prev,
        {
          ...payload,
          createdAt: new Date().toISOString(),
          senderType: "user",
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

  // =========================================
  // ⭐ 최초 로딩 시 자동 스크롤 하단
  // =========================================
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
              key={m.messageId || i}
              message={m}
              isMe={m.senderType === "user"}
            />
          ))}
        </div>

        <ChatInput onSend={handleSendMessage} disabled={isSending} />
      </div>
    </MainLayout>
  );
};

export default FamilyChatConversationPage;
