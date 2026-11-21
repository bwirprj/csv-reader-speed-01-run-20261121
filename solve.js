// A faster drop-in for csv-reader 1.0.0. Same broken-row policy, same answers.
// Differences from the reference: fields are sliced from the source with indexOf
// instead of built one character at a time, so the hot loop runs far fewer times.

/** csv-reader's answer for one case's input. */
export function run(input) {
  let text = String(input.text);
  const header = input.header === true;
  const errors = [];
  const rows = [];
  let columns = null;
  let width = -1;

  const n = text.length;
  let pos = text.charCodeAt(0) === 0xfeff ? 1 : 0;
  let line = 1;
  let recordLine = 1;
  let recordRow = null;

  while (true) {
    // Empty lines (LF or CRLF) are no records.
    while (pos < n) {
      const c = text.charCodeAt(pos);
      if (c === 10) { pos += 1; line += 1; }
      else if (c === 13 && text.charCodeAt(pos + 1) === 10) { pos += 2; line += 1; }
      else break;
    }
    if (pos >= n) break;

    recordLine = line;
    recordRow = header && columns === null ? null : rows.length;
    const fields = [];
    let lastQuoted = false;

    while (true) {
      const start = pos;
      if (text.charCodeAt(pos) === 34) {
        // Quoted field. Find the closing quote, handling "" and embedded breaks.
        lastQuoted = true;
        pos += 1;
        let value = '';
        let seg = pos;
        let closed = false;
        while (pos < n) {
          const c = text.charCodeAt(pos);
          if (c === 34) {
            if (text.charCodeAt(pos + 1) === 34) {
              value += text.slice(seg, pos + 1);
              pos += 2;
              seg = pos;
              continue;
            }
            value += text.slice(seg, pos);
            pos += 1;
            closed = true;
            break;
          }
          if (c === 13) {
            value += text.slice(seg, pos);
            value += '\n';
            if (text.charCodeAt(pos + 1) === 10) pos += 2; else pos += 1;
            line += 1;
            seg = pos;
            continue;
          }
          if (c === 10) line += 1;
          pos += 1;
        }
        if (!closed) {
          pos = start + 1;
          line = recordLine;
          errors.push({ code: 'unterminated_quote', line: recordLine, row: recordRow });
          // Fall back to unquoted reading of the text after the opening quote.
          const f = readUnquoted('"');
          fields.push(f.value);
          if (f.ended === 2) break;
          continue;
        }
        if (pos >= n) { fields.push(value); break; }
        const cc = text.charCodeAt(pos);
        if (cc === 44) { pos += 1; fields.push(value); continue; }
        if (cc === 10) { pos += 1; line += 1; fields.push(value); break; }
        if (cc === 13 && text.charCodeAt(pos + 1) === 10) { pos += 2; line += 1; fields.push(value); break; }
        // Junk after the closing quote, appended as is.
        const junk = readUnquoted(value);
        if (junk.added > 0) errors.push({ code: 'quote_junk', line: recordLine, row: recordRow });
        fields.push(junk.value);
        if (junk.ended === 2) break;
        continue;
      }

      const f = readUnquoted('');
      fields.push(f.value);
      if (f.ended === 2) break;
    }

    if (fields.length === 1 && fields[0] === '' && !lastQuoted) continue;
    if (width < 0) width = fields.length;
    if (header && columns === null) { columns = fields; continue; }
    if (fields.length < width) {
      errors.push({ code: 'short_row', line: recordLine, row: recordRow, fields: fields.length });
      while (fields.length < width) fields.push('');
    } else if (fields.length > width) {
      errors.push({ code: 'long_row', line: recordLine, row: recordRow, extra: fields.splice(width) });
    }
    rows.push(fields);
  }

  function readUnquoted(value) {
    let added = 0;
    const seg = pos;
    while (pos < n) {
      const c = text.charCodeAt(pos);
      if (c === 44) { value += text.slice(seg, pos); pos += 1; return { value, ended: 0, added: added + pos - seg }; }
      if (c === 10) { value += text.slice(seg, pos); pos += 1; line += 1; return { value, ended: 2, added: added + pos - seg - 1 }; }
      if (c === 13) {
        value += text.slice(seg, pos);
        if (text.charCodeAt(pos + 1) === 10) { pos += 2; line += 1; return { value, ended: 2, added: added + pos - seg - 2 }; }
        errors.push({ code: 'stray_cr', line: recordLine, row: recordRow });
        pos += 1;
        value += '\r'; // replaced below by continuing: drop the CR
        value = value.slice(0, -1);
        return readUnquoted(value);
      }
      pos += 1;
    }
    value += text.slice(seg, pos);
    return { value, ended: 2, added: added + pos - seg };
  }

  return { columns: header ? (columns ?? []) : null, rows, errors };
}
