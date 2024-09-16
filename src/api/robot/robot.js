import request from '@/utils/request'

const baseurl = '/notify/robots'

// 获取机器人列表
export function listRobot(query) {
    return request({
        url: baseurl + '/list',
        method: 'get',
        params: query
    })
}

// 新增机器人
export function addRobot(data) {
    return request({
        url: baseurl,
        method: 'post',
        data: data
    })
}

// 修改机器人
export function updateRobot(data) {
    return request({
        url: baseurl,
        method: 'put',
        data: data
    })
}

// 删除机器人
export function delRobot(robotId) {
    return request({
        url: baseurl + '/' + robotId,
        method: 'delete'
    })
}

// 根据 ID 获取机器人详情
export function getRobotById(robotId) {
    return request({
        url: baseurl + '/' + robotId,
        method: 'get',
        params: robotId
    })
}

// 根据 ID 测试连接机器人
export function testRobotById(robotId) {
    return request({
        url: baseurl + '/' + robotId,
        method: 'post',
        data: robotId
    })
}
