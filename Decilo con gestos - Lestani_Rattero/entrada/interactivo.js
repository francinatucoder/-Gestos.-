
let classifier;
let handPose;
let video;
let hands = [];
let classification = "";
let isModelLoaded = false;
let images = {};
let soundFiles = {};
let isMuted = false;

let soundPlaying = {
  CORNUDO: false,
  OJITO: false,
  QUIENES: false,
  PIPI: false,
  PERONISTA: false,
  CHUPI: false,
  TIRO: false
}
//Diccionario de textos (para llamar luego)
let dicc =  {
  CORNUDO: 'Que está siendo víctima de una infidelidad por parte de su pareja sentimental. También acompañado de insultos como “corneta” o “gorreado”.',
  OJITO: 'Tiene múltiples significados como: “yo sé lo que estás haciendo”, o “tené cuidado”, o  “te estoy viendo”. Normalmente tiene connotación negativa, así que ojo.',
  QUIENES: 'Se traduce en un “¿qué te pasa?”. Puede variar su tono de acuerdo con la intensidad del movimiento y, sobre todo, con la mirada que lo acompaña.',
  PIPI:'Que algo está perfecto, es bueno, o es lindo. Dicho popularizado por el error de Carlos Monzón al querer agradecer un premio recibido en Francés.',
  PERONISTA:'La expresión proviene del verbo “volver” y fue popularizada por el peronismo en relación al retorno de Perón en el año 1972, convirtiendose en signo de victoria del justicialismo.',
  CHUPI:'Indica que se va a tomar alcohol en excesivas cantidades. También acompañado de expresiones como “hoy me la pongo”.',
  TIRO: 'Amenaza de muerte. Icónico momento en el programa de Mirtha Legrand donde el invitado saca un arma y la apunta.',
}

function preload() {
  // Modelo handPose 
  handPose = ml5.handPose();

  // GIFs
  images['CORNUDO'] = loadImage('GIFS/wanda-cuernos.gif');
  images['OJITO'] = loadImage('GIFS/oriana-ojito.gif');
  images['QUIENES SON'] = loadImage('GIFS/moria-montoncito.gif');
  images['PIPI CUCU'] = loadImage('GIFS/pipí cucú.gif');
  images['PERONISTA'] = loadImage('GIFS/perón-V.gif');
  images['CHUPI'] = loadImage('GIFS/Iorio-chupi.gif');
  images['UN TIRO'] = loadImage('GIFS/mirtha-tiro.gif');

  // Sonidos
  soundFiles['CORNUDO'] = loadSound('SONIDOS/cuernos - Karina.aiff');
  soundFiles['OJITO'] = loadSound('SONIDOS/cuidado con la bomba.aiff');
  soundFiles['QUIENES SON'] = loadSound('SONIDOS/Moria - Quiénes son.mp3');
  soundFiles['PIPI CUCU'] = loadSound('SONIDOS/pipi cucú.aiff');
  soundFiles['PERONISTA'] = loadSound('SONIDOS/marcha peronista.aiff');
  soundFiles['CHUPI'] = loadSound('SONIDOS/chupi mona.aiff');
  soundFiles['UN TIRO'] = loadSound('SONIDOS/tiro.aiff');
}

function setup() {
  createCanvas(960, 720);

  // Activar webcam
  video = createCapture(VIDEO);
  video.size(960, 720);
  video.hide();

  // Backend para que funcione en todos los browsers
  ml5.setBackend("webgl");

  // Subir el neural network 
  let classifierOptions = {
    task: "classification",
  };
  classifier = ml5.neuralNetwork(classifierOptions);

  const modelDetails = {
    model: "model/model (7).json",
    metadata: "model/model_meta (8).json",
    weights: "model/model.weights (9).bin",
  };

  classifier.load(modelDetails, modelLoaded);

  // Detección de manos
  handPose.detectStart(video, gotHands);
}

function draw() {
push()
   // Espejar canvas
   translate(width, 0);
   scale(-1, 1);

  // Display Web
  image(video, 0, 0, width, height);
  fill(255); 
  noStroke();
  rect(0, 0, 210, height);

  // Puntos de las manos
    if (hands[0]) {
    let hand = hands[0];
    for (let i = 0; i < hand.keypoints.length; i++) {
      let keypoint = hand.keypoints[i];

    // Espejar puntos de las manos
    let x = width - keypoint.x;
    let y = keypoint.y;

      fill(249, 221, 40);
      noStroke();
      circle(keypoint.x, keypoint.y, 10);
    }
  }
  pop();

  // Clasificaciones y resultados
  if (isModelLoaded && hands[0]) {
    let inputData = flattenHandData();
    classifier.classify(inputData, gotClassification);
    textAlign(CENTER, CENTER);
    textFont('jetbrains mono', 30);
    fill(104, 165, 246)
    text(classification, 768, 160, 180, 140);

// Reacción para el gesto "OJITO"
    if (classification === 'OJITO') {
      textFont('jetbrains mono', 10);
      textAlign(LEFT, CENTER)
      text(90, 0);
      text(dicc.OJITO, 768, 580, 180, 140);
      image(images['OJITO'], 800, 260, 110, 100);
      playSound('OJITO');
    } else {
      stopSound('OJITO');
    }
    
// Reacción para el gesto "CORNUDO"
    if (classification === 'CORNUDO') {
      textFont('jetbrains mono', 10);
      textAlign(LEFT, CENTER)
      text(dicc.CORNUDO, 768, 580, 180, 140);
      image(images['CORNUDO'], 780, 280, 150, 80);
      playSound('CORNUDO');
    } else {
      stopSound('CORNUDO');
    }

// Reacción para el gesto "TE VOY A PEGAR UN TIRO"
   if (classification === 'UN TIRO') {
    textFont('jetbrains mono', 10);
    textAlign(LEFT, CENTER)
    text(dicc.TIRO, 768, 580, 180, 140);
    image(images['UN TIRO'], 780, 280, 150, 80);
    playSound('UN TIRO');
  } else {
    stopSound('UN TIRO');
}

 // Reacción para el gesto "CHUPI"
 if (classification === 'CHUPI') {
  textFont('jetbrains mono', 10);
  textAlign(LEFT, CENTER)
  text(dicc.CHUPI, 768, 580, 180, 140);
  image(images['CHUPI'], 780, 280, 150, 80);
  playSound('CHUPI');
} else {
  stopSound('CHUPI');
}

// Reacción para el gesto "PIPI CUCU"
if (classification === 'PIPI CUCU') {
  textFont('jetbrains mono', 10);
  textAlign(LEFT, CENTER)
  text(dicc.PIPI, 768, 580, 180, 140);
  image(images['PIPI CUCU'], 780, 280, 152, 80);
  playSound('PIPI CUCU');
} else {
  stopSound('PIPI CUCU');
}

// Reacción para el gesto "QUIENES SON"
if (classification === 'QUIENES SON') {
  textFont('jetbrains mono', 10);
  textAlign(LEFT, CENTER)
  text(dicc.QUIENES, 768, 580, 180, 140);
  image(images['QUIENES SON'], 780, 280, 150, 80);
  playSound('QUIENES SON');
} else {
  stopSound('QUIENES SON');
}

// Reacción para el gesto "PERONISTA"
if (classification === 'PERONISTA') {
  textFont('jetbrains mono', 10);
  textAlign(LEFT, CENTER)
  text(dicc.PERONISTA, 768, 580, 180,  140);
  image(images['PERONISTA'], 780, 280, 150, 80);
  playSound('PERONISTA');
    } else {
      stopSound('PERONISTA');
}

} else {
  // Detener sonido al no detectar manos 
  if (soundPlaying['OJITO']) {
    soundFiles['OJITO'].stop();
    soundPlaying['OJITO'] = false;
  }
  if (soundPlaying['CORNUDO']) {
    soundFiles['CORNUDO'].stop();
    soundPlaying['CORNUDO'] = false;
  }
  if (soundPlaying['PIPI CUCU']) {
    soundFiles['PIPI CUCU'].stop();
    soundPlaying['PIPI CUCU'] = false;
  }
  if (soundPlaying['PERONISTA']) {
    soundFiles['PERONISTA'].stop();
    soundPlaying['PERONISTA'] = false;
  }
  if (soundPlaying['UN TIRO']) {
    soundFiles['UN TIRO'].stop();
    soundPlaying['UN TIRO'] = false;
  }
  if (soundPlaying['CHUPI']) {
    soundFiles['CHUPI'].stop();
    soundPlaying['CHUPI'] = false;
  }
  if (soundPlaying['QUIENES SON']) {
    soundFiles['QUIENES SON'].stop();
    soundPlaying['QUIENES SON'] = false;
  }
}
}

// Convertir la data del handpose en un array
function flattenHandData() {
  let hand = hands[0];
  let handData = [];
  for (let i = 0; i < hand.keypoints.length; i++) {
    let keypoint = hand.keypoints[i];
    handData.push(keypoint.x);
    handData.push(keypoint.y);
  }
  return handData;
}

// Funciones del entrenamiento
function gotHands(results) {
  hands = results;
}
function gotClassification(results) {
  classification = results[0].label;
}
function modelLoaded() {
  isModelLoaded = true;
}

//Funcion mute
function toggleMute() {
  isMuted = !isMuted;
  const muteIcon = document.getElementById('muteIcon');
  if (isMuted) {
    muteIcon.classList.remove('fa-volume-up');
    muteIcon.classList.add('fa-volume-mute');
    for (let key in soundPlaying) {
      stopSound(key);
    }
  } else {
    muteIcon.classList.remove('fa-volume-mute');
    muteIcon.classList.add('fa-volume-up');
  }
}

function playSound(label) {
  if (!isMuted && !soundPlaying[label]) {
    soundFiles[label].play();
    soundPlaying[label] = true;
  }
}

function stopSound(label) {
  if (soundPlaying[label]) {
    soundFiles[label].stop();
    soundPlaying[label] = false;
  }
}

//Pistas
let pistas = ["juntar todos los dedos", " V con los dedos", "índice y meñique arriba", "índice arriba", "juntar pulgar e índice", "meñique y pulgar extendidos","pulgar, índice y medio extendidos"]; 

function randomWord() {
    let indiceAleatorio = Math.floor(Math.random() * words.length);
    let randomWord = words[indiceAleatorio];
    document.getElementById('randomText').innerText = randomWord;
}

function mostrarPista() {
    let indiceAleatorio = Math.floor(Math.random() * pistas.length);
    let randomPista = pistas[indiceAleatorio];
    document.getElementById('randomText').innerText = randomPista;
}

document.getElementById('pistaBoton').addEventListener('click', mostrarPista)

