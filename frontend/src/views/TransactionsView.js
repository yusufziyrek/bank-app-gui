import { store } from '../store/store';
import { escapeHTML, formatCurrency, formatDate, normaliseType, transactionIcon, transactionBadge } from '../lib/utils';

export function renderTransactionsView() {
    const state = store.getState();
    const accountMap = new Map(state.accounts.map((account) => [account.id, account]));

    // Filtering logic moved inside render for now, matching original behavior
    const filtered = state.transactions.filter((tx) => {
        const typeMatches = state.transactionFilter === 'ALL' || normaliseType(tx.type) === state.transactionFilter;
        const query = state.transactionSearch.trim().toLowerCase();
        const description = (tx.description || '').toLowerCase();
        const accountNumber = (accountMap.get(tx.account_id)?.account_number || '').toLowerCase();
        const matchesSearch = query === '' || description.includes(query) || accountNumber.includes(query);
        return typeMatches && matchesSearch;
    });

    const loadingTransactions = !state.transactionsLoaded && state.viewLoading;

    return `
        <section class="space-y-6 px-4 py-8 sm:px-6 lg:px-16">
            <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 class="text-3xl font-black text-neutral-text-light dark:text-neutral-text-dark">İşlem Geçmişi</h2>
                    <p class="text-sm text-neutral-text-light/60 dark:text-neutral-text-dark/60">Geçmiş işlemlerinizi filtreleyin ve arama yapın.</p>
                </div>
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
                                <thead class="bg-neutral-light-bg/50 text-xs font-semibold uppercase tracking-wide text-neutral-text-light/70 dark:bg-neutral-dark-bg dark:text-neutral-text-dark/70">
                                    <tr>
                                        <th class="px-4 py-3">Tarih</th>
                                        <th class="px-4 py-3">Hesap</th>
                                        <th class="px-4 py-3">Açıklama</th>
                                        <th class="px-4 py-3">Tür</th>
                                        <th class="px-4 py-3 text-right">Tutar</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-neutral-light-bg/60 dark:divide-neutral-dark-bg">
                                    ${filtered.map((tx) => {
                    const amount = Number(tx.amount) || 0;
                    const sign = amount < 0 ? '-' : '+';
                    const color = amount < 0 ? 'text-accent' : 'text-secondary';
                    const account = accountMap.get(tx.account_id);
                    return `
                                            <tr class="hover:bg-neutral-light-bg/30 dark:hover:bg-neutral-dark-bg/30">
                                                <td class="whitespace-nowrap px-4 py-3 text-neutral-text-light/80 dark:text-neutral-text-dark/80">${formatDate(tx.created_at)}</td>
                                                <td class="whitespace-nowrap px-4 py-3 font-medium">${escapeHTML(account?.account_number || tx.account_id)}</td>
                                                <td class="px-4 py-3">${escapeHTML(tx.description || '-')}</td>
                                                <td class="whitespace-nowrap px-4 py-3">
                                                    <span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${transactionBadge(tx.type)}">
                                                        <span class="material-symbols-outlined text-[14px]">${transactionIcon(tx.type)}</span>
                                                        ${normaliseType(tx.type)}
                                                    </span>
                                                </td>
                                                <td class="whitespace-nowrap px-4 py-3 text-right font-semibold ${color}">${sign} ${formatCurrency(Math.abs(amount))}</td>
                                            </tr>
                                        `;
                }).join('')}
                                </tbody>
                            </table>
                       </div>`}
        </section>
    `;
}
