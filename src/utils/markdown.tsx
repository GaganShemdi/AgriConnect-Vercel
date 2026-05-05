import type { ReactNode } from 'react';

// tiny markdown renderer for kisanmitra replies.
// covers **bold**, *italic*, _italic_, `code`, - bullets, 1. lists, blank lines.
// didnt want a 50kb library just for this.


function renderInline(text: string, baseKey: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  // ** has to be checked before *, otherwise * eats the bold marker

  const regex = /(\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`\n]+`)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      tokens.push(text.slice(lastIdx, match.index));
    }
    const tok = match[0];
    const key = `${baseKey}-t${i++}`;
    if (tok.startsWith('**') && tok.endsWith('**')) {
      tokens.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith('__') && tok.endsWith('__')) {
      tokens.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith('`') && tok.endsWith('`')) {
      tokens.push(
        <code key={key} className="px-1 py-0.5 rounded bg-black/10 text-[0.85em]">
          {tok.slice(1, -1)}
        </code>
      );
    } else if (
      (tok.startsWith('*') && tok.endsWith('*')) ||
      (tok.startsWith('_') && tok.endsWith('_'))
    ) {
      tokens.push(<em key={key}>{tok.slice(1, -1)}</em>);
    }
    lastIdx = match.index + tok.length;
  }
  if (lastIdx < text.length) {
    tokens.push(text.slice(lastIdx));
  }
  return tokens;
}

interface Block {
  kind: 'text' | 'ul' | 'ol';
  lines: string[];
}

function groupBlocks(text: string): Block[] {
  const lines = text.split('\n');
  const blocks: Block[] = [];
  let current: Block | null = null;

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    const ulMatch = /^\s*[-*•]\s+(.*)/.exec(line);
    const olMatch = /^\s*\d+[.)]\s+(.*)/.exec(line);

    if (ulMatch) {
      if (!current || current.kind !== 'ul') {
        current = { kind: 'ul', lines: [] };
        blocks.push(current);
      }
      current.lines.push(ulMatch[1]);
    } else if (olMatch) {
      if (!current || current.kind !== 'ol') {
        current = { kind: 'ol', lines: [] };
        blocks.push(current);
      }
      current.lines.push(olMatch[1]);
    } else {
      if (!current || current.kind !== 'text') {
        current = { kind: 'text', lines: [] };
        blocks.push(current);
      }
      current.lines.push(line);
    }
  }
  return blocks;
}

interface MarkdownProps {
  text: string;
  className?: string;
}

export default function Markdown({ text, className }: MarkdownProps) {
  const blocks = groupBlocks(text || '');
  return (
    <div className={className}>
      {blocks.map((block, bi) => {
        if (block.kind === 'ul') {
          return (
            <ul key={`b${bi}`} className="list-disc ml-5 my-1 space-y-0.5">
              {block.lines.map((l, li) => (
                <li key={`b${bi}-${li}`}>{renderInline(l, `b${bi}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        if (block.kind === 'ol') {
          return (
            <ol key={`b${bi}`} className="list-decimal ml-5 my-1 space-y-0.5">
              {block.lines.map((l, li) => (
                <li key={`b${bi}-${li}`}>{renderInline(l, `b${bi}-${li}`)}</li>
              ))}
            </ol>
          );
        }
        // plain text block, keep newlines
        return (
          <p key={`b${bi}`} className="whitespace-pre-wrap leading-relaxed">
            {block.lines.map((l, li) => (
              <span key={`b${bi}-${li}`}>
                {renderInline(l, `b${bi}-${li}`)}
                {li < block.lines.length - 1 ? '\n' : null}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
