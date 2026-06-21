import pino from "pino";

const isTty = process.stdout.isTTY === true && process.env.CI !== "true";

export const logger = pino(
  isTty
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss" },
        },
      }
    : {},
);
