export interface ParsedCommand {
  intent: 'status' | 'redeploy' | 'unknown';
  jobId?: string;
}

export function parseMessage(text: string, lastJobId?: string): ParsedCommand {
  const lower = text.toLowerCase();
  const idMatch = lower.match(/\b(\d{3,})\b/);
  const jobId = idMatch ? idMatch[1] : lastJobId;

  if (/\bredeploy\b|deploy again|deploy it/.test(lower)) {
    return { intent: 'redeploy', jobId };
  }
  if (/\bstatus\b|how is.*job|what.*status/.test(lower)) {
    return { intent: 'status', jobId };
  }
  return { intent: 'unknown', jobId };
}

