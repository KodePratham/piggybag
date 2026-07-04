"use client";

import Image from "next/image";
import { useAccount, useSwitchChain, useWatchAsset } from "wagmi";
import { useState } from "react";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";
import { addBlitzToMetaMask } from "@/lib/addBlitzToMetaMask";
import { useMounted } from "@/lib/useMounted";
import { postJson } from "@/lib/apiClient";
import { AddBlitzToWallet } from "@/components/AddBlitzToWallet";

const EXPLORER_TX_URL = "https://testnet.monadscan.com/tx/";

type BlitzResult = {
  id: string;
  txHash: string;
  amountBlitz: number;
  tokenAddress: string;
};

export function BlitzApplyForm() {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { watchAssetAsync } = useWatchAsset();

  const [github, setGithub] = useState("");
  const [description, setDescription] = useState("");
  const [workingLink, setWorkingLink] = useState("");
  const [result, setResult] = useState<BlitzResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!mounted || !isConnected || !address) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await postJson<BlitzResult>("/api/blitz", {
        address,
        github,
        description,
        workingLink: workingLink.trim() || undefined,
      });

      if (!response.ok) {
        throw new Error(response.error);
      }

      setResult(response.data);

      try {
        await addBlitzToMetaMask(response.data.tokenAddress, {
          switchChain: switchChainAsync,
          watchAssetAsync,
        });
      } catch {
        // User can import manually via the fallback button.
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit project.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleNewSubmission() {
    setResult(null);
    setGithub("");
    setDescription("");
    setWorkingLink("");
    setError(null);
  }

  if (result) {
    return (
      <Card maxWidth={560} width="100%" padding={5}>
        <VStack gap={4} align="center">
          <Image
            src="/blitzcoin.png"
            alt="$BLITZ"
            width={72}
            height={72}
            className="rounded-full"
          />
          <Badge label="Reward sent" variant="success" />
          <Heading level={3}>
            {result.amountBlitz.toLocaleString()} $BLITZ sent
          </Heading>
          <Text type="supporting" color="secondary">
            Approve the MetaMask prompt to see your $BLITZ in your wallet.
          </Text>
          {result.txHash && (
            <Link
              href={`${EXPLORER_TX_URL}${result.txHash}`}
              isExternalLink
              label="View transaction"
            >
              View transaction
            </Link>
          )}
          <AddBlitzToWallet tokenAddress={result.tokenAddress} />
          <Button label="Submit another project" variant="ghost" onClick={handleNewSubmission} />
        </VStack>
      </Card>
    );
  }

  return (
    <Card maxWidth={560} width="100%" padding={5}>
      <VStack gap={4} align="stretch">
        <VStack gap={1} align="stretch">
          <Heading level={3}>Submit your Monad Blitz project</Heading>
          <Text type="supporting" color="secondary">
            Share your repo and description. You&apos;ll receive 10,000 $BLITZ instantly on
            submit.
          </Text>
        </VStack>

        <form onSubmit={handleSubmit}>
          <VStack gap={4} align="stretch">
            <TextInput
              label="GitHub repository"
              value={github}
              onChange={setGithub}
              placeholder="github.com/username/project"
              isRequired
            />

            <TextArea
              label="Project description"
              value={description}
              onChange={setDescription}
              placeholder="What did you build for Monad Blitz?"
              rows={4}
              isRequired
            />

            <TextInput
              label="Working link"
              value={workingLink}
              onChange={setWorkingLink}
              placeholder="https://your-demo.com (optional)"
            />

            <Button
              label={isLoading ? "Sending $BLITZ…" : "Submit & claim 10,000 $BLITZ"}
              variant="primary"
              type="submit"
              isLoading={isLoading}
            />
          </VStack>
        </form>

        {error && (
          <Text type="supporting" color="secondary">
            {error}
          </Text>
        )}
      </VStack>
    </Card>
  );
}
