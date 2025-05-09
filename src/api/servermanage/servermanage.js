import request from '@/utils/request'

const baseurl = '/servermanage/'

// 查询服务器列表
export function listSsh(query) {
    return request({
        url: baseurl + '/list',
        method: 'get',
        params: query
    })
}


// 新增服务器
export function addSsh(data) {
    return request({
        url: baseurl,
        method: 'post',
        data: data
    })
}

// 修改服务器
export function updateSsh(data) {
    return request({
        url: baseurl,
        method: 'put',
        data: data
    })
}

// 删除服务器
export function delSsh(sshId) {
    return request({
        url: baseurl + '/' + sshId,
        method: 'delete'
    })
}


// 查询服务器详细
export function getSshById(sshId) {
    return request({
        url: baseurl + '/' + sshId,
        method: 'get',
        params: sshId
    })
}

// 根据 ID 复制服务器
export function copySshById(sshId) {
    return request({
        url: baseurl + '/copy/' + sshId,
        method: 'post'
    })
}

// 根据 ID 测试连接机器人
export function testSshById(sshId) {
    return request({
        url: baseurl + '/' + sshId,
        method: 'post',
        data: sshId
    })
}
