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

  describe("GET /balance/:userId — not found", () => {
    it("throws an error when user does not exist", async () => {
      const provider = new PactV3({
        consumer: "AccountService",
        provider: "BalanceService",
        dir: path.resolve(__dirname, "./pacts"),
        port: 8082,
      });
      await provider
        .given("user with ID 999 does not exist")
        .uponReceiving("a request for balance of a non-existent user")
        .withRequest({ method: "GET", path: "/balance/999", headers: { Accept: "application/json" } })
        .willRespondWith({
          status: 404,
          headers: { "Content-Type": "application/json" },
          body: { error: like("User not found") },
        })
        .executeTest(async (mockServer) => {
          const client = new BalanceApiClient(mockServer.url);
          await expect(client.getBalance(999)).rejects.toThrow("Failed to fetch balance: 404");
        });
    });
  });

  describe("GET /balance/:userId — forbidden", () => {
    it("throws an error when access to balance is unauthorized", async () => {
      const provider = new PactV3({
        consumer: "AccountService",
        provider: "BalanceService",
        dir: path.resolve(__dirname, "./pacts"),
        port: 8083,
      });
      await provider
        .given("user with ID 456 is not authorized")
        .uponReceiving("a request for balance of another user")
        .withRequest({ method: "GET", path: "/balance/456", headers: { Accept: "application/json" } })
        .willRespondWith({
          status: 403,
          headers: { "Content-Type": "application/json" },
          body: { error: like("Forbidden") },
        })
        .executeTest(async (mockServer) => {
          const client = new BalanceApiClient(mockServer.url);
          await expect(client.getBalance(456)).rejects.toThrow("Failed to fetch balance: 403");
        });
    });
  });

  describe("GET /transactions/:userId — not found", () => {
    it("throws an error when user has no transactions", async () => {
      const provider = new PactV3({
        consumer: "AccountService",
        provider: "BalanceService",
        dir: path.resolve(__dirname, "./pacts"),
        port: 8084,
      });
      await provider
        .given("user with ID 999 has no transactions")
        .uponReceiving("a request for transactions of a non-existent user")
        .withRequest({ method: "GET", path: "/transactions/999", headers: { Accept: "application/json" } })
        .willRespondWith({
          status: 404,
          headers: { "Content-Type": "application/json" },
          body: { error: like("User not found") },
        })
        .executeTest(async (mockServer) => {
          const client = new BalanceApiClient(mockServer.url);
          await expect(client.getTransactions(999)).rejects.toThrow("Failed to fetch transactions: 404");
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
