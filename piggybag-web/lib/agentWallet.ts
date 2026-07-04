import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";

function getAgentPrivateKey(): Hex {
  const key = process.env.AGENT_PRIVATE_KEY;
  if (!key) {
    throw new Error("Missing AGENT_PRIVATE_KEY.");
  }
  return key as Hex;
}

export const agentPublicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

let account: PrivateKeyAccount | null = null;
let walletClient: ReturnType<typeof createWalletClient> | null = null;

export function getAgentAccount(): PrivateKeyAccount {
  if (!account) {
    account = privateKeyToAccount(getAgentPrivateKey());
  }
  return account;
}

export function getAgentAddress(): Address {
  return getAgentAccount().address;
}

export function getAgentWalletClient() {
  if (!walletClient) {
    walletClient = createWalletClient({
      account: getAgentAccount(),
      chain: monadTestnet,
      transport: http(),
    });
  }
  return walletClient;
}
