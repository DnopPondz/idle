<script lang="ts">
  import type { PageData } from './$types';
  import type { CommandRecord } from '$lib/server/commands';

  export let data: PageData;

  const placeholderCommands = ['npm install', 'npm run dev', 'npm run build'];

  let command = '';
  let history: CommandRecord[] = data.history ?? [];
  let errorMessage: string | null = data.error ?? null;
  let isSubmitting = false;

  const handleSubmit = async () => {
    const trimmed = command.trim();
    if (!trimmed || isSubmitting) return;

    isSubmitting = true;
    errorMessage = null;

    try {
      const response = await fetch('/api/commands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: trimmed }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        errorMessage = payload.error ?? 'ไม่สามารถบันทึกคำสั่งได้ กรุณาลองใหม่อีกครั้ง';
        return;
      }

      const created = payload.command as CommandRecord | undefined;
      if (created) {
        history = [created, ...history];
        command = '';
      }
    } catch (error) {
      console.error(error);
      errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล Turso';
    } finally {
      isSubmitting = false;
    }
  };

  const formatTimestamp = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) {
      return value;
    }

    return new Intl.DateTimeFormat('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };
</script>

<div class="page-shell min-h-screen flex flex-col items-center px-6 py-16">
  <div class="w-full max-w-3xl space-y-10">
    <header class="text-center space-y-3">
      <p class="text-sm uppercase tracking-[0.4em] text-teal-300/80 font-semibold">Idle MMO Toolkit</p>
      <h1 class="text-4xl font-bold sm:text-5xl">
        Tailwind CSS พร้อมใช้งานแล้ว
      </h1>
      <p class="text-base text-slate-300">
        เริ่มต้นพิมพ์คำสั่งเพื่อดูผลลัพธ์ที่จัดรูปแบบด้วย <code class="font-mono text-teal-300">&lt;pre&gt;</code>
        และ <code class="font-mono text-teal-300">&lt;code&gt;</code> ด้านล่าง
      </p>
    </header>

    <form
      class="glass-panel rounded-2xl p-6 shadow-xl shadow-black/30 border border-white/10 space-y-4"
      on:submit|preventDefault={handleSubmit}
    >
      <label class="block text-sm font-medium text-slate-200" for="command-input">
        พิมพ์คำสั่งของคุณ
      </label>
      <div class="flex flex-col gap-3 sm:flex-row">
        <input
          id="command-input"
          class="flex-1 rounded-xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 font-mono text-sm text-teal-200 placeholder:text-slate-500 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          type="text"
          bind:value={command}
          placeholder={placeholderCommands[history.length % placeholderCommands.length]}
          autocomplete="off"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          class="rounded-xl bg-teal-500 px-5 py-3 text-sm font-semibold tracking-wide text-slate-950 transition hover:bg-teal-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-300 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'กำลังส่ง...' : 'ส่งคำสั่ง'}
        </button>
      </div>
      <p class="text-xs text-slate-400">
        Tip: กด Enter เพื่อยืนยันคำสั่ง หรือคลิกปุ่ม “ส่งคำสั่ง”
      </p>
      {#if errorMessage}
        <p class="text-sm text-rose-400">{errorMessage}</p>
      {/if}
    </form>

    <section class="glass-panel rounded-2xl border border-white/10 shadow-xl shadow-black/30">
      <header class="border-b border-white/10 bg-white/5 px-6 py-4">
        <h2 class="text-lg font-semibold text-teal-300">ผลลัพธ์คำสั่ง</h2>
      </header>

      {#if history.length === 0}
        <p class="px-6 py-6 text-sm text-slate-400">
          ยังไม่มีคำสั่ง — เริ่มต้นทดลองได้เลยด้านบน!
        </p>
      {:else}
        <div class="divide-y divide-white/10">
          {#each history as entry (entry.id)}
            <article class="px-6 py-4 space-y-2">
              <header class="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
                <span>คำสั่งที่บันทึก</span>
                <span>{formatTimestamp(entry.created_at)}</span>
              </header>
              <pre class="overflow-x-auto rounded-xl bg-slate-900/60 px-4 py-3 text-sm text-teal-200">
                <code class="block font-mono text-left">
                  $ {entry.content}
                </code>
              </pre>
            </article>
          {/each}
        </div>
      {/if}
    </section>
  </div>
</div>
