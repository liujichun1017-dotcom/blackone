import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="glass-panel max-w-xl rounded-[32px] p-8 text-center">
        <div className="eyebrow mx-auto w-fit text-[11px] uppercase tracking-[0.24em]">
          Not Found
        </div>
        <h1 className="display-font mt-6 text-4xl text-white">这段记忆没有找到</h1>
        <p className="mt-4 text-sm leading-7 text-white/58">
          可能是链接还未创建、已经被更换，或者你拿到的是一枚尚未写入内容的 NFC 物件。
        </p>
        <Link
          href="/"
          className="metal-button mx-auto mt-8 inline-flex px-6 py-3 text-sm tracking-[0.18em] uppercase"
        >
          返回首页
        </Link>
      </div>
    </main>
  );
}
