import { escapeHTML } from '../utils/dom';

export function renderAuthView(state) {
    const isLogin = state.authMode === 'login';
    const submitLabel = isLogin ? 'Giriş Yap' : 'Hesap Oluştur';

    const toggleClasses = (mode) => (state.authMode === mode
        ? 'flex-1 rounded-lg bg-white text-slate-900 font-semibold shadow-sm dark:bg-background-dark dark:text-white'
        : 'flex-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-[#92a9c9] dark:hover:text-white');

    return `
        <div class="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4 py-12">
            <div class="w-full max-w-md space-y-10">
                <header class="flex items-center justify-center gap-3">
                    <span class="material-symbols-outlined text-3xl text-primary">account_balance</span>
                    <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">BankApp</h1>
                </header>
                <div class="glass-panel rounded-2xl px-8 py-10 shadow-xl space-y-6">
                    <div class="space-y-2 text-center">
                        <p class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            ${isLogin ? 'Hoş geldiniz' : 'Yeni hesap açın'}
                        </p>
                        <p class="text-sm text-slate-500 dark:text-[#92a9c9]">
                            ${isLogin
                                ? 'BankApp hesabınıza güvenli bir şekilde giriş yapın.'
                                : 'BankApp dünyasına katılın ve tüm bankacılık servislere erişin.'}
                        </p>
                    </div>
                    <div class="flex h-11 items-center rounded-lg bg-slate-100 dark:bg-[#233348] p-1">
                        <button type="button" class="${toggleClasses('login')} px-3 py-2 text-sm" data-auth-mode="login">Giriş</button>
                        <button type="button" class="${toggleClasses('register')} px-3 py-2 text-sm" data-auth-mode="register">Kayıt</button>
                    </div>
                    ${state.globalError
                        ? `<div class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                                <span class="material-symbols-outlined text-base">error</span>
                                <span>${escapeHTML(state.globalError)}</span>
                           </div>`
                        : ''}
                    ${state.authError
                        ? `<div class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                                <span class="material-symbols-outlined text-base">error</span>
                                <span>${escapeHTML(state.authError)}</span>
                           </div>`
                        : ''}
                    <form data-form="${isLogin ? 'login' : 'register'}" class="space-y-4" novalidate>
                        ${!isLogin
                            ? `
                                <label class="block text-left space-y-2">
                                    <span class="text-sm font-medium text-slate-700 dark:text-white">Ad Soyad</span>
                                    <input name="fullName" type="text" required autocomplete="name" placeholder="Tam adınız" class="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-base text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-[#324867] dark:bg-[#192433] dark:text-white" />
                                </label>
                              `
                            : ''}
                        <label class="block text-left space-y-2">
                            <span class="text-sm font-medium text-slate-700 dark:text-white">E-posta</span>
                            <input name="email" type="email" required autocomplete="email" placeholder="ornek@domain.com" class="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-base text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-[#324867] dark:bg-[#192433] dark:text-white" />
                        </label>
                        <label class="block text-left space-y-2">
                            <span class="text-sm font-medium text-slate-700 dark:text-white">Parola</span>
                            <input name="password" type="password" required minlength="6" autocomplete="${isLogin ? 'current-password' : 'new-password'}" placeholder="Parolanız" class="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-base text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-[#324867] dark:bg-[#192433] dark:text-white" />
                        </label>
                        <button type="submit" ${state.authLoading ? 'disabled' : ''} class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white shadow transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70">
                            <span class="material-symbols-outlined text-xl">${isLogin ? 'lock' : 'how_to_reg'}</span>
                            <span>${submitLabel}</span>
                        </button>
                    </form>
                </div>
                <footer class="text-center text-sm text-slate-500 dark:text-slate-400">© ${new Date().getFullYear()} BankApp. Tüm hakları saklıdır.</footer>
            </div>
        </div>
    `;
}
