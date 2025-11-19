import { escapeHTML } from '../utils/dom';
import { formatCurrency, formatDate, formatDateTime } from './shared';
import { transactionIcon } from './shared';

export function renderDashboardView(state) {
    const totalBalance = state.accounts.reduce((sum, account) => sum + (Number(account.balance) || 0), 0);

    let income = 0;
    let expenses = 0;
    for (const tx of state.transactions) {
        const amount = Number(tx.amount) || 0;
        const type = (tx.type || '').toUpperCase();
        if (type === 'DEPOSIT' || (type === 'TRANSFER' && amount > 0)) {
            income += Math.abs(amount);
        } else if (amount < 0 || type === 'WITHDRAWAL') {
            expenses += Math.abs(amount);
        }
    }

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
                        ${renderStatCard('Toplam Varlık', formatCurrency(totalBalance), 'Son yenileme ' + formatDateTime(new Date().toISOString()), 'text-secondary')}
                        ${renderStatCard('Gelir', formatCurrency(income), 'Bu ay', 'text-neutral-text-light/60 dark:text-neutral-text-dark/60')}
                        ${renderStatCard('Gider', formatCurrency(expenses), 'Bu ay', 'text-neutral-text-light/60 dark:text-neutral-text-dark/60')}
                    </div>
                    <div class="rounded-xl border border-neutral-light-bg/60 bg-white p-6 shadow-sm dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/70">
                        <div class="flex items-center justify-between">
                            <h2 class="text-lg font-bold text-neutral-text-light dark:text-neutral-text-dark">Son İşlemler</h2>
                            <button type="button" data-nav="transactions" class="text-sm font-semibold text-primary hover:underline">Tümünü gör</button>
                        </div>
                        ${loadingTransactions
                            ? renderPlaceholder('İşlemler yükleniyor...')
                            : recentTransactions.length === 0
                                ? renderPlaceholder('Henüz işlem bulunmuyor.')
                                : `<div class="mt-4 divide-y divide-neutral-light-bg/50 dark:divide-neutral-dark-bg/50">
                                        ${recentTransactions.map(renderRecentTransactionRow).join('')}
                                   </div>`}
                    </div>
                </div>
                <div class="space-y-6 lg:col-span-4">
                    <div class="rounded-xl border border-neutral-light-bg/60 bg-white p-6 shadow-sm dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/70">
                        <h2 class="text-lg font-bold text-neutral-text-light dark:text-neutral-text-dark">Hesaplarım</h2>
                        ${loadingAccounts
                            ? renderPlaceholder('Hesaplar yükleniyor...')
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
                            ${renderQuickAction('transfer', 'send', 'Para Gönder')}
                            ${renderQuickAction('transactions', 'list_alt', 'İşlem Geçmişi')}
                            ${renderQuickAction('accounts', 'account_balance', 'Hesap Aç')}
                            ${renderQuickAction('cards', 'credit_card', 'Kart Yönetimi')}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

function renderStatCard(title, value, caption, captionClass) {
    return `
        <div class="rounded-xl border border-neutral-light-bg/60 bg-white p-6 shadow-sm dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/70">
            <p class="text-sm font-medium text-neutral-text-light/70 dark:text-neutral-text-dark/70">${escapeHTML(title)}</p>
            <p class="mt-2 text-3xl font-bold text-neutral-text-light dark:text-neutral-text-dark">${escapeHTML(value)}</p>
            <p class="mt-1 text-xs font-medium ${captionClass}">${escapeHTML(caption)}</p>
        </div>
    `;
}

function renderPlaceholder(text) {
    return `<div class="flex items-center justify-center py-10 text-sm text-neutral-text-light/70 dark:text-neutral-text-dark/70">${escapeHTML(text)}</div>`;
}

function renderRecentTransactionRow(tx) {
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
}

function renderQuickAction(viewId, icon, label) {
    return `
        <button type="button" data-nav="${viewId}" class="flex flex-col items-center gap-2 rounded-lg border border-neutral-light-bg/60 bg-neutral-light-bg/50 p-4 text-sm font-medium text-neutral-text-light transition hover:bg-primary/15 hover:text-primary dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/60 dark:text-neutral-text-dark">
            <span class="material-symbols-outlined text-3xl">${icon}</span>
            ${escapeHTML(label)}
        </button>
    `;
}
