// ============================================================
// AI WRITING ASSISTANT — MOCK IMPLEMENTATION
// ============================================================
// This file simulates the AI generation API call.
// TO REPLACE WITH REAL AI CALL: swap the body of `generateProductContent`
// with an actual fetch() to your AI endpoint (e.g. /api/ai/generate-product).
// The function signature and return type must remain identical.
// ============================================================

export interface GenerateInput {
  prompt: string
}

export interface GenerateResult {
  titles: string[]
  descriptions: string[]
  tags: string[]
}

export async function generateProductContent(input: GenerateInput): Promise<GenerateResult> {
  // Simulated network delay — remove when wiring the real API
  await new Promise(resolve => setTimeout(resolve, 1500))

  const p = input.prompt.toLowerCase()

  if (p.includes("icon") || p.includes("icône") || p.includes("icone") || p.includes("أيقون")) {
    return {
      titles: [
        "Pack 50 icônes minimalistes pour applications mobiles",
        "Collection UI Icons — style flat, 50 variations vectorielles",
        "Iconset Premium : 50 icônes SVG pour app & web",
      ],
      descriptions: [
        "Boostez vos projets mobiles avec ce pack de 50 icônes minimalistes, soigneusement dessinées pour une lisibilité optimale. Disponibles en SVG et PNG (16 à 512 px), elles s'intègrent facilement dans Figma, Sketch ou Adobe XD. Idéales pour iOS, Android ou interfaces web.",
        "Un ensemble complet de 50 icônes vectorielles au style flat et épuré. Chaque icône est livrée en SVG scalable, PNG multi-résolution et en composant Figma prêt à l'emploi. Parfait pour les designers UI/UX souhaitant accélérer leurs livrables.",
      ],
      tags: ["icônes", "iconset", "UI", "flat design", "SVG", "Figma", "mobile", "vectoriel", "minimaliste", "application"],
    }
  }

  if (p.includes("template") || p.includes("modèle") || p.includes("نموذج")) {
    return {
      titles: [
        "Pack de templates Figma — 20 écrans UI modernes",
        "Kit UI complet : 20 templates Figma prêts à l'emploi",
        "Collection templates web & mobile — 20 maquettes Figma",
      ],
      descriptions: [
        "Accélérez vos projets avec ce kit de 20 templates Figma conçus pour des interfaces modernes et responsives. Chaque écran est entièrement personnalisable, avec des composants atomiques organisés et une grille cohérente. Idéal pour landing pages, dashboards et applications mobiles.",
        "Un pack de 20 maquettes Figma soigneusement organisées, compatibles avec Auto Layout. Styles de texte, couleurs et composants centralisés pour une personnalisation rapide. Livré avec une documentation d'utilisation complète.",
      ],
      tags: ["Figma", "template", "UI kit", "maquette", "design system", "mobile", "web", "dashboard", "responsive", "composants"],
    }
  }

  if (p.includes("police") || p.includes("font") || p.includes("typeface") || p.includes("خط")) {
    return {
      titles: [
        "Police de caractères moderne — famille 6 graisses",
        "Typeface Premium : famille typographique complète",
        "Font Display — 6 variantes pour titres et corps de texte",
      ],
      descriptions: [
        "Une police contemporaine déclinée en 6 graisses (Light à ExtraBold), idéale pour identités visuelles, affiches et interfaces numériques. Fournie en OTF, TTF et WOFF2 pour une compatibilité maximale avec tous les outils.",
        "Typeface élégante et fonctionnelle, conçue pour une lisibilité optimale à toutes les tailles. La famille complète inclut 6 graisses avec leurs versions italiques — 12 fichiers au total. Compatible Adobe CC, Figma, Canva et tous les logiciels standard.",
      ],
      tags: ["police", "typeface", "typographie", "font", "OTF", "TTF", "identité visuelle", "branding", "6 graisses", "WOFF2"],
    }
  }

  if (p.includes("logo") || p.includes("شعار")) {
    return {
      titles: [
        "Pack 30 logos vectoriels — style minimaliste moderne",
        "Collection templates logo Illustrator & Figma",
        "30 logos vectoriels éditables — usage commercial inclus",
      ],
      descriptions: [
        "Un pack de 30 templates logo au style minimaliste et contemporain, livrés en AI, EPS et SVG. Chaque modèle est entièrement éditable : couleurs, typographies et proportions ajustables en quelques clics. Usage commercial inclus pour tous vos projets clients.",
        "Créez des logos professionnels en quelques minutes avec cette collection de 30 templates vectoriels. Compatibles Adobe Illustrator, Affinity Designer et Figma. Chaque template inclut plusieurs variantes (couleur, noir & blanc, horizontal, vertical).",
      ],
      tags: ["logo", "vectoriel", "Illustrator", "EPS", "SVG", "branding", "identité visuelle", "minimaliste", "modifiable", "usage commercial"],
    }
  }

  // Generic fallback
  return {
    titles: [
      "Ressource créative premium — téléchargement instantané",
      "Pack numérique professionnel pour designers et créatifs",
      "Ressource design haute qualité — licence commerciale incluse",
    ],
    descriptions: [
      "Découvrez cette ressource digitale conçue pour les professionnels du design. Livrée en haute résolution dans les formats standards de l'industrie, elle vous fera gagner un temps précieux sur vos projets. Compatible avec les principaux outils (Figma, Adobe CC, Sketch).",
      "Un produit digital de qualité professionnelle, prêt à l'emploi. Tous les fichiers sont organisés et documentés pour une prise en main rapide. La licence commerciale est incluse, vous permettant d'utiliser cette ressource dans vos projets clients.",
    ],
    tags: ["design", "numérique", "premium", "ressource", "créatif", "professionnel", "haute résolution", "vectoriel", "usage commercial", "téléchargement"],
  }
}
