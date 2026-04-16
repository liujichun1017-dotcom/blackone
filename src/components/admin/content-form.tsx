"use client";

import { useDeferredValue, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { VISUAL_PRESET_MAP, VISUAL_PRESET_OPTIONS } from "@/lib/constants";
import type { ExperienceRecord, VisualPreset } from "@/types/nfc";

type FormMode = "create" | "edit";

type ContentFormProps = {
  mode: FormMode;
  experience?: ExperienceRecord | null;
};

type FormState = {
  name: string;
  slug: string;
  quote: string;
  visualPreset: VisualPreset;
  lineDensity: number;
  brightnessMin: number;
  brightnessMax: number;
  breathCycle: number;
  revealFrequency: number;
  dynamicIntensity: number;
  status: ExperienceRecord["status"];
};

function buildInitialState(experience?: ExperienceRecord | null): FormState {
  const preset = experience?.visualPreset ?? "breathing";
  const defaults = experience?.visualConfig ?? VISUAL_PRESET_MAP[preset].defaults;

  return {
    name: experience?.name ?? "",
    slug: experience?.slug ?? "",
    quote: experience?.quote ?? "",
    visualPreset: preset,
    lineDensity: defaults.lineDensity,
    brightnessMin: defaults.brightnessMin,
    brightnessMax: defaults.brightnessMax,
    breathCycle: defaults.breathCycle,
    revealFrequency: defaults.revealFrequency,
    dynamicIntensity: defaults.dynamicIntensity,
    status: experience?.status ?? "active",
  };
}

export function ContentForm({ mode, experience }: ContentFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [state, setState] = useState<FormState>(() => buildInitialState(experience));

  const previewName = useDeferredValue(state.name) || "未命名感知单元";
  const previewQuote = useDeferredValue(state.quote) || "在此写入一段极短的自然感受。";
  const previewSlug = state.slug || "系统将自动生成";

  function setField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function applyPreset(preset: VisualPreset) {
    const defaults = VISUAL_PRESET_MAP[preset].defaults;
    setState((current) => ({
      ...current,
      visualPreset: preset,
      lineDensity: defaults.lineDensity,
      brightnessMin: defaults.brightnessMin,
      brightnessMax: defaults.brightnessMax,
      breathCycle: defaults.breathCycle,
      revealFrequency: defaults.revealFrequency,
      dynamicIntensity: defaults.dynamicIntensity,
    }));
  }

  function renderRangeField(input: {
    name: keyof Pick<
      FormState,
      | "lineDensity"
      | "brightnessMin"
      | "brightnessMax"
      | "breathCycle"
      | "revealFrequency"
      | "dynamicIntensity"
    >;
    label: string;
    min: number;
    max: number;
    step: number;
    hint: string;
  }) {
    const value = state[input.name];

    return (
      <label className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white">{input.label}</span>
          <span className="text-sm text-[var(--gold)]">{value}</span>
        </div>
        <input
          type="range"
          min={input.min}
          max={input.max}
          step={input.step}
          name={input.name}
          value={value}
          onChange={(event) =>
            setField(
              input.name,
              Number(event.target.value) as FormState[typeof input.name],
            )
          }
          className="w-full accent-[#d8b98d]"
        />
        <p className="text-xs leading-6 text-white/48">{input.hint}</p>
      </label>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!formRef.current) {
      return;
    }

    const formData = new FormData(formRef.current);

    startTransition(async () => {
      const endpoint =
        mode === "create"
          ? "/api/admin/content"
          : `/api/admin/content/${experience?.id}`;

      const response = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PATCH",
        body: formData,
      });

      const payload = (await response.json()) as {
        error?: string;
        experience?: ExperienceRecord;
      };

      if (!response.ok || !payload.experience) {
        setError(payload.error ?? "保存失败，请稍后重试。");
        return;
      }

      if (mode === "create") {
        router.push(`/admin/content/${payload.experience.id}`);
        router.refresh();
        return;
      }

      setSuccess("内容已更新。");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="glass-panel rounded-[32px] p-6 sm:p-8"
      >
        <div className="flex flex-col gap-4 border-b border-white/8 pb-6">
          <div className="eyebrow w-fit text-xs uppercase tracking-[0.22em]">
            Content Builder
          </div>
          <div>
            <h1 className="display-font text-3xl text-white sm:text-4xl">
              {mode === "create" ? "创建新的自然记忆单元" : "编辑自然记忆单元"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
              每一组内容都由音频、文案、视觉参数和唯一链接组成。保存后即可用于 NFC
              写入、二维码分发或独立访问。
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <label className="space-y-3 lg:col-span-2">
            <span className="text-sm text-white">内容名称</span>
            <input
              className="input-shell w-full px-5 py-4 text-white outline-none"
              name="name"
              value={state.name}
              onChange={(event) => setField("name", event.target.value)}
              placeholder="例如：风001 / 夜山 / 空域"
              required
            />
          </label>

          <label className="space-y-3">
            <span className="text-sm text-white">链接标识（slug / 编号）</span>
            <input
              className="input-shell w-full px-5 py-4 text-white outline-none"
              name="slug"
              value={state.slug}
              onChange={(event) => setField("slug", event.target.value)}
              placeholder="例如：001 或 night-mountain"
            />
          </label>

          <label className="space-y-3">
            <span className="text-sm text-white">状态</span>
            <select
              className="input-shell w-full px-5 py-4 text-white outline-none"
              name="status"
              value={state.status}
              onChange={(event) =>
                setField("status", event.target.value as ExperienceRecord["status"])
              }
            >
              <option value="active">启用中</option>
              <option value="inactive">已停用</option>
            </select>
          </label>

          <label className="space-y-3 lg:col-span-2">
            <span className="text-sm text-white">短句文案</span>
            <textarea
              className="input-shell min-h-32 w-full resize-y px-5 py-4 text-white outline-none"
              name="quote"
              value={state.quote}
              onChange={(event) => setField("quote", event.target.value)}
              placeholder="例如：风声穿过林隙，像一段没说完的夜。"
              maxLength={80}
            />
          </label>

          <label className="space-y-3">
            <span className="text-sm text-white">
              音频文件 {mode === "create" ? "（必填）" : "（留空则保持当前音频）"}
            </span>
            <input
              className="input-shell w-full px-5 py-4 text-sm text-white/78"
              type="file"
              name="audio"
              accept=".mp3,.wav,.aac,.m4a,audio/*"
              required={mode === "create"}
            />
            <p className="text-xs leading-6 text-white/48">
              支持 MP3 / WAV / AAC，建议 10MB 以内。系统会自动压缩并生成音量与频率数据。
            </p>
          </label>

          <div className="space-y-3">
            <label className="space-y-3">
              <span className="text-sm text-white">封面图片（可选）</span>
              <input
                className="input-shell w-full px-5 py-4 text-sm text-white/78"
                type="file"
                name="cover"
                accept="image/*"
              />
            </label>
            {experience?.coverPath ? (
              <label className="inline-flex items-center gap-3 text-sm text-white/64">
                <input type="checkbox" name="removeCover" value="true" />
                移除当前封面
              </label>
            ) : null}
          </div>
        </div>

        <div className="mt-10 border-t border-white/8 pt-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="display-font text-2xl text-white">视觉配置</h2>
              <p className="mt-2 text-sm text-white/56">
                每一组内容都可以套用模板，再微调线条密度、亮度范围、呼吸周期与动态强度。
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {VISUAL_PRESET_OPTIONS.map((preset) => {
              const selected = state.visualPreset === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => applyPreset(preset.value)}
                  className={`rounded-[24px] border px-5 py-5 text-left transition ${
                    selected
                      ? "border-[var(--gold)] bg-[rgba(216,185,141,0.08)]"
                      : "border-white/10 bg-white/3 hover:border-white/24"
                  }`}
                >
                  <input type="hidden" name="visualPreset" value={state.visualPreset} />
                  <p className="text-base text-white">{preset.label}</p>
                  <p className="mt-2 text-sm leading-7 text-white/54">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {renderRangeField({
              name: "lineDensity",
              label: "线条密度",
              min: 8,
              max: 64,
              step: 1,
              hint: "数值越高，抽象佛影越细密、结构感越强。",
            })}
            {renderRangeField({
              name: "breathCycle",
              label: "呼吸周期（秒）",
              min: 6,
              max: 10,
              step: 0.1,
              hint: "建议保持在 6-10 秒之间，让明暗呼吸更贴近冥想节奏。",
            })}
            {renderRangeField({
              name: "brightnessMin",
              label: "最低亮度",
              min: 0.05,
              max: 0.8,
              step: 0.01,
              hint: "越低越克制，留白越重。",
            })}
            {renderRangeField({
              name: "brightnessMax",
              label: "最高亮度",
              min: 0.1,
              max: 1,
              step: 0.01,
              hint: "决定高峰时刻的轮廓显现程度。",
            })}
            {renderRangeField({
              name: "revealFrequency",
              label: "显隐频率",
              min: 0.1,
              max: 1,
              step: 0.01,
              hint: "控制线条明灭的出现速度和切换频度。",
            })}
            {renderRangeField({
              name: "dynamicIntensity",
              label: "动态强度",
              min: 0.05,
              max: 1,
              step: 0.01,
              hint: "数值越高，整体漂移和波动越明显。",
            })}
          </div>
        </div>

        {error ? (
          <div className="mt-8 rounded-[20px] border border-red-400/24 bg-red-500/8 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-8 rounded-[20px] border border-emerald-400/18 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-100">
            {success}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={pending}
            className="metal-button px-6 py-3 text-sm tracking-[0.18em] uppercase disabled:opacity-60"
          >
            {pending ? "保存中…" : mode === "create" ? "创建内容" : "保存更新"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-full border border-white/12 px-6 py-3 text-sm text-white/74 transition hover:border-white/28 hover:text-white"
          >
            返回后台
          </button>
        </div>
      </form>

      <aside className="glass-panel soft-grid noise-overlay rounded-[32px] p-6">
        <div className="eyebrow w-fit text-xs uppercase tracking-[0.22em]">
          Live Preview
        </div>

        <div className="mt-6 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(4,8,14,0.78),rgba(7,12,20,0.95))] p-6">
          <p className="text-xs uppercase tracking-[0.26em] text-white/42">
            Preview Link
          </p>
          <p className="mt-3 text-xl text-white">{previewSlug}</p>

          <div className="halo-ring mt-8 overflow-hidden rounded-[28px] border border-[rgba(216,185,141,0.12)] bg-[radial-gradient(circle_at_50%_30%,rgba(216,185,141,0.18),transparent_34%),linear-gradient(180deg,#0a1220,#05080f)] px-6 py-10">
            <div className="mx-auto h-64 w-full max-w-[220px] rounded-[120px] border border-[rgba(216,185,141,0.16)] bg-[radial-gradient(circle_at_50%_24%,rgba(246,242,234,0.1),transparent_30%),radial-gradient(circle_at_50%_55%,rgba(143,185,210,0.08),transparent_54%)]" />
          </div>

          <div className="mt-8">
            <p className="display-font text-2xl leading-tight text-white">
              {previewName}
            </p>
            <p className="mt-4 text-sm leading-7 text-white/62">{previewQuote}</p>
          </div>

          <div className="mt-8 grid gap-3 text-xs text-white/52">
            <div className="flex items-center justify-between rounded-full border border-white/8 px-4 py-3">
              <span>模板</span>
              <span>{VISUAL_PRESET_MAP[state.visualPreset].label}</span>
            </div>
            <div className="flex items-center justify-between rounded-full border border-white/8 px-4 py-3">
              <span>线条密度</span>
              <span>{state.lineDensity}</span>
            </div>
            <div className="flex items-center justify-between rounded-full border border-white/8 px-4 py-3">
              <span>呼吸周期</span>
              <span>{state.breathCycle}s</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
