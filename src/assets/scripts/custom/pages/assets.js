import $ from "jquery";

const el = {
  search: "[data-assets-quick-search]",
  item: "[data-asset-item]",
  title: "[data-asset-item-title]",
};

function quickSearch() {
  setTimeout(() => {
    const value = $(el.search).val();
    if (value.length > 0) {
      $(el.title).each(function() {
        const $this = $(this);
        if ($this.text().includes(value)) {
          $this.closest(el.item).slideDown("fast");
        } else {
          $this.closest(el.item).slideUp("fast");
        }
      });
    } else {
      $(el.item).slideDown("fast");
    }
  }, 200);
}

$(document).on("change, keydown", el.search, quickSearch);
