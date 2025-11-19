export function renderLoadingView() {
    return `
        <div class="min-h-screen flex items-center justify-center bg-background-light text-neutral-text-light dark:bg-background-dark dark:text-neutral-text-dark">
            <div class="flex flex-col items-center gap-3">
                <span class="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                <p class="text-sm text-neutral-text-light/70 dark:text-neutral-text-dark/70">Uygulama hazırlanıyor...</p>
            </div>
        </div>
    `;
}
