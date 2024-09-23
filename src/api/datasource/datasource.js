import request from '@/utils/request'

const baseurl = '/commonConfig/dataSource'

// 获取数据源列表
export function listDatasource(query) {
    return request({
        url: baseurl + '/list',
        method: 'get',
        params: query
    })
}

// 新增数据源
export function addDatasource(data) {
    return request({
        url: baseurl,
        method: 'post',
        data: data
    })
}

// 修改数据源
export function updateDatasource(data) {
    return request({
        url: baseurl,
        method: 'put',
        data: data
    })
}

// 删除数据源
export function delDatasource(datasourceId) {
    return request({
        url: baseurl + '/' + datasourceId,
        method: 'delete'
    })
}

// 根据 ID 获取数据源详情
export function getDatasourceById(datasourceId) {
    return request({
        url: baseurl + '/' + datasourceId,
        method: 'get',
        params: datasourceId
    })
}

// 根据 ID 测试连接数据源
export function testDatasourceById(datasourceId) {
    return request({
        url: baseurl + '/' + datasourceId,
        method: 'post',
        data: datasourceId
    })
}

// 根据 ID 连接数据源获取所有数据库和表信息
export function getDatabaseTableById(datasourceId) {
    return request({
        url: '/commonConfig/dataSourcedatabaseTable/' + datasourceId,
        method: 'get',
        params: datasourceId
    })
}

// 连接数据源并执行 SQL 查询
export function executingsql(data) {
    return request({
        url: '/commonConfig/dataSourceExecutingSql',
        method: 'post',
        params: data
    })
}