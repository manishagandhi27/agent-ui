"use client";

import { Thread } from "@/components/thread";
import { StreamProvider } from "@/providers/Stream";
import { ThreadProvider } from "@/providers/Thread";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Workflow, MessageCircle } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function DemoPage(): React.ReactNode {
  return (
    <React.Suspense fallback={<div>Loading (layout)...</div>}>
      <Toaster />
      <ThreadProvider>
        <StreamProvider>
          <div className="h-screen w-full bg-gray-50">
            {/* Navigation Header */}
            <div className="bg-white border-b shadow-sm">
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Agent Chat Platform</h1>
                  <p className="text-gray-600 mt-1">Choose your interface</p>
                </div>
              </div>
            </div>

            {/* Interface Selection */}
            <div className="flex items-center justify-center h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto p-8">
                {/* Chat Interface */}
                <Link href="/chat" className="block">
                  <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow p-8 text-center cursor-pointer">
                    <MessageCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Chat Interface</h2>
                    <p className="text-gray-600">
                      Traditional chat interface for direct AI conversations
                    </p>
                  </div>
                </Link>

                {/* SDLC Workflow Interface */}
                <Link href="/sdlc" className="block">
                  <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow p-8 text-center cursor-pointer">
                    <Workflow className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">SDLC Workflow</h2>
                    <p className="text-gray-600">
                      Visual workflow monitoring with integrated chat
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </StreamProvider>
      </ThreadProvider>
    </React.Suspense>
  );
}
