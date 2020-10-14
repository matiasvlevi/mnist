let dataset = [];
let nn;
let g;
function setup() {
  loadMnist()
    .then(data => {
      createCanvas(600,600)
      nn = new Dann(784,10);
      nn.addHiddenLayer(200,leakyReLU);
      nn.addHiddenLayer(100,leakyReLU);

      nn.makeWeights();
      nn.lr = 0.000003;
      nn.log();
      dataset = data;
    })
  g = new Graph(0,0,600,200);
  g.addValue(losses,color(0,150,255),"loss");
  g.addValue(accuracies,color(255,150,0),"accurracy");

}
function draw() {
  background(51)
  g.render();
}
