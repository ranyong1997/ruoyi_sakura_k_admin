/**
 * 判断数组对象中所有属性是否为空，为空则删除当前行对象
 * @description @感谢大黄
 * @param list 数组对象
 * @returns 删除空值后的数组对象
 */
export function handleEmpty(list) {
    const arr = [];
    for (const i in list) {
        const d = [];
        for (const j in list[i]) {
            // @ts-ignore
            d.push(list[i][j]);
        }
        const leng = d.filter((item) => item === '').length;
        if (leng !== d.length) {
            // @ts-ignore
            arr.push(list[i]);
        }
    }
    return arr;
}