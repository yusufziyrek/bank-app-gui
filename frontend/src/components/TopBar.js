import { store } from '../store/store';
import { computeGreeting, getUserNames, getUserInitials, escapeHTML } from '../lib/utils';

export function renderTopBar() {
    const state = store.getState();
    const { firstName } = getUserNames(state.session?.user);
    return `
        <header class="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-light-bg/40 bg-background-light/95 px-6 py-4 backdrop-blur lg:px-10 dark:border-neutral-dark-bg/40 dark:bg-background-dark/95">
            <div class="flex flex-col">
                <span class="text-xs uppercase tracking-wide text-neutral-text-light/60 dark:text-neutral-text-dark/60">${computeGreeting()}</span>
                <h1 class="text-2xl font-bold text-neutral-text-light dark:text-neutral-text-dark">${escapeHTML(firstName)}, hoş geldin</h1>
            </div>
            <div class="flex flex-1 items-center justify-end gap-3">
                <button data-action="toggle-theme" class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-text-light shadow-sm transition hover:bg-neutral-light-bg dark:bg-neutral-dark-bg dark:text-neutral-text-dark dark:hover:bg-neutral-dark-bg/80">
                    <span class="material-symbols-outlined text-xl">dark_mode</span>
                </button>
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
                    ${escapeHTML(getUserInitials(state.session?.user))}
                </div>
            </div>
        </header>
    `;
}
