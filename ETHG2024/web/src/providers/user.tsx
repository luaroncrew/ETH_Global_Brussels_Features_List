"use client";

import { type Feature, type User } from "@prisma/client";
import React, { createContext } from "react";

export interface UserWithUpvotedFeatures extends User {
  upvotedFeatures: Feature[];
}

export const UserContext = createContext<UserWithUpvotedFeatures | null>(null);

export default function UserProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserWithUpvotedFeatures | null;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
