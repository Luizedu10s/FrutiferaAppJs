
// DICIONARIO QUE VAI ARMAZENAR MÉTODOS DE GERENCIAMENTO DAS FRUTEIRAS
var GerenciadorFruteiras = {
    chaveStorage: 'fruteria-brejeira', // CHAVE DO LOCALSTORAGE
    gerarIdentificador: function() { // GERAR ID ÚNICO DA FRUTA
        return Date.now();
    },
    obterTodas: function() { // OBTER TODAS AS FRUTEIRAS
        var dados = localStorage.getItem(this.chaveStorage);
        if (dados) {
            return JSON.parse(dados);
        }
        return [];
    }, // SALVAR FRUTEIRA
    salvar: function(fruteira) {
        var lista = this.obterTodas();
        if (fruteira.id) {
            for (var i = 0; i < lista.length; i++) {
                if (lista[i].id == fruteira.id) {
                    lista[i] = fruteira;
                    break;
                }
            }
        } else { // CASO NÃO TENHA ID, É UMA NOVA FRUTEIRA
            fruteira.id = this.gerarIdentificador();
            lista.push(fruteira);
        } // ATUALIZA O LOCALSTORAGE
        localStorage.setItem(this.chaveStorage, JSON.stringify(lista));
        return fruteira;
    },// REMOVER FRUTEIRA
    remover: function(id) {
        var lista = this.obterTodas();
        var novaLista = [];
        for (var i = 0; i < lista.length; i++) {
            if (lista[i].id != id) {
                novaLista.push(lista[i]);
            }
        } // ATUALIZA O LOCALSTORAGE
        localStorage.setItem(this.chaveStorage, JSON.stringify(novaLista));
    }, // BUSCAR FRUTEIRA POR ID
    buscarPorId: function(id) {
        var lista = this.obterTodas();
        for (var i = 0; i < lista.length; i++) {
            if (lista[i].id == id) {
                return lista[i];
            }
        } // SE ELE NÃO ENCONTRAR, RETORNA NULO
        return null;
    }, // CALCULA A IDADE EM MESES
        idadeEmMeses: function(dataPlantio) {
        var hoje = new Date();
        var data = new Date(dataPlantio);
        var anos = hoje.getFullYear() - data.getFullYear(); // CALCULA A DIFERENÇA DE ANOS
        var meses = hoje.getMonth() - data.getMonth(); // CALCULA A DIFERENÇA DE MESES
        var totalMeses = anos * 12 + meses; 
        return totalMeses >= 0 ? totalMeses : 0; // RETORNA O VALOR EM MESES E NÃO RETORNA NEGATIVO
    },// COLOCA A DATA PARA O PADRÃO BRASILEIRO
    formatarData: function(dataStr) {
        var data = new Date(dataStr);
        return data.toLocaleDateString('pt-BR');
    }
};
//  CONTROLE DA INTERAÇÃO COM O USUÁRIO
var ControleUI = {
    elementos: { // CAPTURA OS ELEMENTOS DA PÁGINA
        container: document.getElementById('container-das-plantas'),
        formulario: document.getElementById('formulario-da-planta'),
        modal: document.getElementById('plantModal'),
        alerta: document.getElementById('nao-ha-plantas'),
        botaoSalvar: document.getElementById('salvar-item-planta')
    },
    idEdicao: null,
    iniciar: function() {
        this.listarFruteiras(); // LISTA AS FRUTEIRAS AO INICIAR
        this.configurarEventos(); // CONFIGURA OS EVENTOS
    },
    configurarEventos: function() {
        var self = this; 
        this.elementos.botaoSalvar.addEventListener('click', function() { // ADICIONA EVENTO AO BOTÃO DE SALVAR
            self.salvarFruteira(); // SALVA A FRUTEIRA
        }); 
        this.elementos.modal.addEventListener('hidden.bs.modal', function() { // LIMPA O FORMULÁRIO QUANDO O MODAL FOR FECHADO
            self.elementos.formulario.reset();
            document.getElementById('identificador-da-planta').value = '';
            self.idEdicao = null;
        });
    }, // CAPTURA E SALVA AS INFORMAÇÕES DA FRUTEIRA
    salvarFruteira: function() {
        var nomePopular = document.getElementById('nome-popular').value.trim();
        var nomeCientifico = document.getElementById('nome-na-ciencia').value.trim();
        var producaoMedia = document.getElementById('media-kg-producao').value;
        var dataPlantio = document.getElementById('data-de-plantio').value;
        var idFruteira = document.getElementById('identificador-da-planta').value;
        if (!nomePopular || !producaoMedia || !dataPlantio) {
            alert('Preencha todos os campos obrigatórios.'); // TRATA OS CAMPOS OBRIGATÓRIOS
            return;
        }
        if (isNaN(parseFloat(producaoMedia)) || parseFloat(producaoMedia) < 0) {
            alert('Produção média deve ser positiva.'); // TRATA O VALOR EM PRODUÇÃO
            return;
        } // CRIA UM OBJETO CHAMADO FRUTEIRA
        var fruteira = {
            id: idFruteira || null,
            nomePopular: nomePopular,
            nomeCientifico: nomeCientifico,
            producaoMedia: parseFloat(producaoMedia),
            dataPlantio: dataPlantio
        };
        GerenciadorFruteiras.salvar(fruteira); // SALVA A FRUTEIRA
        this.listarFruteiras();
        var modal = bootstrap.Modal.getInstance(this.elementos.modal); 
        modal.hide(); // FECHA O MODAL

    }, // CAPTURA AS INFORMAÇÕES DA FRUTEIRA PARA EDIÇÃO
    editarFruteira: function(id) {
        var fruteira = GerenciadorFruteiras.buscarPorId(id);
        if (!fruteira) return; // SE NÃO ENCONTRAR FRUTEIRA, SAI DA FUNÇÃO
        document.getElementById('identificador-da-planta').value = fruteira.id;
        document.getElementById('nome-popular').value = fruteira.nomePopular;
        document.getElementById('nome-na-ciencia').value = fruteira.nomeCientifico;
        document.getElementById('media-kg-producao').value = fruteira.producaoMedia;
        document.getElementById('data-de-plantio').value = fruteira.dataPlantio;
        this.idEdicao = fruteira.id;
        var modal = new bootstrap.Modal(this.elementos.modal);
        modal.show();
    }, // EXCLUI A FRUTEIRA
    excluirFruteira: function(id) {
        if (confirm('Deseja realmente excluir esta fruteira?')) {
            GerenciadorFruteiras.remover(id);
            this.listarFruteiras();
        }
    }, // LISTA AS FRUTEIRAS NA TELA
    listarFruteiras: function() {
        var lista = GerenciadorFruteiras.obterTodas();
        this.elementos.container.innerHTML = '';
        if (lista.length === 0) {
            this.elementos.alerta.classList.remove('d-none');
            return;
        }
        this.elementos.alerta.classList.add('d-none');

        // CAPTURA OS DADOS DE CADA FRUTEIRA E CRIA OS CARDS PARA CADA UMA.
        for (var i = 0; i < lista.length; i++) {
            var fruteira = lista[i];
            var idade = GerenciadorFruteiras.idadeEmMeses(fruteira.dataPlantio);
            var dataFormatada = GerenciadorFruteiras.formatarData(fruteira.dataPlantio);
            var card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4';
            card.innerHTML = '<div class="card h-100">' +
                '<div class="card-body">' +
                '<div class="d-flex justify-content-between align-items-center mb-2">' +
                '<h5 class="card-title">' + fruteira.nomePopular + '</h5>' +
                '<span class="badge bg-success age-badge">' + idade + ' meses</span>' +
                '</div>' +
                '<p class="card-text"><strong>Plantio:</strong> ' + dataFormatada + '<br>' +
                '<strong>Produção média:</strong> ' + fruteira.producaoMedia + ' Kg/safra</p>' +
                '<h6 class="card-subtitle mb-2 text-muted">' + (fruteira.nomeCientifico || 'Nome científico não informado') + '</h6>' +
                '</div>' +
                '<div class="card-footer bg-transparent d-flex justify-content-between align-items-center">' +
                '<small class="text-muted">ID: ' + String(fruteira.id).slice(-8) + '</small>' +
                '<div>' +
                '<button class="btn btn-sm btn-outline-primary me-2" title="Editar" onclick="ControleUI.editarFruteira(\'' + fruteira.id + '\')"><i class="bi bi-pencil"></i> Editar</button>' +
                '<button class="btn btn-sm btn-outline-danger" title="Excluir" onclick="ControleUI.excluirFruteira(\'' + fruteira.id + '\')"><i class="bi bi-trash"></i> Excluir</button>' +
                '</div>' +
                '</div>' +
                '</div>';
            this.elementos.container.appendChild(card); // ADICIONA O CARD NO CONTAINER
        }
    }
};

// Adiciona ícones do Bootstrap Icons
function adicionarBootstrapIcons() {
    if (!document.getElementById('bootstrap-icons')) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css';
        link.id = 'bootstrap-icons';
        document.head.appendChild(link);
    }
} // INICIA O CONTROLE DA UI QUANDO O DOM ESTIVER CARREGADO
document.addEventListener('DOMContentLoaded', function() {
    adicionarBootstrapIcons();
    ControleUI.iniciar();
});
