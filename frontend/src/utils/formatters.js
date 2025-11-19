const defaultCurrency = 'TRY';
const cachedFormatters = new Map();

function getCurrencyFormatter(currency = defaultCurrency) {
    const key = currency.toUpperCase();
    if (!cachedFormatters.has(key)) {
        cachedFormatters.set(
            key,
            new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: key,
                maximumFractionDigits: 2,
            }),
        );
    }
    return cachedFormatters.get(key);
}

export function formatCurrency(value, currency = defaultCurrency) {
    const formatter = getCurrencyFormatter(currency);
    const amount = Number(value) || 0;
    return formatter.format(amount);
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

export function extractNameParts(fullName) {
    const name = (fullName || '').trim();
    if (!name) {
        return { fullName: 'Kullanıcı', firstName: 'Kullanıcı', initials: 'K' };
    }
    const parts = name.split(/\s+/);
    const firstName = parts[0] || name;
    const lastPart = parts.length > 1 ? parts[parts.length - 1] : '';
    const initials = `${firstName.charAt(0)}${lastPart.charAt(0)}`.toUpperCase();
    return {
        fullName: name,
        firstName,
        initials: initials.trim() || firstName.charAt(0).toUpperCase(),
    };
}
