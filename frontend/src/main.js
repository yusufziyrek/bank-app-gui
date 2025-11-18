import './style.css';
import './app.css';

import { AppInfo, RefreshSession, Logout } from '../wailsjs/go/main/App';

const appRoot = document.querySelector('#app');

const state = {
    config: null,
    session: null,
    status: 'Yükleniyor...',
    error: null,
    fetching: false,
};

function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatTimestamp(unixSeconds) {
    if (!unixSeconds || Number.isNaN(unixSeconds)) {
        return 'n/a';
    }
    const date = new Date(unixSeconds * 1000);
    if (Number.isNaN(date.getTime())) {
        return 'n/a';
    }
    return date.toLocaleString();
}

function setState(patch) {
    Object.assign(state, patch);
    render();
}

function bindActions() {
    const refreshButton = document.querySelector('[data-action="refresh"]');
    if (refreshButton) {
        refreshButton.addEventListener('click', handleRefresh);
    }

    const logoutButton = document.querySelector('[data-action="logout"]');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
}

function render() {
    const { config, session, status, error, fetching } = state;

    appRoot.innerHTML = `
        <div class="app-shell">
            <div class="panel">
                <h1>BankApp Masaüstü</h1>
                <p>Backend işlevleri hazır. Bir sonraki adımda bankacılık arayüzünü tasarlayacağız.</p>

                <section class="info-section">
                    <h2>Durum</h2>
                    <p class="status ${error ? 'status--error' : ''}">
                        ${escapeHTML(error ?? status)}
                    </p>
                </section>

                <section class="info-section">
                    <h2>API Yapılandırması</h2>
                    <dl class="info-list">
                        <div>
                            <dt>Temel URL</dt>
                            <dd>${config ? escapeHTML(config.api_base_url) : 'n/a'}</dd>
                        </div>
                    </dl>
                </section>

                <section class="info-section">
                    <h2>Oturum</h2>
                    ${session
                        ? `
                            <dl class="info-list">
                                <div>
                                    <dt>Kullanıcı</dt>
                                    <dd>${escapeHTML(session.user?.full_name ?? 'Bilinmiyor')}</dd>
                                </div>
                                <div>
                                    <dt>E-posta</dt>
                                    <dd>${escapeHTML(session.user?.email ?? 'n/a')}</dd>
                                </div>
                                <div>
                                    <dt>Rol</dt>
                                    <dd>${escapeHTML(session.user?.role ?? 'n/a')}</dd>
                                </div>
                                <div>
                                    <dt>Token Bitişi</dt>
                                    <dd>${escapeHTML(formatTimestamp(session.expires_at))}</dd>
                                </div>
                            </dl>
                            <div class="actions">
                                <button class="action-button" data-action="refresh" ${fetching ? 'disabled' : ''}>Token Yenile</button>
                                <button class="action-button action-button--secondary" data-action="logout" ${fetching ? 'disabled' : ''}>Çıkış Yap</button>
                            </div>
                        `
                        : `
                            <p>Henüz bir oturum bulunmuyor. Giriş ekranı tasarımı tamamlandığında burada görünecek.</p>
                        `
                    }
                </section>
            </div>
        </div>
    `;

    bindActions();
}

async function handleRefresh(event) {
    event?.preventDefault();
    if (state.fetching) {
        return;
    }

    setState({
        fetching: true,
        error: null,
        status: 'Oturum yenileniyor...',
    });

    try {
        const session = await RefreshSession();
        setState({
            session,
            fetching: false,
            status: 'Token başarıyla yenilendi.',
        });
    } catch (error) {
        console.error('RefreshSession error', error);
        setState({
            fetching: false,
            error: 'Token yenileme başarısız oldu.',
        });
    }
}

async function handleLogout(event) {
    event?.preventDefault();
    if (state.fetching) {
        return;
    }

    setState({
        fetching: true,
        error: null,
        status: 'Oturum kapatılıyor...',
    });

    try {
        await Logout();
        setState({
            session: null,
            fetching: false,
            status: 'Oturum kapatıldı.',
        });
    } catch (error) {
        console.error('Logout error', error);
        setState({
            fetching: false,
            error: 'Oturum kapatılamadı.',
        });
    }
}

async function loadInitialData() {
    setState({
        fetching: true,
        status: 'Konfigürasyon yükleniyor...',
        error: null,
    });

    try {
        const [config, session] = await AppInfo();
        setState({
            config,
            session,
            fetching: false,
            status: session ? 'Aktif oturum bulundu.' : 'Oturum bulunamadı.',
        });
    } catch (error) {
        console.error('AppInfo error', error);
        setState({
            fetching: false,
            error: 'Konfigürasyon alınamadı.',
        });
    }
}

render();
loadInitialData();
