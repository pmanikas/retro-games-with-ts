export default class Snake {
  constructor(canvas, ctx, scale) {
    this.x = 0;
    this.y = canvas.height / 2 - scale;
    this.xSpeed = scale * 1;
    this.ySpeed = 0;
    this.ctx = ctx;
    this.canvas = canvas;
    this.scale = scale;
    this.total = 3;
    this.tail = [];
    this.moved = true;
  }

  get xEnd() {
    return this.x + this.scale;
  }
  get yEnd() {
    return this.y + this.scale;
  }

  initiate() {
    for (let i = 0; i < this.total; i++) {
      this.tail[i] = { x: null, y: null };
    }
  }

  draw(x = this.x, y = this.y, w = this.scale, h = this.scale) {
    this.ctx.fillStyle = "#212519";
    this.ctx.strokeStyle = "#7b9348";

    for (let i = 0; i < this.tail.length; i++) {
      this.ctx.fillRect(this.tail[i].x, this.tail[i].y, w, h);
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(this.tail[i].x, this.tail[i].y, w, h);
    }

    this.ctx.fillRect(x, y, w, h);
    this.ctx.strokeRect(x, y, w, h);
  }

  update() {
    for (let i = 0; i < this.tail.length - 1; i++) {
      this.tail[i] = this.tail[i + 1];
    }

    this.tail[this.total - 1] = { x: this.x, y: this.y };

    this.x += this.xSpeed;
    this.y += this.ySpeed;

    if (this.xEnd > canvas.width) {
      this.x = 0;
    }
    if (this.x < 0) {
      this.x = canvas.width - this.scale;
    }
    if (this.yEnd > canvas.height) {
      this.y = 0;
    }
    if (this.y < 0) {
      this.y = canvas.height - this.scale;
    }
    this.moved = true;
  }

  changeDirection(dir) {
    
    if(this.moved) {
      switch (dir) {
        case "Up":
          if (this.ySpeed !== this.scale) {
            this.xSpeed = 0;
            this.ySpeed = -this.scale;
          }
          break;
        case "Down":
          if (this.ySpeed !== -this.scale) {
            this.xSpeed = 0;
            this.ySpeed = this.scale;
          }
          break;
        case "Left":
          if (this.xSpeed !== this.scale) {
            this.xSpeed = -this.scale;
            this.ySpeed = 0;
          }
          break;
        case "Right":
          if (this.xSpeed !== -this.scale) {
            this.xSpeed = this.scale;
            this.ySpeed = 0;
          }
          break;
      } 
    }
    this.moved = false;
  }

  grow() {
    this.total++;
  }

  collide() {
    for (let i = 0; i < this.tail.length; i++) {
      if (this.x === this.tail[i].x && this.y === this.tail[i].y) {
        this.total = 3;
        this.tail = [];
        this.initiate();
        return true;
      }
    }
  }
}
