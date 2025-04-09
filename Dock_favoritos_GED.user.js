// ==UserScript==
// @name         GED Favorites Dock
// @namespace    http://tampermonkey.net/
// @version      1.0
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

    // Verificar se a página tem o atributo data-page="tela-documento"
    if (document.documentElement.getAttribute('data-page') === 'tela-documento') {
        return; // Não executa o script se for a tela de documento
    }

    // Array de cores disponíveis - cores modernas e vibrantes com bom contraste
    const availableColors = [
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
    function getRandomColor() {
        let recentColors = GM_getValue('recentColors', []);
        let availableColorsCopy = [...availableColors];

        // Remove as cores recentes das opções disponíveis
        recentColors.forEach(color => {
            const index = availableColorsCopy.indexOf(color);
            if (index > -1) {
                availableColorsCopy.splice(index, 1);
            }
        });

        // Se todas as cores foram usadas recentemente, reseta o histórico
        if (availableColorsCopy.length === 0) {
            availableColorsCopy = [...availableColors];
            recentColors = [];
        }

        // Seleciona uma cor aleatória das disponíveis
        const selectedColor = availableColorsCopy[Math.floor(Math.random() * availableColorsCopy.length)];

        // Adiciona a cor selecionada ao histórico recente
        recentColors.unshift(selectedColor);

        // Mantém apenas as 5 cores mais recentes
        recentColors = recentColors.slice(0, 5);

        // Salva o histórico atualizado
        GM_setValue('recentColors', recentColors);

        return selectedColor;
    }

    // Adicionar estilos CSS
    GM_addStyle(`
        #ged-favorites-dock {
            position: fixed;
            left: -220px;
            top: 50%;
            transform: translateY(-50%);
            width: 240px;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 25px !important;
            padding: 8px 11px;
            box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.1);
            transition: left 0.3s ease;
            z-index: 9999;
        }

        #ged-favorites-dock::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.3),
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
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.8)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18l6-6-6-6'/%3E%3C/svg%3E");
            background-size: contain;
            background-repeat: no-repeat;
            transition: opacity 0.3s ease;
        }

        #ged-favorites-dock:hover .dock-item {
            opacity: 1 !important;
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
            color: #fff;
            border-radius: 20px;
            transition: all 0.2s ease;
            position: relative;
            cursor: pointer;
            user-select: none;
            opacity: 0 !important;
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
                background-color: rgba(255, 255, 255, 0.2);
                transform: scale(1.05);
            }
            50% {
                background-color: rgba(255, 255, 255, 0.1);
                transform: scale(1.02);
            }
            100% {
                background-color: transparent;
                transform: scale(1);
            }
        }

        .dock-item:hover {
            background-color: rgba(255, 255, 255, 0.1) !important;
        }

        .dock-item.dragging {
            opacity: 0.2;
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
            transform: translateY(-50%);
        }

        .dock-item:hover .remove-favorite {
            opacity: 1;
        }

        #add-favorite-btn {
            border: 2px dashed rgba(255, 255, 255, 0.3);
            cursor: pointer;
            text-align:center;
        }

        #add-favorite-btn:hover {
            border-color: rgba(255, 255, 255, 0.5);
            background-color: rgba(255, 255, 255, 0.1);
        }

        .drag-ghost {
            position: fixed;
            pointer-events: none;
            z-index: 10000;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            padding: 8px 12px;
            display: flex;
            align-items: center;
            width: 200px;
            opacity: 0.8;
            box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
        }

        .drag-ghost .color-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 10px;
            flex-shrink: 0;
            box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
        }

        .drag-ghost span {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #fff;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        #screen-capture {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transition: all 1s ease;
            transform-origin: center;
            animation: captureEffect 1s ease forwards;
            border: solid 1px rgba(0,0,0,0.5)
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
                width: 10vw;
                height: 1.5vh;
                border-radius: 500px;
            }
        }
    `);

    // Função para criar a barra de favoritos
    function createFavoritesDock() {
        // Criar o elemento da barra
        const dock = document.createElement('div');
        dock.id = 'ged-favorites-dock';
        document.body.appendChild(dock);

        // Adicionar botão de adicionar favorito
        const addBtn = document.createElement('a');
        addBtn.id = 'add-favorite-btn';
        addBtn.className = 'dock-item';
        addBtn.innerHTML = `
            <span>Adicionar aos Favoritos</span>
        `;
        dock.appendChild(addBtn);

        // Carregar favoritos salvos
        loadFavorites();

        // Adicionar evento de clique no botão adicionar
        addBtn.addEventListener('click', addCurrentPageToFavorites);
    }

    // Função para carregar favoritos salvos
    function loadFavorites() {
        const favorites = GM_getValue('gedFavorites', []);
        const dock = document.getElementById('ged-favorites-dock');
        const lastFavorites = GM_getValue('lastFavorites', []);
        const addBtn = dock.querySelector('#add-favorite-btn');

        // Remover itens antigos (exceto o botão adicionar)
        Array.from(dock.children).forEach(child => {
            if (child.id !== 'add-favorite-btn') {
                child.remove();
            }
        });

        // Inverter a ordem dos favoritos para que os mais recentes fiquem no topo
        const reversedFavorites = [...favorites].reverse();

        // Primeiro, adicionar os itens existentes
        reversedFavorites.forEach(fav => {
            const isNewItem = !lastFavorites.some(lastFav => lastFav.url === fav.url);
            if (!isNewItem) {
                const item = createFavoriteItem(fav);
                item.style.opacity = '1';
                dock.appendChild(item);
            }
        });

        // Depois, adicionar os novos itens com animação
        reversedFavorites.forEach(fav => {
            const isNewItem = !lastFavorites.some(lastFav => lastFav.url === fav.url);
            if (isNewItem) {
                const item = createFavoriteItem(fav);
                
                // Criar e adicionar o efeito de captura
                const screenCapture = document.createElement('div');
                screenCapture.id = 'screen-capture';
                document.body.appendChild(screenCapture);

                // Posicionar o elemento de captura no local do novo item
                const addBtnRect = addBtn.getBoundingClientRect();
                setTimeout(() => {
                    screenCapture.style.left = `${addBtnRect.left}px`;
                    screenCapture.style.top = `${addBtnRect.top + addBtnRect.height/2+60}px`;
                }, 300);

                // Remover o elemento de captura após a animação
                screenCapture.addEventListener('animationend', () => {
                    screenCapture.remove();
                });

                // Adicionar o novo item após um pequeno delay
                setTimeout(() => {
                    item.classList.add('new-item', 'highlight');
                    dock.insertBefore(item, addBtn.nextSibling);
                }, 900);
            }
        });

        // Salvar o estado atual para comparação futura
        GM_setValue('lastFavorites', favorites);
    }

    // Função auxiliar para criar um item de favorito
    function createFavoriteItem(fav) {
        const item = document.createElement('a');
        item.className = 'dock-item';
        item.href = fav.url;
        item.draggable = true;

        item.innerHTML = `
            <div class="color-indicator" style="background-color: ${fav.color}"></div>
            <span>${fav.title}</span>
            <i class="remove-favorite" data-url="${fav.url}"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></i>
        `;

        // Adicionar eventos de drag and drop
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);

        // Adicionar evento para remover favorito
        const removeBtn = item.querySelector('.remove-favorite');
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            removeFavorite(fav.url);
        });

        return item;
    }

    // Funções de drag and drop
    function handleDragStart(e) {
        e.target.classList.add('dragging');

        // Criar elemento fantasma personalizado
        const ghost = document.createElement('div');
        ghost.className = 'drag-ghost';
        ghost.innerHTML = e.target.innerHTML;
        document.body.appendChild(ghost);

        // Configurar a imagem de arrasto
        e.dataTransfer.setDragImage(ghost, 100, 20);

        // Remover o fantasma após um curto delay
        setTimeout(() => {
            document.body.removeChild(ghost);
        }, 0);

        e.dataTransfer.setData('text/plain', e.target.href);
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging');
        const dock = document.getElementById('ged-favorites-dock');
        const siblings = [...dock.querySelectorAll('.dock-item:not(.dragging)')];

        const nextSibling = siblings.find(sibling => {
            const box = sibling.getBoundingClientRect();
            const offset = e.clientY - box.top - box.height / 2;
            return offset < 0;
        });

        if (nextSibling) {
            dock.insertBefore(draggingItem, nextSibling);
        } else {
            dock.appendChild(draggingItem);
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        updateFavoritesOrder();
    }

    // Função para atualizar a ordem dos favoritos
    function updateFavoritesOrder() {
        const dock = document.getElementById('ged-favorites-dock');
        const items = [...dock.querySelectorAll('.dock-item:not(#add-favorite-btn)')];
        const favorites = items.map(item => ({
            url: item.href,
            title: item.querySelector('span').textContent,
            color: item.querySelector('.color-indicator').style.backgroundColor,
            addedAt: new Date().toISOString()
        }));
        GM_setValue('gedFavorites', favorites);
    }

    // Função para adicionar página atual aos favoritos
    function addCurrentPageToFavorites() {
        const favorites = GM_getValue('gedFavorites', []);
        const currentUrl = window.location.href;

        // Verificar se já existe nos favoritos
        if (favorites.some(fav => fav.url === currentUrl)) {
            alert('Esta página já está nos favoritos!');
            return;
        }

        // Adicionar novo favorito
        const newFavorite = {
            url: currentUrl,
            title: document.title || 'Página GED',
            color: getRandomColor(),
            addedAt: new Date().toISOString()
        };

        favorites.push(newFavorite);
        GM_setValue('gedFavorites', favorites);

        // Recarregar a barra
        loadFavorites();
    }

    // Função para remover um favorito
    function removeFavorite(url) {
        const favorites = GM_getValue('gedFavorites', []);
        const updatedFavorites = favorites.filter(fav => fav.url !== url);
        GM_setValue('gedFavorites', updatedFavorites);

        // Recarregar a barra
        loadFavorites();
    }

    // Inicializar a barra de favoritos quando o documento estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createFavoritesDock);
    } else {
        createFavoritesDock();
    }
})();
