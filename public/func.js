let labels = [];
let images = [];
let labels_t = [];
let images_t = [];
let globalepoch = 1;
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
function calcSlope(x1,y1,x2,y2) {
    let top = y2-y1;
    let down = x2-x1;
    return top/down;
}
function linear_s(slope,x,b) {
    return slope*x+b;
}
function getInbetweenPoints(x1,y1,x2,y2,step) {
    let arr = [];
    let length = 1;
    for (let i = 0; i < step;i++) {
        arr[i] = linear_s(calcSlope(x1,y1,x2,y2),(i)/step,y1);
    }
    return arr;
}
let losses = [];
let accuracies = [];
let acc=[0];
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
    let loss = sum/b;
    losses.push(loss);
    console.log("batch_"+int(batchIndex/100)+" loss:"+(sum/b))
  }
  batchIndex=0;
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
    let starttime = printTime12();
    console.log(starttime)
    console.log("%c Epoch "+ globalepoch,"color: #4AEFC6");
    train_batch(600);

    let accurracy = test();
    epoch++;
    // for (let i =0;i < 600; i++) {
    //   accuracies.push(accurracy);
    // }

    acc.push(accurracy);
    let newarr = getInbetweenPoints(1,acc[acc.length-2],2,acc[acc.length-1],600);
    for (let i = 0; i < newarr.length;i++) {
        accuracies.push(newarr[i]);
    }
    let currentTime = printTime12();
    console.log(currentTime)
    console.log("%c Epoch "+globalepoch+" complete | Accuracy: "+accurracy+" | Start time: "+starttime+" | End time: "+currentTime + " | Time Elapsed: " + calcTimeElapsed(starttime,currentTime),"color: #4AEFC6")
    globalepoch++;
  }

}
let a = "9:59 AM";
let b = "00:30 PM";
let loadj = {};
function loadjson() {
    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {

       // getting a hold of the file reference
       let file = e.target.files[0];

       // setting up the reader
       let reader = new FileReader();
       reader.readAsText(file,'UTF-8');

       // here we tell the reader what to do when it's done reading...
       reader.onload = readerEvent => {
          let content = readerEvent.target.result; // this is the content!
         // console.log( content );

          loadj =  JSON.parse(content);

          input.remove();
       }

    }

    let container = document.getElementById('container');
    container.appendChild(input);

}
function calcTimeElapsed(t1,t2) {
    let time1 = t1.split(" ");
    let time2 = t2.split(" ");
    let add1 = 0;
    let add2 = 0;
    if (time1[1] == "PM") {
        add1 = 12;
    }
    if (time2[1] == "PM") {
        add2 = 12;
    }
    let h1 = time1[0].split(":")[0];
    let h2 = time2[0].split(":")[0];
    if (h1[0] == "0") {
        h1 = h1.split("")[1];

    }
    if (h2[0] == "0") {
        h2 = h2.split("")[1];

    }
    let hour1 = JSON.parse(h1[0])+add1;
    let hour2 = JSON.parse(h2[0])+add2;
    let st1 = time1[0].split(":")[1];
    let st2 = time2[0].split(":")[1];

    if (st1[0] == "0") {
        st1 = st1.split("")[1];

    }
    if (st2[0] == "0") {
        st2 = st2.split("")[1];

    }

    let min1 = JSON.parse(st1);
    let min2 = JSON.parse(st2);

    let m1 = (min1+(hour1*60));
    let m2 = (min2+(hour2*60));
    let k =  (m2 - m1)/60;

    let stri = "";
    let mins = round((k-int(k))*60);
    if (mins < 10) {

        let temp1 = JSON.stringify(mins);
        stri = "0"+temp1;

    } else {
        stri = JSON.stringify(mins);
    }
    let hours = int(k);
    return JSON.stringify(hours)+"h"+stri;

}
function printTime24() {

    let time = Date().split(" ")[4].split(":");
    let hour = time[0];
    let min = time[1];
    return hour+"h"+min;

}
function printTime12() {

    let time = Date().split(" ")[4].split(":");
    let hour = time[0];
    let min = time[1];
    let half = "none";
    if (hour > 12) {
        hour -= 12;
        half = "PM"
    } else {
        half = "AM"
    }
    return hour+":"+min+" " + half;

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
