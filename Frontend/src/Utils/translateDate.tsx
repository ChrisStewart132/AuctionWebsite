
const translateDate = (date: string | undefined): string => {
/**date = "2022-05-29T04:11:00.000Z" */
	if(date===undefined) return ""
	const ymd = date.split("T")[0]
	const time = date.split("T")[1].slice(0, date.split("T")[1].length-8)
	return `${ymd} ${time}`
}
export default translateDate;