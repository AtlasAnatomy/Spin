document.addEventListener('DOMContentLoaded', () => {
    // ----- ELEMENTI DEL DOM -----
    const canvas = document.getElementById('wheel-canvas');
    const spinBtn = document.getElementById('spin-btn');
    const manageBtn = document.getElementById('manage-btn');
    const resultModal = document.getElementById('result-modal');
    const manageModal = document.getElementById('manage-modal');
    const resultText = document.getElementById('result-text');
    const closeResultModal = document.getElementById('close-result-modal');
    const closeManageModal = document.getElementById('close-manage-modal');
    const spinAgainBtn = document.getElementById('spin-again-btn');
    const predefinedListContainer = document.getElementById('predefined-lists-container');
    const userListContainer = document.getElementById('user-lists-container');
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const saveListBtn = document.getElementById('save-list-btn');

    // ----- DATI E CONFIGURAZIONE -----
    const ctx = canvas.getContext('2d');
    let options = [];
    const colors = ["#e67e22", "#3498db", "#2ecc71", "#9b59b6", "#f1c40f", "#e74c3c", "#1abc9c", "#d35400"];
    let startAngle = 0;
    let spinTimeout = null;
    let spinTime = 0;
    let spinTimeTotal = 0;
    let isSpinning = false;
    let rotation = 0;

    const predefinedLists = [
        { name: "Classici Italiani", items: ["Pizza", "Pasta", "Lasagne", "Risotto", "Cotoletta", "Arancini"] },
        { name: "Vegana", items: ["Seitan", "Burger di legumi", "Zuppa", "Tofu saltato", "Hummus", "Curry di ceci"] },
        { name: "Pasti Veloci", items: ["Panino", "Piadina", "Insalatona", "Toast", "Couscous", "Frittata"] },
        { name: "Cucine dal Mondo", items: ["Sushi", "Kebab", "Tacos", "Pad Thai", "Paella", "Goulash"] }
    ];

    let userLists = JSON.parse(localStorage.getItem('userGiraGustoLists')) || [];

    // ----- FUNZIONI DELLA RUOTA -----

    const drawWheel = () => {
        const numOptions = options.length;
        if (numOptions === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        const arcSize = (2 * Math.PI) / numOptions;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.font = 'bold 16px Poppins';

        for (let i = 0; i < numOptions; i++) {
            const angle = startAngle + i * arcSize;
            ctx.fillStyle = colors[i % colors.length];

            ctx.beginPath();
            ctx.arc(200, 200, 200, angle, angle + arcSize, false);
            ctx.arc(200, 200, 0, angle + arcSize, angle, true);
            ctx.fill();
            ctx.stroke();

            ctx.save();
            ctx.fillStyle = "white";
            ctx.translate(200 + Math.cos(angle + arcSize / 2) * 120, 200 + Math.sin(angle + arcSize / 2) * 120);
            ctx.rotate(angle + arcSize / 2 + Math.PI / 2);
            const text = options[i];
            ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
            ctx.restore();
        }
    };

    const rotateWheel = () => {
        spinTime += 30;
        if (spinTime >= spinTimeTotal) {
            stopRotateWheel();
            return;
        }
        const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
        rotation = (rotation + (spinAngle * Math.PI / 180)) % (2 * Math.PI);
        canvas.style.transform = `rotate(${rotation * 180 / Math.PI}deg)`;
        spinTimeout = setTimeout(rotateWheel, 30);
    };

    const stopRotateWheel = () => {
        clearTimeout(spinTimeout);
        isSpinning = false;
        spinBtn.disabled = false;
        
        const degrees = rotation * 180 / Math.PI;
        const arcd = 360 / options.length;
        const index = Math.floor((360 - degrees % 360) / arcd);
        
        resultText.textContent = options[index];
        resultModal.style.display = 'flex';
    };

    const spin = () => {
        if (isSpinning || options.length < 2) return;
        
        isSpinning = true;
        spinBtn.disabled = true;
        spinAngleStart = Math.random() * 10 + 10;
        spinTimeTotal = Math.random() * 3000 + 4000; // 4-7 secondi
        rotateWheel();
    };

    const easeOut = (t, b, c, d) => {
        const ts = (t /= d) * t;
        const tc = ts * t;
        return b + c * (tc + -3 * ts + 3 * t);
    };

    // ----- FUNZIONI DI GESTIONE LISTE E MODALI -----
    
    const openManageModal = () => manageModal.style.display = 'flex';
    const closeAllModals = () => {
        manageModal.style.display = 'none';
        resultModal.style.display = 'none';
    };
    
    const setActiveList = (listItems) => {
        options = [...listItems];
        drawWheel();
        closeAllModals();
    };

    const renderPredefinedLists = () => {
        predefinedListContainer.innerHTML = '';
        predefinedLists.forEach(list => {
            const li = document.createElement('li');
            li.className = 'list-item';
            li.innerHTML = `<span>${list.name}</span><div class="list-controls"><button>Usa</button></div>`;
            li.querySelector('button').addEventListener('click', () => setActiveList(list.items));
            predefinedListContainer.appendChild(li);
        });
    };

    const renderUserLists = () => {
        userListContainer.innerHTML = '';
        userLists.forEach((list, index) => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `<span>${list.name}</span>
                             <div class="list-controls">
                                <button class="use-button" data-index="${index}">Usa</button>
                                <button class="delete-button" data-index="${index}">Elimina</button>
                             </div>`;
            userListContainer.appendChild(div);
        });
    };

    const saveUserListsToStorage = () => {
        localStorage.setItem('userGiraGustoLists', JSON.stringify(userLists));
    };

    const saveNewList = () => {
        const nameInput = document.getElementById('new-list-name');
        const itemsInput = document.getElementById('new-list-items');
        const name = nameInput.value.trim();
        const items = itemsInput.value.split('\n').map(item => item.trim()).filter(item => item);
        
        if (name && items.length > 0) {
            userLists.push({ name, items });
            saveUserListsToStorage();
            renderUserLists();
            nameInput.value = '';
            itemsInput.value = '';
        } else {
            alert('Per favore, inserisci un nome e almeno un cibo per la lista.');
        }
    };
    
    // ----- EVENT LISTENERS -----
    spinBtn.addEventListener('click', spin);
    manageBtn.addEventListener('click', openManageModal);
    closeResultModal.addEventListener('click', closeAllModals);
    closeManageModal.addEventListener('click', closeAllModals);
    spinAgainBtn.addEventListener('click', () => {
        closeAllModals();
        spin();
    });
    
    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.getAttribute('data-tab');
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            link.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    saveListBtn.addEventListener('click', saveNewList);
    
    userListContainer.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        if (e.target.classList.contains('use-button')) {
            setActiveList(userLists[index].items);
        }
        if (e.target.classList.contains('delete-button')) {
            if (confirm(`Sei sicuro di voler eliminare la lista "${userLists[index].name}"?`)) {
                userLists.splice(index, 1);
                saveUserListsToStorage();
                renderUserLists();
            }
        }
    });

    // ----- INIZIALIZZAZIONE -----
    const init = () => {
        renderPredefinedLists();
        renderUserLists();
        // Carica la prima lista predefinita all'avvio
        if (predefinedLists.length > 0) {
            setActiveList(predefinedLists[0].items);
        }
        drawWheel();
    };

    init();
});
