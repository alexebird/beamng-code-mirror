// Vue additional replacements for BBCode parsing

const PARSE_NESTED = 'PARSE_NESTED'

export default [

	// icon (made Vue specific for now as location for angular icons may be different)
	[/\[ico=([^\s\]]+)\s*\](.*?(?=\[\/ico\]))\[\/ico\]/gi, '<img style="max-width: 98%;" src="/ui/images/icons/$1.png">$2</img>'], // icon with contained text?? This isn't even valid HTML - text will just follow the image
	[/\[ico=([^\s\]]+)\s*\]/gi, '<img style="max-width: 98%;" class="ico" src="/ui/images/icons/$1.png"/>'], // icon without text

	// Action Bindings
	[/\[action=(.*?)\]\[showunassigned=(.*?)\](.*?)/gi, '<BngBinding action="$1" :show-unassigned="$2"/>'],
	[/\[action=(.*?)\](.*?)/gi, '<BngBinding action="$1" :show-unassigned="true"/>'], // [] [/] version
	[/\[action=(.*?)\]/gi, '<BngBinding action="$1" :show-unassigned="true"/>'], // version with no closing bracket

]
