# ☀️ CoopEnergie — Tontine Solaire

> Plateforme de coopérative solaire (tontine digitale) au Cameroun.  
> Permettre aux utilisateurs de financer progressivement des kits solaires pour lutter contre les délestages.

---

## 🗂️ Structure du projet

```
CoopEnergie/
├── index.html        ← Interface principale (Dashboard)
├── style.css         ← Design System complet (CSS variables)
├── app.ts            ← Code TypeScript source (à compiler)
├── app.js            ← Code JavaScript compilé (prêt navigateur)
├── tsconfig.json     ← Configuration TypeScript
└── README.md         ← Ce fichier
```

---

## 🚀 Lancer le projet

### Option 1 — Directement dans le navigateur

Ouvrez `index.html` dans votre navigateur. Aucune installation requise — `app.js` est déjà compilé.

### Option 2 — Recompiler le TypeScript

```bash
# Installer TypeScript (si pas déjà installé)
npm install -g typescript

# Compiler
tsc

# Ou avec la config incluse
tsc --project tsconfig.json
```

### Option 3 — Serveur local (recommandé pour la démo)

```bash
# Avec Python
python3 -m http.server 8080

# Avec Node.js
npx serve .
```

---

## 🏗️ Architecture TypeScript

### Classes principales

| Classe | Responsabilité |
|--------|---------------|
| `GestionnaireFonds` | Logique métier : cagnotte, contributions, historique |
| `GestionnaireVote` | Logique de gouvernance : propositions, votes, décisions |
| `RenduUI` | Rendu DOM : formatage, génération HTML, notifications |
| `CoopEnergie` | Orchestrateur principal : init, événements, coordination |

### Interfaces TypeScript

- `KitSolaire` — Structure d'un kit solaire du catalogue
- `Contribution` — Enregistrement d'un versement
- `PropositionVote` — Décision soumise au vote communautaire
- `EtatFonds` — État courant de la cagnotte

### Fonction obligatoire exposée

```typescript
updateProgress(current: number, goal: number): void
```

Disponible sur `window.updateProgress(...)` pour tests navigateur.

---

## 🎨 Design System

| Token CSS | Valeur | Usage |
|-----------|--------|-------|
| `--color-orange` | `#F2994A` | CTA, accents, progression |
| `--color-yellow` | `#F2C94C` | Gradients, solaire, highlights |
| `--color-navy` | `#2D3436` | Fond section sombre, texte |
| `--font-display` | Clash Display | Titres, prix, métriques |
| `--font-body` | Satoshi | Corps de texte, UI |

---

## ✨ Fonctionnalités

- **Barre de progression dynamique** — Mise à jour en temps réel via `updateProgress()`
- **Catalogue de kits** — 4 produits solaires avec grille responsive
- **Contribution** — Formulaire avec validation et historique animé
- **Vote communautaire** — Système de gouvernance avec résultats en temps réel
- **Modal d'achat** — Overlay accessible (ESC, clic extérieur)
- **Scroll Reveal** — Animations d'entrée au scroll (IntersectionObserver)
- **Menu mobile** — Navigation responsive hamburger
- **Notifications** — Feedback utilisateur contextuel

---

## 📐 Stack technique

- **HTML5** sémantique
- **CSS3** — Variables, Flexbox, Grid, Glassmorphism, Animations
- **TypeScript** strict — POO, interfaces, types explicites
- Aucun framework, aucune dépendance externe

---

*© 2025 CoopEnergie · Tontine Solaire · Cameroun · Ensemble contre les délestages ☀️*
