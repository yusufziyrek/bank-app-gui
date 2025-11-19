import { store } from './store';
import { router } from '../router/router';
import {
    AppInfo,
    Login,
    Register,
    RefreshSession,
    Logout,
    ListAccounts,
    ListCards,
    ListTransactions,
    CreateAccount,
    CreateCard,
    UpdateCardStatus,
    CreateTransaction,
} from '../../wailsjs/go/main/App';
import { describeError } from '../lib/utils';

export const actions = {
    async initApp() {
        try {
            // Try to refresh the session on startup
            await actions.refreshSession();

            // After refresh attempt, check if we have a session
            // If not, we must go to login screen
            const state = store.getState();
            if (!state.session) {
                store.setState({ currentView: 'login', authMode: 'login' });
            }
        } catch (err) {
            console.log("Init failed:", err);
            store.setState({ currentView: 'login', authMode: 'login' });
        }
    },

    async login(email, password) {
        store.setState({ authLoading: true, authError: null });
        try {
            const session = await Login(email, password);
            store.setState({ session, authMode: 'login', authLoading: false });
            await actions.loadUserData();
            router.navigate('dashboard');
        } catch (err) {
            store.setState({ authError: describeError(err), authLoading: false });
        }
    },

    async register(fullName, email, password) {
        store.setState({ authLoading: true, authError: null });
        try {
            const session = await Register(fullName, email, password);
            store.setState({ session, authMode: 'login', authLoading: false });
            await actions.loadUserData();
            router.navigate('dashboard');
        } catch (err) {
            store.setState({ authError: describeError(err), authLoading: false });
        }
    },

    async logout() {
        try {
            await Logout();
            store.setState({ session: null, currentView: 'login', authMode: 'login' });
        } catch (err) {
            console.error("Logout error:", err);
        }
    },

    async refreshSession() {
        try {
            const session = await RefreshSession();
            store.setState({ session });
            await actions.loadUserData();
            if (store.getState().currentView === 'loading' || !store.getState().session) {
                router.navigate('dashboard');
            }
        } catch (err) {
            // If refresh fails, we are probably not logged in
            store.setState({ session: null });
        }
    },

    async loadUserData() {
        store.setState({ viewLoading: true, viewError: null });
        try {
            const [accounts, cards, transactions] = await Promise.all([
                ListAccounts(),
                ListCards(),
                ListTransactions()
            ]);
            store.setState({
                accounts: accounts || [],
                cards: cards || [],
                transactions: transactions || [],
                accountsLoaded: true,
                cardsLoaded: true,
                transactionsLoaded: true,
                viewLoading: false
            });
        } catch (err) {
            console.error("Failed to load user data:", err);
            store.setState({ viewError: "Veriler yüklenirken hata oluştu.", viewLoading: false });
        }
    },

    async createAccount(initialDeposit) {
        store.setState({ viewLoading: true, viewError: null });
        try {
            await CreateAccount(Number(initialDeposit));
            await actions.loadUserData(); // Reload all data to be safe
        } catch (err) {
            store.setState({ viewError: describeError(err), viewLoading: false });
        }
    },

    async createCard(accountId, cardNumber, cvv, expiry) {
        store.setState({ viewLoading: true, viewError: null });
        try {
            await CreateCard(accountId, cardNumber, cvv, expiry);
            await actions.loadUserData();
        } catch (err) {
            store.setState({ viewError: describeError(err), viewLoading: false });
        }
    },

    async updateCardStatus(cardId, isActive) {
        // Optimistic update could be done here, but let's stick to simple reload for now
        try {
            await UpdateCardStatus(cardId, isActive);
            await actions.loadUserData();
        } catch (err) {
            store.setState({ viewError: describeError(err) });
        }
    },

    async createTransaction(accountId, toAccountId, amount, type, description) {
        store.setState({ viewLoading: true, viewError: null });
        try {
            await CreateTransaction({
                account_id: accountId,
                to_account_id: toAccountId || undefined,
                amount: Number(amount),
                type: type,
                description: description
            });
            await actions.loadUserData();
            router.navigate('dashboard'); // Go back to dashboard or transactions
        } catch (err) {
            store.setState({ viewError: describeError(err), viewLoading: false });
        }
    },

    setAuthMode(mode) {
        store.setState({ authMode: mode, authError: null });
    },

    setTransactionFilter(filter) {
        store.setState({ transactionFilter: filter });
    },

    setTransactionSearch(query) {
        store.setState({ transactionSearch: query });
    }
};
