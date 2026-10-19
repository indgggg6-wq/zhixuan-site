/* 智选网 · 交互：筛选（区/板块联动）/ 排序 / 留资提交 / 配色切换 / 复制 / 移动菜单 */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var CONFIG = window.ZX_CONFIG || {};

  /* ---------- 移动菜单 ---------- */
  var burger = document.querySelector('.burger');
  var mnav = document.getElementById('mnav');
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      mnav.setAttribute('data-open', String(!open));
      mnav.hidden = open;
    });
  }

  /* ---------- 页眉区域下拉 ---------- */
  var navDrop = document.querySelector('[data-nav-drop]');
  if (navDrop) {
    var dropBtn = navDrop.querySelector('.nav__drop-btn');
    var dropMenu = navDrop.querySelector('.nav__menu');
    var closeDrop = function () {
      dropMenu.hidden = true;
      dropBtn.setAttribute('aria-expanded', 'false');
    };
    dropBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !dropMenu.hidden;
      dropMenu.hidden = open;
      dropBtn.setAttribute('aria-expanded', String(!open));
    });
    document.addEventListener('click', function (e) {
      if (!navDrop.contains(e.target)) closeDrop();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrop();
    });
  }

  /* ---------- 配色切换 ---------- */
  var dock = document.querySelector('[data-theme-dock]');
  if (dock) {
    var toggle = dock.querySelector('[data-theme-toggle]');
    var panel = dock.querySelector('#theme-panel');
    var options = dock.querySelectorAll('[data-theme-set]');

    var current = root.getAttribute('data-theme');
    options.forEach(function (btn) {
      if (btn.getAttribute('data-theme-set') === current) btn.setAttribute('aria-current', 'true');
    });

    var close = function () {
      if (!panel.hidden) {
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      }
    };

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !panel.hidden;
      panel.hidden = open;
      toggle.setAttribute('aria-expanded', String(!open));
    });

    options.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-theme-set');
        root.setAttribute('data-theme', id);
        try { localStorage.setItem('zx-theme', id); } catch (e) { /* 隐私模式忽略 */ }
        options.forEach(function (b) { b.removeAttribute('aria-current'); });
        btn.setAttribute('aria-current', 'true');
        close();
      });
    });

    document.addEventListener('click', function (e) {
      if (!dock.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* ---------- 顶栏搜索 ---------- */
  var topsearch = document.querySelector('[data-topsearch]');
  if (topsearch) {
    topsearch.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = topsearch.querySelector('input').value.trim();
      if (!q) return;
      location.href = (body.getAttribute('data-base') || '') + 'index.html?q=' + encodeURIComponent(q);
    });
  }


  /* ---------- 联系方式浮层：桌面端不调系统拨号 ---------- */
  var isTouchPhone = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (window.matchMedia && window.matchMedia('(max-width: 760px) and (pointer: coarse)').matches);

  var copyText = function (text, done) {
    var fallback = function () {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (err) { /* 忽略 */ }
      body.removeChild(ta);
      done();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  };

  var contactModal = null;
  var openContact = function () {
    if (!contactModal) {
      contactModal = document.createElement('div');
      contactModal.className = 'cmodal';
      contactModal.hidden = true;
      contactModal.innerHTML = [
        '<div class="cmodal__mask" data-cmodal-close></div>',
        '<div class="cmodal__panel" role="dialog" aria-modal="true" aria-labelledby="cmodal-name">',
        '  <button class="cmodal__close" type="button" aria-label="关闭" data-cmodal-close>×</button>',
        '  <div class="cmodal__agent">',
        '    <span class="cmodal__avatar"><img src="' + ((body.getAttribute('data-base') || '') + 'assets/brand/logo-icon-128.png') + '" alt=""></span>',
        '    <span class="cmodal__badge">房源顾问</span>',
        '  </div>',
        '  <p class="cmodal__name" id="cmodal-name">', CONFIG.agentName || '智选网房源顾问', '</p>',
        '  <p class="cmodal__exp">已帮助 ', CONFIG.servedCount || '300+', ' 位客户找到厂房</p>',
        '  <div class="cmodal__chips"><span>房源真实</span><span>免费匹配</span><span>陪同看房</span></div>',
        '  <p class="cmodal__area">主营区域：', CONFIG.agentArea || '南京 · 江宁', '</p>',
        '  <p class="cmodal__phone mono">', CONFIG.phone || '', '</p>',
        '  <button class="btn btn--primary btn--block" type="button" data-cmodal-copy="phone">复制电话号码</button>',
        '  <div class="cmodal__row">',
        '    <span>微信 <b class="mono">', CONFIG.wechat || '', '</b></span>',
        '    <button class="btn" type="button" data-cmodal-copy="wechat">复制</button>',
        '  </div>',
        '  <div class="cmodal__qr', CONFIG.wechatQr ? '' : ' cmodal__qr--empty', '">',
        CONFIG.wechatQr
          ? '<img src="' + ((body.getAttribute('data-base') || '') + CONFIG.wechatQr) + '" alt="微信二维码">'
          : '<span>微信二维码</span><em>待上传</em>',
        '  </div>',
        '  <p class="cmodal__state" aria-live="polite"></p>',
        '  <p class="cmodal__note">1v1 专人服务 · 免费带看</p>',
        '</div>',
      ].join('');
      document.body.appendChild(contactModal);

      contactModal.addEventListener('click', function (e) {
        if (e.target.closest('[data-cmodal-close]')) {
          contactModal.hidden = true;
          body.classList.remove('no-scroll');
          return;
        }
        var copyBtn = e.target.closest('[data-cmodal-copy]');
        if (copyBtn) {
          var kind = copyBtn.getAttribute('data-cmodal-copy');
          var text = kind === 'phone' ? (CONFIG.phone || '') : (CONFIG.wechat || '');
          copyText(text, function () {
            var state = contactModal.querySelector('.cmodal__state');
            if (state) {
              state.textContent = '已复制：' + text;
              setTimeout(function () { state.textContent = ''; }, 1800);
            }
          });
        }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && contactModal && !contactModal.hidden) {
          contactModal.hidden = true;
          body.classList.remove('no-scroll');
        }
      });
    }
    contactModal.hidden = false;
    body.classList.add('no-scroll');
    var closeBtn = contactModal.querySelector('.cmodal__close');
    if (closeBtn) closeBtn.focus();
  };

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="tel:"]');
    if (!link) return;
    if (isTouchPhone) return; // 手机端交给系统拨号
    e.preventDefault();
    openContact();
  });

  /* ---------- 微信：桌面弹二维码，手机尝试唤起，微信内复制 ---------- */
  var toastEl = null;
  var showToast = function (msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2800);
  };

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-wechat]');
    if (!btn) return;
    e.preventDefault();
    var wechat = CONFIG.wechat || '';
    var inWechat = /MicroMessenger/i.test(navigator.userAgent);

    if (inWechat) {
      copyText(wechat, function () {
        showToast('已复制微信号 ' + wechat + '，在通讯录里搜索添加');
      });
      return;
    }
    if (isTouchPhone) {
      // 手机浏览器：先复制微信号并提示，再尝试唤起微信（唤起失败也不影响加好友）
      copyText(wechat, function () {
        showToast('微信号已复制：' + wechat + '，正在尝试打开微信');
      });
      setTimeout(function () { location.href = 'weixin://'; }, 500);
      return;
    }
    openContact();
  });

  /* ---------- 复制微信号 ---------- */
  var copyStateTimer = null;
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-copy]');
    if (!btn) return;
    var text = btn.getAttribute('data-copy');
    var done = function () {
      var state = document.querySelector('.copy-state');
      if (state) {
        state.textContent = '已复制：' + text;
        clearTimeout(copyStateTimer);
        copyStateTimer = setTimeout(function () { state.textContent = ''; }, 1800);
      }
      var old = btn.textContent;
      btn.textContent = '已复制';
      setTimeout(function () { btn.textContent = old; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {});
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (err) { /* 忽略 */ }
      body.removeChild(ta);
    }
  });

  /* ---------- 留资表单 ---------- */
  var LEAD_KEY = 'zx-leads';
  var lastSubmit = 0;

  var readLeads = function () {
    try { return JSON.parse(localStorage.getItem(LEAD_KEY) || '[]'); } catch (e) { return []; }
  };

  var saveLead = function (payload) {
    try {
      var list = readLeads();
      list.push(payload);
      localStorage.setItem(LEAD_KEY, JSON.stringify(list.slice(-50)));
    } catch (e) { /* 忽略 */ }
  };

  var setState = function (form, text, ok) {
    var el = form.querySelector('[data-lead-state]');
    if (!el) return;
    el.textContent = text;
    el.className = 'lead__state' + (ok ? ' is-ok' : ' is-err');
  };

  var submitLead = function (form, payload) {
    var endpoint = CONFIG.leadEndpoint;
    if (!endpoint) {
      // 未配置提交端点：本地记录（演示用），上线前在 config.json 填 leadEndpoint
      saveLead(payload);
      setState(form, '已收到，客服会尽快与你联系。', true);
      return;
    }
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        setState(form, '已收到，客服会尽快与你联系。', true);
        form.reset();
      })
      .catch(function () {
        saveLead(payload);
        setState(form, '提交失败，请直接电话联系客服，或稍后再试。', false);
      });
  };

  document.querySelectorAll('[data-lead-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var phone = String(data.get('phone') || '').replace(/\s/g, '');
      var honey = String(data.get('company') || '');
      if (honey) return; // 机器人填写了隐藏字段，静默丢弃
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        setState(form, '请填写 11 位手机号。', false);
        var input = form.querySelector('input[name="phone"]');
        if (input) input.focus();
        return;
      }
      var now = Date.now();
      if (now - lastSubmit < 15000) {
        setState(form, '提交太频繁，请稍后再试。', false);
        return;
      }
      lastSubmit = now;
      var payload = {
        phone: phone,
        name: String(data.get('name') || '').trim(),
        need: String(data.get('need') || ''),
        source: form.getAttribute('data-source') || '',
        listing: form.getAttribute('data-listing') || '',
        page: location.pathname,
        referrer: document.referrer || '',
        at: new Date().toISOString(),
      };
      submitLead(form, payload);
    });
  });

  /* 详情页移动端「留手机号」按钮：滚到表单并聚焦 */
  document.querySelectorAll('[data-scroll-lead]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var form = document.querySelector('[data-lead-form]');
      if (!form) return;
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      var input = form.querySelector('input[name="phone"]');
      if (input) setTimeout(function () { input.focus(); }, 350);
    });
  });

  /* ---------- 轻动效：滚动淡入 / 数字计数 ---------- */
  var motionOff = /[?&]motion=off/.test(location.search);
  var reduceMotion = motionOff || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (!reduceMotion && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-in'); });
    }
    // 兜底：观察器未触发时，1.2s 后全部显示，避免内容不可见
    setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add('is-in'); });
    }, 1200);
  }

  /* ---------- 房源筛选与排序 ---------- */
  var filterRoot = document.querySelector('[data-filters]');
  var rowsRoot = document.querySelector('[data-rows]');
  if (!filterRoot || !rowsRoot) return;

  var rows = Array.prototype.slice.call(rowsRoot.querySelectorAll('.row'));
  rows.forEach(function (row, i) { row.dataset.order = String(i); });

  var state = { district: 'all', block: 'all', floor: 'all', area: 'all', price: 'all', tag: 'all' };
  var keyword = '';

  var initialQ = new URLSearchParams(location.search).get('q');
  if (initialQ) {
    keyword = initialQ.trim().toLowerCase();
    var si = document.querySelector('[data-topsearch] input');
    if (si) si.value = initialQ;
  }

  var blockChips = filterRoot.querySelectorAll('[data-group="block"]');
  var syncBlocks = function () {
    // 选了区：板块只显示该区的；选了「全部」：显示所有板块
    blockChips.forEach(function (chip) {
      var d = chip.getAttribute('data-district');
      var show = state.district === 'all' || !d || d === state.district;
      chip.hidden = !show;
      if (!show && chip.getAttribute('aria-pressed') === 'true') {
        chip.setAttribute('aria-pressed', 'false');
        state.block = 'all';
        var all = filterRoot.querySelector('[data-group="block"][data-value="all"]');
        if (all) all.setAttribute('aria-pressed', 'true');
      }
    });
  };

  var areaMatch = function (value, bucket) {
    var n = Number(value);
    if (!n) return false;
    if (bucket === 's') return n < 3000;
    if (bucket === 'm') return n >= 3000 && n < 6000;
    if (bucket === 'l') return n >= 6000 && n < 10000;
    if (bucket === 'xl') return n >= 10000;
    return true;
  };

  var priceMatch = function (value, bucket) {
    var n = Number(value);
    if (value === '' || isNaN(n)) return false;
    if (bucket === 'a') return n < 0.35;
    if (bucket === 'b') return n >= 0.35 && n < 0.5;
    if (bucket === 'c') return n >= 0.5;
    return true;
  };

  var apply = function () {
    var visible = 0;
    rows.forEach(function (row) {
      var ok = true;
      if (state.district !== 'all' && row.getAttribute('data-district') !== state.district) ok = false;
      if (ok && state.block !== 'all' && row.getAttribute('data-block') !== state.block) ok = false;
      if (ok && state.floor !== 'all' && row.getAttribute('data-floor-group') !== state.floor) ok = false;
      if (ok && state.area !== 'all' && !areaMatch(row.getAttribute('data-area'), state.area)) ok = false;
      if (ok && state.price !== 'all' && !priceMatch(row.getAttribute('data-price'), state.price)) ok = false;
      if (ok && keyword && (row.getAttribute('data-keywords') || '').toLowerCase().indexOf(keyword) === -1) ok = false;
      if (ok && state.tag !== 'all') {
        var tags = (row.getAttribute('data-tags') || '').split(',');
        if (tags.indexOf(state.tag) === -1) ok = false;
      }
      row.hidden = !ok;
      if (ok) visible += 1;
    });
    var count = document.querySelector('[data-result-count]');
    if (count) count.innerHTML = '共 <b>' + visible + '</b> 条';
    var empty = document.querySelector('[data-empty]');
    if (empty) empty.hidden = visible !== 0;
  };

  var setPressed = function (group, value) {
    filterRoot.querySelectorAll('[data-group="' + group + '"]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-value') === value));
    });
  };

  // 品类入口：与楼层筛选联动
  document.querySelectorAll('[data-cat]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.floor = btn.getAttribute('data-cat');
      keyword = '';
      var qInput = document.querySelector('[data-topsearch] input');
      if (qInput) qInput.value = '';
      setPressed('floor', state.floor);
      document.querySelectorAll('[data-cat]').forEach(function (b) { b.classList.toggle('is-on', b === btn); });
      apply();
      var target = document.getElementById('all-listings');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // 首屏搜索条：应用筛选并滚到列表
  var heroSearch = document.querySelector('[data-hero-search]');
  if (heroSearch) {
    heroSearch.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = heroSearch.querySelector('[name="floor"]').value;
      var d = heroSearch.querySelector('[name="district"]').value;
      var a = heroSearch.querySelector('[name="area"]').value;
      state.floor = f || 'all';
      state.district = d || 'all';
      state.area = a || 'all';
      setPressed('floor', state.floor);
      setPressed('district', state.district);
      setPressed('area', state.area);
      syncBlocks();
      apply();
      var target = document.getElementById('all-listings');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  filterRoot.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-group]');
    if (!btn) return;
    var group = btn.getAttribute('data-group');
    state[group] = btn.getAttribute('data-value');
    setPressed(group, state[group]);
    if (group === 'district') syncBlocks();
    apply();
  });

  var sorters = {
    latest: function (a, b) {
      var d = String(b.getAttribute('data-published') || '').localeCompare(String(a.getAttribute('data-published') || ''));
      return d !== 0 ? d : Number(a.dataset.order) - Number(b.dataset.order);
    },
    'area-desc': function (a, b) { return Number(b.getAttribute('data-area')) - Number(a.getAttribute('data-area')); },
    'area-asc': function (a, b) { return Number(a.getAttribute('data-area')) - Number(b.getAttribute('data-area')); },
    'price-asc': function (a, b) { return Number(a.getAttribute('data-price')) - Number(b.getAttribute('data-price')); },
    'price-desc': function (a, b) { return Number(b.getAttribute('data-price')) - Number(a.getAttribute('data-price')); },
    default: function (a, b) { return Number(a.dataset.order) - Number(b.dataset.order); }
  };

  var sortSelect = document.querySelector('[data-sort]');
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      var fn = sorters[sortSelect.value] || sorters.default;
      rows.slice().sort(fn).forEach(function (row) { rowsRoot.appendChild(row); });
    });
  }

  var reset = function () {
    state = { district: 'all', block: 'all', floor: 'all', area: 'all', price: 'all', tag: 'all' };
    keyword = '';
    var qInput = document.querySelector('[data-topsearch] input');
    if (qInput) qInput.value = '';
    document.querySelectorAll('[data-cat]').forEach(function (b, i) { b.classList.toggle('is-on', i === 0); });
    Object.keys(state).forEach(function (g) { setPressed(g, 'all'); });
    syncBlocks();
    if (sortSelect) sortSelect.value = 'latest';
    rows.slice().sort(sorters.default).forEach(function (row) { rowsRoot.appendChild(row); });
    apply();
  };

  document.querySelectorAll('[data-reset]').forEach(function (btn) {
    btn.addEventListener('click', reset);
  });

  syncBlocks();
  apply();
})();
