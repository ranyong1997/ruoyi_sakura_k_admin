import request from '@/utils/request'

const baseurl = '/testcase/testcaseInfo'

// 获取测试用例列表
export function listApiCase(query) {
    return request({
        url: baseurl + '/list',
        method: 'get',
        params: query
    })
}

// 新增测试用例
export function addApiCase(data) {
    return request({
        url: baseurl,
        method: 'post',
        data: data
    })
}

// 修改测试用例
export function updateApiCase(data) {
    return request({
        url: baseurl,
        method: 'put',
        data: data
    })
}

// 删除测试用例
export function delApiCase(testcaseId) {
    return request({
        url: baseurl + '/' + testcaseId,
        method: 'delete'
    })
}

// 根据 ID 获取测试用例
export function getApiCaseById(testcaseId) {
    return request({
        url: baseurl + '/' + testcaseId,
        method: 'get',
        params: testcaseId
    })
}

// 根据环境ID和用例ID获取测试用例
export function TestCase_Batch(envId, testcaseId) {
    return request({
        url: baseurl + '/testcase_batch',
        method: 'post',
        data: {
            envId: envId,
            testcaseId: testcaseId
        }
    })
}
