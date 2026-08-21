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

  // The scroll viewport itself, plus a sentinel after the last bubble as a
  // fallback if the ref ever fails to attach.
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const firstPaint = useRef(true)

  // Dev-only: `?seed=20` fills the transcript so the scroll container can be
  // exercised without a backend. Remove whenever you like.
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return
    const n = Number(new URLSearchParams(window.location.search).get("seed") || 0)
    if (!n) return
    setMessages(
      Array.from({ length: n }, (_, i) => ({
        role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
        content:
          i % 2 === 0
            ? `Message ${i + 1}: I am interested in a 3 BHK, what is the price?`
            : `Message ${i + 1}: The 3 BHK at Project Northstar One starts at 1.75 crore rupees onwards, in Sector 79, Gurugram.`,
      }))
    )
  }, [])

  // Pin the transcript to the newest message on every append.
  useEffect(() => {
    // jump on the first render, animate for messages that arrive later
    const behavior: ScrollBehavior = firstPaint.current ? "auto" : "smooth"
    const el = scrollRef.current
    if (el) {
      // scrollHeight includes the viewport's bottom padding, so this lands on
      // the true bottom — scrollIntoView() stops short of it.
      el.scrollTo({ top: el.scrollHeight, behavior })
    } else {
      bottomRef.current?.scrollIntoView({ behavior, block: "end" })
    }
    firstPaint.current = false
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
    // h-screen (not min-h-screen) + overflow-hidden: the page is exactly the
    // viewport, so growth has to be absorbed by the transcript, not the body.
    <div className="h-screen overflow-hidden flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-3xl max-h-full flex flex-col gap-4 overflow-y-auto">
        {/* Bounded height + overflow-hidden: the card is a hard frame. */}
        <Card className="flex flex-col h-[70vh] md:h-[75vh] shrink-0 overflow-hidden">
          <CardHeader className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Northstar Homes — Chat with Riya</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={endConversation}>
                End Conversation &amp; View Analytics
              </Button>
            </div>
          </CardHeader>

          {/* min-h-0 is the fix: it lets this flex child shrink below its
              content height so the ScrollArea inside can actually scroll. */}
          <CardContent className="flex-1 min-h-0 p-0">
            <ScrollArea ref={scrollRef} className="h-full">
              <div className="flex flex-col gap-3">
                {messages.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    Ask Riya about homes, pricing, and availability.
                  </div>
                )}

                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex items-end gap-3 min-w-0 ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {m.role === "assistant" && (
                      <Avatar className="shrink-0 bg-muted text-foreground">
                        <AvatarFallback>R</AvatarFallback>
                      </Avatar>
                    )}

                    {/* wrap-anywhere + min-w-0: a long unbroken token (URL,
                        pasted id) breaks instead of overflowing the card. */}
                    <div
                      className={`max-w-[80%] min-w-0 wrap-anywhere px-4 py-2 text-sm rounded-lg ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted text-foreground rounded-bl-none"
                      }`}
                    >
                      {m.content}
                    </div>

                    {m.role === "user" && <div className="w-9 shrink-0" />}
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-3 justify-start">
                    <Avatar className="shrink-0 bg-muted text-foreground">
                      <AvatarFallback>R</AvatarFallback>
                    </Avatar>
                    <Badge className="bg-muted text-muted-foreground">
                      <span className="animate-pulse">typing</span>
                      <span className="ml-2">...</span>
                    </Badge>
                  </div>
                )}

                {/* auto-scroll target */}
                <div ref={bottomRef} className="h-0 shrink-0" aria-hidden />
              </div>
            </ScrollArea>
          </CardContent>

          {/* Outside the scroll area and shrink-0, so the composer never moves. */}
          <CardFooter className="shrink-0">
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

        {analytics && (
          <>
            <Separator className="my-0 shrink-0" />
            <Card className="shrink-0">
              <CardHeader>
                <CardTitle>Conversation Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(analytics).map(([k, v]) => {
                    const isBadge = ["interest_level", "site_visit_status", "opt_out"].includes(k)
                    return (
                      <div key={k} className="flex items-center justify-between gap-3">
                        <div className="text-sm text-muted-foreground capitalize">
                          {k.replace(/_/g, " ")}
                        </div>
                        <div>
                          {isBadge ? (
                            <Badge className="bg-primary/15 text-foreground">{String(v)}</Badge>
                          ) : (
                            <div className="text-sm text-foreground">{String(v)}</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
