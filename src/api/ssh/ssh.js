import request from '@/utils/request'

const baseurl = '/ssh/'

// 测试SSH连接
export function TestSsh(data) {
    return request({
        url: baseurl + 'connect/test',
        method: 'post',
        data: data
    })
}


// 执行SSH命令
export function ExecuteCommand(data) {
    return request({
        url: baseurl + 'command/execute',
        method: 'post',
        data: data
    })
}

// 执行SSH脚本
export function ExecuteScript(data) {
    return request({
        url: baseurl + 'script/execute',
        method: 'post',
        data: data
    })
}

// 上传文件到远程服务器
export function UploadFile(data) {
    return request({
        url: baseurl + 'file/upload',
        method: 'post',
        data: data
    })
}

// 从远程服务器下载文件
export function DownloadFile(data) {
    return request({
        url: baseurl + 'file/download',
        method: 'post',
        data: data
    })
}

// 写入文本到远程文件
export function WriteText(data) {
    return request({
        url: baseurl + 'text/write',
        method: 'post',
        data: data
    })
}


// 读取远程文件文本内容
export function ReadText(data) {
    return request({
        url: baseurl + 'text/read',
        method: 'post',
        data: data
    })
}

// 列出远程目录内容
export function ListDirectory(data) {
    return request({
        url: baseurl + 'dir/list',
        method: 'post',
        data: data
    })
}

// 创建远程目录
export function MakeDirectory(data) {
    return request({
        url: baseurl + 'dir/make',
        method: 'post',
        data: data
    })
}

// 删除远程文件
export function RemoveFile(data) {
    return request({
        url: baseurl + 'file/remove',
        method: 'post',
        data: data
    })
}

// 删除远程目录
export function RemoveDirectory(data) {
    return request({
        url: baseurl + 'dir/remove',
        method: 'post',
        data: data
    })
}

// 获取远程文件信息
export function GetFileInfo(data) {
    return request({
        url: baseurl + 'file/info',
        method: 'post',
        data: data
    })
}