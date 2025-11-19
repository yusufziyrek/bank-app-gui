import { store } from '../store/store';
import { escapeHTML, formatCurrency, formatDate } from '../lib/utils';

export function renderAccountsView() {
    const state = store.getState();
    const hasAccounts = state.accounts.length > 0;
    const loadingAccounts = !state.accountsLoaded && state.viewLoading;

    return `
        <section class="space-y-6 px-4 py-8 sm:px-6 lg:px-20">
            <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 class="text-3xl font-black text-neutral-text-light dark:text-neutral-text-dark">Hesap Yönetimi</h2>
                    <p class="text-sm text-neutral-text-light/60 dark:text-neutral-text-dark/60">BankApp üzerinde açılmış tüm hesaplarınızı buradan yönetin.</p>
                </div>
            </div>
            <form data-form="create-account" class="grid gap-4 rounded-xl border border-neutral-light-bg/60 bg-white p-6 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto] dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/70">
                <div>
                    <label class="mb-2 block text-sm font-medium text-neutral-text-light dark:text-neutral-text-dark" for="initialDeposit">Başlangıç Bakiyesi</label>
                    <div class="relative">
                        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-light/60 dark:text-neutral-text-dark/60">₺</span>
                        <input id="initialDeposit" name="initialDeposit" type="number" min="0" step="0.01" required placeholder="0,00" class="h-12 w-full rounded-lg border border-neutral-light-bg/60 bg-neutral-light-bg/40 pl-8 pr-4 text-base text-neutral-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-neutral-dark-bg dark:bg-neutral-dark-bg dark:text-neutral-text-dark" />
                    </div>
                </div>
                <button type="submit" class="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                    <span class="material-symbols-outlined text-lg">add</span>
                    <span>Yeni Hesap Aç</span>
                </button>
            </form>
            ${loadingAccounts
            ? `<div class="flex items-center justify-center rounded-xl border border-dashed border-neutral-light-bg/60 px-4 py-16 text-sm text-neutral-text-light/70 dark:border-neutral-dark-bg dark:text-neutral-text-dark/70">Hesaplar yükleniyor...</div>`
            : hasAccounts
                ? `<div class="grid gap-4 md:grid-cols-2">
                            ${state.accounts.map((account) => `
                                <div class="rounded-xl border border-neutral-light-bg/60 bg-white p-6 shadow-sm dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/70">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-sm text-neutral-text-light/60 dark:text-neutral-text-dark/60">Hesap No</p>
                                            <p class="text-lg font-semibold text-neutral-text-light dark:text-neutral-text-dark">${escapeHTML(account.account_number)}</p>
                                        </div>
                                        <span class="material-symbols-outlined text-3xl text-primary">account_balance</span>
                                    </div>
                                    <div class="mt-6 flex items-center justify-between">
                                        <div>
                                            <p class="text-sm text-neutral-text-light/60 dark:text-neutral-text-dark/60">Bakiye</p>
                                            <p class="text-xl font-bold text-neutral-text-light dark:text-neutral-text-dark">${formatCurrency(account.balance)}</p>
                                        </div>
                                        <p class="text-xs text-neutral-text-light/50 dark:text-neutral-text-dark/50">Güncelleme: ${formatDate(account.updated_at)}</p>
                                    </div>
                                </div>
                            `).join('')}
                       </div>`
                : `<div class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-neutral-light-bg/60 px-4 py-16 text-center text-sm text-neutral-text-light/70 dark:border-neutral-dark-bg dark:text-neutral-text-dark/70">
                            <span class="material-symbols-outlined text-4xl text-primary">hourglass_empty</span>
                            <p>Henüz açılmış bir hesabınız yok. Yukarıdaki formu kullanarak kolayca yeni bir hesap oluşturabilirsiniz.</p>
                       </div>`}
        </section>
    `;
}
