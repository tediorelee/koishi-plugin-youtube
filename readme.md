# koishi-plugin-youtube

[![npm](https://img.shields.io/npm/v/koishi-plugin-youtube?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-youtube)

youtube plugin for koishi

## How to use

* 根据Google开发者文档指引，创建一个app并且打开v3 api，记下你的apikey
  [YouTube Data API Overview  |  Google Developers](https://developers.google.com/youtube/v3/getting-started)

> 
* 将apikey填入到koishi后台插件配置中并且启用youtube插件
* 插件将会自动识别群聊里的YouTube视频链接并返回视频预览内容等等，包含以下两种：
  * https://youtu.be/{id}
  * https://www.youtube.com/watch?v={id}
