import "dotenv/config";

const parsePort = (value: string | undefined): number => {
  const port = Number(value ?? 3000);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  return port;
};

const nodeEnv = process.env.NODE_ENV ?? "development";

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET?.trim();

  if (secret) return secret;

  if (nodeEnv === "production") {
    throw new Error("JWT_SECRET is required in production.");
  }

  return "development-only-change-me";
};

export const env = Object.freeze({
  nodeEnv,
  port: parsePort(process.env.PORT),
  jwtSecret: getJwtSecret(),
});
