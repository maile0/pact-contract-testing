# Pact Contract Testing Example

Consumer-driven contract testing with [Pact](https://pact.io) + TypeScript, simulating a banking microservices scenario.

## The Scenario

Two services communicate via HTTP:

- **AccountService** (Consumer) — calls the Balance API to get user data
- **BalanceService** (Provider) — returns balances and transactions

## Why Contract Testing?

In a microservices architecture, Service A calls Service B. Without contract testing, breaking changes in Service B's API are only discovered in staging or production. With Pact, the contract is verified on every commit.

## Tests

| Interaction | Endpoint | Expected |
|---|---|---|
| Get user balance | `GET /balance/123` | 200 + balance object |
| Get user transactions | `GET /transactions/123` | 200 + array of transactions |

## Run

```bash
npm install
npx jest balance-client --no-coverage
```

## Key Concepts

- **Consumer-driven contracts** — the consumer defines what it needs
- **Flexible matching** — `like()` matches type, not exact value
- **Regex matching** — `regex()` for enum fields (e.g. `credit | debit`)
- **Generated contract** — saved to `pacts/AccountService-BalanceService.json`

## Tech Stack

- [Pact](https://pact.io) v11
- TypeScript 5
- Jest 29
- Node.js 20+
