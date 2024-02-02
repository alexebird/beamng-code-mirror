const PARSE_NESTED = 'PARSE_NESTED'

export default [

  // URLs
  [/\[url=https?:\/\/([^\s\]]+)\](.*?(?=\[\/url\]))\[\/url\]/gi, '<a href="http-external://$1">$2</a>'],
  [/\[url='https?:\/\/([^\s\]]+)'\](.*?(?=\[\/url\]))\[\/url\]/gi, '<a href="http-external://$1">$2</a>'],
  [/\[forumurl=https?:\/\/([^\s\]]+)\](\S*?(?=\[\/forumurl\]))\[\/forumurl\]/gi, '<a href="http-external://$1">$2</a>'],
  [/\[url\]https?:\/\/(.*?(?=\[\/url\]))\[\/url\]/gi, '<a href="http-external://$1">$1</a>'],
  [/\[url=([^\s\]]+)\](.*?(?=\[\/url\]))\[\/url\]/gi, '<a href="$1">$2</a>'],

  // Headings
  [/\[h(\d)\](.*?(?=\[\/h\d\]))\[\/h\d\]/gi, '<h$1>$2</h$1>'],

  // Images
  [/\[img\]\s*?(\S*?(?=\[\/img\]))\[\/img\]/gi, '<img style="max-width: 98%;" src="$1"></img>'],

  // Plain text link (only works with preceding whitespace) - put here to avoid trashing links above (right?)
  [/\shttp(s|):\/\/(\S*)/gi, '<a href="http-external://$2">http$1://$2</a>'],

  // Lists
  [/\[list=\d+\](.*?(?=\[\/list\]))\[\/list\]/gi, '<ol>$1</ol>'],
  [/\[list\]/gi, '<ul>'],
  [/\[\/list\]/gi, '</ul>'],
  [/\[olist\]/gi, '<ol>'],
  [/\[\/olist\]/gi, '</ol>'],
  [/\[(\*|\+)\]\s*?((.|\s)*?(?=\[(\*|\+)\]|\<\/ul\>|\<\/ol\>|\n\n|$))/gim, '<li>$2</li>'],

  // b, u, s, i
  [PARSE_NESTED, /\[b\](.*?(?=\[\/b\]))\[\/b\]/gi, '<b>$1</b>'],
  [PARSE_NESTED, /\[u\](.*?(?=\[\/u\]))\[\/u\]/gi, '<u>$1</u>'],
  [PARSE_NESTED, /\[s\](.*?(?=\[\/s\]))\[\/s\]/gi, '<s>$1</s>'],
  [PARSE_NESTED, /\[i\](.*?(?=\[\/i\]))\[\/i\]/gi, '<i>$1</i>'],

  // Strikethrough
  [/\[strike\](.*?(?=\[\/strike\]))\[\/strike\]/gi, '<s>$1</s>'],

  // Code sample
  [/\[code\](.*?(?=\[\/code\]))\[\/code\]/gi, '<span class="bbcode-pre">$1</span>'],

  // Newlines
  [/\[br\]/gi, '<br />'],
  [/\n\n/gi, '<br/><br/>'],
  [/\n/gi, '<br/>'],

  // BeamNG media
  [/\[attach=?f?u?l?l?\](.*?(?=\[\/attach\]))\[\/attach\]/gi, '<img style="max-width: 98%;" src="https://www.beamng.com/attachments/.$1/">'],
  [/\[USER=([\d]+)\](.*?(?=\[\/USER\]))\[\/USER\]/gi, '<a href="http-external://www.beamng.com/members/.$1/">$2</a>'],
  // <don't work?>
    [/\[MEDIA=youtube\](.*?(?=\[\/MEDIA\]))\[\/MEDIA\]/gi, '<div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%;"><iframe style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;" src="https://www.youtube-nocookie.com/embed/$1?autoplay=0&controls=1&disablekb=1&fs=0&modestbranding=1&rel=0&showinfo=0" frameborder="0" allowfullscreen></iframe></div>'],
    [/\[MEDIA=beamng\](.*?(?=\[\/MEDIA\]))\[\/MEDIA\]/gi, '<img style="max-width: 98%;" src="https://media.beamng.com/$1/">'],
  // </dont't work?>

  // Text styling (size, color, font)
  [PARSE_NESTED, /\[size=(\d+)\]([^[]*(?:\[(?!size=\d+\]|\/size\])[^[]*)*)\[\/size\]/ig , '<span style="font-size: calc($1*3px+6);">$2</span>'],
  [PARSE_NESTED, /\[COLOR=([a-z0-9\#\, \'\"\(\)]+)\]([^[]*(?:\[(?!COLOR=[a-z0-9#\(\)]+\]|\/COLOR\])[^[]*)*)\[\/COLOR\]/gi, '<span style=\'color:$1;\'>$2</span>'],
  [PARSE_NESTED, /\[font=([^\]]+)\](.*?(?=\[\/font\]))\[\/font\]/gi, '<span style="family: $1;">$2</span>'],

  // Horizontal rule
  [/\[hr\]\[\/hr\]/gi, '<hr>'],

  // Spoilers
  [/\[spoiler=([^\]]+)\](.*?(?=\[\/spoiler\]))\[\/spoiler\]/gi, '<div style="margin-bottom: 2px;"> <b>Spoiler: $1 </b><input value="Show" style="margin: 0px; padding: 0px; width: 60px; font-size: 10px;" onclick="if(this.parentNode.getElementsByTagName(\'div\')[0].getElementsByTagName(\'div\')[0].style.display != \'inline\') { this.parentNode.getElementsByTagName(\'div\')[0].getElementsByTagName(\'div\')[0].style.display = \'inline\'; this.value = \'Hide\'; } else { this.parentNode.getElementsByTagName(\'div\')[0].getElementsByTagName(\'div\')[0].style.display = \'none\'; this.value=\'Show\'; }" type="button"> <br> <div style="border: 1px inset; padding: 6px;"> <div style="display: none;">$2</div> </div> </div> '],
  [/\[spoiler\](.*?(?=\[\/spoiler\]))\[\/spoiler\]/gi, '<div style="margin-bottom: 2px;"> <b>Spoiler </b><input value="Show" style="margin: 0px; padding: 0px; width: 60px; font-size: 10px;" onclick="if(this.parentNode.getElementsByTagName(\'div\')[0].getElementsByTagName(\'div\')[0].style.display != \'inline\') { this.parentNode.getElementsByTagName(\'div\')[0].getElementsByTagName(\'div\')[0].style.display = \'inline\'; this.value = \'Hide\'; } else { this.parentNode.getElementsByTagName(\'div\')[0].getElementsByTagName(\'div\')[0].style.display = \'none\'; this.value=\'Show\'; }" type="button"> <br> <div style="border: 1px inset; padding: 6px;"> <div style="display: none;">$1</div> </div> </div> '],

  // Paragraph alignment
  [PARSE_NESTED, /\[left\](.*?(?=\[\/left\]))\[\/left\]/gi, '<p style="text-align: left;">$1</p>'],
  [PARSE_NESTED, /\[center\](.*?(?=\[\/center\]))\[\/center\]/gi, '<p style="text-align: center;">$1</p>'],
  [PARSE_NESTED, /\[right\](.*?(?=\[\/right\]))\[\/right\]/gi, '<p style="text-align: right;">$1</p>'],

  // simplistic markdown parsing
  [PARSE_NESTED, /\*\*(.*?(?=\*\*))\*\*/gi, '<b>$1</b>'], // **bold**
  [PARSE_NESTED, /\*(.*?(?=\*))\*/gi, '<i>$1</i>'],  // *italic*
  [PARSE_NESTED, /\[(.*?(?=\]\())\]\((https?:\/\/((.*?(?=\)))))\)/gi, '$1 <i>( $2 )</i>'], // [link](http://website.com)

]
