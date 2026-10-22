/**
 * TEMU ORDER MANAGEMENT PLATFORM
 * Réf : CMD-TEMU-89241-EU
 * Marchand : TEMU (Whaleco Tech Ireland Ltd)
 */

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
        actionZone.innerHTML = `
          <div class="status-badge-cancelled">
            ✕ <strong>Commande annulée</strong><br>
            La commande CMD-TEMU-89241-EU a été annulée. Aucun montant n'a été prélevé.
          </div>
        `;
        showToast("Commande annulée avec succès.");
      });
    }
    showToast("Option sélectionnée : Annuler ma commande");
  } else {
    actionZone.innerHTML = '';
  }
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
