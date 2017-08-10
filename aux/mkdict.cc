// Builds the files dict8.js, dict9.js, ..., dict15.js. Outputs bad
// words to the file badwords.txt.

#include <cassert>
#include <cstddef>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <map>
#include <set>
#include <shg/unicode.h>

using std::size_t;
using std::string;
using std::u32string;

// We use u32string to get length of a string as the number of
// characters, not UTF-8 bytes.

// UTF8 string --> u32string of Unicode characters
u32string to32(const string& s) {
     auto v = SHG::utf8_decode(s);
     return u32string(reinterpret_cast<char32_t*>(v.data()),
                      v.size());
}

// u32string of Unicode characters --> UTF8 string
string toutf8(const u32string& u) {
     string s;
     for (u32string::size_type i = 0; i < u.size(); i++)
          s += SHG::utf8_encode(u[i]);
     return s;
}

// Sorting the set of words: by length first, then by character codes.
struct Less {
     bool operator()(const u32string& lhs,
                     const u32string& rhs) const {
          if (lhs.size() < rhs.size())
               return true;
          if (lhs.size() > rhs.size())
               return false;
          for (u32string::size_type i = 0; i < lhs.size(); i++)
               if (lhs[i] < rhs[i])
                    return true;
               else if (lhs[i] > rhs[i])
                    return false;
          return false;
     }
};

// 32 characters allowed in Scrabble.
const std::set<char32_t> allowed_chars {
     // a-z without q, v, x
     0x0061, 0x0062, 0x0063, 0x0064, 0x0065, 0x0066, 0x0067, 0x0068,
     0x0069, 0x006a, 0x006b, 0x006c, 0x006d, 0x006e, 0x006f, 0x0070,
     0x0072, 0x0073, 0x0074, 0x0075, 0x0077, 0x0079, 0x007a,
     // a with ogonek - z with dot above
     0x0105, 0x0107, 0x0119, 0x0142, 0x0144, 0x00f3, 0x015b, 0x017a,
     0x017c
};

std::set<u32string, Less> dict;

// Output words of length from min to max characters to one js file.
void output_js(size_t min, size_t max) {
     size_t nelems = 0, k = 0;
     std::set<u32string, Less>::const_iterator it;
     for (it = dict.cbegin(); it != dict.cend(); ++it)
          if ((*it).size() >= min && (*it).size() <= max)
               nelems++;
     const string s = std::to_string(max);
     std::ofstream f("dict" + s + ".js");
     f << "SKRABULEC.dict.dict" << s << " = {\n";
     for (it = dict.cbegin(); it != dict.cend(); ++it)
          if ((*it).size() >= min && (*it).size() <= max) {
               f << "\"" << toutf8(*it) << "\":1";
               if (++k < nelems)
                    f << ',';
          }
     f << "\n};\n";
}

void make_js() {
     string s;
     u32string u;
     u32string::size_type i;
     std::ofstream g("badwords.txt");
     std::ifstream f("slowa.txt");
     assert(f);
     while (f >> s) {
          u = to32(s);
          for (i = 0; i < u.size(); i++)
               if (allowed_chars.find(u[i]) == allowed_chars.end())
                    break;
          if (i < u.size())
               g << s << '\n';
          else
               assert(dict.insert(u).second);
     }
     f.close();
     g.close();
     output_js(1, 8);
     output_js(9, 9);
     output_js(10, 10);
     output_js(11, 11);
     output_js(12, 12);
     output_js(13, 13);
     output_js(14, 14);
     output_js(15, 15);
}

int main() {
     make_js();
}
