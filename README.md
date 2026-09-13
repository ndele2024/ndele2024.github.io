# Portfolio — Romuald Asonmene Tewounno

Site statique (HTML, CSS, JavaScript sans dépendance ni étape de build).

```
index.html      contenu : à propos, expériences, projets, formation, compétences, contact
css/style.css   mise en page, thèmes clair et sombre, responsive
js/main.js      menu mobile, thème, filtres des projets, animations
```

## Aperçu local

```bash
python -m http.server 5500
```

Puis ouvrir http://localhost:5500.

## Mettre à jour

- Ajouter un projet : copier un bloc `<article class="project">` dans `index.html`,
  et renseigner `data-cat` (`web`, `ia`, `vision`) pour les filtres.
- Changer la couleur d'accent : variable `--accent` en haut de `css/style.css`.

## Hébergement gratuit (GitHub Pages)

```bash
git init
git add .
git commit -m "Portfolio initial"
git branch -M main
git remote add origin https://github.com/ndele2024/ndele2024.github.io.git
git push -u origin main
```

Sur GitHub : Settings → Pages → Source « Deploy from a branch » → `main` / `/ (root)`.
Le site est en ligne à https://ndele2024.github.io quelques minutes plus tard.
