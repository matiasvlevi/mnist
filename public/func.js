let labels = [];
let images = [];
let labels_t = [];
let images_t = [];

async function loadfile(file, offset) {
    let r = await fetch(file);
    let data = await r.arrayBuffer();
    return new Uint8Array(data).slice(offset);
}
async function loadMnist(callback) {
    let ready = 0;
    let images_t_mapped = [];
    let images_mapped = [];
    let dataObjs = [];
    let dataObjs_t = [];
    loadfile('dataset/train-labels.idx1-ubyte',8)
        .then(data => {
          labels = data;

        })
    loadfile('dataset/train-images.idx3-ubyte',16)
      .then(data=> {

        for (let i = 0; i < (data.length/784);i++) {
          let p = i*784;
          images[i] = data.slice(p,p+784);
          images_mapped[i] = Dann.mapArray(images[i],0,255,0,1);
        }


        for (let i = 0; i < 60000; i++) {
          dataObjs.push({
            inputs: images_mapped[i],
            targets: makeLabel(labels[i])
          })
        }
        console.log("train data fetched")
      })
      loadfile('dataset/t10k-labels.idx1-ubyte',8)
          .then(data => {
            labels_t = data;

          })
      loadfile('dataset/t10k-images.idx3-ubyte',16)
        .then(data=> {

          for (let i = 0; i < (data.length/784);i++) {
            let p = i*784;
            images_t[i] = data.slice(p,p+784);
            images_t_mapped[i] = Dann.mapArray(images_t[i],0,255,0,1);
          }
          for (let i = 0; i < 10000; i++) {
            dataObjs_t.push({
              inputs: images_t_mapped[i],
              targets: makeLabel(labels_t[i])
            })
          }
          console.log("test data fetched")

        })
        return {train: dataObjs, test: dataObjs_t};
}

function test() {
  let succes = 0;
  for (let i = 0; i < 10000;i++) {
    let test_sample = dataset.test[i].inputs;
    let sample_target = dataset.test[i].targets.indexOf(1);
    let outs = nn.feedForward(test_sample);
    let out = findBiggest(outs);
    //console.log(out)
    if (out == sample_target) {
      succes++;

    }
  }
  return succes/10000;
}
let losses = [];
let accuracies = [];
let batchIndex = 0;
let epoch = 0;
function train_batch(n) {

  let b = 100
  for (let j = 0; j < n; j++) {
    let sum = 0;
    for (let i = 0; i < b; i++) {
      let img = dataset.train[batchIndex];

      nn.backpropagate(img.inputs,img.targets);
      if (batchIndex >= 60000) {
        batchindex = 0;
        epoch++;
      } else {
        batchIndex++;
      }
      sum += nn.loss;

    }
    losses.push(sum/b);

    console.log("batch_"+int(batchIndex/100)+" loss:"+(sum/b))
  }

}
function findBiggest(arr) {
  let best = 0;
  let bestIndex = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > best) {
      best = arr[i];
      bestIndex = i;
    }
  }
  return bestIndex;
}
function train(e) {
  for (let i = 0; i < e; i++) {
    train_batch(600);
    batchIndex=0;
    let accurracy = test();
    epoch++;
    for (let i =0;i < 600; i++) {
      accuracies.push(accurracy);
    }

    console.log("epoch: " +epoch+"      accuracy: " +  (accurracy*100) + "%");
  }

}
function makeLabel(x) {
  let arr = [];
  for (let i = 0; i < 10;i++) {
    if (x == i) {
      arr[i] = 1;
    } else {
      arr[i] = 0;
    }
  }
  return arr;
}
function printImgArrayMnist(img) {
  let size = 8;
  let x = 0;
  let y = 200;
  let w = sqrt(img.length);
  for (let i = 0; i < 28; i++) {
    for (let j = 0; j < 28; j++) {
      let col = img[(j*w)+i];

      noStroke();
      fill(col);
      rect((i*size)+x,(j*size)+y,size,size);
    }
  }
}
