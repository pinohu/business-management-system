import { useState, useEffect, useCallback, useRef } from 'react';

const useWebSocket = (url, options = {}) => {
  const {
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onMessage = null,
    onOpen = null,
    onClose = null,
    onError = null,
    autoReconnect = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setReconnectAttempts(0);
        if (onOpen) {
          onOpen();
        }
      };

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setLastMessage(message);
        if (onMessage) {
          onMessage(message);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        if (onClose) {
          onClose();
        }

        // Attempt to reconnect if enabled and not exceeded max attempts
        if (
          autoReconnect &&
          reconnectAttempts < maxReconnectAttempts
        ) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current.onerror = (error) => {
        if (onError) {
          onError(error);
        }
      };
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  }, [
    url,
    reconnectInterval,
    maxReconnectAttempts,
    autoReconnect,
    reconnectAttempts,
    onOpen,
    onMessage,
    onClose,
    onError,
  ]);

  const sendMessage = useCallback(
    (message) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      } else {
        throw new Error('WebSocket is not connected');
      }
    },
    []
  );

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
    setReconnectAttempts(0);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    disconnect,
    reconnectAttempts,
  };
};

export default useWebSocket; 