import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

const IMAGE = process.env.PREVIEW_IMAGE || 'nginx';
const TTL_MS = Number(process.env.PREVIEW_TTL_MS || 60 * 60 * 1000);

export interface PreviewInfo {
  id: string;
  url: string;
  expires: number;
}

const previews: Record<string, PreviewInfo> = {};

export async function startPreview(jobId: string): Promise<PreviewInfo> {
  const { stdout } = await execAsync(
    `docker run -d --rm -P --name preview-${jobId} ${IMAGE}`
  );
  const containerId = stdout.trim();
  const { stdout: portOut } = await execAsync(`docker port ${containerId}`);
  const match = portOut.match(/0\.0\.0\.0:(\d+)/);
  const port = match ? match[1] : '0';
  const info: PreviewInfo = {
    id: containerId,
    url: `http://localhost:${port}`,
    expires: Date.now() + TTL_MS,
  };
  previews[jobId] = info;
  setTimeout(() => stopPreview(jobId), TTL_MS).unref();
  return info;
}

export async function stopPreview(jobId: string) {
  const info = previews[jobId];
  if (!info) return;
  try {
    await execAsync(`docker stop ${info.id}`);
  } catch {
    // ignore
  }
  delete previews[jobId];
}

export function getPreview(jobId: string): PreviewInfo | undefined {
  const info = previews[jobId];
  if (!info) return undefined;
  if (info.expires < Date.now()) {
    stopPreview(jobId);
    return undefined;
  }
  return info;
}

export function cleanupPreviews() {
  for (const id of Object.keys(previews)) {
    const info = previews[id];
    if (info.expires < Date.now()) stopPreview(id);
  }
  setTimeout(cleanupPreviews, 60000).unref();
}
