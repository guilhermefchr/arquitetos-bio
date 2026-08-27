/**
 * DIAGNÓSTICO COMERCIAL INTERATIVO - GUILHERME (@tekton.guilherme)
 * Tekton Digital • Estruturação Comercial, Pré-Venda & Automação
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. CONFIGURAÇÕES E ESTADO GLOBAL
  // =========================================================================
  const CONFIG = {
    WEBHOOK_URL: 'https://hook.us2.make.com/fa4i37r16p3mjadowmycsyyku1qtyb4b',
    INSTAGRAM_HANDLE: '@tekton.guilherme',
    WHATSAPP_NUMBER: '5511995507196',
    AUTO_ADVANCE_DELAY_MS: 320,
    LOADING_ANIMATION_MS: 850
  };

  // Matriz de perguntas com identificadores internos estáveis (IDs) e categorias
  const QUESTIONS = [
    {
      id: 'estrutura_pagina',
      step: 1,
      title: 'Como sua empresa apresenta e vende sua oferta hoje?',
      subtitle: 'Identifique o primeiro ponto de contato com o potencial cliente.',
      type: 'single',
      toast: 'A forma como a oferta é apresentada influencia a qualidade e a intenção dos contatos.',
      options: [
        {
          id: 'pagina_dedicada',
          label: 'Tenho uma página de vendas dedicada.',
          category: 'escala'
        },
        {
          id: 'sem_pagina',
          label: 'Atendo diretamente pelo WhatsApp ou direct, sem uma página estruturada.',
          category: 'pagina'
        },
        {
          id: 'baixa_conversao',
          label: 'Tenho uma página de vendas, mas ela converte pouco.',
          category: 'pagina'
        },
        {
          id: 'site_generico',
          label: 'Tenho apenas um site institucional ou um link genérico na bio.',
          category: 'pagina'
        }
      ]
    },
    {
      id: 'qualificacao_lead',
      step: 2,
      title: 'Como sua empresa qualifica os leads antes do atendimento?',
      subtitle: 'Entenda quanto tempo sua equipe perde com contatos sem perfil.',
      type: 'single',
      toast: 'Uma boa pré-venda reduz desperdício e prepara melhor a conversa comercial.',
      options: [
        {
          id: 'com_filtro',
          label: 'Uso um formulário ou perguntas estratégicas antes da conversa.',
          category: 'escala'
        },
        {
          id: 'sem_filtro',
          label: 'Os leads chegam sem filtro e minha equipe atende muitos contatos sem perfil.',
          category: 'qualificacao'
        },
        {
          id: 'qualificacao_manual',
          label: 'Faço a qualificação manualmente durante a conversa de vendas.',
          category: 'qualificacao'
        },
        {
          id: 'filtro_previo',
          label: 'Filtro os leads previamente por orçamento, faturamento ou perfil.',
          category: 'escala'
        }
      ]
    },
    {
      id: 'automacao_crm',
      step: 3,
      title: 'O que acontece com os dados do lead depois que ele entra em contato?',
      subtitle: 'Veja se sua equipe consegue acompanhar cada oportunidade sem depender de mensagens soltas.',
      type: 'single',
      toast: 'Sem organização e acompanhamento, oportunidades podem desaparecer mesmo quando o lead é bom.',
      options: [
        {
          id: 'crm_integrado',
          label: 'Os dados vão automaticamente para um CRM ou planilha organizada.',
          category: 'escala'
        },
        {
          id: 'mensagens_soltas',
          label: 'Recebo apenas mensagens soltas no WhatsApp, sem centralização.',
          category: 'automacao'
        },
        {
          id: 'acompanhamento_manual',
          label: 'Anoto e acompanho os leads manualmente.',
          category: 'automacao'
        },
        {
          id: 'crm_sem_integracao',
          label: 'Tenho um CRM, mas os dados não chegam integrados automaticamente.',
          category: 'automacao'
        }
      ]
    },
    {
      id: 'faixa_faturamento',
      step: 4,
      title: 'Qual é a faixa de faturamento mensal atual da sua empresa?',
      subtitle: 'Essa informação ajuda a contextualizar o momento e a prioridade da sua operação comercial.',
      type: 'single',
      toast: 'Estamos cruzando suas respostas para indicar o próximo ponto prioritário.',
      options: [
        {
          id: 'ate_10k',
          label: 'Até R$ 10 mil por mês',
          tier: 'COLD_LEAD_ICP'
        },
        {
          id: '10k_30k',
          label: 'De R$ 10 mil a R$ 30 mil por mês',
          tier: 'WARM_LEAD_ICP'
        },
        {
          id: '30k_100k',
          label: 'De R$ 30 mil a R$ 100 mil por mês',
          tier: 'HOT_LEAD_ICP'
        },
        {
          id: 'acima_100k',
          label: 'Acima de R$ 100 mil por mês',
          tier: 'HOT_LEAD_ICP'
        }
      ]
    }
  ];

  const RESULT_CATEGORIES = {
    pagina: {
      tag: 'GARGALO: CONVERSÃO DA OFERTA',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
      title: 'Seu principal gargalo parece estar na forma como sua oferta é apresentada.',
      text: 'Quando a página não deixa claro o valor da oferta, o público ideal pode abandonar o contato ou chegar sem entender se a solução é adequada para ele.'
    },
    qualificacao: {
      tag: 'GARGALO: PRÉ-VENDA E QUALIFICAÇÃO',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
      title: 'Seu principal gargalo parece estar na qualificação dos leads.',
      text: 'Sem perguntas estratégicas antes do atendimento, sua equipe pode perder horas com contatos sem perfil e deixar menos tempo para as oportunidades reais.'
    },
    automacao: {
      tag: 'GARGALO: ACOMPANHAMENTO COMERCIAL',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
      title: 'Seu principal gargalo parece estar na organização e no acompanhamento dos leads.',
      text: 'Quando os contatos ficam espalhados em mensagens ou controles manuais, aumentam os atrasos, esquecimentos e oportunidades sem follow-up.'
    },
    escala: {
      tag: 'OPORTUNIDADE: OTIMIZAÇÃO E ESCALA',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
      title: 'Sua operação parece ter uma boa base para otimizar e escalar.',
      text: 'Com página, qualificação e acompanhamento estruturados, o próximo passo é melhorar a conversão e aumentar o volume de oportunidades qualificadas sem perder controle do processo.'
    }
  };

  // State
  let state = {
    currentScreen: 'hero',
    currentStepIndex: 0,
    answers: {
      estrutura_pagina: '',
      qualificacao_lead: '',
      automacao_crm: '',
      faixa_faturamento: ''
    },
    selectedOptionIds: {
      estrutura_pagina: '',
      qualificacao_lead: '',
      automacao_crm: '',
      faixa_faturamento: ''
    },
    calculatedResultCategory: null,
    checklistRequested: false
  };

  // DOM Elements
  const screens = {
    hero: document.getElementById('screenHero'),
    question: document.getElementById('screenQuestion'),
    loading: document.getElementById('screenLoading'),
    result: document.getElementById('screenResult'),
    thankYou: document.getElementById('screenThankYou')
  };

  const btnStartDiagnostic = document.getElementById('btnStartDiagnostic');
  const btnStepBack = document.getElementById('btnStepBack');
  const btnStepContinue = document.getElementById('btnStepContinue');
  const stepCounterText = document.getElementById('stepCounterText');
  const progressBarFill = document.getElementById('progressBarFill');
  const microToast = document.getElementById('microToast');
  const questionTitle = document.getElementById('questionTitle');
  const questionSubtitle = document.getElementById('questionSubtitle');
  const optionsGrid = document.getElementById('optionsGrid');
  const questionFooterAction = document.getElementById('questionFooterAction');

  const resultTag = document.getElementById('resultTag');
  const resultTitle = document.getElementById('resultTitle');
  const resultText = document.getElementById('resultText');
  const summaryTags = document.getElementById('summaryTags');

  const btnAcceptChecklist = document.getElementById('btnAcceptChecklist');
  const btnDeclineChecklist = document.getElementById('btnDeclineChecklist');
  const contactForm = document.getElementById('contactForm');
  const offerInitialButtons = document.getElementById('offerInitialButtons');
  const declineArea = document.getElementById('declineArea');
  const btnRestartDiagnostic = document.getElementById('btnRestartDiagnostic');

  const contactValueInput = document.getElementById('contactValueInput');
  const contactNameInput = document.getElementById('contactNameInput');
  const btnSubmitContact = document.getElementById('btnSubmitContact');

  const headerHandleText = document.getElementById('headerHandleText');
  const headerInstagramLink = document.getElementById('headerInstagramLink');
  const footerInstagramLink = document.getElementById('footerInstagramLink');
  const btnWhatsAppSuccess = document.getElementById('btnWhatsAppSuccess');
  const btnReturnInstagramDecline = document.getElementById('btnReturnInstagramDecline');

  const btnOpenSettings = document.getElementById('btnOpenSettings');
  const settingsModal = document.getElementById('settingsModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnSaveSettings = document.getElementById('btnSaveSettings');
  const webhookUrlInput = document.getElementById('webhookUrlInput');
  const instagramHandleInput = document.getElementById('instagramHandleInput');
  const whatsappNumberInput = document.getElementById('whatsappNumberInput');
  const privacyPolicyLink = document.getElementById('privacyPolicyLink');

  function init() {
    updateInstagramLinks(CONFIG.INSTAGRAM_HANDLE);
    loadSavedSession();
    setupEventListeners();
  }

  function saveSession() {
    try {
      sessionStorage.setItem('guilherme_diag_state', JSON.stringify({
        currentScreen: state.currentScreen,
        currentStepIndex: state.currentStepIndex,
        answers: state.answers,
        selectedOptionIds: state.selectedOptionIds,
        calculatedResultCategory: state.calculatedResultCategory
      }));
    } catch (e) {
      console.warn('sessionStorage unreachable', e);
    }
  }

  function loadSavedSession() {
    try {
      const saved = sessionStorage.getItem('guilherme_diag_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.answers) {
          state = { ...state, ...parsed };
          if (state.currentScreen === 'question') {
            renderStep(state.currentStepIndex);
            switchScreen('question');
            return;
          } else if (state.currentScreen === 'result') {
            displayResult();
            switchScreen('result');
            return;
          } else if (state.currentScreen === 'thankYou') {
            updateWhatsAppRedirectUrl(state.answers.nome);
            switchScreen('thankYou');
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Error reading saved session', e);
    }
    switchScreen('hero');
  }

  function updateInstagramLinks(handle) {
    const formatted = handle.startsWith('@') ? handle : `@${handle}`;
    const cleanHandle = formatted.replace('@', '');
    const fullUrl = `https://instagram.com/${cleanHandle}`;

    if (headerHandleText) headerHandleText.textContent = formatted;
    if (headerInstagramLink) headerInstagramLink.href = fullUrl;
    if (footerInstagramLink) footerInstagramLink.href = fullUrl;
    if (btnReturnInstagramDecline) btnReturnInstagramDecline.href = fullUrl;
  }

  function updateWhatsAppRedirectUrl(leadName) {
    if (!btnWhatsAppSuccess) return;

    // IMPORTANTE: O botão final deve redirecionar o lead para o WhatsApp do GUILHERME (destinatário)
    // O WhatsApp preenchido pelo lead no formulário é enviado para o Make/Webhook para contato futuro.
    let guilhermeNumber = (CONFIG.WHATSAPP_NUMBER || '').replace(/\D/g, '');
    
    if (guilhermeNumber.length >= 10 && !guilhermeNumber.startsWith('55')) {
      guilhermeNumber = '55' + guilhermeNumber;
    }

    const nameStr = (leadName && leadName !== 'Não informado') ? `Sou ${leadName}. ` : '';
    const message = `Fala Guilherme! ${nameStr}Acabei de preencher o diagnóstico comercial e gostaria de receber minha análise completa!`;
    const encoded = encodeURIComponent(message);

    // Se o número do Guilherme estiver configurado, redireciona diretamente para ele
    if (guilhermeNumber) {
      btnWhatsAppSuccess.href = `https://api.whatsapp.com/send?phone=${guilhermeNumber}&text=${encoded}`;
    } else {
      btnWhatsAppSuccess.href = `https://api.whatsapp.com/send?text=${encoded}`;
    }
  }

  function switchScreen(screenName) {
    state.currentScreen = screenName;
    saveSession();

    Object.keys(screens).forEach(key => {
      if (key === screenName) {
        screens[key].classList.add('active');
      } else {
        screens[key].classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderStep(index) {
    const currentQ = QUESTIONS[index];
    if (!currentQ) return;

    state.currentStepIndex = index;

    stepCounterText.textContent = `Etapa ${currentQ.step} de ${QUESTIONS.length}`;
    const percentage = (currentQ.step / QUESTIONS.length) * 100;
    progressBarFill.style.width = `${percentage}%`;

    btnStepBack.style.visibility = index > 0 ? 'visible' : 'hidden';

    showMicroToast(currentQ.toast);

    questionTitle.textContent = currentQ.title;
    questionSubtitle.textContent = currentQ.subtitle || '';

    optionsGrid.innerHTML = '';
    questionFooterAction.style.display = 'none';

    currentQ.options.forEach(opt => {
      const isSelected = state.selectedOptionIds[currentQ.id] === opt.id || state.answers[currentQ.id] === opt.label;
      const card = document.createElement('div');
      card.className = `option-card ${isSelected ? 'selected' : ''}`;
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

      card.innerHTML = `
        <span class="option-card-label">${opt.label}</span>
        <span class="option-radio-indicator"></span>
      `;

      card.addEventListener('click', () => handleOptionSelect(currentQ.id, opt, card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOptionSelect(currentQ.id, opt, card);
        }
      });

      optionsGrid.appendChild(card);
    });

    saveSession();
  }

  function showMicroToast(message) {
    if (!message) {
      microToast.classList.remove('visible');
      return;
    }
    microToast.textContent = message;
    microToast.classList.add('visible');
  }

  function handleOptionSelect(questionId, optionObj, cardElement) {
    const siblings = optionsGrid.querySelectorAll('.option-card');
    siblings.forEach(el => el.classList.remove('selected'));
    cardElement.classList.add('selected');

    state.answers[questionId] = optionObj.label;
    state.selectedOptionIds[questionId] = optionObj.id;
    saveSession();

    setTimeout(() => {
      if (state.currentStepIndex < QUESTIONS.length - 1) {
        renderStep(state.currentStepIndex + 1);
      } else {
        processAndShowResult();
      }
    }, CONFIG.AUTO_ADVANCE_DELAY_MS);
  }

  function processAndShowResult() {
    switchScreen('loading');

    state.calculatedResultCategory = calculateDiagnosticCategory();
    saveSession();

    setTimeout(() => {
      displayResult();
      switchScreen('result');
    }, CONFIG.LOADING_ANIMATION_MS);
  }

  /**
   * Classificação do Diagnóstico com base nos IDs internos estáveis.
   * Regras:
   * 1. Problema de Página ('sem_pagina', 'baixa_conversao', 'site_generico') -> 'pagina'
   * 2. Problema de Qualificação ('sem_filtro', 'qualificacao_manual') -> 'qualificacao'
   * 3. Problema de Automação/CRM ('mensagens_soltas', 'acompanhamento_manual', 'crm_sem_integracao') -> 'automacao'
   * 4. Estrutura completa pronta ('pagina_dedicada' + 'com_filtro'/'filtro_previo' + 'crm_integrado') -> 'escala'
   */
  function calculateDiagnosticCategory() {
    const paginaId = state.selectedOptionIds.estrutura_pagina;
    const qualifId = state.selectedOptionIds.qualificacao_lead;
    const autoId = state.selectedOptionIds.automacao_crm;

    // 1. Gargalo de Oferta/Página
    if (['sem_pagina', 'baixa_conversao', 'site_generico'].includes(paginaId)) {
      return 'pagina';
    }

    // 2. Gargalo de Pré-venda e Qualificação
    if (['sem_filtro', 'qualificacao_manual'].includes(qualifId)) {
      return 'qualificacao';
    }

    // 3. Gargalo de Acompanhamento Comercial & Automação
    if (['mensagens_soltas', 'acompanhamento_manual', 'crm_sem_integracao'].includes(autoId)) {
      return 'automacao';
    }

    // 4. Oportunidade de Otimização e Escala
    return 'escala';
  }

  function calculateLeadTier() {
    const fatId = state.selectedOptionIds.faixa_faturamento;
    const fatLabel = state.answers.faixa_faturamento || '';

    if (fatId === 'acima_100k' || fatId === '30k_100k' || fatLabel.includes('Acima de R$ 100 mil') || fatLabel.includes('R$ 30 mil a R$ 100 mil')) {
      return { tier: 'HOT_LEAD_ICP', label: 'Alta Prioridade (ICP Quente)' };
    }
    if (fatId === '10k_30k' || fatLabel.includes('R$ 10 mil a R$ 30 mil')) {
      return { tier: 'WARM_LEAD_ICP', label: 'Média Prioridade (Lead em Crescimento)' };
    }
    return { tier: 'COLD_LEAD_ICP', label: 'Lead Inicial' };
  }

  /**
   * Pontuação do Processo Comercial estilo PageSpeed (0 a 100)
   */
  function calculateDiagnosticScore() {
    const paginaId = state.selectedOptionIds.estrutura_pagina;
    const qualifId = state.selectedOptionIds.qualificacao_lead;
    const autoId = state.selectedOptionIds.automacao_crm;

    const scoresMap = {
      // Oferta (máx 30)
      pagina_dedicada: 30, baixa_conversao: 15, site_generico: 10, sem_pagina: 5,
      // Qualificação (máx 35)
      filtro_previo: 35, com_filtro: 30, qualificacao_manual: 15, sem_filtro: 5,
      // Automação & CRM (máx 35)
      crm_integrado: 35, crm_sem_integracao: 20, acompanhamento_manual: 10, mensagens_soltas: 5
    };

    const sP = scoresMap[paginaId] || 10;
    const sQ = scoresMap[qualifId] || 10;
    const sA = scoresMap[autoId] || 10;

    return Math.min(100, Math.max(15, sP + sQ + sA));
  }

  function displayResult() {
    const catKey = state.calculatedResultCategory || calculateDiagnosticCategory();
    state.calculatedResultCategory = catKey;
    const catData = RESULT_CATEGORIES[catKey] || RESULT_CATEGORIES.pagina;

    const resultIconEl = document.getElementById('resultIcon');
    if (resultIconEl && catData.icon) {
      resultIconEl.innerHTML = catData.icon;
    }

    if (resultTag) resultTag.textContent = catData.tag;
    if (resultTitle) resultTitle.textContent = catData.title;
    if (resultText) resultText.textContent = catData.text;

    // Renderizar o Medidor de Pontuação Comercial Estilo PageSpeed
    const score = calculateDiagnosticScore();
    const scoreValEl = document.getElementById('scoreValue');
    const scoreRingEl = document.getElementById('scoreRingProgress');
    const scoreBadgeEl = document.getElementById('scoreStatusBadge');
    const scoreSubtitleEl = document.getElementById('scoreSubtitle');

    if (scoreValEl && scoreRingEl) {
      const circumference = 314.16; // 2 * PI * 50
      scoreRingEl.style.strokeDasharray = `${circumference}`;
      
      let currentVal = 0;
      const duration = 1100;
      const startTime = performance.now();

      function animateScore(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        currentVal = Math.round(easeOut * score);
        scoreValEl.textContent = currentVal;

        const offset = circumference - (easeOut * (score / 100) * circumference);
        scoreRingEl.style.strokeDashoffset = offset;

        if (progress < 1) {
          requestAnimationFrame(animateScore);
        }
      }
      requestAnimationFrame(animateScore);

      scoreRingEl.classList.remove('score-ring-critical', 'score-ring-warning', 'score-ring-good');
      if (scoreBadgeEl) {
        scoreBadgeEl.classList.remove('badge-critical', 'badge-warning', 'badge-good');
      }

      if (score < 50) {
        scoreRingEl.classList.add('score-ring-critical');
        if (scoreBadgeEl) {
          scoreBadgeEl.textContent = 'Gargalo Crítico • Alta Perda';
          scoreBadgeEl.classList.add('badge-critical');
        }
        if (scoreSubtitleEl) scoreSubtitleEl.textContent = 'Seu funil possui vazamentos significativos de contatos';
      } else if (score < 80) {
        scoreRingEl.classList.add('score-ring-warning');
        if (scoreBadgeEl) {
          scoreBadgeEl.textContent = 'Maturidade Média • Oportunidade de Otimização';
          scoreBadgeEl.classList.add('badge-warning');
        }
        if (scoreSubtitleEl) scoreSubtitleEl.textContent = 'Operação funcional com pontos para alavancagem';
      } else {
        scoreRingEl.classList.add('score-ring-good');
        if (scoreBadgeEl) {
          scoreBadgeEl.textContent = 'Alta Performance • Pronto para Escalar';
          scoreBadgeEl.classList.add('badge-good');
        }
        if (scoreSubtitleEl) scoreSubtitleEl.textContent = 'Estrutura comercial pronta para tração e escala';
      }
    }

    if (summaryTags) {
      summaryTags.innerHTML = '';
    }
  }

  function clearFormError() {
    if (contactValueInput && contactValueInput.parentElement) {
      contactValueInput.parentElement.classList.remove('has-error');
    }
    if (contactNameInput && contactNameInput.parentElement) {
      contactNameInput.parentElement.classList.remove('has-error');
    }
  }

  function validateContactForm() {
    const nameVal = contactNameInput ? contactNameInput.value.trim() : '';
    const phoneVal = contactValueInput ? contactValueInput.value.trim() : '';
    let isValid = true;

    if (!nameVal) {
      showFormError(contactNameInput, 'Por favor, informe seu nome.');
      isValid = false;
    } else {
      clearFieldError(contactNameInput);
    }

    if (!phoneVal) {
      showFormError(contactValueInput, 'Preenchimento obrigatório.');
      isValid = false;
    } else if (phoneVal.replace(/\D/g, '').length < 10) {
      showFormError(contactValueInput, 'Insira um WhatsApp válido com DDD.');
      isValid = false;
    } else {
      clearFieldError(contactValueInput);
    }

    return isValid;
  }

  function clearFieldError(inputEl) {
    if (inputEl && inputEl.parentElement) {
      inputEl.parentElement.classList.remove('has-error');
    }
  }

  function showFormError(inputEl, msg) {
    if (inputEl && inputEl.parentElement) {
      const errEl = inputEl.parentElement.querySelector('.form-error');
      if (errEl) errEl.textContent = msg;
      inputEl.parentElement.classList.add('has-error');
    }
  }

  function buildPersonalizedMessage(state, extraData) {
    const rawName = (extraData && extraData.contato && extraData.contato.nome && extraData.contato.nome !== 'Não informado')
      ? extraData.contato.nome
      : (state.answers.nome && state.answers.nome !== 'Não informado' ? state.answers.nome : '');

    const greeting = rawName ? `Fala ${rawName}, tudo bem?` : 'Fala, tudo bem?';

    const catKey = state.calculatedResultCategory || 'pagina';
    const catData = RESULT_CATEGORIES[catKey] || RESULT_CATEGORIES.pagina;

    const estr = state.answers.estrutura_pagina || 'Não informado';
    const qual = state.answers.qualificacao_lead || 'Não informado';
    const auto = state.answers.automacao_crm || 'Não informado';
    const fat = state.answers.faixa_faturamento || 'Não informado';

    const catTagClean = catData.tag.replace('GARGALO: ', '').replace('OPORTUNIDADE: ', '').toLowerCase();
    const catDesc = catData.text;

    return `${greeting} Aqui é o Guilherme da Tekton Digital.\n\n` +
      `Vi que você preencheu o diagnóstico comercial. Dei uma olhada no seu cenário:\n\n` +
      `• Estrutura da oferta: ${estr}\n` +
      `• Qualificação de contatos: ${qual}\n` +
      `• Organização de dados: ${auto}\n` +
      `• Faturamento / Momento: ${fat}\n\n` +
      `Pelo seu diagnóstico, o ponto prioritário para ajustar é ${catTagClean}.\n${catDesc}\n\n` +
      `Separei a análise completa com os pontos prioritários para o seu processo comercial. Me avisa se podemos conversar por aqui!`;
  }

  function sendWebhookPayload(extraData = {}) {
    const catKey = state.calculatedResultCategory || 'pagina';
    const catData = RESULT_CATEGORIES[catKey] || RESULT_CATEGORIES.pagina;
    const tierData = calculateLeadTier();

    const rawName = (extraData && extraData.contato && extraData.contato.nome && extraData.contato.nome !== 'Não informado')
      ? extraData.contato.nome
      : (state.answers.nome && state.answers.nome !== 'Não informado' ? state.answers.nome : '');

    const rawVal = (extraData && extraData.contato && extraData.contato.valor)
      ? extraData.contato.valor
      : (state.answers.whatsapp || '');

    let digitsOnly = rawVal.replace(/\D/g, '');
    if (digitsOnly.length >= 10 && !digitsOnly.startsWith('55')) {
      digitsOnly = '55' + digitsOnly;
    }

    const personalizedMessage = buildPersonalizedMessage(state, extraData);

    const payload = {
      // 1. Metadados
      timestamp: new Date().toISOString(),
      action: extraData.action || 'diagnostic_completed',
      lead_opted_in: extraData.lead_opted_in || false,
      
      // 2. Contato do Lead
      nome: rawName || 'Não informado',
      name: rawName || 'Não informado',
      whatsapp: rawVal || null,
      telefone: rawVal || null,
      phone: rawVal || null,
      whatsapp_raw: digitsOnly || null,
      
      // 3. Respostas do Diagnóstico com IDs e Textos
      estrutura_pagina: state.answers.estrutura_pagina || '',
      estrutura_pagina_id: state.selectedOptionIds.estrutura_pagina || '',
      qualificacao_lead: state.answers.qualificacao_lead || '',
      qualificacao_lead_id: state.selectedOptionIds.qualificacao_lead || '',
      automacao_crm: state.answers.automacao_crm || '',
      automacao_crm_id: state.selectedOptionIds.automacao_crm || '',
      faixa_faturamento: state.answers.faixa_faturamento || '',
      faixa_faturamento_id: state.selectedOptionIds.faixa_faturamento || '',
      
      // 4. Diagnóstico & Gargalos
      categoria_resultado: catKey,
      categoria_gargalo: catKey,
      gargalo: catData ? catData.tag : '',
      gargalo_titulo: catData ? catData.title : '',
      gargalo_descricao: catData ? catData.text : '',
      score_comercial: calculateDiagnosticScore(),
      lead_tier: tierData.tier,
      lead_tier_label: tierData.label,
      
      // 5. Mensagens Formatadas para WhatsApp / CRM
      mensagem: personalizedMessage,
      mensagem_personalizada: personalizedMessage,
      mensagem_whatsapp: personalizedMessage,
      
      // 6. Resumo formatado
      resumo_respostas: `1. Oferta: ${state.answers.estrutura_pagina || 'N/A'} | 2. Qualificação: ${state.answers.qualificacao_lead || 'N/A'} | 3. Organização: ${state.answers.automacao_crm || 'N/A'} | 4. Faturamento: ${state.answers.faixa_faturamento || 'N/A'}`
    };

    console.log('🚀 Sending Webhook Payload:', payload);

    const targetUrl = CONFIG.WEBHOOK_URL || 'https://hook.us2.make.com/fa4i37r16p3mjadowmycsyyku1qtyb4b';

    fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => console.log('✅ Webhook OK:', res.status))
    .catch(err => console.warn('⚠️ Webhook Error:', err));
  }

  function setupEventListeners() {

    btnStartDiagnostic.addEventListener('click', () => {
      state.currentStepIndex = 0;
      renderStep(0);
      switchScreen('question');
    });

    btnStepBack.addEventListener('click', () => {
      if (state.currentStepIndex > 0) {
        renderStep(state.currentStepIndex - 1);
      } else {
        switchScreen('hero');
      }
    });

    btnStepContinue.addEventListener('click', () => {
      if (state.currentStepIndex < QUESTIONS.length - 1) {
        renderStep(state.currentStepIndex + 1);
      } else {
        processAndShowResult();
      }
    });

    btnAcceptChecklist.addEventListener('click', () => {
      state.checklistRequested = true;
      offerInitialButtons.style.display = 'none';
      contactForm.style.display = 'flex';
      clearFormError();
    });

    btnDeclineChecklist.addEventListener('click', () => {
      offerInitialButtons.style.display = 'none';
      declineArea.style.display = 'block';
      sendWebhookPayload({ action: 'checklist_declined', lead_opted_in: false });
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateContactForm()) return;

      const inputVal = document.getElementById('contactValueInput');
      const inputName = document.getElementById('contactNameInput');

      const contactVal = inputVal ? inputVal.value.trim() : '';
      const contactName = inputName ? inputName.value.trim() : '';

      btnSubmitContact.disabled = true;
      btnSubmitContact.querySelector('span').textContent = 'Enviando...';

      const contactData = {
        canal: 'WhatsApp',
        valor: contactVal,
        nome: contactName || 'Não informado'
      };

      state.answers.whatsapp = contactVal;
      state.answers.nome = contactName || 'Não informado';

      sendWebhookPayload({ action: 'checklist_requested', lead_opted_in: true, contato: contactData });
      updateWhatsAppRedirectUrl(contactName);

      setTimeout(() => {
        switchScreen('thankYou');
      }, 350);
    });

    if (btnRestartDiagnostic) {
      btnRestartDiagnostic.addEventListener('click', () => {
        state.answers = { estrutura_pagina: '', qualificacao_lead: '', automacao_crm: '', faixa_faturamento: '' };
        state.selectedOptionIds = { estrutura_pagina: '', qualificacao_lead: '', automacao_crm: '', faixa_faturamento: '' };
        state.calculatedResultCategory = null;
        state.checklistRequested = false;
        offerInitialButtons.style.display = 'flex';
        contactForm.style.display = 'none';
        declineArea.style.display = 'none';
        if (btnSubmitContact) {
          btnSubmitContact.disabled = false;
          btnSubmitContact.querySelector('span').textContent = 'Receber Análise Completa';
        }
        switchScreen('hero');
      });
    }

    if (privacyPolicyLink) {
      privacyPolicyLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Política de Privacidade Tekton Digital:\n\nOs dados informados (nome e WhatsApp) são armazenados de forma restrita e utilizados exclusivamente para o envio do checklist solicitado e para eventual atendimento de acompanhamento do seu diagnóstico comercial.');
      });
    }


    // Máscara dinâmica para WhatsApp: (XX) XXXXX-XXXX
    if (contactValueInput) {
      contactValueInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 11) v = v.substring(0, 11);
        if (v.length > 10) {
          v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        } else if (v.length > 5) {
          v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
        } else if (v.length > 2) {
          v = v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
        } else if (v.length > 0) {
          v = v.replace(/^(\d*)$/, '($1');
        }
        e.target.value = v;
      });
    }

  }

  init();

});
