import { $translate } from "@/services"
import { ucaseFirst } from "@/utils"

const
	TIMESPAN_TRANSLATE_ID_PREFIX = 'ui.timespan.',
	$t = i => $translate.instant(TIMESPAN_TRANSLATE_ID_PREFIX + i),
	SECONDS_IN = {
		"year":   60 * 60 * 24 * 365,
		"month":  60 * 60 * 24 * 30,
		"week":   60 * 60 * 24 * 7,
		"day":    60 * 60 * 24,
		"hour":   60 * 60,
		"minute": 60,
		"second": 1,
	},
	MINIMUM_SPAN = Object.entries(SECONDS_IN).slice(-1)[0][1]

const dateToEpoch = date => {
	if (!date) return 0
	if (typeof date === "string") {
		if (/^\d+$/.test(date)) {
			return +date
		} else {
			return ~~((new Date(date)).getTime() / 1000)
		}
	} else if (typeof date !== "number") {
		return 0
	}
	return date
}


export const timeSpan = (date1, date2=null, length=2, useRelativeDescription=false) => {

	let res = "-" // no span translation

	// check intial date
	date1 = dateToEpoch(date1)
	if (!date1) return res

	// check end date
	if (date2) {
		date2 = dateToEpoch(date2)
		if (!date2) return res
	} else {
		date2 = ~~((new Date()).getTime() / 1000) // now
	}

	if (useRelativeDescription) res = ucaseFirst($t('justnow'))

	// calc diff
	let diff, diffName
	if (date1 >= date2) {
		diff = date1 - date2
		if (useRelativeDescription) diffName = $t('future')
	} else {
		diff = date2 - date1
		if (useRelativeDescription) diffName = $t('past')
	}
	if (diff < MINIMUM_SPAN) return res

	// make result array
	const resArr = []
	for (let [spanName, spanSeconds] of Object.entries(SECONDS_IN)) {
		if (diff < spanSeconds) continue
		const abs = length === 1 ? Math.round(diff / spanSeconds) : Math.floor(diff / spanSeconds)
		let cur
		// one
		if (!useRelativeDescription && abs === 1) {
			cur = $t(spanName + '.singular')
		// one
		} else if (abs === 1) {
			cur = $t(spanName + '.singular_pastfuture')
		// one from base10 above 20
		} else if (useRelativeDescription && abs > 20 && abs % 10 === 1) {
			cur = abs + " " + $t(spanName + '.plural_1_pastfuture')
		// 2..4
		} else if (abs <= 4 || (useRelativeDescription && abs > 20 && abs % 10 <=4)) {
			cur = abs + " " + $t(spanName + '.plural_234')
		// 5 and more
		} else {
			cur = abs + " " + $t(spanName + '.plural')
		}
		if (cur) resArr.push(cur)
		if (length === 1) break
		length--
		diff %= spanSeconds
	}

	// build string
	res = ''
	const resArrLen = resArr.length
	resArr.forEach((bit, i) => {
		bit = bit.replace(' ', '\u00A0') // nbsp
		if (!i) {
			res += ucaseFirst(bit)
		} else {
			if (i === resArrLen - 1) {
				res += ' ' + $t('and') + ' '
			} else {
				res += $t('separator') + ' '
			}
			res += bit
		}
	})
	if (diffName) res += ' ' + diffName

	return res
}
