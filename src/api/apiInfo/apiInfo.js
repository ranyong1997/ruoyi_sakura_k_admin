import request from '@/utils/request'

const baseurl = '/apitest/apiInfo'

// 获取接口列表
export function listApi(query) {
    return request({
        url: baseurl + '/list',
        method: 'get',
        params: query
    })
}

// 新增接口
export function addApi(data) {
    return request({
        url: baseurl,
        method: 'post',
        data: data
    })
}

// 修改接口
export function updateApi(data) {
    return request({
        url: baseurl,
        method: 'put',
        data: data
    })
}

// 删除接口
export function delApi(apiId) {
    return request({
        url: baseurl + '/' + apiId,
        method: 'delete'
    })
}

// 根据 ID 获取接口详情
export function getApiById(apiId) {
    return request({
        url: baseurl + '/' + apiId,
        method: 'get',
        params: apiId
    })
}

// 根据 ID 测试连接机器人
export function testApiById(apiId) {
    return request({
        url: baseurl + '/' + apiId,
        method: 'post',
        data: apiId
    })
}
