(function () {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  const siteHeader = $('#siteHeader');
  const updateHeaderScroll = () => {
    if (!siteHeader) return;
    siteHeader.classList.toggle('shadow-md', window.scrollY > 10);
    siteHeader.classList.toggle('bg-white/90', window.scrollY > 10);
  };
  window.addEventListener('scroll', updateHeaderScroll, { passive: true });
  updateHeaderScroll();

  const menuBtn = $('#menuBtn');
  const mobileMenu = $('#mobileMenu');
  const moreWrap = $('[data-more-wrap]');
  const moreBtn = $('#moreMenuBtn');
  const moreMenu = $('#moreMenu');

  const closeMobileMenu = () => {
    if (!mobileMenu || !menuBtn) return;
    mobileMenu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open navigation menu');
    document.body.classList.remove('overflow-hidden');
  };

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const willOpen = mobileMenu.hidden;
      mobileMenu.hidden = !willOpen;
      menuBtn.setAttribute('aria-expanded', String(willOpen));
      menuBtn.setAttribute('aria-label', willOpen ? 'Close navigation menu' : 'Open navigation menu');
      document.body.classList.toggle('overflow-hidden', willOpen);
    });

    $$('#mobileMenu a').forEach((link) => link.addEventListener('click', closeMobileMenu));
  }

  const closeMoreMenu = () => {
    if (!moreMenu || !moreBtn) return;
    moreMenu.classList.add('hidden');
    moreBtn.setAttribute('aria-expanded', 'false');
  };

  if (moreBtn && moreMenu && moreWrap) {
    moreBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const expanded = moreBtn.getAttribute('aria-expanded') === 'true';
      moreMenu.classList.toggle('hidden', expanded);
      moreBtn.setAttribute('aria-expanded', String(!expanded));
    });


    $$('#moreMenu a').forEach((link) => link.addEventListener('click', closeMoreMenu));
    document.addEventListener('click', (event) => {
      if (!moreWrap.contains(event.target)) closeMoreMenu();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMoreMenu();
      closeMobileMenu();
    }
  });

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  $$('a.nav-link, a.mobile-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPage) link.classList.add('active');
    else link.classList.remove('active');
  });

  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else revealItems.forEach((item) => item.classList.add('visible'));

  const topBtn = $('#topBtn');
  if (topBtn) {
    window.addEventListener('scroll', () => topBtn.classList.toggle('show', window.scrollY > 500));
    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
  $$('[data-contact-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const message = $('.form-message', form);
      if (message) {
        message.textContent = 'Thank you. Your message has been prepared and shared for school office follow-up.';
        message.classList.add('show');
      }
      form.reset();
    });
  });

  const admissionForm = $('#admissionForm');
  if (admissionForm) {
    let step = 1;
    const totalSteps = 3;
    const next = $('[data-next-step]', admissionForm);
    const prev = $('[data-prev-step]', admissionForm);
    const submit = $('[data-submit-application]', admissionForm);
    const result = $('#applicationResult');

    const updateStep = () => {
      $$('.form-step', admissionForm).forEach((panel) => panel.classList.toggle('active', Number(panel.dataset.step) === step));
      $$('[data-step-dot]', admissionForm).forEach((dot) => dot.classList.toggle('active', Number(dot.dataset.stepDot) <= step));
      if (prev) prev.disabled = step === 1;
      if (next) next.hidden = step === totalSteps;
      if (submit) submit.hidden = step !== totalSteps;
    };

    const validateCurrentStep = () => {
      const fields = $$(`[data-step="${step}"] input, [data-step="${step}"] select, [data-step="${step}"] textarea`, admissionForm);
      for (const field of fields) {
        if (!field.checkValidity()) {
          field.reportValidity();
          return false;
        }
      }
      return true;
    };

    next?.addEventListener('click', () => {
      if (!validateCurrentStep()) return;
      step = Math.min(totalSteps, step + 1);
      updateStep();
    });
    prev?.addEventListener('click', () => {
      step = Math.max(1, step - 1);
      updateStep();
    });

    admissionForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validateCurrentStep()) return;
      const formData = new FormData(admissionForm);
      const data = Object.fromEntries(formData.entries());
      data.reference = `ABELA-ADM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      data.status = 'Submitted for School Office Review';
      data.submitted_at = new Date().toISOString();
      localStorage.setItem('abelaAdmissionDemo', JSON.stringify(data));
      if (result) {
        result.innerHTML = `<strong>Admission request received.</strong><br>Your reference is <strong>${data.reference}</strong>. Please contact the school office to complete official verification.`;
        result.classList.add('show');
      }
      admissionForm.reset();
      step = 1;
      updateStep();
    });
    updateStep();
  }

  const portalRecord = $('#portalRecord');
  const portalApplications = $('#portalApplications');
  if (portalRecord) {
    const raw = localStorage.getItem('abelaAdmissionDemo');
    if (raw) {
      const data = JSON.parse(raw);
      portalRecord.innerHTML = `
        <div class="grid gap-3 sm:grid-cols-2">
          <p><strong>Reference:</strong><br>${data.reference}</p>
          <p><strong>Status:</strong><br>${data.status}</p>
          <p><strong>Parent:</strong><br>${data.parent_name || 'Not provided'}</p>
          <p><strong>Learner:</strong><br>${data.child_name || 'Not provided'} · ${data.applying_class || 'Class not selected'}</p>
        </div>`;
      if (portalApplications) portalApplications.textContent = '1';
    } else if (portalApplications) portalApplications.textContent = '0';
  }

  const filterWrap = $('[data-gallery-filters]');
  const galleryGrid = $('[data-gallery-grid]');
  if (filterWrap && galleryGrid) {
    filterWrap.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      const filter = button.dataset.filter;
      $$('[data-filter]', filterWrap).forEach((btn) => btn.classList.toggle('active', btn === button));
      $$('[data-category]', galleryGrid).forEach((item) => {
        item.hidden = filter !== 'all' && item.dataset.category !== filter;
      });
    });
  }

  const photoTabs = $('[data-photo-tabs]');
  const photoGrid = $('[data-photo-grid]');
  if (photoTabs && photoGrid) {
    photoTabs.addEventListener('click', (event) => {
      const tab = event.target.closest('[data-photo-filter]');
      if (!tab) return;
      const filter = tab.dataset.photoFilter;
      $$('[data-photo-filter]', photoTabs).forEach((button) => button.classList.toggle('active', button === tab));
      $$('[data-photo-type]', photoGrid).forEach((card) => {
        card.hidden = filter !== 'all' && card.dataset.photoType !== filter;
      });
    });
  }

  $$('[data-copy-prompt]').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copyPrompt);
      if (!target) return;
      const text = target.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = 'Copied';
        setTimeout(() => { button.textContent = 'Copy prompt'; }, 1200);
      } catch (error) {
        button.textContent = 'Copy manually';
      }
    });
  });

})();
