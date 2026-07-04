"use client";

import { useAccount } from "wagmi";
import { useState } from "react";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { Heading } from "@astryxdesign/core/Heading";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";
import { useMounted } from "@/lib/useMounted";
import { postJson } from "@/lib/apiClient";

const EXPLORER_TX_URL = "https://testnet.monadscan.com/tx/";

type AgentStatus = "gathering" | "approved" | "rejected";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ApplicationState = {
  id: string;
  status: AgentStatus;
  messages: ChatMessage[];
  amountMon?: number;
  hash?: string;
  turnsRemaining: number;
};

function statusBadgeVariant(status: AgentStatus): "info" | "success" | "error" {
  if (status === "approved") return "success";
  if (status === "rejected") return "error";
  return "info";
}

function statusLabel(status: AgentStatus): string {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Not funded";
  return "In review";
}

export function FundingAgent() {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();

  const [github, setGithub] = useState("");
  const [description, setDescription] = useState("");
  const [answer, setAnswer] = useState("");
  const [application, setApplication] = useState<ApplicationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!mounted || !isConnected || !address) {
    return null;
  }

  async function handleSubmitApplication(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await postJson<{
        id: string;
        status: AgentStatus;
        reply: string;
        amountMon?: number;
        hash?: string;
        turnsRemaining?: number;
      }>("/api/applications", { address, github, description });

      if (!result.ok) {
        throw new Error(result.error);
      }

      const data = result.data;

      setApplication({
        id: data.id,
        status: data.status,
        messages: [{ role: "assistant", content: data.reply }],
        amountMon: data.amountMon,
        hash: data.hash,
        turnsRemaining: data.turnsRemaining ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitAnswer(event: React.FormEvent) {
    event.preventDefault();
    if (!application || !answer.trim()) return;

    setError(null);
    setIsLoading(true);

    const userMessage = answer.trim();
    setAnswer("");

    try {
      const result = await postJson<{
        status: AgentStatus;
        reply: string;
        amountMon?: number;
        hash?: string;
        turnsRemaining?: number;
      }>(`/api/applications/${application.id}`, { answer: userMessage });

      if (!result.ok) {
        throw new Error(result.error);
      }

      const data = result.data;

      setApplication((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: data.status,
          messages: [
            ...prev.messages,
            { role: "user", content: userMessage },
            { role: "assistant", content: data.reply },
          ],
          amountMon: data.amountMon,
          hash: data.hash,
          turnsRemaining: data.turnsRemaining ?? 0,
        };
      });
    } catch (err) {
      setAnswer(userMessage);
      setError(err instanceof Error ? err.message : "Failed to send answer.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleNewApplication() {
    setApplication(null);
    setGithub("");
    setDescription("");
    setAnswer("");
    setError(null);
  }

  if (!application) {
    return (
      <Card maxWidth={560} width="100%" padding={5}>
        <VStack gap={4} align="stretch">
          <VStack gap={1} align="stretch">
            <Heading level={3}>Tell us about your project</Heading>
            <Text type="supporting" color="secondary">
              Share your GitHub and project details. The PiggyBag agent will ask a few follow-up
              questions before deciding.
            </Text>
          </VStack>

          <form onSubmit={handleSubmitApplication}>
            <VStack gap={4} align="stretch">
              <TextInput
                label="GitHub"
                value={github}
                onChange={setGithub}
                placeholder="github.com/username"
                isRequired
              />

              <TextArea
                label="Project"
                value={description}
                onChange={setDescription}
                placeholder="Describe what you're building..."
                rows={4}
                isRequired
              />

              <Button
                label={isLoading ? "Submitting…" : "Submit application"}
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

  const isFinalized = application.status === "approved" || application.status === "rejected";
  const isLastQuestion = application.turnsRemaining <= 1;

  return (
    <Card maxWidth={560} width="100%" padding={5}>
      <VStack gap={4} align="stretch">
        <VStack gap={2} align="stretch">
          <Heading level={3}>PiggyBag agent</Heading>
          <Badge label={statusLabel(application.status)} variant={statusBadgeVariant(application.status)} />
        </VStack>

        {!isFinalized && application.turnsRemaining > 0 && (
          <Text type="supporting" color="secondary">
            {isLastQuestion
              ? "Final answer — the agent will decide and send funds immediately if approved."
              : `${application.turnsRemaining} answer${application.turnsRemaining === 1 ? "" : "s"} remaining before decision`}
          </Text>
        )}

        <VStack gap={3} align="stretch">
          {application.messages.map((message, index) => (
            <Card
              key={index}
              variant={message.role === "assistant" ? "muted" : "default"}
              padding={3}
            >
              <VStack gap={1} align="stretch">
                <Text type="label" color="secondary">
                  {message.role === "assistant" ? "Agent" : "You"}
                </Text>
                <Text type="body">{message.content}</Text>
              </VStack>
            </Card>
          ))}
        </VStack>

        {application.status === "approved" && (
          <VStack gap={2} align="center">
            <Text type="body" weight="medium">
              {application.amountMon} MON sent to your wallet.
            </Text>
            {application.hash && (
              <Link
                href={`${EXPLORER_TX_URL}${application.hash}`}
                isExternalLink
                label="View transaction"
              >
                View transaction
              </Link>
            )}
          </VStack>
        )}

        {!isFinalized && (
          <>
            <Divider />
            <form onSubmit={handleSubmitAnswer}>
              <VStack gap={4} align="stretch">
                <TextArea
                  label="Your answer"
                  value={answer}
                  onChange={setAnswer}
                  placeholder="Answer the agent's question..."
                  rows={3}
                  isRequired
                />

                <Button
                  label={
                    isLoading
                      ? isLastQuestion
                        ? "Deciding & sending…"
                        : "Sending…"
                      : isLastQuestion
                        ? "Submit final answer"
                        : "Send answer"
                  }
                  variant="primary"
                  type="submit"
                  isLoading={isLoading}
                />
              </VStack>
            </form>
          </>
        )}

        {error && (
          <Text type="supporting" color="secondary">
            {error}
          </Text>
        )}

        {isFinalized && (
          <Button label="New application" variant="ghost" onClick={handleNewApplication} />
        )}
      </VStack>
    </Card>
  );
}
