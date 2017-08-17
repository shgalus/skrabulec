var SKRABULEC = {};
SKRABULEC.conf = {};
SKRABULEC.dict = {};

SKRABULEC.utils = (function() {
  "use strict";

  var assert, makeArray, reverseSubarray, nextPermutation,
      comblexPrototype = {},
      makeComblex;

  assert = function(condition, message) {
    if (!condition)
      throw new Error(message || "Assertion failed");
  };

  makeArray = function(n, v) {
    var a = [], i;
    for (i = 0; i < n; i++)
      a.push(v);
    return a;
  };

  // Reverses the order of the elements in the range [first, last).
  // Implementation follows that of std::reverse from C++ library
  // (gcc-5.4.0, stl_algo.h).
  reverseSubarray = function(a, first, last) {
    var t;
    for (;;) {
      if (first === last || first === --last)
        return;
      else {
        t = a[first];
        a[first] = a[last];
        a[last] = t;
        ++first;
      }
    }
  };

  // Transforms the array a into the next permutation from the set of
  // all permutations lexicographically ordered by <. Returns true if
  // such permutation exists, otherwise transforms a into the first
  // permutation (ie. sorted array) and returns false. Implementation
  // follows that of std::next_permutation from C++ library
  // (gcc-5.4.0, stl_algo.h).
  nextPermutation = function(a) {
    var first = 0, last = a.length, i, ii, j, t;
    if (first === last)
      return false;
    i = first;
    ++i;
    if (i === last)
      return false;
    i = last;
    for (;;) {
      ii = i;
      --i;
      if (a[i] < a[ii]) {
        j = last;
        while (a[i] >= a[--j]) ;
        t = a[i]; a[i] = a[j]; a[j] = t;
        reverseSubarray(a, ii, last);
        return true;
      }
      if (i === first) {
	reverseSubarray(a, first, last);
        return false;
      }
    }
  };

  // Advances to the next combination. Returns true if the next
  // combination has been generated, false if there is no next
  // combination.
  comblexPrototype.next = function() {
    var i;
    if (this.j < 0)
      return false;
    this.a[this.j]++;
    for (i = this.j + 1; i < this.k; i++)
      this.a[i] = this.a[i - 1] + 1;
    if (this.a[this.k1] < this.n1)
      this.j = this.k1;
    else
      this.j--;
    return true;
  };

  // Generates all k-combinations of an n-set in lexicographic oreder.
  // There must be 0 < k <= n. The number of combinations is \f[{n
  // \choose k} = \frac{n!}{k!(n - k)!}.\f] Copied from my C++
  // library.
  //
  // Initializes generator for the n-element set and k-element
  // combinations.
  makeComblex = function(n, k) {
    var comblex = Object.create(comblexPrototype), i;
    assert(k > 0 && k <= n);
    comblex.k = k;
    comblex.k1 = k - 1;
    comblex.n1 = n - 1;
    comblex.j = k < n ? k - 1 : -1;
    comblex.a = [];
    for (i = 0; i < k; i++)
      comblex.a.push(i);
    return comblex;
  };

  return {
    assert: assert,
    makeArray: makeArray,
    nextPermutation: nextPermutation,
    makeComblex: makeComblex
  };
}());
