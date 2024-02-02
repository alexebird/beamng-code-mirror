// BngRelativeTime Directive - for displaying times in a human readable form relative to current time (Just now, 3 minutes ago, an hour ago etc.)
import { timeSpan } from "@/utils/datetime"

const update = (element, { value }) => {
	const desc = timeSpan(value, null, 1, true)
	if (desc === "-") return
	element.innerHTML = desc
}

export default update
