let dataset = [];
let nn;
let g;
function setup() {
  loadMnist()
    .then(data => {
      createCanvas(600,600)
      nn = new Dann(784,10);
      //nn.addHiddenLayer(256,leakyReLU);
      nn.addHiddenLayer(200,leakyReLU);
      nn.addHiddenLayer(100,leakyReLU);
      nn.makeWeights();
      nn.lr = 0.000001;
      nn.lossfunc = crossEntryopy;
      nn.log();
      dataset = data;
    })
  g = new Graph(0,0,600,200);
  g.addValue(losses,color(0,150,255),"loss");
  g.addValue(accuracies,color(255,150,0),"accurracy");
  g.step = 600;

}
function draw() {
  background(51)
  g.render();
}
