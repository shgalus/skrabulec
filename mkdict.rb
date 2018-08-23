# coding: us-ascii

#
# Builds JavaSript dawg dictionary.
#

require './build/dawg/dawg'

def to_js(dawg)
  # Prepare tab and hash to renumber nodes.
  t = []
  h = {}
  dawg.minimized_nodes.each {|key, node|
    t.push({:id => node.id, :key => key})
  }
  t.sort! {|a, b| a[:id] <=> b[:id]}
  k = 0
  t.each {|id|
    h[id[:id]] = k
    k += 1
  }
  print "var SKRABULEC=SKRABULEC || {};" \
        "SKRABULEC.dict=SKRABULEC.dict || {};" \
        "SKRABULEC.dict.#{$dictname}=["
  ts = t.size
  i = 0
  t.each {|d|
    node = dawg.minimized_nodes[d[:key]]
    es = node.edges.size
    abort 'Error' unless node.final || es > 0
    print '{'
    if node.final
      print '0:1'
      print ',' if es > 0
    end
    k = 0
    node.edges.each {|letter, n|
      print letter + ':' + h[n.id].to_s
      print ',' if (k += 1) < es
    }
    print '}'
    print ',' if (i += 1) < ts
  }
  puts '];'
end

$dictname = ""
$stdin.set_encoding('utf-8')
$lines = $stdin.readlines.map! {|w| w.chomp}
if $lines.index {|w| w =~ /SOWPODS/}
    $dictname = 'en'
elsif $lines.index {|w| w =~ /TWL06/}
  $dictname = 'us'
elsif $lines.index {|w| w =~ /chleb/}
  $dictname = 'pl'
else
  abort 'Error'
end
$lines.delete_if {|w| w == '' or w.include? ' '}
if $dictname == 'pl'
  $lines.delete_if {|w|
    w.include? 'q' or w.include? 'v' or w.include? 'x'
  }
end
$lines.uniq!
$lines.sort!

dawg = Dawg.new
$lines.each {|w| dawg.insert w}
dawg.finish

to_js(dawg)
