const listeners = new Set();

const initialState = {
    status: 'loading',
    config: null,
    session: null,
    currentView: 'dashboard',
    authMode: 'login',
    authError: null,
    authLoading: false,
    globalError: null,
    viewLoading: false,
    viewError: null,
    accounts: [],
    cards: [],
    transactions: [],
    accountsLoaded: false,
    cardsLoaded: false,
    transactionsLoaded: false,
    lastSynced: {
        accounts: null,
        cards: null,
        transactions: null,
    },
    transactionFilter: 'ALL',
    transactionSearch: '',
    notifications: [],
    sequence: 0,
};

const state = clone(initialState);

export function getState() {
    return state;
}

export function setState(patch) {
    if (typeof patch === 'function') {
        patch(state);
    } else if (patch && typeof patch === 'object') {
        Object.assign(state, patch);
    }
    notify();
}

export function resetState() {
    Object.assign(state, clone(initialState));
    notify();
}

export function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function notify() {
    for (const listener of listeners) {
        listener(state);
    }
}

export function nextSequence() {
    state.sequence += 1;
    return state.sequence;
}

function clone(value) {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
}
