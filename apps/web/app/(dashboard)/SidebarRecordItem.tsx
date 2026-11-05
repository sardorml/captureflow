"use client";

import { Video } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAppMessages } from "@/components/app-i18n-provider";
import { useStartRecording } from "./RecordButton";

export function SidebarRecordItem() {
  const m = useAppMessages();
  const start = useStartRecording();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={m.shell.record.newRecording}
          onClick={start}
          className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
        >
          <Video />
          <span>{m.shell.record.newRecording}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
