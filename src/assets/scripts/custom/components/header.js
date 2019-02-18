import $ from "jquery";

const el = {
  offset: "[data-header-offset]",
  header: "[data-section-id='header']",
  link: "[data-primary-nav-link]",
  sublist: "[data-primary-nav-sublist]",
  authSwitch: "[data-collection-authorization-switch]",
  announcement: "[data-announcement-bar-xl]",
  closeAnnouncement: "[data-announcement-close]",
  banner: "[data-primary-banner]",
};

function headerOffset() {
  const $offset = $(el.offset);
  const headerHeight = $(el.header).outerHeight();
  const currentHeight = $(el.offset).outerHeight();
  if (headerHeight !== currentHeight) {
    $offset.css("min-height", headerHeight);
  }
}

function listIn(event) {
  const $this = $(event.currentTarget);
  $this.siblings(el.link).addClass("active");
}

function listOut(event) {
  const $this = $(event.currentTarget);
  $this.siblings(el.link).removeClass("active");
}

function isHeaderScrolled(scroll) {
  if (scroll > 5) {
    $(el.header).addClass("scrolled");
  } else {
    $(el.header).removeClass("scrolled");
  }
}

function isCollFilterScrolled(scroll, authPos) {
  if (scroll > authPos - $(el.header).outerHeight()) {
    $(el.authSwitch)
      .css("top", $(el.header).outerHeight())
      .addClass("scrolled");
    $(el.header).addClass("no-box");
  } else {
    $(el.authSwitch).removeClass("scrolled");
    $(el.header).removeClass("no-box");
  }
}

function checkAnnouncementStatus() {
  const status = localStorage.getItem("announcement-hide");
  if ($(el.announcement).length > 0 && $(el.banner).length > 0) {
    $(el.banner).addClass("big-padding");
  }
  if (status === "true") {
    closeAnnouncement();
    $(el.banner).removeClass("big-padding");
  }
}

function closeAnnouncement() {
  $(el.announcement).slideToggle();
  const status = localStorage.getItem("announcement-hide");
  if ($(el.banner).length > 0) {
    $(el.banner).removeClass("big-padding");
  }
  if (status !== "true") {
    localStorage.setItem("announcement-hide", true);
  }
}

function init() {
  headerOffset();
  checkAnnouncementStatus();
  let authPos = 0;
  if ($(el.authSwitch).length > 0) {
    authPos = $(el.authSwitch).offset().top;
  }

  let lastKnownScrollPos = 0;
  let ticking = false;
  lastKnownScrollPos = window.scrollY;
  isHeaderScrolled(lastKnownScrollPos);

  window.addEventListener("scroll", () => {
    lastKnownScrollPos = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        isHeaderScrolled(lastKnownScrollPos);
        if ($(el.authSwitch).length > 0) {
          isCollFilterScrolled(lastKnownScrollPos, authPos);
        }
        ticking = false;
      });

      ticking = true;
    }
  });
}

$(document).ready(init);
$(el.sublist).hover(listIn, listOut);
$(window).on("resize", headerOffset);
$(document).on("click", el.closeAnnouncement, closeAnnouncement);
