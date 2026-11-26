// ===== Pegando os elementos do HTML =====
const cabecalho = document.getElementById("cabecalho");
const infoCidade = document.getElementById("infoCidade");
const tituloCidade = document.getElementById("tituloCidade");
const descricaoCidade = document.getElementById("descricaoCidade");
const pratosCidade = document.getElementById("pratosCidade");

const formBusca = document.getElementById("formbusca");
const inputCidade = document.getElementById("cidade");
const mensagem = document.getElementById("mensagem");

const tituloCarrossel = document.getElementById("tituloCarrossel");
const carrossel = document.getElementById("carrossel");
const btnAnterior = document.getElementById("btnAnterior");
const btnProximo = document.getElementById("btnProximo");

const secCuradoria = document.getElementById("secCuradoria");
const nomeCidade = document.getElementById("nomeCidade");
const filtroPreco = document.getElementById("filtroPreco");
const listaCuradoria = document.getElementById("listaCuradoria");

const secTodos = document.getElementById("secTodos");
const filtroNome = document.getElementById("filtroNome");
const filtroTipo = document.getElementById("filtroTipo");
const filtroCozinha = document.getElementById("filtroCozinha");
const contagem = document.getElementById("contagem");
const listaTodos = document.getElementById("listaTodos");

// ===== Variáveis que guardam os dados =====
let cidadeAtual = "";          // nome exibido da cidade pesquisada
let cidadeCadastrada = null;   // objeto da cidade em CIDADES (ou null se não estiver nas 10)
let lugares = [];              // lugares que vieram do OpenStreetMap

const textosPreco = ["", "R$", "R$$", "R$$$"];

const nomesTipo = {
    restaurant: "Restaurante",
    cafe: "Café",
    fast_food: "Lanchonete"
};

const nomesCozinha = {
    regional: "Regional",
    brazilian: "Brasileira",
    pizza: "Pizza",
    burger: "Hambúrguer",
    italian: "Italiana",
    japanese: "Japonesa",
    sushi: "Sushi",
    chinese: "Chinesa",
    steak_house: "Carnes",
    barbecue: "Churrasco",
    coffee_shop: "Cafeteria",
    sandwich: "Sanduíches",
    vegetarian: "Vegetariana",
    arab: "Árabe",
    seafood: "Frutos do mar"
};

// Evita que um texto estranho vindo da internet vire código HTML
function limpar(texto) {
    return String(texto).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Normaliza o nome da cidade (minúsculas e sem acentos) para comparar com CIDADES
function normalizarTexto(texto) {
    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// ===== VISUAL PADRÃO vs. CIDADE PERSONALIZADA =====
function aplicarVisualPadrao() {
    cidadeCadastrada = null;

    // Cabeçalho vermelho padrão
    cabecalho.classList.remove("cabecalho-personalizado");
    cabecalho.style.backgroundImage = "";
    infoCidade.hidden = true;

    // Fundo claro padrão da página
    document.body.classList.remove("pagina-personalizada");
    document.body.style.backgroundImage = "";

    // Carrossel volta para os destaques iniciais (Juiz de Fora)
    tituloCarrossel.textContent = "Destaques";
    montarCarrossel(CIDADES["juiz de fora"].restaurantes);
}

function aplicarVisualCidade(dadosCidade) {
    cidadeCadastrada = dadosCidade;

    // Foto de cabeçalho com camada escura para destacar o texto branco
    cabecalho.classList.add("cabecalho-personalizado");
    cabecalho.style.backgroundImage =
        "linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.55)), url('" + dadosCidade.fotoCabecalho + "')";

    tituloCidade.textContent = dadosCidade.nome;
    descricaoCidade.textContent = dadosCidade.descricao;
    pratosCidade.textContent = dadosCidade.pratosTipicos;
    infoCidade.hidden = false;

    // Foto de fundo da página com camada clara suave para manter a leitura
    document.body.classList.add("pagina-personalizada");
    document.body.style.backgroundImage =
        "linear-gradient(rgba(255, 253, 249, 0.78), rgba(255, 253, 249, 0.25)), url('" + dadosCidade.fotoFundo + "')";

    // Carrossel passa a mostrar os restaurantes dessa cidade
    tituloCarrossel.textContent = "Destaques em " + dadosCidade.nome;
    montarCarrossel(dadosCidade.restaurantes);
}

// ===== CARROSSEL =====
function montarCarrossel(listaRestaurantes) {
    let html = "";

    for (let i = 0; i < listaRestaurantes.length; i++) {
        const r = listaRestaurantes[i];

        html += "<li class='cartao'>";
        html += "<div class='emoji'>" + r.emoji + "</div>";
        html += "<h3>" + r.nome + "</h3>";
        html += "<p>" + r.tipo + "</p>";
        html += "<p><span class='preco'>" + textosPreco[r.preco] + "</span> - nota " + r.nota + "</p>";
        html += "<p>" + r.diferenciais.join(", ") + "</p>";
        html += "</li>";
    }

    carrossel.scrollLeft = 0;
    carrossel.innerHTML = html;
}

btnProximo.onclick = function () {
    carrossel.scrollLeft = carrossel.scrollLeft + 250;
};

btnAnterior.onclick = function () {
    carrossel.scrollLeft = carrossel.scrollLeft - 250;
};

// Passa sozinho a cada 5 segundos
setInterval(function () {
    const chegouNoFim = carrossel.scrollLeft + carrossel.clientWidth >= carrossel.scrollWidth - 5;
    if (chegouNoFim) {
        carrossel.scrollLeft = 0;
    } else {
        carrossel.scrollLeft = carrossel.scrollLeft + 250;
    }
}, 5000);

// Inicia com o visual padrão ao abrir o site
aplicarVisualPadrao();

// ===== NOSSAS ESCOLHAS (dados.js) =====
function mostrarCuradoria() {
    if (cidadeCadastrada == null) {
        secCuradoria.hidden = true;
        return;
    }

    let html = "";
    let achou = false;
    const lista = cidadeCadastrada.restaurantes;

    for (let i = 0; i < lista.length; i++) {
        const r = lista[i];
        const mesmoPreco = filtroPreco.value == "" || filtroPreco.value == r.preco;

        if (mesmoPreco) {
            achou = true;
            html += "<li>";
            html += "<h3>" + r.nome + "</h3>";
            let linha = r.tipo;
            if (r.bairro != "") {
                linha = linha + " - " + r.bairro;
            }
            html += "<p>" + linha + "</p>";
            html += "<p><span class='preco'>" + textosPreco[r.preco] + "</span> - nota " + r.nota + "</p>";
            html += "<p>" + r.diferenciais.join(", ") + "</p>";
            if (r.endereco != "") {
                html += "<p>" + r.endereco + "</p>";
            }
            html += "</li>";
        }
    }

    if (achou == false) {
        html = "<li>Nenhuma indicação nossa para essa faixa de preço.</li>";
    }

    listaCuradoria.innerHTML = html;
    secCuradoria.hidden = false;
}

// ===== TODOS OS LUGARES (OpenStreetMap) =====
function preencherCozinhas() {
    const codigos = [];

    for (let i = 0; i < lugares.length; i++) {
        const c = lugares[i].cozinha;
        if (c != "" && codigos.indexOf(c) == -1) {
            codigos.push(c);
        }
    }

    let html = "<option value=''>Todas</option>";
    for (let j = 0; j < codigos.length; j++) {
        let nome = nomesCozinha[codigos[j]];
        if (nome == undefined) {
            nome = codigos[j];
        }
        html += "<option value='" + codigos[j] + "'>" + limpar(nome) + "</option>";
    }
    filtroCozinha.innerHTML = html;
}

function mostrarTodos() {
    let html = "";
    let total = 0;

    for (let i = 0; i < lugares.length; i++) {
        const l = lugares[i];

        const passaNome = l.nome.toLowerCase().indexOf(filtroNome.value.toLowerCase()) != -1;
        const passaTipo = filtroTipo.value == "" || filtroTipo.value == l.tipo;
        const passaCozinha = filtroCozinha.value == "" || filtroCozinha.value == l.cozinha;

        if (passaNome && passaTipo && passaCozinha) {
            total = total + 1;

            html += "<li>";
            html += "<h3>" + limpar(l.nome) + "</h3>";
            html += "<p>" + nomesTipo[l.tipo] + "</p>";
            if (l.endereco != "") {
                html += "<p>" + limpar(l.endereco) + "</p>";
            }
            if (l.diferenciais.length > 0) {
                html += "<p>" + l.diferenciais.join(", ") + "</p>";
            }
            if (l.site.indexOf("http") == 0) {
                html += "<p><a href='" + l.site + "' target='_blank'>Site do restaurante</a></p>";
            }
            if (l.lat != undefined) {
                html += "<p><a href='https://www.openstreetmap.org/?mlat=" + l.lat + "&mlon=" + l.lon +
                        "#map=18/" + l.lat + "/" + l.lon + "' target='_blank'>Ver no mapa</a></p>";
            }
            html += "</li>";
        }
    }

    contagem.textContent = total + " lugar(es) encontrado(s)";
    listaTodos.innerHTML = html;
}

// Transforma o que vem do OpenStreetMap em um objeto mais simples
function criarLugar(elemento) {
    const t = elemento.tags;
    const lugar = {};

    lugar.nome = t.name;
    lugar.tipo = t.amenity;
    lugar.cozinha = "";
    if (t.cuisine != undefined) {
        lugar.cozinha = t.cuisine.split(";")[0];
    }

    lugar.site = "";
    if (t.website != undefined) {
        lugar.site = t.website;
    } else if (t["contact:website"] != undefined) {
        lugar.site = t["contact:website"];
    }

    lugar.endereco = "";
    if (t["addr:street"] != undefined) {
        lugar.endereco = t["addr:street"];
        if (t["addr:housenumber"] != undefined) {
            lugar.endereco = lugar.endereco + ", " + t["addr:housenumber"];
        }
    }

    lugar.diferenciais = [];
    if (t.outdoor_seating == "yes") {
        lugar.diferenciais.push("área externa");
    }
    if (t.wheelchair == "yes") {
        lugar.diferenciais.push("acessível");
    }
    if (t.internet_access == "wlan") {
        lugar.diferenciais.push("Wi-Fi");
    }
    if (t.delivery == "yes") {
        lugar.diferenciais.push("delivery");
    }
    if (t["diet:vegetarian"] == "yes") {
        lugar.diferenciais.push("opção vegetariana");
    }

    if (elemento.lat != undefined) {
        lugar.lat = elemento.lat;
        lugar.lon = elemento.lon;
    } else if (elemento.center != undefined) {
        lugar.lat = elemento.center.lat;
        lugar.lon = elemento.center.lon;
    }

    return lugar;
}

// ===== BUSCA POR CIDADE =====
formBusca.onsubmit = function (evento) {
    evento.preventDefault();

    mensagem.textContent = "Procurando a cidade...";
    secCuradoria.hidden = true;
    secTodos.hidden = true;

    const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
              encodeURIComponent(inputCidade.value);

    fetch(url)
        .then(function (resposta) {
            return resposta.json();
        })
        .then(function (dados) {
            if (dados.length == 0) {
                aplicarVisualPadrao();
                mensagem.textContent = "Não encontramos essa cidade.";
                return;
            }

            cidadeAtual = dados[0].display_name.split(",")[0];
            const chave = normalizarTexto(cidadeAtual);

            // Verifica se a cidade está entre as 10 selecionadas
            if (CIDADES[chave] != undefined) {
                aplicarVisualCidade(CIDADES[chave]);
            } else {
                aplicarVisualPadrao();
            }

            mensagem.textContent = "Buscando lugares em " + cidadeAtual + "...";

            const caixa = dados[0].boundingbox;
            const area = caixa[0] + "," + caixa[2] + "," + caixa[1] + "," + caixa[3];

            buscarRestaurantes(area);
        })
        .catch(function () {
            aplicarVisualPadrao();
            mensagem.textContent = "Deu erro na busca. Tente de novo.";
        });
};

function buscarRestaurantes(area) {
    const consulta = '[out:json][timeout:25];' +
                   'nwr["amenity"~"restaurant|cafe|fast_food"]["name"](' + area + ');' +
                   'out center 300;';

    fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: consulta
    })
        .then(function (resposta) {
            return resposta.json();
        })
        .then(function (dados) {
            lugares = [];
            for (let i = 0; i < dados.elements.length; i++) {
                lugares.push(criarLugar(dados.elements[i]));
            }

            nomeCidade.textContent = cidadeAtual;
            filtroPreco.value = "";
            filtroNome.value = "";
            filtroTipo.value = "";

            preencherCozinhas();
            mostrarCuradoria();
            mostrarTodos();

            secTodos.hidden = false;
            mensagem.textContent = "";
        })
        .catch(function () {
            mensagem.textContent = "Deu erro ao buscar os lugares. Tente de novo.";
        });
}

// ===== Filtros =====
filtroPreco.onchange = mostrarCuradoria;
filtroNome.oninput = mostrarTodos;
filtroTipo.onchange = mostrarTodos;
filtroCozinha.onchange = mostrarTodos