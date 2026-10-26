/* Michael Demers — scripts du site (refonte 2026) */
(function () {
  var header = document.getElementById('site-header');
  var burger = document.getElementById('burger');
  var ctaMobile = document.getElementById('cta-mobile');
  var hero = document.querySelector('.hero, .page-hero');

  /* En-tête : devient opaque après le haut de page */
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header && !header.classList.contains('toujours-solide')) {
      header.classList.toggle('est-solide', y > 60);
    }
    if (ctaMobile) {
      var seuil = hero ? hero.offsetHeight * 0.6 : 300;
      var pied = document.querySelector('.site-footer');
      var avantPied = pied ? pied.getBoundingClientRect().top > window.innerHeight - 40 : true;
      ctaMobile.classList.toggle('visible', y > seuil && avantPied);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Menu mobile */
  if (burger) {
    burger.addEventListener('click', function () {
      var ouvert = document.body.classList.toggle('menu-ouvert');
      burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
      burger.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
      document.body.style.overflow = ouvert ? 'hidden' : '';
    });
    document.querySelectorAll('.nav-menu a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-ouvert');
        document.body.style.overflow = '';
        burger.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-ouvert')) burger.click();
    });
  }

  /* HERO : la vidéo joue une fois, puis l'œil s'ouvre sur la photo.
     Dans la même visite, un retour à l'accueil montre directement la photo. */
  var heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    var heroEl = document.querySelector('.hero');
    var revoir = document.querySelector('.hero-revoir');
    var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var dejaVu = false;
    try { dejaVu = sessionStorage.getItem('md-hero-vu') === '1'; } catch (e) {}

    function montrerPhoto() {
      heroEl.classList.add('photo-visible');
      try { sessionStorage.setItem('md-hero-vu', '1'); } catch (e) {}
    }
    function chargerVideo() {
      if (heroVideo.dataset.charge) return;
      var mobile = window.matchMedia('(max-width: 760px)').matches;
      heroVideo.src = mobile ? heroVideo.dataset.srcMobile : heroVideo.dataset.src;
      heroVideo.dataset.charge = '1';
    }
    function jouer() {
      chargerVideo();
      heroEl.classList.remove('photo-visible');
      heroVideo.currentTime = 0;
      var p = heroVideo.play();
      if (p && p.catch) p.catch(montrerPhoto);
    }

    if (dejaVu || reduit) {
      heroEl.classList.add('sans-video', 'photo-visible');
    } else {
      jouer();
      /* filet de sécurité si la vidéo ne charge pas */
      setTimeout(function () { if (heroVideo.readyState < 2) montrerPhoto(); }, 6000);
    }
    heroVideo.addEventListener('ended', montrerPhoto);
    heroVideo.addEventListener('error', montrerPhoto);
    if (revoir) revoir.addEventListener('click', function () {
      heroEl.classList.remove('sans-video');
      jouer();
    });
  }

  /* Vidéos YouTube légères : l'iframe ne charge qu'au clic */
  document.querySelectorAll('.yt button[data-id]').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + b.dataset.id + '?autoplay=1&rel=0';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      f.title = b.getAttribute('aria-label') || 'Vidéo YouTube';
      b.parentNode.replaceChild(f, b);
    });
  });

  /* Galerie photo avec visionneuse */
  var galerie = document.querySelectorAll('.galerie button');
  var vis = document.getElementById('visionneuse');
  if (galerie.length && vis) {
    var img = vis.querySelector('img'), idx = 0, dernierFocus;
    function ouvrir(i) {
      idx = (i + galerie.length) % galerie.length;
      var g = galerie[idx].querySelector('img');
      img.src = galerie[idx].dataset.grand || g.src; img.alt = g.alt;
    }
    galerie.forEach(function (b, i) {
      b.addEventListener('click', function () { dernierFocus = b; ouvrir(i); vis.classList.add('ouverte'); vis.querySelector('.fermer').focus(); document.body.style.overflow = 'hidden'; });
    });
    function fermer() { vis.classList.remove('ouverte'); document.body.style.overflow = ''; if (dernierFocus) dernierFocus.focus(); }
    vis.querySelector('.fermer').addEventListener('click', fermer);
    vis.querySelector('.prec').addEventListener('click', function () { ouvrir(idx - 1); });
    vis.querySelector('.suiv').addEventListener('click', function () { ouvrir(idx + 1); });
    vis.addEventListener('click', function (e) { if (e.target === vis) fermer(); });
    document.addEventListener('keydown', function (e) {
      if (!vis.classList.contains('ouverte')) return;
      if (e.key === 'Escape') fermer();
      if (e.key === 'ArrowLeft') ouvrir(idx - 1);
      if (e.key === 'ArrowRight') ouvrir(idx + 1);
    });
  }
})();

/* POP-UP PARTY DES FÊTES
   S'affiche après 3 secondes, une seule fois par visite.
   Pas affiché sur les pages party des fêtes, soumission et merci.
   Se désactive tout seul à partir du 1er janvier 2027. */
(function () {
  var FIN = new Date(2027, 0, 1);
  var page = location.pathname.split('/').pop();
  var exclues = ['party-des-fetes.html', 'soumission.html', 'merci.html'];
  if (new Date() >= FIN || exclues.indexOf(page) !== -1) return;
  try { if (sessionStorage.getItem('md-popup-fetes') === '1') return; } catch (e) {}

  setTimeout(function () {
    var dernierFocus = document.activeElement;
    var fond = document.createElement('div');
    fond.className = 'popup-fetes';
    fond.innerHTML =
      '<div class="popup-fetes-boite" role="dialog" aria-modal="true" aria-labelledby="popup-fetes-titre">' +
        '<button class="popup-fetes-x" type="button" aria-label="Fermer">&times;</button>' +
        '<p class="popup-fetes-sur">Temps des fêtes</p>' +
        '<h2 id="popup-fetes-titre">Votre party des fêtes approche&nbsp;?</h2>' +
        '<p>Offrez à votre équipe une soirée de mentalisme dont elle parlera longtemps.</p>' +
        '<a class="btn btn-or" href="party-des-fetes.html">Découvrir l’animation</a>' +
        '<button class="popup-fetes-non" type="button">Non merci</button>' +
      '</div>';
    document.body.appendChild(fond);
    try { sessionStorage.setItem('md-popup-fetes', '1'); } catch (e) {}
    requestAnimationFrame(function () { fond.classList.add('ouvert'); });
    fond.querySelector('.btn').focus();

    function fermer() {
      fond.classList.remove('ouvert');
      document.removeEventListener('keydown', clavier);
      setTimeout(function () { fond.remove(); }, 250);
      if (dernierFocus && dernierFocus.focus) dernierFocus.focus();
    }
    function clavier(e) { if (e.key === 'Escape') fermer(); }
    fond.querySelector('.popup-fetes-x').addEventListener('click', fermer);
    fond.querySelector('.popup-fetes-non').addEventListener('click', fermer);
    fond.addEventListener('click', function (e) { if (e.target === fond) fermer(); });
    document.addEventListener('keydown', clavier);
  }, 3000);
})();
