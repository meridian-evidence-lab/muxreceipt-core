# MuxReceipt · Audit engine

Deterministic customer attribution and exception accounting for normalized Stellar shared-contract transfers.

**Status: 0.1.0 offline prototype.** Uses normalized synthetic JSON. No live Stellar adapter,
contract deployment, or production security audit is included. It is not approved for a Drips Wave.

## Why this exists

Bell introduces muxed contract destinations. Applications need to audit which customer a transfer belongs to across mapping changes, with unknown destinations and conflicting deliveries held for review.

## Run locally

Node.js 22+; no third-party dependencies. Clone the four project repositories into sibling
folders. The CLI and scenario consumer tests import `../muxreceipt-core/index.mjs`.
The core and review renderer also work independently. Packages remain private until a versioned release.

```bash
npm test
npm run demo
```

`npm test` runs meaningful failure cases. CLI exit codes: 0 means no exceptions in the supplied
input, 2 means review required, 1 means invalid input or execution error. The review renderer uses
0 on successful rendering and 1 on invalid input. File digests identify input bytes, not ledger authenticity.

## Repository responsibility

Owns normalized schemas, validation, audit decisions, and exact arithmetic. Has no network or storage side effects.

## Project repositories

- [muxreceipt-core](https://github.com/meridian-evidence-lab/muxreceipt-core)
- [muxreceipt-cli](https://github.com/meridian-evidence-lab/muxreceipt-cli)
- [muxreceipt-scenarios](https://github.com/meridian-evidence-lab/muxreceipt-scenarios)
- [muxreceipt-review](https://github.com/meridian-evidence-lab/muxreceipt-review)

## Trust boundaries

Amounts and muxed IDs are canonical decimal strings. The engine isolates networks and assets, requires successful transfer/mint records, rejects overlapping customer-mapping intervals, and quarantines conflicting event identities. Mapping intervals are [fromLedger, untilLedger), where null has no upper bound. Destination contract and asset identifiers are opaque normalized labels; a production SDK adapter must validate and decode them. The report accounts for supplied incoming events; it does not prove a complete balance, reserve, or liability position.

## Development and next steps

See [ARCHITECTURE.md](ARCHITECTURE.md), [ROADMAP.md](ROADMAP.md),
[CONTRIBUTING.md](CONTRIBUTING.md), and [SECURITY.md](SECURITY.md).
The [MIT license](LICENSE) covers this code and synthetic fixtures.

## Sources

- [Bell upgrade guide](https://stellar.org/blog/developers/bell-protocol-30-upgrade-guide)
- [Stellar RPC getEvents](https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getEvents)

Researched 23 October 2026. Bell votes are scheduled for 3 November (testnet) and
23 November (mainnet); activation depends on validator approval. This prototype does not assume activation.
