import { omit } from "lodash";

export function log(msg: string, meta?: Record<string, unknown>) {
  console.log(
    msg + (meta ? ` - ${JSON.stringify(omit(meta, "verbose"))}` : "")
  );
}

export function logVerbose(msg: string, meta?: Record<string, unknown>) {
  log(msg, { ...meta, verbose: true });
}

export function logTimer(
  msg: string,
  meta?: Record<string, unknown> & { verbose?: boolean }
) {
  const startTime = Date.now();
  log(msg + ": START", meta);
  return (metaEnd?: Record<string, unknown>) => {
    log(msg + ": END", {
      ...(meta || {}),
      ...(metaEnd || {}),
      duration: Date.now() - startTime,
    });
  };
}
