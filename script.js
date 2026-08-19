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
    AUTO_ADVANCE_DELAY_MS: 300,
    LOADING_ANIMATION_MS: 800
  };

  const QUESTIONS = [
    {
      id: 'momento_comercial',
      step: 1,
      title: 'Qual o momento do seu comercial hoje?',
      subtitle: 'Selecione seu cenário atual.',
      type: 'single',
      toast: 'Boa. Já identificamos uma parte importante.',
      options: [
        'Dependo de indicações e networking.',
        'Recebo contatos, mas a maioria é desqualificada.',
        'Faço reuniões, mas a taxa de fechamento é baixa.',
        'Ainda não tenho um processo estruturado.'
      ]
    },
    {
      id: 'origem_clientes',
      step: 2,
      title: 'De onde vêm seus melhores clientes hoje?',
      subtitle: 'Selecione a principal origem dos seus leads.',
      type: 'single',
      toast: 'Entender suas fontes é fundamental.',
      options: [
        'Redes Sociais (Instagram/WhatsApp)',
        'Tráfego Pago / Landing Pages',
        'Prospecção Ativa',
        'Indicações / Base de clientes'
      ]
    },
    {
      id: 'objetivo_curto_prazo',
      step: 3,
      title: 'Qual o seu principal objetivo a curto prazo?',
      subtitle: 'Sua prioridade máxima para os próximos meses.',
      type: 'single',
      toast: 'Analisando suas respostas...',
      options: [
        'Atrair um volume maior de leads.',
        'Melhorar a qualificação (parar de atender curiosos).',
        'Estruturar meu funil e aumentar conversão de propostas.',
        'Criar uma máquina de vendas previsível.'
      ]
    }
  ];

  const RESULT_CATEGORIES = {
    qualificacao: {
      tag: 'Gargalo: Qualificação',
      title: 'Seu principal indício de gargalo está na qualificação.',
      text: 'Você pode estar atraindo interessados, mas sem filtros para identificar quem tem perfil e momento de compra. O próximo passo é revisar a qualificação no pré-atendimento antes da conversa comercial.'
    },
    processo: {
      tag: 'Gargalo: Estrutura do Processo',
      title: 'Seu principal indício de gargalo está na estrutura do processo.',
      text: 'Quando as etapas comerciais não estão padronizadas, as oportunidades se perdem pelo caminho. O primeiro passo é desenhar e organizar o fluxo da atração ao fechamento.'
    },
    followup: {
      tag: 'Gargalo: Acompanhamento & Previsibilidade',
      title: 'Seu principal indício de gargalo está na previsibilidade do funil.',
      text: 'Depender apenas de indicações ou networking limita o crescimento. Seu processo precisa de canais ativos e previsíveis para gerar novas reuniões constantemente.'
    },
    captacao: {
      tag: 'Gargalo: Atração de Leads',
      title: 'Seu principal indício de gargalo está na captação.',
      text: 'Antes de acelerar suas vendas, revise se sua mensagem nos pontos de contato atrai o público-alvo correto. Mais volume sem posicionamento claro atrai os leads errados.'
    }
  };

  // State
  let state = {
    currentScreen: 'hero',
    currentStepIndex: 0,
    answers: {
      momento_comercial: '',
      origem_clientes: '',
      objetivo_curto_prazo: ''
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
  const btnReturnInstagramSuccess = document.getElementById('btnReturnInstagramSuccess');
  const btnReturnInstagramDecline = document.getElementById('btnReturnInstagramDecline');

  const btnOpenSettings = document.getElementById('btnOpenSettings');
  const settingsModal = document.getElementById('settingsModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnSaveSettings = document.getElementById('btnSaveSettings');
  const webhookUrlInput = document.getElementById('webhookUrlInput');
  const instagramHandleInput = document.getElementById('instagramHandleInput');

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
    if (btnReturnInstagramSuccess) btnReturnInstagramSuccess.href = fullUrl;
    if (btnReturnInstagramDecline) btnReturnInstagramDecline.href = fullUrl;
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
    const momento = ans.momento_comercial || '';
    const objetivo = ans.objetivo_curto_prazo || '';

    if (momento.includes('desqualificada') || objetivo.includes('qualificação')) {
      return 'qualificacao';
    }
    if (momento.includes('taxa de fechamento') || objetivo.includes('funil') || objetivo.includes('conversão')) {
      return 'processo';
    }
    if (momento.includes('indicações') || objetivo.includes('previsível')) {
      return 'followup';
    }
    if (objetivo.includes('volume maior')) {
      return 'captacao';
    }

    return 'processo';
  }

  function displayResult() {
    const catKey = state.calculatedResultCategory || 'processo';
    const catData = RESULT_CATEGORIES[catKey] || RESULT_CATEGORIES.processo;

    resultTag.textContent = catData.tag;
    resultTitle.textContent = catData.title;
    resultText.textContent = catData.text;

    summaryTags.innerHTML = '';
    const tagsToRender = [
      state.answers.momento_comercial,
      state.answers.origem_clientes,
      state.answers.objetivo_curto_prazo
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

    const catKey = state.calculatedResultCategory || 'processo';
    const catData = RESULT_CATEGORIES[catKey] || RESULT_CATEGORIES.processo;

    const momento = state.answers.momento_comercial || 'Não informado';
    const origem = state.answers.origem_clientes || 'Não informado';
    const objetivo = state.answers.objetivo_curto_prazo || 'Não informado';

    const catName = catData.tag.replace('Gargalo: ', '').toLowerCase();
    const catDesc = catData.text;

    const rawText = `${greeting} Aqui é o Guilherme da Tekton Digital.\n\n` +
      `Vi que você acabou de preencher o diagnóstico comercial. Dei uma olhada no seu cenário:\n\n` +
      `• Momento atual: ${momento}\n` +
      `• Origem dos clientes: ${origem}\n` +
      `• Principal objetivo: ${objetivo}\n\n` +
      `Pelo que você marcou, o seu principal ponto de gargalo hoje está na ${catName}. ${catDesc}\n\n` +
      `Já separei o checklist prático com os pontos para você ajustar no seu processo comercial. Me avisa se este é um bom momento para conversarmos por aqui.`;

    return rawText
      .replace(/\r?\n/g, '\\n')
      .replace(/"/g, '\\"');
  }

  function sendWebhookPayload(extraData = {}) {
    const catKey = state.calculatedResultCategory || 'processo';
    const catData = RESULT_CATEGORIES[catKey];

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
      momento_comercial: state.answers.momento_comercial || '',
      origem_clientes: state.answers.origem_clientes || '',
      objetivo_curto_prazo: state.answers.objetivo_curto_prazo || '',
      categoria_resultado: catKey,
      titulo_resultado: catData ? catData.title : '',
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

      setTimeout(() => {
        contactForm.style.display = 'none';
        successCard.style.display = 'block';
      }, 400);
    });

    if (btnOpenSettings) {
      btnOpenSettings.addEventListener('click', () => {
        webhookUrlInput.value = CONFIG.WEBHOOK_URL;
        instagramHandleInput.value = CONFIG.INSTAGRAM_HANDLE;
        settingsModal.style.display = 'flex';
      });
    }

    // Secret Admin Mode via URL parameter ?admin=1
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === '1' && settingsModal) {
      webhookUrlInput.value = CONFIG.WEBHOOK_URL;
      instagramHandleInput.value = CONFIG.INSTAGRAM_HANDLE;
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

        CONFIG.WEBHOOK_URL = url;
        CONFIG.INSTAGRAM_HANDLE = handle;

        localStorage.setItem('guilherme_webhook_url', url);
        localStorage.setItem('guilherme_insta_handle', handle);

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
