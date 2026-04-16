import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="glass-panel noise-overlay w-full max-w-5xl overflow-hidden rounded-[36px]">
        <div className="grid lg:grid-cols-[1.1fr_420px]">
          <section className="relative overflow-hidden border-b border-white/8 px-8 py-10 lg:border-r lg:border-b-0 lg:px-10 lg:py-12">
            <div className="eyebrow text-xs uppercase tracking-[0.22em]">
              NFC Operations Console
            </div>
            <h1 className="display-font mt-8 max-w-2xl text-4xl leading-tight text-white sm:text-5xl">
              每一个物件，绑定一段独立的自然记忆。
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/62">
              这里是 Black One 的后台运营入口。你可以上传音频、生成独立链接、配置抽象佛影动画，
              再把它写进不同的 NFC 物件里。
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/8 bg-white/4 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-white/42">内容资产</p>
                <p className="mt-3 text-lg text-white">音频上传 / 文案配置 / 封面管理</p>
              </div>
              <div className="rounded-[28px] border border-white/8 bg-white/4 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-white/42">专属触发</p>
                <p className="mt-3 text-lg text-white">唯一 URL / 二维码 / NFC 写入链接</p>
              </div>
            </div>

            <Link
              href="/"
              className="mt-10 inline-flex text-sm text-[var(--gold)] transition hover:text-white"
            >
              返回前台介绍页
            </Link>
          </section>

          <section className="px-8 py-10 lg:px-10 lg:py-12">
            <div className="eyebrow text-xs uppercase tracking-[0.22em]">Operator Login</div>
            <form action="/api/admin/login" method="post" className="mt-8 space-y-5">
              <label className="block space-y-3">
                <span className="text-sm text-white">后台账号</span>
                <input
                  name="username"
                  className="input-shell w-full px-5 py-4 text-white outline-none"
                  placeholder="operator"
                  required
                />
              </label>
              <label className="block space-y-3">
                <span className="text-sm text-white">后台密码</span>
                <input
                  type="password"
                  name="password"
                  className="input-shell w-full px-5 py-4 text-white outline-none"
                  placeholder="••••••••"
                  required
                />
              </label>

              {params.error ? (
                <div className="rounded-[20px] border border-red-400/24 bg-red-500/8 px-4 py-3 text-sm text-red-200">
                  账号或密码不正确，请检查后重试。
                </div>
              ) : null}

              <button
                type="submit"
                className="metal-button mt-4 w-full px-6 py-4 text-sm tracking-[0.2em] uppercase"
              >
                进入后台
              </button>
            </form>

            <div className="mt-8 rounded-[24px] border border-white/8 bg-white/3 p-5 text-sm leading-7 text-white/54">
              默认会话是基于环境变量控制的。部署前请设置：
              <br />
              <span className="text-[var(--gold)]">
                ADMIN_USERNAME / ADMIN_PASSWORD / SESSION_SECRET
              </span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
