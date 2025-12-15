import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "@shared/components/layout/MainLayout"; // MainLayout 복구
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import styles from "./FamilyChatConversationPage.module.scss";

import { useAuthStore } from "@/features/auth/store/authStore";
import { useFamilyStore } from "@features/family/store/familyStore";
import { familyChatApiClient } from "@/core/services/api/familyChatApiClient";
import logger from '@core/utils/logger';
import envConfig from '@config/environment.config';

const AI_LOADING_TEMP_ID = 'ai-loading-temp'; 

export const FamilyChatConversationPage = () => {
  const navigate = useNavigate();
  const { familyGroupId } = useParams();
  const currentFamilyGroupId = Number(familyGroupId) || 1;

  // [Safety] Store 데이터가 없을 수 있으므로 안전하게 접근
  const familyGroups = useFamilyStore((state) => state.familyGroups) || [];
  const familyGroup = familyGroups.find(g => g.id === currentFamilyGroupId);

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const memberNickname = useAuthStore((state) => state.user?.name || '익명');
  const currentUserId = user?.id ? Number(user.id) : user?.userId ? Number(user.userId) : 1;

  const messageListRef = useRef(null);
  const stompClientRef = useRef(null); 
  const prevScrollHeightRef = useRef(null);
  const observerRef = useRef(null); 
  // [FIX] 새로고침 후 각 멤버의 첫 읽음 신호를 추적하여 중복 차감 방지
  const processedReadSendersRef = useRef(new Set());

  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingPast, setIsLoadingPast] = useState(false);

  const [currentUserLastReadMessageId, setCurrentUserLastReadMessageId] = useState(0);
  const [hasUnreadGap, setHasUnreadGap] = useState(false);

  const isFetchingRef = useRef(false);
  const wsEndpoint = envConfig?.WS_BASE_URL || 'ws://localhost:8080/ws';

  // [3] 읽음 신호 (Observer) - 호이스팅 문제 해결을 위해 위로 이동
  const sendReadReceipt = useCallback((messageId) => {
      if (!stompClientRef.current || !stompClientRef.current.connected) return;
      if (messageId <= currentUserLastReadMessageId) return;

      setCurrentUserLastReadMessageId(messageId);

      const payload = {
          familyGroupId: currentFamilyGroupId,
          familyMemberId: currentUserId,
          content: String(messageId), 
          type: "READ" 
      };

      stompClientRef.current.publish({
          destination: `/app/family/${currentFamilyGroupId}/read`,
          body: JSON.stringify(payload)
      });
  }, [currentFamilyGroupId, currentUserId, currentUserLastReadMessageId]);

  // [1] 초기 데이터 로드
  const loadInitialData = useCallback(async () => {
    if (!token) return;
    try {
      isFetchingRef.current = true;
      setIsInitialLoading(true);
      
      // API 호출 실패 시에도 화면이 죽지 않도록 try-catch 내부 처리
      const response = await familyChatApiClient.getInitialChatRoomData(currentFamilyGroupId, currentUserId);
      
      const initialMessages = response?.messages || [];
      const lastReadId = response?.currentUserLastReadMessageId || 0;
      
      setMessages(initialMessages);
      setCurrentUserLastReadMessageId(lastReadId);
      
      if (initialMessages.length > 0) {
        const oldestLoadedMessageId = initialMessages[0].id;
        if (lastReadId < oldestLoadedMessageId && lastReadId > 0) {
             setHasUnreadGap(true);
        }
      }

    } catch (err) {
      logger.error("초기 데이터 로드 실패:", err);
      // 에러 나도 빈 채팅창은 보여줘야 함
      setMessages([]);
    } finally {
      isFetchingRef.current = false;
      setIsInitialLoading(false);
    }
  }, [currentFamilyGroupId, currentUserId, token]);

  // [FIX] 메시지 목록이 갱신되었을 때, 가장 최신 메시지를 읽음 처리하는 효과 추가
  useEffect(() => {
      if (isInitialLoading || messages.length === 0) return;
      
      const latestMessage = messages[messages.length - 1];
      if (!latestMessage || !latestMessage.id) return;

      // 1. 현재 내가 읽은 위치보다 더 최신 메시지이고
      // 2. 소켓이 연결되어 있다면 읽음 처리 전송
      if (latestMessage.id > currentUserLastReadMessageId && stompClientRef.current?.connected) {
          sendReadReceipt(latestMessage.id);
      }
  }, [messages, currentUserLastReadMessageId, isInitialLoading, sendReadReceipt]);

  // [2] 추가 메시지 로드 (스크롤 업)
  const loadMoreMessages = useCallback(async (pageNum) => {
    if (!hasMore || !token) return;
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      setIsLoadingPast(true);
      
      await new Promise((r) => setTimeout(r, 300));

      const res = await familyChatApiClient.getMessages(currentFamilyGroupId, pageNum, 50);
      const data = res?.messages || res || [];

      if (data.length === 0) {
        setHasMore(false);
        return;
      }

      if (messageListRef.current) {
        prevScrollHeightRef.current = messageListRef.current.scrollHeight;
      }
      
      setMessages((prev) => [...data, ...prev]);
      
    } catch (err) {
      logger.error("메시지 로드 실패", err);
    } finally {
      isFetchingRef.current = false;
      setIsLoadingPast(false);
    }
  }, [currentFamilyGroupId, hasMore, token]);

  // 스크롤 위치 조정
  useLayoutEffect(() => {
    const container = messageListRef.current;
    if (!container) return;

    if (prevScrollHeightRef.current) {
      const newHeight = container.scrollHeight;
      const oldHeight = prevScrollHeightRef.current;
      container.scrollTop = newHeight - oldHeight;
      prevScrollHeightRef.current = null;
      return;
    }

    if (!isLoadingPast && page === 0 && !isInitialLoading) {
        container.scrollTop = container.scrollHeight;
    }
  }, [messages, isLoadingPast, page, isInitialLoading]);

  useEffect(() => {
    if (token) {
      loadInitialData();
    }
  }, [token, loadInitialData]);

  const handleScroll = useCallback((e) => {
    const target = e.target;
    if (isFetchingRef.current || !hasMore) return;
    
    if (target.scrollTop < 100 && !isLoadingPast) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, isLoadingPast]);

  useEffect(() => {
    if (page > 0) {
      loadMoreMessages(page);
    }
  }, [page, loadMoreMessages]);

  useEffect(() => {
    if (isInitialLoading || messages.length === 0) return;

    if (observerRef.current) observerRef.current.disconnect();

    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const messageId = Number(entry.target.dataset.messageId);
          if (messageId > currentUserLastReadMessageId) {
             sendReadReceipt(messageId);
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(callback, {
      root: messageListRef.current,
      threshold: 0.5, 
    });

    const messageElements = document.querySelectorAll(`.${styles.messageItem}`);
    messageElements.forEach((el) => observerRef.current.observe(el));

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [messages, currentUserLastReadMessageId, isInitialLoading, sendReadReceipt]); 

  // [4] WebSocket
  const connectWebSocket = useCallback(async () => {
    if (!token) return;
    if (stompClientRef.current?.active || stompClientRef.current?.connected) return;

    try {
      const stompModule = await import("@stomp/stompjs");
      const { Client } = stompModule;

      const client = new Client({
        brokerURL: wsEndpoint,
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000, 
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = () => {
        logger.debug("✅ WebSocket Connected!");
        client.subscribe(`/topic/family/${currentFamilyGroupId}`, (msg) => {
          const body = JSON.parse(msg.body);

          if (body.type === "READ") {
              logger.debug("📩 READ 이벤트 수신:", body, "내 ID:", currentUserId);
              
              if (body.familyMemberId === currentUserId) {
                  return;
              }

              const readMessageId = Number(body.content);
              const senderId = body.familyMemberId;

              setMessages(prevMessages => {
                  return prevMessages.map(m => {
                      // 해당 메시지보다 과거이거나 같은 메시지이고, 아직 안 읽은 사람이 남아있다면
                      if (m.id <= readMessageId && m.unreadCount > 0) {
                          // [FIX] 서버에서 받은 readMemberIds와 로컬 readBy를 합쳐서 판단
                          const currentReadMembers = m.readMemberIds || m.readBy || [];
                          
                          // 이미 읽은 사람 목록에 포함되어 있다면? -> 중복 차감 방지!
                          if (currentReadMembers.includes(senderId)) {
                              return m;
                          }

                          logger.debug(`🔻 메시지(${m.id}) 숫자 감소! (읽은사람: ${senderId}) 남은 수: ${m.unreadCount - 1}`);
                          return { 
                              ...m, 
                              unreadCount: Math.max(0, m.unreadCount - 1),
                              readMemberIds: [...currentReadMembers, senderId] // 명단에 추가
                          };
                      }
                      return m;
                  });
              });
              return;
          }

          setMessages((prev) => {
            // [FIX] 실시간 메시지 수신 시 닉네임 누락 해결
            // 클로저 문제 해결을 위해 스토어에서 직접 최신 상태 조회
            if (!body.memberNickname) {
                const currentGroups = useFamilyStore.getState().familyGroups || [];
                const currentGroup = currentGroups.find(g => g.id === currentFamilyGroupId);
                
                if (currentGroup?.members) {
                    const sender = currentGroup.members.find(m => m.id == body.familyMemberId);
                    if (sender) {
                        body.memberNickname = sender.nickname || sender.name;
                    }
                }
            }

            if (body.familyMemberId === 0 && body.id) {
              const aiLoadingIndex = prev.findIndex(m => m.id === AI_LOADING_TEMP_ID);
              if (aiLoadingIndex !== -1) {
                const newMessages = [...prev];
                newMessages[aiLoadingIndex] = { ...body, createdAt: body.createdAt || prev[aiLoadingIndex].createdAt };
                return newMessages;
              }
            }
            
            if (body.id && prev.some((m) => m.id === body.id)) return prev;

            // [FIX] 클로저 문제 해결: 스토어에서 최신 멤버 수 조회
            let currentMemberCount = 1;
            const currentGroups = useFamilyStore.getState().familyGroups || [];
            const currentGroup = currentGroups.find(g => g.id === currentFamilyGroupId);
            if (currentGroup?.members?.length) {
                currentMemberCount = currentGroup.members.length;
            }

            const optimisticIndex = prev.findIndex(
              (m) => !m.id && m.content === body.content && m.familyMemberId === body.familyMemberId
            );
            
            // [DEBUG] 서버에서 온 unreadCount 확인
            if (optimisticIndex !== -1) {
                logger.debug("🔄 내 메시지 서버 응답 수신:", body, "Server Unread:", body.unreadCount, "Local Calc:", currentMemberCount - 1);
            }

            if (optimisticIndex !== -1) {
              const newMessages = [...prev];
              const serverUnreadCount = body.unreadCount !== undefined ? body.unreadCount : (currentMemberCount - 1);
              newMessages[optimisticIndex] = { 
                  ...body, 
                  createdAt: body.createdAt || prev[optimisticIndex].createdAt,
                  unreadCount: serverUnreadCount
              };
              return newMessages;
            }

            const serverUnreadCount = body.unreadCount !== undefined ? body.unreadCount : (currentMemberCount - 1);
            return [...prev, { ...body, unreadCount: serverUnreadCount }];
          });
        });
      };

      client.activate();
      stompClientRef.current = client;

    } catch (err) {
      logger.error("WS 로드 실패:", err);
    }
  }, [currentFamilyGroupId, token, currentUserId, wsEndpoint]); 

  const disconnectWebSocket = () => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }
  };

  const handleImageUpload = useCallback(async (file, content = "") => {
    if (!file || isSending) return;

    // [FIX] 이미지 용량 제한 (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert("이미지 파일 크기는 5MB를 초과할 수 없습니다.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("familyMemberId", currentUserId);
    if (content) formData.append("content", content);

    setIsSending(true);
    try {
      const imageUrl = await familyChatApiClient.uploadImage(currentFamilyGroupId, formData);

      if (stompClientRef.current?.connected) {
        const imagePayload = {
          familyGroupId: currentFamilyGroupId,
          familyMemberId: currentUserId,
          content: imageUrl,
          type: "IMAGE"
        };
        stompClientRef.current.publish({
          destination: `/app/family/${currentFamilyGroupId}`,
          body: JSON.stringify(imagePayload),
        });
        
        // [FIX] DB 저장 순서 보장 (이미지 먼저, 텍스트 나중)을 위한 지연 추가
        if (content && content.trim()) {
             setTimeout(() => {
                 let textContent = content.startsWith("/ai ") ? content.substring(4).trim() : content;
                 if(textContent) {
                     stompClientRef.current.publish({
                        destination: `/app/family/${currentFamilyGroupId}`,
                        body: JSON.stringify({
                            familyGroupId: currentFamilyGroupId,
                            familyMemberId: currentUserId,
                            content: textContent,
                            type: "TEXT"
                        }),
                    });
                 }
             }, 100);
        }
      }
    } catch (err) {
      logger.error("이미지 전송 오류", err);
    } finally {
      setIsSending(false);
    }
  }, [currentFamilyGroupId, currentUserId, isSending]);

  const handleSendMessage = useCallback(async (content, file) => {
    if (file) { await handleImageUpload(file, content); return; }
    if (!content?.trim() || !stompClientRef.current?.connected) return;

    const payload = {
      familyGroupId: currentFamilyGroupId,
      familyMemberId: currentUserId,
      content,
      type: "TEXT"
    };
    setIsSending(true);
    try {
      stompClientRef.current.publish({
        destination: `/app/family/${currentFamilyGroupId}`,
        body: JSON.stringify(payload),
      });
      
      // [FIX] 클로저 문제 해결: 스토어에서 최신 멤버 수 조회
      let currentMemberCount = 1;
      const currentGroups = useFamilyStore.getState().familyGroups || [];
      const currentGroup = currentGroups.find(g => g.id === currentFamilyGroupId);
      if (currentGroup?.members?.length) {
          currentMemberCount = currentGroup.members.length;
      }
      
      const calculatedUnreadCount = Math.max(0, currentMemberCount - 1);
      
      setMessages((prev) => {
          const newMessages = [
              ...prev, 
              { 
                  ...payload, 
                  id: null, 
                  memberNickname: memberNickname, 
                  createdAt: new Date().toISOString(),
                  unreadCount: calculatedUnreadCount
              }
          ];

          // [FIX] AI 메시지인 경우 로딩 표시 추가
          if (content.startsWith("/ai ")) {
              newMessages.push({
                  id: AI_LOADING_TEMP_ID,
                  familyMemberId: 0, // AI
                  memberNickname: "AI 봇",
                  content: "AI가 답변을 생성중입니다...",
                  type: "AI_LOADING",
                  createdAt: new Date().toISOString(),
                  unreadCount: 0
              });
          }
          
          return newMessages;
      });
    } catch (err) {
      logger.error(err);
    } finally {
      setIsSending(false);
    }
  }, [currentFamilyGroupId, currentUserId, memberNickname, handleImageUpload]);

  useEffect(() => {
    if (!token) return;

    connectWebSocket();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        disconnectWebSocket();
      } else {
        connectWebSocket();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      disconnectWebSocket();
    };
  }, [token, connectWebSocket]);

  const handleBack = () => navigate(-1);

  // [Fix] MainLayout 복구 (fullScreen 옵션 사용)
  return (
    <MainLayout showBottomNav={false} fullScreen={true}>
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={handleBack}>뒤로</button>
          <h2 className={styles.title}>{familyGroup?.name ? `${familyGroup.name} 채팅방` : '가족채팅'}</h2>
        </header>

        {hasUnreadGap && (
            <div className={styles.unreadNotice}>
                <span>⬆️ 안 읽은 메시지가 더 있습니다</span>
            </div>
        )}

        <div 
            className={styles.messageList} 
            ref={messageListRef}
            onScroll={handleScroll}
        >
          {isLoadingPast && <div className={styles.loadingPast}><p>불러오는 중...</p></div>}
          
          {!isInitialLoading && messages.map((m, i) => (
            <div key={m.id || m.messageId || i} className={styles.messageItem} data-message-id={m.id}>
                <ChatMessage
                message={m}
                isMe={m.familyMemberId === currentUserId}
                />
            </div>
          ))}
          
          {isInitialLoading && <div className={styles.loading}><p>로딩중...</p></div>}
        </div>

        <ChatInput onSend={handleSendMessage} disabled={isSending} />
      </div>
    </MainLayout>
  );
};

export default FamilyChatConversationPage;
