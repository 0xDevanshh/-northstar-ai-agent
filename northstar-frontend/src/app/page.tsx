"use client"

import React, { useEffect, useRef, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type Message = { role: "user" | "assistant"; content: string }
type Analytics = { [k: string]: any }

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState("")
  const [analytics, setAnalytics] = useState<Analytics | null>(null)

  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  async function sendMessage(messageText: string) {
    if (!messageText.trim()) return
    const userMsg: Message = { role: "user", content: messageText }
    setMessages((m) => [...m, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: messageText }),
      })
      const data = await res.json()
      const reply = data.reply || ""
      if (data.session_id) setSessionId(data.session_id)
      const botMsg: Message = { role: "assistant", content: reply }
      setMessages((m) => [...m, botMsg])
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, something went wrong." }])
    } finally {
      setLoading(false)
    }
  }

  async function endConversation() {
    if (!sessionId) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      })
      const data = await res.json()
      setAnalytics(data)
    } catch (e) {
      setAnalytics({ error: "Failed to fetch analytics" })
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-3xl">
        <Card className="flex flex-col h-[70vh] md:h-[75vh]">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Northstar Homes — Chat with Riya</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={endConversation}>
                End Conversation &amp; View Analytics
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0">
            <ScrollArea ref={scrollRef as any} className="h-full">
              <div className="flex flex-col p-4">
                {messages.length === 0 && (
                  <div className="text-center text-sm text-zinc-500 py-8">
                    Ask Riya about homes, pricing, and availability.
                  </div>
                )}

                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex items-end gap-3 ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {m.role === "assistant" && (
                      <Avatar>
                        <AvatarFallback>R</AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[80%] px-4 py-2 text-sm rounded-lg ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-zinc-100 text-zinc-900 rounded-bl-none"
                      }`}
                    >
                      {m.content}
                    </div>

                    {m.role === "user" && <div className="w-9" />}
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-3 justify-start">
                    <Avatar>
                      <AvatarFallback>R</AvatarFallback>
                    </Avatar>
                    <Badge className="bg-zinc-100 text-zinc-700">
                      <span className="animate-pulse">typing</span>
                      <span className="ml-2">...</span>
                    </Badge>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter>
            <div className="flex items-center gap-2 w-full">
              <Input
                placeholder="Write a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button onClick={() => sendMessage(input)}>Send</Button>
            </div>
          </CardFooter>
        </Card>

        <Separator />

        {analytics && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Conversation Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(analytics).map(([k, v]) => {
                  const isBadge = ["interest_level", "site_visit_status", "opt_out"].includes(k)
                  return (
                    <div key={k} className="flex items-center justify-between">
                      <div className="text-sm text-zinc-600 capitalize">{k.replace(/_/g, " ")}</div>
                      <div>{isBadge ? <Badge className="bg-zinc-100">{String(v)}</Badge> : <div className="text-sm">{String(v)}</div>}</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
