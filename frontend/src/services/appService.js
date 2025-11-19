import {
    AppInfo,
    Login,
    Register,
    RefreshSession,
    Logout,
    ListAccounts,
    CreateAccount,
    ListCards,
    CreateCard,
    UpdateCardStatus,
    ListTransactions,
    CreateTransaction,
} from '../wailsjs/go/main/App';

export const appService = {
    appInfo: () => AppInfo(),
    login: (email, password) => Login(email, password),
    register: (fullName, email, password) => Register(fullName, email, password),
    refreshSession: () => RefreshSession(),
    logout: () => Logout(),
    listAccounts: () => ListAccounts(),
    createAccount: (initialDeposit) => CreateAccount(initialDeposit),
    listCards: () => ListCards(),
    createCard: (accountId, cardNumber, cvv, expiry) => CreateCard(accountId, cardNumber, cvv, expiry),
    updateCardStatus: (cardId, isActive) => UpdateCardStatus(cardId, isActive),
    listTransactions: () => ListTransactions(),
    createTransaction: (payload) => CreateTransaction(payload),
};
