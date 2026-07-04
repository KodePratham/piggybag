import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  showWordmark?: boolean;
  size?: number;
  linked?: boolean;
};

export function Logo({ showWordmark = true, size = 28, linked = true }: LogoProps) {
  const mark = (
    <>
      <Image
        src="/coin-face.png"
        alt="PiggyBag"
        width={size}
        height={size}
        className="rounded-full"
        priority
      />
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-[var(--foreground)]">
          PiggyBag
        </span>
      )}
    </>
  );

  if (linked) {
    return (
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        {mark}
      </Link>
    );
  }

  return <div className="flex items-center gap-2.5">{mark}</div>;
}
