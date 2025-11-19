export const currencyFormatter = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
});

export function describeError(error) {
    if (!error) {
        return 'Beklenmeyen bir hata oluştu.';
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error.message) {
        return error.message;
    }
    if (error.error) {
        return error.error;
    }
    try {
        return JSON.stringify(error);
    } catch {
        return String(error);
    }
}

export function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function formatCurrency(value) {
    const amount = Number(value) || 0;
    return currencyFormatter.format(amount);
}

export function formatDate(value) {
    if (!value) {
        return 'n/a';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleDateString('tr-TR');
}

export function formatDateTime(value) {
    if (!value) {
        return 'n/a';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleString('tr-TR', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export function formatFromUnix(seconds) {
    if (!seconds) {
        return 'n/a';
    }
    return new Date(seconds * 1000).toLocaleString('tr-TR', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export function computeGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
        return 'Günaydın';
    }
    if (hour < 18) {
        return 'İyi öğleden sonra';
    }
    return 'İyi akşamlar';
}

export function getUserNames(user) {
    const fullName = user?.full_name?.trim();
    if (!fullName) {
        return { fullName: 'Kullanıcı', firstName: 'Kullanıcı' };
    }
    const [firstName] = fullName.split(/\s+/);
    return { fullName, firstName: firstName || fullName };
}

export function getUserInitials(user) {
    const name = user?.full_name?.trim();
    if (!name) {
        return 'K';
    }
    const parts = name.split(/\s+/);
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export function normaliseType(type) {
    return (type || '').toUpperCase();
}

export function computeAccountTotals(accounts) {
    const totalBalance = accounts.reduce((sum, account) => sum + (Number(account.balance) || 0), 0);
    return { totalBalance };
}

export function computeTransactionRollups(transactions) {
    let income = 0;
    let expenses = 0;
    for (const tx of transactions) {
        const amount = Number(tx.amount) || 0;
        const type = normaliseType(tx.type);
        if (type === 'DEPOSIT' || (type === 'TRANSFER' && amount > 0)) {
            income += Math.abs(amount);
        } else if (amount < 0 || type === 'WITHDRAWAL') {
            expenses += Math.abs(amount);
        }
    }
    return { income, expenses };
}

export function transactionIcon(type) {
    switch (normaliseType(type)) {
        case 'DEPOSIT':
            return 'savings';
        case 'WITHDRAWAL':
            return 'payments';
        case 'TRANSFER':
            return 'swap_horiz';
        default:
            return 'receipt_long';
    }
}

export function transactionBadge(type) {
    switch (normaliseType(type)) {
        case 'DEPOSIT':
            return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
        case 'WITHDRAWAL':
            return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
        case 'TRANSFER':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
        default:
            return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
    }
}
