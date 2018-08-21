export function assert(condition, message) {
  "use strict";
  if (!condition)
    throw new Error(message || "Assertion failed");
}

export function makeArray(n, v) {
  "use strict";
  var a = [], i;
  for (i = 0; i < n; i++)
    a.push(v);
  return a;
}
// Reverses the order of the elements in the range [first, last).
// Implementation follows that of std::reverse from C++ library
// (gcc-5.4.0, stl_algo.h).
function reverseSubarray(a, first, last) {
  "use strict";
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
}

// Transforms the array a into the next permutation from the set of
// all permutations lexicographically ordered by <. Returns true if
// such permutation exists, otherwise transforms a into the first
// permutation (ie. sorted array) and returns false. Implementation
// follows that of std::next_permutation from C++ library
// (gcc-5.4.0, stl_algo.h).
export function nextPermutation(a) {
  "use strict";
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
}

// Generates all k-combinations of an n-set in lexicographic oreder.
// There must be 0 < k <= n. The number of combinations is \f[{n
// \choose k} = \frac{n!}{k!(n - k)!}.\f] Copied from my C++ library.
export class Comblex {
  // Initializes generator for the n-element set and k-element
  // combinations.
  constructor(n, k) {
    var i;
    assert(k > 0 && k <= n);
    this.k = k;
    this.k1 = k - 1;
    this.n1 = n - 1;
    this.j = k < n ? k - 1 : -1;
    this.a = [];
    for (i = 0; i < k; i++)
      this.a.push(i);
  }
  // Advances to the next combination. Returns true if the next
  // combination has been generated, false if there is no next
  // combination.
  next() {
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
  }
}
