const U64 = (1n << 64n) - 1n;
const I128 = (1n << 127n) - 1n;
export function decimal(value, max, label) {
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]*)$/.test(value) || BigInt(value) > max)
    throw new TypeError(`Invalid ${label}`);
  return BigInt(value);
}
function str(v, label) { if (typeof v !== 'string' || !v.trim()) throw new TypeError(`Invalid ${label}`); return v; }
function seq(v) { if (!Number.isSafeInteger(v) || v < 1 || v > 4294967295) throw new TypeError('Invalid ledger'); return v; }
export function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
  return JSON.stringify(value);
}
export function audit(input) {
  if (input?.schemaVersion !== 1 || !Array.isArray(input.mappings) || !Array.isArray(input.events)) throw new TypeError('Expected schemaVersion 1 with mappings and events');
  const mappings = input.mappings.map(m => {
    for (const k of ['network','contract','asset','tenant']) str(m[k],k);
    decimal(m.muxedId,U64,'muxedId'); seq(m.fromLedger);
    if (m.untilLedger !== null && (seq(m.untilLedger) <= m.fromLedger)) throw new TypeError('Invalid mapping interval');
    return {...m};
  });
  for (let i=0;i<mappings.length;i++) for (let j=i+1;j<mappings.length;j++) {
    const a=mappings[i], b=mappings[j];
    if (a.network===b.network && a.contract===b.contract && a.asset===b.asset && a.muxedId===b.muxedId && a.fromLedger<(b.untilLedger??Infinity) && b.fromLedger<(a.untilLedger??Infinity)) throw new Error('Overlapping mapping intervals');
  }
  const accepted=[], exceptions=[], duplicates=[], seen=new Map(), conflicts=new Set(), totals=new Map();
  // Preflight conflicting identities before attributing anything.
  for (const e of input.events) {
    const key=canonical([e?.network,e?.id]);
    if (seen.has(key) && canonical(seen.get(key)) !== canonical(e)) conflicts.add(key);
    else seen.set(key,e);
  }
  const processed=new Set();
  for (const e of input.events) {
    const key=canonical([e?.network,e?.id]);
    if (conflicts.has(key)) { if (!processed.has(key)) exceptions.push({event:e,reason:'conflicting-event-id'}); processed.add(key); continue; }
    if (processed.has(key)) { duplicates.push(e.id); continue; } processed.add(key);
    try {
      for (const k of ['network','id','contract','asset']) str(e[k],k);
      seq(e.ledger); decimal(e.muxedId,U64,'muxedId'); decimal(e.amount,I128,'amount');
      if (e.successful !== true || !['transfer','mint'].includes(e.type)) throw new Error('unsupported-or-unsuccessful-event');
      const match=mappings.find(m=>m.network===e.network && m.contract===e.contract && m.asset===e.asset && m.muxedId===e.muxedId && m.fromLedger<=e.ledger && (m.untilLedger===null || e.ledger<m.untilLedger));
      if (!match) { exceptions.push({event:e,reason:'unmapped-destination-or-asset'}); continue; }
      accepted.push({network:e.network,eventId:e.id,ledger:e.ledger,tenant:match.tenant,asset:e.asset,amount:e.amount});
      const tkey=canonical([e.network,match.tenant,e.asset]);
      const prior=totals.get(tkey) ?? {network:e.network,tenant:match.tenant,asset:e.asset,amount:0n};
      prior.amount+=BigInt(e.amount); totals.set(tkey,prior);
    } catch (error) { exceptions.push({event:e,reason:error.message}); }
  }
  return {schemaVersion:1,kind:'muxreceipt-audit',accepted,exceptions,duplicates,
    totals:[...totals.values()].map(t=>({...t,amount:t.amount.toString()})),
    trust:'normalized-input-only',status:exceptions.length?'review-required':'no-exceptions-in-input'};
}
