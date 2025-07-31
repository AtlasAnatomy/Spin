// ---------- DATA ----------
const PRESETS = {
  Vegano: ['Seitan alla piastra', 'Tofu marinato', 'Hummus e verdure', 'Burger di lenticchie'],
  'Senza lattosio': ['Riso alla cantonese', 'Pollo grigliato', 'Merluzzo al forno'],
  Comfort: ['Pizza margherita', 'Lasagna', 'Patatine fritte', 'Tiramisù']
};

let foods = JSON.parse(localStorage.getItem('foods')) || [...PRESETS.Vegano];
let currentPreset = 'Vegano';

// ---------- WHEEL ----------
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const PI2 = Math.PI * 2;
let angle = 0;
let spinning = false;

function drawWheel() {
  ctx.clearRect(0, 0, 320, 320);
  const arc = PI2 / foods.length;
  foods.forEach((food, i) => {
    ctx.beginPath();
    ctx.fillStyle = `hsl(${i * 360 / foods.length} 60% 50%)`;
    ctx.moveTo(160, 160);
    ctx.arc(160, 160, 150, i * arc, (i + 1) * arc);
    ctx.closePath(); ctx.fill();
    ctx.save();
    ctx.translate(160, 160);
    ctx.rotate(i * arc + arc / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px system-ui';
    ctx.fillText(food, 140, 4);
    ctx.restore();
  });
}
drawWheel();

function spin() {
  if (spinning) return;
  spinning = true;
  const spinAngle = 10 + Math.random() * 10;
  const target = Date.now() + 3000;
  function frame() {
    const left = target - Date.now();
    if (left <= 0) {
      spinning = false;
      const winner = Math.floor(((angle % PI2) + PI2) % PI2 / (PI2 / foods.length));
      alert(`🎉 Oggi mangi: ${foods[winner]}`);
      return;
    }
    angle += spinAngle * (left / 3000);
    ctx.save();
    ctx.clearRect(0, 0, 320, 320);
    ctx.translate(160, 160);
    ctx.rotate(angle);
    ctx.translate(-160, -160);
    drawWheel();
    ctx.restore();
    requestAnimationFrame(frame);
  }
  frame();
}

document.getElementById('spinBtn').addEventListener('click', spin);
canvas.addEventListener('click', spin);

// ---------- PRESETS ----------
const presetsEl = document.getElementById('presets');
Object.keys(PRESETS).forEach(name => {
  const chip = document.createElement('span');
  chip.className = 'preset-chip' + (name === currentPreset ? ' active' : '');
  chip.textContent = name;
  chip.onclick = () => {
    document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    foods = [...PRESETS[name]];
    localStorage.setItem('foods', JSON.stringify(foods));
    drawWheel();
    currentPreset = name;
  };
  presetsEl.appendChild(chip);
});

// ---------- EDIT DIALOG ----------
const dialog = document.getElementById('editDialog');
const list = document.getElementById('foodList');
const newFoodInput = document.getElementById('newFood');

document.getElementById('settingsBtn').onclick = () => {
  renderList();
  dialog.showModal();
};
document.getElementById('closeDialogBtn').onclick = () => dialog.close();

function renderList() {
  list.innerHTML = '';
  foods.forEach((f, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `${f} <button onclick="removeFood(${idx})">❌</button>`;
    list.appendChild(li);
  });
}
window.removeFood = idx => {
  foods.splice(idx, 1);
  localStorage.setItem('foods', JSON.stringify(foods));
  renderList();
  drawWheel();
};

document.getElementById('addFoodBtn').onclick = () => {
  const val = newFoodInput.value.trim();
  if (val && !foods.includes(val)) {
    foods.push(val);
    localStorage.setItem('foods', JSON.stringify(foods));
    newFoodInput.value = '';
    renderList();
    drawWheel();
  }
};

// ---------- PWA ----------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
