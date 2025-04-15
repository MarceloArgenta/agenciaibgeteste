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
const equipeForm = document.getElementById('equipe-form');
const equipeIdInput = document.getElementById('equipe-id');
const nomeEquipeInput = document.getElementById('nome-equipe');
const descricaoEquipeInput = document.getElementById('descricao-equipe');
const salvarEquipeBtn = document.getElementById('salvar-equipe-btn');
const cancelarEquipeBtn = document.getElementById('cancelar-equipe-btn');
const equipesContainer = document.getElementById('equipes-container');
const emailMembroInput = document.getElementById('email-membro');
const senhaMembroInput = document.getElementById('senha-membro');
const membroForm = document.getElementById('membro-form');
const membroIdInput = document.getElementById('membro-id');
const nomeMembroInput = document.getElementById('nome-membro');
const matriculaMembroInput = document.getElementById('matricula-membro');
const equipeMembroSelect = document.getElementById('equipe-membro');
const tarefasMembroInput = document.getElementById('tarefas-membro');
const tarefasMembroBaloes = document.getElementById('tarefas-membro-baloes');
const municipioForm = document.getElementById('municipio-form');
const municipioIdInput = document.getElementById('municipio-id');
const nomeMunicipioInput = document.getElementById('nome-municipio');
const codigoIbgeInput = document.getElementById('codigo-ibge');
const salvarMunicipioBtn = document.getElementById('salvar-municipio-btn');
const cancelarMunicipioBtn = document.getElementById('cancelar-municipio-btn');
const municipiosContainer = document.getElementById('municipios-container');
const setorForm = document.getElementById('setor-form');
const setorIdInput = document.getElementById('setor-id');
const municipioSetorSelect = document.getElementById('municipio-setor');
const prefixoCodigoSetor = document.getElementById('prefixo-codigo-setor');
const sufixoCodigoSetorInput = document.getElementById('sufixo-codigo-setor');
const salvarSetorBtn = document.getElementById('salvar-setor-btn');
const cancelarSetorBtn = document.getElementById('cancelar-setor-btn');
const setoresContainer = document.getElementById('setores-container');
const salvarMembroBtn = document.getElementById('salvar-membro-btn');
const cancelarMembroBtn = document.getElementById('cancelar-membro-btn');
const membrosContainer = document.getElementById('membros-container');
const tarefaForm = document.getElementById('tarefa-form');
const tarefaIdInput = document.getElementById('tarefa-id');
const nomeTarefaInput = document.getElementById('nome-tarefa');
const camposTarefaContainer = document.getElementById('campos-tarefa-container');
const salvarTarefaBtn = document.getElementById('salvar-tarefa-btn');
const cancelarTarefaBtn = document.getElementById('cancelar-tarefa-btn');
const tarefasContainer = document.getElementById('tarefas-container');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const acompanhamentoListaContainer = document.getElementById('acompanhamento-lista-container');

let iniciadasLista, finalizadasLista, visualizarCamposContainer, voltarListaBtn, acompanhamentoListaView, visualizarCamposView;


// Botão de Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = '/login.html';
    }).catch((error) => {
        console.error('Erro ao fazer logout:', error);
    });
});

// Logout automático às 06:00 e 18:00
function checkAutoLogout() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    if ((hours === 6 && minutes === 0) || (hours === 18 && minutes === 0)) {
        auth.signOut().then(() => {
            window.location.href = '/login.html';
        }).catch((error) => {
            console.error('Erro no logout automático:', error);
        });
    }
}
setInterval(checkAutoLogout, 60000);




// Funções de gerenciamento de abas
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
        if (button.dataset.tab === 'acompanhamento') {
            renderizarAcompanhamento();
        } else if (button.dataset.tab === 'equipes') {
            atualizarListaEquipes();
        } else if (button.dataset.tab === 'membros') {
            atualizarListaMembros();
            atualizarEquipesSelect();
            inicializarTarefasMembro();
        } else if (button.dataset.tab === 'tarefas') {
            atualizarListaTarefas();
        } else if (button.dataset.tab === 'municipios') {
            atualizarListaMunicipios();
            atualizarMunicipiosSelect();
        } else if (button.dataset.tab === 'setores') {
            atualizarListaSetores();
            atualizarMunicipiosSelect();
        }
    });
});

// Funções para Equipes
async function adicionarEquipe(nome, descricao) {
    try {
        const equipeRef = await db.collection("equipes").add({
            nome,
            descricao,
            dataCriacao: new Date()
        });
        return equipeRef.id;
    } catch (e) {
        console.error("Erro ao adicionar equipe: ", e);
        throw e;
    }
}

async function listarEquipes() {
    try {
        const equipesSnapshot = await db.collection("equipes").get();
        const equipesLista = [];
        equipesSnapshot.forEach((doc) => {
            equipesLista.push({ id: doc.id, ...doc.data() });
        });
        return equipesLista;
    } catch (e) {
        console.error("Erro ao listar equipes: ", e);
        throw e;
    }
}

async function atualizarEquipe(id, dadosAtualizados) {
    try {
        await db.collection("equipes").doc(id).update(dadosAtualizados);
    } catch (e) {
        console.error("Erro ao atualizar equipe: ", e);
        throw e;
    }
}

async function removerEquipe(id) {
    try {
        await db.collection("equipes").doc(id).delete();
    } catch (e) {
        console.error("Erro ao remover equipe: ", e);
        throw e;
    }
}

function limparFormularioEquipe() {
    equipeForm.reset();
    equipeIdInput.value = '';
    salvarEquipeBtn.textContent = 'Salvar';
}

function preencherFormularioEquipe(equipe) {
    equipeIdInput.value = equipe.id;
    nomeEquipeInput.value = equipe.nome;
    descricaoEquipeInput.value = equipe.descricao || '';
    salvarEquipeBtn.textContent = 'Atualizar';
}

async function renderizarEquipes(equipes) {
    equipesContainer.innerHTML = '';
    if (equipes.length === 0) {
        equipesContainer.innerHTML = '<p>Nenhuma equipe encontrada.</p>';
        return;
    }
    const membros = await listarMembros();
    equipes.forEach(equipe => {
        const equipeCard = document.createElement('div');
        equipeCard.className = 'equipe-card';
        const equipeNome = document.createElement('h3');
        equipeNome.className = 'equipe-nome';
        equipeNome.textContent = equipe.nome;
        const equipeDescricao = document.createElement('p');
        equipeDescricao.className = 'equipe-descricao';
        equipeDescricao.textContent = equipe.descricao || 'Sem descrição';
        const equipeMembros = document.createElement('div');
        equipeMembros.className = 'equipe-membros';
        const membrosDaEquipe = membros.filter(m => m.equipeId === equipe.id);
        if (membrosDaEquipe.length > 0) {
            equipeMembros.innerHTML = '<h4>Membros:</h4>';
            membrosDaEquipe.forEach(membro => {
                const membroSpan = document.createElement('span');
                membroSpan.className = 'equipe-membro';
                membroSpan.textContent = membro.nome;
                equipeMembros.appendChild(membroSpan);
            });
        } else {
            equipeMembros.innerHTML = '<p>Equipe sem membros cadastrados.</p>';
        }
        const equipeAcoes = document.createElement('div');
        equipeAcoes.className = 'equipe-acoes';
        const editarBtn = document.createElement('button');
        editarBtn.className = 'editar-btn';
        editarBtn.textContent = 'Editar';
        editarBtn.addEventListener('click', () => preencherFormularioEquipe(equipe));
        const removerBtn = document.createElement('button');
        removerBtn.className = 'remover-btn';
        removerBtn.textContent = 'Remover';
        removerBtn.addEventListener('click', async () => {
            if (confirm(`Deseja remover a equipe "${equipe.nome}"?`)) {
                await removerEquipe(equipe.id);
                atualizarListaEquipes();
                inicializarTarefasMembro();
            }
        });
        equipeAcoes.appendChild(editarBtn);
        equipeAcoes.appendChild(removerBtn);
        equipeCard.appendChild(equipeNome);
        equipeCard.appendChild(equipeDescricao);
        equipeCard.appendChild(equipeMembros);
        equipeCard.appendChild(equipeAcoes);
        equipesContainer.appendChild(equipeCard);
    });
}

async function atualizarListaEquipes() {
    try {
        equipesContainer.innerHTML = ''; // Limpa o contêiner antes de renderizar
        const equipes = await listarEquipes();
        renderizarEquipes(equipes);
    } catch (error) {
        console.error('Erro ao atualizar lista de equipes:', error);
        alert('Erro ao carregar as equipes.');
    }
}

// Funções para Membros
async function adicionarMembro(nome, matricula, equipeId, tarefas, email, senha) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
        const uid = userCredential.user.uid;
        const membroRef = await db.collection("membros").add({
            nome,
            matricula,
            equipeId,
            tarefas,
            uid,
            dataCriacao: new Date()
        });
        return membroRef.id;
    } catch (e) {
        console.error("Erro ao adicionar membro: ", e);
        throw e;
    }
}

async function listarMembros() {
    try {
        const membrosSnapshot = await db.collection("membros").get();
        const membrosLista = [];
        membrosSnapshot.forEach((doc) => {
            membrosLista.push({ id: doc.id, ...doc.data() });
        });
        return membrosLista;
    } catch (e) {
        console.error("Erro ao listar membros: ", e);
        throw e;
    }
}

async function atualizarMembro(id, dadosAtualizados) {
    try {
        const dados = { ...dadosAtualizados };
        delete dados.uid; // Evita sobrescrever o uid
        await db.collection("membros").doc(id).update(dados);
    } catch (e) {
        console.error("Erro ao atualizar membro: ", e);
        throw e;
    }
}

async function removerMembro(id) {
    try {
        await db.collection("membros").doc(id).delete();
    } catch (e) {
        console.error("Erro ao remover membro: ", e);
        throw e;
    }
}

function limparFormularioMembro() {
    membroForm.reset();
    membroIdInput.value = '';
    tarefasMembroInput.value = '';
    emailMembroInput.value = '';
    senhaMembroInput.value = '';
    tarefasMembroBaloes.innerHTML = '';
    salvarMembroBtn.textContent = 'Salvar';
}

function preencherFormularioMembro(membro) {
    membroIdInput.value = membro.id;
    emailMembroInput.value = ''; // Não preenche e-mail
    emailMembroInput.disabled = true; // Desabilita e-mail
    senhaMembroInput.value = ''; // Não preenche senha
    senhaMembroInput.disabled = true; // Desabilita senha
    nomeMembroInput.value = membro.nome;
    matriculaMembroInput.value = membro.matricula;
    equipeMembroSelect.value = membro.equipeId;
    tarefasMembroInput.value = membro.tarefas ? membro.tarefas.join(',') : '';
    atualizarTarefasBaloes();
    salvarMembroBtn.textContent = 'Atualizar';
}

async function renderizarMembros(membros) {
    membrosContainer.innerHTML = '';
    if (membros.length === 0) {
        membrosContainer.innerHTML = '<p>Nenhum membro encontrado.</p>';
        return;
    }
    const equipes = await listarEquipes();
    const equipesMap = new Map(equipes.map(e => [e.id, e.nome]));
    const tarefas = await listarTarefas();
    const tarefasMap = new Map(tarefas.map(t => [t.id, t.nome]));
    membros.forEach(membro => {
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
        membroEquipe.innerHTML = `<h4>Equipe:</h4> ${equipesMap.get(membro.equipeId) || 'Sem equipe'}`;
        const membroTarefas = document.createElement('div');
        membroTarefas.className = 'membro-tarefas';
        membroTarefas.innerHTML = '<h4>Tarefas:</h4>';
        if (membro.tarefas && membro.tarefas.length > 0) {
            const baloesContainer = document.createElement('div');
            baloesContainer.className = 'tarefas-baloes';
            membro.tarefas.forEach(tarefaId => {
                const tarefaBalao = document.createElement('span');
                tarefaBalao.className = 'membro-tarefa';
                tarefaBalao.textContent = tarefasMap.get(tarefaId) || 'Tarefa não encontrada';
                baloesContainer.appendChild(tarefaBalao);
            });
            membroTarefas.appendChild(baloesContainer);
        } else {
            const semTarefas = document.createElement('p');
            semTarefas.textContent = 'Sem tarefas associadas.';
            membroTarefas.appendChild(semTarefas);
        }
        const membroAcoes = document.createElement('div');
        membroAcoes.className = 'membro-acoes';
        const editarBtn = document.createElement('button');
        editarBtn.className = 'editar-btn';
        editarBtn.textContent = 'Editar';
        editarBtn.addEventListener('click', () => preencherFormularioMembro(membro));
        const removerBtn = document.createElement('button');
        removerBtn.className = 'remover-btn';
        removerBtn.textContent = 'Remover';
        removerBtn.addEventListener('click', async () => {
            if (confirm(`Deseja remover o membro "${membro.nome}"?`)) {
                await removerMembro(membro.id);
                atualizarListaMembros();
            }
        });
        membroAcoes.appendChild(editarBtn);
        membroAcoes.appendChild(removerBtn);
        membroCard.appendChild(membroNome);
        membroCard.appendChild(membroDetalhes);
        membroCard.appendChild(membroEquipe);
        membroCard.appendChild(membroTarefas);
        membroCard.appendChild(membroAcoes);
        membrosContainer.appendChild(membroCard);
    });
}

async function atualizarListaMembros() {
    try {
        membrosContainer.innerHTML = ''; // Limpa o contêiner antes de renderizar
        const membros = await listarMembros();
        renderizarMembros(membros);
    } catch (error) {
        console.error('Erro ao atualizar lista de membros:', error);
        alert('Erro ao carregar os membros.');
    }
}

async function atualizarEquipesSelect() {
    const equipes = await listarEquipes();
    equipeMembroSelect.innerHTML = '<option value="">Selecione uma equipe</option>';
    equipes.forEach(equipe => {
        const option = document.createElement('option');
        option.value = equipe.id;
        option.textContent = equipe.nome;
        equipeMembroSelect.appendChild(option);
    });
}

async function inicializarTarefasMembro() {
    await atualizarTarefasBaloes();
}

async function atualizarTarefasBaloes() {
    tarefasMembroBaloes.innerHTML = '';
    const tarefas = await listarTarefas();
    let tarefasSelecionadas = tarefasMembroInput.value ? tarefasMembroInput.value.split(',').filter(id => id) : [];
    tarefas.forEach(tarefa => {
        const balao = document.createElement('span');
        balao.className = 'tarefa-balao';
        balao.textContent = tarefa.nome;
        balao.dataset.tarefaId = tarefa.id;
        if (tarefasSelecionadas.includes(tarefa.id)) {
            balao.classList.add('selecionado');
        }
        balao.addEventListener('click', () => {
            balao.classList.toggle('selecionado');
            if (balao.classList.contains('selecionado')) {
                tarefasSelecionadas.push(tarefa.id);
            } else {
                tarefasSelecionadas = tarefasSelecionadas.filter(id => id !== tarefa.id);
            }
            tarefasMembroInput.value = tarefasSelecionadas.join(',');
        });
        tarefasMembroBaloes.appendChild(balao);
    });
}

// Funções para Tarefas
async function adicionarTarefa(nome, campos) {
    try {
        const tarefaRef = await db.collection("tarefas").add({
            nome,
            campos,
            dataCriacao: new Date()
        });
        return tarefaRef.id;
    } catch (e) {
        console.error("Erro ao adicionar tarefa: ", e);
        throw e;
    }
}

async function listarTarefas() {
    try {
        const tarefasSnapshot = await db.collection("tarefas").get();
        const tarefasLista = [];
        tarefasSnapshot.forEach((doc) => {
            tarefasLista.push({ id: doc.id, ...doc.data() });
        });
        return tarefasLista;
    } catch (e) {
        console.error("Erro ao listar tarefas: ", e);
        throw e;
    }
}

async function atualizarTarefa(id, dadosAtualizados) {
    try {
        await db.collection("tarefas").doc(id).update(dadosAtualizados);
    } catch (e) {
        console.error("Erro ao atualizar tarefa: ", e);
        throw e;
    }
}

async function removerTarefa(id) {
    try {
        await db.collection("tarefas").doc(id).delete();
    } catch (e) {
        console.error("Erro ao remover tarefa: ", e);
        throw e;
    }
}

function adicionarCampoTarefa() {
    const campoDiv = document.createElement('div');
    campoDiv.className = 'campo-inputs';
    const campoInput = document.createElement('input');
    campoInput.type = 'text';
    campoInput.className = 'campo-input';
    campoInput.placeholder = 'Nome do campo';
    const ordemInput = document.createElement('input');
    ordemInput.type = 'number';
    ordemInput.className = 'ordem-input';
    ordemInput.placeholder = 'Ordem';
    ordemInput.min = '1';
    const valorInput = document.createElement('input');
    valorInput.type = 'text';
    valorInput.className = 'valor-input';
    valorInput.placeholder = 'Valor do campo';
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'add-campo-btn';
    addBtn.textContent = '+';
    addBtn.addEventListener('click', adicionarCampoTarefa);
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remover-btn';
    removeBtn.textContent = '-';
    removeBtn.addEventListener('click', () => campoDiv.remove());
    campoDiv.appendChild(campoInput);
    campoDiv.appendChild(ordemInput);
    campoDiv.appendChild(valorInput);
    campoDiv.appendChild(addBtn);
    campoDiv.appendChild(removeBtn);
    const ultimoCampoDiv = camposTarefaContainer.querySelector('.campo-inputs:last-child');
    if (ultimoCampoDiv) {
        const ultimoAddBtn = ultimoCampoDiv.querySelector('.add-campo-btn');
        if (ultimoAddBtn) {
            ultimoAddBtn.remove();
            ultimoCampoDiv.appendChild(removeBtn.cloneNode(true));
            ultimoCampoDiv.querySelector('.remover-btn').addEventListener('click', () => ultimoCampoDiv.remove());
        }
    }
    camposTarefaContainer.appendChild(campoDiv);
}

document.querySelector('#campos-tarefa-container .add-campo-btn').addEventListener('click', adicionarCampoTarefa);

function limparFormularioTarefa() {
    tarefaForm.reset();
    tarefaIdInput.value = '';
    const camposInputs = camposTarefaContainer.querySelectorAll('.campo-inputs');
    for (let i = 1; i < camposInputs.length; i++) camposInputs[i].remove();
    const primeiroCampoInput = camposTarefaContainer.querySelector('.campo-input');
    const primeiroOrdemInput = camposTarefaContainer.querySelector('.ordem-input');
    const primeiroValorInput = camposTarefaContainer.querySelector('.valor-input');
    if (primeiroCampoInput) primeiroCampoInput.value = '';
    if (primeiroOrdemInput) primeiroOrdemInput.value = '';
    if (primeiroValorInput) primeiroValorInput.value = '';
    salvarTarefaBtn.textContent = 'Salvar';
}

function preencherFormularioTarefa(tarefa) {
    tarefaIdInput.value = tarefa.id;
    nomeTarefaInput.value = tarefa.nome;
    const camposInputs = camposTarefaContainer.querySelectorAll('.campo-inputs');
    camposInputs.forEach(input => input.remove());
    if (tarefa.campos && Object.keys(tarefa.campos).length > 0) {
        Object.entries(tarefa.campos).forEach(([nomeCampo, campoData], index) => {
            const campoDiv = document.createElement('div');
            campoDiv.className = 'campo-inputs';
            const campoInput = document.createElement('input');
            campoInput.type = 'text';
            campoInput.className = 'campo-input';
            campoInput.value = nomeCampo;
            const ordemInput = document.createElement('input');
            ordemInput.type = 'number';
            ordemInput.className = 'ordem-input';
            ordemInput.value = campoData.ordem !== undefined ? campoData.ordem : '';
            ordemInput.min = '1';
            const valorInput = document.createElement('input');
            valorInput.type = 'text';
            valorInput.className = 'valor-input';
            valorInput.value = campoData.valor || '';
            campoDiv.appendChild(campoInput);
            campoDiv.appendChild(ordemInput);
            campoDiv.appendChild(valorInput);
            if (index === Object.keys(tarefa.campos).length - 1) {
                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.className = 'add-campo-btn';
                addBtn.textContent = '+';
                addBtn.addEventListener('click', adicionarCampoTarefa);
                campoDiv.appendChild(addBtn);
            } else {
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'remover-btn';
                removeBtn.textContent = '-';
                removeBtn.addEventListener('click', () => campoDiv.remove());
                campoDiv.appendChild(removeBtn);
            }
            camposTarefaContainer.appendChild(campoDiv);
        });
    } else {
        adicionarCampoTarefa();
    }
    salvarTarefaBtn.textContent = 'Atualizar';
}

async function renderizarTarefas(tarefas) {
    tarefasContainer.innerHTML = '';
    if (tarefas.length === 0) {
        tarefasContainer.innerHTML = '<p>Nenhuma tarefa encontrada.</p>';
        return;
    }
    tarefas.forEach(tarefa => {
        const tarefaCard = document.createElement('div');
        tarefaCard.className = 'tarefa-card';
        const tarefaNome = document.createElement('h3');
        tarefaNome.className = 'tarefa-nome';
        tarefaNome.textContent = tarefa.nome;
        const tarefaCampos = document.createElement('div');
        tarefaCampos.className = 'tarefa-campos';
        if (tarefa.campos && Object.keys(tarefa.campos).length > 0) {
            tarefaCampos.innerHTML = '<h4>Campos:</h4>';
            Object.entries(tarefa.campos).forEach(([nomeCampo, valorCampo]) => {
                const campoSpan = document.createElement('span');
                campoSpan.className = 'tarefa-campo';
                campoSpan.textContent = `${nomeCampo}: ${valorCampo}`;
                tarefaCampos.appendChild(campoSpan);
            });
        } else {
            tarefaCampos.innerHTML = '<p>Sem campos associados.</p>';
        }
        const tarefaAcoes = document.createElement('div');
        tarefaAcoes.className = 'tarefa-acoes';
        const editarBtn = document.createElement('button');
        editarBtn.className = 'editar-btn';
        editarBtn.textContent = 'Editar';
        editarBtn.addEventListener('click', () => preencherFormularioTarefa(tarefa));
        const removerBtn = document.createElement('button');
        removerBtn.className = 'remover-btn';
        removerBtn.textContent = 'Remover';
        removerBtn.addEventListener('click', async () => {
            if (confirm(`Deseja remover a tarefa "${tarefa.nome}"?`)) {
                await removerTarefa(tarefa.id);
                atualizarListaTarefas();
                inicializarTarefasMembro();
            }
        });
        tarefaAcoes.appendChild(editarBtn);
        tarefaAcoes.appendChild(removerBtn);
        tarefaCard.appendChild(tarefaNome);
        tarefaCard.appendChild(tarefaCampos);
        tarefaCard.appendChild(tarefaAcoes);
        tarefasContainer.appendChild(tarefaCard);
    });
}

async function adicionarMunicipio(nome, codigoIbge) {
    try {
        const municipioRef = await db.collection("municipios").add({
            nome,
            codigoIbge,
            dataCriacao: new Date()
        });
        return municipioRef.id;
    } catch (e) {
        console.error("Erro ao adicionar município: ", e);
        throw e;
    }
}

async function listarMunicipios() {
    try {
        const municipiosSnapshot = await db.collection("municipios").get();
        const municipiosLista = [];
        municipiosSnapshot.forEach((doc) => {
            municipiosLista.push({ id: doc.id, ...doc.data() });
        });
        return municipiosLista;
    } catch (e) {
        console.error("Erro ao listar municípios: ", e);
        throw e;
    }
}

async function atualizarMunicipio(id, dadosAtualizados) {
    try {
        await db.collection("municipios").doc(id).update(dadosAtualizados);
    } catch (e) {
        console.error("Erro ao atualizar município: ", e);
        throw e;
    }
}

async function removerMunicipio(id) {
    try {
        await db.collection("municipios").doc(id).delete();
    } catch (e) {
        console.error("Erro ao remover município: ", e);
        throw e;
    }
}

function limparFormularioMunicipio() {
    municipioForm.reset();
    municipioIdInput.value = '';
    salvarMunicipioBtn.textContent = 'Salvar';
}

function preencherFormularioMunicipio(municipio) {
    municipioIdInput.value = municipio.id;
    nomeMunicipioInput.value = municipio.nome;
    codigoIbgeInput.value = municipio.codigoIbge;
    salvarMunicipioBtn.textContent = 'Atualizar';
}

async function renderizarMunicipios(municipios) {
    municipiosContainer.innerHTML = '';
    if (municipios.length === 0) {
        municipiosContainer.innerHTML = '<p>Nenhum município encontrado.</p>';
        return;
    }
    municipios.forEach(municipio => {
        const municipioCard = document.createElement('div');
        municipioCard.className = 'municipio-card';
        const municipioNome = document.createElement('h3');
        municipioNome.className = 'municipio-nome';
        municipioNome.textContent = municipio.nome;
        const municipioCodigo = document.createElement('p');
        municipioCodigo.className = 'municipio-codigo';
        municipioCodigo.textContent = `Código IBGE: ${municipio.codigoIbge}`;
        const municipioAcoes = document.createElement('div');
        municipioAcoes.className = 'municipio-acoes';
        const editarBtn = document.createElement('button');
        editarBtn.className = 'editar-btn';
        editarBtn.textContent = 'Editar';
        editarBtn.addEventListener('click', () => preencherFormularioMunicipio(municipio));
        const removerBtn = document.createElement('button');
        removerBtn.className = 'remover-btn';
        removerBtn.textContent = 'Remover';
        removerBtn.addEventListener('click', async () => {
            if (confirm(`Deseja remover o município "${municipio.nome}"?`)) {
                await removerMunicipio(municipio.id);
                atualizarListaMunicipios();
                atualizarMunicipiosSelect();
            }
        });
        municipioAcoes.appendChild(editarBtn);
        municipioAcoes.appendChild(removerBtn);
        municipioCard.appendChild(municipioNome);
        municipioCard.appendChild(municipioCodigo);
        municipioCard.appendChild(municipioAcoes);
        municipiosContainer.appendChild(municipioCard);
    });
}

async function atualizarListaMunicipios() {
    try {
        municipiosContainer.innerHTML = '';
        const municipios = await listarMunicipios();
        renderizarMunicipios(municipios);
    } catch (error) {
        console.error('Erro ao atualizar lista de municípios:', error);
        alert('Erro ao carregar os municípios.');
    }
}

async function atualizarMunicipiosSelect() {
    const municipios = await listarMunicipios();
    municipioSetorSelect.innerHTML = '<option value="">Selecione um município</option>';
    municipios.forEach(municipio => {
        const option = document.createElement('option');
        option.value = municipio.id;
        option.dataset.codigoIbge = municipio.codigoIbge;
        option.textContent = municipio.nome;
        municipioSetorSelect.appendChild(option);
    });
}

async function adicionarSetor(municipioId, codigoSetor) {
    try {
        const setorRef = await db.collection("setores").add({
            municipioId,
            codigoSetor,
            dataCriacao: new Date()
        });
        return setorRef.id;
    } catch (e) {
        console.error("Erro ao adicionar setor: ", e);
        throw e;
    }
}

async function listarSetores() {
    try {
        const setoresSnapshot = await db.collection("setores").get();
        const setoresLista = [];
        setoresSnapshot.forEach((doc) => {
            setoresLista.push({ id: doc.id, ...doc.data() });
        });
        return setoresLista;
    } catch (e) {
        console.error("Erro ao listar setores: ", e);
        throw e;
    }
}

async function atualizarSetor(id, dadosAtualizados) {
    try {
        await db.collection("setores").doc(id).update(dadosAtualizados);
    } catch (e) {
        console.error("Erro ao atualizar setor: ", e);
        throw e;
    }
}

async function removerSetor(id) {
    try {
        await db.collection("setores").doc(id).delete();
    } catch (e) {
        console.error("Erro ao remover setor: ", e);
        throw e;
    }
}

function limparFormularioSetor() {
    setorForm.reset();
    setorIdInput.value = '';
    prefixoCodigoSetor.textContent = '';
    sufixoCodigoSetorInput.value = '';
    salvarSetorBtn.textContent = 'Salvar';
}

function preencherFormularioSetor(setor, municipios) {
    setorIdInput.value = setor.id;
    municipioSetorSelect.value = setor.municipioId;
    const municipioSelecionado = municipios.find(m => m.id === setor.municipioId);
    prefixoCodigoSetor.textContent = municipioSelecionado ? municipioSelecionado.codigoIbge : '';
    sufixoCodigoSetorInput.value = setor.codigoSetor.slice(7);
    salvarSetorBtn.textContent = 'Atualizar';
}

async function renderizarSetores(setores) {
    setoresContainer.innerHTML = '';
    if (setores.length === 0) {
        setoresContainer.innerHTML = '<p>Nenhum setor encontrado.</p>';
        return;
    }
    const municipios = await listarMunicipios();
    const municipiosMap = new Map(municipios.map(m => [m.id, m.nome]));
    setores.forEach(setor => {
        const setorCard = document.createElement('div');
        setorCard.className = 'setor-card';
        const setorCodigo = document.createElement('h3');
        setorCodigo.className = 'setor-codigo';
        setorCodigo.textContent = `Setor: ${setor.codigoSetor}`;
        const setorMunicipio = document.createElement('p');
        setorMunicipio.className = 'setor-municipio';
        setorMunicipio.textContent = `Município: ${municipiosMap.get(setor.municipioId) || 'Sem município'}`;
        const setorAcoes = document.createElement('div');
        setorAcoes.className = 'setor-acoes';
        const editarBtn = document.createElement('button');
        editarBtn.className = 'editar-btn';
        editarBtn.textContent = 'Editar';
        editarBtn.addEventListener('click', async () => {
            const municipios = await listarMunicipios();
            preencherFormularioSetor(setor, municipios);
        });
        const removerBtn = document.createElement('button');
        removerBtn.className = 'remover-btn';
        removerBtn.textContent = 'Remover';
        removerBtn.addEventListener('click', async () => {
            if (confirm(`Deseja remover o setor "${setor.codigoSetor}"?`)) {
                await removerSetor(setor.id);
                atualizarListaSetores();
            }
        });
        setorAcoes.appendChild(editarBtn);
        setorAcoes.appendChild(removerBtn);
        setorCard.appendChild(setorCodigo);
        setorCard.appendChild(setorMunicipio);
        setorCard.appendChild(setorAcoes);
        setoresContainer.appendChild(setorCard);
    });
}

async function atualizarListaSetores() {
    try {
        setoresContainer.innerHTML = '';
        const setores = await listarSetores();
        renderizarSetores(setores);
    } catch (error) {
        console.error('Erro ao atualizar lista de setores:', error);
        alert('Erro ao carregar os setores.');
    }
}

// Função para renderizar tarefas iniciadas (Aba Acompanhamento)
async function renderizarAcompanhamento() {
    if (!iniciadasLista || !finalizadasLista) {
        console.error('Elementos iniciadasLista ou finalizadasLista não encontrados.');
        return;
    }
    iniciadasLista.innerHTML = '';
    finalizadasLista.innerHTML = '';
    try {
        const logsSnapshot = await db.collection('tarefa_logs')
            .where('acao', '==', 'iniciar')
            .orderBy('dataInicio', 'desc')
            .get();
        if (logsSnapshot.empty) {
            iniciadasLista.innerHTML = '<p>Nenhuma tarefa iniciada.</p>';
            finalizadasLista.innerHTML = '<p>Nenhuma tarefa finalizada.</p>';
            return;
        }

        const membrosSnapshot = await db.collection('membros').get();
        const membrosMap = {};
        membrosSnapshot.forEach(doc => {
            const membro = doc.data();
            membrosMap[membro.uid] = membro.nome;
        });

        const iniciadasContainer = document.createElement('div');
        iniciadasContainer.className = 'tarefas-container';
        const finalizadasContainer = document.createElement('div');
        finalizadasContainer.className = 'tarefas-container';
        let hasIniciadas = false;
        let hasFinalizadas = false;

        for (const doc of logsSnapshot.docs) {
            const log = { id: doc.id, ...doc.data() };
            const tarefaDoc = await db.collection('tarefas').doc(log.tarefaId).get();
            if (!tarefaDoc.exists) {
                console.warn('Tarefa não encontrada para log:', log.id);
                continue;
            }
            const tarefa = { id: tarefaDoc.id, ...tarefaDoc.data() };
            const tarefaCard = document.createElement('div');
            tarefaCard.className = 'tarefa-card';
            
            const membroNome = membrosMap[log.membroId] || log.membroEmail || 'Desconhecido';
            const dataInicio = log.dataInicio && typeof log.dataInicio.toDate === 'function'
                ? log.dataInicio.toDate().toLocaleDateString('pt-BR')
                : 'Data não disponível';
            
            // Buscar última modificação
            let ultimaAtualizacao = 'Nenhuma modificação registrada';
            try {
                const modSnapshot = await db.collection('tarefa_log_modifications')
                    .where('logId', '==', log.id)
                    .orderBy('timestamp', 'desc')
                    .limit(1)
                    .get();
                if (!modSnapshot.empty) {
                    const mod = modSnapshot.docs[0].data();
                    const timestamp = mod.timestamp && typeof mod.timestamp.toDate === 'function'
                        ? mod.timestamp.toDate().toLocaleString('pt-BR')
                        : 'Data não disponível';
                    let camposText = '';
                    if (mod.changedFields && Object.keys(mod.changedFields).length > 0) {
                        camposText = Object.entries(mod.changedFields)
                            .map(([key, value]) => `${key}: "${value}"`)
                            .join(', ');
                    }
                    ultimaAtualizacao = `${timestamp} - ${camposText}${camposText ? ', ' : ''}Status: ${mod.status}`;
                }
            } catch (error) {
                console.error('Erro ao buscar última modificação:', error);
            }

            tarefaCard.innerHTML = `
                <h3 class="tarefa-nome">${log.tarefaNome}</h3>
                <p class="tarefa-detalhes">Membro: ${membroNome}</p>
                <p class="tarefa-detalhes">Data de Início: ${dataInicio}</p>
                <p class="tarefa-detalhes">Status: ${log.status || 'Iniciado'}</p>
                <p class="tarefa-detalhes">Última atualização: ${ultimaAtualizacao}</p>
            `;
            
            const visualizarBtn = document.createElement('button');
            visualizarBtn.className = 'visualizar-btn';
            visualizarBtn.textContent = 'Visualizar Campos';
            visualizarBtn.addEventListener('click', () => {
                renderizarVisualizarCampos(log, tarefa);
                acompanhamentoListaView.classList.remove('active');
                visualizarCamposView.classList.add('active');
            });
            
            tarefaCard.appendChild(visualizarBtn);
            if (log.status === 'Finalizada') {
                finalizadasContainer.appendChild(tarefaCard);
                hasFinalizadas = true;
            } else {
                iniciadasContainer.appendChild(tarefaCard);
                hasIniciadas = true;
            }
        }

        iniciadasLista.appendChild(iniciadasContainer);
        finalizadasLista.appendChild(finalizadasContainer);
        if (!hasIniciadas) iniciadasLista.innerHTML = '<p>Nenhuma tarefa iniciada.</p>';
        if (!hasFinalizadas) finalizadasLista.innerHTML = '<p>Nenhuma tarefa finalizada.</p>';
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        iniciadasLista.innerHTML = '<p>Erro ao carregar tarefas iniciadas.</p>';
        finalizadasLista.innerHTML = '<p>Erro ao carregar tarefas finalizadas.</p>';
    }
}

// Função para renderizar visualização de campos (read-only)

async function buscarOpcoesPreCadastradas() {
    const municipiosSnapshot = await db.collection('municipios').get();
    const membrosSnapshot = await db.collection('membros').get();
    return {
        municipios: municipiosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        membros: membrosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
}

async function buscarSetoresPorMunicipio(municipioId) {
    if (!municipioId) return [];
    const setoresSnapshot = await db.collection('setores')
        .where('municipioId', '==', municipioId)
        .get();
    return setoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function renderizarVisualizarCampos(log, tarefa) {
    visualizarCamposContainer.innerHTML = '';
    const visualizarCard = document.createElement('div');
    visualizarCard.className = 'visualizar-card';
    
    const visualizarTitulo = document.createElement('h3');
    visualizarTitulo.className = 'visualizar-titulo';
    visualizarTitulo.textContent = `Campos: ${log.tarefaNome}`;
    
    const camposContainer = document.createElement('div');
    camposContainer.className = 'campos-container';
    
    const logCampos = log.campos || {};
    console.log('Visualizando campos para log:', log.id, 'tarefa:', tarefa.id, 'campos:', logCampos);
    
    if (!tarefa || !tarefa.campos || Object.keys(tarefa.campos).length === 0) {
        console.warn('Nenhum campo válido para tarefa:', tarefa?.id);
        camposContainer.innerHTML = '<p>Nenhum campo preenchido.</p>';
    } else {
        const camposOrdenados = Object.entries(tarefa.campos)
            .sort((a, b) => {
                const ordemA = a[1].ordem !== undefined ? a[1].ordem : 999;
                const ordemB = b[1].ordem !== undefined ? b[1].ordem : 999;
                if (ordemA === ordemB) return a[0].localeCompare(b[0]);
                return ordemA - ordemB;
            });
        camposOrdenados.forEach(([nomeCampo]) => {
            const campoDiv = document.createElement('div');
            campoDiv.className = 'campo-view';
            const valor = logCampos[nomeCampo] || 'Não preenchido';
            campoDiv.innerHTML = `<span class="campo-label">${nomeCampo}:</span> <span class="campo-valor">${valor}</span>`;
            camposContainer.appendChild(campoDiv);
        });
    }
    
    // Histórico de Modificações
    const historicoTitulo = document.createElement('h3');
    historicoTitulo.className = 'historico-titulo';
    historicoTitulo.textContent = 'Histórico de Modificações';
    
    const historicoContainer = document.createElement('div');
    historicoContainer.className = 'historico-container';
    
    try {
        const modificacoesSnapshot = await db.collection('tarefa_log_modifications')
            .where('logId', '==', log.id)
            .orderBy('timestamp', 'asc')
            .get();
        if (modificacoesSnapshot.empty) {
            historicoContainer.innerHTML = '<p>Nenhuma modificação registrada.</p>';
        } else {
            modificacoesSnapshot.forEach(doc => {
                const mod = doc.data();
                const modItem = document.createElement('div');
                modItem.className = 'historico-item';
                const timestamp = mod.timestamp && typeof mod.timestamp.toDate === 'function'
                    ? mod.timestamp.toDate().toLocaleString('pt-BR')
                    : 'Data não disponível';
                let camposText = '';
                if (mod.changedFields && Object.keys(mod.changedFields).length > 0) {
                    camposText = Object.entries(mod.changedFields)
                        .map(([key, value]) => `${key}: "${value}"`)
                        .join(', ');
                }
                modItem.textContent = `${timestamp} - ${camposText}${camposText ? ', ' : ''}Status: ${mod.status}`;
                historicoContainer.appendChild(modItem);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        historicoContainer.innerHTML = '<p>Erro ao carregar histórico.</p>';
    }
    
    visualizarCard.appendChild(visualizarTitulo);
    visualizarCard.appendChild(camposContainer);
    visualizarCard.appendChild(historicoTitulo);
    visualizarCard.appendChild(historicoContainer);
    visualizarCamposContainer.appendChild(visualizarCard);
}

// Estilos adicionais para os cards (injetados via JS para evitar alterar CSS manualmente)
const estilosCards = `
    .municipio-card, .setor-card {
        border: 2px solid #34495e;
        border-radius: 12px;
        padding: 1.5rem;
        background: #ffffff;
        transition: box-shadow 0.2s ease;
    }
    .municipio-card:hover, .setor-card:hover {
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
    }
    .municipio-nome, .setor-codigo {
        font-size: 1.25rem;
        color: #34495e;
        font-weight: 500;
        margin-bottom: 0.75rem;
    }
    .municipio-codigo, .setor-municipio {
        margin-bottom: 1rem;
        color: #7f8c8d;
        font-size: 0.95rem;
    }
    .municipio-acoes, .setor-acoes {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
    }
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = estilosCards;
document.head.appendChild(styleSheet);

async function atualizarListaTarefas() {
    try {
        const tarefas = await listarTarefas();
        renderizarTarefas(tarefas);
    } catch (error) {
        console.error('Erro ao atualizar lista de tarefas:', error);
        alert('Erro ao carregar as tarefas.');
    }
}

// Event Listeners
equipeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = nomeEquipeInput.value.trim();
    const descricao = descricaoEquipeInput.value.trim();
    try {
        const id = equipeIdInput.value;
        if (id) {
            await atualizarEquipe(id, { nome, descricao });
            alert('Equipe atualizada com sucesso!');
        } else {
            await adicionarEquipe(nome, descricao);
            alert('Equipe adicionada com sucesso!');
        }
        limparFormularioEquipe();
        atualizarListaEquipes();
        atualizarEquipesSelect();
    } catch (error) {
        console.error('Erro ao salvar equipe:', error);
        alert('Erro ao salvar a equipe.');
    }
});

cancelarEquipeBtn.addEventListener('click', limparFormularioEquipe);

membroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailMembroInput.value.trim();
    const senha = senhaMembroInput.value.trim();
    const nome = nomeMembroInput.value.trim();
    const matricula = matriculaMembroInput.value.trim();
    const equipeId = equipeMembroSelect.value;
    const tarefas = tarefasMembroInput.value ? tarefasMembroInput.value.split(',').filter(id => id) : [];
    try {
        const id = membroIdInput.value;
        if (id) {
            await atualizarMembro(id, { nome, matricula, equipeId, tarefas });
            alert('Membro atualizado com sucesso!');
        } else {
            if (senha.length < 6) {
                alert('A senha deve ter no mínimo 6 caracteres.');
                return;
            }
            await adicionarMembro(nome, matricula, equipeId, tarefas, email, senha);
            alert('Membro adicionado com sucesso!');
        }
        limparFormularioMembro();
        atualizarListaMembros();
    } catch (error) {
        console.error('Erro ao salvar membro:', error);
        alert('Erro ao salvar o membro: ' + error.message);
    }
});

cancelarMembroBtn.addEventListener('click', () => {
    limparFormularioMembro();
    emailMembroInput.disabled = false;
    senhaMembroInput.disabled = false;
});

tarefaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = nomeTarefaInput.value.trim();
    const camposInputs = camposTarefaContainer.querySelectorAll('.campo-inputs');
    const campos = {};
    camposInputs.forEach(campoDiv => {
        const nomeCampo = campoDiv.querySelector('.campo-input').value.trim();
        const valorCampo = campoDiv.querySelector('.valor-input').value.trim();
        const ordemCampo = campoDiv.querySelector('.ordem-input').value.trim();
        if (nomeCampo) {
            campos[nomeCampo] = {
                valor: valorCampo,
                ordem: ordemCampo ? parseInt(ordemCampo) : 999
            };
        }
    });
    try {
        const id = tarefaIdInput.value;
        if (id) {
            await atualizarTarefa(id, { nome, campos });
            alert('Tarefa atualizada com sucesso!');
        } else {
            await adicionarTarefa(nome, campos);
            alert('Tarefa adicionada com sucesso!');
        }
        limparFormularioTarefa();
        atualizarListaTarefas();
        inicializarTarefasMembro();
    } catch (error) {
        console.error('Erro ao salvar tarefa:', error);
        alert('Erro ao salvar a tarefa.');
    }
});



cancelarTarefaBtn.addEventListener('click', limparFormularioTarefa);


municipioForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = nomeMunicipioInput.value.trim();
    const codigoIbge = codigoIbgeInput.value.trim();
    if (!/^\d{7}$/.test(codigoIbge)) {
        alert('O Código IBGE deve conter exatamente 7 dígitos.');
        return;
    }
    try {
        const id = municipioIdInput.value;
        if (id) {
            await atualizarMunicipio(id, { nome, codigoIbge });
            alert('Município atualizado com sucesso!');
        } else {
            await adicionarMunicipio(nome, codigoIbge);
            alert('Município adicionado com sucesso!');
        }
        limparFormularioMunicipio();
        atualizarListaMunicipios();
        atualizarMunicipiosSelect();
    } catch (error) {
        console.error('Erro ao salvar município:', error);
        alert('Erro ao salvar o município.');
    }
});

cancelarMunicipioBtn.addEventListener('click', limparFormularioMunicipio);

municipioSetorSelect.addEventListener('change', () => {
    const selectedOption = municipioSetorSelect.selectedOptions[0];
    prefixoCodigoSetor.textContent = selectedOption && selectedOption.dataset.codigoIbge ? selectedOption.dataset.codigoIbge : '';
    sufixoCodigoSetorInput.value = '';
});

setorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const municipioId = municipioSetorSelect.value;
    const sufixo = sufixoCodigoSetorInput.value.trim();
    if (!municipioId) {
        alert('Selecione um município.');
        return;
    }
    if (!/^\d{8}$/.test(sufixo)) {
        alert('O sufixo do Código do Setor deve conter exatamente 8 dígitos.');
        return;
    }
    const codigoIbge = municipioSetorSelect.selectedOptions[0].dataset.codigoIbge;
    const codigoSetor = codigoIbge + sufixo;
    try {
        const id = setorIdInput.value;
        if (id) {
            await atualizarSetor(id, { municipioId, codigoSetor });
            alert('Setor atualizado com sucesso!');
        } else {
            await adicionarSetor(municipioId, codigoSetor);
            alert('Setor adicionado com sucesso!');
        }
        limparFormularioSetor();
        atualizarListaSetores();
    } catch (error) {
        console.error('Erro ao salvar setor:', error);
        alert('Erro ao salvar o setor.');
    }
});

cancelarSetorBtn.addEventListener('click', limparFormularioSetor);


// Replace lines 1029-1040 with:
document.addEventListener('DOMContentLoaded', () => {
    let authCheckTimeout = null;
    const adminEmails = ['marcelo.argenta.pf@gmail.com', 'cintia.tusset@ibge.gov.br']; // Add second admin email here
    const unsubscribe = auth.onAuthStateChanged((user) => {
        iniciadasLista = document.getElementById('iniciadas-lista');
    finalizadasLista = document.getElementById('finalizadas-lista');
    visualizarCamposContainer = document.getElementById('visualizar-campos-container');
    voltarListaBtn = document.getElementById('voltar-lista-btn');
    acompanhamentoListaView = document.getElementById('acompanhamento-lista');
    visualizarCamposView = document.getElementById('visualizar-campos');

    if (!voltarListaBtn || !acompanhamentoListaView || !visualizarCamposView) {
        console.error('Elementos DOM não encontrados:', {
            voltarListaBtn: !!voltarListaBtn,
            acompanhamentoListaView: !!acompanhamentoListaView,
            visualizarCamposView: !!visualizarCamposView
        });
        return;
    }

    voltarListaBtn.addEventListener('click', () => {
        console.log('Botão Voltar clicado');
        visualizarCamposView.classList.remove('active');
        acompanhamentoListaView.classList.add('active');
        console.log('Classes após toggle:', {
            visualizarCampos: visualizarCamposView.classList.value,
            acompanhamentoLista: acompanhamentoListaView.classList.value
        });
        renderizarAcompanhamento();
    });

    let authCheckTimeout = null;
        // Log auth state to sessionStorage
        sessionStorage.setItem('authLog', JSON.stringify({
            timestamp: new Date().toISOString(),
            page: 'index.html',
            user: user ? user.uid : null,
            action: 'onAuthStateChanged triggered'
        }));

        if (user) {
            // Check if user is admin
            if (adminEmails.includes(user.email)) {
                console.log('Admin autenticado em index.html, carregando dados');
                sessionStorage.setItem('authLog', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    page: 'index.html',
                    user: user.uid,
                    action: 'Admin authenticated, loading data'
                }));
                clearTimeout(authCheckTimeout);
                atualizarListaEquipes();
                atualizarListaMembros();
                atualizarListaTarefas();
                atualizarListaMunicipios();
                atualizarListaSetores();
                atualizarEquipesSelect();
                inicializarTarefasMembro();
                atualizarMunicipiosSelect();
                renderizarAcompanhamento();
                unsubscribe(); // Stop listening after success
            } else {
                console.log('Usuário não-admin tentou acessar index.html, redirecionando para membro.html');
                sessionStorage.setItem('authLog', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    page: 'index.html',
                    user: user.uid,
                    action: 'Non-admin user, redirecting to membro.html'
                }));
                window.location.href = '/membro.html';
            }
        } else {
            // Delay redirect to allow auth state to stabilize
            authCheckTimeout = setTimeout(() => {
                if (!auth.currentUser && window.location.pathname !== '/login.html') {
                    console.log('Nenhum usuário autenticado em index.html após espera, redirecionando para login.html');
                    sessionStorage.setItem('authLog', JSON.stringify({
                        timestamp: new Date().toISOString(),
                        page: 'index.html',
                        user: null,
                        action: 'No user after delay, redirecting to login.html'
                    }));
                    sessionStorage.setItem('redirectUrl', '/index.html');
                    window.location.href = '/login.html';
                }
            }, 1000); // Wait 1 second for auth state
        }
    });
});