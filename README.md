# Plateforme Panier & Validation de Commande TEMU (Whaleco Tech Ireland Ltd)

## 📌 Présentation du Projet
Plateforme e-commerce interactive reproduisant fidèlement le design et le déroulement de validation de commande de **TEMU** (Whaleco Tech Ireland Ltd) selon la maquette et les captures fournies.

### 🧾 Récapitulatif de la Commande
* **Marchand :** TEMU (Whaleco Tech Ireland Ltd)
* **ID Client :** 675464
* **Réf. Commande :** CMD-TEMU-89241-EU
* **Adresse de livraison :** Pierre Barlie, 56 Cor Président John Fitzgerald Kennedy, 13007 Marseille France
* **Montant Total :** 2 400,00 € (Livraison gratuite incluse)

### 📦 Articles Commandés (5 Marchandises)
1. **Smartphone 5G Pro Max Ultra (512 Go Titane)** — 899,00 €
2. **Drone Quadricoptère Caméra 4K GPS Longue Portée** — 589,00 €
3. **Générateur Électrique Portable Lithium 1500W** — 649,00 €
4. **Système Enceinte Hi-Fi Sans Fil Stéréo Multi-Room** — 189,00 €
5. **Pack Équipements & Accessoires High-Tech TEMU** — 74,00 €

---

## 🎨 Structure de la Plateforme (3 Colonnes)

1. **Colonne 1 (Gauche) - Articles commandés :**
   * Bandeau supérieur gris avec icône et compteur d'articles.
   * Cartes produits individuelles avec visuels vectoriels, caractéristiques et prix unitaire rouge.
2. **Colonne 2 (Centre) - Récapitulatif comptable :**
   * Données de transaction, sous-total, frais offerts et total général.
   * Carte d'adresse de livraison grisée.
   * Code-barres authentique de traçabilité (`CMD-TEMU-89241-EU`).
3. **Colonne 3 (Droite) - Interaction de validation / annulation :**
   * Illustration vectorielle du chariot avec badge turquoise "1".
   * Question centrale : *« Voulez-vous valider ou annuler votre commande ? »*
   * Menu déroulant personnalisé conforme aux captures d'écran :
     * `Veuillez sélectionner une option` (état actif sur fond gris).
     * `Annuler ma commande N° CMD-TEMU-89241-EU`
     * `Valider ma commande N° CMD-TEMU-89241-EU`
   * Déclenchement de la modale sécurisée **Whaleco Pay** (CB 3D Secure, Apple Pay, PayPal 4x) ou confirmation d'annulation.

---

## 🚀 Lancement Local
Pour démarrer ou redémarrer le serveur local :
```bash
python -m http.server 8181
```
Puis ouvrir l'URL suivante dans votre navigateur :
`http://localhost:8181`

---

## 📁 Arborescence des Fichiers
* `index.html` : Structure sémantique HTML5 complète.
* `style.css` : Système de design, typographie, palette TEMU et animations.
* `app.js` : Logique applicative, gestion du menu déroulant et modale de paiement.
