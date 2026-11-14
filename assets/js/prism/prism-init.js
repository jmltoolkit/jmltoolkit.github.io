/* Highlight every fenced code block once the DOM is available.
 * The code block render hook emits `language-<lang>` classes and no
 * server-side highlighting; languages without a Prism grammar (e.g. `text`)
 * are emitted without a class and stay plain. */
(function () {
  if (typeof Prism === 'undefined') {
    return;
  }
  Prism.highlightAll();
})();
