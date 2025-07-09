"use client";

import { Thread } from "@/components/thread";
import { StreamProvider } from "@/providers/Stream";
import { ThreadProvider } from "@/providers/Thread";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function ChatPage(): React.ReactNode {
  console.log("ChatPage component loaded");
  
  return (
    <React.Suspense fallback={<div>Loading Chat...</div>}>
      <Toaster />
      <ThreadProvider>
        <StreamProvider>
          <div className="h-screen w-full">
            {/* Back Navigation */}
            <div className="absolute top-4 left-4 z-50">
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            
            <Thread />
          </div>
        </StreamProvider>
      </ThreadProvider>
    </React.Suspense>
  );
} 