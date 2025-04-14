// Configuração do Firebase
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
const pesquisaBaloesContainer = document.getElementById('pesquisa-baloes-container');
const pesquisaDetalhesContainer = document.getElementById('pesquisa-detalhes-container');
const iniciarTarefaContainer = document.getElementById('iniciar-tarefa-container');
const iniciadasLista = document.getElementById('iniciadas-lista');
const preencherCamposContainer = document.getElementById('preencher-campos-container');
const voltarBtn = document.getElementById('voltar-btn');
const voltarDetalhesBtn = document.getElementById('voltar-detalhes-btn');
const voltarIniciarBtn = document.getElementById('voltar-iniciar-btn');
const pesquisaBaloesView = document.getElementById('pesquisa-baloes');
const pesquisaDetalhesView = document.getElementById('pesquisa-detalhes');
const iniciarTarefaView = document.getElementById('iniciar-tarefa');
const preencherCamposView = document.getElementById('preencher-campos');
const logoutBtn = document.getElementById('logout-btn');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Ordem dos campos
const ordemCampos = [
    "Data de Início", "Responsável 1", "Responsável 2", "Município", "Setor",
    "Mês", "Semana", "Veículo", "Domicílios", "Domicílios Realizados",
    "Domicílios Vagos/Uso Ocasional/Demolido", "Domicílio Entrevista Agendada",
    "Domicílios Morador Ausente", "Domicílios Recusados", "Data Finalização"
];

// Função para gerenciar abas
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
        if (button.dataset.tab === 'pesquisa') {
            renderizarIniciadas(auth.currentUser?.uid);
        }
    });
});

// Função para buscar dados do membro logado
async function carregarDadosMembro(uid) {
    try {
        const membroDoc = await db.collection("membros").where("uid", "==", uid).get();
        if (membroDoc.empty) {
            membroContainer.innerHTML = '<p>Conta não associada a nenhum membro. Contate o administrador.</p>';
            pesquisaBaloesContainer.innerHTML = '<p>Nenhuma pesquisa associada.</p>';
            iniciadasLista.innerHTML = '<p>Nenhuma tarefa iniciada.</p>';
            return;
        }
        const membro = { id: membroDoc.docs[0].id, ...membroDoc.docs[0].data() };
        renderizarMembro(membro);
        renderizarPesquisaBaloes(membro.tarefas || []);
        renderizarIniciadas(uid);
    } catch (error) {
        console.error('Erro ao carregar dados do membro:', error);
        membroContainer.innerHTML = '<p>Erro ao carregar informações. Tente novamente.</p>';
        pesquisaBaloesContainer.innerHTML = '<p>Erro ao carregar pesquisas. Tente novamente.</p>';
        iniciadasLista.innerHTML = '<p>Erro ao carregar tarefas iniciadas.</p>';
    }
}

// Função para renderizar as informações do membro (Aba Inicial)
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

// Função para renderizar balões de pesquisas (Aba Pesquisa)
async function renderizarPesquisaBaloes(tarefaIds) {
    pesquisaBaloesContainer.innerHTML = '';
    if (!tarefaIds || tarefaIds.length === 0) {
        pesquisaBaloesContainer.innerHTML = '<p>Nenhuma pesquisa associada.</p>';
        return;
    }
    const baloesContainer = document.createElement('div');
    baloesContainer.className = 'tarefas-baloes';
    for (const tarefaId of tarefaIds) {
        try {
            const tarefaDoc = await db.collection("tarefas").doc(tarefaId).get();
            if (tarefaDoc.exists) {
                const tarefa = { id: tarefaDoc.id, ...tarefaDoc.data() };
                const balao = document.createElement('span');
                balao.className = 'membro-tarefa';
                balao.textContent = tarefa.nome;
                balao.dataset.tarefaId = tarefa.id;
                balao.addEventListener('click', () => {
                    renderizarPesquisaDetalhes(tarefa);
                    pesquisaBaloesView.classList.remove('active');
                    pesquisaDetalhesView.classList.add('active');
                });
                baloesContainer.appendChild(balao);
            } else {
                const erroSpan = document.createElement('p');
                erroSpan.textContent = `Pesquisa com ID ${tarefaId} não encontrada.`;
                baloesContainer.appendChild(erroSpan);
            }
        } catch (error) {
            console.error('Erro ao buscar pesquisa:', error);
            const erroSpan = document.createElement('p');
            erroSpan.textContent = `Erro ao carregar pesquisa com ID ${tarefaId}.`;
            baloesContainer.appendChild(erroSpan);
        }
    }
    pesquisaBaloesContainer.appendChild(baloesContainer);
}

// Função para renderizar detalhes da pesquisa selecionada
function renderizarPesquisaDetalhes(tarefa) {
    pesquisaDetalhesContainer.innerHTML = '';
    const pesquisaCard = document.createElement('div');
    pesquisaCard.className = 'pesquisa-card';
    
    const pesquisaNome = document.createElement('h3');
    pesquisaNome.className = 'pesquisa-nome';
    pesquisaNome.textContent = tarefa.nome;
    
    const pesquisaCampos = document.createElement('div');
    pesquisaCampos.className = 'pesquisa-campos';
    if (tarefa.campos && Object.keys(tarefa.campos).length > 0) {
        pesquisaCampos.innerHTML = '<h4>Campos:</h4>';
        Object.entries(tarefa.campos).forEach(([nomeCampo, valorCampo]) => {
            const campoSpan = document.createElement('span');
            campoSpan.className = 'pesquisa-campo';
            campoSpan.textContent = `${nomeCampo}: ${valorCampo || 'Não preenchido'}`;
            pesquisaCampos.appendChild(campoSpan);
        });
    } else {
        pesquisaCampos.innerHTML = '<p>Sem campos associados.</p>';
    }
    
    const iniciarBtn = document.createElement('button');
    iniciarBtn.className = 'iniciar-btn';
    iniciarBtn.textContent = 'Iniciar Tarefa';
    iniciarBtn.addEventListener('click', () => {
        renderizarIniciarTarefa(tarefa);
        pesquisaDetalhesView.classList.remove('active');
        iniciarTarefaView.classList.add('active');
    });
    
    pesquisaCard.appendChild(pesquisaNome);
    pesquisaCard.appendChild(pesquisaCampos);
    pesquisaCard.appendChild(iniciarBtn);
    pesquisaDetalhesContainer.appendChild(pesquisaCard);
}

// Função para renderizar a interface de iniciar tarefa
async function renderizarIniciarTarefa(tarefa) {
    iniciarTarefaContainer.innerHTML = '';
    const iniciarCard = document.createElement('div');
    iniciarCard.className = 'iniciar-card';
    
    const iniciarTitulo = document.createElement('h3');
    iniciarTitulo.className = 'iniciar-titulo';
    iniciarTitulo.textContent = `Iniciando a Tarefa: ${tarefa.nome}`;
    
    const iniciarMensagem = document.createElement('p');
    iniciarMensagem.className = 'iniciar-mensagem';
    iniciarMensagem.textContent = 'Clique no botão abaixo para iniciar uma nova tarefa.';
    
    const confirmarBtn = document.createElement('button');
    confirmarBtn.className = 'confirmar-btn';
    confirmarBtn.textContent = 'Iniciar Nova Tarefa';
    confirmarBtn.addEventListener('click', async () => {
        try {
            const logRef = await db.collection('tarefa_logs').add({
                tarefaId: tarefa.id,
                tarefaNome: tarefa.nome,
                membroId: auth.currentUser.uid,
                membroEmail: auth.currentUser.email,
                acao: 'iniciar',
                dataInicio: firebase.firestore.FieldValue.serverTimestamp(),
                campos: {},
                status: 'Iniciado'
            });
            alert('Tarefa iniciada com sucesso!');
            renderizarIniciadas(auth.currentUser.uid);
        } catch (error) {
            console.error('Erro ao iniciar tarefa:', error);
            alert('Erro ao iniciar a tarefa.');
        }
    });
    
    iniciarCard.appendChild(iniciarTitulo);
    iniciarCard.appendChild(iniciarMensagem);
    iniciarCard.appendChild(confirmarBtn);
    iniciarTarefaContainer.appendChild(iniciarCard);
}

// Função para renderizar tarefas iniciadas
async function renderizarIniciadas(membroId) {
    if (!membroId) return;
    iniciadasLista.innerHTML = '';
    try {
        const logsSnapshot = await db.collection('tarefa_logs')
            .where('membroId', '==', membroId)
            .where('acao', '==', 'iniciar')
            .orderBy('dataInicio', 'desc')
            .get();
        if (logsSnapshot.empty) {
            iniciadasLista.innerHTML = '<p>Nenhuma tarefa iniciada.</p>';
            return;
        }
        const iniciadasContainer = document.createElement('div');
        iniciadasContainer.className = 'iniciadas-container';
        for (const doc of logsSnapshot.docs) {
            const log = { id: doc.id, ...doc.data() };
            const tarefaDoc = await db.collection('tarefas').doc(log.tarefaId).get();
            const tarefa = tarefaDoc.exists ? tarefaDoc.data() : {};
            const iniciadaItem = document.createElement('div');
            iniciadaItem.className = 'iniciada-item';
            iniciadaItem.textContent = `${log.tarefaNome} - Iniciada em: ${log.dataInicio ? log.dataInicio.toDate().toLocaleDateString('pt-BR') : 'Data não disponível'} - Status: ${log.status || 'Iniciado'}`;
            iniciadaItem.addEventListener('click', () => {
                renderizarPreencherCampos(log, tarefa);
                iniciarTarefaView.classList.remove('active');
                preencherCamposView.classList.add('active');
            });
            iniciadasContainer.appendChild(iniciadaItem);
        }
        iniciadasLista.appendChild(iniciadasContainer);
    } catch (error) {
        console.error('Erro ao carregar tarefas iniciadas:', error);
        iniciadasLista.innerHTML = '<p>Erro ao carregar tarefas iniciadas.</p>';
    }
}

// Função para buscar opções pré-cadastradas
async function buscarOpcoesPreCadastradas() {
    try {
        const membrosSnapshot = await db.collection('membros').get();
        const municipiosSnapshot = await db.collection('municipios').get();
        const setoresSnapshot = await db.collection('setores').get();
        
        const membros = membrosSnapshot.docs.map(doc => ({ id: doc.id, nome: doc.data().nome }));
        const municipios = municipiosSnapshot.docs.map(doc => ({ id: doc.id, nome: doc.data().nome }));
        const setores = setoresSnapshot.docs.map(doc => ({ id: doc.id, codigo: doc.data().codigo }));
        
        return { membros, municipios, setores };
    } catch (error) {
        console.error('Erro ao buscar opções pré-cadastradas:', error);
        return { membros: [], municipios: [], setores: [] };
    }
}

// Função para renderizar interface de preenchimento de campos
async function renderizarPreencherCampos(log, tarefa) {
    preencherCamposContainer.innerHTML = '';
    const preencherCard = document.createElement('div');
    preencherCard.className = 'preencher-card';
    
    const preencherTitulo = document.createElement('h3');
    preencherTitulo.className = 'preencher-titulo';
    preencherTitulo.textContent = `Preencher Campos: ${log.tarefaNome}`;
    
    const camposForm = document.createElement('form');
    camposForm.className = 'campos-form';
    
    const logCampos = log.campos || {};
    const opcoes = await buscarOpcoesPreCadastradas();
    
    if (!tarefa.campos || Object.keys(tarefa.campos).length === 0) {
        const semCampos = document.createElement('p');
        semCampos.textContent = 'Nenhum campo para preencher.';
        camposForm.appendChild(semCampos);
    } else {
        ordemCampos.forEach(nomeCampo => {
            if (tarefa.campos.hasOwnProperty(nomeCampo)) {
                const campoContainer = document.createElement('div');
                campoContainer.className = 'campo-container';
                
                const campoLabel = document.createElement('label');
                campoLabel.className = 'campo-label';
                campoLabel.textContent = nomeCampo;
                
                let campoInput;
                if (['Responsável 1', 'Responsável 2', 'Município', 'Setor'].includes(nomeCampo)) {
                    campoInput = document.createElement('select');
                    campoInput.className = 'campo-select';
                    const opcoesLista = nomeCampo.includes('Responsável') ? opcoes.membros :
                                        nomeCampo === 'Município' ? opcoes.municipios :
                                        opcoes.setores;
                    const valorCampo = nomeCampo.includes('Responsável') ? 'nome' : nomeCampo === 'Município' ? 'nome' : 'codigo';
                    
                    const opcaoVazia = document.createElement('option');
                    opcaoVazia.value = '';
                    opcaoVazia.textContent = `Selecione ${nomeCampo}`;
                    campoInput.appendChild(opcaoVazia);
                    
                    opcoesLista.forEach(opcao => {
                        const opcaoElemento = document.createElement('option');
                        opcaoElemento.value = opcao[valorCampo];
                        opcaoElemento.textContent = opcao[valorCampo];
                        if (logCampos[nomeCampo] === opcao[valorCampo]) {
                            opcaoElemento.selected = true;
                        }
                        campoInput.appendChild(opcaoElemento);
                    });
                } else {
                    campoInput = document.createElement('input');
                    campoInput.type = nomeCampo.includes('Data') ? 'date' : 'text';
                    campoInput.className = 'campo-input';
                    campoInput.value = logCampos[nomeCampo] || '';
                }
                
                campoContainer.appendChild(campoLabel);
                campoContainer.appendChild(campoInput);
                camposForm.appendChild(campoContainer);
            }
        });
        
        const salvarBtn = document.createElement('button');
        salvarBtn.type = 'button';
        salvarBtn.className = 'salvar-campos-btn';
        salvarBtn.textContent = 'Salvar Campos';
        salvarBtn.addEventListener('click', async () => {
            const novosCampos = {};
            camposForm.querySelectorAll('.campo-container').forEach(container => {
                const nomeCampo = container.querySelector('.campo-label').textContent;
                const input = container.querySelector('.campo-input, .campo-select');
                novosCampos[nomeCampo] = input.value.trim();
            });
            const novoStatus = novosCampos['Data Finalização'] ? 'Finalizada' : 'Iniciado';
            try {
                await db.collection('tarefa_logs').doc(log.id).update({
                    campos: novosCampos,
                    status: novoStatus
                });
                alert('Campos salvos com sucesso!');
                renderizarPreencherCampos(log, tarefa);
                renderizarIniciadas(auth.currentUser.uid);
            } catch (error) {
                console.error('Erro ao salvar campos:', error);
                alert('Erro ao salvar campos.');
            }
        });
        
        camposForm.appendChild(salvarBtn);
    }
    
    preencherCard.appendChild(preencherTitulo);
    preencherCard.appendChild(camposForm);
    preencherCamposContainer.appendChild(preencherCard);
}

// Evento para voltar à lista de balões
voltarBtn.addEventListener('click', () => {
    pesquisaDetalhesView.classList.remove('active');
    pesquisaBaloesView.classList.add('active');
});

// Evento para voltar aos detalhes da pesquisa
voltarDetalhesBtn.addEventListener('click', () => {
    iniciarTarefaView.classList.remove('active');
    pesquisaDetalhesView.classList.add('active');
});

// Evento para voltar à interface de iniciar tarefa
voltarIniciarBtn.addEventListener('click', () => {
    preencherCamposView.classList.remove('active');
    iniciarTarefaView.classList.add('active');
});

// Verificar autenticação e carregar dados
let authCheckTimeout = null;
const unsubscribe = auth.onAuthStateChanged((user) => {
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
        unsubscribe();
    } else {
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
        }, 1000);
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