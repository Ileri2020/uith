"use client";
// import { UserProps } from "@/types/user";
// import { VideoType } from "@/types/videoType";
import React, { createContext, useState } from "react";


interface Comment {
  id: number | string;
  contentId: string; // videoId
  userId: number | string;
  username: string;
  comment: string;
  createdAt: string | Date;
}


interface AppContextProps {
  user: any;
  setUser: (user: any) => void;
  cart: any[]//UserProps;
  setCart: (cart: any[]) => void;
  useMock: boolean;
  setUseMock: (useMock: boolean) => void;
}

export const AppContext = createContext<AppContextProps | null>(null);

export const AppContextProvider: React.FC<any> = ({ children }) => {
  const [user, setUser] = useState<any>({});
  const [cart, setCart] = useState<any[]>([]);
  const [useMock, setUseMock] = useState(true);

  const appContextValues: AppContextProps = {
    user,
    setUser,
    cart,
    setCart,
    useMock,
    setUseMock,
  };

  return (
    <AppContext.Provider value={appContextValues}>
      {children}
    </AppContext.Provider>
  );
};
