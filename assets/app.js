(function () {
  var ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 17L7 7M7 7h9M7 7v9"/></svg>';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  window.esc = esc;

  // قائمة الجوال
  var mb = document.querySelector('.menu-btn'), mn = document.querySelector('.mnav');
  if (mb && mn) mb.addEventListener('click', function () {
    var open = mn.getAttribute('data-open') === 'true';
    mn.setAttribute('data-open', open ? 'false' : 'true');
    mb.setAttribute('aria-expanded', open ? 'false' : 'true');
  });

  if (mb && mn) mn.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      mn.setAttribute('data-open', 'false');
      mb.setAttribute('aria-expanded', 'false');
    }
  });

  window.cardHTML = function (j) {
    var vol = j.type === 'تطوعية';
    return '<a class="card" href="opportunity.html?id=' + j.id + '">' +
      '<div class="card-top"><span class="org"><span class="org-letter">' + esc(j.letter) + '</span><span class="org-name">' + esc(j.org) + '</span></span><span class="arrow">' + ARROW + '</span></div>' +
      '<h3>' + esc(j.title) + '</h3>' +
      '<span class="meta">' + esc(j.city) + ' · ' + esc(j.mode) + ' <span class="badge' + (vol ? ' vol' : '') + '">' + esc(j.type) + '</span></span>' +
      '<span class="pay">' + esc(j.pay) + '</span>' +
      '<span class="due' + (j.days <= 7 ? ' soon' : '') + '">' + daysLabel(j.days) + '</span></a>';
  };

  // الرئيسية: التبويبات والكروت
  var grid = document.getElementById('jobs');
  if (grid) {
    var count = document.getElementById('count');
    var tabs = document.querySelectorAll('.tab');
    function render(t) {
      var list = JOBS.filter(function (j) { return t === 'all' || (t === 'vol' ? j.type === 'تطوعية' : j.type !== 'تطوعية'); });
      grid.innerHTML = list.map(cardHTML).join('');
      count.textContent = list.length === 1 ? 'فرصة واحدة' : list.length === 2 ? 'فرصتان' : list.length + ' فرص';
      tabs.forEach(function (b) { b.setAttribute('aria-selected', b.dataset.t === t ? 'true' : 'false'); });
    }
    tabs.forEach(function (b) { b.addEventListener('click', function () { render(b.dataset.t); }); });
    render('all');
  }

  // صفحة الفرصة
  var opp = document.getElementById('opp');
  if (opp) {
    var id = new URLSearchParams(location.search).get('id') || 'j1';
    var j = JOBS.filter(function (x) { return x.id === id; })[0] || JOBS[0];
    document.title = j.title + ' — جمعيتي';
    function ul(a) { return '<ul>' + a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }
    var facts = [['المقابل', j.pay], ['النوع', j.type], ['التصنيف', j.cat], ['نمط العمل', j.mode], ['المدينة', j.city], ['ينتهي التقديم', 'بعد ' + j.days + ' ' + (j.days <= 10 ? 'أيام' : 'يومًا')]];
    var others = JOBS.filter(function (x) { return x.org === j.org && x.id !== j.id; }).length;
    var url = location.href;
    var wa = 'https://wa.me/?text=' + encodeURIComponent(j.title + ' — ' + j.org + '\n' + url);
    opp.innerHTML =
      '<a class="back" href="index.html#opps"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>العودة للفرص</a>' +
      '<div class="opp-head"><div><h1>' + esc(j.title) + '</h1><p class="opp-sub">في <a href="#org">' + esc(j.org) + '</a> · ' + esc(j.posted) + '</p></div>' +
      '<div class="share"><a class="icon-btn" href="' + wa + '" target="_blank" rel="noopener" aria-label="شارك في واتساب"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 8.6c.2 2.9 2.6 5.6 5.6 6l1-1.5-2-1-.8.8c-1-.4-2-1.3-2.4-2.4l.8-.8-1-2z"/></svg></a>' +
      '<button type="button" class="btn btn-ghost" id="copy"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg><span>انسخ الرابط</span></button></div></div>' +
      '<div class="opp-grid"><section class="panel">' +
        '<div class="blk"><h2>عن الفرصة</h2><p>' + esc(j.about) + '</p></div>' +
        '<div class="blk"><h2>المهام</h2>' + ul(j.tasks) + '</div>' +
        '<div class="blk"><h2>المتطلبات</h2>' + ul(j.reqs) + '</div>' +
        (j.perks && j.perks.length ? '<div class="blk"><h2>المزايا</h2>' + ul(j.perks) + '</div>' : '') +
      '</section><aside class="aside"><div class="facts">' +
        facts.map(function (f, i) { return '<div class="fact"><span>' + f[0] + '</span><b' + (i === 5 ? ' class="warn"' : '') + '>' + esc(f[1]) + '</b></div>'; }).join('') +
        '<a class="btn apply" href="#">قدّم ' + ARROW.replace('#1A1A1A', '#FFFFFF') + '</a><small>يفتح نموذج الجمعية</small></div>' +
        '<div class="org-card" id="org"><span class="org"><span class="org-letter">' + esc(j.letter) + '</span><span><b style="display:block;font-size:16px">' + esc(j.org) + '</b><span class="muted" style="font-size:13px">' + esc(j.city) + '</span></span></span>' +
        '<p>' + esc(ORGS[j.org] || '') + '</p>' + (others ? '<a href="index.html#opps">فرص أخرى لدى الجمعية (' + others + ')</a>' : '') + '</div>' +
      '</aside></div>' +
      '<div class="mbar"><a class="btn apply" href="#">قدّم ' + ARROW.replace('#1A1A1A', '#FFFFFF') + '</a></div>';
    document.body.classList.add('has-mbar');
    var copy = document.getElementById('copy');
    copy.addEventListener('click', function () {
      var done = function () { copy.querySelector('span').textContent = 'تم النسخ'; setTimeout(function () { copy.querySelector('span').textContent = 'انسخ الرابط'; }, 2000); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done); else done();
    });
    document.querySelectorAll('.apply').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); alertDemo(); });
    });
  }

  window.alertDemo = function () {
    var t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); t.style.cssText = 'position:fixed;left:50%;bottom:100px;transform:translateX(-50%);z-index:20;background:#1A1A1A;color:#fff;padding:12px 20px;border-radius:999px;font-size:14px;box-shadow:0 10px 24px rgba(0,0,0,.2);max-width:calc(100% - 32px);text-align:center'; document.body.appendChild(t); }
    t.textContent = 'في الموقع الحقيقي يفتح هنا نموذج التقديم الخاص بالجمعية';
    t.hidden = false; clearTimeout(t._h); t._h = setTimeout(function () { t.hidden = true; }, 2800);
  };
})();
