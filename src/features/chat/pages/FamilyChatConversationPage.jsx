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

import { useAuthStore } from "@/features/auth/store/authStore";
import { useFamilyStore } from "@features/family/store/familyStore";

export const FamilyChatConversationPage = () => {
  const navigate = useNavigate();
  // [GEMINI-CLI: 2025-11-29] useParams에서 familyGroupId 추출 (기존 유지)
  const { familyGroupId } = useParams();

  const familyGroup = useFamilyStore((state) => state.familyGroup);
  
  // [GEMINI-CLI: 2025-11-29] roomId -> familyGroupId로 변수명 의미 명확화
  // const roomId = Number(familyGroupId) || 1;
  const currentFamilyGroupId = Number(familyGroupId) || 1;

  // =================================================================================
  // 🔥 토큰 및 유저 ID 관리 (Zustand Store 사용)
  // =================================================================================

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const memberNickname = useAuthStore((state) => state.user?.name || '익명');
  const currentUserId = user?.id ? Number(user.id) : user?.userId ? Number(user.userId) : 1;

  // =================================================================================

  const messageListRef = useRef(null);
  const stompClientRef = useRef(null); 

  const prevScrollHeightRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingPast, setIsLoadingPast] = useState(false);

  const isFetchingRef = useRef(false);

  const loadMessages = useCallback(async (pageNum) => {
      if (!hasMore) return;
      if (!token) return;
      try {
        isFetchingRef.current = true;
        if (pageNum > 0) {
          setIsLoadingPast(true);
          await new Promise((r) => setTimeout(r, 800));
        }
        // [GEMINI-CLI: 2025-11-29] API 경로 수정: roomId -> currentFamilyGroupId
        // const res = await fetch(
        //   `http://localhost:8080/api/family-chat/rooms/${roomId}/messages?page=${pageNum}&size=50`,
        //   { headers: { Authorization: `Bearer ${token}` } }
        // );
        const res = await fetch(
          `http://localhost:8080/api/family-chat/rooms/${currentFamilyGroupId}/messages?page=${pageNum}&size=50`,
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
    }, [currentFamilyGroupId, hasMore, token]); // [GEMINI-CLI: 2025-11-29] 의존성 변경: roomId -> currentFamilyGroupId

  useLayoutEffect(() => {
    if (prevScrollHeightRef.current && messageListRef.current) {
      const container = messageListRef.current;
      const newHeight = container.scrollHeight;
      const oldHeight = prevScrollHeightRef.current;
      container.scrollTop = newHeight - oldHeight;
      prevScrollHeightRef.current = null;
    }
  }, [messages]);

  // [GEMINI-CLI: 2025-11-29] Store 토큰 기반 초기 로드 (기존 유지)
  useEffect(() => {
    if (token) {
      loadMessages(0);
    }
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
  // 🔥 WebSocket 연결 로직 (SockJS 제거 -> 순수 WS 적용)
  // ============================================================
  const connectWebSocket = useCallback(async () => {
    if (!token) return; 

    try {
      const stompModule = await import("@stomp/stompjs");
      const { Client } = stompModule;

      const client = new Client({
        brokerURL: "ws://localhost/ws/", 
        connectHeaders: {
           Authorization: `Bearer ${token}`, 
        },
        debug: (str) => {
          console.log(str);
        },
        reconnectDelay: 5000, 
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = () => {
        console.log("✅ WebSocket Connected (Pure WS)!");
        
        // [GEMINI-CLI: 2025-11-29] 구독 경로 수정: roomId -> currentFamilyGroupId
        // client.subscribe(`/topic/family/${roomId}`, (msg) => {
        client.subscribe(`/topic/family/${currentFamilyGroupId}`, (msg) => {
          const body = JSON.parse(msg.body);

          setMessages((prev) => {
            if (body.id && prev.some((m) => m.id === body.id)) {
              return prev;
            }
            // [GEMINI-CLI: 2025-11-29] Optimistic UI 중복 방지
            // ID가 없는(낙관적 업데이트된) 메시지 중 내용과 보낸사람이 같은 것을 찾아 교체
            const optimisticIndex = prev.findIndex(
              (m) => !m.id && m.content === body.content && m.familyMemberId === body.familyMemberId
            );

            if (optimisticIndex !== -1) {
              const newMessages = [...prev];
              // [GEMINI-CLI] 서버 메시지로 교체하되, 시간이 없으면 기존(낙관적) 시간 유지
              newMessages[optimisticIndex] = {
                ...body,
                createdAt: body.createdAt || prev[optimisticIndex].createdAt
              };
              return newMessages;
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

      client.onStompError = (frame) => {
        console.error("❌ Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      };
      
      client.onWebSocketError = (event) => {
          console.error("❌ WebSocket Error", event);
      }

      client.activate();
      stompClientRef.current = client;

    } catch (err) {
      console.error("WS 로드 실패:", err);
    }
  }, [currentFamilyGroupId, token]); // [GEMINI-CLI: 2025-11-29] 의존성 변경

  const disconnectWebSocket = () => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate(); 
    }
  };

  // [GEMINI] 이미지 업로드 핸들러 (content 인자 추가)
  const handleImageUpload = async (file, content = "") => {
    if (!file || isSending) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("familyMemberId", currentUserId);
    if (content) {
        formData.append("content", content); // 텍스트 질문 추가
    }

    setIsSending(true);

    try {
      // 1. 이미지 업로드 API 호출
      const res = await fetch(`http://localhost:8080/api/family-chat/rooms/${currentFamilyGroupId}/messages/image`, {
        method: "POST",
        headers: { 
            Authorization: `Bearer ${token}` 
        },
        body: formData,
      });

      if (!res.ok) throw new Error("이미지 업로드 실패");

      const imageUrl = await res.text(); // 백엔드가 URL을 String으로 반환함

      // 2. 소켓으로 이미지 메시지 전송 (다른 사람들에게 보여주기 위해)
      if (stompClientRef.current && stompClientRef.current.connected) {
        // (1) 이미지 메시지 전송
        const imagePayload = {
          familyGroupId: currentFamilyGroupId,
          familyMemberId: currentUserId,
          content: imageUrl,
          type: "IMAGE" // 백엔드 Enum과 일치
        };

        stompClientRef.current.publish({
          destination: `/app/family/${currentFamilyGroupId}`,
          body: JSON.stringify(imagePayload),
        });
        
        // (2) 텍스트 메시지 전송 (이미지와 함께 입력된 텍스트가 있다면)
        let textPayload = null;
        if (content && content.trim()) {
            // [GEMINI] AI 명령어인 경우, 백엔드에서 이미지 AI가 별도로 돌기 때문에
            // 텍스트 전용 AI 중복 실행을 막기 위해 '/ai ' 접두사를 제거하고 일반 텍스트로 보냄
            let textContent = content;
            if (textContent.startsWith("/ai ")) {
                textContent = textContent.substring(4).trim();
            }

            if (textContent) {
                textPayload = {
                    familyGroupId: currentFamilyGroupId,
                    familyMemberId: currentUserId,
                    content: textContent,
                    type: "TEXT"
                };

                stompClientRef.current.publish({
                    destination: `/app/family/${currentFamilyGroupId}`,
                    body: JSON.stringify(textPayload),
                });
            }
        }

        // (3) 내 화면에 즉시 표시 (낙관적 업데이트)
        setMessages((prev) => {
            const newMsgs = [];
            // 이미지 메시지 추가
            newMsgs.push({
              ...imagePayload,
              id: null,
              memberNickname: memberNickname,
              createdAt: new Date().toISOString(),
            });
            // 텍스트 메시지 추가 (있다면)
            if (textPayload) {
                newMsgs.push({
                    ...textPayload,
                    id: null,
                    memberNickname: memberNickname,
                    createdAt: new Date().toISOString(),
                });
            }
            return [...prev, ...newMsgs];
        });
        
        setTimeout(() => {
            if (messageListRef.current) {
              messageListRef.current.scrollTop =
                messageListRef.current.scrollHeight;
            }
        }, 10);
      }

    } catch (err) {
      console.error("이미지 전송 오류", err);
      alert("이미지 전송에 실패했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  // [GEMINI] 메시지 전송 핸들러 (통합: 텍스트 or 파일)
  const handleSendMessage = useCallback(async (content, file) => {
    // 1. 파일이 있으면 이미지 업로드 로직으로 위임
    if (file) {
      await handleImageUpload(file, content);
      return;
    }

    // 2. 파일이 없으면 기존 텍스트 전송 로직
    if (!content || !content.trim() || !stompClientRef.current || !stompClientRef.current.connected) return;

    const payload = {
      // [GEMINI-CLI: 2025-11-29] 필드명 변경: roomId -> familyGroupId
      // roomId,
      familyGroupId: currentFamilyGroupId,
      
      familyMemberId: currentUserId,
      
      // [GEMINI-CLI: 2025-11-29] 백엔드 DTO에서 삭제됨 (주석 처리)
      // memberNickname: memberNickname,
      
      content,
    };

    setIsSending(true);

    try {
      // [GEMINI-CLI: 2025-11-29] 전송 경로 수정: roomId -> currentFamilyGroupId
      stompClientRef.current.publish({
        // destination: `/app/family/${roomId}`,
        destination: `/app/family/${currentFamilyGroupId}`,
        body: JSON.stringify(payload),
      });

      // [GEMINI-CLI: 2025-11-29] 낙관적 업데이트 (Optimistic UI)
      // 주의: 백엔드 응답에는 닉네임이 포함되어 오지만, 여기서는 로컬에서 바로 뿌리므로 닉네임이 필요할 수 있음.
      // 임시로 현재 유저의 닉네임을 사용해서 보여줌.
      setMessages((prev) => [
        ...prev,
        {
          ...payload,
          id: null, // 임시 ID
          memberNickname: memberNickname, // 로컬 표시용으로 잠시 사용
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
  }, [currentFamilyGroupId, currentUserId, memberNickname]); // [GEMINI-CLI: 2025-11-29] 의존성 변경

  useEffect(() => {
    if (token) {
      connectWebSocket();
    }
    return () => disconnectWebSocket();
  }, [token, connectWebSocket]);

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
    <MainLayout showBottomNav={true}>
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={handleBack}>
            뒤로
          </button>
          <h2 className={styles.title}>{familyGroup?.name ? `${familyGroup.name} 채팅방` : '가족채팅'}</h2>
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
