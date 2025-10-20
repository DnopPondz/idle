<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div class="page-shell min-h-screen flex items-center justify-center px-6 py-16">
  <div class="w-full max-w-lg glass-panel rounded-2xl border border-white/10 p-8 text-center shadow-xl shadow-black/30">
    {#if data.success}
      <h1 class="text-3xl font-bold text-teal-300">ยืนยันอีเมลสำเร็จ</h1>
      <p class="mt-4 text-base text-slate-200">
        ยินดีต้อนรับ <span class="font-semibold">{data.player.playerName}</span>! ตอนนี้คุณสามารถเข้าสู่ระบบด้วยชื่อผู้ใช้
        <span class="font-mono text-teal-300">{data.player.username}</span> ได้แล้ว
      </p>
      <a
        class="mt-8 inline-flex items-center justify-center rounded-xl bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        href="/"
      >
        กลับไปหน้าเข้าสู่ระบบ
      </a>
    {:else}
      <h1 class="text-3xl font-bold text-rose-300">ยืนยันอีเมลไม่สำเร็จ</h1>
      <p class="mt-4 text-base text-slate-200">
        {data.error ?? 'ไม่สามารถยืนยันอีเมลได้ กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ'}
      </p>
      <a
        class="mt-8 inline-flex items-center justify-center rounded-xl bg-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        href="/"
      >
        กลับไปหน้าแรก
      </a>
    {/if}
  </div>
</div>
