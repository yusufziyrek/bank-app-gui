import { escapeHTML } from '../utils/dom';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

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

export function normaliseType(type) {
    return (type || '').toUpperCase();
}

export { escapeHTML, formatCurrency, formatDate, formatDateTime };
