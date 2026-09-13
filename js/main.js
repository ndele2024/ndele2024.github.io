(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Thème clair / sombre ---------- */
  var themeBtn = document.getElementById('themeToggle');
  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  themeBtn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- Menu mobile ---------- */
  var menuBtn = document.getElementById('menuToggle');
  var links = document.getElementById('navLinks');
  function closeMenu() {
    links.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  menuBtn.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- Barre de navigation au défilement ---------- */
  var nav = document.querySelector('.nav');
  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
    // Filet de sécurité : un défilement rapide peut sauter un élément sans que l'observateur le voie
    document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-visible');
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Apparition au défilement + section active ---------- */
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { revealObs.observe(el); });

    var navMap = {};
    links.querySelectorAll('a[href^="#"]').forEach(function (a) { navMap[a.getAttribute('href').slice(1)] = a; });
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var a = navMap[entry.target.id];
        if (a && entry.isIntersecting) {
          Object.keys(navMap).forEach(function (k) { navMap[k].classList.remove('is-current'); });
          a.classList.add('is-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { sectionObs.observe(s); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Filtres des projets ---------- */
  var chips = document.querySelectorAll('.chip');
  var projects = document.querySelectorAll('.project');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-pressed', String(active));
      });
      projects.forEach(function (p) {
        var cats = (p.getAttribute('data-cat') || '').split(' ');
        var show = f === 'all' || cats.indexOf(f) !== -1;
        p.hidden = !show;
        if (show) p.classList.add('is-visible');
      });
    });
  });

  /* ---------- Copier l'adresse courriel ---------- */
  var copyBtn = document.getElementById('copyEmail');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.getAttribute('data-email');
      var label = copyBtn.textContent;
      function done() {
        copyBtn.textContent = 'Adresse copiée ✓';
        setTimeout(function () { copyBtn.textContent = label; }, 2000);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, function () { window.location.href = 'mailto:' + email; });
      } else {
        window.location.href = 'mailto:' + email;
      }
    });
  }

  /* ---------- Année du pied de page ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Mini-démo : taquin ---------- */
  var puzzle = document.getElementById('puzzleDemo');
  if (puzzle && !reduceMotion) {
    // Alterne la tuile 8 entre sa position et la case vide (le « coup » RIGHT)
    var solved = false;
    setInterval(function () {
      var tiles = puzzle.children;
      var empty = tiles[7], eight = tiles[8];
      if (!solved) { puzzle.insertBefore(eight, empty); } else { puzzle.insertBefore(empty, eight); }
      solved = !solved;
    }, 1600);
  }

  /* ---------- Mini-démo : damier ---------- */
  var board = document.getElementById('board');
  if (board) {
    var cells = [];
    for (var r = 0; r < 8; r++) {
      for (var c = 0; c < 8; c++) {
        var sq = document.createElement('div');
        var dark = (r + c) % 2 === 1;
        sq.className = 'sq ' + (dark ? 'd' : 'l');
        if (dark && r < 3) sq.innerHTML = '<span class="pc b"></span>';
        if (dark && r > 4) sq.innerHTML = '<span class="pc w"></span>';
        board.appendChild(sq);
        cells.push(sq);
      }
    }
    if (!reduceMotion) {
      // Petite séquence de coups en boucle
      var moves = [[5, 0, 4, 1], [2, 3, 3, 2], [5, 2, 4, 3], [2, 5, 3, 4], [4, 3, 2, 5]];
      var i = 0, history = [];
      var at = function (row, col) { return cells[row * 8 + col]; };
      setInterval(function () {
        if (i < moves.length) {
          var m = moves[i++];
          var from = at(m[0], m[1]), to = at(m[2], m[3]);
          var piece = from.firstChild;
          if (piece && !to.firstChild) {
            var captured = null;
            if (Math.abs(m[0] - m[2]) === 2) {
              var mid = at((m[0] + m[2]) / 2, (m[1] + m[3]) / 2);
              captured = mid.firstChild;
              if (captured) mid.removeChild(captured);
            }
            to.appendChild(piece);
            history.push({ from: from, to: to, piece: piece, captured: captured, m: m });
          }
        } else {
          // Réinitialise en rejouant l'historique à l'envers
          history.reverse().forEach(function (h) {
            h.from.appendChild(h.piece);
            if (h.captured) at((h.m[0] + h.m[2]) / 2, (h.m[1] + h.m[3]) / 2).appendChild(h.captured);
          });
          history = [];
          i = 0;
        }
      }, 1300);
    }
  }
})();
