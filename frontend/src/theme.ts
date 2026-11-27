import {
  Avatar,
  Card,
  createTheme,
  type MantineColorsTuple,
  Modal,
  Notification,
  Paper,
  Progress,
  ProgressLabel,
  ProgressRoot,
  ProgressSection,
  RollingNumber,
  Switch,
  Title,
  Tooltip
} from "@mantine/core"
import { Notifications } from "@mantine/notifications"

import { parse as ms } from "@lukeed/ms"

const navy: MantineColorsTuple = [
  "oklch(0.956 0.023 290.4)",
  "oklch(0.862 0.056 245.9)",
  "oklch(0.769 0.101 234.2)",
  "oklch(0.677 0.154 227.1)",
  "oklch(0.589 0.217 221.2)",
  "oklch(0.501 0.242 217.7)",
  "oklch(0.422 0.204 217.7)",
  "oklch(0.340 0.163 217.8)",
  "oklch(0.252 0.117 218.3)",
  "oklch(0.195 0.098 216.8)"
] as const

const blue: MantineColorsTuple = [
  "oklch(0.959 0.021 287.4)",
  "oklch(0.891 0.058 242.5)",
  "oklch(0.823 0.107 232.2)",
  "oklch(0.758 0.161 226.6)",
  "oklch(0.696 0.222 222.2)",
  "oklch(0.624 0.308 217.4)",
  "oklch(0.537 0.265 217.4)",
  "oklch(0.450 0.222 217.5)",
  "oklch(0.358 0.175 217.7)",
  "oklch(0.258 0.126 217.7)"
] as const

const green: MantineColorsTuple = [
  "oklch(0.982 0.007 40.1)",
  "oklch(0.953 0.026 157.4)",
  "oklch(0.929 0.051 160.3)",
  "oklch(0.911 0.071 159.9)",
  "oklch(0.837 0.079 153.1)",
  "oklch(0.769 0.079 152.1)",
  "oklch(0.695 0.073 149.5)",
  "oklch(0.586 0.061 153.0)",
  "oklch(0.471 0.049 154.2)",
  "oklch(0.349 0.036 156.5)"
] as const

export const theme = createTheme({
  cursorType: "pointer",

  defaultRadius: "xl",

  fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",

  primaryColor: "blue",
  primaryShade: 5,

  colors: {
    navy,
    blue,
    green
  },

  components: {
    Avatar: Avatar.extend({
      styles: {
        root: {
          cursor: "pointer"
        }
      }
    }),
    Card: Card.extend({
      defaultProps: {
        padding: "lg"
      }
    }),
    Modal: Modal.extend({
      defaultProps: {
        centered: true,
        size: "auto",
        withCloseButton: false,
        overlayProps: {
          backgroundOpacity: 0.75,
          blur: 8
        },
        styles: {
          content: {
            background: "var(--gradient-modal)",
            border: "1px solid var(--border-modal)",
            boxShadow: "var(--shadow-modal)"
          }
        },
        transitionProps: {
          duration: 250,
          timingFunction: "linear",
          transition: "scale"
        }
      }
    }),
    Notification: Notification.extend({
      defaultProps: {
        withBorder: true
      },
      styles: {
        root: {
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--text-primary)",
          color: "var(--text-primary)"
        }
      }
    }),
    Notifications: Notifications.extend({
      defaultProps: {
        autoClose: ms("7.5s")
      }
    }),
    Paper: Paper.extend({
      defaultProps: {
        bd: "1px solid var(--border-default)",
        p: "md"
      },
      styles: {
        root: {
          backgroundColor: "var(--bg-panel)",
          boxShadow: "var(--shadow-paper)"
        }
      }
    }),
    Progress: Progress.extend({
      styles: {
        section: {
          borderRadius: 999,
          cursor: "pointer"
        }
      }
    }),
    ProgressLabel: ProgressLabel.extend({
      defaultProps: {
        c: "var(--text-dark)",
        fz: "xs"
      }
    }),
    ProgressRoot: ProgressRoot.extend({
      defaultProps: {
        bg: "var(--bg-fortnights)",
        size: "lg"
      }
    }),
    ProgressSection: ProgressSection.extend({
      defaultProps: {
        bg: "var(--gradient-primary)"
      }
    }),
    RollingNumber: RollingNumber.extend({
      defaultProps: {
        animationDuration: 500
      }
    }),
    Switch: Switch.extend({
      defaultProps: {
        offLabel: "Off",
        onLabel: "On",
        size: "md"
      }
    }),
    Title: Title.extend({
      defaultProps: {
        size: "clamp(1rem, 2vw, 1.5rem)"
      }
    }),
    Tooltip: Tooltip.extend({
      defaultProps: {
        arrowSize: 6,
        c: "var(--text-secondary)",
        color: "var(--bg-active)",
        events: { focus: true, hover: true, touch: true },
        multiline: true,
        w: { base: 260, sm: "auto" },
        withArrow: true
      },
      styles: {
        arrow: {
          border: "1px solid var(--text-primary)"
        },
        tooltip: {
          border: "1px solid var(--text-primary)"
        }
      }
    })
  },

  fontSizes: {
    lg: "1.125rem",
    md: "1rem",
    sm: "0.875rem",
    xl: "1.375rem",
    xs: "0.75rem",
    xxl: "1.625rem",
    xxs: "0.625rem"
  },

  headings: {
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: "700"
  },

  radius: {
    lg: "16px",
    md: "12px",
    sm: "8px",
    xl: "20px",
    xs: "4px"
  },

  shadows: {
    lg: "0 8px 32px oklch(0 0 0 / 24%)",
    md: "0 4px 18px oklch(0 0 0 / 16%)",
    sm: "0 2px 8px oklch(0 0 0 / 12%)"
  },

  spacing: {
    lg: "1.5rem",
    md: "1rem",
    sm: "0.75rem",
    xl: "2rem",
    xs: "0.5rem"
  }
})
