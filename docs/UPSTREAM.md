# Guaila Toys 客户工作台

Private, owner-only customer management application. Source code contains no customer dataset or credentials. Structured customer data, source excerpts, Gmail records and manual edit events live in D1.

## Current behavior

- Search/filter customers; view company profiles, evidence and related mail.
- Edit stage, reply classification, waiting party, owner, due date, address and notes. Revision checks prevent silently overwriting an intervening edit.
- Parse selectable-text standard Guaila prospect PDFs in the browser using bundled PDF.js; preview and correct records before import. Store extracted text and source pages, not the original PDF binary. Scanned PDFs and unsupported layouts require preprocessing.
- Match imports by normalized registrable domain (private suffixes supported), email and normalized name/aliases. Multiple identity matches are skipped for manual review. Existing manual fields are preserved.
- Export CSV (formula injection guarded) and complete JSON backup. Copy relevant client context for manually assisted reply drafting.
- Mail evidence retains provider message/thread IDs. Sent records do not establish delivery or opens. Human and automatic replies are separate.

## Access and integration limits

Keep the Site owner-private. Platform dispatch enforces owner sign-in or supported owner service access on all routes, including `/api/crm`. The shared server endpoint relies on this boundary; add explicit tenant ownership checks BEFORE widening access. No public sharing is supported by this implementation.

Gmail/Library runtime connector eligibility was unavailable during implementation. There is no live Gmail connection, polling, sending, provider mutation or unattended synchronization. Refresh only reads the stored D1 records. The initial records were explicitly imported from scoped PDF reads and related Gmail reads, rather than embedded into builds.

An authorized agent can import subsequently verified records through the private service endpoint. Never put service credentials in source, browser code, documents, or URLs. Manual imports can use JSON with `action: "import"`, `customers`, `sources`, `messages`. Gmail messages require stable provider `id`, existing `customerId`, `threadId`, `time`, `direction`, `kind`, `subject`, `from`, `body` or `snippet`. Only verified customer-scoped messages should be imported. Do not scan unrelated emails. Imported PDF text is historical evidence, not a current purchase signal.

Backup JSON includes events for archival purposes; current import merges customer/source/message data and does not restore edit history. Imports do not delete records. Review skips/conflicts after import. Rules-based parsing is assistive: approve the preview, particularly example email addresses and privacy-only addresses.

## Development

`node tests/crm.test.mjs` checks extraction, domain normalization, identity conflicts, evidence idempotency, and preservation of human fields. Run TypeScript checks and the maintained Sites build helper before publication. Database schema uses immutable Drizzle migrations in `drizzle/`.

Future scope: native connector eligibility and visitor consent verification, genuinely incremental mail synchronization, contact/project sub-records, expanded report parser and a full restoration workflow. No scheduled sending is authorized.
