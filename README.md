# 运行前端
## 测试环境
npm run dev
## 生产环境构建
npm run build:stage 


## 其他操作

- 提交代码模板

```
✨ Feat(): 新增
🐞 Fix(): 修复
📃 Docs(): 文档
🦄 Refactor(): 重构
🎈 Perf(): 优化
```

- Git提交代码

Git更新ignore文件直接修改gitignore是不会生效的，需要先去掉已经托管的文件，修改完成之后再重新添加并提交。

```text
第一步：
git rm -r --cached .
去掉已经托管的文件
第二步：
修改自己的igonre文件内容
第三步：
git add .
git commit -m "clear cached"
```
测试develop分支