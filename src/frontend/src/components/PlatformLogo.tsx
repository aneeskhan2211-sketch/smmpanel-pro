import type { SVGProps } from "react";

type Platform =
  | "youtube"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "telegram"
  | "twitter"
  | "website"
  | "business"
  | "ai"
  | "all"
  | string;

interface PlatformLogoProps extends SVGProps<SVGSVGElement> {
  platform: Platform;
  size?: number;
  className?: string;
}

export function PlatformLogo({
  platform,
  size = 24,
  className = "",
  ...props
}: PlatformLogoProps) {
  const p = platform.toLowerCase().trim();

  if (p === "youtube") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="YouTube"
        role="img"
        {...props}
      >
        <path
          d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
          fill="#FF0000"
        />
        <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#ffffff" />
      </svg>
    );
  }

  if (p === "instagram") {
    const gradId = `ig-grad-${Math.random().toString(36).slice(2, 7)}`;
    const radId = `ig-rad-${Math.random().toString(36).slice(2, 7)}`;
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Instagram"
        role="img"
        {...props}
      >
        <defs>
          <radialGradient
            id={radId}
            cx="30%"
            cy="107%"
            r="150%"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#fdf497" />
            <stop offset="5%" stopColor="#fdf497" />
            <stop offset="45%" stopColor="#fd5949" />
            <stop offset="60%" stopColor="#d6249f" />
            <stop offset="90%" stopColor="#285AEB" />
          </radialGradient>
          <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f09433" />
            <stop offset="25%" stopColor="#e6683c" />
            <stop offset="50%" stopColor="#dc2743" />
            <stop offset="75%" stopColor="#cc2366" />
            <stop offset="100%" stopColor="#bc1888" />
          </linearGradient>
        </defs>
        {/* Rounded rectangle body */}
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="5.5"
          ry="5.5"
          fill={`url(#${gradId})`}
        />
        {/* Camera lens circle */}
        <circle
          cx="12"
          cy="12"
          r="4"
          stroke="white"
          strokeWidth="1.8"
          fill="none"
        />
        {/* Viewfinder dot */}
        <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
      </svg>
    );
  }

  if (p === "facebook") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Facebook"
        role="img"
        {...props}
      >
        <path
          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.994 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
          fill="#1877F2"
        />
        <path
          d="M16.671 15.543l.532-3.47h-3.328V9.823c0-.949.465-1.874 1.956-1.874h1.514V4.996s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.643H7.078v3.47h3.048v8.385a12.065 12.065 0 0 0 3.748 0v-8.385h2.797z"
          fill="white"
        />
      </svg>
    );
  }

  if (p === "tiktok") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="TikTok"
        role="img"
        {...props}
      >
        {/* Black rounded background */}
        <rect width="24" height="24" rx="5" fill="#010101" />
        {/* Teal shadow offset */}
        <path
          d="M10.665 9.013v5.72a2.665 2.665 0 1 1-2.13-2.614V9.5a5.285 5.285 0 1 0 4.752 5.233V9.013a7.386 7.386 0 0 0 3.381.81V7.203a3.814 3.814 0 0 1-3.381-3.553h-2.622v.363c0 2.75 0 5.002 0 5Z"
          fill="#69C9D0"
          transform="translate(0.5 0.3)"
        />
        {/* Red shadow offset */}
        <path
          d="M10.665 9.013v5.72a2.665 2.665 0 1 1-2.13-2.614V9.5a5.285 5.285 0 1 0 4.752 5.233V9.013a7.386 7.386 0 0 0 3.381.81V7.203a3.814 3.814 0 0 1-3.381-3.553h-2.622v.363c0 2.75 0 5.002 0 5Z"
          fill="#EE1D52"
          transform="translate(-0.5 -0.3)"
        />
        {/* White fill — main shape */}
        <path
          d="M10.665 9.013v5.72a2.665 2.665 0 1 1-2.13-2.614V9.5a5.285 5.285 0 1 0 4.752 5.233V9.013a7.386 7.386 0 0 0 3.381.81V7.203a3.814 3.814 0 0 1-3.381-3.553h-2.622v.363c0 2.75 0 5.002 0 5Z"
          fill="white"
        />
      </svg>
    );
  }

  if (p === "telegram") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Telegram"
        role="img"
        {...props}
      >
        <circle cx="12" cy="12" r="12" fill="#229ED9" />
        <path
          d="M5.491 11.74 18.3 6.955c.6-.22 1.12.146.928.946l-2.155 10.16c-.16.733-.618.912-1.254.568l-3.4-2.505-1.64 1.579c-.183.182-.334.334-.683.334l.242-3.44 6.265-5.662c.27-.242-.06-.376-.42-.134L7.6 14.402l-3.373-1.053c-.733-.228-.748-.733.156-1.07l.01-.015.008-.012.013-.01.008-.002h.007l.072.001z"
          fill="white"
        />
      </svg>
    );
  }

  if (p === "twitter") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="X (Twitter)"
        role="img"
        {...props}
      >
        <path
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.638 5.903-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          fill="#000000"
        />
      </svg>
    );
  }

  if (p === "website") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Website Traffic"
        role="img"
        {...props}
      >
        {/* Globe circle */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="#22C55E"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Latitude lines */}
        <path d="M2 12h20" stroke="#22C55E" strokeWidth="1.5" />
        <path
          d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
          stroke="#22C55E"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Signal arc */}
        <path
          d="M17 7.5 L19 5"
          stroke="#22C55E"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Bar chart overlay bottom-right */}
        <rect
          x="13.5"
          y="15"
          width="2"
          height="3.5"
          rx="0.5"
          fill="#22C55E"
          opacity="0.8"
        />
        <rect x="16.5" y="13" width="2" height="5.5" rx="0.5" fill="#22C55E" />
      </svg>
    );
  }

  if (p === "business") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Business Growth"
        role="img"
        {...props}
      >
        {/* Rocket body */}
        <path
          d="M12 2C9 5.5 8 9 8 12H16C16 9 15 5.5 12 2Z"
          fill="#F59E0B"
          stroke="#F59E0B"
          strokeWidth="0.5"
        />
        {/* Rocket middle */}
        <rect x="9" y="11" width="6" height="5" rx="0.5" fill="#F59E0B" />
        {/* Left fin */}
        <path d="M9 13.5 L6 17 L9 16 Z" fill="#F59E0B" opacity="0.8" />
        {/* Right fin */}
        <path d="M15 13.5 L18 17 L15 16 Z" fill="#F59E0B" opacity="0.8" />
        {/* Window */}
        <circle cx="12" cy="10" r="1.5" fill="white" opacity="0.9" />
        {/* Fire exhaust */}
        <path
          d="M10.5 16 Q12 20 13.5 16"
          fill="none"
          stroke="#EF4444"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Trending arrow up right */}
        <path
          d="M4 20 L8 16 L11 18 L18 11"
          stroke="#10B981"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 11 H18 V14"
          stroke="#10B981"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (p === "ai") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="AI Growth Tools"
        role="img"
        {...props}
      >
        {/* Large center sparkle */}
        <path
          d="M12 2 L13.2 9 L20 8 L14.5 12.5 L17 19 L12 15 L7 19 L9.5 12.5 L4 8 L10.8 9 Z"
          fill="#8B5CF6"
        />
        {/* Small top-right sparkle */}
        <path
          d="M19 2 L19.6 4.2 L22 4 L20.2 5.4 L21 7.5 L19 6.2 L17 7.5 L17.8 5.4 L16 4 L18.4 4.2 Z"
          fill="#8B5CF6"
          opacity="0.7"
        />
        {/* Small bottom-left sparkle */}
        <path
          d="M5 17 L5.4 18.6 L7 18 L5.8 19.2 L6.5 21 L5 20 L3.5 21 L4.2 19.2 L3 18 L4.6 18.6 Z"
          fill="#8B5CF6"
          opacity="0.5"
        />
      </svg>
    );
  }

  // "all" or unknown — grid dots icon
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="All Platforms"
      role="img"
      {...props}
    >
      <circle cx="5" cy="5" r="2" fill="#6B7280" />
      <circle cx="12" cy="5" r="2" fill="#6B7280" />
      <circle cx="19" cy="5" r="2" fill="#6B7280" />
      <circle cx="5" cy="12" r="2" fill="#6B7280" />
      <circle cx="12" cy="12" r="2" fill="#6B7280" />
      <circle cx="19" cy="12" r="2" fill="#6B7280" />
      <circle cx="5" cy="19" r="2" fill="#6B7280" />
      <circle cx="12" cy="19" r="2" fill="#6B7280" />
      <circle cx="19" cy="19" r="2" fill="#6B7280" />
    </svg>
  );
}
