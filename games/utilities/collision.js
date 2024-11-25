export function collides(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

export function isCollidingWithAny(a, b) {
    return b.some((el) => collides(a, el));
}
