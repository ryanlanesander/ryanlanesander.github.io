let ball;
let target;

function setup() {
  const canvas = createCanvas(300, 500);
  canvas.parent('golf-canvas');
  ball = new Ball(width / 2, height - 30);
  target = createVector(width / 2, 30);
}

function draw() {
  background(200);
  drawGolfHole();
  ball.update();
  ball.display();
}

function drawGolfHole() {
  fill(34, 139, 34); // Fairway
  rect(0, 100, width, height - 200);
  
  fill(60, 179, 113); // Green
  ellipse(width / 2, 50, 80, 50);
  
  fill(255, 255, 0); // Sand trap
  ellipse(width / 2 - 50, height / 2, 60, 40);
  
  fill(30, 144, 255); // Water
  ellipse(width / 2 + 50, height / 2 + 100, 80, 60);
}

function Ball(x, y) {
  this.pos = createVector(x, y);
  this.vel = createVector(0, 0);
  this.acc = createVector(0, 0);
  this.target = createVector(x, y);
  this.maxSpeed = 5;

  this.update = function() {
    this.acc = p5.Vector.sub(this.target, this.pos);
    this.acc.setMag(0.5);
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
  };

  this.display = function() {
    fill(255);
    ellipse(this.pos.x, this.pos.y, 20, 20);
  };

  this.moveTo = function(x, y) {
    this.target.set(x, y);
  };
}

function moveBallTo(score) {
  if (score >= 4) {
    ball.moveTo(width / 2, 50); // Green
  } else if (score >= 1) {
    ball.moveTo(width / 2, height / 2); // Fairway
  } else {
    ball.moveTo(width / 2 - 50, height / 2); // Sand trap
  }
}
