import request from '@/utils/request'

// 获取项目列表
export function listProject(query) {
    return request({
        url: '/auto/project/list',
        method: 'get',
        params: query
    })
}

// 新增项目
export function addProject(data) {
    return request({
        url: '/auto/project',
        method: 'post',
        data: data
    })
}

// 修改项目
export function updateProject(data) {
    return request({
        url: '/auto/project',
        method: 'put',
        data: data
    })
}

// 删除项目
export function delProject(projectId) {
    return request({
        url: '/auto/project/' + projectId,
        method: 'delete'
    })
}

// 根据 ID 获取项目详情
export function getProjectById(projectId) {
    return request({
        url: '/auto/project/' + projectId,
        method: 'get',
        params: projectId
    })
}
