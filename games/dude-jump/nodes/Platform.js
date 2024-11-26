const types = {
    NORMAL: 'NORMAL',
    MOVING: 'MOVING',
    FRAGILE: 'FRAGILE',
};

// const typeColors = {
//     NORMAL: 'black',
//     MOVING: 'red',
//     FRAGILE: 'blue',
// };

// get colors from css variables
const blueInk = getComputedStyle(document.documentElement).getPropertyValue('--c-ink');
const redInk = getComputedStyle(document.documentElement).getPropertyValue('--c-red-ink');

export default class Platform {

    constructor({ position, type = types.NORMAL, width = 100, height = 20 }) {
        this.position = position;
        this.type = type;
        this.width = width;
        this.height = height;
        this.velocity = { x: type === types.MOVING ? 1 : 0, y: 0 };
        this.isMoving = type === types.MOVING;

    }

    draw(ctx) {
        ctx.beginPath();
        ctx.roundRect(this.position.x, this.position.y, this.width, this.height, 3);
        ctx.strokeStyle = this.type === types.MOVING ? redInk : blueInk;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
    }

    update(ctx) {
        this.draw(ctx);

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if(this.isMoving) {
            if(this.left <= 0 || this.right >= ctx.canvas.width) {
                this.velocity.x *= -1;
            }
        }
    }

    get left() {
        return this.position.x;
    }

    get right() {
        return this.position.x + this.width;
    }

    get top() {
        return this.position.y;
    }

    get bottom() {
        return this.position.y + this.height;
    }
}
