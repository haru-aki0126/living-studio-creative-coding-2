let classifier;
let video;
let cameraReady = false;
let experienceStarted = false;
let currentTheme = "none";
let confidence = 0;
const modelURL = "https://teachablemachine.withgoogle.com/models/TJBciugcc/";
const particles = [];
const coconutPositions = [];
function preload() { classifier = ml5.imageClassifier(modelURL + "model.json"); }
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  initializeCoconuts();
  document.getElementById("startButton").addEventListener("click", startExperience);
}
function startExperience() {
  if (experienceStarted) return;
  experienceStarted = true;
  setStatus("正在请求摄像头权限……");
  video = createCapture(VIDEO, function () {
    cameraReady = true;
    document.getElementById("intro").classList.add("hidden");
    setStatus("摄像头已启动，正在识别……");
    classifyVideo();
  });
  video.size(320, 240);
  video.hide();
}
function classifyVideo() {
  if (!classifier || !video || !cameraReady) return;
  classifier.classify(video, gotResult);
}
function gotResult(error, results) {
  if (error) {
    console.error(error);
    setStatus("识别暂时中断，正在重试……");
    setTimeout(classifyVideo, 500);
    return;
  }
  if (!results || results.length === 0) {
    setTimeout(classifyVideo, 100);
    return;
  }
  const top = results[0];
  const label = String(top.label).toLowerCase();
  confidence = top.confidence;
  if (label === "class 1" || label.indexOf("summer") >= 0) currentTheme = "summer";
  else if (label === "class 2" || label.indexOf("coconut") >= 0) currentTheme = "coconut";
  else if (label === "class 3" || label.indexOf("read") >= 0) currentTheme = "reader";
  else currentTheme = "none";
  setStatus("识别：" + top.label + " · " + (confidence * 100).toFixed(0) + "% · " + themeName(currentTheme));
  classifyVideo();
}
function themeName(theme) {
  if (theme === "summer") return "火热夏日";
  if (theme === "coconut") return "蓝色椰林";
  if (theme === "reader") return "阅读空间";
  return "等待主题";
}
function setStatus(message) {
  const element = document.getElementById("status");
  if (element) element.textContent = message;
}
function initializeCoconuts() {
  coconutPositions.length = 0;
  for (let i = 0; i < 7; i++) {
    coconutPositions.push({x:random(width*.08,width*.92), y:random(height*.25,height*.72), size:random(42,92), sway:random(TWO_PI)});
  }
}
function draw() {
  drawBackground();
  if (!experienceStarted) drawAmbient();
  else if (currentTheme === "summer") drawSummer();
  else if (currentTheme === "coconut") drawCoconut();
  else if (currentTheme === "reader") drawReader();
  else drawAmbient();
  drawCameraPreview();
}
function drawBackground() {
  if (currentTheme === "summer") drawGradient(color(238,72,43),color(255,190,62));
  else if (currentTheme === "coconut") drawGradient(color(5,42,91),color(46,181,210));
  else if (currentTheme === "reader") drawGradient(color(72,50,36),color(226,201,151));
  else drawGradient(color(14,16,24),color(31,35,52));
}
function drawGradient(a,b) {
  for (let y=0;y<height;y+=2) { stroke(lerpColor(a,b,map(y,0,height,0,1))); line(0,y,width,y); }
}
function drawAmbient() {
  noStroke();
  for (let i=0;i<18;i++) {
    const x=noise(i*3,frameCount*.002)*width;
    const y=noise(i*6,frameCount*.002+10)*height;
    fill(255,255,255,10+i); ellipse(x,y,60+i*4,60+i*4);
  }
}
function drawSummer() {
  noStroke(); fill(255,233,130,210);
  ellipse(width*.52,height*.38,min(width,height)*.33,min(width,height)*.33);
  if (frameCount%3===0) particles.push({x:random(width),y:height+12,vx:random(-1.6,1.6),vy:random(-4.5,-2),life:255,size:random(6,20)});
  for (let i=particles.length-1;i>=0;i--) {
    const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.life-=3;
    fill(255,random(90,190),20,p.life); ellipse(p.x,p.y,p.size,p.size*1.8);
    if (p.life<=0) particles.splice(i,1);
  }
}
function drawCoconut() {
  noStroke(); fill(172,240,244,70);
  for (let x=-30;x<=width+30;x+=18) ellipse(x,height*.78+sin(x*.012+frameCount*.035)*24,62,62);
  for (let i=0;i<coconutPositions.length;i++) {
    const c=coconutPositions[i]; c.sway+=.018; const offset=sin(c.sway)*7;
    fill(42,126,84,190);
    ellipse(c.x+offset+c.size*.48,c.y-c.size*.28,c.size*.95,c.size*.28);
    ellipse(c.x+offset-c.size*.48,c.y-c.size*.28,c.size*.95,c.size*.28);
    fill(83,55,32); ellipse(c.x+offset,c.y,c.size,c.size);
    fill(149,95,48,180); ellipse(c.x+offset-c.size*.14,c.y-c.size*.14,c.size*.38,c.size*.38);
  }
}
function drawReader() {
  for (let i=0;i<6;i++) {
    const x=(frameCount*.45+i*230)%(width+260)-130;
    const y=height*.28+sin(frameCount*.018+i)*48;
    noStroke(); fill(255,249,228,190); rect(x,y,132,176,10);
    stroke(100,79,59,95);
    for (let l=0;l<6;l++) line(x+17,y+35+l*21,x+113,y+35+l*21);
  }
  noStroke(); fill(255,224,145,50); ellipse(width*.5,height*.64,560,560);
}
function drawCameraPreview() {
  if (!video || !cameraReady) return;
  const w=min(190,width*.34), h=w*.75, x=width-w-24, y=height-h-24;
  push(); translate(x+w,y); scale(-1,1); tint(255,210); image(video,0,0,w,h);
  noTint(); noFill(); stroke(255,255,255,150); strokeWeight(1); rect(0,0,w,h,12); pop();
}
function windowResized() { resizeCanvas(windowWidth,windowHeight); initializeCoconuts(); }
