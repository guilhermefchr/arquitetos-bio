/**
 * DIAGNÓSTICO COMERCIAL INTERATIVO - GUILHERME (@tekton.guilherme)
 * Engine de perguntas compacta, persistência de sessão e Webhook.
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. CONFIGURAÇÕES E ESTADO GLOBAL
  // =========================================================================
  const CONFIG = {
    WEBHOOK_URL: localStorage.getItem('guilherme_webhook_url') || 'https://hook.us2.make.com/fa4i37r16p3mjadowmycsyyku1qtyb4b',
    INSTAGRAM_HANDLE: localStorage.getItem('guilherme_insta_handle') || '@tekton.guilherme',
    WHATSAPP_NUMBER: localStorage.getItem('guilherme_whatsapp_number') || '',
    AUTO_ADVANCE_DELAY_MS: 300,
    LOADING_ANIMATION_MS: 800
  };

  const QUESTIONS = [
    {
      id: 'estrutura_pagina',
      step: 1,
      title: 'Como você apresenta e vende seu produto ou serviço hoje?',
      subtitle: 'Selecione onde seu potencial cliente chega primeiro.',
      type: 'single',
      toast: 'Boa. A estrutura da página é o primeiro filtro comercial.',
      options: [
        'Tenho uma Página de Vendas (Landing Page) dedicada.',
        'Atendo direto no WhatsApp ou mensagem privada sem ter uma página.',
        'Tenho uma Página de Vendas, mas ela tem baixa conversão.',
        'Tenho apenas um site institucional genérico ou link na bio.'
      ]
    },
    {
      id: 'qualificacao_lead',
      step: 2,
      title: 'Como funciona a qualificação dos leads antes do atendimento?',
      subtitle: 'Selecione como seu comercial filtra os contatos.',
      type: 'single',
      toast: 'Excelente. A qualificação no pré-atendimento evita curiosos.',
      options: [
        'Uso um formulário de qualificação para filtrar interessados antes da conversa.',
        'Os leads chegam sem filtro e perco tempo atendendo curiosos desqualificados.',
        'Faço a qualificação manualmente durante a conversa de vendas.',
        'Filtro os leads previamente por orçamento ou faturamento.'
      ]
    },
    {
      id: 'automacao_crm',
      step: 3,
      title: 'O que acontece com os dados dos leads assim que eles entram em contato?',
      subtitle: 'Selecione como os contatos são organizados no seu negócio.',
      type: 'single',
      toast: 'Perfeito. Automação e CRM garantem rapidez no acompanhamento.',
      options: [
        'Vão automaticamente para um CRM ou Planilha de vendas.',
        'Recebo apenas como mensagens soltas no WhatsApp sem centralização.',
        'Anoto e organizo o acompanhamento dos leads de forma manual.',
        'Tenho um CRM de vendas, mas os dados não chegam integrados automaticamente.'
      ]
    },
    {
      id: 'faixa_faturamento',
      step: 4,
      title: 'Qual a faixa de faturamento mensal atual do seu negócio?',
      subtitle: 'Identifica o momento e a maturidade da sua operação comercial.',
      type: 'single',
      toast: 'Analisando o diagnóstico completo...',
      options: [
        'Até R$ 10 mil / mês',
        'R$ 10 mil a R$ 30 mil / mês',
        'R$ 30 mil a R$ 100 mil / mês',
        'Acima de R$ 100 mil / mês'
      ]
    }
  ];

  const RESULT_CATEGORIES = {
    pagina: {
      tag: 'Gargalo: Página de Vendas',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
      title: 'Seu principal gargalo está na conversão da sua <span class="highlight-orange">Página de Vendas</span>.',
      text: 'Sem uma Landing Page de alta conversão para apresentar o valor da sua oferta antes do atendimento, grande parte do tráfego abandona o contato ou chega sem entender o real potencial do seu produto.'
    },
    qualificacao: {
      tag: 'Gargalo: Qualificação de Leads',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
      title: 'Seu principal gargalo está no pré-atendimento e <span class="highlight-orange">Qualificação de Leads</span>.',
      text: 'Você atrai interessados, mas sem formulários ou perguntas estratégicas no pré-atendimento, você ou sua equipe perdem horas preciosas atendendo curiosos sem perfil de compra.'
    },
    automacao: {
      tag: 'Gargalo: Automação & CRM',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
      title: 'Seu principal gargalo está na falta de <span class="highlight-orange">Automação & CRM</span>.',
      text: 'Trabalhar com mensagens soltas no WhatsApp sem integração automática para CRM ou Planilha gera atraso no primeiro contato, falhas no acompanhamento e perda de oportunidades.'
    },
    escala: {
      tag: 'Oportunidade: Escala do Funil',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
      title: 'Sua estrutura tem boa base! O foco agora é <span class="highlight-orange">Otimização & Escala</span>.',
      text: 'Sua operação já possui Página de Vendas e processos de qualificação. O próximo passo é refinar a conversão em tempo real e escalar o volume de clientes qualificados.'
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
    calculatedResultCategory: null,
    checklistRequested: false
  };

  // DOM Elements
  const screens = {
    hero: document.getElementById('screenHero'),
    question: document.getElementById('screenQuestion'),
    loading: document.getElementById('screenLoading'),
    result: document.getElementById('screenResult')
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
  const successCard = document.getElementById('successCard');

  const contactChannelRadios = document.querySelectorAll('input[name="contactChannel"]');
  const contactValueLabel = document.getElementById('contactValueLabel');
  const contactValueInput = document.getElementById('contactValueInput');
  const contactValueError = document.getElementById('contactValueError');
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

    let rawNumber = (CONFIG.WHATSAPP_NUMBER || '').replace(/\D/g, '');
    if (rawNumber.length >= 10 && !rawNumber.startsWith('55')) {
      rawNumber = '55' + rawNumber;
    }

    const nameStr = (leadName && leadName !== 'Não informado') ? `Sou ${leadName}. ` : '';
    const message = `Fala Guilherme! ${nameStr}Acabei de preencher o diagnóstico comercial e gostaria de conversar!`;
    const encoded = encodeURIComponent(message);

    if (rawNumber) {
      btnWhatsAppSuccess.href = `https://wa.me/${rawNumber}?text=${encoded}`;
    } else {
      btnWhatsAppSuccess.href = `https://wa.me/?text=${encoded}`;
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

    if (currentQ.type === 'single') {
      questionFooterAction.style.display = 'none';

      currentQ.options.forEach(optText => {
        const isSelected = state.answers[currentQ.id] === optText;
        const card = document.createElement('div');
        card.className = `option-card ${isSelected ? 'selected' : ''}`;
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

        card.innerHTML = `
          <span class="option-card-label">${optText}</span>
          <span class="option-radio-indicator"></span>
        `;

        card.addEventListener('click', () => handleSingleSelect(currentQ.id, optText, card));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSingleSelect(currentQ.id, optText, card);
          }
        });

        optionsGrid.appendChild(card);
      });

    } else if (currentQ.type === 'multi') {
      questionFooterAction.style.display = 'block';

      const currentSelectedList = state.answers[currentQ.id] || [];

      currentQ.options.forEach(optText => {
        const isSelected = currentSelectedList.includes(optText);
        const card = document.createElement('div');
        card.className = `option-card ${isSelected ? 'selected' : ''}`;
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'checkbox');
        card.setAttribute('aria-checked', isSelected ? 'true' : 'false');

        card.innerHTML = `
          <span class="option-card-label">${optText}</span>
          <span class="option-checkbox-indicator">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
        `;

        card.addEventListener('click', () => handleMultiSelectToggle(currentQ.id, optText, card));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleMultiSelectToggle(currentQ.id, optText, card);
          }
        });

        optionsGrid.appendChild(card);
      });

      updateContinueButtonState();
    }

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

  function handleSingleSelect(questionId, selectedValue, cardElement) {
    const siblings = optionsGrid.querySelectorAll('.option-card');
    siblings.forEach(el => el.classList.remove('selected'));
    cardElement.classList.add('selected');

    state.answers[questionId] = selectedValue;
    saveSession();

    setTimeout(() => {
      if (state.currentStepIndex < QUESTIONS.length - 1) {
        renderStep(state.currentStepIndex + 1);
      } else {
        processAndShowResult();
      }
    }, CONFIG.AUTO_ADVANCE_DELAY_MS);
  }

  function handleMultiSelectToggle(questionId, selectedValue, cardElement) {
    let list = state.answers[questionId] ? [...state.answers[questionId]] : [];
    const isNoneOption = selectedValue === 'Ainda não tenho uma fonte previsível';

    if (isNoneOption) {
      list = list.includes(selectedValue) ? [] : [selectedValue];
    } else {
      list = list.filter(item => item !== 'Ainda não tenho uma fonte previsível');
      if (list.includes(selectedValue)) {
        list = list.filter(item => item !== selectedValue);
      } else {
        list.push(selectedValue);
      }
    }

    state.answers[questionId] = list;

    const siblings = optionsGrid.querySelectorAll('.option-card');
    siblings.forEach(el => {
      const label = el.querySelector('.option-card-label').textContent;
      if (list.includes(label)) {
        el.classList.add('selected');
        el.setAttribute('aria-checked', 'true');
      } else {
        el.classList.remove('selected');
        el.setAttribute('aria-checked', 'false');
      }
    });

    updateContinueButtonState();
    saveSession();
  }

  function updateContinueButtonState() {
    const list = state.answers.origem_leads || [];
    btnStepContinue.disabled = list.length === 0;
  }

  function processAndShowResult() {
    switchScreen('loading');

    state.calculatedResultCategory = calculateDiagnosticCategory(state.answers);
    saveSession();

    setTimeout(() => {
      displayResult();
      switchScreen('result');
      // Nota: O Webhook é disparado exclusivamente ao submeter o formulário de contato ou recusar o checklist.
    }, CONFIG.LOADING_ANIMATION_MS);
  }

  function calculateDiagnosticCategory(ans) {
    const estr = ans.estrutura_pagina || '';
    const qual = ans.qualificacao_lead || '';
    const auto = ans.automacao_crm || '';

    if (estr.includes('sem página') || estr.includes('Linktree') || estr.includes('converte pouco')) {
      return 'pagina';
    }
    if (qual.includes('sem filtro') || qual.includes('manualmente')) {
      return 'qualificacao';
    }
    if (auto.includes('mensagem solta') || auto.includes('manual') || auto.includes('não chegam integrados')) {
      return 'automacao';
    }

    return 'escala';
  }

  function calculateLeadTier(ans) {
    const fat = ans.faixa_faturamento || '';
    if (fat.includes('Acima de R$ 100 mil') || fat.includes('R$ 30 mil a R$ 100 mil')) {
      return { tier: 'HOT_LEAD_ICP', label: 'Alta Prioridade (ICP Quente)' };
    }
    if (fat.includes('R$ 10 mil a R$ 30 mil')) {
      return { tier: 'WARM_LEAD_ICP', label: 'Média Prioridade (Lead em Crescimento)' };
    }
    return { tier: 'COLD_LEAD_ICP', label: 'Lead Inicial' };
  }

  function displayResult() {
    const catKey = state.calculatedResultCategory || 'pagina';
    const catData = RESULT_CATEGORIES[catKey] || RESULT_CATEGORIES.pagina;

    const resultIconEl = document.getElementById('resultIcon');
    if (resultIconEl && catData.icon) {
      resultIconEl.innerHTML = catData.icon;
    }

    if (resultTag) resultTag.textContent = catData.tag;
    if (resultTitle) resultTitle.innerHTML = catData.title;
    if (resultText) resultText.textContent = catData.text;

    summaryTags.innerHTML = '';
    const tagsToRender = [
      state.answers.estrutura_pagina,
      state.answers.qualificacao_lead,
      state.answers.automacao_crm,
      state.answers.faixa_faturamento
    ].filter(Boolean);

    tagsToRender.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'summary-tag';
      span.textContent = tag;
      summaryTags.appendChild(span);
    });
  }

  function setupContactChannelInputs() {
    if (contactValueLabel) contactValueLabel.textContent = 'Seu WhatsApp';
    if (contactValueInput) {
      contactValueInput.type = 'tel';
      contactValueInput.placeholder = '(11) 99999-9999';
    }
    clearFormError();
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
    } else if (phoneVal.replace(/\D/g, '').length < 8) {
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

    const catName = catData.tag.replace('Gargalo: ', '').toLowerCase();
    const catDesc = catData.text;

    const rawText = `${greeting} Aqui é o Guilherme da Tekton Digital.\n\n` +
      `Vi que você preencheu o diagnóstico comercial. Dei uma olhada no seu cenário:\n\n` +
      `• Apresentação da oferta: ${estr}\n` +
      `• Qualificação de contatos: ${qual}\n` +
      `• Organização de dados: ${auto}\n` +
      `• Faturamento / Ticket: ${fat}\n\n` +
      `Pelo seu diagnóstico, o ponto prioritário para ajustar é ${catName}.\n${catDesc}\n\n` +
      `Separei um material prático para otimizar esse fluxo e aumentar a conversão do seu comercial. Me avisa se podemos conversarmos por aqui!`;

    return rawText
      .replace(/\r?\n/g, '\\n')
      .replace(/"/g, '\\"');
  }

  function sendWebhookPayload(extraData = {}) {
    const catKey = state.calculatedResultCategory || 'pagina';
    const catData = RESULT_CATEGORIES[catKey] || RESULT_CATEGORIES.pagina;
    const tierData = calculateLeadTier(state.answers);

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
      timestamp: new Date().toISOString(),
      action: extraData.action || 'diagnostic_completed',
      lead_opted_in: extraData.lead_opted_in || false,
      nome: rawName || 'Não informado',
      whatsapp: rawVal || null,
      whatsapp_raw: digitsOnly || null,
      
      // Respostas do Diagnóstico
      estrutura_pagina: state.answers.estrutura_pagina || '',
      qualificacao_lead: state.answers.qualificacao_lead || '',
      automacao_crm: state.answers.automacao_crm || '',
      faixa_faturamento: state.answers.faixa_faturamento || '',
      
      // Inteligência de Vendas / Qualificação de Lead
      categoria_gargalo: catKey,
      gargalo_titulo: catData ? catData.tag : '',
      lead_tier: tierData.tier,
      lead_tier_label: tierData.label,
      
      // Mensagens de Automação (Make/n8n/WhatsApp)
      mensagem_personalizada: personalizedMessage,
      mensagem_whatsapp: personalizedMessage
    };

    console.log('🚀 Sending Make Webhook Payload:', payload);

    if (CONFIG.WEBHOOK_URL) {
      fetch(CONFIG.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => console.log('✅ Make Webhook OK:', res.status))
      .catch(err => console.warn('⚠️ Make Webhook Error:', err));
    }
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
      setupContactChannelInputs();
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
        contactForm.style.display = 'none';
        successCard.style.display = 'block';
      }, 400);
    });

    if (btnOpenSettings) {
      btnOpenSettings.addEventListener('click', () => {
        webhookUrlInput.value = CONFIG.WEBHOOK_URL;
        instagramHandleInput.value = CONFIG.INSTAGRAM_HANDLE;
        if (whatsappNumberInput) whatsappNumberInput.value = CONFIG.WHATSAPP_NUMBER;
        settingsModal.style.display = 'flex';
      });
    }

    // Secret Admin Mode via URL parameter ?admin=1
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === '1' && settingsModal) {
      webhookUrlInput.value = CONFIG.WEBHOOK_URL;
      instagramHandleInput.value = CONFIG.INSTAGRAM_HANDLE;
      if (whatsappNumberInput) whatsappNumberInput.value = CONFIG.WHATSAPP_NUMBER;
      settingsModal.style.display = 'flex';
    }

    if (btnCloseModal) {
      btnCloseModal.addEventListener('click', () => {
        settingsModal.style.display = 'none';
      });
    }

    if (btnSaveSettings) {
      btnSaveSettings.addEventListener('click', () => {
        const url = webhookUrlInput.value.trim();
        const handle = instagramHandleInput.value.trim() || '@tekton.guilherme';
        const waNum = whatsappNumberInput ? whatsappNumberInput.value.trim() : '';

        CONFIG.WEBHOOK_URL = url;
        CONFIG.INSTAGRAM_HANDLE = handle;
        CONFIG.WHATSAPP_NUMBER = waNum;

        localStorage.setItem('guilherme_webhook_url', url);
        localStorage.setItem('guilherme_insta_handle', handle);
        localStorage.setItem('guilherme_whatsapp_number', waNum);

        updateInstagramLinks(handle);
        settingsModal.style.display = 'none';
        alert('Configurações salvas!');
      });
    }

    // WhatsApp Input Live Mask: (XX) XXXXX-XXXX
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
