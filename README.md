# Diagnóstico Comercial Interativo — Tekton Digital

Aplicação web responsiva e interativa de **Diagnóstico Comercial** desenvolvida para a **Tekton Digital** (Guilherme).

## 🚀 Funcionalidades

- **Diagnóstico Comercial em 3 Etapas Assertivas**:
  1. *Qual o momento do seu comercial hoje?*
  2. *De onde vêm seus melhores clientes hoje?*
  3. *Qual o seu principal objetivo a curto prazo?*
- **Engine de Mapeamento de Gargalos**: Categoriza o resultado comercial em Qualificação, Processos, Previsibilidade ou Captação.
- **Formulário de Captação Exclusivo WhatsApp**: Coleta de nome e WhatsApp com máscara interativa `(XX) XXXXX-XXXX`.
- **Integração com Make Webhook**: Envio automático de payloads JSON limpos com o texto da mensagem pré-formatado em bullets (`•`) e saudação personalizada (`"Fala [Nome]..."`).
- **Design Ultra-Minimalista**: Visual moderno, escuro e executivo, totalmente adaptado para mobile e desktop.

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3** (Vanilla CSS com Design System de CSS Variables)
- **JavaScript ES6+** (State machine de telas, validação ao vivo e payload JSON)
- **Make / Webhooks** (Automação de WhatsApp e CRM)

## 📁 Estrutura de Arquivos

```
├── index.html        # Estrutura das telas (Hero, Pergunta, Loading, Resultado)
├── styles.css        # Sistema de design, tokens CSS, animações e responsividade
├── script.js        # Lógica de estados, engine de perguntas e integração com Webhook
└── assets/           # Imagens e foto de autoridade do Guilherme
```

## 🔒 Licença & Créditos

Desenvolvido para **Tekton Digital © 2026**. Todos os direitos reservados.
