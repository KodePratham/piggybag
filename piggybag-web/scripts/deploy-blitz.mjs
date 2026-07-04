import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import solc from "solc";
import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { monadTestnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTRACT_PATH = path.join(ROOT, "contracts", "Blitz.sol");

function loadEnvFile(filename) {
  const filePath = path.join(ROOT, filename);
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Add it to .env.local and run again.`);
  }
  return value;
}

function compileContract() {
  const source = fs.readFileSync(CONTRACT_PATH, "utf8");
  const input = {
    language: "Solidity",
    sources: { "Blitz.sol": { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = (output.errors ?? []).filter((e) => e.severity === "error");
  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.formattedMessage).join("\n"));
  }

  const contract = output.contracts["Blitz.sol"].Blitz;
  return { abi: contract.abi, bytecode: contract.evm.bytecode.object };
}

async function main() {
  const privateKey = requireEnv("AGENT_PRIVATE_KEY");
  const rpcUrl = requireEnv("MONAD_RPC_URL");

  const { abi, bytecode } = compileContract();
  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(rpcUrl),
  });
  const walletClient = createWalletClient({
    account,
    chain: monadTestnet,
    transport: http(rpcUrl),
  });

  const initialSupply = parseEther("1000000000");

  console.log("Deploying $BLITZ from", account.address);
  console.log("Initial supply:", "1,000,000,000 BLITZ");

  const hash = await walletClient.deployContract({
    abi,
    bytecode: `0x${bytecode}`,
    args: [initialSupply],
    chain: monadTestnet,
  });

  console.log("Deploy tx:", hash);
  console.log("Waiting for confirmation…");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const contractAddress = receipt.contractAddress;

  if (!contractAddress) {
    throw new Error("Deploy tx confirmed but no contract address in receipt.");
  }

  console.log("\nContract address:", contractAddress);
  console.log("\nAdd to .env.local:");
  console.log(`BLITZ_TOKEN_ADDRESS=${contractAddress}`);
  console.log(`NEXT_PUBLIC_BLITZ_TOKEN_ADDRESS=${contractAddress}`);
  console.log("\nCheck https://testnet.monadscan.com/tx/" + hash);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
