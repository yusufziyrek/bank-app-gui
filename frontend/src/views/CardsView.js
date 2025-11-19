import { store } from '../store/store';
import { escapeHTML, formatCurrency, formatDate } from '../lib/utils';

export function renderCardsView() {
    const state = store.getState();
    const accountMap = new Map(state.accounts.map((account) => [account.id, account]));
    const hasCards = state.cards.length > 0;
    const loadingCards = !state.cardsLoaded && state.viewLoading;

    return `
        <section class="space-y-6 px-4 py-8 sm:px-6 lg:px-16">
            <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 class="text-3xl font-black text-neutral-text-light dark:text-neutral-text-dark">Kart Yönetimi</h2>
                    <p class="text-sm text-neutral-text-light/60 dark:text-neutral-text-dark/60">Kartlarınızı aktif/pasif edin, yeni kartlar oluşturun.</p>
                </div>
            </div>
            <form data-form="create-card" class="grid gap-4 rounded-xl border border-neutral-light-bg/60 bg-white p-6 shadow-sm lg:grid-cols-5 dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/70">
                <div class="lg:col-span-2">
                    <label class="mb-2 block text-sm font-medium text-neutral-text-light dark:text-neutral-text-dark" for="cardAccount">Bağlanacak Hesap</label>
                    <select id="cardAccount" name="accountId" required class="h-12 w-full rounded-lg border border-neutral-light-bg/60 bg-neutral-light-bg/40 px-3 text-sm text-neutral-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-neutral-dark-bg dark:bg-neutral-dark-bg dark:text-neutral-text-dark">
                        <option value="">Hesap seçiniz</option>
                        ${state.accounts.map((account) => `
                            <option value="${escapeHTML(account.id)}">${escapeHTML(account.account_number)} - ${formatCurrency(account.balance)}</option>
                        `).join('')}
                    </select>
                </div>
                <label class="lg:col-span-1">
                    <span class="mb-2 block text-sm font-medium text-neutral-text-light dark:text-neutral-text-dark">Kart Numarası</span>
                    <input name="cardNumber" required minlength="12" maxlength="19" placeholder="XXXX XXXX XXXX" class="h-12 w-full rounded-lg border border-neutral-light-bg/60 bg-neutral-light-bg/40 px-3 text-sm text-neutral-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-neutral-dark-bg dark:bg-neutral-dark-bg dark:text-neutral-text-dark" />
                </label>
                <label>
                    <span class="mb-2 block text-sm font-medium text-neutral-text-light dark:text-neutral-text-dark">CVV</span>
                    <input name="cvv" required minlength="3" maxlength="4" placeholder="123" class="h-12 w-full rounded-lg border border-neutral-light-bg/60 bg-neutral-light-bg/40 px-3 text-sm text-neutral-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-neutral-dark-bg dark:bg-neutral-dark-bg dark:text-neutral-text-dark" />
                </label>
                <label>
                    <span class="mb-2 block text-sm font-medium text-neutral-text-light dark:text-neutral-text-dark">Son Kullanma</span>
                    <input name="expiry" required placeholder="AA/YY" class="h-12 w-full rounded-lg border border-neutral-light-bg/60 bg-neutral-light-bg/40 px-3 text-sm text-neutral-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-neutral-dark-bg dark:bg-neutral-dark-bg dark:text-neutral-text-dark" />
                </label>
                <div class="lg:col-span-5 flex justify-end">
                    <button type="submit" class="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        <span class="material-symbols-outlined text-lg">add_card</span>
                        <span>Yeni Kart Oluştur</span>
                    </button>
                </div>
            </form>
            ${loadingCards
            ? `<div class="flex items-center justify-center rounded-xl border border-dashed border-neutral-light-bg/60 px-4 py-16 text-sm text-neutral-text-light/70 dark:border-neutral-dark-bg dark:text-neutral-text-dark/70">Kartlar yükleniyor...</div>`
            : hasCards
                ? `<div class="space-y-4">
                            ${state.cards.map((card) => {
                    const owningAccount = accountMap.get(card.account_id);
                    return `
                                    <div class="rounded-xl border border-neutral-light-bg/60 bg-white p-6 shadow-sm dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/70">
                                        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div class="flex items-start gap-4">
                                                <div class="flex h-12 w-12 items-center justify-center rounded-md border border-neutral-light-bg/60 bg-neutral-light-bg/40 text-primary dark:border-neutral-dark-bg dark:bg-neutral-dark-bg">
                                                    <span class="material-symbols-outlined">credit_card</span>
                                                </div>
                                                <div>
                                                    <p class="text-base font-semibold text-neutral-text-light dark:text-neutral-text-dark">${escapeHTML(card.masked_pan || card.card_number)}</p>
                                                    <p class="text-sm text-neutral-text-light/60 dark:text-neutral-text-dark/60">Hesap: ${escapeHTML(owningAccount?.account_number || card.account_id)}</p>
                                                    <p class="text-xs text-neutral-text-light/50 dark:text-neutral-text-dark/50">Oluşturma: ${formatDate(card.created_at)}</p>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-4">
                                                <span class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${card.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}">
                                                    <span class="material-symbols-outlined text-sm">${card.is_active ? 'check_circle' : 'pause_circle'}</span>
                                                    ${card.is_active ? 'Aktif' : 'Pasif'}
                                                </span>
                                                <label class="relative inline-flex h-7 w-14 items-center">
                                                    <input type="checkbox" ${card.is_active ? 'checked' : ''} data-card-toggle data-card-id="${escapeHTML(card.id)}" class="sr-only peer" />
                                                    <div class="h-full w-full rounded-full bg-neutral-light-bg transition peer-checked:bg-primary/70 dark:bg-neutral-dark-bg"></div>
                                                    <span class="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-7"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                `;
                }).join('')}
                       </div>`
                : `<div class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-neutral-light-bg/60 px-4 py-16 text-center text-sm text-neutral-text-light/70 dark:border-neutral-dark-bg dark:text-neutral-text-dark/70">
                            <span class="material-symbols-outlined text-4xl text-primary">credit_card_off</span>
                            <p>Tanımlı kartınız bulunmuyor. Yukarıdaki formu kullanarak hızlıca yeni bir kart oluşturabilirsiniz.</p>
                       </div>`}
        </section>
    `;
}
