import { createContext, useContext, useEffect, useMemo, useState } from "react";

const UserContext = createContext();

const STORAGE_KEY = "chat-user";

export const UserProvider = ({ children }) => {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const [nickname, setNickname] = useState(stored.nickname || "");
  const [roomId, setRoomId] = useState(stored.roomId || "");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nickname, roomId }));
  }, [nickname, roomId]);

  const value = useMemo(
    () => ({ nickname, roomId, setNickname, setRoomId }),
    [nickname, roomId],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
