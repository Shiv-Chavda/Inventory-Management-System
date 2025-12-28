function isPretty() {
  const format = String(process.env.LOG_FORMAT || "").toLowerCase();
  if (format === "json") return false;
  if (format === "pretty") return true;
  return String(process.env.NODE_ENV || "development") !== "production";
}

function safeStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return "[unserializable]";
  }
}

function formatPretty(meta) {
  if (!meta) return "";
  const parts = [];
  for (const [key, value] of Object.entries(meta)) {
    if (value === undefined) continue;
    if (value === null) {
      parts.push(`${key}=null`);
      continue;
    }
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      parts.push(`${key}=${value}`);
      continue;
    }
    parts.push(`${key}=${safeStringify(value)}`);
  }
  return parts.length ? ` ${parts.join(" ")}` : "";
}

function emit(level, message, meta) {
  const time = new Date().toISOString();

  if (isPretty()) {
    const line = `${time} ${String(level).toUpperCase().padEnd(5)} ${message}${formatPretty(meta)}`;
    // eslint-disable-next-line no-console
    console.log(line);
    return;
  }

  const payload = { time, level, message, ...(meta || {}) };
  // eslint-disable-next-line no-console
  console.log(safeStringify(payload));
}

const logger = {
  debug(message, meta) {
    emit("debug", message, meta);
  },
  info(message, meta) {
    emit("info", message, meta);
  },
  warn(message, meta) {
    emit("warn", message, meta);
  },
  error(message, meta) {
    emit("error", message, meta);
  }
};

module.exports = { logger };
