import $ from "jquery";

const el = {
  search: "[data-assets-quick-search]",
  item: "[data-asset-item]",
  title: "[data-asset-item-title]",
  downlaod: "[data-download-asset]",
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

function forceDownload(link) {
  const url = link.attr("href");
  const fileName = link.attr("download");
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "blob";
  xhr.onload = function() {
    const urlCreator = window.URL || window.webkitURL;
    const imageUrl = urlCreator.createObjectURL(this.response);
    const tag = document.createElement("a");
    tag.href = imageUrl;
    tag.download = fileName;
    document.body.appendChild(tag);
    tag.click();
    document.body.removeChild(tag);
  };
  xhr.send();
}

function downloadInit(event) {
  event.preventDefault();
  forceDownload($(event.currentTarget));
}

$(document).on("change, keydown", el.search, quickSearch);

$(document).on("click", el.downlaod, downloadInit);
