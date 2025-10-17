<script lang="ts">
  let command = '';
  let history: string[] = [];

  const placeholderCommands = ['npm install', 'npm run dev', 'npm run build'];

  const handleSubmit = () => {
    const trimmed = command.trim();
    if (!trimmed) return;

    history = [...history, trimmed];
    command = '';
  };
</script>

<div class="min-h-screen flex flex-col items-center px-6 py-16">
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
      class="glass-panel rounded-2xl p-6 shadow-xl shadow-black/20 border border-slate-800 space-y-4"
      on:submit|preventDefault={handleSubmit}
    >
      <label class="block text-sm font-medium text-slate-200" for="command-input">
        พิมพ์คำสั่งของคุณ
      </label>
      <div class="flex flex-col gap-3 sm:flex-row">
        <input
          id="command-input"
          class="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-mono text-sm text-teal-200 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          type="text"
          bind:value={command}
          placeholder={placeholderCommands[history.length % placeholderCommands.length]}
          autocomplete="off"
        />
        <button
          type="submit"
          class="rounded-xl bg-teal-500 px-5 py-3 text-sm font-semibold tracking-wide text-slate-900 transition hover:bg-teal-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-300 focus-visible:ring-offset-slate-900"
        >
          ส่งคำสั่ง
        </button>
      </div>
      <p class="text-xs text-slate-400">
        Tip: กด Enter เพื่อยืนยันคำสั่ง หรือคลิกปุ่ม “ส่งคำสั่ง”
      </p>
    </form>

    <section class="glass-panel rounded-2xl border border-slate-800 shadow-xl shadow-black/20">
      <header class="border-b border-white/5 bg-white/5 px-6 py-4">
        <h2 class="text-lg font-semibold text-teal-300">ผลลัพธ์คำสั่ง</h2>
      </header>

      {#if history.length === 0}
        <p class="px-6 py-6 text-sm text-slate-400">
          ยังไม่มีคำสั่ง — เริ่มต้นทดลองได้เลยด้านบน!
        </p>
      {:else}
        <div class="divide-y divide-white/5">
          {#each history as entry, index (index)}
            <pre class="overflow-x-auto px-6 py-4 text-sm">
              <code class="block font-mono text-teal-300">$ {entry}</code>
            </pre>
          {/each}
        </div>
      {/if}
    </section>
  </div>
</div>
