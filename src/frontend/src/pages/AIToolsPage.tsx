import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import {
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiCopy,
  FiHash,
  FiLink,
  FiSearch,
  FiUser,
  FiVideo,
  FiZap,
} from "react-icons/fi";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToolId =
  | "caption"
  | "hashtag"
  | "bio"
  | "hook"
  | "calendar"
  | "competitor";

type CaptionResult = { text: string };
type HashtagResult = {
  trending: string[];
  niche: string[];
  longTail: string[];
};
type BioResult = { text: string; chars: number; score: number };
type HookResult = { text: string };
type CalendarDay = { day: string; type: string; topic: string; time: string };
type CompetitorResult = {
  followers: string;
  engagement: string;
  topContent: string[];
  frequency: string;
  strategy: string[];
};

// ─── Mock Data Pools ──────────────────────────────────────────────────────────

const CAPTION_POOLS: Record<string, string[]> = {
  Instagram: [
    "Ready to level up your growth game? 💪 Use trending keywords for max reach and watch your engagement soar! #GrowthHacking #SocialMedia",
    "That feeling when your content strategy starts paying off 🔥 Consistency beats perfection every single time. Drop a ❤️ if you agree!",
    "Stop waiting for the perfect moment — create it ✨ Your audience is already out there looking for exactly what you offer. #ContentCreator",
    "Behind every viral post is hours of strategy and storytelling 📖 Here's mine → #BehindTheScenes #Creator",
    "Growth doesn't happen overnight, but it does happen 📈 Stay consistent, add value, and trust the process. #DigitalMarketing",
  ],
  TikTok: [
    "POV: You discovered the content strategy that 10x'd my views in 30 days 👀 Watch till the end!",
    "Not me spending 3 hours making a 15-second video… and it was worth every minute 🎬 #TikTokCreator",
    "This one hack changed how I approach every single post 🤯 Save this before it gets buried! #FYP",
    "Tell me you're serious about growth without telling me 💯 #GrowthMindset #TikTokTips",
    "The algorithm isn't your enemy — here's how to make it your best friend 🤝 #TikTokMarketing",
  ],
  YouTube: [
    "Most people get this completely wrong — and it's costing them thousands of views every month 😱",
    "I tested 10 different thumbnail styles. Here are the results (data inside 👇)",
    "Everything I wish I knew before hitting 10K subscribers — an honest breakdown.",
    "The ONE thing that changed my channel forever. No clickbait, I promise.",
    "Watch time secrets that YouTube doesn't want you to know about 🔍",
  ],
};

const HASHTAG_POOLS = {
  trending: ["#Viral", "#Trending", "#FYP", "#ExploreMore", "#ContentCreator"],
  niche: [
    "#GrowthHacking",
    "#SocialMediaMarketing",
    "#DigitalStrategy",
    "#BrandBuilding",
    "#InfluencerMarketing",
    "#OnlinePresence",
    "#ContentStrategy",
    "#MarketingTips",
    "#CreatorEconomy",
    "#PersonalBrand",
  ],
  longTail: [
    "#HowToGrowOnInstagram",
    "#SocialMediaTipsForBeginners",
    "#IncreaseEngagementRate",
    "#ContentCalendarIdeas",
    "#InstagramAlgorithmTips",
    "#GrowYourAudienceFast",
    "#ViralContentStrategy",
    "#SocialMediaForBusiness",
    "#BoostYourReach",
    "#ReelsGrowthTips",
    "#YoutubeGrowthStrategy",
    "#OrganicGrowthTips",
    "#ContentCreatorLife",
    "#BeatTheAlgorithm",
    "#EngagementBoost",
  ],
};

const BIO_POOLS = [
  {
    score: 94,
    text: "🚀 Helping creators & brands scale to 100K+ organically | DM for collabs | ✉️ hello@brand.com | 👇 Free growth guide",
  },
  {
    score: 88,
    text: "📈 Social Growth Strategist • 5+ years • 200+ brands grown | Results-driven content | Link in bio for free audit",
  },
  {
    score: 91,
    text: "⚡ Turn followers into customers | Personal brand coach | Featured in Forbes | Book a free call 👇",
  },
];

const HOOK_POOLS: Record<string, string[]> = {
  Reel: [
    "I grew 10K followers in 30 days by doing this ONE thing...",
    "Stop doing THIS if you want more views on your reels",
    "The 3-second trick that keeps people watching till the end",
    "Nobody told me about this reel formula — so I'm telling you",
    "Watch how this one change 4x'd my reach overnight 👇",
  ],
  Short: [
    "This will change how you create Shorts forever...",
    "I tested this for 30 days and here's what happened",
    "The algorithm secret Shorts creators don't want you to know",
    "POV: You just found the fastest way to go viral",
    "Everyone's doing this wrong — here's the right way",
  ],
  Story: [
    "Swipe up to see the result that shocked even me",
    "Honest question: are you making this mistake too?",
    "Behind the scenes of my most viral post ever 👀",
    "This strategy added 2K followers in one weekend",
    "I wouldn't have believed it if I hadn't seen it myself...",
  ],
  Post: [
    "Most people quit right before this happens. Don't be most people.",
    "I've been in this industry for 7 years. Here's what nobody tells you.",
    "Unpopular opinion: posting daily is actually hurting your growth",
    "The post that went from 500 views to 500K — breakdown inside",
    "Real talk: here's why your content isn't converting 👇",
  ],
};

const CALENDAR_TEMPLATES = [
  {
    day: "Mon",
    type: "Educational",
    topic: "Top 5 tips for faster Instagram growth",
    time: "9:00 AM",
  },
  {
    day: "Tue",
    type: "Entertainment",
    topic: "React to a trending viral post",
    time: "12:00 PM",
  },
  {
    day: "Wed",
    type: "Behind-the-Scenes",
    topic: "My content creation morning routine",
    time: "7:00 PM",
  },
  {
    day: "Thu",
    type: "Promotional",
    topic: "Feature your best-performing service",
    time: "11:00 AM",
  },
  {
    day: "Fri",
    type: "Engagement",
    topic: "This or That poll: growth tactics",
    time: "6:00 PM",
  },
  {
    day: "Sat",
    type: "Educational",
    topic: "Algorithm myth-busting thread",
    time: "10:00 AM",
  },
  {
    day: "Sun",
    type: "Inspirational",
    topic: "Weekly win spotlight + community shoutout",
    time: "8:00 PM",
  },
  {
    day: "Mon",
    type: "Tutorial",
    topic: "How to write captions that convert",
    time: "9:00 AM",
  },
  {
    day: "Tue",
    type: "Behind-the-Scenes",
    topic: "Order fulfilment & quality process",
    time: "12:00 PM",
  },
  {
    day: "Wed",
    type: "Promotional",
    topic: "Limited-time bundle offer reveal",
    time: "7:00 PM",
  },
  {
    day: "Thu",
    type: "Educational",
    topic: "5 hashtag mistakes killing your reach",
    time: "11:00 AM",
  },
  {
    day: "Fri",
    type: "Engagement",
    topic: "AMA: Answer your audience's questions",
    time: "5:00 PM",
  },
  {
    day: "Sat",
    type: "Entertainment",
    topic: "Collab or reaction content",
    time: "2:00 PM",
  },
  {
    day: "Sun",
    type: "Inspirational",
    topic: "Client transformation story",
    time: "9:00 AM",
  },
];

const COMPETITOR_RESULT: CompetitorResult = {
  followers: "47.3K",
  engagement: "3.8%",
  topContent: ["Tutorial Reels", "Before & After Posts", "Product Unboxing"],
  frequency: "5 posts/week (mostly Tue, Thu, Sat)",
  strategy: [
    "🎯 Post 60% Reels — competitor rarely uses them, leaving huge reach gap.",
    "📊 Their avg comment rate is 1.1% — beat it with Story polls + Q&A stickers.",
    "⏰ Best time to post: Wed & Sun 8-9 PM — competitor is inactive then.",
    "💡 Create comparison posts — 'Basic vs Premium quality' performs 3× better.",
    "🔁 Repurpose top posts as Carousels — saves/shares are 40% higher for carousels.",
  ],
};

// ─── Utility ──────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy to clipboard"
      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
    >
      {copied ? (
        <FiCheck className="w-4 h-4 text-accent" />
      ) : (
        <FiCopy className="w-4 h-4" />
      )}
    </button>
  );
}

function ResultCard({
  children,
  copyText,
}: { children: React.ReactNode; copyText: string }) {
  return (
    <div className="flex items-start justify-between gap-2 bg-muted/30 border border-border rounded-lg p-3">
      <div className="text-sm text-foreground leading-relaxed flex-1 min-w-0">
        {children}
      </div>
      <CopyButton text={copyText} />
    </div>
  );
}

function AILabel() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-primary/80 font-medium">
      <FiZap className="w-3 h-3" /> AI-powered suggestion
    </span>
  );
}

function Select({
  value,
  onChange,
  options,
  label,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
  id: string;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
      {children}
    </p>
  );
}

// ─── Tool Definitions (for landing grid) ─────────────────────────────────────

const TOOLS: {
  id: ToolId;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
  badgeClass: string;
}[] = [
  {
    id: "caption",
    icon: <FiZap />,
    title: "Caption Generator",
    description:
      "Generate viral captions with hashtags tailored to your platform and tone.",
    badge: "Most Used",
    badgeClass: "bg-accent/20 text-accent border-accent/30",
  },
  {
    id: "hashtag",
    icon: <FiHash />,
    title: "Hashtag Generator",
    description:
      "Get 30 targeted hashtags — trending, niche, and long-tail — in one click.",
    badge: "High ROI",
    badgeClass: "bg-primary/20 text-primary border-primary/30",
  },
  {
    id: "bio",
    icon: <FiUser />,
    title: "Bio Optimizer",
    description:
      "Craft 3 optimized bio variations with character count and conversion score.",
    badge: "Conversion",
    badgeClass: "bg-warning/20 text-warning border-warning/30",
  },
  {
    id: "hook",
    icon: <FiVideo />,
    title: "Viral Hook Generator",
    description:
      "Scroll-stopping first lines that keep viewers watching till the end.",
    badge: "Reels Ready",
    badgeClass: "bg-info/20 text-info border-info/30",
  },
  {
    id: "calendar",
    icon: <FiCalendar />,
    title: "Content Calendar",
    description:
      "2-week content plan with post types, topics, and optimal posting times.",
    badge: "Planning",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
  {
    id: "competitor",
    icon: <FiSearch />,
    title: "Competitor Analyzer",
    description:
      "Uncover competitor strategy gaps and get a custom plan to beat them.",
    badge: "Strategy",
    badgeClass: "bg-destructive/20 text-destructive border-destructive/30",
  },
];

// ─── Individual Tool Forms ─────────────────────────────────────────────────────

function CaptionTool() {
  const [desc, setDesc] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [tone, setTone] = useState("Casual");
  const [results, setResults] = useState<CaptionResult[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!desc.trim()) {
      toast.error("Describe your post first");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const pool = CAPTION_POOLS[platform] ?? CAPTION_POOLS.Instagram;
    setResults(pool.map((text) => ({ text })));
    setLoading(false);
    toast.success("5 captions generated!");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          id="caption-platform"
          label="Platform"
          value={platform}
          onChange={setPlatform}
          options={["Instagram", "TikTok", "YouTube", "Facebook"]}
        />
        <Select
          id="caption-tone"
          label="Tone"
          value={tone}
          onChange={setTone}
          options={["Casual", "Professional", "Funny", "Inspirational"]}
        />
      </div>
      <div className="space-y-1">
        <FieldLabel>Describe your post</FieldLabel>
        <Textarea
          placeholder="e.g. sunset beach photo, product launch, fitness motivation"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          className="resize-none bg-background"
          data-ocid="ai_tools.caption_input"
        />
      </div>
      <Button
        onClick={generate}
        disabled={loading}
        className="w-full"
        data-ocid="ai_tools.caption_button"
      >
        {loading ? (
          <>
            <span className="animate-spin mr-2">⚙️</span>Generating...
          </>
        ) : (
          "✨ Generate Captions"
        )}
      </Button>
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 pt-2 border-t border-border"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                5 Captions
              </p>
              <AILabel />
            </div>
            {results.map((r) => (
              <ResultCard key={r.text.slice(0, 32)} copyText={r.text}>
                {r.text}
              </ResultCard>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HashtagTool() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [audience, setAudience] = useState("Creators");
  const [result, setResult] = useState<HashtagResult | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) {
      toast.error("Enter a topic or niche first");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setResult(HASHTAG_POOLS);
    setLoading(false);
    toast.success("30 hashtags generated!");
  };

  const copyAll = () => {
    if (!result) return;
    const all = [...result.trending, ...result.niche, ...result.longTail].join(
      " ",
    );
    navigator.clipboard.writeText(all);
    toast.success("All 30 hashtags copied!");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          id="hashtag-platform"
          label="Platform"
          value={platform}
          onChange={setPlatform}
          options={["Instagram", "TikTok", "YouTube", "Twitter/X"]}
        />
        <Select
          id="hashtag-audience"
          label="Target Audience"
          value={audience}
          onChange={setAudience}
          options={[
            "Creators",
            "Businesses",
            "Entrepreneurs",
            "Fitness",
            "Fashion",
            "Food",
          ]}
        />
      </div>
      <div className="space-y-1">
        <FieldLabel>Topic or Niche</FieldLabel>
        <Textarea
          placeholder="e.g. skincare, fitness, food photography, digital marketing"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={2}
          className="resize-none bg-background"
          data-ocid="ai_tools.hashtag_input"
        />
      </div>
      <Button
        onClick={generate}
        disabled={loading}
        className="w-full"
        data-ocid="ai_tools.hashtag_button"
      >
        {loading ? (
          <>
            <span className="animate-spin mr-2">⚙️</span>Generating...
          </>
        ) : (
          "✨ Generate Hashtags"
        )}
      </Button>
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 pt-2 border-t border-border"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                30 Hashtags
              </p>
              <div className="flex items-center gap-2">
                <AILabel />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAll}
                  className="text-xs h-7 px-2"
                >
                  <FiCopy className="w-3 h-3 mr-1" /> Copy All
                </Button>
              </div>
            </div>
            {[
              {
                label: "🔥 Top Trending (5)",
                tags: result.trending,
                cls: "text-destructive",
              },
              {
                label: "🎯 Niche (10)",
                tags: result.niche,
                cls: "text-primary",
              },
              {
                label: "🔍 Long-tail (15)",
                tags: result.longTail,
                cls: "text-accent",
              },
            ].map((group) => (
              <div key={group.label} className="space-y-1.5">
                <p className={cn("text-xs font-semibold", group.cls)}>
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(tag);
                        toast.success("Copied!");
                      }}
                      className="text-xs bg-muted/50 border border-border rounded-full px-2.5 py-1 text-foreground hover:bg-primary/10 hover:border-primary/40 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BioTool() {
  const [bio, setBio] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [niche, setNiche] = useState("");
  const [results, setResults] = useState<BioResult[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!bio.trim()) {
      toast.error("Enter your current bio first");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setResults(BIO_POOLS.map((b) => ({ ...b, chars: b.text.length })));
    setLoading(false);
    toast.success("3 optimized bios generated!");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          id="bio-platform"
          label="Platform"
          value={platform}
          onChange={setPlatform}
          options={["Instagram", "TikTok", "YouTube", "Twitter/X", "LinkedIn"]}
        />
        <div className="space-y-1">
          <FieldLabel>Niche / Industry</FieldLabel>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. fitness coach, digital marketer"
            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div className="space-y-1">
        <FieldLabel>Current Bio</FieldLabel>
        <Textarea
          placeholder="Paste your current bio here..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={2}
          className="resize-none bg-background"
          data-ocid="ai_tools.bio_input"
        />
      </div>
      <Button
        onClick={generate}
        disabled={loading}
        className="w-full"
        data-ocid="ai_tools.bio_button"
      >
        {loading ? (
          <>
            <span className="animate-spin mr-2">⚙️</span>Optimizing...
          </>
        ) : (
          "✨ Optimize Bio"
        )}
      </Button>
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 pt-2 border-t border-border"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                3 Variations
              </p>
              <AILabel />
            </div>
            {results.map((r) => (
              <div
                key={r.text.slice(0, 32)}
                className="bg-muted/30 border border-border rounded-lg p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground leading-relaxed flex-1 min-w-0">
                    {r.text}
                  </p>
                  <CopyButton text={r.text} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {r.chars} chars
                  </span>
                  <div className="flex items-center gap-1.5 flex-1">
                    <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${r.score}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-accent">
                      {r.score}% score
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HookTool() {
  const [contentType, setContentType] = useState("Reel");
  const [nicheVal, setNicheVal] = useState("Growth");
  const [topic, setTopic] = useState("");
  const [results, setResults] = useState<HookResult[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) {
      toast.error("Enter your main topic first");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const pool = HOOK_POOLS[contentType] ?? HOOK_POOLS.Reel;
    setResults(pool.map((text) => ({ text })));
    setLoading(false);
    toast.success("5 viral hooks generated!");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          id="hook-type"
          label="Content Type"
          value={contentType}
          onChange={setContentType}
          options={["Reel", "Short", "Story", "Post"]}
        />
        <Select
          id="hook-niche"
          label="Niche"
          value={nicheVal}
          onChange={setNicheVal}
          options={[
            "Growth",
            "Fitness",
            "Finance",
            "Fashion",
            "Food",
            "Tech",
            "Business",
          ]}
        />
      </div>
      <div className="space-y-1">
        <FieldLabel>Main Topic</FieldLabel>
        <Textarea
          placeholder="e.g. Instagram growth strategies, morning workout routine, passive income tips"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={2}
          className="resize-none bg-background"
          data-ocid="ai_tools.hook_input"
        />
      </div>
      <Button
        onClick={generate}
        disabled={loading}
        className="w-full"
        data-ocid="ai_tools.hook_button"
      >
        {loading ? (
          <>
            <span className="animate-spin mr-2">⚙️</span>Generating...
          </>
        ) : (
          "✨ Generate Hooks"
        )}
      </Button>
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 pt-2 border-t border-border"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                5 Viral Hooks
              </p>
              <AILabel />
            </div>
            {results.map((r) => (
              <ResultCard key={r.text.slice(0, 32)} copyText={r.text}>
                <span className="text-accent font-semibold">"</span>
                {r.text}
                <span className="text-accent font-semibold">"</span>
              </ResultCard>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const PILLARS = [
  "Educational",
  "Entertainment",
  "Behind-the-Scenes",
  "Promotional",
  "Engagement",
];

function CalendarTool() {
  const [platform, setPlatform] = useState("Instagram");
  const [freq, setFreq] = useState("5");
  const [selectedPillars, setSelectedPillars] = useState<string[]>([
    "Educational",
    "Engagement",
  ]);
  const [results, setResults] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);

  const togglePillar = (p: string) =>
    setSelectedPillars((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );

  const generate = async () => {
    if (selectedPillars.length === 0) {
      toast.error("Select at least one content pillar");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const days = Number(freq);
    const filtered = CALENDAR_TEMPLATES.filter((d) =>
      selectedPillars.some((p) => d.type.includes(p) || true),
    ).slice(0, days * 2);
    setResults(filtered);
    setLoading(false);
    toast.success("2-week calendar generated!");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          id="cal-platform"
          label="Platform"
          value={platform}
          onChange={setPlatform}
          options={["Instagram", "TikTok", "YouTube", "Facebook", "LinkedIn"]}
        />
        <Select
          id="cal-freq"
          label="Posts Per Week"
          value={freq}
          onChange={setFreq}
          options={["3", "5", "7"]}
        />
      </div>
      <div className="space-y-1.5">
        <FieldLabel>Content Pillars (select multiple)</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {PILLARS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => togglePillar(p)}
              data-ocid={`ai_tools.calendar_pillar_${p.toLowerCase().replace(/-/g, "_")}`}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border transition-colors",
                selectedPillars.includes(p)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/40 text-muted-foreground border-border hover:border-primary/50",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <Button
        onClick={generate}
        disabled={loading}
        className="w-full"
        data-ocid="ai_tools.calendar_button"
      >
        {loading ? (
          <>
            <span className="animate-spin mr-2">⚙️</span>Planning...
          </>
        ) : (
          "✨ Generate Calendar"
        )}
      </Button>
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 pt-2 border-t border-border"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                2-Week Calendar
              </p>
              <AILabel />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[480px]">
                <thead>
                  <tr className="border-b border-border">
                    {["Day", "Type", "Topic Idea", "Best Time"].map((h) => (
                      <th
                        key={h}
                        className="text-left py-2 px-2 text-muted-foreground font-medium"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => (
                    <tr
                      key={`${row.day}-${row.type}`}
                      className={cn(
                        "border-b border-border/50",
                        i % 2 === 0 && "bg-muted/20",
                      )}
                    >
                      <td className="py-2 px-2 font-semibold text-foreground">
                        {row.day}
                      </td>
                      <td className="py-2 px-2">
                        <Badge variant="outline" className="text-xs">
                          {row.type}
                        </Badge>
                      </td>
                      <td className="py-2 px-2 text-foreground">{row.topic}</td>
                      <td className="py-2 px-2 text-primary font-medium">
                        {row.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CompetitorTool() {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [result, setResult] = useState<CompetitorResult | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!url.trim()) {
      toast.error("Enter a username or URL first");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setResult(COMPETITOR_RESULT);
    setLoading(false);
    toast.success("Profile analyzed!");
  };

  return (
    <div className="space-y-4">
      <Select
        id="comp-platform"
        label="Platform"
        value={platform}
        onChange={setPlatform}
        options={["Instagram", "TikTok", "YouTube", "Facebook", "Twitter/X"]}
      />
      <div className="space-y-1">
        <FieldLabel>Competitor Username or Profile URL</FieldLabel>
        <div className="relative">
          <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="@competitorhandle or https://instagram.com/..."
            className="w-full bg-background border border-input rounded-lg pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            data-ocid="ai_tools.competitor_input"
          />
        </div>
      </div>
      <Button
        onClick={generate}
        disabled={loading}
        className="w-full"
        data-ocid="ai_tools.competitor_button"
      >
        {loading ? (
          <>
            <span className="animate-spin mr-2">⚙️</span>Analyzing...
          </>
        ) : (
          "✨ Analyze Profile"
        )}
      </Button>
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 pt-2 border-t border-border"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Analysis Results
              </p>
              <AILabel />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Est. Followers", value: result.followers },
                { label: "Avg Engagement", value: result.engagement },
                { label: "Post Frequency", value: result.frequency },
                { label: "Top Formats", value: result.topContent.join(", ") },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-muted/30 border border-border rounded-lg p-3"
                >
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5 truncate">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-accent uppercase tracking-wider">
                🎯 Strategy to Beat Them
              </p>
              {result.strategy.map((s) => (
                <ResultCard key={s.slice(0, 32)} copyText={s}>
                  {s}
                </ResultCard>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tool Registry ────────────────────────────────────────────────────────────

const TOOL_FORMS: Record<ToolId, React.ReactNode> = {
  caption: <CaptionTool />,
  hashtag: <HashtagTool />,
  bio: <BioTool />,
  hook: <HookTool />,
  calendar: <CalendarTool />,
  competitor: <CompetitorTool />,
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AIToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const openTool = (id: ToolId) => {
    setActiveTool(id);
    setTimeout(
      () =>
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50,
    );
  };

  const activeDef = TOOLS.find((t) => t.id === activeTool);

  return (
    <div
      className="p-4 sm:p-6 space-y-8 max-w-5xl mx-auto"
      data-ocid="ai_tools.page"
    >
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <FiZap className="w-4 h-4 text-primary" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            AI Growth Tools
          </h1>
          <Badge className="bg-primary/20 text-primary border-primary/30 border text-xs ml-1">
            Preview
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm max-w-xl">
          AI-powered content tools to supercharge your social media growth.
          Generate captions, hashtags, hooks, bios, and strategy — instantly.
        </p>
      </div>

      {/* Tool Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        data-ocid="ai_tools.grid"
      >
        {TOOLS.map((tool, i) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className={cn(
              "rounded-xl border bg-card p-5 space-y-3 cursor-pointer transition-colors",
              activeTool === tool.id
                ? "border-primary/60 ring-1 ring-primary/30 bg-primary/5"
                : "border-border hover:border-primary/40",
            )}
            onClick={() => openTool(tool.id)}
            data-ocid={`ai_tools.tool_card.${i + 1}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-lg bg-muted/60 border border-border flex items-center justify-center text-primary">
                {tool.icon}
              </div>
              <Badge className={cn("text-xs border shrink-0", tool.badgeClass)}>
                {tool.badge}
              </Badge>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">
                {tool.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {tool.description}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-full text-xs",
                activeTool === tool.id &&
                  "bg-primary text-primary-foreground border-primary",
              )}
              data-ocid={`ai_tools.open_tool_button.${i + 1}`}
            >
              {activeTool === tool.id ? "Tool Active ✓" : "Open Tool"}{" "}
              <FiArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Active Tool Form */}
      <AnimatePresence mode="wait">
        {activeTool && activeDef && (
          <motion.div
            key={activeTool}
            ref={formRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-primary/30 bg-card p-6 space-y-5"
            data-ocid="ai_tools.active_tool_panel"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  {activeDef.icon}
                </div>
                <div>
                  <h2 className="font-display font-bold text-foreground">
                    {activeDef.title}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {activeDef.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTool(null)}
                aria-label="Close tool"
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/60 transition-colors"
                data-ocid="ai_tools.close_button"
              >
                ✕
              </button>
            </div>
            <div className="h-px bg-border" />
            {TOOL_FORMS[activeTool]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state when no tool open */}
      {!activeTool && (
        <div
          className="text-center py-10 text-muted-foreground"
          data-ocid="ai_tools.empty_state"
        >
          <FiZap className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a tool above to get started</p>
        </div>
      )}
    </div>
  );
}
