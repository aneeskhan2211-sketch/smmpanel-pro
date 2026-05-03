import type { SupportMessage, SupportTicket, TicketStatus } from "@/types";
import { useCallback, useState } from "react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_MESSAGES: SupportMessage[] = [
  {
    id: "msg-1",
    ticketId: "ticket-1",
    content:
      "Hi, I placed an order 2 hours ago for Instagram followers but it still shows pending. Order ID is #ORD-8821. Can you please check?",
    isAdmin: false,
    createdAt: Date.now() - 7200000,
  },
  {
    id: "msg-2",
    ticketId: "ticket-1",
    content:
      "Hello! Thanks for reaching out. We've checked your order and it's currently in the processing queue with our provider. There's a slight delay due to high demand — expect delivery within the next 30 minutes. We apologize for the inconvenience!",
    isAdmin: true,
    createdAt: Date.now() - 5400000,
  },
  {
    id: "msg-3",
    ticketId: "ticket-1",
    content:
      "Thank you for the update! I'll wait. Is there any way to get a notification when it starts?",
    isAdmin: false,
    createdAt: Date.now() - 4800000,
  },
  {
    id: "msg-4",
    ticketId: "ticket-1",
    content:
      "Absolutely! You'll receive an in-app notification once the order status changes to 'Active'. You can also track it in real-time on the Orders page. Let us know if you need anything else!",
    isAdmin: true,
    createdAt: Date.now() - 3600000,
  },
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "ticket-1",
    subject: "Order #ORD-8821 pending for 2 hours",
    status: "open",
    priority: "high",
    messages: MOCK_MESSAGES,
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: "ticket-2",
    subject: "Refund request for cancelled YouTube order",
    status: "resolved",
    priority: "medium",
    messages: [
      {
        id: "msg-5",
        ticketId: "ticket-2",
        content:
          "My YouTube views order was cancelled automatically. I need a refund to my wallet.",
        isAdmin: false,
        createdAt: Date.now() - 86400000 * 3,
      },
      {
        id: "msg-6",
        ticketId: "ticket-2",
        content:
          "Hi! We've processed the refund of $4.20 to your wallet. You should see it reflected immediately. Sorry for the trouble!",
        isAdmin: true,
        createdAt: Date.now() - 86400000 * 2,
      },
    ],
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: "ticket-3",
    subject: "API integration not returning correct status codes",
    status: "in_progress",
    priority: "medium",
    messages: [
      {
        id: "msg-7",
        ticketId: "ticket-3",
        content:
          "I'm integrating your API and the order status endpoint returns 'undefined' for completed orders. Using API key ending in ...XK92.",
        isAdmin: false,
        createdAt: Date.now() - 86400000,
      },
      {
        id: "msg-8",
        ticketId: "ticket-3",
        content:
          "Thanks for reporting this! Our engineering team is looking into it. We'll update this ticket once we have a fix deployed.",
        isAdmin: true,
        createdAt: Date.now() - 82800000,
      },
    ],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 82800000,
  },
];

export type TicketCategory = "billing" | "technical" | "order" | "general";

export interface CreateTicketPayload {
  subject: string;
  category: TicketCategory;
  message: string;
}

export function useSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);

  const createTicket = useCallback((payload: CreateTicketPayload) => {
    const id = `ticket-${Date.now()}`;
    const newTicket: SupportTicket = {
      id,
      subject: payload.subject,
      status: "open",
      priority: "medium",
      messages: [
        {
          id: `msg-${Date.now()}`,
          ticketId: id,
          content: payload.message,
          isAdmin: false,
          createdAt: Date.now(),
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  }, []);

  const replyToTicket = useCallback((ticketId: string, content: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              updatedAt: Date.now(),
              messages: [
                ...t.messages,
                {
                  id: `msg-${Date.now()}`,
                  ticketId,
                  content,
                  isAdmin: false,
                  createdAt: Date.now(),
                },
              ],
            }
          : t,
      ),
    );
  }, []);

  const updateTicketStatus = useCallback(
    (ticketId: string, status: TicketStatus) => {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status, updatedAt: Date.now() } : t,
        ),
      );
    },
    [],
  );

  return { tickets, createTicket, replyToTicket, updateTicketStatus };
}

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    question: "What is an SMM panel?",
    answer:
      "An SMM (Social Media Marketing) panel is a platform where you can buy social media services like followers, likes, views, and more for various platforms such as Instagram, YouTube, TikTok, and others. Our panel connects you with high-quality providers at competitive prices.",
    category: "General",
  },
  {
    id: "faq-2",
    question: "How do I place an order?",
    answer:
      'Navigate to the "New Order" section from the sidebar. Select a service, paste your profile or post link, enter the desired quantity, and click "Place Order". The system will auto-calculate the price and show estimated delivery time before you confirm.',
    category: "Orders",
  },
  {
    id: "faq-3",
    question: "Is a refund available if my order fails?",
    answer:
      "Yes! If an order fails or is cancelled due to a provider issue, the full amount is automatically refunded to your wallet balance within minutes. For partial deliveries, a proportional refund is issued. Manual refund requests can be raised via a support ticket.",
    category: "Billing",
  },
  {
    id: "faq-4",
    question: "How long does delivery take?",
    answer:
      "Delivery time varies by service and is clearly shown on each service card. Most orders start within 0–30 minutes. Fast services complete within a few hours, while longer campaigns (e.g., watch time) may take 2–7 days. You can track real-time progress on the Orders page.",
    category: "Orders",
  },
  {
    id: "faq-5",
    question: "Why is my order stuck in pending status?",
    answer:
      "Pending status means the order is in our processing queue. This typically lasts 1–15 minutes during normal load. If an order stays pending for more than 30 minutes, it may be due to high provider demand or a temporary issue. Open a support ticket with your Order ID for quick resolution.",
    category: "Orders",
  },
  {
    id: "faq-6",
    question: "What payment methods are accepted?",
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard), net banking, and popular digital wallets via our secure payment gateway. All transactions are encrypted with bank-grade SSL. Minimum top-up is $5. Funds are credited to your wallet instantly upon successful payment.",
    category: "Billing",
  },
  {
    id: "faq-7",
    question: "How do subscriptions work?",
    answer:
      "Subscriptions give you discounted service rates and priority delivery. Pro ($9.99/month) offers 15% off all services, while Premium ($19.99/month) gives 25% off plus priority queue access. You can manage or cancel your subscription anytime from the Subscriptions page.",
    category: "Billing",
  },
  {
    id: "faq-8",
    question: "Can I cancel an order after placing it?",
    answer:
      "Orders can be cancelled if they have not started yet (still in Pending status). Once an order moves to Active or Processing, it cannot be cancelled as the delivery has begun. For eligible cancellations, the full amount is refunded to your wallet immediately.",
    category: "Orders",
  },
  {
    id: "faq-9",
    question: "What is the API and how do I use it?",
    answer:
      "Our REST API lets you automate order placement, check service lists, and monitor order statuses programmatically. Perfect for resellers and agencies. Generate your API key from Settings, then check the API documentation page for endpoint details and code examples.",
    category: "Technical",
  },
  {
    id: "faq-10",
    question: "Is my data and account safe?",
    answer:
      "Absolutely. We use Internet Identity for secure, passwordless authentication — your account can never be compromised via password breaches. All data is stored on the Internet Computer blockchain, which provides tamper-proof, decentralized security. We never store or share your personal data.",
    category: "Security",
  },
  {
    id: "faq-11",
    question: "How do I contact support?",
    answer:
      "Use the Create New Ticket button on this page to open a support ticket. Our team responds within 1–4 hours during business hours (9am–10pm, 7 days a week). For urgent issues, open a ticket and describe the urgency. We aim to resolve all tickets within 24 hours.",
    category: "General",
  },
  {
    id: "faq-12",
    question: "What are the different service quality levels?",
    answer:
      "Services are rated on a 5-star quality scale shown on each card. Fast services prioritize speed over retention. High Quality services use real-looking accounts with better retention rates but slightly slower delivery. Premium services offer the best retention and are ideal for long-term growth.",
    category: "Services",
  },
];
