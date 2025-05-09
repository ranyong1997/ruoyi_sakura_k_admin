import request from '@/utils/request'

const baseurl = '/env/envInfo'

// 获取环境列表
export function listEnv(query) {
    return request({
        url: baseurl + '/list',
        method: 'get',
        params: query
    })
}

// 新增环境
export function addEnv(data) {
    return request({
        url: baseurl,
        method: 'post',
        data: data
    })
}

// 修改环境
export function updateEnv(data) {
    return request({
        url: baseurl,
        method: 'put',
        data: data
    })
}

// 删除环境
export function delEnv(envId) {
    return request({
        url: baseurl + '/' + envId,
        method: 'delete'
    })
}

// 根据 ID 获取环境详情
export function getEnvById(envId) {
    return request({
        url: baseurl + '/' + envId,
        method: 'get',
        params: envId
    })
}

// 根据 ID 复制服务器
export function copyEnvById(envId) {
    return request({
        url: baseurl + '/copy/' + envId,
        method: 'post'
    })
}