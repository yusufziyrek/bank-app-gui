import { AppInfo, GetProfile } from '../../wailsjs/go/main/App';

const initialState = {
    config: null,
    session: null,
    currentView: 'loading',
    authMode: 'login',
    authError: null,
    authLoading: false,
    globalError: null,
    accounts: [],
    cards: [],
    transactions: [],
    accountsLoaded: false,
    cardsLoaded: false,
    transactionsLoaded: false,
    viewLoading: false,
    viewError: null,
    transactionFilter: 'ALL',
    transactionSearch: '',
};

class Store {
    constructor() {
        this.state = { ...initialState };
        this.listeners = new Set();
    }

    getState() {
        return this.state;
    }

    setState(patch) {
        this.state = { ...this.state, ...patch };
        this.notify();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    async init() {
        try {
            const [config, session] = await Promise.all([
                // AppInfo returns both config and session, but we might need to adjust how we call it
                // based on the original code: a.AppInfo() returns (AppConfig, *SessionView)
                // Wails handles multiple return values by returning an array in JS? 
                // Or maybe we just call AppInfo and it returns an object?
                // Let's check the original code usage.
                // Original: const { config, session } = await AppInfo(); -> No, wait.
                // Original code didn't explicitly call AppInfo in main.js startup?
                // Ah, let's check main.js again.
            ]);

            // Actually, let's just implement the basic store structure first.
            // The actions will be separate or part of the store.
        } catch (error) {
            console.error("Store init error:", error);
        }
    }
}

export const store = new Store();
