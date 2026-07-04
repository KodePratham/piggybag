import { notFound } from "next/navigation";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Center } from "@astryxdesign/core/Center";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { getSocialLabel } from "@/lib/profileValidation";
import { getPublicProfileByUsername } from "@/lib/supabase";

type PublicProfilePageProps = {
  params: Promise<{ handle: string }>;
};

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { handle } = await params;

  if (!handle.startsWith("@")) {
    notFound();
  }

  const username = handle.slice(1);
  if (!username) {
    notFound();
  }

  const profile = await getPublicProfileByUsername(username);

  if (!profile) {
    return (
      <Center className="flex-1 p-6">
        <Card maxWidth={480} width="100%" padding={5}>
          <VStack gap={3} align="center">
            <Heading level={2}>Profile unavailable</Heading>
            <Text type="supporting" color="secondary" display="block">
              This profile does not exist or is set to private.
            </Text>
            <Button label="Go home" variant="secondary" href="/" />
          </VStack>
        </Card>
      </Center>
    );
  }

  const displayName = profile.display_name || profile.username || "Builder";

  return (
    <Center className="flex-1 p-6">
      <Card maxWidth={560} width="100%" padding={6}>
        <VStack gap={5} align="center">
          <Avatar
            src={profile.avatar_url || undefined}
            name={displayName}
            size={96}
          />

          <VStack gap={1} align="center">
            <Heading level={2}>{displayName}</Heading>
            <Text type="label" color="secondary">
              @{profile.username}
            </Text>
          </VStack>

          {profile.bio && (
            <Text type="body" display="block">
              {profile.bio}
            </Text>
          )}

          {(profile.github || profile.twitter || profile.linkedin) && (
            <HStack gap={2} wrap="wrap" justify="center">
              {profile.github && (
                <Button
                  label={getSocialLabel(profile.github, "github")}
                  variant="secondary"
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              )}
              {profile.twitter && (
                <Button
                  label={getSocialLabel(profile.twitter, "twitter")}
                  variant="secondary"
                  href={profile.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              )}
              {profile.linkedin && (
                <Button
                  label={getSocialLabel(profile.linkedin, "linkedin")}
                  variant="secondary"
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              )}
            </HStack>
          )}

          <Link href="/" label="Back to piggybag">
            Back to piggybag
          </Link>
        </VStack>
      </Card>
    </Center>
  );
}
