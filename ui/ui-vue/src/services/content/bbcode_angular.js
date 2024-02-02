// Angular additional replacements for BBCode parsing

const PARSE_NESTED = 'PARSE_NESTED'

export default [

	// icon (made angular specific for now as location for Vue icons may be different)
	[/\[ico=([^\s\]]+)\s*\](.*?(?=\[\/ico\]))\[\/ico\]/gi, '<img style="max-width: 98%;" src="/ui/images/icons/$1.png">$2</img>'], // icon with contained text?? This isn't even valid HTML - text will just follow the image
	[/\[ico=([^\s\]]+)\s*\]/gi, '<img style="max-width: 98%;" class="ico" src="/ui/images/icons/$1.png"/>'], // icon without text

	// Action Bindings
	[/\[action=(.*?)\]\[showunassigned=(.*?)\](.*?)/gi, '<binding action="$1" showunassigned="$2"  style="margin: 0 0.5em; text-shadow: initial;"></binding>'],
	[/\[action=(.*?)\](.*?)/gi, '<binding showunassigned="true" action="$1" style="margin: 0 0.5em; text-shadow: initial;"></binding>'], // [] [/] version
	[/\[action=(.*?)\]/gi, '<binding showunassigned="true" action="$1"></binding>'], // version with no closing bracket

]
