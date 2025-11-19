import './style.css';
import './app.css';

import { store } from './store/store';
import { router } from './router/router';
import { actions } from './store/actions';

import { renderLoadingView } from './views/LoadingView';
import { renderAuthView } from './views/AuthView';
import { renderDashboardView } from './views/DashboardView';
import { renderAccountsView } from './views/AccountsView';
import { renderCardsView } from './views/CardsView';
import { renderTransactionsView } from './views/TransactionsView';
import { renderTransferView } from './views/TransferView';
import { renderSidebar } from './components/Sidebar';
import { renderTopBar } from './components/TopBar';

// Initialize Theme
// Default to light mode to match web design preference
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

const appRoot = document.querySelector('#app');

// Register Routes
router.addRoute('dashboard', renderDashboardView);
router.addRoute('accounts', renderAccountsView);
router.addRoute('cards', renderCardsView);
router.addRoute('transactions', renderTransactionsView);
router.addRoute('transfer', renderTransferView);

// Main Render Function
function render() {
    const state = store.getState();

    if (state.currentView === 'loading') {
        appRoot.innerHTML = renderLoadingView();
        return;
    }

    if (!state.session) {
        appRoot.innerHTML = renderAuthView();
        return;
    }

    appRoot.innerHTML = `
        <div class="flex min-h-screen bg-background-light text-neutral-text-light dark:bg-background-dark dark:text-neutral-text-dark">
            ${renderSidebar()}
            <div class="flex min-h-screen flex-1 flex-col">
                ${renderTopBar()}
                <main class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
                    ${state.viewError
            ? `<div class="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-base">error</span>
                                    <span>${state.viewError}</span>
                                </div>
                           </div>`
            : ''}
                    <div class="relative">
                        ${router.render(state.currentView)}
                        ${state.viewLoading
            ? `<div class="pointer-events-none absolute inset-0 flex items-center justify-center bg-background-light/70 backdrop-blur-sm dark:bg-background-dark/80">
                                    <div class="flex items-center gap-2 rounded-lg bg-neutral-light-bg/80 px-4 py-2 text-sm text-neutral-text-light shadow-sm dark:bg-neutral-dark-bg/80 dark:text-neutral-text-dark">
                                        <span class="material-symbols-outlined animate-spin text-base text-primary">progress_activity</span>
                                        <span>Veriler güncelleniyor...</span>
                                    </div>
                               </div>`
            : ''}
                    </div>
                </main>
            </div>
        </div>
    `;
}

// Event Delegation
appRoot.addEventListener('click', (e) => {
    const target = e.target;

    // Navigation
    const navBtn = target.closest('[data-nav]');
    if (navBtn) {
        const viewId = navBtn.dataset.nav;
        router.navigate(viewId);
        return;
    }

    // Auth Mode Switch
    const authModeBtn = target.closest('[data-auth-mode]');
    if (authModeBtn) {
        actions.setAuthMode(authModeBtn.dataset.authMode);
        return;
    }

    // Logout
    const logoutBtn = target.closest('[data-action="logout"]');
    if (logoutBtn) {
        actions.logout();
        return;
    }

    // Refresh Session
    const refreshBtn = target.closest('[data-action="refresh-session"]');
    if (refreshBtn) {
        actions.loadUserData();
        return;
    }

    // Card Toggle
    const cardToggle = target.closest('[data-card-toggle]');
    if (cardToggle) {
        const cardId = cardToggle.dataset.cardId;
        const isActive = cardToggle.checked;
        actions.updateCardStatus(cardId, isActive);
        return;
    }
});

appRoot.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const formType = form.dataset.form;

    if (formType === 'login') {
        actions.login(formData.get('email'), formData.get('password'));
    } else if (formType === 'register') {
        actions.register(formData.get('fullName'), formData.get('email'), formData.get('password'));
    } else if (formType === 'create-account') {
        actions.createAccount(formData.get('initialDeposit'));
        form.reset();
    } else if (formType === 'create-card') {
        actions.createCard(
            formData.get('accountId'),
            formData.get('cardNumber'),
            formData.get('cvv'),
            formData.get('expiry')
        );
        form.reset();
    } else if (formType === 'transfer') {
        actions.createTransaction(
            formData.get('fromAccount'),
            formData.get('toAccount'),
            formData.get('amount'),
            formData.get('transactionType'),
            formData.get('description')
        );
        form.reset();
    }
});

appRoot.addEventListener('input', (e) => {
    const target = e.target;

    // Transaction Search
    if (target.dataset.search === 'transactions') {
        actions.setTransactionSearch(target.value);
    }
});

appRoot.addEventListener('change', (e) => {
    const target = e.target;

    // Transaction Filter
    if (target.dataset.select === 'transaction-type') {
        actions.setTransactionFilter(target.value);
    }
});

appRoot.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action="toggle-theme"]');
    if (target) {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        }
    }
});

// Subscribe to store changes
store.subscribe(render);

// Initial Render
render();

// Initialize App
actions.initApp();
