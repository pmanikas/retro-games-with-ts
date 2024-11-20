export default class Fruit {
  constructor(scale, ctx, canvas) {
    this.x;
    this.y;
    this.scale = scale;
    this.ctx = ctx;
    this.rows = canvas.height / scale;
    this.cols = canvas.width / scale;
  }

  pickLocation() {
    this.x = (Math.floor(Math.random() * this.rows - 1) + 1) * this.scale;
    this.y = (Math.floor(Math.random() * this.cols - 1) + 1) * this.scale;
  }

  draw() {
    this.ctx.fillStyle = "#212519";
    this.ctx.beginPath();
    this.ctx.arc(this.x + this.scale/2, this.y + this.scale/2, this.scale/2, 0, 2 * Math.PI);
    this.ctx.fill();
  }
}
