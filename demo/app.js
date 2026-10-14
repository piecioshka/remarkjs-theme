// Call it before remark.create(), so the first paint already has the theme.
window.theme = remarkTheme();

window.slideshow = remark.create({
  ratio: "16:9",
  countIncrementalSlides: false,
  highlightStyle: "github",
});
