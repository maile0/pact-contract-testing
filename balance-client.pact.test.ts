import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import path from "path";
import { BalanceApiClient } from "./balance-client";

const { like, eachLike, regex } = MatchersV3;

describe("AccountService → BalanceService Contract", () => {

  describe("GET /balance/:userId", () => {
    it("returns balance for an existing user", async () => {
      const provider = new PactV3({
        consumer: "AccountService",
        provider: "BalanceService",
        dir: path.resolve(__dirname, "./pacts"),
        port: 8080,
      });
      await provider
        .given("user with ID 123 exists")
        .uponReceiving("a request for user balance")
        .withRequest({ method: "GET", path: "/balance/123", headers: { Accept: "application/json" } })
        .willRespondWith({
          status: 200,
          headers: { "Content-Type": "application/json" },
          body: {
            userId: like(123),
            amount: like(1500.50),
            currency: like("BGN"),
            accountType: regex(/^(current|savings|business)$/, "current"),
          },
        })
        .executeTest(async (mockServer) => {
          const client = new BalanceApiClient(mockServer.url);
          const balance = await client.getBalance(123);
          expect(balance.userId).toBe(123);
          expect(typeof balance.amount).toBe("number");
        });
    });
  });

  describe("GET /transactions/:userId", () => {
    it("returns list of transactions for existing user", async () => {
      const provider = new PactV3({
        consumer: "AccountService",
        provider: "BalanceService",
        dir: path.resolve(__dirname, "./pacts"),
        port: 8081,
      });
      await provider
        .given("user with ID 123 has transactions")
        .uponReceiving("a request for user transactions")
        .withRequest({ method: "GET", path: "/transactions/123", headers: { Accept: "application/json" } })
        .willRespondWith({
          status: 200,
          headers: { "Content-Type": "application/json" },
          body: eachLike({
            transactionId: like("txn-abc-123"),
            userId: like(123),
            amount: like(250.00),
            type: regex(/^(credit|debit)$/, "credit"),
            timestamp: like("2026-06-10T10:00:00Z"),
          }),
        })
        .executeTest(async (mockServer) => {
          const client = new BalanceApiClient(mockServer.url);
          const transactions = await client.getTransactions(123);
          expect(Array.isArray(transactions)).toBe(true);
          expect(transactions.length).toBeGreaterThan(0);
        });
    });
  });
});
