/** "2m 14s" / "45s" — shared by every admin analytics/lead surface that
 *  displays a duration (session detail, insight/roadmap prompts, email
 *  copy). Pure and dependency-free, safe to import from client or server. */
export function formatDuration(ms: number) {
  const totalSec = Math.round(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}
