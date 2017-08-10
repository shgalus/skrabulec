#ifndef TRIE_H
#define TRIE_H

#include <cstddef>
#include <forward_list>
#include <iostream>
#include <string>

/*
 * Trie tree. See Donald E. Knuth, Sztuka programowania. Tom 3.
 * Sortowanie i wyszukiwanie, WNT, Warszawa 2002, section 6.3, pages
 * 528-532.
 */
template <class T> class Trie {
public:
     Trie();
     Trie(const Trie&) = delete;
     Trie& operator=(const Trie&) = delete;
     virtual ~Trie();
     bool insert_key(const std::basic_string<T>& key);
     bool search_key(const std::basic_string<T>& key) const;
     bool delete_key(const std::basic_string<T>& key);
     void print_keys(std::ostream& f = std::cout) const;
     std::size_t nleaves() const;
protected:
     struct Node {
          Node();
          Node(T chr);
          T chr;
          bool is_leaf;
          std::forward_list<Node*> children;
     };
     typedef typename std::basic_string<T>::size_type sztp;
     typedef typename std::forward_list<Node*>::iterator ittp;
     bool delete_key(const std::basic_string<T>& key,
                     sztp p,
                     Node* t);
     void print_keys(Node* t,
                     const std::basic_string<T>& s,
                     std::ostream& f) const;
     std::size_t nleaves(Node* t) const;
     void delete_node(Node* t);
     Node* root;
};

template <class T>
Trie<T>::Trie() : root(new Node()) {}

template <class T>
Trie<T>::~Trie() {
     delete_node(root);
     delete root;
}

template <class T>
bool Trie<T>::insert_key(const std::basic_string<T>& key) {
     Node* node = root;
     ittp it;
     sztp k = 0;
     while (k < key.size()) {
          for (it = node->children.begin(); it != node->children.end(); ++it)
               if ((*it)->chr == key[k])
                    break;
          if (it == node->children.end())
               break;
          node = *it;
          k++;
     }
     while (k < key.size()) {
          node->children.push_front(new Node(key[k]));
          node = node->children.front();
          k++;
     }
     if (node->is_leaf)
          return false;
     return node->is_leaf = true;
}

template <class T>
bool Trie<T>::search_key(const std::basic_string<T>& key) const {
     sztp k = 0;
     Node* t = root;
     ittp it;
     while (k < key.size()) {
          for (it = t->children.begin(); it != t->children.end(); ++it)
               if ((*it)->chr == key[k])
                    break;
          if (it == t->children.end())
               return false;
          t = *it;
          k++;
     }
     return t->is_leaf;
}

template <class T>
bool Trie<T>::delete_key(const std::basic_string<T>& key) {
     return delete_key(key, 0, root);
}

template <class T>
void Trie<T>::print_keys(std::ostream& f) const {
     print_keys(root, std::basic_string<T>(), f);
}

template <class T>
std::size_t Trie<T>::nleaves() const {
     return nleaves(root);
}

template <class T>
Trie<T>::Node::Node() : Node(T()) {}

template <class T>
Trie<T>::Node::Node(T chr) : chr(chr), is_leaf(), children() {}

template <class T>
bool Trie<T>::delete_key(const std::basic_string<T>& key,
                         sztp p,
                         Node* t) {
     if (p < key.size()) {
          ittp it = t->children.begin(),
               prev = t->children.before_begin();
          for (; it != t->children.end(); ++it, ++prev)
               if ((*it)->chr == key[p])
                    break;
          if (it == t->children.end())
               return false;
          if (delete_key(key, p + 1, *it)) {
               if (!((*it)->is_leaf) && (*it)->children.empty()) {
                    delete *it;
                    t->children.erase_after(prev);
               }
               return true;
          } else
               return false;
     } else
          if (t->is_leaf) {
               t->is_leaf = false;
               return true;
          } else
               return false;
}

template <class T>
void Trie<T>::print_keys(Node* t,
                         const std::basic_string<T>& s,
                         std::ostream& f) const {
     if (t->is_leaf)
          f << s << '\n';
     for (ittp it = t->children.begin(); it != t->children.end(); ++it)
          print_keys(*it, s + (*it)->chr, f);
}

template <class T>
std::size_t Trie<T>::nleaves(Node* t) const {
     std::size_t n = 0;
     for (ittp it = t->children.begin(); it != t->children.end(); ++it)
          n += nleaves(*it);
     if (t->is_leaf)
          n++;
     return n;
}

template <class T>
void Trie<T>::delete_node(Node* t) {
     typename std::forward_list<Node*>::iterator it;
     for (it = t->children.begin(); it != t->children.end(); ++it) {
          delete_node(*it);
          delete *it;
     }
}

#endif
