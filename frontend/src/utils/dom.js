const ENTITY_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '`': '&#096;',
};

export function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"'`]/g, (char) => ENTITY_MAP[char]);
}

export function on(target, eventName, handler, options) {
    target.addEventListener(eventName, handler, options);
    return () => target.removeEventListener(eventName, handler, options);
}
