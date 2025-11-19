import { escapeHTML } from '../utils/dom';
import { computeGreeting, extractNameParts, formatFromUnix } from '../utils/formatters';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'accounts', label: 'Accounts', icon: 'account_balance_wallet' },
    { id: 'transfer', label: 'Transfers', icon: 'swap_horiz' },
    { id: 'transactions', label: 'Transactions', icon: 'receipt_long' },
    { id: 'cards', label: 'Cards', icon: 'credit_card' },
];

const notificationStyles = {
    info: 'border border-primary/30 bg-primary/10 text-primary',
    success: 'border border-secondary/40 bg-secondary/10 text-secondary',
    warning: 'border border-amber-500/40 bg-amber-500/15 text-amber-600',
    error: 'border border-red-500/40 bg-red-500/15 text-red-500',
};

export function renderAppLayout(state, mainContent) {
    const { firstName, initials } = extractNameParts(state.session?.user?.full_name);
    const greeting = computeGreeting();

    return `
        <div class="flex min-h-screen bg-background-light text-neutral-text-light dark:bg-background-dark dark:text-neutral-text-dark">
            ${renderSidebar(state)}
            <div class="flex min-h-screen flex-1 flex-col">
                ${renderTopBar({ greeting, firstName, initials })}
                ${renderMainArea(state, mainContent)}
            </div>
            ${renderNotifications(state)}
        </div>
    `;
}

function renderSidebar(state) {
    return `
        <aside class="hidden lg:flex lg:w-64 lg:flex-col lg:justify-between border-r border-neutral-light-bg/40 dark:border-neutral-dark-bg/40 bg-background-light/90 dark:bg-background-dark/90 px-4 py-6">
            <div class="space-y-8">
                <div class="flex items-center gap-3 text-neutral-text-light dark:text-neutral-text-dark">
                    <span class="material-symbols-outlined text-3xl text-primary">account_balance</span>
                    <span class="text-xl font-bold">BankApp</span>
                </div>
                <nav class="space-y-2" data-role="sidebar-nav">
                    ${NAV_ITEMS.map((item) => {
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
            <div class="space-y-2 text-xs text-neutral-text-light/60 dark:text-neutral-text-dark/60">
                ${state.config?.api_base_url
                    ? `<p class="truncate"><span class="font-semibold text-neutral-text-light dark:text-neutral-text-dark">API:</span> ${escapeHTML(state.config.api_base_url)}</p>`
                    : ''}
                ${state.session?.expires_at
                    ? `<p class="truncate">Token Bitişi: ${formatFromUnix(state.session.expires_at)}</p>`
                    : ''}
                <button type="button" data-action="logout" class="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-light-bg/50 py-2 text-sm font-semibold text-neutral-text-light hover:bg-neutral-light-bg dark:border-neutral-dark-bg dark:text-neutral-text-dark dark:hover:bg-neutral-dark-bg">
                    <span class="material-symbols-outlined text-base">logout</span>
                    <span>Çıkış Yap</span>
                </button>
            </div>
        </aside>
    `;
}

function renderTopBar({ greeting, firstName, initials }) {
    return `
        <header class="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-light-bg/40 bg-background-light/95 px-6 py-4 backdrop-blur lg:px-10 dark:border-neutral-dark-bg/40 dark:bg-background-dark/95">
            <div class="flex flex-col">
                <span class="text-xs uppercase tracking-wide text-neutral-text-light/60 dark:text-neutral-text-dark/60">${escapeHTML(greeting)}</span>
                <h1 class="text-2xl font-bold text-neutral-text-light dark:text-neutral-text-dark">${escapeHTML(firstName)}, hoş geldin</h1>
            </div>
            <div class="flex flex-1 items-center justify-end gap-3">
                <label class="relative hidden sm:flex">
                    <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-light/50 dark:text-neutral-text-dark/50">search</span>
                    <input type="search" placeholder="Ara" class="h-10 w-64 rounded-lg border border-neutral-light-bg/50 bg-neutral-light-bg/40 pl-10 pr-4 text-sm text-neutral-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-neutral-dark-bg dark:bg-neutral-dark-bg dark:text-neutral-text-dark" />
                </label>
                <button type="button" data-action="refresh-session" class="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-light-bg/60 bg-neutral-light-bg/40 text-neutral-text-light transition hover:text-primary dark:border-neutral-dark-bg dark:bg-neutral-dark-bg dark:text-neutral-text-dark">
                    <span class="material-symbols-outlined">refresh</span>
                </button>
                <button type="button" class="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-light-bg/60 bg-neutral-light-bg/40 text-neutral-text-light hover:text-primary dark:border-neutral-dark-bg dark:bg-neutral-dark-bg dark:text-neutral-text-dark">
                    <span class="material-symbols-outlined">notifications</span>
                </button>
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold">
                    ${escapeHTML(initials)}
                </div>
            </div>
        </header>
    `;
}

function renderMainArea(state, mainContent) {
    const alert = state.viewError
        ? `<div class="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-base">error</span>
                    <span>${escapeHTML(state.viewError)}</span>
                </div>
           </div>`
        : '';

    const overlay = state.viewLoading
        ? `<div class="pointer-events-none absolute inset-0 flex items-center justify-center bg-background-light/70 backdrop-blur-sm dark:bg-background-dark/80">
                <div class="flex items-center gap-2 rounded-lg bg-neutral-light-bg/80 px-4 py-2 text-sm text-neutral-text-light shadow-sm dark:bg-neutral-dark-bg/80 dark:text-neutral-text-dark">
                    <span class="material-symbols-outlined animate-spin text-base text-primary">progress_activity</span>
                    <span>Veriler güncelleniyor...</span>
                </div>
           </div>`
        : '';

    return `
        <main class="relative flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
            ${alert}
            <div class="relative">
                ${mainContent}
                ${overlay}
            </div>
        </main>
    `;
}

function renderNotifications(state) {
    if (!state.notifications.length) {
        return '';
    }
    return `
        <div class="pointer-events-none fixed inset-x-0 top-4 flex flex-col items-center gap-2 px-4">
            ${state.notifications.map((toast) => {
                const style = notificationStyles[toast.type] || notificationStyles.info;
                return `
                    <div class="pointer-events-auto flex max-w-md items-start gap-3 rounded-xl px-4 py-3 shadow-lg backdrop-blur ${style}" data-toast-id="${toast.id}">
                        <span class="material-symbols-outlined text-base">${iconForToast(toast.type)}</span>
                        <div class="flex-1 text-sm">${escapeHTML(toast.message)}</div>
                        <button type="button" data-toast-dismiss="${toast.id}" class="text-xs uppercase tracking-wide">Kapat</button>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function iconForToast(type) {
    switch (type) {
        case 'success':
            return 'check_circle';
        case 'warning':
            return 'warning';
        case 'error':
            return 'error';
        default:
            return 'info';
    }
}
