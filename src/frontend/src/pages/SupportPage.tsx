import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FAQ_ITEMS, type TicketCategory, useSupport } from "@/hooks/useSupport";
import type { SupportTicket, TicketStatus } from "@/types";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  HelpCircle,
  MessageSquare,
  Plus,
  Search,
  Send,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusConfig(status: TicketStatus) {
  switch (status) {
    case "open":
      return {
        label: "Open",
        cls: "bg-primary/20 text-primary border-primary/30",
      };
    case "in_progress":
      return {
        label: "In Progress",
        cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      };
    case "resolved":
      return {
        label: "Resolved",
        cls: "bg-accent/20 text-accent border-accent/30",
      };
    case "closed":
      return {
        label: "Closed",
        cls: "bg-muted text-muted-foreground border-border",
      };
  }
}

const CATEGORY_COLORS: Record<TicketCategory, string> = {
  billing: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  technical: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  order: "bg-primary/20 text-primary border-primary/30",
  general: "bg-muted text-muted-foreground border-border",
};

function inferCategory(subject: string): TicketCategory {
  const s = subject.toLowerCase();
  if (s.includes("refund") || s.includes("payment") || s.includes("billing"))
    return "billing";
  if (
    s.includes("api") ||
    s.includes("technical") ||
    s.includes("integration") ||
    s.includes("status")
  )
    return "technical";
  if (s.includes("order") || s.includes("pending") || s.includes("delivery"))
    return "order";
  return "general";
}

function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

// ─── ChatBubble ───────────────────────────────────────────────────────────────

function ChatBubble({
  content,
  isAdmin,
  time,
}: {
  content: string;
  isAdmin: boolean;
  time: number;
}) {
  return (
    <div className={`flex gap-2 ${isAdmin ? "justify-start" : "justify-end"}`}>
      {isAdmin && (
        <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-1">
          <MessageSquare className="w-3.5 h-3.5 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[76%] flex flex-col gap-1 ${isAdmin ? "items-start" : "items-end"}`}
      >
        {isAdmin && (
          <span className="text-xs font-semibold text-primary">
            Support Team
          </span>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isAdmin
              ? "bg-primary/10 border border-primary/20 text-foreground rounded-tl-sm"
              : "bg-secondary border border-border text-foreground rounded-tr-sm"
          }`}
        >
          {content}
        </div>
        <span className="text-[11px] text-muted-foreground">
          {relativeTime(time)}
        </span>
      </div>
    </div>
  );
}

// ─── TicketRow ────────────────────────────────────────────────────────────────

function TicketRow({
  ticket,
  isExpanded,
  onToggle,
  onReply,
  onStatusChange,
  index,
}: {
  ticket: SupportTicket;
  isExpanded: boolean;
  onToggle: () => void;
  onReply: (id: string, msg: string) => void;
  onStatusChange: (id: string, status: TicketStatus) => void;
  index: number;
}) {
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const category = inferCategory(ticket.subject);
  const sc = statusConfig(ticket.status);

  useEffect(() => {
    if (isExpanded) {
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    }
  }, [isExpanded]);

  function handleSend() {
    if (!replyText.trim()) return;
    onReply(ticket.id, replyText.trim());
    setReplyText("");
  }

  const isLocked = ticket.status === "closed" || ticket.status === "resolved";

  return (
    <motion.div
      layout
      className="rounded-xl border border-border bg-card overflow-hidden"
      style={{
        boxShadow: isExpanded
          ? "0 0 0 1px oklch(var(--primary)/0.2)"
          : undefined,
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.06 }}
      data-ocid={`support.ticket.${index + 1}`}
    >
      <button
        type="button"
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-muted/20 transition-colors duration-150"
        onClick={onToggle}
        data-ocid="support.ticket_row"
      >
        <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10 flex-shrink-0">
          <MessageSquare className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="font-medium text-sm truncate">{ticket.subject}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={`text-xs capitalize ${CATEGORY_COLORS[category]}`}
            >
              {category}
            </Badge>
            <Badge variant="outline" className={`text-xs ${sc.cls}`}>
              {sc.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Updated {relativeTime(ticket.updatedAt)}
            </span>
            <span className="text-xs text-muted-foreground">
              · {ticket.messages.length} msg
              {ticket.messages.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="ml-2 mt-0.5 flex-shrink-0 text-muted-foreground">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border"
          >
            {/* Thread */}
            <div
              className="p-4 space-y-3 max-h-72 overflow-y-auto"
              data-ocid="support.thread_view"
            >
              {ticket.messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  content={msg.content}
                  isAdmin={msg.isAdmin}
                  time={msg.createdAt}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {!isLocked && (
              <div className="px-4 pb-4 pt-3 border-t border-border space-y-3">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply... (Ctrl+Enter to send)"
                  className="min-h-[68px] text-sm resize-none bg-background"
                  data-ocid="support.reply_textarea"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                      handleSend();
                  }}
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSend}
                    disabled={!replyText.trim()}
                    className="gap-2"
                    data-ocid="support.send_reply_button"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Reply
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange(ticket.id, "resolved")}
                    className="gap-2 text-accent border-accent/30 hover:bg-accent/10 hover:text-accent"
                    data-ocid="support.mark_resolved_button"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Resolved
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange(ticket.id, "closed")}
                    className="gap-2 ml-auto"
                    data-ocid="support.close_ticket_button"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Close Ticket
                  </Button>
                </div>
              </div>
            )}

            {isLocked && (
              <div className="px-4 py-3 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">
                  This ticket is {ticket.status}. Open a new ticket if you need
                  further assistance.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── FaqAccordionItem ─────────────────────────────────────────────────────────

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: (typeof FAQ_ITEMS)[number];
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      className="rounded-xl border border-border bg-card overflow-hidden"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.035 }}
    >
      <button
        type="button"
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-muted/20 transition-colors duration-150"
        onClick={onToggle}
        data-ocid={`support.faq_item.${index + 1}`}
      >
        <HelpCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <span className="flex-1 font-medium text-sm min-w-0">
          {item.question}
        </span>
        <Badge
          variant="outline"
          className="text-xs text-muted-foreground flex-shrink-0 mx-2"
        >
          {item.category}
        </Badge>
        <div className="flex-shrink-0 text-muted-foreground">
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-border">
              <p className="text-sm text-muted-foreground leading-relaxed pl-7">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── CreateTicketModal ────────────────────────────────────────────────────────

interface CreatePayload {
  subject: string;
  category: TicketCategory;
  message: string;
}

function CreateTicketModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (p: CreatePayload) => void;
}) {
  const MAX = 1000;

  interface FormValues {
    subject: string;
    category: TicketCategory | "";
    message: string;
  }

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { subject: "", category: "", message: "" },
  });

  const messageLength = watch("message")?.length ?? 0;

  function handleClose() {
    reset();
    onClose();
  }

  function onSubmit(data: FormValues) {
    onCreate({
      subject: data.subject.trim(),
      category: data.category as TicketCategory,
      message: data.message.trim(),
    });
    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[520px] bg-card border-border"
        data-ocid="support.create_ticket_dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Create Support Ticket
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-1">
          <div className="space-y-1.5">
            <Label htmlFor="t-subject">Subject</Label>
            <Input
              id="t-subject"
              placeholder="Briefly describe your issue"
              className="bg-background"
              data-ocid="support.subject_input"
              {...register("subject", {
                required: "Subject is required",
                minLength: {
                  value: 5,
                  message: "Subject must be at least 5 characters",
                },
              })}
            />
            {errors.subject && (
              <p
                className="text-xs text-destructive"
                data-ocid="support.subject.field_error"
              >
                {errors.subject.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="t-category">Category</Label>
            <Controller
              name="category"
              control={control}
              rules={{ required: "Please select a category" }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="t-category"
                    className="bg-background"
                    data-ocid="support.category_select"
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="order">Order Issue</SelectItem>
                    <SelectItem value="billing">
                      Billing &amp; Payments
                    </SelectItem>
                    <SelectItem value="technical">Technical / API</SelectItem>
                    <SelectItem value="general">General Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p
                className="text-xs text-destructive"
                data-ocid="support.category.field_error"
              >
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="t-message">Message</Label>
              <span
                className={`text-xs ${messageLength > MAX ? "text-destructive" : "text-muted-foreground"}`}
              >
                {messageLength}/{MAX}
              </span>
            </div>
            <Textarea
              id="t-message"
              placeholder="Describe your issue in detail. Include order IDs, links, or relevant context."
              className="min-h-[110px] bg-background resize-none text-sm"
              data-ocid="support.message_textarea"
              {...register("message", {
                required: "Message is required",
                minLength: {
                  value: 20,
                  message: "Message must be at least 20 characters",
                },
                maxLength: {
                  value: MAX,
                  message: `Message must be at most ${MAX} characters`,
                },
              })}
            />
            {errors.message && (
              <p
                className="text-xs text-destructive"
                data-ocid="support.message.field_error"
              >
                {errors.message.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="submit"
              className="flex-1"
              data-ocid="support.submit_ticket_button"
            >
              Submit Ticket
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              data-ocid="support.cancel_create_button"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── SupportPage ──────────────────────────────────────────────────────────────

export function SupportPage() {
  const [activeTab, setActiveTab] = useState<"tickets" | "faq">("tickets");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(
    "ticket-1",
  );
  const [openFaqs, setOpenFaqs] = useState<Set<string>>(new Set());
  const [faqSearch, setFaqSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { tickets, createTicket, replyToTicket, updateTicketStatus } =
    useSupport();

  const openCount = tickets.filter(
    (t) => t.status === "open" || t.status === "in_progress",
  ).length;

  const filteredFaqs = faqSearch.trim()
    ? FAQ_ITEMS.filter(
        (f) =>
          f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
          f.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
          f.category.toLowerCase().includes(faqSearch.toLowerCase()),
      )
    : FAQ_ITEMS;

  function toggleFaq(id: string) {
    setOpenFaqs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6" data-ocid="support.page">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <div>
          <h1 className="text-2xl font-display font-bold">Support</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {openCount > 0
              ? `${openCount} active ticket${openCount !== 1 ? "s" : ""} · typical response under 2 hours`
              : "Typical response under 2 hours · 7 days a week"}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowCreate(true)}
          className="gap-2 flex-shrink-0"
          data-ocid="support.create_ticket_button"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </Button>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.07 }}
      >
        {[
          {
            label: "Open",
            value: tickets.filter((t) => t.status === "open").length,
            icon: <MessageSquare className="w-4 h-4" />,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "In Progress",
            value: tickets.filter((t) => t.status === "in_progress").length,
            icon: <Clock className="w-4 h-4" />,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
          },
          {
            label: "Resolved",
            value: tickets.filter(
              (t) => t.status === "resolved" || t.status === "closed",
            ).length,
            icon: <CheckCircle2 className="w-4 h-4" />,
            color: "text-accent",
            bg: "bg-accent/10",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-3 flex items-center gap-3"
          >
            <div
              className={`${stat.color} ${stat.bg} p-2 rounded-lg flex-shrink-0`}
            >
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xl font-display font-bold leading-none">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.12 }}
      >
        <div className="flex gap-1 p-1 bg-muted/40 rounded-xl border border-border w-fit">
          {(["tickets", "faq"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid={`support.${tab}_tab`}
            >
              {tab === "tickets" ? "My Tickets" : "FAQ"}
              {tab === "tickets" && openCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
                  {openCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab panels */}
      <AnimatePresence mode="wait">
        {activeTab === "tickets" && (
          <motion.div
            key="tickets-panel"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
            data-ocid="support.tickets_list"
          >
            {tickets.length === 0 ? (
              <div
                className="rounded-xl border border-dashed border-border bg-card p-12 text-center"
                data-ocid="support.tickets_empty_state"
              >
                <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">No support tickets yet</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Our team responds within 2 hours, 7 days a week.
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowCreate(true)}
                  className="gap-2"
                  data-ocid="support.empty_create_button"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Your First Ticket
                </Button>
              </div>
            ) : (
              tickets.map((ticket, i) => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  index={i}
                  isExpanded={expandedTicket === ticket.id}
                  onToggle={() =>
                    setExpandedTicket((prev) =>
                      prev === ticket.id ? null : ticket.id,
                    )
                  }
                  onReply={replyToTicket}
                  onStatusChange={updateTicketStatus}
                />
              ))
            )}
          </motion.div>
        )}

        {activeTab === "faq" && (
          <motion.div
            key="faq-panel"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
            data-ocid="support.faq_section"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Search frequently asked questions..."
                className="pl-9 bg-card"
                data-ocid="support.faq_search_input"
              />
            </div>

            {filteredFaqs.length === 0 ? (
              <div
                className="rounded-xl border border-dashed border-border bg-card p-10 text-center"
                data-ocid="support.faq_empty_state"
              >
                <HelpCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">
                  No results for "{faqSearch}"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try different keywords or open a support ticket.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFaqs.map((item, i) => (
                  <FaqAccordionItem
                    key={item.id}
                    item={item}
                    isOpen={openFaqs.has(item.id)}
                    onToggle={() => toggleFaq(item.id)}
                    index={i}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <CreateTicketModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={createTicket}
      />
    </div>
  );
}
