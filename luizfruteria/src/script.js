var GerenciadorFruteiras = {
    chaveStorage: 'fruteria-brejeira',
    gerarIdentificador: function() {
        return Math.floor(Date.now() / 100) + Math.floor(Math.random() * 9000);
    },
    obterTodas: function() {
        var dados = localStorage.getItem(this.chaveStorage);
        if (dados) {
            return JSON.parse(dados);
        }
        return [];
    },
    salvar: function(fruteira) {
        var lista = this.obterTodas();
        if (fruteira.id) {
            for (var i = 0; i < lista.length; i++) {
                if (lista[i].id == fruteira.id) {
                    lista[i] = fruteira;
                    break;
                }
            }
        } else {
            fruteira.id = this.gerarIdentificador();
            lista.push(fruteira);
        }
        localStorage.setItem(this.chaveStorage, JSON.stringify(lista));
        return fruteira;
    },
    remover: function(id) {
        var lista = this.obterTodas();
        var novaLista = [];
        for (var i = 0; i < lista.length; i++) {
            if (lista[i].id != id) {
                novaLista.push(lista[i]);
            }
        }
        localStorage.setItem(this.chaveStorage, JSON.stringify(novaLista));
    },
    buscarPorId: function(id) {
        var lista = this.obterTodas();
        for (var i = 0; i < lista.length; i++) {
            if (lista[i].id == id) {
                return lista[i];
            }
        }
        return null;
    },
    idadeEmMeses: function(dataPlantio) {
        var hoje = new Date();
        var data = new Date(dataPlantio);
        var tempo = hoje - data;
        var meses = Math.floor(tempo / (1000 * 60 * 60 * 24 * 30));
        return meses >= 0 ? meses : 0;
    },
    formatarData: function(dataStr) {
        var data = new Date(dataStr);
        return data.toLocaleDateString('pt-BR');
    }
};

var ControleUI = {
    elementos: {
        container: document.getElementById('plants-container'),
        formulario: document.getElementById('plant-form'),
        modal: document.getElementById('plantModal'),
        alerta: document.getElementById('no-plants-alert'),
        botaoSalvar: document.getElementById('save-plant')
    },
    idEdicao: null,
    iniciar: function() {
        this.listarFruteiras();
        this.configurarEventos();
    },
    configurarEventos: function() {
        var self = this;
        this.elementos.botaoSalvar.addEventListener('click', function() {
            self.salvarFruteira();
        });
        this.elementos.modal.addEventListener('hidden.bs.modal', function() {
            self.elementos.formulario.reset();
            document.getElementById('plant-id').value = '';
            self.idEdicao = null;
        });
    },
    salvarFruteira: function() {
        var nomePopular = document.getElementById('common-name').value.trim();
        var nomeCientifico = document.getElementById('scientific-name').value.trim();
        var producaoMedia = document.getElementById('average-production').value;
        var dataPlantio = document.getElementById('planting-date').value;
        var idFruteira = document.getElementById('plant-id').value;
        if (!nomePopular || !producaoMedia || !dataPlantio) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }
        if (isNaN(parseFloat(producaoMedia)) || parseFloat(producaoMedia) < 0) {
            alert('Produção média deve ser positiva.');
            return;
        }
        var fruteira = {
            id: idFruteira || null,
            nomePopular: nomePopular,
            nomeCientifico: nomeCientifico,
            producaoMedia: parseFloat(producaoMedia),
            dataPlantio: dataPlantio
        };
        GerenciadorFruteiras.salvar(fruteira);
        this.listarFruteiras();
        var modal = bootstrap.Modal.getInstance(this.elementos.modal);
        modal.hide();
    },
    editarFruteira: function(id) {
        var fruteira = GerenciadorFruteiras.buscarPorId(id);
        if (!fruteira) return;
        document.getElementById('plant-id').value = fruteira.id;
        document.getElementById('common-name').value = fruteira.nomePopular;
        document.getElementById('scientific-name').value = fruteira.nomeCientifico;
        document.getElementById('average-production').value = fruteira.producaoMedia;
        document.getElementById('planting-date').value = fruteira.dataPlantio;
        this.idEdicao = fruteira.id;
        var modal = new bootstrap.Modal(this.elementos.modal);
        modal.show();
    },
    excluirFruteira: function(id) {
        if (confirm('Deseja realmente excluir esta fruteira?')) {
            GerenciadorFruteiras.remover(id);
            this.listarFruteiras();
        }
    },
    listarFruteiras: function() {
        var lista = GerenciadorFruteiras.obterTodas();
        this.elementos.container.innerHTML = '';
        if (lista.length === 0) {
            this.elementos.alerta.classList.remove('d-none');
            return;
        }
        this.elementos.alerta.classList.add('d-none');
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
            this.elementos.container.appendChild(card);
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
}
document.addEventListener('DOMContentLoaded', function() {
    adicionarBootstrapIcons();
    ControleUI.iniciar();
});
