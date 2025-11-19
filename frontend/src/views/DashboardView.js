import { store } from '../store/store';
import {
    formatCurrency,
    formatDateTime,
    formatDate,
    escapeHTML,
    computeAccountTotals,
    computeTransactionRollups,
    transactionIcon
} from '../lib/utils';

export function renderDashboardView() {
    const state = store.getState();
    const { totalBalance } = computeAccountTotals(state.accounts);
    const { income, expenses } = computeTransactionRollups(state.transactions);
    const recentTransactions = [...state.transactions]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 4);
    const accountsPreview = state.accounts.slice(0, 3);

    const loadingAccounts = !state.accountsLoaded && state.viewLoading;
    const loadingTransactions = !state.transactionsLoaded && state.viewLoading;

    return `
        <section class="space-y-6 px-4 py-8 sm:px-6 lg:px-10">
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div class="space-y-6 lg:col-span-8">
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <div class="rounded-xl border border-neutral-light-bg/60 bg-white p-6 shadow-sm dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/70">
                            <p class="text-sm font-medium text-neutral-text-light/70 dark:text-neutral-text-dark/70">Toplam Varlık</p>
                            <p class="mt-2 text-3xl font-bold text-neutral-text-light dark:text-neutral-text-dark">${formatCurrency(totalBalance)}</p>
                            <p class="mt-1 text-xs font-medium text-secondary">Son yenileme ${formatDateTime(new Date().toISOString())}</p>
                        </div>
                        <div class="rounded-xl border border-neutral-light-bg/60 bg-white p-6 shadow-sm dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/70">
                            <p class="text-sm font-medium text-neutral-text-light/70 dark:text-neutral-text-dark/70">Gelir</p>
                            <p class="mt-2 text-3xl font-bold text-neutral-text-light dark:text-neutral-text-dark">${formatCurrency(income)}</p>
                            <p class="mt-1 text-xs text-neutral-text-light/60 dark:text-neutral-text-dark/60">Bu ay</p>
                        </div>
                        <div class="rounded-xl border border-neutral-light-bg/60 bg-white p-6 shadow-sm dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/70">
                            <p class="text-sm font-medium text-neutral-text-light/70 dark:text-neutral-text-dark/70">Gider</p>
                            <p class="mt-2 text-3xl font-bold text-neutral-text-light dark:text-neutral-text-dark">${formatCurrency(expenses)}</p>
                            <p class="mt-1 text-xs text-neutral-text-light/60 dark:text-neutral-text-dark/60">Bu ay</p>
                        </div>
                    </div>
                    <div class="rounded-xl border border-neutral-light-bg/60 bg-white p-6 shadow-sm dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/70">
                        <div class="flex items-center justify-between">
                            <h2 class="text-lg font-bold text-neutral-text-light dark:text-neutral-text-dark">Son İşlemler</h2>
                            <button type="button" data-nav="transactions" class="text-sm font-semibold text-primary hover:underline">Tümünü gör</button>
                        </div>
                        ${loadingTransactions
            ? `<div class="flex items-center justify-center py-10 text-sm text-neutral-text-light/70 dark:text-neutral-text-dark/70">İşlemler yükleniyor...</div>`
            : recentTransactions.length === 0
                ? `<div class="flex items-center justify-center py-10 text-sm text-neutral-text-light/70 dark:text-neutral-text-dark/70">Henüz işlem bulunmuyor.</div>`
                : `<div class="mt-4 divide-y divide-neutral-light-bg/50 dark:divide-neutral-dark-bg/50">
                                        ${recentTransactions.map((tx) => {
                    const amount = Number(tx.amount) || 0;
                    const sign = amount < 0 ? '-' : '+';
                    const color = amount < 0 ? 'text-accent' : 'text-secondary';
                    const description = tx.description || 'İşlem';
                    return `
                                                <div class="flex items-center justify-between py-4">
                                                    <div class="flex items-center gap-4">
                                                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-light-bg text-neutral-text-light dark:bg-neutral-dark-bg dark:text-neutral-text-dark">
                                                            <span class="material-symbols-outlined">${transactionIcon(tx.type)}</span>
                                                        </div>
                                                        <div>
                                                            <p class="font-medium text-neutral-text-light dark:text-neutral-text-dark">${escapeHTML(description)}</p>
                                                            <p class="text-sm text-neutral-text-light/60 dark:text-neutral-text-dark/60">${formatDate(tx.created_at)}</p>
                                                        </div>
                                                    </div>
                                                    <div class="text-right">
                                                        <p class="font-semibold ${color}">${sign} ${formatCurrency(Math.abs(amount))}</p>
                                                    </div>
                                                </div>
                                            `;
                }).join('')}
                                   </div>`}
                    </div>
                </div>
                <div class="space-y-6 lg:col-span-4">
                    <div class="rounded-xl border border-neutral-light-bg/60 bg-white p-6 shadow-sm dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/70">
                        <h2 class="text-lg font-bold text-neutral-text-light dark:text-neutral-text-dark">Hesaplarım</h2>
                        ${loadingAccounts
            ? `<div class="flex items-center justify-center py-8 text-sm text-neutral-text-light/70 dark:text-neutral-text-dark/70">Hesaplar yükleniyor...</div>`
            : accountsPreview.length === 0
                ? `<div class="flex flex-col items-center gap-3 py-8 text-center text-sm text-neutral-text-light/70 dark:text-neutral-text-dark/70">
                                        <span class="material-symbols-outlined text-3xl text-primary">account_balance</span>
                                        <p>Henüz herhangi bir hesabınız yok.</p>
                                        <button type="button" data-nav="accounts" class="text-sm font-semibold text-primary hover:underline">Hesap oluştur</button>
                                   </div>`
                : `<div class="mt-4 space-y-4">
                                        ${accountsPreview.map((account) => `
                                            <div class="flex items-center justify-between">
                                                <div>
                                                    <p class="font-medium text-neutral-text-light dark:text-neutral-text-dark">${escapeHTML(account.account_number)}</p>
                                                    <p class="text-sm text-neutral-text-light/60 dark:text-neutral-text-dark/60">${formatDate(account.created_at)}</p>
                                                </div>
                                                <p class="font-semibold text-neutral-text-light dark:text-neutral-text-dark">${formatCurrency(account.balance)}</p>
                                            </div>
                                        `).join('')}
                                   </div>`}
                    </div>
                    <div class="rounded-xl border border-neutral-light-bg/60 bg-white p-6 shadow-sm dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/70">
                        <h2 class="text-lg font-bold text-neutral-text-light dark:text-neutral-text-dark">Hızlı İşlemler</h2>
                        <div class="mt-4 grid grid-cols-2 gap-3">
                            <button type="button" data-nav="transfer" class="flex flex-col items-center gap-2 rounded-lg border border-neutral-light-bg/60 bg-neutral-light-bg/50 p-4 text-sm font-medium text-neutral-text-light transition hover:bg-primary/15 hover:text-primary dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/60 dark:text-neutral-text-dark">
                                <span class="material-symbols-outlined text-3xl">send</span>
                                Para Gönder
                            </button>
                            <button type="button" data-nav="transactions" class="flex flex-col items-center gap-2 rounded-lg border border-neutral-light-bg/60 bg-neutral-light-bg/50 p-4 text-sm font-medium text-neutral-text-light transition hover:bg-primary/15 hover:text-primary dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/60 dark:text-neutral-text-dark">
                                <span class="material-symbols-outlined text-3xl">list_alt</span>
                                İşlem Geçmişi
                            </button>
                            <button type="button" data-nav="accounts" class="flex flex-col items-center gap-2 rounded-lg border border-neutral-light-bg/60 bg-neutral-light-bg/50 p-4 text-sm font-medium text-neutral-text-light transition hover:bg-primary/15 hover:text-primary dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/60 dark:text-neutral-text-dark">
                                <span class="material-symbols-outlined text-3xl">account_balance</span>
                                Hesap Aç
                            </button>
                            <button type="button" data-nav="cards" class="flex flex-col items-center gap-2 rounded-lg border border-neutral-light-bg/60 bg-neutral-light-bg/50 p-4 text-sm font-medium text-neutral-text-light transition hover:bg-primary/15 hover:text-primary dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/60 dark:text-neutral-text-dark">
                                <span class="material-symbols-outlined text-3xl">credit_card</span>
                                Kart Yönetimi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
}
