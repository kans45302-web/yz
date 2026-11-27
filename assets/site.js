(function () {
  // スマホのメニュー開閉
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  if (header && toggle) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.querySelector('.nav-toggle-label').textContent = open ? '閉じる' : 'メニュー';
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.querySelector('.nav-toggle-label').textContent = 'メニュー';
        toggle.focus();
      }
    });
  }

  // カラーバーのアニメーション順
  document.querySelectorAll('.hero .colorbar i').forEach(function (el, i) {
    el.style.setProperty('--i', i);
  });

  // お問い合わせフォーム（Googleフォームへ送信）
  var form = document.getElementById('contact-form');
  if (!form) return;

  var ENDPOINT = 'https://docs.google.com/forms/d/e/1FAIpQLSe9nkXUvqTtLjDPQpOuoC43iuyLF3Jnx4btmAA5iLR5lvPlhA/formResponse';
  var errorBox = document.getElementById('form-error');
  var done = document.getElementById('form-done');
  var submitBtn = form.querySelector('button[type="submit"]');

  function setInvalid(field, invalid) {
    if (!field) return;
    field.classList.toggle('is-invalid', invalid);
    var input = field.querySelector('input, textarea');
    if (input && input.type !== 'checkbox' && input.type !== 'radio') {
      input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
    }
  }

  function validate() {
    var firstBad = null;
    form.querySelectorAll('[data-required]').forEach(function (field) {
      var bad = false;
      var group = field.querySelectorAll('input[type="checkbox"], input[type="radio"]');
      if (group.length) {
        bad = !Array.prototype.some.call(group, function (i) { return i.checked; });
      } else {
        var input = field.querySelector('input, textarea');
        var v = input.value.trim();
        bad = v === '';
        if (!bad && input.type === 'tel') bad = v.replace(/[^0-9]/g, '').length < 10;
        if (!bad && input.type === 'email') bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      }
      setInvalid(field, bad);
      if (bad && !firstBad) firstBad = field;
    });
    var email = form.querySelector('#f-email');
    if (email && email.value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      setInvalid(email.closest('.field'), true);
      if (!firstBad) firstBad = email.closest('.field');
    } else if (email) {
      setInvalid(email.closest('.field'), false);
    }
    return firstBad;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = validate();
    if (bad) {
      errorBox.textContent = '入力されていない項目、または形式が正しくない項目があります。赤い表示の項目を確認してください。';
      errorBox.classList.add('is-shown');
      var target = bad.querySelector('input, textarea');
      if (target) target.focus();
      return;
    }
    errorBox.classList.remove('is-shown');

    var data = new URLSearchParams();
    form.querySelectorAll('[name^="entry."]').forEach(function (el) {
      if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
      if (el.value.trim() !== '') data.append(el.name, el.value.trim());
    });

    submitBtn.disabled = true;
    submitBtn.textContent = '送信しています…';

    fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', body: data })
      .then(function () {
        form.hidden = true;
        done.classList.add('is-shown');
        done.setAttribute('tabindex', '-1');
        done.focus();
        window.scrollTo({ top: done.getBoundingClientRect().top + window.pageYOffset - 120 });
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = '内容を送信する';
        errorBox.textContent = '通信エラーで送信できませんでした。時間をおいてもう一度お試しいただくか、お電話（090-3496-4516）でご連絡ください。';
        errorBox.classList.add('is-shown');
      });
  });

  form.addEventListener('input', function (e) {
    var field = e.target.closest('.field.is-invalid');
    if (field) setInvalid(field, false);
  });
  form.addEventListener('change', function (e) {
    var field = e.target.closest('.field.is-invalid');
    if (field) setInvalid(field, false);
  });
})();
