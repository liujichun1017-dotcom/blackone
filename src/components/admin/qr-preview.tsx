"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrPreview({ slug }: { slug: string }) {
  const [visible, setVisible] = useState(false);
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    if (!visible) {
      return;
    }

    let cancelled = false;
    const url = `${window.location.origin}/nfc/${slug}`;

    QRCode.toDataURL(url, {
      margin: 1,
      width: 260,
      color: {
        dark: "#F6F2EA",
        light: "#00000000",
      },
    }).then((result) => {
      if (!cancelled) {
        setDataUrl(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [slug, visible]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/76 transition hover:border-[var(--gold)] hover:text-white"
      >
        {visible ? "收起二维码" : "二维码"}
      </button>

      {visible ? (
        <div className="glass-panel absolute right-0 z-20 mt-3 w-72 rounded-[24px] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">备用二维码</p>
              <p className="mt-1 text-xs text-white/56">{`/nfc/${slug}`}</p>
            </div>
            <a
              href={dataUrl}
              download={`${slug}-qr.png`}
              className="text-xs text-[var(--gold)]"
            >
              下载
            </a>
          </div>
          <div className="mt-4 flex justify-center rounded-[20px] border border-white/8 bg-white/3 p-4">
            {dataUrl ? (
              <Image
                src={dataUrl}
                alt={`${slug} 的二维码`}
                width={224}
                height={224}
                unoptimized
                className="h-56 w-56"
              />
            ) : (
              <div className="flex h-56 w-56 items-center justify-center text-sm text-white/52">
                生成中…
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
