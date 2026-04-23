/**
 * ============================================================
 * CoopEnergie — Tontine Solaire · app.ts
 * Logique principale TypeScript (Vanilla, POO, Strict)
 * ============================================================
 */
"use strict";
/* ──────────────────────────────────────────────
   DONNÉES STATIQUES
────────────────────────────────────────────── */
const KITS_SOLAIRES = [
    {
        id: 1,
        nom: "SolarBasic 60",
        prix: 60000,
        description: "Kit d'entrée de gamme idéal pour éclairer 3 pièces. Inclut panneau 50W, batterie 30Ah et 4 ampoules LED.",
        icon: "🔆",
        features: ["50W Panneau", "30Ah Batterie", "4 LED", "3 Pièces"],
        featured: false,
    },
    {
        id: 2,
        nom: "SolarMax Pro",
        prix: 150000,
        description: "Solution complète pour un foyer standard. Alimente TV, ventilateur, chargeurs et 6 points lumineux.",
        icon: "⚡",
        features: ["150W Panneau", "100Ah Batterie", "TV + Ventilo", "6 pièces"],
        featured: true,
    },
    {
        id: 3,
        nom: "SolarHome Plus",
        prix: 200000,
        description: "Kit familial haute performance. Gère un mini-frigo, climatiseur, pompe et toute la maison.",
        icon: "🏠",
        features: ["300W Panneau", "200Ah Batterie", "Mini-frigo", "Toute la maison"],
        featured: false,
    },
    {
        id: 4,
        nom: "SolarBusiness",
        prix: 250000,
        description: "Conçu pour les petits commerces. Autonomie 48h, panneau haute efficacité, onduleur inclus.",
        icon: "🏪",
        features: ["500W Panneau", "300Ah Batterie", "Onduleur", "48h Autonomie"],
        featured: false,
    },
];
const PROPOSITIONS_VOTE = [
    {
        id: 1,
        titre: "Décaissement Famille Mballa",
        description: "Débloquer les fonds pour livrer le kit SolarMax Pro à la famille Mballa à Yaoundé.",
        montant: 150000,
        votesApprouver: 0,
        votesRefuser: 0,
        statut: "en_cours",
    },
    {
        id: 2,
        titre: "Achat groupé — 5 kits Basic",
        description: "Négociation fournisseur pour acquérir 5 SolarBasic 60 à tarif réduit (−12%).",
        montant: 264000,
        votesApprouver: 0,
        votesRefuser: 0,
        statut: "en_cours",
    },
    {
        id: 3,
        titre: "Fonds de réserve urgences",
        description: "Réserver 50 000 FCFA pour couvrir les pannes et maintenances imprévues des kits déjà livrés.",
        montant: 50000,
        votesApprouver: 0,
        votesRefuser: 0,
        statut: "en_cours",
    },
];
const MEMBRES_FICTIFS = [
    "Aminata K.",
    "Paul E.",
    "Marie-Claire N.",
    "Ibrahim D.",
    "Sylvie O.",
    "Jean-Baptiste M.",
    "Fatima B.",
    "André T.",
];
/* ──────────────────────────────────────────────
   CLASSE : GestionnaireFonds
   Responsabilité : Logique métier des fonds
────────────────────────────────────────────── */
class GestionnaireFonds {
    constructor(objectif, montantInitial = 0) {
        this.historique = [];
        this.nextId = 1;
        this.etat = {
            montantActuel: montantInitial,
            objectif,
            contributeurs: new Set(),
        };
    }
    /** Ajoute une contribution et retourne l'état mis à jour */
    contribuer(membre, montant) {
        if (montant < 1000)
            return null;
        if (this.etat.montantActuel >= this.etat.objectif)
            return null;
        const montantEffectif = Math.min(montant, this.etat.objectif - this.etat.montantActuel);
        const contribution = {
            id: this.nextId++,
            membre,
            montant: montantEffectif,
            timestamp: new Date(),
        };
        this.etat.montantActuel += montantEffectif;
        this.etat.contributeurs.add(membre);
        this.historique.unshift(contribution); // plus récent en premier
        return contribution;
    }
    /** Calcule le pourcentage de progression (0–100) */
    calculerPourcentage() {
        return Math.min(Math.round((this.etat.montantActuel / this.etat.objectif) * 100), 100);
    }
    getMontantActuel() {
        return this.etat.montantActuel;
    }
    getObjectif() {
        return this.etat.objectif;
    }
    getNombreContributeurs() {
        return this.etat.contributeurs.size;
    }
    getHistorique() {
        return this.historique.slice(0, 8); // 8 dernières
    }
}
/* ──────────────────────────────────────────────
   CLASSE : GestionnaireVote
   Responsabilité : Logique de gouvernance
────────────────────────────────────────────── */
class GestionnaireVote {
    constructor(propositions) {
        this.votesGlobaux = {
            approuver: 0,
            refuser: 0,
        };
        this.propositions = propositions.map((p) => (Object.assign({}, p)));
    }
    /** Enregistre un vote pour une proposition */
    voter(propositionId, type) {
        const prop = this.propositions.find((p) => p.id === propositionId);
        if (!prop || prop.statut !== "en_cours")
            return null;
        if (type === "approuver") {
            prop.votesApprouver++;
            this.votesGlobaux.approuver++;
        }
        else {
            prop.votesRefuser++;
            this.votesGlobaux.refuser++;
        }
        // Règle métier : 5 votes d'un côté = décision
        const seuil = 5;
        if (prop.votesApprouver >= seuil)
            prop.statut = "approuve";
        if (prop.votesRefuser >= seuil)
            prop.statut = "refuse";
        return prop;
    }
    getVotesGlobaux() {
        return Object.assign({}, this.votesGlobaux);
    }
    getPropositions() {
        return this.propositions;
    }
    reinitialiser() {
        this.votesGlobaux = { approuver: 0, refuser: 0 };
        this.propositions = this.propositions.map((p) => (Object.assign(Object.assign({}, p), { votesApprouver: 0, votesRefuser: 0, statut: "en_cours" })));
    }
}
/* ──────────────────────────────────────────────
   CLASSE : RenduUI
   Responsabilité : Manipulation du DOM
────────────────────────────────────────────── */
class RenduUI {
    /** Formate un nombre en FCFA */
    static formaterFCFA(montant) {
        return new Intl.NumberFormat("fr-FR").format(montant) + " FCFA";
    }
    /** Formate une date en heure courte */
    static formaterHeure(date) {
        return date.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }
    /** Affiche une notification avec animation */
    static afficherNotification(elementId, message, type) {
        const el = document.getElementById(elementId);
        if (!el)
            return;
        el.textContent = message;
        el.className = `notification show notification--${type}`;
        setTimeout(() => {
            el.classList.remove("show");
        }, 4000);
    }
    /** Génère le HTML d'une carte produit */
    static genererCarteKit(kit) {
        const featureTags = kit.features
            .map((f) => `<span class="feature-tag">${f}</span>`)
            .join("");
        const badgeFeatured = kit.featured
            ? `<div class="product-card__badge">⭐ Populaire</div>`
            : "";
        return `
      <article class="product-card ${kit.featured ? "product-card--featured" : ""} reveal" data-kit-id="${kit.id}">
        ${badgeFeatured}
        <div class="product-card__icon">${kit.icon}</div>
        <h3 class="product-card__name">${kit.nom}</h3>
        <p class="product-card__price">
          ${RenduUI.formaterFCFA(kit.prix).replace(" FCFA", "")}<span> FCFA</span>
        </p>
        <p class="product-card__desc">${kit.description}</p>
        <div class="product-card__features">${featureTags}</div>
        <button class="btn btn--primary" data-action="participer" data-kit-id="${kit.id}" data-kit-nom="${kit.nom}" data-kit-prix="${kit.prix}">
          ⚡ Participer
        </button>
      </article>
    `;
    }
    /** Génère le HTML d'une carte de vote */
    static genererCarteVote(prop) {
        const desactive = prop.statut !== "en_cours";
        const labelStatut = prop.statut === "approuve"
            ? "✅ Approuvé"
            : prop.statut === "refuse"
                ? "❌ Refusé"
                : "";
        return `
      <div class="vote-card glass-card reveal" id="vote-card-${prop.id}">
        <h3 class="vote-card__title">${prop.titre}</h3>
        <p class="vote-card__desc">${prop.description}</p>
        <p class="vote-card__amount">${RenduUI.formaterFCFA(prop.montant)}</p>
        ${labelStatut
            ? `<div style="margin-bottom: 16px; font-weight:700; color:${prop.statut === "approuve" ? "#16a34a" : "#dc2626"}">${labelStatut}</div>`
            : ""}
        <div class="vote-card__actions">
          <button class="btn--approve"
            ${desactive ? "disabled" : ""}
            data-action="approuver"
            data-prop-id="${prop.id}">
            ✅ Approuver
          </button>
          <button class="btn--refuse"
            ${desactive ? "disabled" : ""}
            data-action="refuser"
            data-prop-id="${prop.id}">
            ❌ Refuser
          </button>
        </div>
      </div>
    `;
    }
    /** Génère un élément de log de contribution */
    static genererElementLog(contribution) {
        const li = document.createElement("li");
        li.className = "log-item";
        li.innerHTML = `
      <span class="log-item__name">👤 ${contribution.membre}</span>
      <span class="log-item__amount">+${RenduUI.formaterFCFA(contribution.montant)}</span>
      <span class="log-item__time">${RenduUI.formaterHeure(contribution.timestamp)}</span>
    `;
        return li;
    }
}
/* ──────────────────────────────────────────────
   CLASSE : CoopEnergie (App principale)
   Responsabilité : Orchestration globale
────────────────────────────────────────────── */
class CoopEnergie {
    constructor() {
        this.kitSelectionne = null;
        // Initialise avec 68% de la cagnotte déjà remplie (simulation)
        const objectif = 1500000;
        const initial = Math.round(objectif * 0.68);
        this.gestionnaireFonds = new GestionnaireFonds(objectif, initial);
        // Ajoute des contributeurs fictifs initiaux
        MEMBRES_FICTIFS.slice(0, 6).forEach((m) => {
            this.gestionnaireFonds["etat"].contributeurs.add(m);
        });
        this.gestionnaireVote = new GestionnaireVote(PROPOSITIONS_VOTE);
    }
    /** Point d'entrée — initialise toute l'application */
    init() {
        this.rendreProduits();
        this.rendreGouvernance();
        this.mettreAJourProgress(this.gestionnaireFonds.getMontantActuel(), this.gestionnaireFonds.getObjectif());
        this.remplirLogInitial();
        this.mettreAJourMetricContributeurs();
        this.attacherEcouteurs();
        this.initScrollReveal();
        this.initScrollHeader();
    }
    /* ── RENDU DES PRODUITS ── */
    rendreProduits() {
        const grille = document.getElementById("products-grid");
        if (!grille)
            return;
        grille.innerHTML = KITS_SOLAIRES.map(RenduUI.genererCarteKit).join("");
    }
    /* ── RENDU DE LA GOUVERNANCE ── */
    rendreGouvernance() {
        const grille = document.getElementById("governance-grid");
        if (!grille)
            return;
        grille.innerHTML = this.gestionnaireVote
            .getPropositions()
            .map(RenduUI.genererCarteVote)
            .join("");
    }
    /* ── MISE À JOUR DE LA BARRE DE PROGRESSION ── */
    /**
     * Met à jour la barre de progression principale.
     * @param current - Montant collecté actuellement (FCFA)
     * @param goal    - Objectif total à atteindre (FCFA)
     */
    updateProgress(current, goal) {
        const pourcentage = Math.min(Math.round((current / goal) * 100), 100);
        const fill = document.getElementById("progress-fill");
        const thumb = document.getElementById("progress-thumb");
        const pct = document.getElementById("progress-pct");
        const currentEl = document.getElementById("progress-current");
        const goalEl = document.getElementById("progress-goal");
        if (fill)
            fill.style.width = `${pourcentage}%`;
        if (pct)
            pct.textContent = `${pourcentage}%`;
        if (thumb)
            thumb.style.left = `calc(${pourcentage}% - 10px)`;
        if (currentEl)
            currentEl.textContent = RenduUI.formaterFCFA(current);
        if (goalEl)
            goalEl.textContent = `/ ${RenduUI.formaterFCFA(goal)}`;
    }
    /** Alias public vers updateProgress pour conformité avec la spec */
    mettreAJourProgress(current, goal) {
        this.updateProgress(current, goal);
    }
    /* ── LOG INITIAL SIMULÉ ── */
    remplirLogInitial() {
        const liste = document.getElementById("log-list");
        if (!liste)
            return;
        // Historique fictif pour la démo
        const historiqueDemo = [
            { id: 0, membre: "Marie-Claire N.", montant: 35000, timestamp: new Date(Date.now() - 1000 * 60 * 15) },
            { id: 0, membre: "Ibrahim D.", montant: 20000, timestamp: new Date(Date.now() - 1000 * 60 * 42) },
            { id: 0, membre: "Aminata K.", montant: 50000, timestamp: new Date(Date.now() - 1000 * 60 * 75) },
            { id: 0, membre: "Paul E.", montant: 15000, timestamp: new Date(Date.now() - 1000 * 60 * 120) },
        ];
        historiqueDemo.forEach((c) => {
            liste.appendChild(RenduUI.genererElementLog(c));
        });
    }
    /* ── MISE À JOUR DU COMPTEUR DE CONTRIBUTEURS ── */
    mettreAJourMetricContributeurs() {
        const el = document.getElementById("metric-contributors");
        if (el)
            el.textContent = String(this.gestionnaireFonds.getNombreContributeurs());
    }
    /* ── MISE À JOUR DES RÉSULTATS DE VOTE ── */
    mettreAJourResultatsVote() {
        const votes = this.gestionnaireVote.getVotesGlobaux();
        const total = votes.approuver + votes.refuser || 1;
        const barApprove = document.getElementById("bar-approve");
        const barRefuse = document.getElementById("bar-refuse");
        const countApprove = document.getElementById("count-approve");
        const countRefuse = document.getElementById("count-refuse");
        const statusEl = document.getElementById("vote-status");
        if (barApprove)
            barApprove.style.width = `${(votes.approuver / total) * 100}%`;
        if (barRefuse)
            barRefuse.style.width = `${(votes.refuser / total) * 100}%`;
        if (countApprove)
            countApprove.textContent = String(votes.approuver);
        if (countRefuse)
            countRefuse.textContent = String(votes.refuser);
        if (statusEl) {
            const totalVotes = votes.approuver + votes.refuser;
            if (totalVotes === 0) {
                statusEl.textContent = "En attente de votes...";
                statusEl.className = "vote-results__status";
            }
            else if (votes.approuver > votes.refuser) {
                statusEl.textContent = `✅ Tendance : Approbation (${votes.approuver} vs ${votes.refuser})`;
                statusEl.className = "vote-results__status vote-results__status--approved";
            }
            else if (votes.refuser > votes.approuver) {
                statusEl.textContent = `❌ Tendance : Refus (${votes.refuser} vs ${votes.approuver})`;
                statusEl.className = "vote-results__status vote-results__status--refused";
            }
            else {
                statusEl.textContent = `⚖️ Égalité — ${votes.approuver} votes chaque côté`;
                statusEl.className = "vote-results__status";
            }
        }
    }
    /* ── OUVERTURE / FERMETURE MODAL ── */
    ouvrirModal(kit) {
        this.kitSelectionne = kit;
        const overlay = document.getElementById("modal-overlay");
        const desc = document.getElementById("modal-desc");
        if (desc)
            desc.textContent = `Rejoignez le financement du kit ${kit.nom} — ${RenduUI.formaterFCFA(kit.prix)}.`;
        overlay === null || overlay === void 0 ? void 0 : overlay.classList.add("open");
    }
    fermerModal() {
        const overlay = document.getElementById("modal-overlay");
        overlay === null || overlay === void 0 ? void 0 : overlay.classList.remove("open");
        const amountInput = document.getElementById("modal-amount");
        if (amountInput)
            amountInput.value = "";
        this.kitSelectionne = null;
    }
    /* ── TRAITEMENT D'UNE CONTRIBUTION ── */
    traiterContribution(montantStr, membre) {
        const montant = parseInt(montantStr, 10);
        if (isNaN(montant) || montant < 1000) {
            RenduUI.afficherNotification("notification", "⚠️ Montant minimum : 1 000 FCFA", "error");
            return;
        }
        const contribution = this.gestionnaireFonds.contribuer(membre, montant);
        if (!contribution) {
            RenduUI.afficherNotification("notification", "La cagnotte est déjà complète !", "error");
            return;
        }
        // Mise à jour UI
        this.mettreAJourProgress(this.gestionnaireFonds.getMontantActuel(), this.gestionnaireFonds.getObjectif());
        // Ajout au log
        const liste = document.getElementById("log-list");
        if (liste) {
            const el = RenduUI.genererElementLog(contribution);
            liste.insertBefore(el, liste.firstChild);
        }
        // Mise à jour stats
        this.mettreAJourMetricContributeurs();
        RenduUI.afficherNotification("notification", `✅ Merci ${membre} ! ${RenduUI.formaterFCFA(contribution.montant)} ajouté avec succès.`, "success");
        // Reset input
        const input = document.getElementById("contribution-amount");
        if (input)
            input.value = "";
    }
    /* ── INITIALISATION SCROLL REVEAL ── */
    initScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
        document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
        // Ré-observer après rendu dynamique
        setTimeout(() => {
            document.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
                observer.observe(el);
            });
        }, 100);
    }
    /* ── HEADER SCROLL EFFECT ── */
    initScrollHeader() {
        const header = document.getElementById("header");
        window.addEventListener("scroll", () => {
            if (!header)
                return;
            if (window.scrollY > 20) {
                header.style.background = "rgba(15, 18, 20, 0.98)";
            }
            else {
                header.style.background = "rgba(15, 18, 20, 0.85)";
            }
        });
    }
    /* ── ATTACHEMENT DES ÉCOUTEURS D'ÉVÉNEMENTS ── */
    attacherEcouteurs() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        // ── Bouton "Contribuer" principal ──
        (_a = document.getElementById("btn-contribute")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
            const input = document.getElementById("contribution-amount");
            if (!input)
                return;
            const membre = MEMBRES_FICTIFS[Math.floor(Math.random() * MEMBRES_FICTIFS.length)];
            this.traiterContribution(input.value, membre);
        });
        // ── Bouton "Contribuer" Hero ──
        (_b = document
            .getElementById("btn-contribute-hero")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
            var _a;
            (_a = document.getElementById("fonds")) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
        });
        // ── Bouton "Rejoindre" header ──
        (_c = document
            .getElementById("btn-join-header")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
            var _a;
            (_a = document.getElementById("fonds")) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
        });
        // ── Bouton "En savoir plus" ──
        (_d = document
            .getElementById("btn-learn-more")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
            var _a;
            (_a = document
                .getElementById("produits")) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
        });
        // ── Délégation sur la grille produits (boutons "Participer") ──
        (_e = document
            .getElementById("products-grid")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", (e) => {
            var _a;
            const target = e.target;
            const btn = target.closest("[data-action='participer']");
            if (!btn)
                return;
            const kitId = parseInt((_a = btn.dataset["kitId"]) !== null && _a !== void 0 ? _a : "0", 10);
            const kit = KITS_SOLAIRES.find((k) => k.id === kitId);
            if (kit)
                this.ouvrirModal(kit);
        });
        // ── Modal : confirmation ──
        (_f = document.getElementById("modal-confirm")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", () => {
            const amountInput = document.getElementById("modal-amount");
            if (!amountInput || !this.kitSelectionne)
                return;
            const membre = MEMBRES_FICTIFS[Math.floor(Math.random() * MEMBRES_FICTIFS.length)];
            this.traiterContribution(amountInput.value, membre);
            this.fermerModal();
        });
        // ── Modal : fermeture ──
        (_g = document.getElementById("modal-close")) === null || _g === void 0 ? void 0 : _g.addEventListener("click", () => {
            this.fermerModal();
        });
        (_h = document.getElementById("modal-overlay")) === null || _h === void 0 ? void 0 : _h.addEventListener("click", (e) => {
            if (e.target.id === "modal-overlay")
                this.fermerModal();
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape")
                this.fermerModal();
        });
        // ── Délégation sur la grille gouvernance (votes) ──
        (_j = document
            .getElementById("governance-grid")) === null || _j === void 0 ? void 0 : _j.addEventListener("click", (e) => {
            var _a, _b;
            const target = e.target;
            const btnApprouver = target.closest("[data-action='approuver']");
            const btnRefuser = target.closest("[data-action='refuser']");
            if (btnApprouver) {
                const propId = parseInt((_a = btnApprouver.dataset["propId"]) !== null && _a !== void 0 ? _a : "0", 10);
                const prop = this.gestionnaireVote.voter(propId, "approuver");
                if (prop) {
                    this.mettreAJourResultatsVote();
                    this.mettreAJourCarteVote(prop);
                }
            }
            if (btnRefuser) {
                const propId = parseInt((_b = btnRefuser.dataset["propId"]) !== null && _b !== void 0 ? _b : "0", 10);
                const prop = this.gestionnaireVote.voter(propId, "refuser");
                if (prop) {
                    this.mettreAJourResultatsVote();
                    this.mettreAJourCarteVote(prop);
                }
            }
        });
        // ── Réinitialiser votes ──
        (_k = document
            .getElementById("btn-reset-votes")) === null || _k === void 0 ? void 0 : _k.addEventListener("click", () => {
            this.gestionnaireVote.reinitialiser();
            this.rendreGouvernance();
            this.mettreAJourResultatsVote();
            this.initScrollReveal();
        });
        // ── Hamburger menu mobile ──
        const hamburger = document.getElementById("hamburger");
        const mobileMenu = document.getElementById("mobile-menu");
        hamburger === null || hamburger === void 0 ? void 0 : hamburger.addEventListener("click", () => {
            mobileMenu === null || mobileMenu === void 0 ? void 0 : mobileMenu.classList.toggle("open");
        });
        // Fermer le menu mobile en cliquant sur un lien
        document.querySelectorAll(".mobile-menu__link").forEach((link) => {
            link.addEventListener("click", () => {
                mobileMenu === null || mobileMenu === void 0 ? void 0 : mobileMenu.classList.remove("open");
            });
        });
    }
    /* ── MISE À JOUR D'UNE CARTE DE VOTE APRÈS DÉCISION ── */
    mettreAJourCarteVote(prop) {
        const card = document.getElementById(`vote-card-${prop.id}`);
        if (!card || prop.statut === "en_cours")
            return;
        const actions = card.querySelector(".vote-card__actions");
        if (actions) {
            const boutons = actions.querySelectorAll("button");
            boutons.forEach((btn) => (btn.disabled = true));
        }
        const label = prop.statut === "approuve" ? "✅ Approuvé" : "❌ Refusé";
        const couleur = prop.statut === "approuve" ? "#16a34a" : "#dc2626";
        const indicateur = document.createElement("div");
        indicateur.style.cssText = `margin-bottom:16px;font-weight:700;color:${couleur};font-size:0.9rem;`;
        indicateur.textContent = label;
        const actionsEl = card.querySelector(".vote-card__actions");
        if (actionsEl)
            card.insertBefore(indicateur, actionsEl);
    }
}
/* ──────────────────────────────────────────────
   DÉMARRAGE DE L'APPLICATION
────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
    const app = new CoopEnergie();
    app.init();
    // Expose updateProgress sur window pour inspection/tests navigateur
    window
        .updateProgress = (current, goal) => {
        app.updateProgress(current, goal);
    };
});
