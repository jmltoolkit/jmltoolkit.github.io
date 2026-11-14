/* Prism grammar for JML (Java Modeling Language).
 *
 * JML is Java plus specification-only text inside `/*@ ... @*\/`,
 * `//@ ...` and `//+tool@ ...` comments, so the grammar extends Prism's
 * Java grammar and adds the annotation delimiters, clause keywords,
 * behavioral keywords, declaration modifiers and backslash commands.
 */
(function () {
  if (typeof Prism === 'undefined' || !Prism.languages.java) {
    return;
  }

  var java = Prism.languages.java;

  var behavior = /\b(?:behavior|normal_behavior|exceptional_behavior|abrupt_behavior|break_behavior|continue_behavior|return_behavior|feasible_behavior|model_behavior|also)\b/;

  var clause = /\b(?:requires|requires_free|requires_redundantly|ensures|ensures_free|ensures_redundantly|pre|pre_redundantly|post|post_redundantly|old|forall|assignable|assignable_redundantly|modifiable|modifiable_redundantly|modifies|modifies_redundantly|accessible|accessible_redundantly|captures|captures_redundantly|working_space|working_space_redundantly|duration|duration_redundantly|signals|signals_only|signals_redundantly|when|callable|callable_redundantly|diverges|diverges_redundantly|loop_invariant|loop_invariant_free|loop_invariant_redundantly|maintaining|maintaining_redundantly|decreases|decreases_redundantly|decreasing|measured_by|returns|returns_redundantly|breaks|breaks_redundantly|continues|continues_redundantly|determines|loop_determines|separates|loop_separates)\b/;

  var declaration = /\b(?:invariant|constraint|initially|axiom|represents|model|ghost|pure|helper|nullable|non_null|spec_public|spec_protected|code|monitored|uninitialized|readonly|static_initializer|two_state|no_state|function|lemma|merge_point|refining|assert|assume|set|unreachable|reachable|debug|nowarn|public|private|protected|package)\b/;

  var command = /\\[a-zA-Z_]\w*/;

  var inside = {
    'jml-delimiter': {
      pattern: /(?:\/\*[-+]?[\w+,-]*@|\/\/[-+]?[\w+,-]*@|@\*\/|\*\/|(?:^|\n)[ \t]*@(?=[ \t]))/,
      alias: 'comment'
    },
    'string': java.string,
    'char': java.char,
    'jml-command': command,
    'jml-behavior': behavior,
    'jml-clause': clause,
    'jml-declaration': declaration,
    'number': java.number,
    'boolean': java.boolean,
    'operator': java.operator,
    'punctuation': java.punctuation,
    'class-name': java['class-name']
  };

  Prism.languages.jml = Prism.languages.extend('java', {});

  Prism.languages.insertBefore('jml', 'comment', {
    'jml-annotation': {
      pattern: /\/\*[-+]?[\w+,-]*@[\s\S]*?\*\//,
      greedy: true,
      inside: inside
    },
    'jml-line': {
      pattern: /\/\/[-+]?[\w+,-]*@[^\n]*/,
      greedy: true,
      inside: inside
    }
  });
})();
