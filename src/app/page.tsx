import Link from "next/link";

const layers = [
  {
    title: "用户端 H5 体验页",
    body: "NFC 触碰即开，页面按 URL 自动读取内容，播放音频并驱动抽象无相佛线条动画。",
  },
  {
    title: "内容资产层",
    body: "每一组内容由音频、文案、封面与视觉参数构成，形成一个完整的感知单元。",
  },
  {
    title: "后台运营系统",
    body: "创建内容、上传音频、生成专属链接、复制写入 NFC、启停与查看基础访问数据。",
  },
];

export default function HomePage() {
  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="glass-panel noise-overlay mx-auto max-w-7xl overflow-hidden rounded-[40px]">
        <section className="soft-grid relative overflow-hidden px-6 py-10 sm:px-10 sm:py-14">
          <div className="eyebrow text-[11px] uppercase tracking-[0.24em]">
            Black One NFC System
          </div>
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_420px] lg:items-end">
            <div>
              <h1 className="display-font max-w-4xl text-4xl leading-tight text-white sm:text-6xl">
                你现在做的不是 NFC 播放音频，
                <br />
                而是让每一个物件，绑定一段独立的自然记忆。
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/62">
                这套系统把运营后台、内容资产与用户端体验串成一条完整链路。
                你可以为每个吊坠、编号版、系列化物件创建不同的风、山、夜、空，
                再通过独立链接写入 NFC 芯片。
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/admin"
                  className="metal-button inline-flex px-6 py-3 text-sm tracking-[0.18em] uppercase"
                >
                  进入后台
                </Link>
                <a
                  href="#structure"
                  className="rounded-full border border-white/12 px-6 py-3 text-sm text-white/76 transition hover:border-white/28 hover:text-white"
                >
                  查看结构
                </a>
              </div>
            </div>

            <div className="glass-panel halo-ring rounded-[32px] p-6">
              <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,#08111d,#04070e)] p-6">
                <p className="text-xs uppercase tracking-[0.26em] text-white/42">
                  Experience Flow
                </p>
                <div className="mt-6 space-y-4 text-sm leading-7 text-white/62">
                  <p>后台创建内容</p>
                  <p className="text-[var(--gold)]">↓</p>
                  <p>生成唯一链接</p>
                  <p className="text-[var(--gold)]">↓</p>
                  <p>写入 NFC 芯片</p>
                  <p className="text-[var(--gold)]">↓</p>
                  <p>用户触碰物件</p>
                  <p className="text-[var(--gold)]">↓</p>
                  <p>打开专属体验页面</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="structure"
          className="border-t border-white/8 px-6 py-10 sm:px-10 sm:py-14"
        >
          <div className="flex flex-col gap-4">
            <div className="eyebrow w-fit text-[11px] uppercase tracking-[0.24em]">
              Three Layers
            </div>
            <h2 className="display-font text-4xl text-white">三层结构已经一起建好</h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {layers.map((item) => (
              <article
                key={item.title}
                className="rounded-[30px] border border-white/8 bg-white/3 p-6"
              >
                <p className="text-xs uppercase tracking-[0.26em] text-white/42">Layer</p>
                <h3 className="display-font mt-5 text-2xl text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/58">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-white/8 px-6 py-10 sm:px-10 sm:py-14">
          <div className="grid gap-5 lg:grid-cols-2">
            <article className="rounded-[30px] border border-white/8 bg-white/3 p-6">
              <p className="eyebrow w-fit text-[11px] uppercase tracking-[0.24em]">
                后台能力
              </p>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-white/58">
                <li>创建完整内容单元：名称、音频、文案、封面、视觉参数</li>
                <li>音频自动压缩，生成 amplitude 与 frequency 数据</li>
                <li>自动生成唯一链接，可复制给 NFC 写入或二维码分发</li>
                <li>支持编辑、替换音频、停用链接和查看基础访问统计</li>
              </ul>
            </article>

            <article className="rounded-[30px] border border-white/8 bg-white/3 p-6">
              <p className="eyebrow w-fit text-[11px] uppercase tracking-[0.24em]">
                扩展方向
              </p>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-white/58">
                <li>限量编号系统：每个物件一段独立内容</li>
                <li>动态更新内容：同一 NFC 在不同时间播放不同音频</li>
                <li>用户收藏机制：收藏一段声音或某次触碰记忆</li>
                <li>内容分级：普通版、隐藏版、特别版</li>
              </ul>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
