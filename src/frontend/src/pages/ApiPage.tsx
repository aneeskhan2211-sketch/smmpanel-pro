import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ApiKey, useApiKeys } from "@/hooks/useApiKeys";
import {
  AlertTriangle,
  BarChart2,
  BookOpen,
  Check,
  Clock,
  Copy,
  Key,
  Plus,
  ShieldOff,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";

// ─── API Key Card ──────────────────────────────────────────────────────────────
function ApiKeyCard({
  apiKey,
  index,
  onRevoke,
}: {
  apiKey: ApiKey;
  index: number;
  onRevoke: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopyMasked() {
    navigator.clipboard.writeText(apiKey.maskedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatDate(iso: string | null) {
    if (!iso) return "Never";
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      data-ocid={`api_keys.item.${index + 1}`}
      className="card-hover rounded-xl border border-border bg-card p-5 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Key className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-display font-semibold text-sm truncate">
              {apiKey.name}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate max-w-[220px] sm:max-w-[360px]">
              {apiKey.maskedKey}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge
            variant={apiKey.isActive ? "default" : "secondary"}
            className={
              apiKey.isActive
                ? "bg-accent/20 text-accent border-accent/30 hover:bg-accent/20"
                : "opacity-50"
            }
          >
            {apiKey.isActive ? "Active" : "Revoked"}
          </Badge>
          <button
            type="button"
            aria-label="Copy key"
            onClick={handleCopyMasked}
            data-ocid={`api_keys.copy_button.${index + 1}`}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-accent" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
        <div className="space-y-0.5">
          <p className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Created
          </p>
          <p className="text-foreground font-medium">
            {formatDate(apiKey.createdAt)}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="flex items-center gap-1">
            <Zap className="w-3 h-3" /> Last Used
          </p>
          <p className="text-foreground font-medium">
            {formatDate(apiKey.lastUsed)}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="flex items-center gap-1">
            <BarChart2 className="w-3 h-3" /> Requests
          </p>
          <p className="text-foreground font-medium">
            {apiKey.usageCount.toLocaleString()}
          </p>
        </div>
      </div>

      {apiKey.isActive && (
        <div className="pt-1 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-ocid={`api_keys.revoke_button.${index + 1}`}
            onClick={() => onRevoke(apiKey.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-3"
          >
            <ShieldOff className="w-3.5 h-3.5 mr-1.5" />
            Revoke Key
          </Button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Code Block ────────────────────────────────────────────────────────────────
function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="relative rounded-lg bg-muted border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{lang}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <Check className="w-3 h-3" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="px-4 py-3 overflow-x-auto text-xs font-mono text-foreground leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Endpoint Card ─────────────────────────────────────────────────────────────
interface Endpoint {
  method: "GET" | "POST";
  path: string;
  description: string;
  request: string;
  response: string;
}

function EndpointCard({
  endpoint,
  index,
}: { endpoint: Endpoint; index: number }) {
  const methodColor =
    endpoint.method === "GET"
      ? "bg-primary/15 text-primary border-primary/30"
      : "bg-accent/15 text-accent border-accent/30";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      data-ocid={`api_docs.endpoint.${index + 1}`}
      className="rounded-xl border border-border bg-card p-5 space-y-4"
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${methodColor}`}
        >
          {endpoint.method}
        </span>
        <code className="text-sm font-mono text-foreground">
          {endpoint.path}
        </code>
      </div>
      <p className="text-sm text-muted-foreground">{endpoint.description}</p>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Request
          </p>
          <CodeBlock code={endpoint.request} lang="bash" />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Response
          </p>
          <CodeBlock code={endpoint.response} lang="json" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Documentation data ────────────────────────────────────────────────────────
const ENDPOINTS: Endpoint[] = [
  {
    method: "POST",
    path: "/api/orders",
    description: "Create a new SMM order for a specific service.",
    request: `curl -X POST https://api.smmpanel.io/api/orders \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"service_id": "ig_followers_1", "link": "https://instagram.com/user", "quantity": 1000}'`,
    response: `{
  "order_id": "ord_9xK2pL",
  "status": "pending",
  "service": "Instagram Followers HQ",
  "quantity": 1000,
  "price": 2.50,
  "estimated_delivery": "24h"
}`,
  },
  {
    method: "GET",
    path: "/api/orders/:id",
    description:
      "Retrieve the current status and details of an existing order.",
    request: `curl https://api.smmpanel.io/api/orders/ord_9xK2pL \\
  -H "X-API-Key: YOUR_API_KEY"`,
    response: `{
  "order_id": "ord_9xK2pL",
  "status": "in_progress",
  "start_count": 1200,
  "current_count": 1850,
  "remains": 350,
  "updated_at": "2026-05-02T14:30:00Z"
}`,
  },
  {
    method: "GET",
    path: "/api/services",
    description: "List all available services with pricing and limits.",
    request: `curl https://api.smmpanel.io/api/services \\
  -H "X-API-Key: YOUR_API_KEY"`,
    response: `[
  {
    "id": "ig_followers_1",
    "name": "Instagram Followers HQ",
    "category": "Instagram",
    "price_per_1000": 2.50,
    "min": 100,
    "max": 100000,
    "refill": true
  }
]`,
  },
  {
    method: "GET",
    path: "/api/wallet",
    description:
      "Get the current wallet balance and currency for your account.",
    request: `curl https://api.smmpanel.io/api/wallet \\
  -H "X-API-Key: YOUR_API_KEY"`,
    response: `{
  "balance": 16605.00,
  "currency": "USD",
  "updated_at": "2026-05-02T18:00:00Z"
}`,
  },
  {
    method: "POST",
    path: "/api/wallet/topup",
    description: "Initiate a wallet top-up and receive a payment redirect URL.",
    request: `curl -X POST https://api.smmpanel.io/api/wallet/topup \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 50.00, "currency": "USD"}'`,
    response: `{
  "transaction_id": "txn_aZ3m9Q",
  "amount": 50.00,
  "payment_url": "https://checkout.stripe.com/...",
  "expires_at": "2026-05-02T19:00:00Z"
}`,
  },
];

const RATE_LIMITS = [
  { plan: "Free", limit: "10 req/min", highlight: false },
  { plan: "Pro", limit: "100 req/min", highlight: false },
  { plan: "Premium", limit: "1,000 req/min", highlight: true },
];

// ─── Generate Key Modal ─────────────────────────────────────────────────────────
function GenerateKeyModal({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onGenerate: (name: string) => Promise<ApiKey>;
  isGenerating: boolean;
}) {
  const [name, setName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleGenerate() {
    const newKey = await onGenerate(name);
    if (newKey.fullKey) setGeneratedKey(newKey.fullKey);
  }

  function handleCopyKey() {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  }

  function handleClose() {
    setName("");
    setGeneratedKey(null);
    setKeyCopied(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        data-ocid="api_keys.dialog"
        className="sm:max-w-md bg-card border-border"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {generatedKey ? "Your New API Key" : "Generate API Key"}
          </DialogTitle>
        </DialogHeader>

        {!generatedKey ? (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name (optional)</Label>
              <Input
                ref={inputRef}
                id="key-name"
                data-ocid="api_keys.name_input"
                placeholder="e.g. Production App"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Give this key a recognizable name to identify it later.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-2.5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-300 leading-relaxed">
                <strong>Save this key — it won't be shown again.</strong> Store
                it somewhere secure like a password manager.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={generatedKey}
                  data-ocid="api_keys.generated_key_input"
                  className="font-mono text-xs bg-muted"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  data-ocid="api_keys.copy_generated_button"
                  onClick={handleCopyKey}
                  className="flex-shrink-0"
                >
                  {keyCopied ? (
                    <Check className="w-4 h-4 text-accent" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {!generatedKey ? (
            <>
              <Button
                type="button"
                variant="ghost"
                data-ocid="api_keys.cancel_button"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                data-ocid="api_keys.generate_submit_button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-primary hover:bg-primary/90"
              >
                {isGenerating ? "Generating…" : "Generate Key"}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              data-ocid="api_keys.close_button"
              onClick={handleClose}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Done — I've saved my key
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── API Keys Tab ───────────────────────────────────────────────────────────────
function ApiKeysTab() {
  const { keys, isGenerating, generateNewKey, revokeKey } = useApiKeys();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-lg">Your API Keys</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {keys.length} key{keys.length !== 1 ? "s" : ""} — only the last 4
            characters are shown.
          </p>
        </div>
        <Button
          type="button"
          data-ocid="api_keys.generate_button"
          onClick={() => setModalOpen(true)}
          className="bg-primary hover:bg-primary/90 gap-2"
        >
          <Plus className="w-4 h-4" />
          Generate New Key
        </Button>
      </div>

      {keys.length === 0 ? (
        <div
          data-ocid="api_keys.empty_state"
          className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl border border-dashed border-border"
        >
          <Key className="w-10 h-10 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">No API keys yet.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setModalOpen(true)}
            data-ocid="api_keys.empty_generate_button"
          >
            Generate your first key
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key, i) => (
            <ApiKeyCard
              key={key.id}
              apiKey={key}
              index={i}
              onRevoke={revokeKey}
            />
          ))}
        </div>
      )}

      <GenerateKeyModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onGenerate={generateNewKey}
        isGenerating={isGenerating}
      />
    </div>
  );
}

// ─── Documentation Tab ─────────────────────────────────────────────────────────
function DocsTab() {
  return (
    <div className="space-y-8">
      {/* Auth header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        data-ocid="api_docs.auth_section"
        className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-3"
      >
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-sm">Authentication</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Include your API key as the{" "}
          <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono">
            X-API-Key
          </code>{" "}
          header in all requests.
        </p>
        <CodeBlock
          code={`curl https://api.smmpanel.io/api/services \\
  -H "X-API-Key: sk_live_yourAPIKeyHere"`}
          lang="bash"
        />
      </motion.div>

      {/* Rate limits */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        data-ocid="api_docs.rate_limits_section"
        className="space-y-3"
      >
        <h3 className="font-display font-semibold">Rate Limits</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {RATE_LIMITS.map((r) => (
            <div
              key={r.plan}
              className={`rounded-xl border p-4 text-center space-y-1 ${
                r.highlight
                  ? "border-accent/40 bg-accent/10"
                  : "border-border bg-card"
              }`}
            >
              <p
                className={`text-xs font-medium uppercase tracking-wide ${
                  r.highlight ? "text-accent" : "text-muted-foreground"
                }`}
              >
                {r.plan}
              </p>
              <p
                className={`font-display font-bold text-lg ${
                  r.highlight ? "text-accent" : "text-foreground"
                }`}
              >
                {r.limit}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Endpoints */}
      <div className="space-y-4">
        <h3 className="font-display font-semibold">Endpoints</h3>
        {ENDPOINTS.map((ep, i) => (
          <EndpointCard key={ep.path} endpoint={ep} index={i} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function ApiPage() {
  return (
    <div data-ocid="api.page" className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">API Access</h1>
            <p className="text-sm text-muted-foreground">
              Automate orders and integrate with your platform.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="keys" className="space-y-5">
        <TabsList data-ocid="api.tabs" className="bg-card border border-border">
          <TabsTrigger
            value="keys"
            data-ocid="api.keys_tab"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Key className="w-3.5 h-3.5 mr-1.5" />
            API Keys
          </TabsTrigger>
          <TabsTrigger
            value="docs"
            data-ocid="api.docs_tab"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys">
          <ApiKeysTab />
        </TabsContent>
        <TabsContent value="docs">
          <DocsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
