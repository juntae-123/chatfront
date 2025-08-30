'use client';
import { useEffect, useRef, useState } from 'react';

export type ChatRedisMsg = {
  type: 'ENTER' | 'TALK' | 'LEAVE';
  roomId: number;
  message: string;
  sender?: string;
  timestamp?: string;
};

type WebSocketOptions = {
  getToken: () => string | null;
  refreshToken: () => Promise<string | null>;
};

const wsMap = new Map<number, WebSocket>();

export function useChatWebSocket(
  roomId: number | string | undefined,
  username: string | null,
  options: WebSocketOptions
) {
  const [messages, setMessages] = useState<ChatRedisMsg[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  const messagesRef = useRef<ChatRedisMsg[]>([]);
  messagesRef.current = messages;

  const isConnectingRef = useRef(false);
  const retryCountRef = useRef(0);
  const MAX_RETRY = 5;
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchInitialData = async () => {
    if (!roomId) return;

    try {
      
      const resMsgs = await fetch(`/api/chatrooms/${roomId}/messages`);
      if (resMsgs.ok) {
        const data = await resMsgs.json();
        const initialMessages: ChatRedisMsg[] = data
          .filter((msg: any) => msg.type === 'TALK')
          .map((msg: any) => ({
            type: 'TALK',
            roomId: Number(msg.roomId),
            message: msg.message,
            sender: msg.sender.username,
            timestamp: msg.timestamp,
          }));
        setMessages(initialMessages);
      }

      const resUsers = await fetch(`/api/chatrooms/${roomId}/users`);
      if (resUsers.ok) {
        const data: string[] = await resUsers.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const connect = async () => {
    if (!roomId || !username) return;
    const numericRoomId = Number(roomId);
    if (isNaN(numericRoomId)) return;

    if (wsMap.get(numericRoomId)?.readyState === WebSocket.OPEN || isConnectingRef.current)
      return;

    isConnectingRef.current = true;

    let token = options.getToken();
    if (!token) token = await options.refreshToken();
    if (!token) {
      isConnectingRef.current = false;
      return;
    }

    
    const url = `${process.env.NEXT_PUBLIC_WS_URL ?? '/api/ws'}/chat?roomId=${numericRoomId}&token=${token}`;
    const ws = new WebSocket(url);
    wsMap.set(numericRoomId, ws);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      isConnectingRef.current = false;
      retryCountRef.current = 0;
    };

    ws.onmessage = (ev) => {
      try {
        const data: ChatRedisMsg = JSON.parse(ev.data);

        if (data.type === 'ENTER' &&
            messagesRef.current.some(m => m.type === 'ENTER' && m.sender === data.sender)) {
          return;
        }

        if (data.sender) {
          if (data.type === 'ENTER') {
            setUsers(prev => prev.includes(data.sender!) ? prev : [...prev, data.sender!]);
          } else if (data.type === 'LEAVE') {
            setUsers(prev => prev.filter(u => u !== data.sender));
          }
        }

        setMessages(prev => [...prev, data]);
      } catch (e) {
        console.error('Invalid WS message', e);
      }
    };

    ws.onclose = (ev) => {
      console.log('WebSocket closed', ev.code, ev.reason);
      setConnected(false);
      isConnectingRef.current = false;
      wsMap.delete(numericRoomId);

      if (ev.code !== 1008 && retryCountRef.current < MAX_RETRY) {
        retryCountRef.current++;
        reconnectTimerRef.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)
        ws.close();
    };
  };

  useEffect(() => {
    fetchInitialData();
    connect();

    return () => {
      const numericRoomId = Number(roomId);
      wsMap.get(numericRoomId)?.close();
      wsMap.delete(numericRoomId);
      isConnectingRef.current = false;
    };
  }, [roomId, username]);

  const sendMessage = (text: string) => {
    if (!roomId || !username) return;
    const numericRoomId = Number(roomId);
    const ws = wsMap.get(numericRoomId);
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const msg: ChatRedisMsg = {
      type: 'TALK',
      roomId: numericRoomId,
      sender: username,
      message: text,
      timestamp: new Date().toISOString(),
    };

    ws.send(JSON.stringify(msg));
    setMessages([...messagesRef.current, msg]); 
  };

  return { messages, users, connected, sendMessage };
}
