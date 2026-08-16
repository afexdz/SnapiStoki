# Audit i18n — Texte français encore codé en dur

> Généré le 2026-08-16  
> Périmètre : `app/` + `components/` (hors `node_modules`)  
> Méthode : lecture fichier par fichier, identification des littéraux français **non enveloppés** dans `t("…")` / `useTranslations()`  
> Exclusions : contenu utilisateur (titres d'annonces, bios, messages depuis la DB), commentaires de code, noms de variables/fonctions, chaînes déjà traduites

---

## Résumé global

| Zone | Fichiers à traduire | Chaînes estimées |
|------|---------------------|-----------------|
| Dashboard acheteur | 3 | ~70 |
| Dashboard vendeur | 6 | ~185 |
| Panel admin `/pixo` | 10 | ~173 |
| Listings (`/freelances`, `/marketplace`) | 2 | ~53 |
| Recherche (`/search`) | 1 | ~28 |
| Fiches service & produit + formulaires new | 6 | ~109 |
| Profil (`/profile`, `/profile/[id]`) | 2 | ~55 |
| Composants homepage | 3 | ~27 |
| Messagerie | 2 | ~27 |
| Composants partagés (Cards, ContactButton, CoverCropModal) | 4 | ~16 |
| Autres (`/devenir-vendeur`) | 1 | ~20 |
| **Total** | **~40** | **~763** |

**Déjà traduits (0 action requise) :** `Navbar`, `Footer`, `Hero`, `GetStarted`, `HowItWorks`, `login/page`, `register/page`, `ServiceBuyBox`, `ServiceMobileBar`, `ProductBuyBox`, `ProductMobileBar`, `messages/[id]/ThreadClient`.

---

## 1. Dashboard Acheteur — `app/[locale]/dashboard/client/`

### `page.tsx` (~45 chaînes)

```
Nav labels : "Tableau de bord", "Mes commandes", "Messages", "Favoris", "Mon profil", "Paramètres"
Header : "Espace Client", "Compte Acheteur", "Déconnexion"
Salutation : "Bonjour, {name} 👋", "Suivez vos conversations et activités"
Stats : "Conversations", "Messages non lus", "Favoris", "freelances sauvegardés", "tout lu", "à lire"
Sections : "Mes conversations récentes", "Voir tout →", "Aucune conversation pour l'instant", "Trouver un freelance →"
Quick actions : "Actions rapides", "Marketplace", "Mon profil", "Mon compte"
Profil inline : "Email", "Wilaya", "Non renseignée", "Acheteur", "Modifier le profil →"
Temps relatif : "À l'instant", "Hier", "Il y a {n} j"
Conversation : "Annonce supprimée", "Vous :", "Démarrez la conversation", "Utilisateur"
```

### `favorites/page.tsx` (~10 chaînes)

```
"Mes favoris", "Freelances et créateurs que vous suivez"
"Aucun favori pour l'instant"
"Sauvegardez vos freelances préférés pour les retrouver facilement"
"Découvrir les freelances →", ", Algérie", "Utilisateur", "Voir le profil"
```

### `orders/page.tsx` (~15 chaînes)

```
STATUS_LABELS : "En attente", "En cours", "Terminée", "Annulée"
Header : "Mes commandes", "Suivez l'avancement de vos commandes"
Filtres : "Toutes", "En attente", "En cours", "Terminées", "Annulées"
États vides : "Aucune commande trouvée", "Trouver un freelance →"
Tableau : "Commande #", "Service", "Produit digital"
```

---

## 2. Dashboard Vendeur — `app/[locale]/dashboard/freelance/`

### `page.tsx` (~45 chaînes)

```
Nav labels : "Tableau de bord", "Mes services", "Mes produits", "Commandes", "Messages", "Mon profil", "Publier un service"
Header : "Espace Freelance", "Déconnexion"
Salutation : "Bonjour, {name} 👋", "Voici un aperçu de votre activité"
Stats : "Services publiés", "Produits digitaux", "Conversations", "Messages non lus",
        "actifs", "en vente", "reçues", "tout lu", "à lire"
Sections : "Demandes récentes", "Voir tout →", "Aucune demande pour l'instant"
          "Publiez des services pour recevoir des messages"
Quick actions : "Actions rapides", "Publier un service", "Vendre un produit", "Voir mon profil", "Explorer"
Services inline : "Mes services", "Aucun service publié", "Sans catégorie"
Compte : "Informations du compte", "Wilaya", "Non renseignée", "Compte", "Vendeur / Freelance"
Temps relatif (identique au buyer) + "Annonce supprimée", "Vous :", "Démarrez la conversation", "Utilisateur"
```

### `orders/page.tsx` (~18 chaînes)

```
STATUS_LABELS (idem buyer)
Header : "Commandes reçues", "Gérez les commandes de vos clients"
Revenue : "Revenu total", "En cours", "Terminées"
Filtres (idem buyer)
États vides : "Aucune commande reçue", "Publiez vos services pour commencer à recevoir des commandes",
              "Publier un service →"
Tableau : "Commande #", "Service", "Produit digital"
```

### `services/page.tsx` (~15 chaînes)

```
confirm() : "Supprimer ce service ? Cette action est irréversible."
Header : "Mes services", "Nouveau service"
État vide : "Aucun service publié", "Créez votre premier service pour commencer à recevoir des commandes",
            "Publier un service →"
Statuts : "Actif", "En pause"
Actions : "Mettre en pause", "Réactiver", "Modifier", "Voir la fiche", "Suppression…", "Supprimer"
```

### `products/page.tsx` (~17 chaînes)

```
confirm() : "Supprimer ce produit ? Cette action est irréversible."
Header : "Mes produits", "Nouveau produit"
État vide : "Aucun produit publié", "Mettez en vente vos ressources numériques", "Publier un produit →"
Badges/statuts : "Actif", "En pause", "Gratuit"
Compteur : "{n} vente(s)"
Actions : "Mettre en pause", "Réactiver", "Modifier", "Voir la fiche", "Suppression…", "Supprimer"
```

### `services/[id]/edit/page.tsx` (~55 chaînes)

```
Étapes : ["Aperçu", "Tarifs", "Description & FAQ", "Galerie"]
Titre de page : "Modifier le service", "Mettez à jour les informations de votre service"
Champs : "Titre du service", "Catégorie", "Choisir une catégorie", "Tags (max 5)"
Toggle : "Package unique", "Packages tarifaires"
Colonnes : "Basique", "Standard", "Premium"
Sous-labels pkg : "Description", "Ce que comprend ce package...", "Délai", "Révisions", "Illimité", "Prix (DA)"
Validation pkg : "Minimum 1 000 DA", "Le prix Standard doit être ≥ Basique..."
Description : "Description du service", "Décrivez votre service en détail..."
FAQ : "FAQ (optionnel, max 5)", "+ Ajouter une question", "Question {i+1}", "Supprimer", "Ex: Quel format..."
Galerie : "Images du service (1–3 images, max 5MB)", "Glissez des images ici ou cliquez",
          "JPG, PNG, WebP — max 5MB", "Lien vidéo (optionnel — YouTube ou Vimeo)", badge "Cover"
Nav : "← Retour", "Continuer →", "Enregistrer les modifications", "Enregistrement..."
Validations : "Ajoutez au moins une image", "Non authentifié", "Service mis à jour", "Minimum 15 caractères"
Placeholder : "Ex: logo, design, branding"
Erreurs image : "Type non supporté (jpg, png, webp)", "Fichier trop volumineux — max 5MB"
```

### `products/[id]/edit/page.tsx` (~35 chaînes)

```
Titre de page : "Modifier le produit", "Mettez à jour votre ressource numérique"
Champs : "Titre du produit", "Ex: Pack d'icônes minimalistes...", "Type", "Choisir un type",
         "Licence", "Description (optionnel)", "Décrivez votre produit...", "Tags (max 8)"
Prix : "Prix", "Gratuit", "Minimum 500 DA"
Images : "Images d'aperçu (1–3 images, max 5MB)", "Glissez ou cliquez"
Fichier : "Fichier produit (optionnel — remplace le fichier actuel)", "Fichier actuel enregistré",
          "Laissez vide pour conserver ce fichier"
Actions : "Enregistrer les modifications", "Enregistrement...", badge "Nouveau"
Toasts : "Non authentifié", "Produit mis à jour"
Erreurs : "Type non supporté (jpg, png, webp)", "Fichier trop volumineux — max 5MB",
          "Format non supporté...", "Ajoutez au moins une image d'aperçu", "Prix minimum 500 DA"
```

---

## 3. Panel Admin — `app/[locale]/pixo/`

### `page.tsx` (login) (~8 chaînes)

```
"Panneau d'administration"
"Connexion Admin"
Labels : "Identifiant", "Mot de passe"
Bouton : "Connexion...", "Se connecter"
Erreurs : "Erreur de connexion", "Erreur réseau"
```

### `(panel)/AdminShell.tsx` (~10 chaînes)

```
Nav : "Tableau de bord", "Utilisateurs", "Services", "Produits", "Commandes", "Avis", "Signalements", "Paramètres"
Bouton : "Déconnexion"
```

### `(panel)/dashboard/page.tsx` (~25 chaînes)

```
Header : "Chargement...", "Tableau de bord", "Vue d'ensemble de la plateforme"
Stats : "Utilisateurs", "Services", "Produits", "Commandes", "Revenus", "Signalements"
Sub-labels : "+X cette semaine", "en attente"
Sections : "Inscriptions (30 derniers jours)", "Aucune donnée"
           "Dernières commandes", "Aucune commande"
           "Derniers inscrits"
Tableau : ["Nom", "Rôle", "Wilaya", "Inscription", "Statut"]
Statuts : "Suspendu", "Actif"
```

### `(panel)/users/page.tsx` (~25 chaînes)

```
Header : "Utilisateurs"
Filtres : placeholder "Rechercher par nom...", rôles "Tous les rôles"/"Acheteur"/"Vendeur"/"Les deux"
Tableau : ["Utilisateur", "Email", "Rôle", "Wilaya", "Inscription", "Statut", "Actions"]
États : "Aucun utilisateur trouvé", "Chargement...", "Suspendu", "Actif"
Actions : "Activer", "Suspendre", "Suppr."
Modal : "Confirmer", "Supprimer définitivement cet utilisateur ?", "Suspendre cet utilisateur ?",
        "Lever la suspension ?", "Annuler", "Confirmer"
Toasts : "Utilisateur supprimé", "Utilisateur suspendu", "Suspension levée"
```

### `(panel)/services/page.tsx` (~20 chaînes)

```
Header : "Services"
Filtre : placeholder "Rechercher un service..."
Tableau : ["Service", "Vendeur", "Catégorie", "Prix", "Note", "Commandes", "Statut", "Actions"]
États : "Aucun service", "Chargement...", "Actif", "Inactif", "Rejeté", "Approuvé"
Actions : "Approuver", "Rejeter", "Suppr."
confirm() + toasts : "Supprimer ce service ?", "Service mis à jour", "Service supprimé"
```

### `(panel)/products/page.tsx` (~20 chaînes)

```
Header : "Produits Digitaux"
Filtre : placeholder "Rechercher un produit..."
Tableau : ["Produit", "Vendeur", "Format", "Prix", "Téléch.", "Note", "Statut", "Actions"]
(statuts et actions identiques aux services)
```

### `(panel)/orders/page.tsx` (~15 chaînes)

```
Header : "Commandes"
Statuts filtre : "Tous les statuts", "En attente", "En cours", "Livré", "Complété", "Annulé"
Tableau : ["ID", "Acheteur", "Vendeur", "Type", "Montant", "Paiement", "Statut", "Date"]
États : "Aucune commande", "Chargement..."
```

### `(panel)/reviews/page.tsx` (~10 chaînes)

```
Header : "Avis"
Tableau : ["Auteur", "Sur", "Note", "Commentaire", "Date", "Action"]
États : "Aucun avis", "Chargement..."
Actions : "Suppr.", confirm "Supprimer cet avis ?", toast "Avis supprimé"
```

### `(panel)/reports/page.tsx` (~15 chaînes)

```
Header : "Signalements"
Statuts filtre : "Tous", "En attente", "Résolu", "Rejeté"
Tableau : ["Signaleur", "Cible", "Raison", "Statut", "Date", "Actions"]
États : "Aucun signalement", "Chargement..."
Actions : "Résoudre", "Rejeter", "Suppr.", confirm "Supprimer ce signalement ?"
Toasts (résolution/rejet/suppression)
```

### `(panel)/settings/page.tsx` (~25 chaînes)

```
Header : "Paramètres", "Configuration de la plateforme"
Section maintenance : "Mode Maintenance",
  "Désactive l'accès public au site. Seuls les admins peuvent se connecter.",
  "⚠ Mode maintenance ACTIVÉ...", "✓ Site en ligne..."
Identifiants : "Identifiants Admin", "Les identifiants sont définis via les variables d'environnement...",
               "Identifiant", "Défini via ADMIN_USERNAME", "Mot de passe", "Défini via ADMIN_PASSWORD"
Infos système : "Informations Système", labels ["Plateforme", "Environnement", "Framework", "Base de données"],
                valeurs ["Production", "Développement"]
Zone danger : "Zone Dangereuse", "Actions irréversibles — à utiliser avec précaution.",
              "Vider le cache", confirm "Vider le cache de la plateforme ?",
              toast "Cache vidé (simulation)", toast "Paramètre sauvegardé"
```

---

## 4. Listings

### `app/[locale]/freelances/FreelancesClient.tsx` (~25 chaînes)

```
Tri : "Pertinence", "Mieux notés", "Prix croissant", "Prix décroissant", "Près de moi"
Filtres panneau : "Catégorie", "Toutes", "Note minimale", "Budget", "Min", "Max", "Illimité",
                  "Réinitialiser les filtres", "1 000 DA", placeholder "Illimité"
Fil d'Ariane : "Accueil", "Services"
Hero : "Trouvez le talent parfait pour votre projet", "+ Publier un service"
Compteur : "{n} services trouvés"
États : "Chargement…", "Filtres", "Près de {wilaya}"
Vide : "Aucun service trouvé", "Essayez de modifier vos filtres."
Validation : "Le minimum ne peut pas dépasser le maximum."
```

### `app/[locale]/marketplace/page.tsx` (~28 chaînes)

```
Hero : "Marketplace Numérique", "Ressources numériques prêtes à télécharger",
       "Templates, icônes, polices, mockups et bien plus — créés par des designers algériens.",
       "+ Vendre un produit"
Onglets/filtres : "Tout", tri×5, "Gratuits uniquement", "Prix min", "Prix max", "Illimité",
                  "Toutes les catégories", "Réinitialiser", "Filtres"
Compteur : "{n} produits"
Vide : "Aucun produit trouvé", "Essayez de modifier vos filtres", "+ Vendre votre premier produit"
Carte inline : "par {name}", "{n} vente(s)", "Télécharger", "Acheter"
```

---

## 5. Recherche

### `app/[locale]/search/page.tsx` (~28 chaînes)

```
Champ : placeholder "Rechercher un service ou un produit…", bouton "Rechercher"
Compteurs : "{n} résultat(s) pour '{q}'", "Aucun résultat pour '{q}'"
Filtres : "Filtres", tri×4, "Toutes les catégories", "Réinitialiser"
Sections : "Freelances disponibles", "Voir tous →", "Aucun freelance trouvé pour cette recherche"
           "Produits digitaux", "Voir tout →", "Aucun produit trouvé pour cette recherche"
État vide : "Que recherchez-vous ?", "Tapez un service, une compétence ou un produit digital…"
Cartes : "Voir le profil →", "Télécharger", "Acheter", "par {name}", "{n} vente(s)", "Freelance", "Vendeur"
```

---

## 6. Fiches Service & Produit — `app/[locale]/services/[id]/` et `products/[id]/`

### `services/[id]/page.tsx` (~15 chaînes)

```
Fil d'Ariane : "Accueil", "Services"
Sections : "Description", "Questions fréquentes", "Avis clients", "À propos du vendeur", "Services similaires"
Notation : "{n} avis"
Vide : "Aucun avis pour le moment", "Soyez le premier à commander ce service"
Vendeur : "Membre depuis {date}"
```

### `services/[id]/CreatedToast.tsx` (1 chaîne)

```
"Service publié avec succès !"
```

### `services/new/page.tsx` (~50 chaînes)

```
Étapes : ["Aperçu", "Tarifs", "Description & FAQ", "Galerie"]
Header : "Publier un service", "Remplissez les informations pour créer votre offre"
Champs step 1 : "Titre du service", "Je vais créer votre logo professionnel...", "Minimum 15 caractères",
                "Catégorie", "Choisir une catégorie", "Tags (max 5)", "Ex: logo, design, branding"
Champs step 2 : "Packages tarifaires", "Package unique", "Basique", "Standard", "Premium",
                labels PkgColumn ("Description", "Délai", "Révisions", "Illimité", "Prix (DA)"),
                "Minimum 1 000 DA", "Ce que comprend ce package...",
                "Le prix Standard doit être ≥ Basique, et Premium ≥ Standard. Minimum 1 000 DA."
Champs step 3 : "Description du service", "Décrivez votre service en détail...",
                "Minimum 120 caractères ({n} manquants)", "FAQ (optionnel, max 5)", "+ Ajouter une question",
                "Question {i+1}", "Supprimer", "Ex: Quel format de fichiers livrez-vous ?", "Réponse..."
Champs step 4 : "Images du service (1–3 images, max 5MB chacune)", "Glissez des images ici ou cliquez pour sélectionner",
                "JPG, PNG, WebP — max 5MB", badge "Cover", "Lien vidéo (optionnel — YouTube ou Vimeo)"
Nav : "Continuer →", "← Retour", bouton publier
Erreurs : "Type de fichier non supporté (jpg, png, webp uniquement)", "Fichier trop volumineux — max 5MB",
          "Ajoutez au moins une image", "Erreur lors de la publication"
```

### `products/[id]/page.tsx` (~12 chaînes)

```
Fil d'Ariane : "Accueil", "Marketplace"
Sections : "Description", "Avis", "À propos du créateur", "Produits similaires"
Notation : "{n} avis"
Vide : "Aucun avis pour le moment"
Fallback : "Acheteur", "Vendeur"
Vendeur : "Membre depuis {date}"
```

### `products/[id]/CreatedToast.tsx` (1 chaîne)

```
"Produit publié avec succès !"
```

### `products/new/page.tsx` (~30 chaînes)

```
Header : "Vendre un produit digital", "Mettez en vente vos créations numériques"
Champs : "Titre du produit", "Ex: Pack 50 templates logo vectoriels...",
         "Type de produit", "Sélectionner",
         "Licence" (valeurs: "Usage personnel", "Usage commercial", "Licence étendue")
         "Description", "Décrivez votre produit, ce qu'il contient...", "Tags (max 8)"
         "Ex: logo, figma, template..."
Prix : "Prix", "Payant", "Gratuit", "Minimum 1 000 DA", "Le prix minimum est 1 000 DA"
Fichier : "Fichier principal *", "ZIP, PDF, PSD, AI, SVG... — max 50MB",
          "Glissez votre fichier ici ou cliquez", "Supprimer"
Images : "Images de présentation * (1–4, max 5MB)", "Glissez des images ici ou cliquez", badge "Cover"
Erreurs : "Type non supporté (jpg, png, webp)", "Fichier trop volumineux — max 5MB",
          "Format non supporté. Acceptés: ...", "Fichier trop volumineux — max 50MB",
          "Remplissez tous les champs obligatoires", "Erreur lors de la publication"
```

---

## 7. Profil

### `app/[locale]/profile/page.tsx` (~40 chaînes)

```
CropModal interne : "Recadrer la photo", "Ratio 1:1 — glissez pour repositionner",
                    "Ratio 16:3 — glissez pour repositionner", "Annuler", "Confirmer", "Envoi..."
Menu cover : "Faites glisser pour repositionner", "Annuler", "Confirmer",
             "Changer la couverture", "Repositionner", "Supprimer la couverture"
Menu avatar : "Changer la photo", "Supprimer la photo"
Header profil : "Vendeur" (badge rôle), "Membre depuis {date}", "avis" (compteur)
Bouton : "Modifier le profil"
Stats array : "Commandes", "Ventes", "Avis", "Revenus"
Onglets : "Mes services", "Mes produits", "Avis", "Paramètres"
Cards : "Modifier" (link), "Ajouter un service", "Ajouter un produit"
Tab avis : "Aucun avis reçu pour l'instant.", "Anonyme", dates (relativeDate)
Tab paramètres : "Informations du compte", "Adresse email",
                 "L'adresse email ne peut pas être modifiée ici.", "Membre depuis",
                 "Modifier les informations du profil", "Zone de danger",
                 "Une fois votre compte supprimé, toutes vos données seront définitivement perdues.",
                 "Supprimer mon compte"
Modal édition : "Modifier le profil", "Nom complet", "Votre nom complet",
                "Métier / spécialité (optionnel)", "ex: Designer graphique, Développeur web…",
                "Bio", "Décrivez votre expérience et vos compétences…",
                "Ville", "Ex: Alger", "Pays", "Wilaya", boutons "Annuler"/"Sauvegarder"
```

### `app/[locale]/profile/[id]/page.tsx` (~15 chaînes)

```
Not found : "Profil introuvable", "Retour à l'accueil"
Fil d'Ariane : (via Navbar)
Stats : "services actifs", "produits actifs", "note moyenne"
Sections : "Services", "Produits numériques"
Badge produit : "Gratuit"
Prix ventes : "{n} vente{s}"
Vendeur : "Membre depuis {date}"
```

---

## 8. Composants Homepage — `components/`

### `Categories.tsx` (~20 chaînes)

```
Section header : "Catégories" (eyebrow), "Explorez par domaine" (h2),
                 "Des compétences créatives aux services techniques, tout ce dont votre projet a besoin.",
                 "Toutes les catégories →"
Data array (label + subtitle) :
  "Design & Graphisme" / "Logos, identités, affiches"
  "Développement web" / "Sites, apps, e-commerce"
  "Vidéo & Animation" / "Montage, motion design"
  "Marketing digital" / "Meta Ads, TikTok, SEO"
  "Rédaction & Traduction" / "FR, AR, EN, Darija"
  "Audio & Voix off" / "Podcasts, doublage, jingles"
  "E-books & Formations" / "Guides, cours, templates"
  "Templates & Assets" / "Canva, Notion, UI kits"
```

### `Marketplace.tsx` (~6 chaînes)

```
"Marketplace" (eyebrow)
"Téléchargez, c'est prêt" (h2)
"Templates, packs et ressources digitales prêts à l'emploi" (subtitle)
"Voir tous les produits →"
"Aucun produit pour le moment"
"Vendre un produit →"
```

### `TopFreelancers.tsx` (~6 chaînes)

```
"Services" (eyebrow)
"Les services les plus demandés" (h2)
"Les offres les mieux notées et les plus populaires de la plateforme" (subtitle)
"Voir tous les services →"
"Soyez le premier à publier un service"
"Publier un service →"
```

---

## 9. Messagerie

### `app/[locale]/messages/ConversationsSidebar.tsx` (~12 chaînes)

```
Temps relatif : "À l'instant", "Hier", "Il y a {n} j"
Header : "Messages"
État vide : "Aucune conversation"
Fallback : "Utilisateur"
Previews : "Démarrez la conversation", "📌 Annonce partagée", "📎 Image", "📎 Document", "📎 Fichier"
Préfixe : "Vous : "
```

### `app/[locale]/messages/page.tsx` (~15 chaînes)

```
Temps relatif (idem)
Header : "Messages" (h1)
Erreur : "Impossible de charger les conversations.", "Réessayer"
État vide : "Aucun message pour le moment",
            "Contactez un vendeur depuis son profil ou une annonce pour démarrer une conversation.",
            "Voir les services", "Marketplace"
Previews (idem sidebar) + "Une erreur inattendue est survenue.", "Utilisateur"
```

---

## 10. Composants Partagés

### `components/ServiceCard.tsx` (~4 chaînes)

```
"Meilleure vente" (badge)
"Nouveau" (badge)
"À partir de"
"Freelance" (fallback nom vendeur)
```

### `components/ProductCard.tsx` (~5 chaînes)

```
"Gratuit" (badge × 2 — condition et texte prix)
"Nouveau" (badge)
"À partir de"
"Vendeur" (fallback)
"{n} vente(s)"
```

### `components/ContactButton.tsx` (~2 chaînes)

```
"Chargement..."
"Contacter"
```

### `components/CoverCropModal.tsx` (~5 chaînes)

```
"Recadrer l'image de couverture"
"Ratio {aspect}:1 — déplacez et redimensionnez la zone de sélection"
"Annuler"
"Recadrage..."
"Appliquer"
```

---

## 11. Autres

### `app/[locale]/devenir-vendeur/page.tsx` (~20 chaînes)

```
Hero : "Gratuit et sans engagement" (badge), "Devenez vendeur sur PixRaise",
       "Transformez votre talent en revenus. Rejoignez notre communauté de freelances créatifs..."
Bénéfices (data array titles + descs) :
  "Publiez vos services et produits" / "Créez des offres de freelance et vendez..."
  "Visibilité internationale" / "Accédez à une clientèle mondiale..."
  "Messagerie intégrée" / "Les acheteurs vous contactent directement..."
Section : "Tout ce que vous obtenez gratuitement"
CTA card : "Prêt à commencer ?", "Activez votre compte vendeur en un clic..."
Bouton : "Activation en cours…", "Activer mon compte vendeur →"
Notes : "Vous resterez acheteur en même temps. Aucun engagement.",
        "← Retour au tableau de bord"
```

---

## Fichiers DÉJÀ traduits (aucune action requise)

| Fichier | Namespace |
|---------|-----------|
| `components/Navbar.tsx` | `"nav"` |
| `components/Footer.tsx` | `"footer"` |
| `components/Hero.tsx` | `"home.hero"` |
| `components/GetStarted.tsx` | `"home.getStarted"` |
| `components/HowItWorks.tsx` | `"home.hiw"` |
| `app/[locale]/login/page.tsx` | `"auth.login"` |
| `app/[locale]/register/page.tsx` | `"auth.register"` |
| `app/[locale]/services/[id]/ServiceBuyBox.tsx` | `"service.buybox"` |
| `app/[locale]/services/[id]/ServiceMobileBar.tsx` | `"service.buybox"` |
| `app/[locale]/products/[id]/ProductBuyBox.tsx` | `"product.buybox"` |
| `app/[locale]/products/[id]/ProductMobileBar.tsx` | `"product.buybox"` |
| `app/[locale]/messages/[id]/ThreadClient.tsx` | `"messages"` |
| `app/[locale]/dashboard/page.tsx` | Redirect uniquement |
| `app/[locale]/pixo/(panel)/layout.tsx` | Aucun texte visible |
