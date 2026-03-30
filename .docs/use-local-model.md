# 使用本地模型

在国内使用hf的cdn下载模型可能比较慢，
参考 [download-model-from-modelscope](./download-model-from-modelscope.md)
从魔搭下载模型。

## 启动本地服务器

我习惯使用http-server进行提供静态资源http服务。

```shell
npm i -g http-server

cd /path/to/model/parent

http-server --cors
```

例如下载了好几个模型在 `~/local-models`

```shell
cd ~/local-models

http-server --cors
```

这样默认监听127.0.0.1:8080提供服务

## 设置模型加载配置

```js
import {
  // ...
  env,
} from '@huggingface/transformers'

env.remoteHost = 'http://127.0.0.1:8080/'
env.remotePathTemplate = '{model}'
```
