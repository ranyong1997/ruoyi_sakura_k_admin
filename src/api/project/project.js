import request from '@/utils/request'

const baseurl = '/auto/project'

// 获取项目列表
export function listProject(query) {
    return request({
        url: baseurl + '/list',
        method: 'get',
        params: query
    })
}

// 新增项目
export function addProject(data) {
    return request({
        url: baseurl,
        method: 'post',
        data: data
    })
}

// 修改项目
export function updateProject(data) {
    return request({
        url: baseurl,
        method: 'put',
        data: data
    })
}

// 删除项目
export function delProject(projectId) {
    return request({
        url: baseurl + '/' + projectId,
        method: 'delete'
    })
}

// 根据 ID 获取项目详情
export function getProjectById(projectId) {
    return request({
        url: baseurl + '/' + projectId,
        method: 'get',
        params: projectId
    })
}

// 根据 ID 复制项目
export function copyProjectById(projectId) {
    return request({
        url: baseurl + '/copy/' + projectId,
        method: 'post'
    })
}