import type { ComponentProps } from "react";
import type { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";

type ClerkAppearance = NonNullable<ComponentProps<typeof ClerkProvider>["appearance"]>;

const INK = "#111111";
const INK_MUTED = "#4a4a52";
const PAPER_CARD = "#ffffff";
const PAPER_SUBTLE = "#faf6ec";
const LIME = "#c8ff3d";
const LIME_HOVER = "#b8f520";
const YELLOW = "#ffe14d";
const DANGER = "#c51d44";
const SUCCESS = "#0c753b";
const WARNING = "#9a4300";

const brutalButtonBase = {
  minHeight: "44px",
  borderRadius: "10px",
  border: `2.5px solid ${INK}`,
  boxShadow: `2.5px 2.5px 0px ${INK}`,
  fontWeight: 700,
  transition:
    "transform 150ms ease-out, box-shadow 150ms ease-out, background-color 150ms ease-out",
  "&:hover": {
    transform: "translate(-2px, -2px)",
    boxShadow: `4px 4px 0px ${INK}`,
  },
  "&:active": {
    transform: "translate(2px, 2px)",
    boxShadow: "none",
  },
  "&:focus-visible": {
    outline: `3px solid ${INK}`,
    outlineOffset: "2px",
    boxShadow: `0 0 0 5px ${LIME}`,
  },
};

/**
 * Tema Clerk bergaya Warm-Paper Neo-Brutalism Poko.
 * Menggunakan @clerk/ui shadcn theme sebagai dasar lalu ditimpa dengan
 * CSS-in-JS object styles agar spesifisitas Emotion Clerk terkunci penuh:
 * border ink 2.5px, hard offset shadow, tombol lime #C8FF3D, dan kontras WCAG AA+.
 */
export const pokoClerkAppearance: ClerkAppearance = {
  theme: shadcn,
  variables: {
    colorPrimary: LIME,
    colorPrimaryForeground: INK,
    colorBackground: PAPER_CARD,
    colorForeground: INK,
    colorMuted: PAPER_SUBTLE,
    colorMutedForeground: INK_MUTED,
    colorInput: PAPER_CARD,
    colorInputForeground: INK,
    colorNeutral: INK,
    colorBorder: INK,
    colorRing: INK,
    colorDanger: DANGER,
    colorSuccess: SUCCESS,
    colorWarning: WARNING,
    colorModalBackdrop: "rgba(17, 17, 17, 0.62)",
    borderRadius: "0.625rem",
    fontFamily: "var(--font-plus-jakarta-sans), system-ui, -apple-system, sans-serif",
    fontFamilyButtons: "var(--font-plus-jakarta-sans), system-ui, -apple-system, sans-serif",
    fontSize: "0.9375rem",
    fontWeight: {
      normal: 500,
      medium: 600,
      semibold: 700,
      bold: 800,
    },
  },
  options: {
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
    showOptionalFields: false,
    shimmer: false,
  },
  elements: {
    rootBox: {
      width: "100%",
      maxWidth: "100%",
    },
    cardBox: {
      width: "100%",
      maxWidth: "100%",
      borderRadius: "22px",
      border: `2.5px solid ${INK}`,
      backgroundColor: PAPER_CARD,
      boxShadow: `6px 6px 0px ${INK}`,
      overflow: "hidden",
    },
    card: {
      width: "100%",
      maxWidth: "100%",
      border: "0",
      borderRadius: "0",
      backgroundColor: PAPER_CARD,
      boxShadow: "none",
      padding: "1.75rem",
    },
    header: {
      textAlign: "left",
      gap: "0.35rem",
    },
    headerTitle: {
      fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
      fontSize: "1.5rem",
      fontWeight: 700,
      letterSpacing: "-0.025em",
      color: INK,
    },
    headerSubtitle: {
      fontSize: "0.875rem",
      fontWeight: 500,
      color: INK_MUTED,
    },
    socialButtonsBlockButton: {
      ...brutalButtonBase,
      backgroundColor: PAPER_CARD,
      color: INK,
      "&:hover": {
        ...brutalButtonBase["&:hover"],
        backgroundColor: PAPER_SUBTLE,
      },
    },
    socialButtonsBlockButtonText: {
      fontWeight: 700,
      color: INK,
    },
    dividerLine: {
      height: "2px",
      backgroundColor: "rgba(17, 17, 17, 0.2)",
    },
    dividerText: {
      fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
      fontSize: "0.7rem",
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: INK_MUTED,
    },
    formFieldLabel: {
      fontSize: "0.75rem",
      fontWeight: 800,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: INK,
    },
    formFieldInput: {
      minHeight: "44px",
      borderRadius: "10px",
      border: `2.5px solid ${INK}`,
      backgroundColor: PAPER_CARD,
      color: INK,
      fontSize: "0.875rem",
      fontWeight: 600,
      boxShadow: `2px 2px 0px ${INK}`,
      transition: "box-shadow 150ms ease, border-color 150ms ease, background-color 150ms ease",
      "&:hover": {
        borderColor: INK,
      },
      "&:focus, &:focus-visible": {
        borderColor: INK,
        outline: `3px solid ${INK}`,
        outlineOffset: "2px",
        boxShadow: `0 0 0 5px ${LIME}`,
      },
    },
    formFieldInputShowPasswordButton: {
      color: INK,
      "&:hover": {
        backgroundColor: PAPER_SUBTLE,
      },
    },
    formFieldAction: {
      fontSize: "0.75rem",
      fontWeight: 700,
      color: INK,
      textDecoration: "underline",
      textUnderlineOffset: "4px",
      "&:hover": {
        backgroundColor: YELLOW,
        color: INK,
      },
    },
    formButtonPrimary: {
      ...brutalButtonBase,
      backgroundColor: LIME,
      color: INK,
      fontWeight: 800,
      "&:hover": {
        ...brutalButtonBase["&:hover"],
        backgroundColor: LIME_HOVER,
        color: INK,
      },
      "&::after": {
        display: "none",
      },
    },
    formButtonReset: {
      minHeight: "40px",
      borderRadius: "10px",
      border: `2px solid ${INK}`,
      backgroundColor: PAPER_SUBTLE,
      color: INK,
      fontWeight: 700,
      "&:hover": {
        backgroundColor: YELLOW,
      },
    },
    formFieldErrorText: {
      marginTop: "0.375rem",
      borderRadius: "8px",
      border: `2px solid ${DANGER}`,
      backgroundColor: "rgba(255, 107, 139, 0.16)",
      padding: "0.375rem 0.625rem",
      fontSize: "0.75rem",
      fontWeight: 700,
      color: DANGER,
    },
    formFieldSuccessText: {
      marginTop: "0.375rem",
      borderRadius: "8px",
      border: `2px solid ${SUCCESS}`,
      backgroundColor: "rgba(200, 255, 61, 0.35)",
      padding: "0.375rem 0.625rem",
      fontSize: "0.75rem",
      fontWeight: 700,
      color: SUCCESS,
    },
    alert: {
      borderRadius: "12px",
      border: `2.5px solid ${INK}`,
      backgroundColor: "rgba(255, 225, 77, 0.45)",
      boxShadow: `2.5px 2.5px 0px ${INK}`,
      color: INK,
    },
    alertText: {
      fontSize: "0.875rem",
      fontWeight: 600,
      color: INK,
    },
    otpCodeFieldInput: {
      height: "48px",
      width: "44px",
      borderRadius: "10px",
      border: `2.5px solid ${INK}`,
      backgroundColor: PAPER_CARD,
      fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
      fontSize: "1rem",
      fontWeight: 700,
      color: INK,
      boxShadow: `2px 2px 0px ${INK}`,
    },
    identityPreview: {
      borderRadius: "12px",
      border: `2px solid ${INK}`,
      backgroundColor: PAPER_SUBTLE,
      padding: "0.625rem 0.875rem",
    },
    identityPreviewText: {
      fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
      fontSize: "0.75rem",
      fontWeight: 700,
      color: INK,
    },
    identityPreviewEditButton: {
      borderRadius: "6px",
      border: `1.5px solid ${INK}`,
      backgroundColor: YELLOW,
      color: INK,
      fontWeight: 700,
    },
    footer: {
      borderTop: `2.5px solid ${INK}`,
      backgroundColor: PAPER_SUBTLE,
      backgroundImage: "none",
      boxShadow: "none",
    },
    footerAction: {
      backgroundColor: PAPER_SUBTLE,
      padding: "0.85rem 1.25rem",
    },
    footerActionText: {
      fontSize: "0.875rem",
      fontWeight: 500,
      color: INK_MUTED,
    },
    footerActionLink: {
      fontWeight: 800,
      color: INK,
      textDecoration: "underline",
      textDecorationThickness: "2.5px",
      textUnderlineOffset: "4px",
      borderRadius: "4px",
      padding: "0 4px",
      "&:hover": {
        backgroundColor: LIME,
        color: INK,
      },
    },
    badge: {
      borderRadius: "999px",
      border: `2px solid ${INK}`,
      backgroundColor: YELLOW,
      color: INK,
      fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
      fontSize: "0.6875rem",
      fontWeight: 700,
    },
    userButtonTrigger: {
      borderRadius: "999px",
      border: `2.5px solid ${INK}`,
      boxShadow: `2.5px 2.5px 0px ${INK}`,
      "&:focus-visible": {
        outline: `3px solid ${INK}`,
        outlineOffset: "2px",
        boxShadow: `0 0 0 5px ${LIME}`,
      },
    },
    userButtonPopoverCard: {
      borderRadius: "20px",
      border: `2.5px solid ${INK}`,
      backgroundColor: PAPER_CARD,
      boxShadow: `6px 6px 0px ${INK}`,
      overflow: "hidden",
    },
    userButtonPopoverActionButton: {
      fontWeight: 600,
      color: INK,
      "&:hover": {
        backgroundColor: PAPER_SUBTLE,
        color: INK,
      },
    },
    userButtonPopoverFooter: {
      borderTop: `2px solid ${INK}`,
      backgroundColor: PAPER_SUBTLE,
    },
  },
};

/**
 * Varian appearance khusus untuk <SignIn /> dan <SignUp /> yang menyatu
 * langsung di dalam 1 kotak AuthShell tunggal (tanpa border/shadow ganda).
 */
export const pokoEmbeddedAuthAppearance: ClerkAppearance = {
  ...pokoClerkAppearance,
  elements: {
    ...pokoClerkAppearance.elements,
    cardBox: {
      width: "100%",
      maxWidth: "100%",
      border: "0",
      borderRadius: "0",
      backgroundColor: "transparent",
      boxShadow: "none",
      overflow: "hidden",
    },
    card: {
      width: "100%",
      maxWidth: "100%",
      border: "0",
      borderRadius: "0",
      backgroundColor: PAPER_CARD,
      boxShadow: "none",
      padding: "1.5rem 1.75rem",
    },
  },
};
