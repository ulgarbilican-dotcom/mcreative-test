/* Eigen uitklapmenu voor <select class="dd-src"> of alle selects in formulieren met data-dd.
   De echte select blijft bestaan (verborgen), zodat het formulier en scripts gewoon blijven werken. */
(function () {
  var open = null;

  function close(box, focusBtn) {
    if (!box) return;
    box.classList.remove('open');
    box.querySelector('.dd-btn').setAttribute('aria-expanded', 'false');
    if (open === box) open = null;
    if (focusBtn) box.querySelector('.dd-btn').focus();
  }

  function build(sel) {
    if (sel.__dd) return;
    var box = document.createElement('div');
    box.className = 'dd';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dd-btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    var txt = document.createElement('span');
    txt.className = 'dd-txt';
    btn.appendChild(txt);
    var list = document.createElement('ul');
    list.className = 'dd-list';
    list.setAttribute('role', 'listbox');
    list.tabIndex = -1;
    box.appendChild(btn);
    box.appendChild(list);
    sel.parentNode.insertBefore(box, sel.nextSibling);
    sel.classList.add('dd-native');
    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');
    sel.__dd = box;

    var items = [];
    var idx = -1;

    function render() {
      list.innerHTML = '';
      items = [];
      [].slice.call(sel.options).forEach(function (o, i) {
        if (o.disabled && o.value === '') return;
        var li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.dataset.i = i;
        li.textContent = o.textContent;
        if (o.selected && o.value !== '') li.classList.add('sel');
        li.addEventListener('click', function () { choose(i); });
        li.addEventListener('mousemove', function () { hl(items.indexOf(li)); });
        list.appendChild(li);
        items.push(li);
      });
      sync();
    }

    function sync() {
      var o = sel.options[sel.selectedIndex];
      var placeholder = !o || o.value === '' || o.disabled;
      txt.textContent = o ? o.textContent : '';
      box.classList.toggle('dd-empty', placeholder);
      items.forEach(function (li) {
        li.classList.toggle('sel', !!o && +li.dataset.i === sel.selectedIndex && o.value !== '');
        li.setAttribute('aria-selected', li.classList.contains('sel'));
      });
    }

    function choose(i) {
      sel.selectedIndex = i;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      sync();
      close(box, true);
    }

    function hl(i) {
      idx = i;
      items.forEach(function (li, k) { li.classList.toggle('hl', k === i); });
      if (items[i]) items[i].scrollIntoView({ block: 'nearest' });
    }

    function openIt() {
      if (open && open !== box) close(open);
      box.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      open = box;
      var cur = items.findIndex(function (li) { return li.classList.contains('sel'); });
      hl(cur > -1 ? cur : 0);
      var r = box.getBoundingClientRect();
      box.classList.toggle('up', window.innerHeight - r.bottom < 280 && r.top > 280);
    }

    btn.addEventListener('click', function () { box.classList.contains('open') ? close(box) : openIt(); });
    btn.addEventListener('keydown', function (e) {
      var isOpen = box.classList.contains('open');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen) { openIt(); return; }
        hl(Math.max(0, Math.min(items.length - 1, idx + (e.key === 'ArrowDown' ? 1 : -1))));
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (isOpen) { e.preventDefault(); if (items[idx]) choose(+items[idx].dataset.i); }
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault(); close(box, true);
      } else if (e.key === 'Tab') {
        close(box);
      }
    });

    /* de echte select programmatisch aanpassen (sel.value = ...) werkt ook */
    var proto = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(sel, 'value', {
      get: function () { return proto.get.call(sel); },
      set: function (v) { proto.set.call(sel, v); sync(); }
    });
    sel.addEventListener('change', sync);
    new MutationObserver(render).observe(sel, { childList: true });
    sel.__ddRender = render;

    /* het label hoort bij de knop */
    var lab = sel.closest('label');
    if (lab) lab.addEventListener('click', function (e) { if (!box.contains(e.target)) { e.preventDefault(); btn.focus(); } });
    render();
  }

  document.addEventListener('click', function (e) { if (open && !open.contains(e.target)) close(open); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) close(open, true); });

  function init() { [].slice.call(document.querySelectorAll('select[data-dd], form.sf select, #form select')).forEach(build); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
