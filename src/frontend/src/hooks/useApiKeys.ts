import { useCallback, useState } from "react";

export interface ApiKey {
  id: string;
  name: string;
  maskedKey: string;
  fullKey?: string;
  createdAt: string;
  lastUsed: string | null;
  usageCount: number;
  isActive: boolean;
}

const MOCK_KEYS: ApiKey[] = [
  {
    id: "key_1",
    name: "Production App",
    maskedKey: "sk_live_••••••••••••••••••••••••••••••••1a2b",
    createdAt: "2026-01-15T10:23:00Z",
    lastUsed: "2026-05-01T18:45:00Z",
    usageCount: 4823,
    isActive: true,
  },
  {
    id: "key_2",
    name: "Dev Environment",
    maskedKey: "sk_live_••••••••••••••••••••••••••••••••9f3c",
    createdAt: "2026-02-28T08:12:00Z",
    lastUsed: "2026-04-20T12:30:00Z",
    usageCount: 211,
    isActive: true,
  },
];

function generateKey(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "sk_live_";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function maskKey(key: string): string {
  const last4 = key.slice(-4);
  return `sk_live_${"•".repeat(32)}${last4}`;
}

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>(MOCK_KEYS);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNewKey = useCallback(async (name: string): Promise<ApiKey> => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 600));
    const fullKey = generateKey();
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: name || "Unnamed Key",
      maskedKey: maskKey(fullKey),
      fullKey,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      usageCount: 0,
      isActive: true,
    };
    setKeys((prev) => [newKey, ...prev]);
    setIsGenerating(false);
    return newKey;
  }, []);

  const revokeKey = useCallback((id: string) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, isActive: false } : k)),
    );
  }, []);

  return { keys, isGenerating, generateNewKey, revokeKey };
}
