// 获取请求方式tag颜色
export function getMethodColor(method) {
	let color = ""
	if (method === "GET") {
		color = "#61affe"
	} else if (method === "POST") {
		color = "#49cc90"
	} else if (method === "DELETE") {
		color = "#f93e3d"
	} else if (method === "PUT") {
		color = "#fca130"
	} else if (method === "N/A") {
		color = "#f56c6c"
	}
	return color
}