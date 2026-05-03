import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Shield, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

const TRUST_BADGES = [
  {
    icon: CheckCircle2,
    text: "10,000+ orders delivered",
    color: "text-accent",
  },
  { icon: Zap, text: "99.3% success rate", color: "text-primary" },
  { icon: Shield, text: "Secure & encrypted", color: "text-accent" },
  { icon: TrendingUp, text: "Instant delivery", color: "text-primary" },
];

const SOCIAL_BADGES = [
  "Instagram",
  "YouTube",
  "TikTok",
  "Twitter",
  "Telegram",
  "Facebook",
];

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center p-4"
      data-ocid="login.page"
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-elevated">
          {/* Logo + Brand */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex items-center gap-2 mb-4"
            >
              <img
                src="/assets/generated/smm-logo-icon-transparent.dim_64x64.png"
                alt="BoostPanel"
                className="h-10 w-10"
              />
              <span className="font-display font-bold text-2xl tracking-tight">
                Boost<span className="text-primary">Panel</span>
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center text-muted-foreground text-sm leading-relaxed"
            >
              The fastest SMM panel, trusted by{" "}
              <span className="text-foreground font-semibold">
                10,000+ users
              </span>
            </motion.p>
          </div>

          {/* Social platform badges */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-wrap gap-1.5 justify-center mb-8"
          >
            {SOCIAL_BADGES.map((platform) => (
              <Badge
                key={platform}
                variant="secondary"
                className="text-xs bg-secondary text-secondary-foreground border border-border"
              >
                {platform}
              </Badge>
            ))}
          </motion.div>

          {/* Login CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base h-12 shadow-elevated transition-smooth"
              onClick={login}
              data-ocid="login.login_button"
            >
              <Zap className="h-4 w-4 mr-2" />
              Sign in with Internet Identity
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-xs text-muted-foreground mt-4"
          >
            Decentralized · No password · Instant access
          </motion.p>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="grid grid-cols-2 gap-3 mt-4"
        >
          {TRUST_BADGES.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.text}
                className="flex items-center gap-2 bg-card/60 border border-border rounded-lg px-3 py-2.5"
              >
                <Icon className={`h-4 w-4 shrink-0 ${badge.color}`} />
                <span className="text-xs text-muted-foreground">
                  {badge.text}
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* Footer branding */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary transition-smooth"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
