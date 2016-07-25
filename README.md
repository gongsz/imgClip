﻿# imgClip
java版图片裁剪插件，前端图片裁剪插件可换任意后台裁剪

`<!DOCTYPE html>`
`<html xmlns="http://www.w3.org/1999/xhtml">`
`<head>`
`    <meta charset="utf-8" />`
`   <meta name="format-detection" content="telephone=no" />`
`    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />`
`    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />`
`    <meta http-equiv="Pragma" content="no-cache" />`
`    <meta http-equiv="Expires" content="0" />`
`    <title>imgClip demo</title>`
`    <script src="scripts/jquery-1.7.1.min.js" type="text/javascript"></script>    `
`    `
`    <!--IE8下要引用此样式，其他可忽略-->`
`    <link href="css/imgClip.css" rel="stylesheet" />`
`    <script src="scripts/imgClip.js" type="text/javascript"></script>`
`    <style type="text/css">`
`        html, body {`
`            margin:0px;`
`            padding:0px;`
`        }`
`    </style>`
`</head>`
`<body>`
`    <div id="DreamImgClip" style="background-color: #fff; width: 736px; margin: 20px; box-shadow: 0px 0px 10px rgba(0,0,0,0.5); ">加载上传图片插件中...</div>`
`</body>`
`</html>`
`<script type="text/javascript">`
`    $(function () {`
`        imgClip.init({`
`            pluginid: "dreamid1q2w3esdrft5678765",          //插件在引用系统中的唯一ID`
`            sysname: "DreamImgClip",                        //接入的系统名称`
`            path: "../",                                    //引入插件层级`
`            wrapid: "DreamImgClip",                         //插件填充容器的ID`
`            ismobile: false,`
`            typeTitle: "头像",                              //类型文字，默认为头像的，可以为任意类型的提示信息`
`            nowImgUrl: "imgClip/clipPhoto/662_20160706_095837812_3335.jpg",        //当前使用的图片`
`            uploadImgFilePath: "imgClip/upload/",           //上传图片路径`
`            uploadOriginalFun: function (base64img, imgname, callback) {`
`            	var timespan=new Date().getTime();`
`				$.ajax({`
`						type:"POST",`
`						url:"../ImgClipBase",`
`						data:{actionName:"saveImage",base64img:base64img,imgPath:"imgClip/upload/" + timespan+"_"+imgname},`
`						dataType:"text",`
`						error:function(msg){`
`							console.log(msg)`
`						},`
`						success:function(data){`
`							//图片名可由后台自己生成，最后data会传递图片路径到前台`
`			                if (callback) {`
`			                    callback("imgClip/upload/" + timespan+"_"+imgname);`
`			                }`
`						}`
`					});`
`           },                        //上传图片回调方法，方法必须参数base64img,imgname,callback(接收相对根目录的图片路径)`
`            saveClipImgFun: function (clipImgInfo, callback) {`
`				$.ajax({`
`						type:"POST",`
`						url:"../ImgClipBase",`
`						//参数savePath可以重新指定存放路径`
`						data:{actionName:"clipImage",jsonObj:encodeURI(JSON.stringify(clipImgInfo)),"savePath":"imgClip/clipPhoto/"},`
`						dataType:"text",`
`						error:function(msg){`
`							console.log(msg)`
`						},`
`						success:function(data){`
`							var dobj=eval("["+data+"]");`
`							if(dobj.length>0)`
`							{`
`								if(dobj[0].status=="ok")`
`								{`
`					                if (callback) {`
`					                    callback("ok", dobj[0].msg);`
`					                }`
`								}else`
`								{`
`									alert(dobj[0].msg);`
`								}`
`							}`
`						}`
`					});`
`           },                           //保存裁剪图片回调方法，方法必须参数clipImgInfo对象,callback(接收裁剪状态ok,error,裁剪后存放的图片地址)`
`            uploadOriginalSucceed: function (data) {`
`                //alert(data);`
`            },                    //上传原图成功回调方法`
`            uploadOriginalError: null,                      //上传原图失败回调方法`
`            clipSucceed: function (imgSrc) {`
`                console.log(imgSrc);`
`            },                              //裁剪成功回调方法`
`            clipError: null,                                //裁剪失败回调方法`
`            selectHistoryImgFun: function (data) {`
`                alert(data);`
`            },                      //选择历史图片回调方法`
`            selectSysImgFun: function (data) {`
`                alert(data);`
`            }                           //选择系统图片回调方法`
`        });`
`    });`
``
`</script>`