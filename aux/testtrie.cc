#include <cassert>
#ifdef MCHECK
extern "C" {
#include <mcheck.h>
}
#endif
#include "trie.h"

#define NELEMS(a) (sizeof(a) / sizeof((a)[0]))


/*
 * Example from Donald E. Knuth, Sztuka programowania. Tom 3.
 * Sortowanie i wyszukiwanie, WNT, Warszawa 2002, section 6.3, page
 * 529, table 1.
 */
const char* tab[] = {
     "a", "and", "are", "as", "at", "be", "but", "by", "for", "from",
     "had", "have", "he", "her", "his", "i", "in", "is", "it", "not",
     "of", "on", "or", "that", "the", "this", "to", "was", "which", "with",
     "you"
};

const std::size_t n = NELEMS(tab);

void test_trie() {
     Trie<char> t;
     for (std::size_t i = 0; i < n; i++) {
          assert(t.nleaves() == i);
          assert(t.insert_key(tab[i]));
          assert(t.nleaves() == i + 1);
     }
     t.print_keys();
     assert(!t.insert_key("and"));
     for (size_t i = 0; i < n; i++)
          assert(t.search_key(tab[i]));
     for (size_t i = 0; i < n; i++)
          assert(t.delete_key(tab[i]));
     for (size_t i = 0; i < n; i++)
          assert(!t.search_key(tab[i]));
     for (std::size_t i = 0; i < n; i++)
          assert(t.insert_key(tab[i]));
     assert(!t.search_key(""));
     assert(t.insert_key(""));
     assert(t.search_key(""));
     assert(t.delete_key(""));
     assert(!t.delete_key(""));
     assert(!t.search_key(""));
     assert(!t.search_key("aa"));
     assert(t.insert_key("aa"));
     assert(t.search_key("aa"));
     assert(t.delete_key("aa"));
     assert(!t.search_key("aa"));
     assert(!t.delete_key("aa"));
     assert(t.nleaves() == n);
}

int main() {
#ifdef MCHECK
     mtrace();
#endif
     test_trie();
}
