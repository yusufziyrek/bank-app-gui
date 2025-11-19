import { escapeHTML } from '../utils/dom';
import { formatCurrency, formatDateTime, transactionIcon, transactionBadge, normaliseType } from './shared';

export function renderTransactionsView(state) {
    const accountMap = new Map(state.accounts.map((account) => [account.id, account]));
    const filtered = state.transactions.filter((tx) => {
        const typeMatches = state.transactionFilter === 'ALL' || normaliseType(tx.type) === state.transactionFilter;
        const query = state.transactionSearch.trim().toLowerCase();
        const description = (tx.description || '').toLowerCase();
        const accountNumber = (accountMap.get(tx.account_id)?.account_number || '').toLowerCase();
        return typeMatches && (query === '' || description.includes(query) || accountNumber.includes(query));
    });

    const loadingTransactions = !state.transactionsLoaded && state.viewLoading;
    const lastSynced = state.lastSynced.transactions ? `Son güncelleme ${formatDateTime(state.lastSynced.transactions)}` : '';

    const tableRows = filtered.map((tx) => {
        const account = accountMap.get(tx.account_id);
        const type = normaliseType(tx.type);
        const signedAmount = `${type === 'WITHDRAWAL' ? '-' : '+'}${formatCurrency(Math.abs(tx.amount ?? 0))}`;
        const timestamp = tx.created_at ? formatDateTime(tx.created_at) : '';

        return `
            <tr class="border-b border-neutral-light-bg/40 last:border-0 dark:border-neutral-dark-bg/60">
                <td class="whitespace-nowrap px-4 py-4">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg text-primary">${transactionIcon(type)}</span>
                        <div class="space-y-1">
                            <p class="text-sm font-semibold text-neutral-text-light dark:text-neutral-text-dark">${escapeHTML(tx.description || 'İşlem')}</p>
                            <span class="text-xs text-neutral-text-light/60 dark:text-neutral-text-dark/60">${escapeHTML(timestamp)}</span>
                        </div>
                    </div>
                </td>
                <td class="whitespace-nowrap px-4 py-4">
                    <span class="text-xs font-medium uppercase ${transactionBadge(type)}">${escapeHTML(type)}</span>
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-sm text-neutral-text-light dark:text-neutral-text-dark">
                    <div class="flex flex-col">
                        <span class="font-medium">${escapeHTML(account?.name || 'Bilinmeyen Hesap')}</span>
                        <span class="text-xs text-neutral-text-light/60 dark:text-neutral-text-dark/60">${escapeHTML(account?.account_number || '—')}</span>
                    </div>
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-right text-sm font-semibold ${type === 'WITHDRAWAL' ? 'text-red-600 dark:text-red-300' : 'text-green-600 dark:text-green-300'}">${signedAmount}</td>
            </tr>
        `;
    }).join('');

    return `
        <section class="space-y-6 px-4 py-8 sm:px-6 lg:px-16">
            <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 class="text-3xl font-black text-neutral-text-light dark:text-neutral-text-dark">İşlem Geçmişi</h2>
                    <p class="text-sm text-neutral-text-light/60 dark:text-neutral-text-dark/60">Geçmiş işlemlerinizi filtreleyin ve arama yapın.</p>
                </div>
                ${lastSynced ? `<p class="text-xs text-neutral-text-light/60 dark:text-neutral-text-dark/60">${escapeHTML(lastSynced)}</p>` : ''}
            </div>
            <div class="grid gap-4 rounded-xl border border-neutral-light-bg/60 bg-white p-6 shadow-sm md:grid-cols-2 lg:grid-cols-3 dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/70">
                <label class="space-y-2">
                    <span class="text-sm font-medium text-neutral-text-light dark:text-neutral-text-dark">İşlem Türü</span>
                    <select data-select="transaction-type" class="h-11 w-full rounded-lg border border-neutral-light-bg/60 bg-neutral-light-bg/40 px-3 text-sm text-neutral-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-neutral-dark-bg dark:bg-neutral-dark-bg dark:text-neutral-text-dark">
                        <option value="ALL" ${state.transactionFilter === 'ALL' ? 'selected' : ''}>Tümü</option>
                        <option value="DEPOSIT" ${state.transactionFilter === 'DEPOSIT' ? 'selected' : ''}>Yatırma</option>
                        <option value="WITHDRAWAL" ${state.transactionFilter === 'WITHDRAWAL' ? 'selected' : ''}>Çekme</option>
                        <option value="TRANSFER" ${state.transactionFilter === 'TRANSFER' ? 'selected' : ''}>Transfer</option>
                    </select>
                </label>
                <label class="space-y-2 md:col-span-2 lg:col-span-2">
                    <span class="text-sm font-medium text-neutral-text-light dark:text-neutral-text-dark">Arama</span>
                    <div class="relative">
                        <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-light/50 dark:text-neutral-text-dark/50">search</span>
                        <input data-search="transactions" value="${escapeHTML(state.transactionSearch)}" placeholder="Açıklama ya da hesap numarası" class="h-11 w-full rounded-lg border border-neutral-light-bg/60 bg-neutral-light-bg/40 pl-10 pr-4 text-sm text-neutral-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-neutral-dark-bg dark:bg-neutral-dark-bg dark:text-neutral-text-dark" />
                    </div>
                </label>
            </div>
            ${loadingTransactions
                ? `<div class="flex items-center justify-center rounded-xl border border-dashed border-neutral-light-bg/60 px-4 py-16 text-sm text-neutral-text-light/70 dark:border-neutral-dark-bg dark:text-neutral-text-dark/70">İşlemler yükleniyor...</div>`
                : filtered.length === 0
                    ? `<div class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-neutral-light-bg/60 px-4 py-16 text-center text-sm text-neutral-text-light/70 dark:border-neutral-dark-bg dark:text-neutral-text-dark/70">
                            <span class="material-symbols-outlined text-4xl text-primary">search_off</span>
                            <p>Eşleşen işlem bulunamadı. Filtreleri değiştirerek tekrar deneyebilirsiniz.</p>
                       </div>`
                    : `<div class="overflow-x-auto rounded-xl border border-neutral-light-bg/60 bg-white shadow-sm dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/70">
                            <table class="min-w-full divide-y divide-neutral-light-bg/60 text-left text-sm text-neutral-text-light dark:divide-neutral-dark-bg dark:text-neutral-text-dark">
                                <thead class="bg-neutral-light-bg/50 text-xs font-medium uppercase tracking-wide text-neutral-text-light/70 dark:bg-neutral-dark-bg/70 dark:text-neutral-text-dark/60">
                                    <tr>
                                        <th scope="col" class="px-4 py-3">İşlem</th>
                                        <th scope="col" class="px-4 py-3">Tür</th>
                                        <th scope="col" class="px-4 py-3">Hesap</th>
                                        <th scope="col" class="px-4 py-3 text-right">Tutar</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-neutral-light-bg/30 dark:divide-neutral-dark-bg/50">
                                    ${tableRows}
                                </tbody>
                            </table>
                        </div>`}
        </section>
    `;
}
