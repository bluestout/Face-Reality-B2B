/*
  This page shares a large portion of the script with the collection page - look for collection-page.js
 */

import $ from "jquery";

const el = {
  search: "[data-assets-quick-search]",
  item: "[data-product-column]",
  title: "[data-asset-item-title]",
  download: "[data-download-asset]",
};

// show/hide items based on search input.
function quickSearch() {
  setTimeout(() => {
    const value = $(el.search)
      .val()
      .toLowerCase();
    if (value.length > 0) {
      $(el.title).each(function() {
        const $this = $(this);
        if (
          $this
            .text()
            .toLowerCase()
            .includes(value)
        ) {
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

// initialize download of a pdf or image file
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

// unused function to get all asset files via json
/* function getAssets() {
  $.ajax({
    type: "GET",
    url: "/pages/downloads/?view=assets.json",
    async: false,
    dataType: "html",
    success: (json) => {
      const assets = JSON.parse(json);
    },
    cache: false,
  });
} */

function downloadInit(event) {
  event.preventDefault ? event.preventDefault() : (event.returnValue = false);
  forceDownload($(event.currentTarget));
}

// limit running/loading this script on the assets page
if (document.getElementById("downloads")) {
  $(document).on("change, keydown", el.search, quickSearch);
  $(document).on("click", el.download, downloadInit);
}
