import http from "http";

export interface BalanceResponse {
  userId: number;
  amount: number;
  currency: string;
  accountType: string;
}

export interface TransactionResponse {
  transactionId: string;
  userId: number;
  amount: number;
  type: "credit" | "debit";
  timestamp: string;
}

function httpGet(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    };
    http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
    }).on("error", reject).end();
  });
}

export class BalanceApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getBalance(userId: number): Promise<BalanceResponse> {
    const { status, body } = await httpGet(`${this.baseUrl}/balance/${userId}`);
    if (status < 200 || status >= 300) {
      throw new Error(`Failed to fetch balance: ${status}`);
    }
    return JSON.parse(body) as BalanceResponse;
  }

  async getTransactions(userId: number): Promise<TransactionResponse[]> {
    const { status, body } = await httpGet(`${this.baseUrl}/transactions/${userId}`);
    if (status < 200 || status >= 300) {
      throw new Error(`Failed to fetch transactions: ${status}`);
    }
    return JSON.parse(body) as TransactionResponse[];
  }
}
