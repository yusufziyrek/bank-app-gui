import { store } from '../store/store';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'accounts', label: 'Accounts', icon: 'account_balance_wallet' },
    { id: 'transfer', label: 'Transfers', icon: 'swap_horiz' },
    { id: 'transactions', label: 'Transactions', icon: 'receipt_long' },
    { id: 'cards', label: 'Cards', icon: 'credit_card' },
];

export function renderSidebar() {
    const state = store.getState();
    return `
        <aside class="hidden lg:flex lg:w-64 lg:flex-col lg:justify-between border-r border-neutral-light-bg/40 dark:border-neutral-dark-bg/40 bg-background-light/90 dark:bg-background-dark/90 px-4 py-6">
            <div class="space-y-8">
                <div class="flex items-center gap-3 text-neutral-text-light dark:text-neutral-text-dark">
                    <span class="material-symbols-outlined text-3xl text-primary">account_balance</span>
                    <span class="text-xl font-bold">BankApp</span>
                </div>
                <nav class="space-y-2">
                    ${navItems.map((item) => {
        const active = state.currentView === item.id;
        const base = 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors';
        const activeClasses = 'bg-primary/15 text-primary shadow-sm';
        const idleClasses = 'text-neutral-text-light/70 hover:bg-primary/10 dark:text-neutral-text-dark/70';
        return `
                            <button type="button" data-nav="${item.id}" class="${base} ${active ? activeClasses : idleClasses}">
                                <span class="material-symbols-outlined">${item.icon}</span>
                                <span>${item.label}</span>
                            </button>
                        `;
    }).join('')}
                </nav>
            </div>
            <div class="space-y-2">
                <button type="button" data-action="logout" class="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-light-bg/50 py-2 text-sm font-semibold text-neutral-text-light hover:bg-neutral-light-bg dark:border-neutral-dark-bg dark:text-neutral-text-dark dark:hover:bg-neutral-dark-bg">
                    <span class="material-symbols-outlined text-base">logout</span>
                    <span>Çıkış Yap</span>
                </button>
            </div>
        </aside>
    `;
}
