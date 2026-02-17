import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBcLRk60MpWxDxPyYAaG4QXeckImSwQILs",
  authDomain: "meucadastro-283c0.firebaseapp.com",
  projectId: "meucadastro-283c0",
  storageBucket: "meucadastro-283c0.firebasestorage.app",
  messagingSenderId: "986428055490",
  appId: "1:986428055490:web:7b937d19b8590bd6cec05b",
  measurementId: "G-JDYVN6YPT0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const usuariosCol = collection(db, "usuarios");

// --- 1. BUSCA DE CEP (ViaCEP) ---
const cepInput = document.getElementById('cep');
cepInput.addEventListener('blur', async () => {
    const cep = cepInput.value.replace(/\D/g, '');
    if (cep.length === 8) {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
            document.getElementById('logradouro').value = data.logradouro;
            document.getElementById('localidade').value = data.localidade;
            document.getElementById('uf').value = data.uf;
            document.getElementById('numero').focus();
        }
    }
});

// --- 2. SALVAR NO FIREBASE ---
const form = document.getElementById('cadastroForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        await addDoc(usuariosCol, {
            nome: document.getElementById('nome').value,
            sobrenome: document.getElementById('sobrenome').value,
            email: document.getElementById('email').value,
            cidade: document.getElementById('localidade').value,
            uf: document.getElementById('uf').value,
            data: new Date()
        });
        
        form.reset();
        const msg = document.getElementById('successMessage');
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
    } catch (error) {
        alert("Erro ao salvar: " + error.message);
    }
});

// --- 3. LISTAR EM TEMPO REAL ---
onSnapshot(usuariosCol, (snapshot) => {
    const tabela = document.getElementById('tabelaCorpo');
    tabela.innerHTML = '';
    snapshot.forEach((usuario) => {
        const d = usuario.data();
        tabela.innerHTML += `
            <tr>
                <td>${d.nome}</td>
                <td>${d.email}</td>
                <td>${d.cidade}/${d.uf}</td>
                <td><button class="btn btn-danger btn-sm" onclick="remover('${usuario.id}')">X</button></td>
            </tr>
        `;
    });
});

// Função para remover (precisa ser global)
window.remover = async (id) => {
    if(confirm("Deseja excluir este usuário?")) {
        await deleteDoc(doc(db, "usuarios", id));
    }
};