/**
 * Terminal prompt prefix: `[~] $ ` with white brackets/dollar and a blue `~`.
 * Append the actual command/output text after it.
 */
export function TerminalPrompt() {
  return (
    <span className="terminal-prompt">
      <span className="text-text">[</span>
      <span className="text-accent-blue">~</span>
      <span className="text-text">] $ </span>
    </span>
  );
}
