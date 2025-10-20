<script lang="ts">
  type Tab = 'login' | 'register';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let activeTab: Tab = 'login';

  let registerForm = {
    username: '',
    email: '',
    playerName: '',
    password: '',
    confirmPassword: '',
  };

  let loginForm = {
    username: '',
    password: '',
  };

  let registerError: string | null = null;
  let registerSuccess: string | null = null;
  let verificationLink: string | null = null;
  let loginError: string | null = null;
  let loginSuccess: string | null = null;

  let isSubmittingRegister = false;
  let isSubmittingLogin = false;

  const tabButtonClasses =
    'rounded-full px-4 py-2 text-slate-300 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-300/60 focus-visible:ring-offset-slate-950';
  const activeTabClass = 'bg-teal-500/20 text-teal-200';

  const resetMessages = () => {
    registerError = null;
    registerSuccess = null;
    verificationLink = null;
    loginError = null;
    loginSuccess = null;
  };

  const switchTab = (tab: Tab) => {
    if (activeTab === tab) return;
    activeTab = tab;
    resetMessages();
  };

  const submitRegister = async () => {
    if (isSubmittingRegister) return;

    resetMessages();

    if (!registerForm.username.trim()) {
      registerError = 'กรุณาระบุชื่อผู้ใช้';
      return;
    }

    if (!emailRegex.test(registerForm.email.trim())) {
      registerError = 'รูปแบบอีเมลไม่ถูกต้อง';
      return;
    }

    if (!registerForm.playerName.trim()) {
      registerError = 'กรุณาระบุชื่อผู้เล่น';
      return;
    }

    if (registerForm.password.length < 8) {
      registerError = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      registerError = 'รหัสผ่านและการยืนยันไม่ตรงกัน';
      return;
    }

    isSubmittingRegister = true;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        registerError = typeof payload.error === 'string' ? payload.error : 'ไม่สามารถสร้างบัญชีได้';
        return;
      }

      registerSuccess = typeof payload.message === 'string'
        ? payload.message
        : 'สร้างบัญชีสำเร็จ กรุณาตรวจสอบอีเมลของคุณ';
      verificationLink = typeof payload.verificationLink === 'string' ? payload.verificationLink : null;

      registerForm = {
        username: '',
        email: '',
        playerName: '',
        password: '',
        confirmPassword: '',
      };
    } catch (error) {
      console.error(error);
      registerError = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
    } finally {
      isSubmittingRegister = false;
    }
  };

  const submitLogin = async () => {
    if (isSubmittingLogin) return;

    resetMessages();

    if (!loginForm.username.trim()) {
      loginError = 'กรุณาระบุชื่อผู้ใช้';
      return;
    }

    if (!loginForm.password) {
      loginError = 'กรุณาระบุรหัสผ่าน';
      return;
    }

    isSubmittingLogin = true;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        loginError = typeof payload.error === 'string' ? payload.error : 'ไม่สามารถเข้าสู่ระบบได้';
        return;
      }

      loginSuccess = typeof payload.message === 'string'
        ? payload.message
        : 'เข้าสู่ระบบสำเร็จ';

      loginForm = {
        username: '',
        password: '',
      };
    } catch (error) {
      console.error(error);
      loginError = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
    } finally {
      isSubmittingLogin = false;
    }
  };
</script>

<div class="page-shell min-h-screen flex flex-col items-center px-6 py-16">
  <div class="w-full max-w-4xl space-y-10">
    <header class="text-center space-y-3">
      <p class="text-sm uppercase tracking-[0.4em] text-teal-300/80 font-semibold">Idle MMO Toolkit</p>
      <h1 class="text-4xl font-bold sm:text-5xl">เตรียมตัวผจญภัยในโลก Idle MMO</h1>
      <p class="text-base text-slate-300">
        สร้างบัญชีผู้เล่นและยืนยันอีเมลของคุณเพื่อเข้าสู่ระบบ แล้วเริ่มสะสมพลังไปพร้อมกัน
      </p>
    </header>

    <div class="glass-panel rounded-2xl border border-white/10 shadow-xl shadow-black/30">
      <nav class="flex items-center justify-center gap-4 border-b border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold">
        <button
          type="button"
          class={`${tabButtonClasses} ${activeTab === 'login' ? activeTabClass : ''}`}
          on:click={() => switchTab('login')}
        >
          เข้าสู่ระบบ
        </button>
        <button
          type="button"
          class={`${tabButtonClasses} ${activeTab === 'register' ? activeTabClass : ''}`}
          on:click={() => switchTab('register')}
        >
          ลงทะเบียน
        </button>
      </nav>

      <section class="p-6">
        {#if activeTab === 'login'}
          <form class="space-y-4" on:submit|preventDefault={submitLogin}>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-200" for="login-username">ชื่อผู้ใช้</label>
              <input
                id="login-username"
                class="w-full rounded-xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 text-sm text-teal-200 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                type="text"
                bind:value={loginForm.username}
                autocomplete="username"
                required
                disabled={isSubmittingLogin}
              />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-200" for="login-password">รหัสผ่าน</label>
              <input
                id="login-password"
                class="w-full rounded-xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 text-sm text-teal-200 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                type="password"
                bind:value={loginForm.password}
                autocomplete="current-password"
                required
                disabled={isSubmittingLogin}
              />
            </div>
            {#if loginError}
              <p class="text-sm text-rose-400">{loginError}</p>
            {/if}
            {#if loginSuccess}
              <p class="text-sm text-teal-300">{loginSuccess}</p>
            {/if}
            <button
              type="submit"
              class="w-full rounded-xl bg-teal-500 px-5 py-3 text-sm font-semibold tracking-wide text-slate-950 transition hover:bg-teal-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-300 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmittingLogin}
            >
              {isSubmittingLogin ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        {:else}
          <form class="space-y-4" on:submit|preventDefault={submitRegister}>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-200" for="register-username">ชื่อผู้ใช้</label>
                <input
                  id="register-username"
                  class="w-full rounded-xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 text-sm text-teal-200 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  type="text"
                  bind:value={registerForm.username}
                  autocomplete="username"
                  required
                  disabled={isSubmittingRegister}
                />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-200" for="register-email">อีเมล</label>
                <input
                  id="register-email"
                  class="w-full rounded-xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 text-sm text-teal-200 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  type="email"
                  bind:value={registerForm.email}
                  autocomplete="email"
                  required
                  disabled={isSubmittingRegister}
                />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-200" for="register-player-name">ชื่อผู้เล่น</label>
                <input
                  id="register-player-name"
                  class="w-full rounded-xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 text-sm text-teal-200 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  type="text"
                  bind:value={registerForm.playerName}
                  autocomplete="nickname"
                  required
                  disabled={isSubmittingRegister}
                />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-200" for="register-password">รหัสผ่าน</label>
                <input
                  id="register-password"
                  class="w-full rounded-xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 text-sm text-teal-200 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  type="password"
                  bind:value={registerForm.password}
                  autocomplete="new-password"
                  minlength="8"
                  required
                  disabled={isSubmittingRegister}
                />
              </div>
              <div class="space-y-2 sm:col-span-2">
                <label class="block text-sm font-medium text-slate-200" for="register-confirm-password">ยืนยันรหัสผ่าน</label>
                <input
                  id="register-confirm-password"
                  class="w-full rounded-xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 text-sm text-teal-200 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  type="password"
                  bind:value={registerForm.confirmPassword}
                  autocomplete="new-password"
                  minlength="8"
                  required
                  disabled={isSubmittingRegister}
                />
              </div>
            </div>
            <p class="text-xs text-slate-400">หลังจากลงทะเบียน ระบบจะส่งลิงก์ยืนยันไปยังอีเมลของคุณ</p>
            {#if registerError}
              <p class="text-sm text-rose-400">{registerError}</p>
            {/if}
            {#if registerSuccess}
              <div class="space-y-2 rounded-xl border border-teal-500/40 bg-teal-500/10 p-4 text-sm text-teal-200">
                <p>{registerSuccess}</p>
                {#if verificationLink}
                  <p class="break-all text-xs text-teal-300/80">
                    ลิงก์ยืนยันสำหรับการทดสอบ: <a class="underline" href={verificationLink}>{verificationLink}</a>
                  </p>
                {/if}
              </div>
            {/if}
            <button
              type="submit"
              class="w-full rounded-xl bg-teal-500 px-5 py-3 text-sm font-semibold tracking-wide text-slate-950 transition hover:bg-teal-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-300 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmittingRegister}
            >
              {isSubmittingRegister ? 'กำลังสร้างบัญชี...' : 'ลงทะเบียนผู้เล่นใหม่'}
            </button>
          </form>
        {/if}
      </section>
    </div>
  </div>
</div>

