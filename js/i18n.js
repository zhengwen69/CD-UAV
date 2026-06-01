/**
 * CDU GuFei Demo - i18n Translation Engine
 * Supports: zh / en / th / fr / de
 * Version 2.0 · 2026.05.31
 */
(function () {
  'use strict';

  var LANGS = [
    { code: 'zh', flag: '🇨🇳', name: '中文',     htmlLang: 'zh-CN' },
    { code: 'en', flag: '🇬🇧', name: 'English', htmlLang: 'en'    },
    { code: 'th', flag: '🇹🇭', name: 'ไทย',     htmlLang: 'th'    },
    { code: 'fr', flag: '🇫🇷', name: 'Français', htmlLang: 'fr'    },
    { code: 'de', flag: '🇩🇪', name: 'Deutsch',  htmlLang: 'de'    },
    { code: 'ja', flag: '🇯🇵', name: '日本語',   htmlLang: 'ja'    },
    { code: 'ko', flag: '🇰🇷', name: '한국어',   htmlLang: 'ko'    },
    { code: 'zh-Hant', flag: '🇹🇼', name: '繁體中文', htmlLang: 'zh-Hant' }
  ];

  var VALID_LANGS = {};
  LANGS.forEach(function (l) { VALID_LANGS[l.code] = l; });

  var I18N = {
    current: 'zh',
    data: {},
    dropdownOpen: false,

    init: function () {
      this.injectSwitcher();

      var params = new URLSearchParams(window.location.search);
      var lang = params.get('lang') || localStorage.getItem('cdu-gufei-lang') || 'zh';

      if (!VALID_LANGS[lang]) lang = 'zh';
      if (lang === 'zh') {
        this.current = 'zh';
        document.documentElement.lang = 'zh-CN';
        this.updateSwitcher();
        return;
      }

      document.documentElement.style.visibility = 'hidden';

      var self = this;
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'lang/' + lang + '.json', true);
      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            self.data = JSON.parse(xhr.responseText);
            self.current = lang;
            document.documentElement.lang = VALID_LANGS[lang].htmlLang;
            self.translate();
          } catch (e) {
            self.current = 'zh';
          }
        }
        document.documentElement.style.visibility = 'visible';
        self.updateSwitcher();
      };
      xhr.onerror = function () {
        document.documentElement.style.visibility = 'visible';
        self.current = 'zh';
        self.updateSwitcher();
      };
      xhr.send();
    },

    injectSwitcher: function () {
      // Inject CSS
      var style = document.createElement('style');
      style.id = 'i18n-styles';
      style.textContent = [
        '.lang-drop{position:fixed;top:20px;right:20px;z-index:9999;user-select:none}',
        '.lang-trigger{display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:8px;',
          'border:1px solid rgba(91,155,213,.2);background:rgba(13,31,53,.9);color:#c8d6e5;',
          'cursor:pointer;font-size:14px;transition:all .3s;white-space:nowrap}',
        '.lang-trigger:hover{border-color:#5b9bd5;box-shadow:0 4px 12px rgba(0,0,0,.3)}',
        '.lang-trigger .arrow{font-size:10px;transition:transform .3s;color:#556677}',
        '.lang-trigger .arrow.open{transform:rotate(180deg)}',
        '.lang-menu{position:absolute;top:46px;right:0;min-width:160px;',
          'background:rgba(13,31,53,.95);border:1px solid rgba(91,155,213,.2);',
          'border-radius:8px;overflow:hidden;opacity:0;visibility:hidden;',
          'transform:translateY(-8px);transition:all .25s;box-shadow:0 8px 30px rgba(0,0,0,.5)}',
        '.lang-menu.open{opacity:1;visibility:visible;transform:translateY(0)}',
        '.lang-option{display:flex;align-items:center;gap:10px;padding:12px 16px;',
          'cursor:pointer;font-size:14px;color:#c8d6e5;transition:background .2s;',
          'border:none;width:100%;text-align:left;background:none;font-family:inherit}',
        '.lang-option:hover{background:rgba(91,155,213,.15)}',
        '.lang-option.active{background:rgba(91,155,213,.2);color:#5b9bd5;font-weight:600}',
        '.lang-option .flag{font-size:18px;flex-shrink:0}',
        '.lang-option .name{flex:1}',
        '.lang-option .check{color:#5b9bd5;font-size:12px;opacity:0}',
        '.lang-option.active .check{opacity:1}',
        '@media(max-width:768px){',
          '.lang-drop{top:10px;right:10px}',
          '.lang-trigger{padding:6px 10px;font-size:12px;gap:6px}',
          '.lang-trigger .arrow{font-size:8px}',
          '.lang-menu{top:38px;min-width:140px}',
          '.lang-option{padding:10px 12px;font-size:12px}',
        '}'
      ].join('\n');
      document.head.appendChild(style);

      // Build DOM (after DOM ready)
      var self = this;
      function build() {
        var cur = VALID_LANGS[self.current] || LANGS[0];
        var html = '<div class="lang-drop">';
        html += '<div class="lang-trigger" id="lang-trigger">';
        html += '<span class="flag">' + cur.flag + '</span>';
        html += '<span class="name">' + cur.name + '</span>';
        html += '<span class="arrow">▼</span>';
        html += '</div>';
        html += '<div class="lang-menu" id="lang-menu">';
        LANGS.forEach(function (l) {
          html += '<button class="lang-option' + (l.code === self.current ? ' active' : '') + '" data-lang="' + l.code + '">';
          html += '<span class="flag">' + l.flag + '</span>';
          html += '<span class="name">' + l.name + '</span>';
          html += '<span class="check">✓</span>';
          html += '</button>';
        });
        html += '</div></div>';

        var wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        var dropEl = wrapper.firstChild;
        document.body.insertBefore(dropEl, document.body.firstChild);

        // Events
        var trigger = document.getElementById('lang-trigger');
        var menu = document.getElementById('lang-menu');
        var arrow = trigger.querySelector('.arrow');

        trigger.addEventListener('click', function (e) {
          e.stopPropagation();
          self.dropdownOpen = !self.dropdownOpen;
          menu.classList.toggle('open', self.dropdownOpen);
          arrow.classList.toggle('open', self.dropdownOpen);
        });

        menu.querySelectorAll('.lang-option').forEach(function (btn) {
          btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var l = btn.getAttribute('data-lang');
            if (l !== self.current) {
              self.switchLang(l);
            } else {
              self.dropdownOpen = false;
              menu.classList.remove('open');
              arrow.classList.remove('open');
            }
          });
        });

        document.addEventListener('click', function () {
          if (self.dropdownOpen) {
            self.dropdownOpen = false;
            menu.classList.remove('open');
            arrow.classList.remove('open');
          }
        });

        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && self.dropdownOpen) {
            self.dropdownOpen = false;
            menu.classList.remove('open');
            arrow.classList.remove('open');
          }
        });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
      } else {
        build();
      }
    },

    translate: function () {
      if (this.current === 'zh') return;

      var i, key, val;
      var els;

      els = document.querySelectorAll('[data-i18n]');
      for (i = 0; i < els.length; i++) {
        key = els[i].getAttribute('data-i18n');
        val = this.get(key);
        if (val !== undefined) els[i].textContent = val;
      }

      els = document.querySelectorAll('[data-i18n-html]');
      for (i = 0; i < els.length; i++) {
        key = els[i].getAttribute('data-i18n-html');
        val = this.get(key);
        if (val !== undefined) els[i].innerHTML = val;
      }

      els = document.querySelectorAll('[data-i18n-placeholder]');
      for (i = 0; i < els.length; i++) {
        key = els[i].getAttribute('data-i18n-placeholder');
        val = this.get(key);
        if (val !== undefined) els[i].placeholder = val;
      }

      els = document.querySelectorAll('[data-i18n-title]');
      for (i = 0; i < els.length; i++) {
        key = els[i].getAttribute('data-i18n-title');
        val = this.get(key);
        if (val !== undefined) els[i].title = val;
      }

      var tKey = document.documentElement.getAttribute('data-i18n-title');
      if (tKey) {
        val = this.get(tKey);
        if (val !== undefined) document.title = val;
      }

      try {
        window.dispatchEvent(new CustomEvent('i18n:translated', { detail: { lang: this.current } }));
      } catch (e) {}
    },

    get: function (key) {
      var parts = key.split('.');
      var obj = this.data;
      for (var i = 0; i < parts.length; i++) {
        if (obj === null || obj === undefined) return undefined;
        obj = obj[parts[i]];
      }
      return obj;
    },

    switchLang: function (lang) {
      localStorage.setItem('cdu-gufei-lang', lang);
      var url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      window.location.href = url.toString();
    },

    updateSwitcher: function () {
      var trigger = document.getElementById('lang-trigger');
      var menu = document.getElementById('lang-menu');
      if (!trigger || !menu) return;
      var cur = VALID_LANGS[this.current] || LANGS[0];
      trigger.querySelector('.flag').textContent = cur.flag;
      trigger.querySelector('.name').textContent = cur.name;
      var opts = menu.querySelectorAll('.lang-option');
      for (var i = 0; i < opts.length; i++) {
        opts[i].classList.toggle('active', opts[i].getAttribute('data-lang') === this.current);
      }
    }
  };

  window.I18N = I18N;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { I18N.init(); });
  } else {
    I18N.init();
  }
})();
