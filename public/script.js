const firebaseConfig = {
  apiKey: "AIzaSyCHrKZYmmOSV394FX2vKZzVPH6l2DJ7q9k",
  authDomain: "manajemen-tugas-55af7.firebaseapp.com",
  databaseURL: "https://manajemen-tugas-55af7-default-rtdb.firebaseio.com",
  projectId: "manajemen-tugas-55af7",
  storageBucket: "manajemen-tugas-55af7.appspot.com",
  messagingSenderId: "214329006801",
  appId: "1:214329006801:web:b68437c69725e0255b83f0"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

let tasks = [];
let currentUID = null;

const form = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const filter = document.getElementById('filter');
const loginBox = document.getElementById('loginBox');
const registerBox = document.getElementById('registerBox');
const appBox = document.getElementById('app');

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      currentUID = userCredential.user.uid;
      loginBox.style.display = 'none';
      appBox.style.display = 'block';
      loadTasks();
    })
    .catch((error) => {
      alert("Login gagal: " + error.message);
    });
}

function showRegister() {
  loginBox.style.display = 'none';
  registerBox.style.display = 'block';
}

function cancelRegister() {
  registerBox.style.display = 'none';
  loginBox.style.display = 'block';
}

function register() {
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      alert("Akun berhasil dibuat. Anda sekarang login.");
      currentUID = userCredential.user.uid;
      registerBox.style.display = 'none';
      appBox.style.display = 'block';
      loadTasks();
    })
    .catch((error) => {
      alert("Registrasi gagal: " + error.message);
    });
}

function logout() {
  auth.signOut().then(() => {
    currentUID = null;
    tasks = [];
    loginBox.style.display = 'block';
    appBox.style.display = 'none';
    registerBox.style.display = 'none';
  });
}

function renderTasks() {
  taskList.innerHTML = '';
  const selected = filter.value;
  tasks.forEach((task, index) => {
    if (selected === 'selesai' && !task.selesai) return;
    if (selected === 'belum' && task.selesai) return;

    const div = document.createElement('div');
    div.className = 'task';

    const title = document.createElement('h3');
    title.textContent = task.judul;
    if (task.selesai) title.classList.add('completed');

    const info = document.createElement('p');
    info.textContent = `${task.mataKuliah} - Deadline: ${task.deadline}`;

    const desc = document.createElement('p');
    desc.textContent = task.deskripsi;

    const warning = document.createElement('p');
    const daysLeft = (new Date(task.deadline) - new Date()) / (1000 * 3600 * 24);
    if (!task.selesai && daysLeft <= 2) {
      warning.textContent = '⚠ Deadline Hampir Tiba!';
      warning.className = 'warning';
    }

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = task.selesai ? 'Tandai Belum Selesai' : 'Tandai Selesai';
    toggleBtn.onclick = () => {
      tasks[index].selesai = !tasks[index].selesai;
      saveTasks();
    };

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Hapus';
    delBtn.onclick = () => {
      tasks.splice(index, 1);
      saveTasks();
    };

    div.append(title, info, desc, warning, toggleBtn, delBtn);
    taskList.appendChild(div);
  });
}

function saveTasks() {
  if (!currentUID) return;
  db.ref('tasks/' + currentUID).set(tasks);
}

function loadTasks() {
  if (!currentUID) return;
  db.ref('tasks/' + currentUID).on('value', (snapshot) => {
    tasks = snapshot.val() || [];
    renderTasks();
  });
}

form.onsubmit = (e) => {
  e.preventDefault();
  const task = {
    judul: form.judul.value,
    mataKuliah: form.mataKuliah.value,
    deskripsi: form.deskripsi.value,
    deadline: form.deadline.value,
    selesai: false
  };
  tasks.push(task);
  form.reset();
  saveTasks();
};

filter.onchange = renderTasks;