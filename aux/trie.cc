#undef MCHECK
#include <cassert>
#include <fstream>
#include <iomanip>
#include <map>
#include <utility>
#include <shg/unicode.h>
#ifdef MCHECK
extern "C" {
#include <mcheck.h>
}
#endif
#include "trie.h"

class Translate {
public:
     Translate();
     char u2char(std::uint32_t x) const {return map_u2char.at(x);}
     std::string char2utf8(char c) const {
          return c >= '1' && c <= '9' ?
               map_char2utf8.at(c) : std::string(1, c);
     }
private:
     std::map<std::uint32_t, char> map_u2char;
     std::map<char, std::string> map_char2utf8;
};

Translate::Translate() : map_u2char(), map_char2utf8() {
     map_u2char[0x0105] = '1';
     map_u2char[0x0107] = '2';
     map_u2char[0x0119] = '3';
     map_u2char[0x0142] = '4';
     map_u2char[0x0144] = '5';
     map_u2char[0x00f3] = '6';
     map_u2char[0x015b] = '7';
     map_u2char[0x017a] = '8';
     map_u2char[0x017c] = '9';
     map_char2utf8['1'] = SHG::utf8_encode(0x0105); 
     map_char2utf8['2'] = SHG::utf8_encode(0x0107); 
     map_char2utf8['3'] = SHG::utf8_encode(0x0119); 
     map_char2utf8['4'] = SHG::utf8_encode(0x0142); 
     map_char2utf8['5'] = SHG::utf8_encode(0x0144); 
     map_char2utf8['6'] = SHG::utf8_encode(0x00f3); 
     map_char2utf8['7'] = SHG::utf8_encode(0x015b); 
     map_char2utf8['8'] = SHG::utf8_encode(0x017a); 
     map_char2utf8['9'] = SHG::utf8_encode(0x017c); 
}

Translate tr;

template <class T>
class Trie_tool : public Trie<T> {
public:
     Trie_tool();
     Trie_tool(const Trie_tool&) = delete;
     Trie_tool& operator=(const Trie_tool&) = delete;
     void print_jsarray(std::ostream& f = std::cout);
protected:
     using typename Trie<T>::Node;
     using typename Trie<T>::ittp;
     using Trie<T>::root;
     void number_nodes(Node* node);
     void output_nodes(Node* node);
     static std::size_t number_of_children(const Node* node);
     std::map<Node*, std::size_t> data;
     std::size_t nr;
     std::size_t maxnr;
     std::ostream* outfile;
};

template <class T>
Trie_tool<T>::Trie_tool() : data(), nr(), maxnr(), outfile() {}

template <class T>
void Trie_tool<T>::print_jsarray(std::ostream& f) {
     data.clear();
     nr = 0;
     outfile = &f;
     number_nodes(root);
     assert(data.size() > 0);
     maxnr = data.size() - 1;
     *outfile << "/*jslint browser : true, devel : true, maxlen : 70,"
              << " plusplus : true,\n eqeq : true, white : true */\n"
              << "/*global SKRABULEC */\n\n"
              << "SKRABULEC.dict1 = (function() {\n"
              << "     \"use strict\";\n\n"
              << "     // " << data.size() << " elements\n"
              << "     var dict = [\n";
     *outfile << std::boolalpha;
     output_nodes(root);
     *outfile << "     ];\n";
     *outfile << R"ALEF(
     function exists(word) {
          var n = 0, i, c;
          for (i = 0; i < word.length; i++) {
               c = dict[n].children;
               if (!c) {
                    return false;
               }
               n = c[word.charAt(i)];
               if (!n) {
                    return false;
               }
          }
          return dict[n].leaf;
     }

     return {
          exists: exists
     };
}());
)ALEF";
}

template <class T>
void Trie_tool<T>::number_nodes(Node* node) {
     auto z = data.insert(std::make_pair(node, data.size()));
     assert(z.second);
     for (ittp it = node->children.begin(); it != node->children.end(); ++it)
          number_nodes(*it);
}

template <class T>
void Trie_tool<T>::output_nodes(Node* node) {
     *outfile << "          {\n"
              << "               // Node number " << nr << " ("
              << (nr == 0 ? "root" : tr.char2utf8(node->chr))
              << ")\n"
              << "               leaf: " << node->is_leaf;
     std::size_t n = number_of_children(node);
     if (n-- > 0) {
          *outfile << ",\n               children: {\n";
          std::size_t k = 0;
          ittp it = node->children.begin();
          for (; it != node->children.end(); ++it, ++k) {
               auto p = data.find(*it);
               assert(p != data.cend());
               *outfile << "                    '"
                        << tr.char2utf8((*it)->chr) << "': " << p->second
                        << (k < n ? ",\n" : "\n");
          }
          *outfile << "               }\n";
     }
     else
          *outfile << '\n';
     *outfile << "          }" << (nr < maxnr ? ",\n" : "\n");
     nr++;
     for (ittp it = node->children.begin();
          it != node->children.end();
          ++it)
          output_nodes(*it);
}

template <class T>
std::size_t Trie_tool<T>::number_of_children(const Node* node) {
     std::size_t n = 0;
     for (auto it = node->children.cbegin();
          it != node->children.cend();
          ++it)
          n++;
     return n;
}

void make_js_test() {
     std::ifstream f("example.txt");
     assert(f);
     Trie_tool<char> t;
     std::string s;
     while (f >> s)
          t.insert_key(s);
     f.close();
     std::ofstream g("dict1.js");
     t.print_jsarray(g);
}

std::ofstream err("errors.txt");

std::string prepare(const std::string& s) {
     std::string t;
     std::vector<std::uint32_t> v = SHG::utf8_decode(s);
     for (std::size_t i = 0; i < v.size(); i++) {
          const std::uint32_t& c = v[i];
          if (c < 0x0061)
               goto error;
          if (c == 0x0071 || c == 0x0076 || c == 0x0078)
               goto error;
          if (c > 0x007a)
               t += tr.u2char(c);
          else
               t += c;
     }
     return t;
error:
     err << s << '\n';
     return "";
}

void make_js() {
     std::ifstream f("../nobackup/slowa.txt");
     assert(f);
     Trie_tool<char> t;
     std::size_t n = 0;     
     std::string s;
     while (f >> s) {
          s = prepare(s);
          t.insert_key(s);
          n++;
          if (n % 100000 == 0)
               std::cout << "n = " << n << '\n' << std::flush;
     }
     f.close();
     std::ofstream g("dict2.js");  
     t.print_jsarray(g);
}

int main() {
#ifdef MCHECK
     mtrace();
#endif
     // make_js_test();
     make_js();
}
