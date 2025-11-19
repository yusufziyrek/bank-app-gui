import { store } from '../store/store';
import { escapeHTML } from '../lib/utils';

export function renderAuthView() {
    const state = store.getState();
    const isLogin = state.authMode === 'login';
    const submitLabel = isLogin ? 'Giriş Yap' : 'Hesap Oluştur';

    // Premium toggle styling
    const toggleClasses = (mode) => (state.authMode === mode
        ? 'relative z-10 flex-1 rounded-lg bg-white text-slate-900 font-bold shadow-sm ring-1 ring-black/5 transition-all duration-200 dark:bg-neutral-800 dark:text-white dark:ring-white/10'
        : 'relative z-10 flex-1 rounded-lg text-slate-500 font-medium hover:text-slate-900 transition-colors duration-200 dark:text-slate-400 dark:hover:text-white');

    return `
        <div class="relative h-screen w-full flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-[#0f172a]">
            <!-- Background Decoration -->
            <div class="absolute -left-[10%] -top-[10%] h-[50vh] w-[50vh] rounded-full bg-primary/20 blur-[100px] dark:bg-primary/10"></div>
            <div class="absolute -right-[10%] -bottom-[10%] h-[50vh] w-[50vh] rounded-full bg-secondary/20 blur-[100px] dark:bg-secondary/10"></div>

            <div class="relative w-full max-w-[400px] px-4 flex flex-col max-h-screen overflow-y-auto py-4 no-scrollbar">
                <!-- Logo & Header -->
                <div class="mb-6 text-center shrink-0">
                    <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20 text-white">
                        <span class="material-symbols-outlined text-3xl">account_balance</span>
                    </div>
                    <h1 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">BankApp</h1>
                    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Finansal özgürlüğünüze hoş geldiniz</p>
                </div>

                <!-- Main Card -->
                <div class="glass-panel rounded-3xl border border-white/20 bg-white/70 p-6 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/70">
                    
                    <!-- Toggle Switch -->
                    <div class="mb-6 flex h-10 items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800/50">
                        <button type="button" class="${toggleClasses('login')} h-full text-xs" data-auth-mode="login">Giriş Yap</button>
                        <button type="button" class="${toggleClasses('register')} h-full text-xs" data-auth-mode="register">Kayıt Ol</button>
                    </div>

                    <!-- Welcome Text -->
                    <div class="mb-6 text-center">
                        <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                            ${isLogin ? 'Tekrar hoş geldiniz!' : 'Hesabınızı oluşturun'}
                        </h2>
                        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            ${isLogin
            ? 'Devam etmek için bilgilerinizi girin.'
            : 'Sadece birkaç adımda aramıza katılın.'}
                        </p>
                    </div>

                    <!-- Error Messages -->
                    ${state.globalError || state.authError ? `
                        <div class="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
                            <span class="material-symbols-outlined text-lg shrink-0">error</span>
                            <p>${escapeHTML(state.globalError || state.authError)}</p>
                        </div>
                    ` : ''}

                    <!-- Form -->
                    <form data-form="${isLogin ? 'login' : 'register'}" class="space-y-4" novalidate>
                        ${!isLogin ? `
                            <div class="space-y-1">
                                <label class="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ad Soyad</label>
                                <div class="relative">
                                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">person</span>
                                    <input name="fullName" type="text" required autocomplete="name" placeholder="Adınız Soyadınız" 
                                        class="block w-full rounded-lg border-0 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-slate-800/50 dark:text-white dark:ring-slate-700 dark:focus:bg-slate-800 dark:focus:ring-primary transition-all" />
                                </div>
                            </div>
                        ` : ''}

                        <div class="space-y-1">
                            <label class="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">E-posta</label>
                            <div class="relative">
                                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">mail</span>
                                <input name="email" type="email" required autocomplete="email" placeholder="ornek@email.com" 
                                    class="block w-full rounded-lg border-0 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-slate-800/50 dark:text-white dark:ring-slate-700 dark:focus:bg-slate-800 dark:focus:ring-primary transition-all" />
                            </div>
                        </div>

                        <div class="space-y-1">
                            <label class="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Parola</label>
                            <div class="relative">
                                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock</span>
                                <input name="password" type="password" required minlength="6" autocomplete="${isLogin ? 'current-password' : 'new-password'}" placeholder="••••••••" 
                                    class="block w-full rounded-lg border-0 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-slate-800/50 dark:text-white dark:ring-slate-700 dark:focus:bg-slate-800 dark:focus:ring-primary transition-all" />
                            </div>
                        </div>

                        <button type="submit" ${state.authLoading ? 'disabled' : ''} 
                            class="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.98]">
                            <span class="relative z-10 flex items-center gap-2">
                                ${state.authLoading
            ? '<span class="material-symbols-outlined animate-spin text-lg">progress_activity</span>'
            : `<span>${submitLabel}</span> <span class="material-symbols-outlined text-lg transition-transform group-hover:translate-x-0.5">arrow_forward</span>`}
                            </span>
                        </button>
                    </form>
                </div>
                
                <!-- Footer -->
                <p class="mt-6 text-center text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                    Güvenli bankacılık deneyimi için <br/>
                    <span class="font-medium text-slate-500 dark:text-slate-400">End-to-End Encryption</span> ile korunmaktadır.
                </p>
            </div>
        </div>
    `;
}
