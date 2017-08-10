#!/usr/bin/ruby2.1 -w
# coding: us-ascii

#
# Builds JavaSript dictionaries dict8.js, ..., dict15.js from
# slowa.txt.
#

$lines = File.open('slowa.txt', 'r:utf-8').readlines.map! {|w|
  w.chomp
}
$lines.delete_if {|w|
  w.include? 'q' or w.include? 'v' or w.include? 'x'
}
$lines.uniq!
$lines.sort! {|a, b|
  a.length < b.length ? -1 : (a.length > b.length ? 1 : a <=> b)
}
def out(min, max)
  n = $lines.count {|w| w.length >= min && w.length <= max}
  File.open("dict#{max}.js", 'w:utf-8') do |dict|
    dict.puts "SKRABULEC.dict.dict#{max} = {"
    k = 0
    $lines.each {|w|
      next unless w.length >= min && w.length <= max
      dict.print "\"#{w}\":1"
      dict.print ',' if (k += 1) < n
    }
    dict.puts "\n};\n"
  end
end
out(1, 8)
out(9, 9)
out(10, 10)
out(11, 11)
out(12, 12)
out(13, 13)
out(14, 14)
out(15, 15)
