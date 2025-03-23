#!/bin/bash

# 构建项目
npm run build

# 上传到七牛云
qshell qupload 2 qiniu.conf 