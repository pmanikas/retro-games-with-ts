const DEFAULT_STORAGE_TYPE = 'local';

const types = {
    local: 'localStorage',
    session: 'sessionStorage',
};

export function saveToLocalStorage(key, value, type = DEFAULT_STORAGE_TYPE) {
    types[type].setItem(key, JSON.stringify(value));
}

export function getFromLocalStorage(key, type = DEFAULT_STORAGE_TYPE) {
    return JSON.parse(types[type].getItem(key));
}

export function removeFromLocalStorage(key, type = DEFAULT_STORAGE_TYPE) {
    types[type].removeItem(key);
}

export function clearLocalStorage(type) {
    types[type].clear();
}
