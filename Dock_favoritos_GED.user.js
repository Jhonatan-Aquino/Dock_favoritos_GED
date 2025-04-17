// ==UserScript==
// @name         Barra de favoritos do GED
// @namespace    http://tampermonkey.net/
// @version      1.4.9.1
// @description  Adiciona uma barra de favoritos flutuante ao sistema GED
// @author        Jhonatan Aquino
// @match         https://*.sigeduca.seduc.mt.gov.br/ged/*
// @match         http://*.sigeduca.seduc.mt.gov.br/ged/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @updateURL     https://raw.githubusercontent.com/Jhonatan-Aquino/Dock_favoritos_GED/main/Dock_favoritos_GED.user.js
// @downloadURL   https://raw.githubusercontent.com/Jhonatan-Aquino/Dock_favoritos_GED/main/Dock_favoritos_GED.user.js
// ==/UserScript==


(function() {
    'use strict';

    // Verificar se a página está em um iframe
    if (window.self !== window.top) {
        return; // Não executa o script se estiver em um iframe
    }

    // Verificar se a página tem o atributo data-page="tela-documento" ou se é um popup de mensagem
    if (document.documentElement.getAttribute('data-page') === 'tela-documento' ||
        document.title === 'Popup de Mensagem') {
        return; // Não executa o script se for a tela de documento ou popup de mensagem
    }

    // Array de cores disponíveis - cores modernas e vibrantes com bom contraste
    const coresDisponiveis = [
        '#2196F3', // Azul Material
        '#4CAF50', // Verde Material
        '#F44336', // Vermelho Material
        '#9C27B0', // Roxo Material
        '#FF9800', // Laranja Material
        '#00BCD4', // Ciano Material
        '#E91E63', // Rosa Material
        '#673AB7', // Roxo Profundo
        '#3F51B5', // Índigo
        '#009688', // Verde-água
        '#FF5722', // Laranja Profundo
        '#795548', // Marrom
        '#607D8B', // Azul Cinza
        '#8BC34A', // Verde Limão
        '#CDDC39', // Verde Lima
        '#FFC107', // Âmbar
        '#FF4081', // Rosa Vibrante
        '#7C4DFF', // Roxo Vibrante
        '#00E5FF', // Ciano Brilhante
        '#FF3D00'  // Vermelho Vibrante
    ];

    // Função para obter uma cor que não foi usada recentemente
    function obterCorAleatoria() {
        let coresRecentes = GM_getValue('recentColors', []);
        let coresDisponiveisCopy = [...coresDisponiveis];

        // Remove as cores recentes das opções disponíveis
        coresRecentes.forEach(cor => {
            const index = coresDisponiveisCopy.indexOf(cor);
            if (index > -1) {
                coresDisponiveisCopy.splice(index, 1);
            }
        });

        // Se todas as cores foram usadas recentemente, reseta o histórico
        if (coresDisponiveisCopy.length === 0) {
            coresDisponiveisCopy = [...coresDisponiveis];
            coresRecentes = [];
        }

        // Seleciona uma cor aleatória das disponíveis
        const corSelecionada = coresDisponiveisCopy[Math.floor(Math.random() * coresDisponiveisCopy.length)];

        // Adiciona a cor selecionada ao histórico recente
        coresRecentes.unshift(corSelecionada);

        // Mantém apenas as 5 cores mais recentes
        coresRecentes = coresRecentes.slice(0, 5);

        // Salva o histórico atualizado
        GM_setValue('recentColors', coresRecentes);

        return corSelecionada;
    }

    // Adicionar estilos CSS
    GM_addStyle(`
        #ged-favorites-dock {
            position: fixed;
            left: -220px;
            top: 50%;
            transform: translateY(-50%);
            width: 240px;
            background: rgba(220, 220, 220, 0.6);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 0, 0, 0.04);
            border-radius: 25px !important;
            padding: 8px 11px;
            box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.1);
            transition: left 0.3s ease;
            z-index: 9999;
        }

        #ged-favorites-dock::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(190, 190, 190, 0.5),
                transparent
            );
        }

        #ged-favorites-dock::after {
            content: '';
            position: absolute;
            right: 10px;
            top: 50%;
            width: 20px;
            height: 20px;
            transform: translateY(-50%);
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(0,0,0,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18l6-6-6-6'/%3E%3C/svg%3E");
            background-size: contain;
            background-repeat: no-repeat;
            transition: opacity 0.3s ease;
        }

        #ged-favorites-dock:hover .dock-item {
            opacity: 1 ;
        }
        #ged-favorites-dock:hover::after {
            display: none;
        }

        #ged-favorites-dock:hover {
            left: 0;
        }

        .dock-item {
            display: flex;
            align-items: center;
            padding: 8px 12px 8px 10px;
            margin: 5px 0;
            text-decoration: none;
            color: #666;
            border-radius: 20px;
            transition: all 0.2s ease;
            position: relative;
            cursor: pointer;
            user-select: none;
            opacity: 0;
        }

        .dock-item.new-item {
            transform: translateX(-20px);
            animation: slideIn 0.3s ease forwards;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .dock-item.highlight {
            animation: highlightItem 1.5s ease forwards;
        }

        @keyframes highlightItem {
            0% {
                background-color: rgba(0, 0, 0, 0.2);
                transform: scale(1.05);
            }
            50% {
                background-color: rgba(0, 0, 0, 0.1);
                transform: scale(1.02);
            }
            100% {
                background-color: transparent;
                transform: scale(1);
            }
        }

        .dock-item:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }

        .dock-item.dragging {
            opacity: 0 !important;
            background-color: rgba(255, 255, 255, 0.05);
            border: 2px dashed rgba(255, 255, 255, 0.3);
            transform: scale(0.98);
            box-shadow: none;
        }

        .color-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 10px;
            flex-shrink: 0;
            cursor: grab;
        }

        .dock-item span {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 180px;
            display: inline-block;
        }

         .remove-favorite {
            opacity: 0;
            position: absolute;
            right: 8px;
            color: #ff4444;
            cursor: pointer;
            font-size: 18px;
            transition: opacity 0.2s;
            top: 50%;
            transform: translateY(-50%) scale(1);
            padding: 5px;
            transition: transform 0.2s;
        }
        .remove-favorite:hover {
            transform:  translateY(-50%) scale(1.4);
        }

        .dock-item:hover .remove-favorite {
            opacity: 1;
        }

        #add-favorite-btn {
            border: 2px dashed rgba(0, 0, 0, 0.2);
            cursor: pointer;
            text-align:center;
        }
         #add-favorite-btn span{
            max-width:240px !important;
         }
        #add-favorite-btn:hover {
            border-color: rgba(255, 255, 255, 0.5);
            background-color: rgba(255, 255, 255, 0.1);
        }

        .drag-ghost {
            position: fixed;
            pointer-events: none;
            z-index: 10000;
            background: rgba(220, 220, 220, 1);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 0, 0, 0.04);
            box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.1);
            border-radius: 20px;
            padding: 8px 12px;
            display: flex;
            align-items: center;
            width: 200px;
            opacity: 1 !important;
            box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
        }

        .drag-ghost .color-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 10px;
            flex-shrink: 0;
        }

        .drag-ghost span {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #666 !important;
        }

        #screen-capture {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(170, 170, 170, 0.4);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transition: all 0.8s ease;
            transform-origin: center;
            animation: captureEffect 0.8s ease forwards;
            border: solid 1px rgba(0,0,0,0.2)
        }

        @keyframes captureEffect {
            0% {
                opacity: 0;
                width: 100vw;
                height: 100vh;
            }
            10% {
                opacity: 0.95;
                width: 100vw;
                height: 100vh;
            }
            20% {
                opacity: 0.8;
                width: 90vw;
                height: 90vh;
                border-radius: 0px;
            }
            90% {
                opacity: 0.8;
            }
            100% {
                opacity: 0.2;
                width: 240px;
                height: 30px;
                border-radius: 500px;
            }
        }
    `);

    // Função para garantir que todos os favoritos tenham um índice de ordem
    function garantirOrdemFavoritos() {
        const favoritos = GM_getValue('gedFavorites', []);

        // Verifica se algum favorito não tem a propriedade 'order'
        const precisaAtualizarOrdem = favoritos.some(fav => fav.order === undefined);

        if (precisaAtualizarOrdem) {
            // Adiciona a propriedade 'order' para cada favorito
            const favoritosAtualizados = favoritos.map((fav, index) => ({
                ...fav,
                order: index
            }));

            // Salva a lista atualizada
            GM_setValue('gedFavorites', favoritosAtualizados);
            return favoritosAtualizados;
        }

        return favoritos;
    }

    // Função para criar a barra de favoritos
    function criarBarraFavoritos() {
        // Criar o elemento da barra
        const barra = document.createElement('div');
        barra.id = 'ged-favorites-dock';
        document.body.appendChild(barra);

        // Adicionar botão de adicionar favorito
        const botaoAdicionar = document.createElement('a');
        botaoAdicionar.id = 'add-favorite-btn';
        botaoAdicionar.className = 'dock-item';
        botaoAdicionar.innerHTML = `
            <span>Adicionar aos Favoritos</span>
        `;
        barra.appendChild(botaoAdicionar);

        // Carregar favoritos salvos
        carregarFavoritos();

        // Adicionar evento de clique no botão adicionar
        botaoAdicionar.addEventListener('click', adicionarPaginaAtualAosFavoritos);
    }

    // Função para carregar favoritos salvos
    function carregarFavoritos() {
        // Garante que todos os favoritos tenham um índice de ordem
        const favoritos = garantirOrdemFavoritos();
        const barra = document.getElementById('ged-favorites-dock');
        const ultimosFavoritos = GM_getValue('lastFavorites', []);
        const botaoAdicionar = barra.querySelector('#add-favorite-btn');

        // Remover itens antigos (exceto o botão adicionar)
        Array.from(barra.children).forEach(filho => {
            if (filho.id !== 'add-favorite-btn') {
                filho.remove();
            }
        });

        // Ordenar favoritos pelo índice de ordem
        const favoritosOrdenados = [...favoritos].sort((a, b) => a.order - b.order);

        // Adicionar cada favorito à barra na ordem exata como foi salva
        favoritosOrdenados.forEach(favorito => {
            const ehNovoItem = !ultimosFavoritos.some(ultimoFav => ultimoFav.url === favorito.url);
            const item = criarItemFavorito(favorito);

            if (ehNovoItem) {
                // Criar e adicionar o efeito de captura
                const capturaTela = document.createElement('div');
                capturaTela.id = 'screen-capture';
                document.body.appendChild(capturaTela);

                // Posicionar o elemento de captura no local do novo item
                const botaoAdicionarRect = botaoAdicionar.getBoundingClientRect();
                setTimeout(() => {
                    capturaTela.style.left = `${botaoAdicionarRect.left}px`;
                    capturaTela.style.top = `${botaoAdicionarRect.top + botaoAdicionarRect.height/2+30}px`;
                }, 300);

                // Remover o elemento de captura após a animação
                capturaTela.addEventListener('animationend', () => {
                    capturaTela.remove();
                });

                // Adicionar o novo item após um pequeno delay
                setTimeout(() => {
                    item.classList.add('new-item', 'highlight');
                    barra.insertBefore(item, botaoAdicionar.nextSibling);
                }, 900);
            } else {
                item.style.opacity = '1';
                barra.appendChild(item);
            }
        });

        // Salvar o estado atual para comparação futura
        GM_setValue('lastFavorites', favoritosOrdenados);
    }

    // Função auxiliar para criar um item de favorito
    function criarItemFavorito(favorito) {
        const item = document.createElement('a');
        item.className = 'dock-item';
        item.href = favorito.url;
        item.draggable = true;

        item.innerHTML = `
            <div class="color-indicator" style="background-color: ${favorito.color}"></div>
            <span>${favorito.title}</span>
            <i class="remove-favorite" data-url="${favorito.url}"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></i>
        `;

        // Adicionar eventos de drag and drop
        item.addEventListener('dragstart', iniciarArrasto);
        item.addEventListener('dragend', finalizarArrasto);
        item.addEventListener('dragover', duranteArrasto);
        item.addEventListener('drop', soltarArrasto);

        // Adicionar evento para remover favorito
        const botaoRemover = item.querySelector('.remove-favorite');
        botaoRemover.addEventListener('click', (e) => {
            e.preventDefault();
            removerFavorito(favorito.url);
        });

        return item;
    }

    // Funções de drag and drop
    function iniciarArrasto(e) {
        e.target.classList.add('dragging');

        // Criar elemento fantasma personalizado
        const fantasma = document.createElement('div');
        fantasma.className = 'drag-ghost';
        fantasma.innerHTML = e.target.innerHTML;
        document.body.appendChild(fantasma);

        // Configurar a imagem de arrasto
        e.dataTransfer.setDragImage(fantasma, 60, 40);

        // Remover o fantasma após um curto delay
        setTimeout(() => {
            document.body.removeChild(fantasma);
        }, 0);

        e.dataTransfer.setData('text/plain', e.target.href);
    }

    function finalizarArrasto(e) {
        e.target.classList.remove('dragging');
        atualizarOrdemFavoritos();
    }

    function duranteArrasto(e) {
        e.preventDefault();
        const itemArrastando = document.querySelector('.dragging');
        const barra = document.getElementById('ged-favorites-dock');
        const itensIrmaos = [...barra.querySelectorAll('.dock-item:not(.dragging)')];

        const proximoIrmao = itensIrmaos.find(irmao => {
            const box = irmao.getBoundingClientRect();
            const offset = e.clientY - box.top - box.height / 2;
            return offset < 0;
        });

        if (proximoIrmao) {
            barra.insertBefore(itemArrastando, proximoIrmao);
        } else {
            barra.appendChild(itemArrastando);
        }
    }

    function soltarArrasto(e) {
        e.preventDefault();
        atualizarOrdemFavoritos();
    }

    // Função para atualizar a ordem dos favoritos
    function atualizarOrdemFavoritos() {
        const barra = document.getElementById('ged-favorites-dock');
        const itens = [...barra.querySelectorAll('.dock-item:not(#add-favorite-btn)')];

        // Obter todos os favoritos atuais
        const favoritosAtuais = GM_getValue('gedFavorites', []);

        // Criar um mapa de favoritos por URL para fácil acesso
        const mapaFavoritos = new Map(favoritosAtuais.map(fav => [fav.url, fav]));

        // Criar nova lista de favoritos mantendo todas as propriedades originais
        const favoritosAtualizados = itens.map((item, index) => {
            const url = item.href;
            const favoritoExistente = mapaFavoritos.get(url);

            // Se o favorito existir, manter todas as suas propriedades
            if (favoritoExistente) {
                return {
                    ...favoritoExistente, // Mantém todas as propriedades originais
                    title: item.querySelector('span').textContent, // Atualiza apenas o título se mudou
                    order: index // Adiciona o índice de ordem
                };
            }

            // Se por algum motivo o favorito não existir, criar um novo
            return {
                url: url,
                title: item.querySelector('span').textContent,
                color: item.querySelector('.color-indicator').style.backgroundColor,
                addedAt: new Date().toISOString(),
                order: index // Adiciona o índice de ordem
            };
        });

        // Salvar a nova ordem
        GM_setValue('gedFavorites', favoritosAtualizados);
    }

    // Função para adicionar página atual aos favoritos
    function adicionarPaginaAtualAosFavoritos() {
        const favoritos = GM_getValue('gedFavorites', []);
        const urlAtual = window.location.href;

        // Verificar se já existe nos favoritos
        if (favoritos.some(fav => fav.url === urlAtual)) {
            // Adiciona o CSS da animação se ainda não existir
            if (!document.querySelector('#wiggle-animation')) {
                const style = document.createElement('style');
                style.id = 'wiggle-animation';
                style.textContent = `
                    @keyframes wiggle {
                        0% { transform: translateX(0); }
                        16.67% { transform: translateX(-8px); }
                        33.33% { transform: translateX(8px); }
                        50% { transform: translateX(-6px); }
                        66.67% { transform: translateX(6px); }
                        83.33% { transform: translateX(-4px); }
                        100% { transform: translateX(0); }
                    }
                    .wiggle {
                        animation: wiggle 0.4s ease-in-out;
                    }
                `;
                document.head.appendChild(style);
            }

            // Aguarda um momento para o DOM atualizar
            setTimeout(() => {
                // Encontra o item no dock que corresponde à URL atual
                const itemExistente = document.querySelector(`#ged-favorites-dock .dock-item[href="${urlAtual}"]`);

                if (itemExistente) {
                    // Remove classes existentes e adiciona animação
                    itemExistente.classList.remove('new-item', 'highlight');
                    itemExistente.classList.add('wiggle');

                    // Remove a classe após a animação terminar
                    setTimeout(() => {
                        itemExistente.classList.remove('wiggle');
                    }, 1000);
                }
            }, 100);

            return;
        }

        // Adicionar novo favorito no topo da lista
        const novoFavorito = {
            url: urlAtual,
            title: document.title || 'Página GED',
            color: obterCorAleatoria(),
            addedAt: new Date().toISOString(),
            order: 0 // Novo item sempre começa com ordem 0
        };

        // Atualizar a ordem de todos os favoritos existentes
        const favoritosAtualizados = favoritos.map(fav => ({
            ...fav,
            order: fav.order + 1 // Desloca todos os itens uma posição para baixo
        }));

        // Adiciona o novo favorito no início da lista
        favoritosAtualizados.unshift(novoFavorito);

        // Salva a lista atualizada
        GM_setValue('gedFavorites', favoritosAtualizados);

        // Recarregar a barra
        carregarFavoritos();
    }

    // Função para remover um favorito
    function removerFavorito(url) {
        const favoritos = GM_getValue('gedFavorites', []);
        const favoritosAtualizados = favoritos.filter(fav => fav.url !== url);
        GM_setValue('gedFavorites', favoritosAtualizados);

        // Recarregar a barra
        carregarFavoritos();
    }

    // Inicializar a barra de favoritos quando o documento estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', criarBarraFavoritos);
    } else {
        criarBarraFavoritos();
    }

// Exemplo de uso:
adicionarEfeitoBrilhoFlexivel('#ged-favorites-dock', {
    delay: 1000,
    duration: 2000,
    colors: {
        before: [
            'rgba(235, 20, 20, 0.3)',
            'transparent',
            'rgba(64, 255, 166, 0.3)',
            'rgba(214, 114, 114, 0.5)',
            'rgba(255, 40, 40, 0.6)'
        ],
        after: [
            'rgba(57, 130, 247, 0.5)',
            'rgba(52, 165, 104, 0.7)',
            'rgba(255, 255, 255, 0.91)',
            'rgba(57, 130, 247, 0.5)'
        ]
    },
    blur: {
        before: 20,
        after: 20
    }
});

function adicionarEfeitoBrilhoFlexivel(containerSelector, options = {}) {
    // Verifica se o efeito já foi executado
    const efeitoExecutado = GM_getValue('efeitoBrilhoExecutado', false);
    if (efeitoExecutado) {
        return; // Se já foi executado, retorna sem fazer nada
    }

    // Configurações padrão
    const config = {
        delay: options.delay || 1000,
        duration: options.duration || 2000,
        colors: {
            before: options.colors?.before || [
                'rgba(235, 20, 20, 0.3)',
                'rgba(64, 255, 166, 0.3)',
                'transparent',
                'rgba(255, 40, 40, 0.6)'
            ],
            after: options.colors?.after || [
                'rgba(57, 130, 247, 0.5)',
                'rgba(52, 165, 104, 0.7)',
                'rgba(57, 130, 247, 0.5)'
            ]
        },
        blur: {
            before: options.blur?.before || 30,
            after: options.blur?.after || 50
        }
    };

    // Obtém o container
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Cria os elementos de brilho
    const glowBefore = document.createElement('div');
    const glowAfter = document.createElement('div');

    // Configura os elementos de brilho
    glowBefore.className = 'glow-layer before';
    glowAfter.className = 'glow-layer after';

    // Adiciona os estilos necessários
    const styleId = 'glow-effect-flexible-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.type = 'text/css';
        style.innerHTML = `
            .glow-layer {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: -1;
                border-radius: inherit;
                opacity: 0;
            }

            .glow-layer.before {
                animation: glow-reverse-flexible ${config.duration}ms linear;
            }

            .glow-layer.after {
                animation: glow-flexible ${config.duration}ms linear;
            }

            @keyframes glow-flexible {
                0% {
                    opacity: 0;
                    transform: scale(1);
                    background-position: 0% 0%;
                    background-size: 100% 100%;
                }
                5% {
                    opacity: 1;
                    transform: scale(1.1);
                    background-position: 100% 0%;
                    background-size: 150% 150%;
                }
                15% {
                    opacity: 0.8;
                    transform: scale(1.05);
                    background-position: 50% 100%;
                    background-size: 180% 180%;
                }
                35% {
                    opacity: 0.9;
                    transform: scale(1.03);
                    background-position: 25% 75%;
                    background-size: 200% 200%;
                }
                65% {
                    opacity: 0.7;
                    transform: scale(1.04);
                    background-position: 85% 15%;
                    background-size: 220% 220%;
                }
                85% {
                    opacity: 0.5;
                    transform: scale(1.02);
                    background-position: 35% 65%;
                    background-size: 180% 180%;
                }
                100% {
                    opacity: 0;
                    transform: scale(1);
                    background-position: 0% 0%;
                    background-size: 100% 100%;
                }
            }

            @keyframes glow-reverse-flexible {
                0% {
                    opacity: 0;
                    transform: scale(1);
                    background-position: 0% 0%;
                    background-size: 100% 100%;
                }
                5% {
                    opacity: 0.9;
                    transform: scale(1.08);
                    background-position: 0% 100%;
                    background-size: 160% 160%;
                }
                20% {
                    opacity: 1;
                    transform: scale(1.06);
                    background-position: 100% 50%;
                    background-size: 190% 190%;
                }
                45% {
                    opacity: 0.8;
                    transform: scale(1.04);
                    background-position: 75% 25%;
                    background-size: 220% 220%;
                }
                75% {
                    opacity: 0.6;
                    transform: scale(1.03);
                    background-position: 15% 85%;
                    background-size: 250% 250%;
                }
                90% {
                    opacity: 0.3;
                    transform: scale(1.01);
                    background-position: 65% 35%;
                    background-size: 280% 280%;
                }
                100% {
                    opacity: 0;
                    transform: scale(1);
                    background-position: 200% 200%;
                    background-size: 300% 300%;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Configura os estilos específicos para este container
    glowBefore.style.background = `conic-gradient(from 0deg, ${config.colors.before.join(',')})`;
    glowBefore.style.filter = `blur(${config.blur.before}px)`;
    glowAfter.style.background = `conic-gradient(from 0deg, ${config.colors.after.join(',')})`;
    glowAfter.style.filter = `blur(${config.blur.after}px)`;

    // Adiciona os elementos de brilho ao container
    container.appendChild(glowBefore);
    container.appendChild(glowAfter);

    // Após a animação terminar, marca o efeito como executado
    setTimeout(() => {
        glowBefore.remove();
        glowAfter.remove();
        GM_setValue('efeitoBrilhoExecutado', true);
    }, config.duration);
}

})();
