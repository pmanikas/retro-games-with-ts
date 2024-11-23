export default class Grid {
    constructor({ items }) {
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.items = items || [];
    }
}
