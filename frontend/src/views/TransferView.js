import { store } from '../store/store';
import { escapeHTML, formatCurrency } from '../lib/utils';

export function renderTransferView() {
    const state = store.getState();
    const hasAccounts = state.accounts.length > 0;

    return `
        <section class="space-y-6 px-4 py-8 sm:px-6 lg:px-24">
            <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 class="text-3xl font-black text-neutral-text-light dark:text-neutral-text-dark">Para Transferi</h2>
                    <p class="text-sm text-neutral-text-light/60 dark:text-neutral-text-dark/60">Hesaplarınız arasında ya da başka bir alıcıya transfer gerçekleştirin.</p>
                </div>
            </div>
            ${hasAccounts
            ? `<form data-form="transfer" class="space-y-6 rounded-2xl border border-neutral-light-bg/60 bg-white p-6 shadow-sm dark:border-neutral-dark-bg dark:bg-neutral-dark-bg/70">
                        <div class="grid gap-4 md:grid-cols-2">
                            <label class="space-y-2">
                                <span class="block text-sm font-medium text-neutral-text-light dark:text-neutral-text-dark">Kaynak Hesap</span>
                                <select name="fromAccount" required class="h-12 w-full rounded-lg border border-neutral-light-bg/60 bg-neutral-light-bg/40 px-3 text-sm text-neutral-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-neutral-dark-bg dark:bg-neutral-dark-bg dark:text-neutral-text-dark">
                                    <option value="">Hesap seçiniz</option>
                                    ${state.accounts.map((account) => `
                                        <option value="${escapeHTML(account.id)}">${escapeHTML(account.account_number)} - ${formatCurrency(account.balance)}</option>
                                    `).join('')}
                                </select>
                            </label>
                            <label class="space-y-2">
                                <span class="block text-sm font-medium text-neutral-text-light dark:text-neutral-text-dark">İşlem Türü</span>
                                <select name="transactionType" required class="h-12 w-full rounded-lg border border-neutral-light-bg/60 bg-neutral-light-bg/40 px-3 text-sm text-neutral-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-neutral-dark-bg dark:bg-neutral-dark-bg dark:text-neutral-text-dark">
                                    <option value="TRANSFER">Transfer</option>
                                    <option value="DEPOSIT">Yatırma</option>
                                    <option value="WITHDRAWAL">Çekme</option>
                                </select>
                            </label>
                        </div>
                        <label class="block space-y-2">
                            <span class="text-sm font-medium text-neutral-text-light dark:text-neutral-text-dark">Hedef Hesap (Transfer için)</span>
                            <input name="toAccount" placeholder="Alıcı hesap ID ya da IBAN" class="h-12 w-full rounded-lg border border-neutral-light-bg/60 bg-neutral-light-bg/40 px-3 text-sm text-neutral-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-neutral-dark-bg dark:bg-neutral-dark-bg dark:text-neutral-text-dark" />
                        </label>
                        <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_2fr]">
                            <label class="space-y-2">
                                <span class="block text-sm font-medium text-neutral-text-light dark:text-neutral-text-dark">Tutar</span>
                                <div class="relative">
                                    <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-light/60 dark:text-neutral-text-dark/60">₺</span>
                                    <input name="amount" type="number" required min="0.01" step="0.01" placeholder="0,00" class="h-12 w-full rounded-lg border border-neutral-light-bg/60 bg-neutral-light-bg/40 pl-8 pr-4 text-sm text-neutral-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-neutral-dark-bg dark:bg-neutral-dark-bg dark:text-neutral-text-dark" />
                                </div>
                            </label>
                            <label class="space-y-2">
                                <span class="block text-sm font-medium text-neutral-text-light dark:text-neutral-text-dark">Açıklama (Opsiyonel)</span>
                                <input name="description" placeholder="örn. Kira ödemesi" class="h-12 w-full rounded-lg border border-neutral-light-bg/60 bg-neutral-light-bg/40 px-3 text-sm text-neutral-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-neutral-dark-bg dark:bg-neutral-dark-bg dark:text-neutral-text-dark" />
                            </label>
                        </div>
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            <p class="flex items-center gap-2 text-xs text-neutral-text-light/60 dark:text-neutral-text-dark/60">
                                <span class="material-symbols-outlined text-base">lock</span>
                                Tüm transferleriniz TLS ile şifrelenir.
                            </p>
                            <button type="submit" class="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                                <span>Transferi Onayla</span>
                                <span class="material-symbols-outlined text-base">arrow_forward</span>
                            </button>
                        </div>
                    </form>`
            : `<div class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-neutral-light-bg/60 px-4 py-16 text-center text-sm text-neutral-text-light/70 dark:border-neutral-dark-bg dark:text-neutral-text-dark/70">
                        <span class="material-symbols-outlined text-4xl text-primary">account_balance_wallet</span>
                        <p>Transfer yapabilmek için en az bir hesabınız olmalıdır. Önce hesap oluşturun.</p>
                        <button type="button" data-nav="accounts" class="text-sm font-semibold text-primary hover:underline">Hemen hesap aç</button>
                   </div>`}
        </section>
    `;
}
