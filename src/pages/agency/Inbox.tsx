import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Send, Sparkles, CheckCircle2, XCircle, CalendarPlus, Bot, User as UserIcon, Phone, RefreshCw, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  agency_id: string;
  property_id: string | null;
  lead_id: string | null;
  tenant_name: string | null;
  tenant_email: string | null;
  tenant_phone: string | null;
  property_title: string | null;
  status: string;
  last_message_at: string;
  unread_count: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_type: "ai" | "agent" | "tenant" | "system";
  sender_name: string | null;
  body: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface Lead {
  id: string;
  qualification_status: string | null;
  qualification_score: number | null;
  qualification_reasons: unknown;
  ai_summary: string | null;
  viewing_invited_at: string | null;
  viewing_accepted_at: string | null;
  viewing_declined_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
}

const statusFilterMap = {
  all: null,
  qualified: "qualified",
  pending: "pending",
  rejected: "rejected",
} as const;

type FilterKey = keyof typeof statusFilterMap;

const statusBadge = (status: string | null) => {
  switch (status) {
    case "qualified":
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Qualified</Badge>;
    case "pending":
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
    case "rejected":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
    default:
      return <Badge variant="outline">New</Badge>;
  }
};

export default function Inbox() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [leadsById, setLeadsById] = useState<Record<string, Lead>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeId, setActiveId] = useState<string | null>(searchParams.get("conversation"));
  const [filter, setFilter] = useState<FilterKey>("all");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load conversations + leads
  const refreshConversations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("agency_id", user.id)
      .order("last_message_at", { ascending: false });
    const convs = (data ?? []) as Conversation[];
    setConversations(convs);

    const leadIds = convs.map((c) => c.lead_id).filter(Boolean) as string[];
    if (leadIds.length) {
      const { data: ls } = await supabase
        .from("leads")
        .select("id, qualification_status, qualification_score, qualification_reasons, ai_summary, viewing_invited_at, viewing_accepted_at, viewing_declined_at, approved_at, rejected_at")
        .in("id", leadIds);
      const map: Record<string, Lead> = {};
      (ls ?? []).forEach((l: any) => (map[l.id] = l));
      setLeadsById(map);
    }
  };

  useEffect(() => {
    refreshConversations();
    if (!user) return;
    const ch = supabase
      .channel(`inbox-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations", filter: `agency_id=eq.${user.id}` },
        () => refreshConversations()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads", filter: `agency_id=eq.${user.id}` },
        () => refreshConversations()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Load active conversation messages
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    const load = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeId)
        .order("created_at", { ascending: true });
      setMessages((data ?? []) as Message[]);
      // mark conversation read
      await supabase.from("conversations").update({ unread_count: 0 }).eq("id", activeId);
    };
    load();
    const ch = supabase
      .channel(`conv-${activeId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const filtered = useMemo(() => {
    if (filter === "all") return conversations;
    const target = statusFilterMap[filter];
    return conversations.filter((c) => {
      const lead = c.lead_id ? leadsById[c.lead_id] : null;
      return lead?.qualification_status === target;
    });
  }, [conversations, leadsById, filter]);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const activeLead = active?.lead_id ? leadsById[active.lead_id] ?? null : null;

  const handleSelect = (id: string) => {
    setActiveId(id);
    setSearchParams({ conversation: id });
  };

  const sendAgentMessage = async () => {
    if (!activeId || !draft.trim() || !user) return;
    setSending(true);
    const body = draft.trim();
    setDraft("");
    const { error } = await supabase.from("messages").insert({
      conversation_id: activeId,
      sender_type: "agent",
      sender_name: "You",
      body,
    });
    if (error) {
      toast.error("Failed to send: " + error.message);
      setDraft(body);
    } else {
      // Mark conversation as agent-handled
      await supabase.from("conversations").update({ status: "agent_handling" }).eq("id", activeId);
    }
    setSending(false);
  };

  const handleApprove = async () => {
    if (!active || !active.lead_id) return;
    await supabase
      .from("leads")
      .update({ approved_at: new Date().toISOString() })
      .eq("id", active.lead_id);
    await supabase.from("messages").insert({
      conversation_id: active.id,
      sender_type: "system",
      sender_name: "System",
      body: `✅ Agent approved this candidate. Viewing protocol triggered.`,
    });
    await supabase.from("messages").insert({
      conversation_id: active.id,
      sender_type: "ai",
      sender_name: "Modero AI",
      body: `Hi ${active.tenant_name ?? "there"}! ${active.property_title ?? "The agency"} has pre-approved your application. 🏠\n\nViewing Invitation — please reply with a time that works:\n• Tomorrow 11:00\n• Tomorrow 17:00\n• Saturday 10:30\n\nYou are 1 of only 2 qualified candidates for this listing.`,
    });
    await supabase
      .from("leads")
      .update({ viewing_invited_at: new Date().toISOString() })
      .eq("id", active.lead_id);
    toast.success("Approved — viewing invite sent to tenant");
  };

  const handleReject = async () => {
    if (!active || !active.lead_id) return;
    await supabase
      .from("leads")
      .update({ rejected_at: new Date().toISOString(), qualification_status: "rejected" })
      .eq("id", active.lead_id);
    await supabase.from("messages").insert({
      conversation_id: active.id,
      sender_type: "system",
      sender_name: "System",
      body: `❌ Agent rejected this candidate. Conversation archived.`,
    });
    await supabase.from("conversations").update({ status: "closed" }).eq("id", active.id);
    toast.error("Rejected");
  };

  const simulateNew = async () => {
    if (!user) return;
    setSimulating(true);
    try {
      const { data, error } = await supabase.functions.invoke("simulate-incoming-lead", {
        body: { agency_id: user.id },
      });
      if (error) throw error;
      toast.success("New simulated inquiry — AI brain processing…");
      setTimeout(refreshConversations, 800);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to simulate");
    } finally {
      setSimulating(false);
    }
  };

  const simulateTenantReply = async (kind: "accept_viewing" | "decline_viewing" | "question") => {
    if (!active) return;
    try {
      const { error } = await supabase.functions.invoke("simulate-tenant-response", {
        body: { conversation_id: active.id, kind },
      });
      if (error) throw error;
      toast.info("Tenant reply incoming…");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Conversation list */}
      <aside className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Inbox
            </h1>
            <Button
              size="sm"
              variant="outline"
              onClick={simulateNew}
              disabled={simulating}
              className="gap-1"
            >
              {simulating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              Simulate
            </Button>
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
            <TabsList className="grid w-full grid-cols-4 h-8">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="qualified" className="text-xs">✓</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">…</TabsTrigger>
              <TabsTrigger value="rejected" className="text-xs">✗</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <ScrollArea className="flex-1">
          {filtered.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground text-center">
              No conversations. Click "Simulate" to spawn a demo inquiry.
            </p>
          ) : (
            filtered.map((c) => {
              const lead = c.lead_id ? leadsById[c.lead_id] : null;
              const isActive = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c.id)}
                  className={`w-full text-left p-3 border-b border-border hover:bg-accent/50 transition-colors ${
                    isActive ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {(c.tenant_name ?? "?").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">{c.tenant_name ?? "Unknown"}</p>
                        {c.unread_count > 0 && (
                          <span className="h-5 min-w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center px-1">
                            {c.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{c.property_title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {statusBadge(lead?.qualification_status ?? null)}
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(c.last_message_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </ScrollArea>
      </aside>

      {/* Active conversation */}
      <main className="flex-1 flex flex-col bg-muted/20">
        {!active ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Select a conversation to begin</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-background border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {(active.tenant_name ?? "?").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{active.tenant_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    {active.tenant_phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {active.tenant_phone}
                      </span>
                    )}
                    <span>·</span>
                    <span>{active.property_title}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(activeLead?.qualification_status ?? null)}
                {activeLead?.qualification_score != null && (
                  <Badge variant="outline">Score {activeLead.qualification_score}</Badge>
                )}
              </div>
            </div>

            {/* AI summary banner */}
            {activeLead?.ai_summary && (
              <div className="bg-primary/5 border-b border-primary/10 px-4 py-2 flex items-start gap-2">
                <Bot className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-primary">Modero AI · </span>
                  <span className="text-foreground">{activeLead.ai_summary}</span>
                  {Array.isArray(activeLead.qualification_reasons) && activeLead.qualification_reasons.length > 0 && (
                    <ul className="mt-1 text-muted-foreground list-disc pl-4">
                      {(activeLead.qualification_reasons as string[]).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Action bar */}
            {activeLead?.qualification_status === "qualified" && !activeLead.approved_at && !activeLead.rejected_at && (
              <div className="bg-background border-b border-border px-4 py-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium flex-1">Action required: approve to trigger Viewing Protocol</span>
                <Button size="sm" variant="outline" onClick={handleReject} className="gap-1">
                  <XCircle className="h-3 w-3" /> Reject
                </Button>
                <Button size="sm" onClick={handleApprove} className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Approve
                </Button>
              </div>
            )}

            {activeLead?.viewing_invited_at && !activeLead.viewing_accepted_at && !activeLead.viewing_declined_at && (
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
                <CalendarPlus className="h-4 w-4 text-amber-600" />
                <span className="text-xs flex-1">Viewing invite sent — waiting for tenant reply.</span>
                <Button size="sm" variant="outline" onClick={() => simulateTenantReply("accept_viewing")}>
                  Sim: Accept
                </Button>
                <Button size="sm" variant="outline" onClick={() => simulateTenantReply("decline_viewing")}>
                  Sim: Decline
                </Button>
              </div>
            )}

            {activeLead?.viewing_accepted_at && (
              <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Viewing accepted · direct WhatsApp thread opened between agent & tenant.
              </div>
            )}

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => {
                const isAgent = m.sender_type === "agent";
                const isAi = m.sender_type === "ai";
                const isSystem = m.sender_type === "system";
                if (isSystem) {
                  return (
                    <div key={m.id} className="text-center">
                      <span className="inline-block text-[10px] uppercase tracking-wide text-muted-foreground bg-background px-3 py-1 rounded-full border">
                        {m.body}
                      </span>
                    </div>
                  );
                }
                return (
                  <div key={m.id} className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-md ${isAgent ? "items-end" : "items-start"} flex flex-col`}>
                      <div className="flex items-center gap-1 mb-1 px-1">
                        {isAi ? (
                          <Bot className="h-3 w-3 text-primary" />
                        ) : (
                          <UserIcon className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {m.sender_name ?? m.sender_type}
                        </span>
                      </div>
                      <Card
                        className={`px-3 py-2 text-sm whitespace-pre-wrap shadow-sm ${
                          isAgent
                            ? "bg-primary text-primary-foreground"
                            : isAi
                            ? "bg-primary/10 border-primary/20"
                            : "bg-background"
                        }`}
                      >
                        {m.body}
                      </Card>
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">
                        {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Composer */}
            <div className="bg-background border-t border-border p-3 flex gap-2">
              <Input
                placeholder="Type your reply…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendAgentMessage();
                  }
                }}
                disabled={sending}
              />
              <Button onClick={sendAgentMessage} disabled={sending || !draft.trim()} className="gap-1">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
