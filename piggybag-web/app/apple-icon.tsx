import { ImageResponse } from "next/og";
import { getCoinFaceDataUrl } from "@/lib/coinFaceDataUrl";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const dataUrl = await getCoinFaceDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          borderRadius: "50%",
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl}
          alt=""
          width={180}
          height={180}
          style={{ objectFit: "cover" }}
        />
      </div>
    ),
    { ...size },
  );
}
