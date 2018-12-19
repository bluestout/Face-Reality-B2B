import $ from "jquery";

const el = {
  container: "[data-sticky-container]",
  sidebar: "[data-sticky-sidebar]",
};

let lastKnownScrollPos = 0;
let ticking = false;

window.addEventListener("scroll", () => {
  lastKnownScrollPos = window.scrollY;

  if (!ticking) {
    window.requestAnimationFrame(() => {
      stickySidebar(lastKnownScrollPos);
      ticking = false;
    });

    ticking = true;
  }
});

function stickySidebar(lastPosition, padding = 30) {
  $(el.sidebar).each(function() {
    const $this = $(this);
    const $container = $this.closest(el.container);
    const containerOffset = $container.offset().top;
    const containerHeight = $container.height();
    const maxH = containerHeight - containerOffset - padding;

    if (containerOffset < lastPosition) {
      if (lastPosition > maxH) {
        $this.css("bottom", 0);
      } else {
        $this.css("bottom", maxH - lastPosition);
      }
    } else {
      $this.css("bottom", containerHeight - $this.height());
    }
  });
}

function prepSticky() {
  $(el.sidebar).each(function() {
    const $this = $(this);
    $this.css({ height: $this.height(), position: "absolute" });
  });
}

$(document).ready(prepSticky);
