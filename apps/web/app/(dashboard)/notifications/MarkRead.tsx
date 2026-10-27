"use client";

import { useEffect } from "react";
import { markNotificationsReadAction } from "./actions";

export function MarkRead() {
  useEffect(() => {
    void markNotificationsReadAction();
  }, []);
  return null;
}
