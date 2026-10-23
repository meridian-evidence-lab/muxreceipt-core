# Architecture

## Component boundary

Owns normalized schemas, validation, audit decisions, and exact arithmetic. Has no network or storage side effects.

The project pipeline is: normalized export → core audit → CLI report with input digest → local HTML review.
The scenarios repository independently supplies fault inputs to consumers. The four repositories
have separate responsibilities; the sibling import is a deliberate development-only contract.
Before independent package releases, replace it with pinned package versions and cross-version tests.

## Data contract

Input schemaVersion 1 contains mappings and events. Mapping fields: network, contract, asset, tenant, muxedId (u64 string), fromLedger (inclusive), untilLedger (exclusive or null). Event fields: network, id, ledger, contract, asset, muxedId, amount (nonnegative i128 string), successful (true), type (transfer or mint). All identities are opaque normalized identifiers, not accepted StrKey proofs. The sample.json in the core and CLI is executable documentation.

## Failure behavior

Validation errors fail the run rather than reporting success. Audit exceptions remain visible in the result.
The caller owns authenticated input collection, mapping governance, database transactions, and recovery.
All prototype processing occurs in memory; large inputs require explicit size bounds before production.

## Integration work not yet implemented

- Official Stellar SDK/XDR decoding and real testnet fixture capture.
- Independently authenticated ledger provenance and filter identity.
- Durable ingestion/checkpoint database with crash recovery.
- Production authorization, signed mapping history, tenant privacy controls.

Synthetic samples use descriptive identifiers and cannot be submitted to Stellar. No private keys are required.
