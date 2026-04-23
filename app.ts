/**
 * ============================================================
 * CoopEnergie — Tontine Solaire · app.ts
 * Logique principale TypeScript (Vanilla, POO, Strict)
 * ============================================================
 */

"use strict";

/* ──────────────────────────────────────────────
   INTERFACES & TYPES
────────────────────────────────────────────── */

interface KitSolaire {
  id: number;
  nom: string;
  prix: number;
  description: string;
  icon: string;
  features: string[];
  featured: boolean;
}

interface Contribution {
  id: number;
  membre: string;
  montant: number;
  timestamp: Date;
}

interface PropositionVote {
  id: number;
  titre: string;
  description: string;
  montant: number;
  votesApprouver: number;
  votesRefuser: number;
  statut: "en_cours" | "approuve" | "refuse";
}

interface EtatFonds {
  montantActuel: number;
  objectif: number;
  contributeurs: Set<string>;
}

/* ──────────────────────────────────────────────
   DONNÉES STATIQUES
────────────────────────────────────────────── */

const KITS_SOLAIRES: KitSolaire[] = [
  {
    id: 1,
    nom: "SolarBasic 60",
    prix: 60_000,
    description:
      "Kit d'entrée de gamme idéal pour éclairer 3 pièces. Inclut panneau 50W, batterie 30Ah et 4 ampoules LED.",
    icon: "🔆",
    features: ["50W Panneau", "30Ah Batterie", "4 LED", "3 Pièces"],
    featured: false,
  },
  {
    id: 2,
    nom: "SolarMax Pro",
    prix: 150_000,
    description:
      "Solution complète pour un foyer standard. Alimente TV, ventilateur, chargeurs et 6 points lumineux.",
    icon: "⚡",
    features: ["150W Panneau", "100Ah Batterie", "TV + Ventilo", "6 pièces"],
    featured: true,
  },
  {
    id: 3,
    nom: "SolarHome Plus",
    prix: 200_000,
    description:
      "Kit familial haute performance. Gère un mini-frigo, climatiseur, pompe et toute la maison.",
    icon: "🏠",
    features: ["300W Panneau", "200Ah Batterie", "Mini-frigo", "Toute la maison"],
    featured: false,
  },
  {
    id: 4,
    nom: "SolarBusiness",
    prix: 250_000,
    description:
      "Conçu pour les petits commerces. Autonomie 48h, panneau haute efficacité, onduleur inclus.",
    icon: "🏪",
    features: ["500W Panneau", "300Ah Batterie", "Onduleur", "48h Autonomie"],
    featured: false,
  },
];

const PROPOSITIONS_VOTE: PropositionVote[] = [
  {
    id: 1,
    titre: "Décaissement Famille Mballa",
    description:
      "Débloquer les fonds pour livrer le kit SolarMax Pro à la famille Mballa à Yaoundé.",
    montant: 150_000,
    votesApprouver: 0,
    votesRefuser: 0,
    statut: "en_cours",
  },
  {
    id: 2,
    titre: "Achat groupé — 5 kits Basic",
    description:
      "Négociation fournisseur pour acquérir 5 SolarBasic 60 à tarif réduit (−12%).",
    montant: 264_000,
    votesApprouver: 0,
    votesRefuser: 0,
    statut: "en_cours",
  },
  {
    id: 3,
    titre: "Fonds de réserve urgences",
    description:
      "Réserver 50 000 FCFA pour couvrir les pannes et maintenances imprévues des kits déjà livrés.",
    montant: 50_000,
    votesApprouver: 0,
    votesRefuser: 0,
    statut: "en_cours",
  },
];

const MEMBRES_FICTIFS: string[] = [
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
  private etat: EtatFonds;
  private historique: Contribution[] = [];
  private nextId: number = 1;

  constructor(objectif: number, montantInitial: number = 0) {
    this.etat = {
      montantActuel: montantInitial,
      objectif,
      contributeurs: new Set<string>(),
    };
  }

  /** Ajoute une contribution et retourne l'état mis à jour */
  public contribuer(membre: string, montant: number): Contribution | null {
    if (montant < 1_000) return null;
    if (this.etat.montantActuel >= this.etat.objectif) return null;

    const montantEffectif = Math.min(
      montant,
      this.etat.objectif - this.etat.montantActuel
    );

    const contribution: Contribution = {
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
  public calculerPourcentage(): number {
    return Math.min(
      Math.round((this.etat.montantActuel / this.etat.objectif) * 100),
      100
    );
  }

  public getMontantActuel(): number {
    return this.etat.montantActuel;
  }

  public getObjectif(): number {
    return this.etat.objectif;
  }

  public getNombreContributeurs(): number {
    return this.etat.contributeurs.size;
  }

  public getHistorique(): Contribution[] {
    return this.historique.slice(0, 8); // 8 dernières
  }
}

/* ──────────────────────────────────────────────
   CLASSE : GestionnaireVote
   Responsabilité : Logique de gouvernance
────────────────────────────────────────────── */

class GestionnaireVote {
  private propositions: PropositionVote[];
  private votesGlobaux: { approuver: number; refuser: number } = {
    approuver: 0,
    refuser: 0,
  };

  constructor(propositions: PropositionVote[]) {
    this.propositions = propositions.map((p) => ({ ...p }));
  }

  /** Enregistre un vote pour une proposition */
  public voter(
    propositionId: number,
    type: "approuver" | "refuser"
  ): PropositionVote | null {
    const prop = this.propositions.find((p) => p.id === propositionId);
    if (!prop || prop.statut !== "en_cours") return null;

    if (type === "approuver") {
      prop.votesApprouver++;
      this.votesGlobaux.approuver++;
    } else {
      prop.votesRefuser++;
      this.votesGlobaux.refuser++;
    }

    // Règle métier : 5 votes d'un côté = décision
    const seuil = 5;
    if (prop.votesApprouver >= seuil) prop.statut = "approuve";
    if (prop.votesRefuser >= seuil) prop.statut = "refuse";

    return prop;
  }

  public getVotesGlobaux(): { approuver: number; refuser: number } {
    return { ...this.votesGlobaux };
  }

  public getPropositions(): PropositionVote[] {
    return this.propositions;
  }

  public reinitialiser(): void {
    this.votesGlobaux = { approuver: 0, refuser: 0 };
    this.propositions = this.propositions.map((p) => ({
      ...p,
      votesApprouver: 0,
      votesRefuser: 0,
      statut: "en_cours",
    }));
  }
}

/* ──────────────────────────────────────────────
   CLASSE : RenduUI
   Responsabilité : Manipulation du DOM
────────────────────────────────────────────── */

class RenduUI {
  /** Formate un nombre en FCFA */
  public static formaterFCFA(montant: number): string {
    return new Intl.NumberFormat("fr-FR").format(montant) + " FCFA";
  }

  /** Formate une date en heure courte */
  public static formaterHeure(date: Date): string {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /** Affiche une notification avec animation */
  public static afficherNotification(
    elementId: string,
    message: string,
    type: "success" | "error"
  ): void {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.textContent = message;
    el.className = `notification show notification--${type}`;

    setTimeout(() => {
      el.classList.remove("show");
    }, 4000);
  }

  /** Génère le HTML d'une carte produit */
  public static genererCarteKit(kit: KitSolaire): string {
    const featureTags = kit.features
      .map((f) => `<span class="feature-tag">${f}</span>`)
      .join("");

    const badgeFeatured = kit.featured
      ? `<div class="product-card__badge">⭐ Populaire</div>`
      : "";

    return `
      <article class="product-card ${
        kit.featured ? "product-card--featured" : ""
      } reveal" data-kit-id="${kit.id}">
        ${badgeFeatured}
        <div class="product-card__icon">${kit.icon}</div>
        <h3 class="product-card__name">${kit.nom}</h3>
        <p class="product-card__price">
          ${RenduUI.formaterFCFA(kit.prix).replace(" FCFA", "")}<span> FCFA</span>
        </p>
        <p class="product-card__desc">${kit.description}</p>
        <div class="product-card__features">${featureTags}</div>
        <button class="btn btn--primary" data-action="participer" data-kit-id="${
          kit.id
        }" data-kit-nom="${kit.nom}" data-kit-prix="${kit.prix}">
          ⚡ Participer
        </button>
      </article>
    `;
  }

  /** Génère le HTML d'une carte de vote */
  public static genererCarteVote(prop: PropositionVote): string {
    const desactive = prop.statut !== "en_cours";
    const labelStatut =
      prop.statut === "approuve"
        ? "✅ Approuvé"
        : prop.statut === "refuse"
        ? "❌ Refusé"
        : "";

    return `
      <div class="vote-card glass-card reveal" id="vote-card-${prop.id}">
        <h3 class="vote-card__title">${prop.titre}</h3>
        <p class="vote-card__desc">${prop.description}</p>
        <p class="vote-card__amount">${RenduUI.formaterFCFA(prop.montant)}</p>
        ${
          labelStatut
            ? `<div style="margin-bottom: 16px; font-weight:700; color:${
                prop.statut === "approuve" ? "#16a34a" : "#dc2626"
              }">${labelStatut}</div>`
            : ""
        }
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
  public static genererElementLog(contribution: Contribution): HTMLLIElement {
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
  private gestionnaireFonds: GestionnaireFonds;
  private gestionnaireVote: GestionnaireVote;
  private kitSelectionne: KitSolaire | null = null;

  constructor() {
    // Initialise avec 68% de la cagnotte déjà remplie (simulation)
    const objectif = 1_500_000;
    const initial = Math.round(objectif * 0.68);
    this.gestionnaireFonds = new GestionnaireFonds(objectif, initial);

    // Ajoute des contributeurs fictifs initiaux
    MEMBRES_FICTIFS.slice(0, 6).forEach((m) => {
      this.gestionnaireFonds["etat"].contributeurs.add(m);
    });

    this.gestionnaireVote = new GestionnaireVote(PROPOSITIONS_VOTE);
  }

  /** Point d'entrée — initialise toute l'application */
  public init(): void {
    this.rendreProduits();
    this.rendreGouvernance();
    this.mettreAJourProgress(
      this.gestionnaireFonds.getMontantActuel(),
      this.gestionnaireFonds.getObjectif()
    );
    this.remplirLogInitial();
    this.mettreAJourMetricContributeurs();
    this.attacherEcouteurs();
    this.initScrollReveal();
    this.initScrollHeader();
  }

  /* ── RENDU DES PRODUITS ── */
  private rendreProduits(): void {
    const grille = document.getElementById("products-grid");
    if (!grille) return;
    grille.innerHTML = KITS_SOLAIRES.map(RenduUI.genererCarteKit).join("");
  }

  /* ── RENDU DE LA GOUVERNANCE ── */
  private rendreGouvernance(): void {
    const grille = document.getElementById("governance-grid");
    if (!grille) return;
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
  public updateProgress(current: number, goal: number): void {
    const pourcentage = Math.min(Math.round((current / goal) * 100), 100);

    const fill = document.getElementById("progress-fill");
    const thumb = document.getElementById("progress-thumb");
    const pct = document.getElementById("progress-pct");
    const currentEl = document.getElementById("progress-current");
    const goalEl = document.getElementById("progress-goal");

    if (fill) fill.style.width = `${pourcentage}%`;
    if (pct) pct.textContent = `${pourcentage}%`;
    if (thumb) thumb.style.left = `calc(${pourcentage}% - 10px)`;
    if (currentEl)
      currentEl.textContent = RenduUI.formaterFCFA(current);
    if (goalEl)
      goalEl.textContent = `/ ${RenduUI.formaterFCFA(goal)}`;
  }

  /** Alias public vers updateProgress pour conformité avec la spec */
  private mettreAJourProgress(current: number, goal: number): void {
    this.updateProgress(current, goal);
  }

  /* ── LOG INITIAL SIMULÉ ── */
  private remplirLogInitial(): void {
    const liste = document.getElementById("log-list");
    if (!liste) return;

    // Historique fictif pour la démo
    const historiqueDemo: Contribution[] = [
      { id: 0, membre: "Marie-Claire N.", montant: 35_000, timestamp: new Date(Date.now() - 1000 * 60 * 15) },
      { id: 0, membre: "Ibrahim D.", montant: 20_000, timestamp: new Date(Date.now() - 1000 * 60 * 42) },
      { id: 0, membre: "Aminata K.", montant: 50_000, timestamp: new Date(Date.now() - 1000 * 60 * 75) },
      { id: 0, membre: "Paul E.", montant: 15_000, timestamp: new Date(Date.now() - 1000 * 60 * 120) },
    ];

    historiqueDemo.forEach((c) => {
      liste.appendChild(RenduUI.genererElementLog(c));
    });
  }

  /* ── MISE À JOUR DU COMPTEUR DE CONTRIBUTEURS ── */
  private mettreAJourMetricContributeurs(): void {
    const el = document.getElementById("metric-contributors");
    if (el)
      el.textContent = String(this.gestionnaireFonds.getNombreContributeurs());
  }

  /* ── MISE À JOUR DES RÉSULTATS DE VOTE ── */
  private mettreAJourResultatsVote(): void {
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
    if (countApprove) countApprove.textContent = String(votes.approuver);
    if (countRefuse) countRefuse.textContent = String(votes.refuser);

    if (statusEl) {
      const totalVotes = votes.approuver + votes.refuser;
      if (totalVotes === 0) {
        statusEl.textContent = "En attente de votes...";
        statusEl.className = "vote-results__status";
      } else if (votes.approuver > votes.refuser) {
        statusEl.textContent = `✅ Tendance : Approbation (${votes.approuver} vs ${votes.refuser})`;
        statusEl.className = "vote-results__status vote-results__status--approved";
      } else if (votes.refuser > votes.approuver) {
        statusEl.textContent = `❌ Tendance : Refus (${votes.refuser} vs ${votes.approuver})`;
        statusEl.className = "vote-results__status vote-results__status--refused";
      } else {
        statusEl.textContent = `⚖️ Égalité — ${votes.approuver} votes chaque côté`;
        statusEl.className = "vote-results__status";
      }
    }
  }

  /* ── OUVERTURE / FERMETURE MODAL ── */
  private ouvrirModal(kit: KitSolaire): void {
    this.kitSelectionne = kit;
    const overlay = document.getElementById("modal-overlay");
    const desc = document.getElementById("modal-desc");
    if (desc)
      desc.textContent = `Rejoignez le financement du kit ${kit.nom} — ${RenduUI.formaterFCFA(kit.prix)}.`;
    overlay?.classList.add("open");
  }

  private fermerModal(): void {
    const overlay = document.getElementById("modal-overlay");
    overlay?.classList.remove("open");
    const amountInput = document.getElementById(
      "modal-amount"
    ) as HTMLInputElement | null;
    if (amountInput) amountInput.value = "";
    this.kitSelectionne = null;
  }

  /* ── TRAITEMENT D'UNE CONTRIBUTION ── */
  private traiterContribution(montantStr: string, membre: string): void {
    const montant = parseInt(montantStr, 10);
    if (isNaN(montant) || montant < 1000) {
      RenduUI.afficherNotification(
        "notification",
        "⚠️ Montant minimum : 1 000 FCFA",
        "error"
      );
      return;
    }

    const contribution = this.gestionnaireFonds.contribuer(membre, montant);
    if (!contribution) {
      RenduUI.afficherNotification(
        "notification",
        "La cagnotte est déjà complète !",
        "error"
      );
      return;
    }

    // Mise à jour UI
    this.mettreAJourProgress(
      this.gestionnaireFonds.getMontantActuel(),
      this.gestionnaireFonds.getObjectif()
    );

    // Ajout au log
    const liste = document.getElementById("log-list");
    if (liste) {
      const el = RenduUI.genererElementLog(contribution);
      liste.insertBefore(el, liste.firstChild);
    }

    // Mise à jour stats
    this.mettreAJourMetricContributeurs();

    RenduUI.afficherNotification(
      "notification",
      `✅ Merci ${membre} ! ${RenduUI.formaterFCFA(contribution.montant)} ajouté avec succès.`,
      "success"
    );

    // Reset input
    const input = document.getElementById(
      "contribution-amount"
    ) as HTMLInputElement | null;
    if (input) input.value = "";
  }

  /* ── INITIALISATION SCROLL REVEAL ── */
  private initScrollReveal(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    // Ré-observer après rendu dynamique
    setTimeout(() => {
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
        observer.observe(el);
      });
    }, 100);
  }

  /* ── HEADER SCROLL EFFECT ── */
  private initScrollHeader(): void {
    const header = document.getElementById("header");
    window.addEventListener("scroll", () => {
      if (!header) return;
      if (window.scrollY > 20) {
        header.style.background = "rgba(15, 18, 20, 0.98)";
      } else {
        header.style.background = "rgba(15, 18, 20, 0.85)";
      }
    });
  }

  /* ── ATTACHEMENT DES ÉCOUTEURS D'ÉVÉNEMENTS ── */
  private attacherEcouteurs(): void {
    // ── Bouton "Contribuer" principal ──
    document.getElementById("btn-contribute")?.addEventListener("click", () => {
      const input = document.getElementById(
        "contribution-amount"
      ) as HTMLInputElement | null;
      if (!input) return;
      const membre =
        MEMBRES_FICTIFS[Math.floor(Math.random() * MEMBRES_FICTIFS.length)];
      this.traiterContribution(input.value, membre);
    });

    // ── Bouton "Contribuer" Hero ──
    document
      .getElementById("btn-contribute-hero")
      ?.addEventListener("click", () => {
        document.getElementById("fonds")?.scrollIntoView({ behavior: "smooth" });
      });

    // ── Bouton "Rejoindre" header ──
    document
      .getElementById("btn-join-header")
      ?.addEventListener("click", () => {
        document.getElementById("fonds")?.scrollIntoView({ behavior: "smooth" });
      });

    // ── Bouton "En savoir plus" ──
    document
      .getElementById("btn-learn-more")
      ?.addEventListener("click", () => {
        document
          .getElementById("produits")
          ?.scrollIntoView({ behavior: "smooth" });
      });

    // ── Délégation sur la grille produits (boutons "Participer") ──
    document
      .getElementById("products-grid")
      ?.addEventListener("click", (e: Event) => {
        const target = e.target as HTMLElement;
        const btn = target.closest("[data-action='participer']") as HTMLElement | null;
        if (!btn) return;

        const kitId = parseInt(btn.dataset["kitId"] ?? "0", 10);
        const kit = KITS_SOLAIRES.find((k) => k.id === kitId);
        if (kit) this.ouvrirModal(kit);
      });

    // ── Modal : confirmation ──
    document.getElementById("modal-confirm")?.addEventListener("click", () => {
      const amountInput = document.getElementById(
        "modal-amount"
      ) as HTMLInputElement | null;
      if (!amountInput || !this.kitSelectionne) return;
      const membre =
        MEMBRES_FICTIFS[Math.floor(Math.random() * MEMBRES_FICTIFS.length)];
      this.traiterContribution(amountInput.value, membre);
      this.fermerModal();
    });

    // ── Modal : fermeture ──
    document.getElementById("modal-close")?.addEventListener("click", () => {
      this.fermerModal();
    });
    document.getElementById("modal-overlay")?.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).id === "modal-overlay") this.fermerModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.fermerModal();
    });

    // ── Délégation sur la grille gouvernance (votes) ──
    document
      .getElementById("governance-grid")
      ?.addEventListener("click", (e: Event) => {
        const target = e.target as HTMLElement;

        const btnApprouver = target.closest("[data-action='approuver']") as HTMLElement | null;
        const btnRefuser = target.closest("[data-action='refuser']") as HTMLElement | null;

        if (btnApprouver) {
          const propId = parseInt(btnApprouver.dataset["propId"] ?? "0", 10);
          const prop = this.gestionnaireVote.voter(propId, "approuver");
          if (prop) {
            this.mettreAJourResultatsVote();
            this.mettreAJourCarteVote(prop);
          }
        }

        if (btnRefuser) {
          const propId = parseInt(btnRefuser.dataset["propId"] ?? "0", 10);
          const prop = this.gestionnaireVote.voter(propId, "refuser");
          if (prop) {
            this.mettreAJourResultatsVote();
            this.mettreAJourCarteVote(prop);
          }
        }
      });

    // ── Réinitialiser votes ──
    document
      .getElementById("btn-reset-votes")
      ?.addEventListener("click", () => {
        this.gestionnaireVote.reinitialiser();
        this.rendreGouvernance();
        this.mettreAJourResultatsVote();
        this.initScrollReveal();
      });

    // ── Hamburger menu mobile ──
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobile-menu");
    hamburger?.addEventListener("click", () => {
      mobileMenu?.classList.toggle("open");
    });

    // Fermer le menu mobile en cliquant sur un lien
    document.querySelectorAll(".mobile-menu__link").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu?.classList.remove("open");
      });
    });
  }

  /* ── MISE À JOUR D'UNE CARTE DE VOTE APRÈS DÉCISION ── */
  private mettreAJourCarteVote(prop: PropositionVote): void {
    const card = document.getElementById(`vote-card-${prop.id}`);
    if (!card || prop.statut === "en_cours") return;

    const actions = card.querySelector(".vote-card__actions");
    if (actions) {
      const boutons = actions.querySelectorAll("button");
      boutons.forEach((btn) => ((btn as HTMLButtonElement).disabled = true));
    }

    const label = prop.statut === "approuve" ? "✅ Approuvé" : "❌ Refusé";
    const couleur = prop.statut === "approuve" ? "#16a34a" : "#dc2626";
    const indicateur = document.createElement("div");
    indicateur.style.cssText = `margin-bottom:16px;font-weight:700;color:${couleur};font-size:0.9rem;`;
    indicateur.textContent = label;

    const actionsEl = card.querySelector(".vote-card__actions");
    if (actionsEl) card.insertBefore(indicateur, actionsEl);
  }
}

/* ──────────────────────────────────────────────
   DÉMARRAGE DE L'APPLICATION
────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  const app = new CoopEnergie();
  app.init();

  // Expose updateProgress sur window pour inspection/tests navigateur
  (window as Window & { updateProgress?: (c: number, g: number) => void })
    .updateProgress = (current: number, goal: number): void => {
    app.updateProgress(current, goal);
  };
});
