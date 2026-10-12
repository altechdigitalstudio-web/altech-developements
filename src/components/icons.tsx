import type { ReactElement, SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  width: 20,
  height: 20,
  ...props,
});

export const LogoMark = (props: P) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={32} height={32} {...props}>
    <rect width="32" height="32" rx="8" fill="#0E1016" />
    <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="#2A3040" />
    <g fill="#D8FF4F">
      <rect x="6" y="6" width="8" height="8" rx="2.2" />
      <rect x="18" y="6" width="8" height="8" rx="2.2" />
      <rect x="6" y="18" width="8" height="8" rx="2.2" />
    </g>
    <g fill="#4C7DFF">
      <rect x="18.5" y="18.5" width="3" height="3" rx="0.8" />
      <rect x="23" y="23" width="3" height="3" rx="0.8" />
    </g>
    <rect x="18.5" y="23" width="3" height="3" rx="0.8" fill="#D8FF4F" opacity="0.55" />
    <rect x="23" y="18.5" width="3" height="3" rx="0.8" fill="#D8FF4F" opacity="0.55" />
  </svg>
);

export const IconQr = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <path d="M14 14h3v3h-3zM20.5 14H21v.5M14 20.5V21h.5M17.5 21H21v-3.5" />
  </svg>
);

export const IconBolt = (p: P) => (
  <svg {...base(p)}>
    <path d="M13 2 4.5 13.2H11l-1 8.8 8.5-11.2H12z" />
  </svg>
);

export const IconChart = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 3v16.5A1.5 1.5 0 0 0 4.5 21H21" />
    <path d="M7 15l3.5-4.5 3 2.5L20 6" />
    <circle cx="20" cy="6" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const IconLayers = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3 3 7.5l9 4.5 9-4.5z" />
    <path d="m3 12.5 9 4.5 9-4.5M3 17l9 4.5L21 17" />
  </svg>
);

export const IconPalette = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.8-1.8 0-1.3-1-1.7-1-2.7 0-.8.7-1.5 1.6-1.5H16a5 5 0 0 0 5-5c0-3.9-4-7-9-7Z" />
    <circle cx="7.8" cy="11" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="10.5" cy="7.3" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="7.9" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconShield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 2.8 4.8 5.6v5.9c0 4.3 3 8.2 7.2 9.7 4.2-1.5 7.2-5.4 7.2-9.7V5.6z" />
    <path d="m9.2 12 2 2 3.6-3.8" />
  </svg>
);

export const IconDownload = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v11.5M7.5 10.5 12 15l4.5-4.5M4 18.5V20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.5" />
  </svg>
);

export const IconLink = (p: P) => (
  <svg {...base(p)}>
    <path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l3-3a3.54 3.54 0 0 0-5-5l-1.2 1.2" />
    <path d="M13.5 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.54 3.54 0 0 0 5 5l1.2-1.2" />
  </svg>
);

export const IconWifi = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 8.5a15 15 0 0 1 19 0M5.5 12a10.5 10.5 0 0 1 13 0M8.5 15.4a6 6 0 0 1 7 0" />
    <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const IconCamera = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 8.8A1.8 1.8 0 0 1 4.8 7h2.4l1.3-2.2h6.9L16.8 7h2.4A1.8 1.8 0 0 1 21 8.8v9A1.8 1.8 0 0 1 19.2 19.6H4.8A1.8 1.8 0 0 1 3 17.8z" />
    <circle cx="12" cy="13" r="3.6" />
  </svg>
);

export const IconSun = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
  </svg>
);

export const IconMoon = (p: P) => (
  <svg {...base(p)}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
);

export const IconMonitor = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.5" y="3.5" width="19" height="13" rx="2" />
    <path d="M8 20.5h8M12 16.5v4" />
  </svg>
);

export const IconCard = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.8" y="4.5" width="18.4" height="15" rx="2.4" />
    <path d="M2.8 9.5h18.4M6.5 15h3" />
  </svg>
);

export const IconGlobe = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3.2 9.5h17.6M3.2 14.5h17.6" />
    <path d="M12 3c2.6 2.7 3.9 5.7 3.9 9s-1.3 6.3-3.9 9c-2.6-2.7-3.9-5.7-3.9-9S9.4 5.7 12 3Z" />
  </svg>
);

export const IconMail = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.8" y="4.8" width="18.4" height="14.4" rx="2.2" />
    <path d="m3.4 6.6 8.6 6.2 8.6-6.2" />
  </svg>
);

export const IconPhone = (p: P) => (
  <svg {...base(p)}>
    <path d="M6.3 3.5h3l1.5 3.8-2 1.4a11.4 11.4 0 0 0 5.5 5.5l1.4-2 3.8 1.5v3a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.3 5.7a2 2 0 0 1 2-2.2Z" />
  </svg>
);

export const IconChat = (p: P) => (
  <svg {...base(p)}>
    <path d="M20.5 12c0 4-3.8 7.2-8.5 7.2a10 10 0 0 1-2.6-.3L4.5 20.5l1.2-3.3A6.8 6.8 0 0 1 3.5 12C3.5 8 7.3 4.8 12 4.8s8.5 3.2 8.5 7.2Z" />
  </svg>
);

export const IconCalendar = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.2" y="5" width="17.6" height="16" rx="2.2" />
    <path d="M3.2 10h17.6M8 3v4M16 3v4" />
    <circle cx="8.5" cy="14.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21.5s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
    <circle cx="12" cy="10.2" r="2.6" />
  </svg>
);

export const IconCoin = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.8 8.6H10.9a1.9 1.9 0 0 0 0 3.8h2a1.9 1.9 0 0 1 0 3.8H9M12 7v10" />
  </svg>
);

export const IconStore = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9.5V20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9.5" />
    <path d="M2.8 5.2h18.4L20 9.5a2.6 2.6 0 0 1-4 0 2.6 2.6 0 0 1-4 0 2.6 2.6 0 0 1-4 0 2.6 2.6 0 0 1-4 0Z" />
  </svg>
);

export const IconText = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6.5h16M4 12h11M4 17.5h14" />
  </svg>
);

export const IconSocial = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6.5" cy="12" r="2.6" />
    <circle cx="17" cy="6.6" r="2.6" />
    <circle cx="17" cy="17.4" r="2.6" />
    <path d="m8.9 10.8 5.8-3M8.9 13.2l5.8 3" />
  </svg>
);

export const IconMenu = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
  </svg>
);

export const IconClose = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);

export const IconArrowRight = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12h15.5M13.5 5.5 20 12l-6.5 6.5" />
  </svg>
);

export const IconCopy = (p: P) => (
  <svg {...base(p)}>
    <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
    <path d="M15.5 5.5v-1a1 1 0 0 0-1-1h-10a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1" />
  </svg>
);

export const IconTrash = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6.5h16M9.5 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" />
    <path d="M6.5 6.5 7.4 20a1.3 1.3 0 0 0 1.3 1.2h6.6a1.3 1.3 0 0 0 1.3-1.2l.9-13.5M10.5 10.5v6.5M13.5 10.5v6.5" />
  </svg>
);

export const IconEdit = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 20h4L19.2 8.8a2.1 2.1 0 0 0-3-3L5 17v3Z" />
    <path d="m14.8 5.2 3 3" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconSearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx="10.8" cy="10.8" r="6.8" />
    <path d="m16 16 4.5 4.5" />
  </svg>
);

export const IconSparkle = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.2 13.8 9 19.6 10.8 13.8 12.6 12 18.4 10.2 12.6 4.4 10.8 10.2 9z" />
    <path d="M18.5 16.5 19.3 19l2.5.8-2.5.8-.8 2.5-.8-2.5-2.5-.8 2.5-.8z" />
  </svg>
);

export const IconLock = (p: P) => (
  <svg {...base(p)}>
    <rect x="4.5" y="10" width="15" height="10.5" rx="2.2" />
    <path d="M8 10V7.4a4 4 0 1 1 8 0V10" />
  </svg>
);

export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.4l3.4 2" />
  </svg>
);

export const IconDevice = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.8" y="4.5" width="13" height="10" rx="1.8" />
    <path d="M6 18.5h8M9.3 14.5v4" />
    <rect x="17.5" y="9" width="4" height="11.5" rx="1.4" />
  </svg>
);

export const IconGrid = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.2" y="3.2" width="7.4" height="7.4" rx="1.6" />
    <rect x="13.4" y="3.2" width="7.4" height="7.4" rx="1.6" />
    <rect x="3.2" y="13.4" width="7.4" height="7.4" rx="1.6" />
    <rect x="13.4" y="13.4" width="7.4" height="7.4" rx="1.6" />
  </svg>
);

export const IconRefresh = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 11.5A8 8 0 0 0 6.3 6.3L4 8.5" />
    <path d="M4 4.5v4h4M4 12.5a8 8 0 0 0 13.7 5.2L20 15.5" />
    <path d="M20 19.5v-4h-4" />
  </svg>
);

export const IconExternal = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 4h6v6M20 4l-8.5 8.5" />
    <path d="M18 14.5V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V8a1.5 1.5 0 0 1 1.5-1.5H10" />
  </svg>
);

export const IconStar = (p: P) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} fill="currentColor" {...p}>
    <path d="m12 2.6 2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95z" />
  </svg>
);

export const IconChevron = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 9.5 6 6 6-6" />
  </svg>
);

export const IconEye = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconPrint = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 9V3.8h10V9" />
    <rect x="3.5" y="9" width="17" height="7.5" rx="1.8" />
    <path d="M7 14h10v6.2H7z" />
  </svg>
);

export const IconInfinity = (p: P) => (
  <svg {...base(p)}>
    <path d="M6.5 8.5a3.5 3.5 0 1 0 0 7c2.6 0 3.4-1.9 5.5-3.5 2.1-1.6 2.9-3.5 5.5-3.5a3.5 3.5 0 1 1 0 7c-2.6 0-3.4-1.9-5.5-3.5C9.9 10.4 9.1 8.5 6.5 8.5Z" />
  </svg>
);

export const kindIcon: Record<string, (p: P) => ReactElement> = {
  url: IconLink,
  text: IconText,
  email: IconMail,
  phone: IconPhone,
  sms: IconChat,
  whatsapp: IconChat,
  wifi: IconWifi,
  vcard: IconCard,
  event: IconCalendar,
  location: IconPin,
  instagram: IconSocial,
  tiktok: IconSocial,
  youtube: IconSocial,
  linkedin: IconSocial,
  x: IconSocial,
  social: IconSocial,
  crypto: IconCoin,
  payment: IconCoin,
  app: IconStore,
  menu: IconStore,
};
