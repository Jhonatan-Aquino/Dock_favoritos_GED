// ==UserScript==
// @name         Barra de favoritos do GED
// @namespace    http://tampermonkey.net/
// @version      1.6
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


// ==/UserScript==

(function() {
    'use strict';

    // Verificar se a página está em um iframe
    if (window.self !== window.top) {
        return; // Não executa o script se estiver em um iframe
    }

    // Verificar se a página tem o atributo data-page="tela-documento" ou se é um popup de mensagem
    if (document.documentElement.getAttribute('data-page') === 'tela-documento' ||
        document.title === 'Popup de Mensagem'||
        document.title === 'Tela Documento') {
        return; // Não executa o script se for a tela de documento ou popup de mensagem
    }


    // Array de ícones disponíveis
    const iconesDisponiveis = [
        {
            id: 'home',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>`
        },
        {
            id: 'search',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>`
        },
        {
            id: 'document',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <line x1="8" y1="13" x2="16" y2="13"/>
                <line x1="8" y1="17" x2="16" y2="17"/>
                <line x1="8" y1="9" x2="12" y2="9"/>
            </svg>`
        },
        {
            id: 'edit',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>`
        },
        {
            id: 'save',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
            </svg>`
        },
        {
            id: 'printer',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
            </svg>`
        },
        {
            id: 'attach',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>`
        },
        {
            id: 'user',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>`
        },
        {
            id: 'calendar',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>`
        },
        {
            id: 'bell',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>`
        },
        {
            id: 'star',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>`
        },
        {
            id: 'award',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="6"/>
                <path d="M15.477 12.89L16.5 21l-4.5-3-4.5 3 1.023-8.11"/>
            </svg>`
        },
        {
            id: 'settings',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>`
        },
        {
            id: 'refresh',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 4v6h-6"/>
                <path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
                <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>`
        },
        {
            id: 'help',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>`
        },
        {
            id: 'alert',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>`
        },
        {
            id: 'check',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6L9 17l-5-5"/>
            </svg>`
        },
        {
            id: 'close',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>`
        },
        {
            id: 'plus',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>`
        },
        {
            id: 'trash',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>`
        },
        {
            id: 'arrow-up',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"/>
                <polyline points="5 12 12 5 19 12"/>
            </svg>`
        },
        {
            id: 'arrow-right',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">
                <line x1="13" y1="5" x2="19" y2="12"/>
                <line x1="19" y1="12" x2="13" y2="19"/>
                <line x1="5" y1="5" x2="11" y2="12"/>
                <line x1="11" y1="12" x2="5" y2="19"/>
            </svg>`
        },
        {
            id: 'swap',
            svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="7 16 17 16 12 21"/>
                <polyline points="17 8 7 8 12 3"/>
            </svg>`
        },
        {
            id: 'undefined',
            svg: `<svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M956.42 668.186L672 512l284.42-156.186c23.59-12.954 31.922-42.768 18.464-66.074l-38.96-67.482c-13.456-23.306-43.44-30.998-66.454-17.046L592 373.436l6.95-324.408C599.526 22.122 577.874 0 550.96 0h-77.92c-26.912 0-48.566 22.122-47.988 49.028L432 373.436 154.53 205.214c-23.012-13.952-52.998-6.26-66.454 17.046l-38.96 67.482c-13.456 23.306-5.124 53.12 18.466 66.074L352 512 67.58 668.186c-23.59 12.954-31.922 42.768-18.464 66.074l38.96 67.482c13.456 23.306 43.442 30.998 66.454 17.046L432 650.564l-6.95 324.408C424.474 1001.878 446.128 1024 473.04 1024h77.922c26.912 0 48.566-22.122 47.99-49.028L592 650.564l277.47 168.222c23.012 13.952 52.998 6.26 66.454-17.046l38.96-67.482c13.456-23.306 5.126-53.118-18.464-66.072z" fill="" /></svg>`
        }


    ];

    // Array de cores disponíveis - cores modernas e vibrantes com bom contraste
    const coresDisponiveis = [
        '#D95F89', // Rosa Material
        '#FF4081', // Rosa Vibrante
        '#9C27B0', // Roxo Material
        '#673AB7', // Roxo Profundo
        '#7C4DFF', // Roxo Vibrante
        '#3F51B5', // Índigo
        '#2196F3', // Azul Material
        '#00BCD4', // Ciano Material
        '#00E5FF', // Ciano Brilhante
        '#607D8B', // Azul Cinza
        '#009688', // Verde-água
        '#4CAF50', // Verde Material
        '#8BC34A', // Verde Limão
        '#CDDC39', // Verde Lima
        '#FFC107', // Âmbar
        '#FF9800', // Laranja Material
        '#FF5722', // Laranja Profundo
        '#795548'  // Marrom
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
            left: -240px;
            top: 50%;
            transform: translateY(-50%);
            width: 250px;
            background: rgba(220, 220, 220, 0.6);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 0, 0, 0.04);
            border-radius: 25px !important;
            padding: 8px 11px 8px 20px;
            box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.1);
            transition: left 0.3s ease;
            z-index: 9999;
        }

        .separador {
            height: 3px;
            background: rgba(0,0,0,0.2);
            cursor: move;
            position: relative;
            opacity: 0.5;
            border-radius: 3px;
            transition: all 0.2s ease;
            width: 40%;
            margin: 5px auto;
        }

        .separador:hover {
            opacity: 1;
        }

        .separador.dragging {
            opacity: 0.8;
            transition: none !important;
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

        #ged-favorites-dock:hover, #ged-favorites-dock.hover-f{
            left: 0;
        }
        #ged-favorites-dock.hover-f{
            min-height: 445px;
        }
        #ged-favorites-dock.hover-f .dock-item,  #ged-favorites-dock.hover-f .separador{
            filter: blur(10px);
        }

        .dock-item {
            display: flex;
            align-items: center;
            padding: 3px 12px 3px 3px;
            margin: 3px 0;
            text-decoration: none;
            color: #666;
            border-radius: 20px;
            transition: all 0.2s ease;
            position: relative;
            cursor: pointer;
            user-select: none;
            opacity: 0;
        }
         .dock-item:before{
            content: "";
            position: absolute;
            top: 0;
            left: -30px;
            width: 40px;
            height: 40px;
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
            background-color: rgba(255, 255, 255, 0.7);
        }
        .edit-favorite {
            opacity: 0;
            position: absolute;
            left: -22px;
            color:rgb(140, 140, 140);
            cursor: pointer;
            font-size: 18px;
            transition: all 0.2s;
            top: 50%;
            transform: translateY(-50%) scale(0);
            padding: 5px;
            visibility: hidden;
        }

        .edit-favorite:hover {
            transform: translateY(-50%) scale(1.2);
            color: #444;
        }

        .dock-item:hover .edit-favorite {
            opacity: 1;
            transform: translateY(-50%) scale(1);
            visibility: visible;
        }
        .popupeditar {
            background: rgba(255, 255, 255,0.6);
            padding: 15px;
            border-radius: 15px;
            z-index: 9999999;
            position: absolute;
            left: 50%;
            width: 230px;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 0, 0, 0.1);
            overflow: hidden;
            height: fit-content;
            transform: translateY(-20px);
            opacity: 0 !important;
            transition: all 0.3s ease;
        }

        .popupeditar.visible {
            transform: translateY(0);
            opacity: 1 !important;
        }

        .popupeditar input {
            width: 100%;
            height: 30px;
            padding: 5px 12px;
            margin-bottom: 10px;
            border: 1px solid #dcdde1;
            border-radius: 22px;
            background: rgba(255,255,255,0.4);
            color: #373737;
            font-size: 11px;
        }

        .popupeditar input:focus {
            outline: none;
            border-color: rgba(0,0,0,0.2);
            background: rgba(255,255,255,0.6);
        }

        .popupeditar .cores-container {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            justify-content: center;
            margin-bottom: 10px;
        }

        .popupeditar .cor-circulo {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            cursor: pointer;
            transition: transform 0.2s;
            border: 3px solid transparent;
            opacity: 0.8;
        }

        .popupeditar .cor-circulo:hover {
            transform: scale(1.2);
            opacity:1;
        }

        .popupeditar .cor-circulo.selected {
            border-color: rgba(0,0,0,0.3);
            transform: scale(1.1);
            opacity:1;
        }
   .popupeditar .cor-circulo.selected::after{
            content:"";
            position: absolute;
            width:10px;
            height:10px;
            background: #fff;
            border-radius:20px;
            margin:50%;
            transform: translateX(-50%) translateY(-50%);
        }
        .popupeditar .icones-container {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            justify-content: center;
            margin-top: 10px;
        }

        .popupeditar .botoes-container {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
            gap: 10px;
            width: 100%;
        }

        .popupeditar .botao-confirmar,
        .popupeditar .botao-cancelar {
            flex: 1;
            padding: 8px 12px;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s ease;
            text-align: center;
            color: white;
            font-weight: 500;
        }

        .popupeditar .botao-confirmar {
            background:  rgba(52, 165, 104, 0.8);
            border: solid 1px rgba(52, 165, 104, 0.8);
        }

        .popupeditar .botao-confirmar:hover {
            background: rgba(52, 165, 104, 1);
        }

        .popupeditar .botao-cancelar {
            background: none;
            color: rgba(255, 77, 77, 0.9);
        }

        .popupeditar .icone-redondo {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            border: 1px solid rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            padding: 0;
            margin: 0;
            opacity: 0.8;
        }

        .popupeditar .icone-redondo:hover {
            background: rgba(255, 255, 255, 0.6);
            transform: scale(1.1);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            opacity: 1;
        }

        .popupeditar .icone-redondo.selected {
            background: rgba(255, 255, 255, 0.8);
            border: 3px solid rgba(52, 165, 104, 0.8);
            transform: scale(1.1);
            opacity: 1;
        }

        .popupeditar .icone-redondo svg {
            transition: fill 0.2s ease;
        }

        .editando-item{
            opacity: 1;
            position: fixed;
            background: #fff;
            width: 85%;
            transform: scale(1.01);
            height: 30px;
            padding-left: 7px;
            filter: blur(0px) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .editando-item:hover .edit-favorite, .editando-item:hover .remove-favorite{
            display: none;
        }
        .dock-item.dragging {
            opacity: 0 !important;
            background-color: rgba(255, 255, 255, 0.05);
            border: 2px dashed rgba(255, 255, 255, 0.3);
            transform: scale(0.98);
            box-shadow: none;
        }

        .color-indicator {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            margin-right: 5px;
            flex-shrink: 0;
            cursor: grab;
            align-content: center;
            text-align: center;
        }
        .color-indicator svg{
            color: #fff;
            width: 13px;
            mix-blend-mode: screen;
            opacity: 0.8;
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
            padding: 8px 12px;
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
            background: #fff;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 0, 0, 0.04);
            box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.1);
            border-radius: 20px;
            padding: 3px 12px 3px 3px;
            display: flex;
            align-items: center;
            width: 200px;
            opacity: 1 !important;
            box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
        }

        .drag-ghost .color-indicator {
             width: 25px;
            height: 25px;
            border-radius: 50%;
            margin-right: 5px;
            flex-shrink: 0;
            cursor: grab;
            align-content: center;
            text-align: center;
        }

        .drag-ghost  .color-indicator svg{
            color: #000;
            width: 13px;
            mix-blend-mode: overlay;
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
            animation: captureEffect 1s ease forwards;
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
                top:2.5vw;
                left:2.5vw;
                width: 95vw;
                height: 95vh;
                border-radius: 0px;
            }
            30% {
                opacity: 0.8;
                top:2.5vw;
                left:2.5vw;
                width: 95vw;
                height: 95vh;
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
        const favoritos = garantirOrdemFavoritos();
        const barra = document.getElementById('ged-favorites-dock');
        const ultimosFavoritos = GM_getValue('lastFavorites', []);
        const botaoAdicionar = barra.querySelector('#add-favorite-btn');

        // Remover itens antigos (exceto o botão adicionar e separadores)
        Array.from(barra.children).forEach(filho => {
            if (filho.id !== 'add-favorite-btn') {
                filho.remove();
            }
        });

        // Ordenar favoritos pelo índice de ordem
        const favoritosOrdenados = [...favoritos].sort((a, b) => a.order - b.order);

        // Adicionar cada favorito à barra na ordem exata como foi salva
        favoritosOrdenados.forEach((favorito, index) => {
            if (favorito.tipo === 'separador') {
                // Se for o último item e for um separador, não adiciona
                if (index === favoritosOrdenados.length - 1) {
                    return;
                }else{
                const separador = document.createElement('div');
                separador.className = 'separador';
                separador.draggable = true;
                separador.addEventListener('dragstart', iniciarArrastoSeparador);
                separador.addEventListener('dragend', finalizarArrastoSeparador);
                barra.appendChild(separador);
            }
            } else {
                const ehNovoItem = !ultimosFavoritos.some(ultimoFav => ultimoFav.url === favorito.url);
                const item = criarItemFavorito(favorito);

                if (ehNovoItem) {
                    // Criar e adicionar o efeito de captura
                    const capturaTela = document.createElement('div');
                    capturaTela.id = 'screen-capture';
                    document.body.appendChild(capturaTela);

                    setTimeout(() => {
                    // Posicionar o elemento de captura no local do novo item
                    let botaoAdicionarRect = botaoAdicionar.getBoundingClientRect();
                    let barraRect = barra.getBoundingClientRect();
                        capturaTela.style.left = `${botaoAdicionarRect.left}px`;
                        capturaTela.style.top = `${barraRect.top+40}px`;
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
            }
        });

        // Remover separadores vizinhos após carregar todos os itens
        const separadores = [...barra.querySelectorAll('.separador')];
        for (let i = separadores.length - 1; i > 0; i--) {
            if (separadores[i].previousElementSibling?.classList.contains('separador')) {
                separadores[i].remove();
            }
        }

        // Adicionar separador original no final
        const separadorOriginal = document.createElement('div');
        separadorOriginal.className = 'separador';
        separadorOriginal.classList.add('separador-original');
        separadorOriginal.draggable = true;
        separadorOriginal.addEventListener('dragstart', iniciarArrastoSeparador);
        separadorOriginal.addEventListener('dragend', finalizarArrastoSeparador);
        barra.appendChild(separadorOriginal);

        // Salvar o estado atual para comparação futura
        GM_setValue('lastFavorites', favoritosOrdenados);
    }

    // Função auxiliar para criar um item de favorito
    function criarItemFavorito(favorito) {
        const item = document.createElement('a');
        const icone = iconesDisponiveis.find(ico => ico.id === favorito.icon);
        let icosvg = "";
        if(icone !== undefined){
            icosvg = icone.svg;
        }else{
            icosvg = '<svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M956.42 668.186L672 512l284.42-156.186c23.59-12.954 31.922-42.768 18.464-66.074l-38.96-67.482c-13.456-23.306-43.44-30.998-66.454-17.046L592 373.436l6.95-324.408C599.526 22.122 577.874 0 550.96 0h-77.92c-26.912 0-48.566 22.122-47.988 49.028L432 373.436 154.53 205.214c-23.012-13.952-52.998-6.26-66.454 17.046l-38.96 67.482c-13.456 23.306-5.124 53.12 18.466 66.074L352 512 67.58 668.186c-23.59 12.954-31.922 42.768-18.464 66.074l38.96 67.482c13.456 23.306 43.442 30.998 66.454 17.046L432 650.564l-6.95 324.408C424.474 1001.878 446.128 1024 473.04 1024h77.922c26.912 0 48.566-22.122 47.99-49.028L592 650.564l277.47 168.222c23.012 13.952 52.998 6.26 66.454-17.046l38.96-67.482c13.456-23.306 5.126-53.118-18.464-66.072z" fill="" /></svg>';
        }
        item.className = 'dock-item';
        item.href = favorito.url;
        item.draggable = true;

        item.innerHTML = `
            <i class="edit-favorite" data-url="${favorito.url}"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></i>
            <div class="color-indicator" style="background-color: ${favorito.color}"> ${icosvg} </div>
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

        // Adicionar evento para editar favorito
        const botaoEditar = item.querySelector('.edit-favorite');
        botaoEditar.addEventListener('click', (e) => {
            e.preventDefault();
            editarFavorito(favorito.url);
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
        const itensIrmaos = [...barra.querySelectorAll('.dock-item:not(.dragging), .separador:not(.dragging)')];

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
        const itens = [...barra.querySelectorAll('.dock-item:not(#add-favorite-btn), .separador')];

        // Remover separadores vizinhos
        for (let i = itens.length - 1; i > 0; i--) {
            if (itens[i].classList.contains('separador') &&
                itens[i-1].classList.contains('separador')) {
                itens[i].remove();
                itens.splice(i, 1);
            }
        }

        // Obter todos os favoritos atuais
        const favoritosAtuais = GM_getValue('gedFavorites', []);

        // Criar um mapa de favoritos por URL para fácil acesso
        const mapaFavoritos = new Map(favoritosAtuais.map(fav => [fav.url, fav]));

        // Criar nova lista de favoritos mantendo todas as propriedades originais
        const favoritosAtualizados = itens.map((item, index) => {
            if (item.classList.contains('separador')) {
                return {
                    tipo: 'separador',
                    order: index
                };
            }

            const url = item.href;
            const favoritoExistente = mapaFavoritos.get(url);

            if (favoritoExistente) {
                return {
                    ...favoritoExistente,
                    title: item.querySelector('span').textContent,
                    order: index
                };
            }

            return {
                url: url,
                title: item.querySelector('span').textContent,
                color: item.querySelector('.color-indicator').style.backgroundColor,
                addedAt: new Date().toISOString(),
                order: index
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

        // Reordenar os favoritos após a remoção
        const favoritosReordenados = favoritosAtualizados.map((fav, index) => ({
            ...fav,
            order: index
        }));

        GM_setValue('gedFavorites', favoritosReordenados);

        // Recarregar a barra
        carregarFavoritos();
        atualizarOrdemFavoritos();

    }

    // Funções para manipular o separador
    function iniciarArrastoSeparador(e) {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', 'separador');

        // Se o separador sendo arrastado é o original (está no final da barra)
        const barra = document.getElementById('ged-favorites-dock');
        if (e.target === barra.lastElementChild) {
            // Criar uma cópia do separador
            const copiaSeparador = document.createElement('div');
            copiaSeparador.className = 'separador';
            copiaSeparador.draggable = true;
            copiaSeparador.addEventListener('dragstart', iniciarArrastoSeparador);
            copiaSeparador.addEventListener('dragend', finalizarArrastoSeparador);

            // Inserir a cópia logo após o separador original
            barra.insertBefore(copiaSeparador, e.target.nextSibling);
        }
    }

    function finalizarArrastoSeparador(e) {
        e.target.classList.remove('dragging');
        atualizarOrdemFavoritos();
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
    // Obtém a versão atual do script
    const versaoAtual = GM_info.script.version;

    // Obtém a última versão em que o efeito foi executado
    const ultimaVersaoExecutada = GM_getValue('ultimaVersaoEfeitoBrilho', '0.0');

    // Se a versão atual for diferente da última versão executada, executa o efeito
    if (versaoAtual !== ultimaVersaoExecutada) {
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

        // Obtém o botão se o ID foi fornecido
        const botao = options.botaoId ? document.getElementById(options.botaoId) : null;
        let backgroundOriginal = null;

        if (botao) {
            // Salva o background original do botão
            backgroundOriginal = botao.style.background;
        }

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

                @keyframes botao-brilho {
                    0% {
                        background: ${backgroundOriginal || 'rgba(57, 130, 247, 0.5)'};
                    }
                    25% {
                        background: rgba(52, 165, 104, 0.7);
                    }
                    50% {
                        background: rgba(57, 130, 247, 0.9);
                    }
                    75% {
                        background: rgba(52, 165, 104, 0.7);
                    }
                    100% {
                        background: ${backgroundOriginal || 'rgba(57, 130, 247, 0.5)'};
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
        setTimeout(() => {
            container.appendChild(glowBefore);
            container.appendChild(glowAfter);

            // Se houver um botão, anima seu background
            if (botao) {
                botao.style.animation = `botao-brilho ${config.duration}ms linear`;
            }
        }, config.delay);

        // Após a animação terminar, restaura o background original do botão e armazena a versão atual
        setTimeout(() => {
            glowBefore.remove();
            glowAfter.remove();
            if (botao) {
                botao.style.animation = '';
                botao.style.background = backgroundOriginal;
            }
            GM_setValue('ultimaVersaoEfeitoBrilho', versaoAtual);
        }, config.duration + config.delay);
    }
}

    // Função para editar um favorito
    function editarFavorito(url) {
        const favoritos = GM_getValue('gedFavorites', []);
        const favorito = favoritos.find(fav => fav.url === url);
        if (!favorito) return;

        // Encontrar o item do favorito no DOM
        const itemFavorito = document.querySelector(`.dock-item[href="${url}"]`);
        if (!itemFavorito) return;

        // Forçar reflow antes de adicionar a classe
        itemFavorito.offsetHeight;

        const barra = document.getElementById('ged-favorites-dock');
        const barraRect = barra.getBoundingClientRect();

        // Criar clone do item
        const cloneItem = itemFavorito.cloneNode(true);
        cloneItem.style.position = 'fixed';
        cloneItem.style.top = `${itemFavorito.getBoundingClientRect().top-barraRect.top-5}px`;
        cloneItem.style.left = `${itemFavorito.getBoundingClientRect().left}px`;
        cloneItem.classList.add('editando-item');
        barra.appendChild(cloneItem);
        // Adicionar classe de edição

       setTimeout(() => {
        cloneItem.style.left = `10px`;
        cloneItem.style.top = `10px`;
       }, 100);

        // Criar ou reutilizar o popup de edição
        let popupEditar = document.querySelector('.popupeditar');
        if (!popupEditar) {
            popupEditar = document.createElement('div');
            popupEditar.className = 'popupeditar';
            popupEditar.innerHTML = `
                <input type="text" placeholder="Nome do favorito">
                <br><br>
                <div class="cores-container">
                    ${coresDisponiveis.map(cor => `
                        <div class="cor-circulo" style="background-color: ${cor}" data-color="${cor}"></div>
                    `).join('')}
                </div>
                <br>
                <div class="icones-container">
                    ${iconesDisponiveis.map(icone => `
                        <button class="icone-redondo" data-icon-id="${icone.id}">
                            ${icone.svg}
                        </button>
                    `).join('')}
                </div>
                <div class="botoes-container">
                    <button class="botao-cancelar">Cancelar</button>
                    <button class="botao-confirmar">Salvar</button>
                </div>
            `;
            barra.appendChild(popupEditar);
        }

        barra.classList.add('hover-f');
        // Posicionar o popup abaixo do item

        // Calcular a posição relativa à barra de favoritos
        popupEditar.style.left = `10px`;
        popupEditar.style.top = `52px`;

        // Forçar reflow antes de mostrar o popup
        popupEditar.offsetHeight;

     setTimeout(() => {
            popupEditar.classList.add('visible');
            // Adicionar foco no input após a animação
            setTimeout(() => {
                const input = popupEditar.querySelector('input');
                input.focus();
            }, 200);
        }, 400);


        // Preencher os valores atuais
        const input = popupEditar.querySelector('input');
        input.value = favorito.title;

        // Selecionar a cor atual
        const corAtual = popupEditar.querySelector(`.cor-circulo[data-color="${favorito.color}"]`);
        if (corAtual) {
            corAtual.classList.add('selected');
        }

        popupEditar.querySelector(`.icone-redondo`).classList.remove(`selected`);
        // Selecionar o ícone atual
        const iconeAtual = popupEditar.querySelector(`.icone-redondo[data-icon-id="${favorito.icon || 'document'}"]`);
        if (iconeAtual) {
            iconeAtual.classList.add('selected');
        }

        // Adicionar eventos
        const corCirculos = popupEditar.querySelectorAll('.cor-circulo');
        const iconeBotoes = popupEditar.querySelectorAll('.icone-redondo');
        const botaoConfirmar = popupEditar.querySelector('.botao-confirmar');
        const botaoCancelar = popupEditar.querySelector('.botao-cancelar');

        // Função para selecionar cor
        function selecionarCor(e) {
            corCirculos.forEach(c => c.classList.remove('selected'));
            e.target.classList.add('selected');

            // Atualizar a cor do clone
            const novaCor = e.target.dataset.color;
            const colorIndicator = cloneItem.querySelector('.color-indicator');
            colorIndicator.style.backgroundColor = novaCor;
        }

        // Função para selecionar ícone
        function selecionarIcone(e) {
            iconeBotoes.forEach(b => b.classList.remove('selected'));
            e.currentTarget.classList.add('selected');

            // Atualizar o ícone do clone
            const novoIcone = e.currentTarget.dataset.iconId;
            const icone = iconesDisponiveis.find(ico => ico.id === novoIcone);
            const colorIndicator = cloneItem.querySelector('.color-indicator');
            if (icone) {
                colorIndicator.innerHTML = icone.svg;
            }
        }

        // Função para atualizar o título do clone
        input.addEventListener('input', () => {
            const novoTitulo = input.value.trim();
            const tituloSpan = cloneItem.querySelector('span');
            tituloSpan.textContent = novoTitulo || favorito.title;
        });

        // Função para confirmar edição
        function confirmarEdicao() {
            const novaCor = popupEditar.querySelector('.cor-circulo.selected')?.dataset.color;
            const novoIcone = popupEditar.querySelector('.icone-redondo.selected')?.dataset.iconId;
            const novoTitulo = input.value.trim();

            const favoritosAtualizados = favoritos.map(fav => {
                if (fav.url === url) {
                    return {
                        ...fav,
                        title: novoTitulo || fav.title,
                        color: novaCor || fav.color,
                        icon: novoIcone || fav.icon
                    };
                }
                return fav;
            });

            GM_setValue('gedFavorites', favoritosAtualizados);
            fecharPopup();
            setTimeout(() => {
            carregarFavoritos();
             }, 600);
        }

        // Função para cancelar edição
        async function cancelarEdicao() {
            fecharPopup();
             setTimeout(() => {
            carregarFavoritos();
             }, 600);
        }

        // Fechar popup
        function fecharPopup() {
            popupEditar.classList.remove('visible');

            setTimeout(() => {
                document.removeEventListener('click', fecharPopupExterno);
                cloneItem.classList.remove(`editando-item`);
                popupEditar.remove();
                barra.classList.remove('hover-f');
                cloneItem.style.top = `${itemFavorito.getBoundingClientRect().top-barraRect.top-5}px`;
                cloneItem.style.left = `${itemFavorito.getBoundingClientRect().left}px`;
                setTimeout(() => {
                    cloneItem.remove();
                }, 300);
            }, 300);
        }

        // Fechar popup ao clicar fora
        function fecharPopupExterno(e) {
            if (!popupEditar.contains(e.target) && !itemFavorito.contains(e.target)) {
                fecharPopup();
            }
        }

        // Adicionar eventos
        corCirculos.forEach(circulo => {
            circulo.addEventListener('click', selecionarCor);
        });
        iconeBotoes.forEach(botao => {
            botao.addEventListener('click', selecionarIcone);
        });
        if (botaoConfirmar) botaoConfirmar.addEventListener('click', confirmarEdicao);
        if (botaoCancelar) botaoCancelar.addEventListener('click', cancelarEdicao);

        // Adicionar evento de fechar
        document.addEventListener('click', fecharPopupExterno);
    }

})();
