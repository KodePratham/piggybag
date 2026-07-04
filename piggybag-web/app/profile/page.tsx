"use client";

import { useAccount } from "wagmi";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Center } from "@astryxdesign/core/Center";
import { Heading } from "@astryxdesign/core/Heading";
import { Link } from "@astryxdesign/core/Link";
import { Switch } from "@astryxdesign/core/Switch";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";
import { useMounted } from "@/lib/useMounted";
import { isValidUsername, normalizeUsername } from "@/lib/profileValidation";

type ProfileForm = {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  github: string;
  twitter: string;
  linkedin: string;
  isPublic: boolean;
};

const emptyForm: ProfileForm = {
  username: "",
  displayName: "",
  bio: "",
  avatarUrl: "",
  github: "",
  twitter: "",
  linkedin: "",
  isPublic: false,
};

export default function ProfilePage() {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    reason: "invalid" | "taken" | null;
  }>({ checking: false, available: null, reason: null });

  const loadProfile = useCallback(async (walletAddress: string) => {
    setError(null);

    const response = await fetch(`/api/profile?address=${encodeURIComponent(walletAddress)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to load profile.");
    }

    if (data.profile) {
      setForm({
        username: data.profile.username ?? "",
        displayName: data.profile.displayName ?? "",
        bio: data.profile.bio ?? "",
        avatarUrl: data.profile.avatarUrl ?? "",
        github: data.profile.github ?? "",
        twitter: data.profile.twitter ?? "",
        linkedin: data.profile.linkedin ?? "",
        isPublic: Boolean(data.profile.isPublic),
      });
    } else {
      setForm(emptyForm);
    }
  }, []);

  useEffect(() => {
    if (!mounted || !isConnected || !address) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);

      try {
        await loadProfile(address);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load profile.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, isConnected, loadProfile, mounted]);

  const normalizedUsername = normalizeUsername(form.username);
  const usernameIsInvalid =
    form.username.trim().length > 0 && !isValidUsername(normalizedUsername);

  useEffect(() => {
    if (!mounted || !isConnected || !address || !form.username.trim() || usernameIsInvalid) {
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setUsernameStatus({ checking: true, available: null, reason: null });

      try {
        const response = await fetch(
          `/api/profile/check-username?username=${encodeURIComponent(normalizedUsername)}&address=${encodeURIComponent(address)}`,
        );
        const data = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          throw new Error(data.error || "Failed to check username.");
        }

        setUsernameStatus({
          checking: false,
          available: data.available,
          reason: data.available ? null : "taken",
        });
      } catch {
        if (!cancelled) {
          setUsernameStatus({ checking: false, available: null, reason: null });
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [address, form.username, isConnected, mounted, normalizedUsername, usernameIsInvalid]);

  const usernameMessage = useMemo(() => {
    if (!form.username.trim()) return undefined;
    if (usernameIsInvalid) {
      return "Use 3–20 lowercase letters, numbers, or underscores.";
    }
    if (usernameStatus.checking) return "Checking availability…";
    if (usernameStatus.reason === "taken") return "That username is already taken.";
    if (usernameStatus.available) return "Username is available.";
    return undefined;
  }, [form.username, usernameIsInvalid, usernameStatus]);

  const usernameStatusType = useMemo(() => {
    if (usernameIsInvalid || usernameStatus.reason === "taken") {
      return "error" as const;
    }
    if (usernameStatus.available) return "success" as const;
    return undefined;
  }, [usernameIsInvalid, usernameStatus.available, usernameStatus.reason]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!address) return;

    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          username: form.username,
          displayName: form.displayName || null,
          bio: form.bio || null,
          avatarUrl: form.avatarUrl || null,
          github: form.github || null,
          twitter: form.twitter || null,
          linkedin: form.linkedin || null,
          isPublic: form.isPublic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save profile.");
      }

      if (data.profile) {
        setForm({
          username: data.profile.username ?? "",
          displayName: data.profile.displayName ?? "",
          bio: data.profile.bio ?? "",
          avatarUrl: data.profile.avatarUrl ?? "",
          github: data.profile.github ?? "",
          twitter: data.profile.twitter ?? "",
          linkedin: data.profile.linkedin ?? "",
          isPublic: Boolean(data.profile.isPublic),
        });
      }

      setSuccess("Profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  function updateField<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(null);
  }

  if (!mounted) {
    return null;
  }

  if (!isConnected || !address) {
    return (
      <Center className="flex-1 p-6">
        <Card maxWidth={480} width="100%" padding={5}>
          <VStack gap={3} align="center">
            <Heading level={2}>Your profile</Heading>
            <Text type="supporting" color="secondary" display="block">
              Connect your wallet to create or edit your profile.
            </Text>
          </VStack>
        </Card>
      </Center>
    );
  }

  return (
    <Center className="flex-1 p-6">
      <Card maxWidth={640} width="100%" padding={5}>
        <VStack gap={5} align="stretch">
          <VStack gap={2} align="stretch">
            <Heading level={2}>Your profile</Heading>
            <Text type="supporting" color="secondary">
              Choose a username, add your social links, and decide whether your profile is public.
            </Text>
          </VStack>

          {isLoading ? (
            <Text type="supporting" color="secondary">
              Loading profile…
            </Text>
          ) : (
            <form onSubmit={handleSave}>
              <VStack gap={4} align="stretch">
                <VStack gap={3} align="center">
                  <Avatar
                    src={form.avatarUrl || undefined}
                    name={form.displayName || form.username || "Builder"}
                    size="large"
                  />
                  <TextInput
                    label="Avatar URL"
                    value={form.avatarUrl}
                    onChange={(value) => updateField("avatarUrl", value)}
                    placeholder="https://example.com/avatar.png"
                    isOptional
                  />
                </VStack>

                <TextInput
                  label="Username"
                  value={form.username}
                  onChange={(value) => updateField("username", normalizeUsername(value))}
                  placeholder="your_handle"
                  description="Your public profile will live at /@username"
                  isRequired
                  status={
                    usernameMessage
                      ? {
                          type: usernameStatusType ?? "warning",
                          message: usernameMessage,
                        }
                      : undefined
                  }
                />

                <TextInput
                  label="Display name"
                  value={form.displayName}
                  onChange={(value) => updateField("displayName", value)}
                  placeholder="Your name"
                  isOptional
                />

                <TextArea
                  label="Bio"
                  value={form.bio}
                  onChange={(value) => updateField("bio", value)}
                  placeholder="Tell people what you're building…"
                  rows={4}
                  isOptional
                />

                <TextInput
                  label="GitHub"
                  value={form.github}
                  onChange={(value) => updateField("github", value)}
                  placeholder="github.com/username"
                  isOptional
                />

                <TextInput
                  label="X (Twitter)"
                  value={form.twitter}
                  onChange={(value) => updateField("twitter", value)}
                  placeholder="@username"
                  isOptional
                />

                <TextInput
                  label="LinkedIn"
                  value={form.linkedin}
                  onChange={(value) => updateField("linkedin", value)}
                  placeholder="linkedin.com/in/username"
                  isOptional
                />

                <Switch
                  label="Public profile"
                  description="When enabled, anyone can view your profile at /@username."
                  value={form.isPublic}
                  onChange={(checked) => updateField("isPublic", checked)}
                />

                {form.username && form.isPublic && isValidUsername(normalizeUsername(form.username)) && (
                  <Link href={`/@${normalizeUsername(form.username)}`} label="View public profile">
                    View public profile
                  </Link>
                )}

                <Button
                  label={isSaving ? "Saving…" : "Save profile"}
                  variant="primary"
                  type="submit"
                  isLoading={isSaving}
                  isDisabled={usernameIsInvalid || usernameStatus.available === false}
                />
              </VStack>
            </form>
          )}

          {error && <Banner status="error" title={error} />}

          {success && <Banner status="success" title={success} />}
        </VStack>
      </Card>
    </Center>
  );
}
