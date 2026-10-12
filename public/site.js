(function () {
  document.body.classList.add("menu-ready");

  function enableDesktopCss() {
    if (window.innerWidth < 600) return;
    document
      .querySelectorAll('link[media="screen and (min-width:37.5em)"]')
      .forEach(function (link) {
        link.removeAttribute("disabled");
      });
  }

  enableDesktopCss();
  window.addEventListener("resize", enableDesktopCss);

  var menu = document.getElementById("menu");
  var toggle = document.getElementById("menu-submit");

  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle("open", open);
    menu.classList.toggle("visible", open);
    document.body.classList.toggle("menu-open", open);
    if (toggle) toggle.classList.toggle("active", open);
  }

  if (toggle) {
    toggle.addEventListener("click", function (event) {
      event.preventDefault();
      setMenu(!menu.classList.contains("open"));
    });
  }

  var closeBtn = document.querySelector(".menu-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", function (event) {
      event.preventDefault();
      setMenu(false);
    });
  }

  if (menu) {
    menu.querySelectorAll("a.menu-item").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });
  }

  document.querySelectorAll(".b-gal-slideshow").forEach(function (root) {
    var list = root.querySelector(".b-gal-list");
    var originals = Array.prototype.slice.call(root.querySelectorAll(".b-gal-item.original"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".dots li"));
    if (!list || !originals.length) return;
    var index = 0;

    function render(animate) {
      list.classList.toggle("transition", animate);
      list.style.setProperty("--slideshow-position", String(index + 1));
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    var next = root.querySelector(".arrow-next");
    var prev = root.querySelector(".arrow-prev");
    if (next) {
      next.addEventListener("click", function () {
        index = (index + 1) % originals.length;
        render(true);
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        index = (index - 1 + originals.length) % originals.length;
        render(true);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        index = i;
        render(true);
      });
    });
    render(false);
  });

  var box = document.createElement("div");
  box.id = "litebox";
  box.hidden = true;
  box.innerHTML =
    '<button type="button" class="litebox-close" aria-label="Zavřít">×</button>' +
    '<button type="button" class="litebox-prev" aria-label="Předchozí">‹</button>' +
    '<img alt="">' +
    '<button type="button" class="litebox-next" aria-label="Další">›</button>';
  document.body.appendChild(box);

  var img = box.querySelector("img");
  var group = [];
  var cursor = 0;

  function show(i) {
    if (!group.length) return;
    cursor = (i + group.length) % group.length;
    img.src = group[cursor].getAttribute("href");
    img.alt = group[cursor].querySelector("img") ? group[cursor].querySelector("img").alt : "";
  }

  function closeBox() {
    box.hidden = true;
    img.removeAttribute("src");
    document.body.classList.remove("litebox-open");
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest("a.litebox");
    if (!link) return;
    event.preventDefault();
    var root = link.closest(".gal-app") || document;
    group = Array.prototype.slice.call(root.querySelectorAll(".b-gal-item.original a.litebox, a.litebox"));
    group = group.filter(function (node, index, all) {
      return all.indexOf(node) === index && !node.closest(".b-gal-item.clone");
    });
    cursor = Math.max(0, group.indexOf(link));
    show(cursor);
    box.hidden = false;
    document.body.classList.add("litebox-open");
  });

  box.querySelector(".litebox-close").addEventListener("click", closeBox);
  box.querySelector(".litebox-next").addEventListener("click", function () {
    show(cursor + 1);
  });
  box.querySelector(".litebox-prev").addEventListener("click", function () {
    show(cursor - 1);
  });
  box.addEventListener("click", function (event) {
    if (event.target === box) closeBox();
  });
  document.addEventListener("keydown", function (event) {
    if (box.hidden) return;
    if (event.key === "Escape") closeBox();
    if (event.key === "ArrowRight") show(cursor + 1);
    if (event.key === "ArrowLeft") show(cursor - 1);
  });

  function hexChannel(value) {
    return ("0" + parseInt(value, 10).toString(16)).slice(-2);
  }

  function hexFromColor(color) {
    var match = String(color).replace(/\s/g, "").match(/^rgba?\((\d+),(\d+),(\d+)/i);
    if (!match) return "";
    var hex = hexChannel(match[1]) + hexChannel(match[2]) + hexChannel(match[3]);
    if (hex.charAt(0) === "0") {
      var bumped = Math.max(16, parseInt(hex.slice(0, 2), 16));
      hex = bumped.toString(16) + hex.slice(2);
    }
    return hex;
  }

  function paintLogo(node) {
    var base = node.getAttribute("data-src");
    if (!base) return;
    var style = getComputedStyle(node);
    var parts = [];
    [
      ["border", "borderTopColor"],
      ["outline", "outlineColor"],
      ["color", "color"],
    ].forEach(function (pair) {
      var hex = hexFromColor(style[pair[1]]);
      if (hex) parts.push(pair[0] + "=" + hex);
    });
    if (!parts.length) return;
    var next = base + (base.indexOf("?") >= 0 ? "&" : "?") + parts.join("&");
    if (node.getAttribute("src") !== next) node.setAttribute("src", next);
  }

  function paintIcons() {
    document.querySelectorAll("embed[data-src]").forEach(paintLogo);
  }

  paintIcons();
  window.addEventListener("resize", paintIcons);
})();
