(function () {
  var esc = window.esc;
  var S = {
    step: /[?&]f=1/.test(location.search) ? 3 : 1, reached: 3, codeSent: false, email: '', code: '', err: false,
    org: 'جمعية نماء الأهلية', license: '', hq: 'مكة المكرمة', orgAbout: '',
    type: 'دائمة', title: '', cat: '', city: '', mode: 'حضوري',
    payFrom: '', payTo: '', perk: 'شهادة تطوع', deadline: '',
    about: '', tasks: ['', ''], reqs: ['', ''], perks: ['', ''], apply: 'link', applyVal: '', flagged: false
  };
  var CATS = ['صحي', 'إداري', 'فني وهندسي', 'تعليمي', 'اجتماعي', 'تقني', 'مالي ومحاسبي', 'تسويق وإعلام', 'أخرى'];
  var NAMES = ['الفرصة', 'التفاصيل', 'المراجعة'];
  var login = document.getElementById('login'), form = document.getElementById('form');

  function chips(list, key, cls) {
    return '<div class="chips ' + cls + '" role="radiogroup">' + list.map(function (v) {
      var val = Array.isArray(v) ? v[0] : v, lab = Array.isArray(v) ? v[1] : v;
      return '<button type="button" class="chip" role="radio" aria-checked="' + (S[key] === val) + '" data-k="' + key + '" data-v="' + esc(val) + '">' + esc(lab) + '</button>';
    }).join('') + '</div>';
  }
  function fld(label, inner, opt) { return '<label class="fld"><span>' + label + (opt ? ' <span class="opt">(اختياري)</span>' : ' <span class="req" aria-hidden="true">*</span>') + '</span>' + inner + (opt ? '' : '<span class="ferr" hidden>' + (inner.indexOf('<select') > -1 ? 'اختر ' : 'اكتب ') + label + '</span>') + '</label>'; }
  var STAR = ' <span class="req" aria-hidden="true">*</span>';
  function inp(k, ph, extra) { return '<input class="in' + (extra && extra.ltr ? ' ltr' : '') + '" data-k="' + k + '" value="' + esc(S[k]) + '" placeholder="' + esc(ph) + '"' + (extra && extra.attrs ? ' ' + extra.attrs : '') + '>'; }
  var ADD = { tasks: 'أضف مهمة', reqs: 'أضف متطلبًا', perks: 'أضف ميزة' };
  function lst(k, label, phs, opt) {
    return '<div class="fld"><span>' + label + (opt ? ' <span class="opt">(اختياري)</span>' : STAR) + '</span><div class="lst">' + S[k].map(function (v, i) {
      return '<div class="li"><input class="in" data-l="' + k + '" data-i="' + i + '" value="' + esc(v) + '" placeholder="' + esc(phs[i] || '') + '" aria-label="' + label + ' ' + (i + 1) + '">' +
        (i > 0 ? '<button type="button" class="rm" data-rm="' + k + '" data-i="' + i + '" aria-label="احذف">×</button>' : '') + '</div>';
    }).join('') + '</div>' + (opt ? '' : '<span class="ferr" hidden>' + (k === 'tasks' ? 'اكتب مهمة واحدة على الأقل' : 'اكتب متطلبًا واحدًا على الأقل') + '</span>') +
      (S[k].length < 10 ? '<button type="button" class="add" data-add="' + k + '">+ ' + ADD[k] + '</button>' : '') + '</div>';
  }
  function grow(t) { t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; }
  function ta(k, ph, rows) { return '<textarea class="in" data-k="' + k + '" rows="' + rows + '" placeholder="' + esc(ph) + '">' + esc(S[k]) + '</textarea>'; }
  function n(list) { return list.filter(function (x) { return String(x).trim(); }).length; }
  function plural(c, one, two, few, many) { return c === 1 ? one : c === 2 ? two : (c <= 10 ? c + ' ' + few : c + ' ' + many); }
  function detailsSummary() {
    var t = n(S.tasks), r = n(S.reqs), b = n(S.perks), out = [];
    if (S.about.trim()) out.push('عن الفرصة');
    if (t) out.push(plural(t, 'مهمة واحدة', 'مهمتان', 'مهام', 'مهمة'));
    if (r) out.push(plural(r, 'متطلب واحد', 'متطلبان', 'متطلبات', 'متطلبًا'));
    if (b) out.push(plural(b, 'ميزة واحدة', 'ميزتان', 'مزايا', 'ميزة'));
    return out.join(' · ') || '—';
  }
  function pay() { if (S.type === 'تطوعية') return S.perk; var a = S.payFrom.trim(), b = S.payTo.trim(); if (a && b) return a + ' – ' + b + ' ريال'; if (a) return 'من ' + a + ' ريال'; if (b) return 'حتى ' + b + ' ريال'; return ''; }

  function renderLogin() {
    var html = '<div class="login-box"><a class="brand" href="index.html"><img src="assets/logo.svg" alt="" aria-hidden="true"><b>جمعيتي</b></a>' +
      '<h1>ادخل ببريد جمعيتك</h1>';
    if (!S.codeSent) html += '<input class="in ltr" type="email" autocomplete="email" aria-label="بريد الجمعية" placeholder="hr@namaa.org.sa" data-k="email" value="' + esc(S.email) + '">' + '<span class="demo-hint">للتجربة: <b class="ltr">hr@namaa.org.sa</b> جمعية مسجلة، وأي بريد آخر جمعية جديدة</span>';
    else html += '<input class="in code ltr" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" aria-label="رمز التحقق" placeholder="000000" data-k="code" value="' + esc(S.code) + '">' +
      '<span class="muted">أرسلنا الرمز إلى ' + esc(S.email) + ' · <b style="color:#1A1A1A;font-weight:500">أعد الإرسال بعد 0:45</b></span><span class="muted" style="font-size:13px">في النسخة التجريبية اكتب أي 4 أرقام</span>';
    if (S.err) html += '<span class="err" role="alert">' + (S.codeSent ? 'اكتب رمز التحقق' : 'اكتب بريدًا إلكترونيًا صحيحًا') + '</span>';
    html += '<button type="button" class="btn" id="loginBtn">' + (S.codeSent ? 'تحقق' : 'أرسل الرمز') + '</button></div>';
    login.innerHTML = html;
    var i = login.querySelector('.in'); if (i) i.focus();
  }

  function stepper() {
    return '<nav class="stepper" aria-label="خطوات النشر"><ol>' + NAMES.map(function (n, i) {
      var k = i + 3, cur = k === S.step, done = !cur && k <= S.reached, locked = k > S.reached;
      return '<li class="' + (k < S.reached ? 'passed' : '') + '"><button type="button" class="st ' + (cur ? 'cur' : done ? 'done' : '') + '" data-go="' + k + '"' + (locked ? ' disabled' : '') + (cur ? ' aria-current="step"' : '') + '><span class="dot">' + (done ? '✓' : (i + 1)) + '</span><span class="nm">' + n + '</span></button></li>';
    }).join('') + '</ol></nav>';
  }

  function previewCard() {
    var vol = S.type === 'تطوعية', org = S.org || 'اسم الجمعية';
    return window.cardHTML({ id: 'j1', letter: org.replace('جمعية ', '').charAt(0), org: org, title: S.title || 'مسمى الفرصة', city: S.city || 'المدينة', mode: S.mode, type: S.type, pay: pay(), days: 14, posted: 'اليوم' })
      .replace('class="card"', 'class="card preview-card" tabindex="-1" onclick="return false"');
  }

  function renderForm() {
    var s = S.step, body = '';
    if (s === 2) body = '<div><h2>بيانات الجمعية</h2><p class="hint">تُعبّأ مرة واحدة</p></div>' +
      fld('اسم الجمعية', inp('org', 'مثلًا: جمعية نماء الأهلية')) +
      '<div class="row2">' + fld('رقم الترخيص', inp('license', '1234', { ltr: 1, attrs: 'inputmode="numeric"' })) + fld('مدينة المقر', inp('hq', 'ابحث عن مدينة...', { attrs: 'type="search"' })) + '</div>' +
      fld('نبذة قصيرة', ta('orgAbout', 'مثلًا: جمعية أهلية في مكة تعمل في تنمية الأسر منذ 2012', 3)) +
      '<div class="fld">الشعار <span class="opt">(اختياري)</span><button type="button" class="upload"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M4 20h16"/></svg>ارفع الشعار</button></div>';
    if (s === 3) body = '<h2>الفرصة</h2>' +
      '<div class="fld"><span>النوع' + STAR + '</span>' + chips(['دائمة', 'مؤقتة', 'دوام جزئي', 'تطوعية'], 'type', 'c4') + '</div>' +
      fld('مسمى الفرصة', inp('title', 'مثلًا: أخصائي/ة تمريض منزلي')) +
      '<div class="row2">' + fld('التصنيف', '<select class="in" data-k="cat" required><option value=""' + (S.cat ? '' : ' selected') + ' disabled>اختر التصنيف</option>' + CATS.map(function (c) { return '<option' + (c === S.cat ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select>') + fld('المدينة', inp('city', 'مثلًا: مكة المكرمة')) + '</div>' +
      '<div class="fld"><span>نمط العمل' + STAR + '</span>' + chips(['حضوري', 'هجين', 'عن بعد'], 'mode', 'c3') + '</div>' +
      (S.type === 'تطوعية'
        ? '<div class="fld"><span>المقابل' + STAR + '</span>' + chips(['شهادة تطوع', 'بدل تنقل', 'بدون مقابل'], 'perk', 'c3') + '</div>'
        : '<div class="fld"><span>الراتب الشهري <span class="opt">(اختياري)</span></span><div class="money"><label>' + inp('payFrom', '', { ltr: 1, attrs: 'inputmode="numeric" aria-label="من"' }) + '<span class="cur">ر.س</span></label><span class="muted">إلى</span><label>' + inp('payTo', '', { ltr: 1, attrs: 'inputmode="numeric" aria-label="إلى"' }) + '<span class="cur">ر.س</span></label></div></div>') +
      '';
    if (s === 4) body = '<h2>التفاصيل</h2>' +
      fld('عن الفرصة', ta('about', 'مثلًا: نبحث عن شخص يتابع برامج الأسر في الأحياء', 3)) +
      lst('tasks', 'المهام', ['مثلًا: متابعة البرامج الأسبوعية', 'مثلًا: تنسيق مواعيد المتطوعين']) +
      lst('reqs', 'المتطلبات', ['مثلًا: بكالوريوس في الخدمة الاجتماعية', 'مثلًا: خبرة سنة على الأقل']) +
      lst('perks', 'المزايا', ['مثلًا: تأمين طبي', 'مثلًا: دوام مرن'], true) +
      (S.flagged ? '<div class="alert" role="alert"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A3470A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none;margin-top:3px"><path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/></svg>لا ننشر الفرص التي تطلب رسومًا أو فيها رقم واتساب</div>' : '');
    if (s === 5) {
      var rows = [['الفرصة', [S.title || '—', S.type, S.cat].filter(Boolean).join(' · '), 3], ['المكان والمقابل', [S.city || '—', S.mode, pay()].filter(Boolean).join(' · '), 3], ['التفاصيل', detailsSummary(), 4]];
      body = '<h2>المراجعة</h2><div class="fld" style="font-weight:400"><span class="muted">هكذا تظهر فرصتك للباحثين</span>' + previewCard() + '</div>' +
        '<div class="review">' + rows.map(function (r) { return '<div class="r"><div><span>' + r[0] + '</span><b>' + esc(r[1]) + '</b></div><button type="button" data-go="' + r[2] + '">تعديل</button></div>'; }).join('') + '</div>' +
        '<div class="fld"><span>طريقة التقديم' + STAR + '</span><div style="max-width:320px">' + chips([['link', 'رابط'], ['mail', 'بريد']], 'apply', 'c2') + '</div>' +
        '<input class="in ltr" data-k="applyVal" value="' + esc(S.applyVal) + '" aria-label="' + (S.apply === 'link' ? 'رابط التقديم' : 'بريد التقديم') + '" placeholder="' + (S.apply === 'link' ? 'https://forms.gle/…' : 'jobs@namaa.org.sa') + '"><span class="ferr" hidden>' + (S.apply === 'link' ? 'اكتب رابط نموذج التقديم، مثل <bdi dir="ltr">https://forms.gle/…</bdi>' : 'اكتب بريدًا إلكترونيًا صحيحًا للتقديم') + '</span></div>';
    }
    var html;
    if (s === 6) html = '<div class="form-card"><div class="done"><span class="ok"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><h2>استلمنا فرصتك</h2><p class="muted" style="font-size:16px">نراجعها خلال يوم عمل</p><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:10px"><a class="btn btn-lg" href="org.html">عرض فرصك</a><button type="button" class="btn btn-lg btn-ghost" id="again">انشر فرصة أخرى</button></div></div></div>';
    else html = '<h1>انشر فرصة</h1>' + stepper() + '<section class="form-card">' + body +
      '<div class="form-nav"><button type="button" class="link-btn" id="back"' + (s > 3 ? '' : ' style="visibility:hidden"') + '>رجوع</button><button type="button" class="btn btn-lg" id="next">' + (s === 5 ? 'أرسل للمراجعة' : 'التالي') + '</button></div></section>';
    form.querySelector('.form-wrap').innerHTML = html;
  }

  function render() {
    var isLogin = S.step === 1;
    login.hidden = !isLogin; form.hidden = isLogin;
    if (isLogin) renderLogin(); else { renderForm(); form.querySelectorAll('textarea.in').forEach(grow); }
  }
  function go(n) { S.step = n; S.reached = Math.max(S.reached, n); render(); window.scrollTo(0, 0); }

  document.addEventListener('input', function (e) {
    if (e.target.tagName === 'TEXTAREA') grow(e.target);
    var l = e.target.getAttribute && e.target.getAttribute('data-l');
    if (l) { S[l][+e.target.dataset.i] = e.target.value; if (/رسوم|واتس|05\d{8}/.test(e.target.value) && !S.flagged) { S.flagged = true; var ii = e.target.dataset.i, pp = e.target.selectionStart; render(); var tt = form.querySelector('[data-l="' + l + '"][data-i="' + ii + '"]'); tt.focus(); tt.setSelectionRange(pp, pp); } return; }
    var k = e.target.getAttribute && e.target.getAttribute('data-k');
    if (!k) return;
    S[k] = e.target.value;
    if (['about'].indexOf(k) > -1 && /رسوم|واتس|05\d{8}/.test(e.target.value) && !S.flagged) { S.flagged = true; var pos = e.target.selectionStart; render(); var t = form.querySelector('[data-k="' + k + '"]'); t.focus(); t.setSelectionRange(pos, pos); }
  });
  document.addEventListener('change', function (e) { var k = e.target.getAttribute && e.target.getAttribute('data-k'); if (k) S[k] = e.target.value; });
  document.addEventListener('click', function (e) {
    var c = e.target.closest('.chip');
    if (c) { S[c.dataset.k] = c.dataset.v; render(); return; }
    var ad = e.target.closest('[data-add]');
    if (ad) { var ka = ad.dataset.add; S[ka].push(''); render(); var ins = form.querySelectorAll('[data-l="' + ka + '"]'); ins[ins.length - 1].focus(); return; }
    var rm = e.target.closest('[data-rm]');
    if (rm) { S[rm.dataset.rm].splice(+rm.dataset.i, 1); render(); return; }
    var g = e.target.closest('[data-go]');
    if (g && !g.disabled) { go(+g.dataset.go); return; }
    var id = e.target.closest('button') && e.target.closest('button').id;
    if (id === 'loginBtn') {
      var ok = S.codeSent ? S.code.replace(/\D/g, '').length >= 4 : /.+@.+\..+/.test(S.email);
      if (!ok) { S.err = true; renderLogin(); return; }
      S.err = false;
      if (!S.codeSent) { S.codeSent = true; renderLogin(); } else location.href = S.email.trim().toLowerCase() === 'hr@namaa.org.sa' ? 'org.html' : 'org-setup.html';
    }
    if (id === 'next') { var bad = false; form.querySelectorAll('.form-card .fld').forEach(function (f) { var e = f.querySelector('.ferr'); if (!e) return; var ls = f.querySelectorAll('.in[data-l]'); if (ls.length) { var none = [].every.call(ls, function (x) { return !x.value.trim(); }); ls[0].classList.toggle('bad', none); e.hidden = !none; if (none) bad = true; return; } var i = f.querySelector('.in[data-k]'); if (!i) return; var v = String(i.value).trim(), b = !v; if (!b && i.dataset.k === 'applyVal') b = S.apply === 'link' ? !/^(https?:\/\/)?[^\s.]+\.[^\s]+$/.test(v) : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); i.classList.toggle('bad', b); e.hidden = !b; if (b) bad = true; }); if (bad) { var x = form.querySelector('.in.bad'); if (x) x.focus(); return; } go(S.step + 1); }
    if (id === 'back') go(S.step - 1);
    if (id === 'again') { S.title = ''; S.cat = ''; S.city = ''; S.payFrom = S.payTo = ''; S.applyVal = ''; S.about = ''; S.tasks = ['', '']; S.reqs = ['', '']; S.perks = ['', '']; S.flagged = false; go(3); }
  });
  document.addEventListener('keydown', function (e) { var l = e.target.dataset && e.target.dataset.l; if (l && e.key === 'Enter') { e.preventDefault(); var at = +e.target.dataset.i + 1; if (S[l].length < 10) { S[l].splice(at, 0, ''); render(); } var nx = form.querySelector('[data-l="' + l + '"][data-i="' + Math.min(at, S[l].length - 1) + '"]'); if (nx) nx.focus(); return; } if (e.key === 'Enter' && S.step === 1 && e.target.classList.contains('in')) document.getElementById('loginBtn').click(); });
  document.addEventListener('paste', function (e) {
    var l = e.target.dataset && e.target.dataset.l; if (!l) return;
    var txt = (e.clipboardData || window.clipboardData).getData('text');
    var parts = txt.split(/\r?\n/).map(function (x) { return x.replace(/^\s*[-•*\d.)]+\s*/, '').trim(); }).filter(Boolean);
    if (parts.length < 2) return;
    e.preventDefault(); var at = +e.target.dataset.i;
    S[l].splice.apply(S[l], [at, S[l][at] ? 0 : 1].concat(parts)); S[l] = S[l].slice(0, 10); render();
  });
  render();
})();
