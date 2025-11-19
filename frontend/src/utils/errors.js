const GENERIC_MESSAGE = 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';

const messageMap = [
    { test: /invalid credentials/i, message: 'E-posta veya parola hatalı.' },
    { test: /email and password are required/i, message: 'E-posta ve parola zorunludur.' },
    { test: /full name, email, and password are required/i, message: 'Ad soyad, e-posta ve parola gereklidir.' },
    { test: /account id is required/i, message: 'Bir hesap seçmeniz gerekiyor.' },
    { test: /amount must be non-zero/i, message: 'Tutar sıfırdan farklı olmalıdır.' },
    { test: /transaction type is required/i, message: 'İşlem türünü seçmeniz gerekiyor.' },
    { test: /refresh token missing/i, message: 'Oturum süresi dolmuş olabilir. Lütfen tekrar giriş yapın.' },
];

export function describeError(error) {
    if (!error) {
        return GENERIC_MESSAGE;
    }

    if (typeof error === 'string') {
        return translateMessage(error);
    }

    if (error.message) {
        return translateMessage(error.message);
    }

    if (error.error) {
        return translateMessage(error.error);
    }

    try {
        return translateMessage(JSON.stringify(error));
    } catch {
        return GENERIC_MESSAGE;
    }
}

function translateMessage(message) {
    if (!message) {
        return GENERIC_MESSAGE;
    }
    for (const candidate of messageMap) {
        if (candidate.test.test(message)) {
            return candidate.message;
        }
    }
    return message;
}
