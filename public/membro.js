// Configuração do Firebase (substitua pelos seus dados)
const firebaseConfig = {
    apiKey: "AIzaSyCTCr2JUHO2Yc1JuTcwkkd682At0lb00Zw",
    authDomain: "agenciaibgeosorioteste.firebaseapp.com",
    projectId: "agenciaibgeosorioteste",
    storageBucket: "agenciaibgeosorioteste.firebasestorage.app",
    messagingSenderId: "976519041511",
    appId: "1:976519041511:web:32014eac776c4cab3ced42",
    measurementId: "G-S6196T35Y2"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Elementos do DOM
const membroContainer = document.getElementById('membro-container');
const logoutBtn = document.getElementById('logout-btn');

// Função para buscar dados do membro logado
async function carregarDadosMembro(uid) {
    try {
        const membroDoc = await db.collection("membros").where("uid", "==", uid).get();
        if (membroDoc.empty) {
            membroContainer.innerHTML = '<p>Conta não associada a nenhum membro. Contate o administrador.</p>';
            return;
        }
        const membro = { id: membroDoc.docs[0].id, ...membroDoc.docs[0].data() };
        renderizarMembro(membro);
    } catch (error) {
        console.error('Erro ao carregar dados do membro:', error);
        membroContainer.innerHTML = '<p>Erro ao carregar informações. Tente novamente.</p>';
    }
}

// Função para renderizar as informações do membro
async function renderizarMembro(membro) {
    membroContainer.innerHTML = '';
    const membroCard = document.createElement('div');
    membroCard.className = 'membro-card';
    
    const membroNome = document.createElement('h3');
    membroNome.className = 'membro-nome';
    membroNome.textContent = membro.nome;
    
    const membroDetalhes = document.createElement('p');
    membroDetalhes.className = 'membro-detalhes';
    membroDetalhes.textContent = `Matrícula: ${membro.matricula}`;
    
    const membroEquipe = document.createElement('div');
    membroEquipe.className = 'membro-equipe';
    try {
        const equipeDoc = await db.collection("equipes").doc(membro.equipeId).get();
        membroEquipe.innerHTML = `<h4>Equipe:</h4> ${equipeDoc.exists ? equipeDoc.data().nome : 'Sem equipe'}`;
    } catch (error) {
        console.error('Erro ao buscar equipe:', error);
        membroEquipe.innerHTML = '<h4>Equipe:</h4> Sem equipe';
    }
    
    const membroTarefas = document.createElement('div');
    membroTarefas.className = 'membro-tarefas';
    membroTarefas.innerHTML = '<h4>Tarefas:</h4>';
    if (membro.tarefas && membro.tarefas.length > 0) {
        const baloesContainer = document.createElement('div');
        baloesContainer.className = 'tarefas-baloes';
        for (const tarefaId of membro.tarefas) {
            try {
                const tarefaDoc = await db.collection("tarefas").doc(tarefaId).get();
                const tarefaBalao = document.createElement('span');
                tarefaBalao.className = 'membro-tarefa';
                tarefaBalao.textContent = tarefaDoc.exists ? tarefaDoc.data().nome : 'Tarefa não encontrada';
                baloesContainer.appendChild(tarefaBalao);
            } catch (error) {
                console.error('Erro ao buscar tarefa:', error);
            }
        }
        membroTarefas.appendChild(baloesContainer);
    } else {
        const semTarefas = document.createElement('p');
        semTarefas.textContent = 'Sem tarefas associadas.';
        membroTarefas.appendChild(semTarefas);
    }
    
    membroCard.appendChild(membroNome);
    membroCard.appendChild(membroDetalhes);
    membroCard.appendChild(membroEquipe);
    membroCard.appendChild(membroTarefas);
    membroContainer.appendChild(membroCard);
}

// Verificar autenticação e carregar dados

// Replace lines 76-84 with:
let authCheckTimeout = null;
const unsubscribe = auth.onAuthStateChanged((user) => {
    // Log auth state to sessionStorage
    sessionStorage.setItem('authLog', JSON.stringify({
        timestamp: new Date().toISOString(),
        page: 'membro.html',
        user: user ? user.uid : null,
        action: 'onAuthStateChanged triggered'
    }));

    if (user) {
        console.log('Usuário autenticado em membro.html, carregando dados');
        sessionStorage.setItem('authLog', JSON.stringify({
            timestamp: new Date().toISOString(),
            page: 'membro.html',
            user: user.uid,
            action: 'User authenticated, loading data'
        }));
        clearTimeout(authCheckTimeout);
        carregarDadosMembro(user.uid);
        unsubscribe(); // Stop listening after success
    } else {
        // Delay redirect to allow auth state to stabilize
        authCheckTimeout = setTimeout(() => {
            if (!auth.currentUser) {
                console.log('Nenhum usuário autenticado em membro.html após espera, redirecionando para login.html');
                sessionStorage.setItem('authLog', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    page: 'membro.html',
                    user: null,
                    action: 'No user after delay, redirecting to login.html'
                }));
                sessionStorage.setItem('redirectUrl', '/membro.html');
                window.location.href = '/login.html';
            }
        }, 1000); // Wait 1 second for auth state
    }
});

// Evento de logout
logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        sessionStorage.setItem('redirectUrl', '/membro.html');
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao sair.');
    }
});