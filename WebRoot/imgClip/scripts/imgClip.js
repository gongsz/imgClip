; (function ($) {
    var imgClip = function (options) {
        var self = this;
        this.setting = {
            pluginid: "dreamclip",                          //插件在引用系统中的唯一ID
            sysname: "DreamImgClip",                        //接入的系统名称
            path: "../",                                    //引入插件层级
            wrapid: "DreamImgClip",                         //插件填充容器的ID
            ismobile: false,                                //是否手机版
            typeTitle: "头像",                              //类型文字，默认为头像的，可以为任意类型的提示信息
            nowImgUrl: "imgClip/sysImg/default.jpg",        //当前使用的图片
            uploadImgFilePath: "imgClip/images/",           //上传图片路径
            uploadOriginalFun: null,                        //上传图片回调方法，方法必须参数base64img,imgname,callback(接收相对根目录的图片路径)
            saveClipImgFun: null,                           //保存裁剪图片回调方法，如果有旋转角度，必须先旋转再裁剪,方法必须参数clipImgInfo对象,callback(接收裁剪状态ok,error)
            uploadOriginalSucceed: null,                    //上传原图成功回调方法
            uploadOriginalError: null,                      //上传原图失败回调方法
            clipSucceed: null,                              //裁剪成功回调方法
            clipError: null,                                //裁剪失败回调方法
            selectHistoryImgFun: null,                      //选择历史图片回调方法
            selectSysImgFun: null,                          //选择系统图片回调方法
            sysImgArry: [
                { src: "imgClip/sysImg/male-130.png", title: "默认头像男" },
                { src: "imgClip/sysImg/female-130.png", title: "默认头像女" },
                { src: "imgClip/sysImg/male02-130.png", title: "职场帅哥" },
                { src: "imgClip/sysImg/female02-130.png", title: "呆萌MM" },
                { src: "imgClip/sysImg/male03-130.png", title: "经济适用男" },
                { src: "imgClip/sysImg/female03-130.png", title: "知性少女" },
                { src: "imgClip/sysImg/male04-130.png", title: "呆萌GG" },
                { src: "imgClip/sysImg/female04-130.png", title: "呆萌MM" },
                { src: "imgClip/sysImg/male05-130.png", title: "斯文眼镜GG" },
                { src: "imgClip/sysImg/female05-130.png", title: "乖巧可爱MM" },
                { src: "imgClip/sysImg/male06-130.png", title: "蒙面GG" },
                { src: "imgClip/sysImg/female06-130.png", title: "蒙面MM" }
            ]                                              //系统推荐头像
        };
        //检测用户传进来的参数是否合法
        if (!this.isValid(options))
        {
            $("#" + this.setting.wrapid).html("引用插件使用的参数不合法！");
            return this;
        }
        $.extend(this.setting, options); //使用jQuery.extend 覆盖插件默认参数
        this.imgClipWrap = $("#" + this.setting.wrapid).empty();
        //console.log(this.setting);

        //初始化样式
        this.initImgClipStyleFile();
        
        if (this.setting.ismobile) {
            //启用手机版
            this.initMobileElement();
        } else {
            //启用PC版
            this.initPCElement();
            this.initPCEvent();
            this.initPCUpimgEvent();
        }
        this.initPCHistoryElement(this);
    }
    imgClip.prototype = {
        //加载PC事件
        initPCEvent: function () {
            var self = this;
            //注册系统默认头像事件
            if (self.setting.sysImgArry.length <= 4) {
                self.imgClipWrap.find(".sysimg-btn-prev").unbind("click").removeClass("canclick");
                self.imgClipWrap.find(".sysimg-btn-next").unbind("click").removeClass("canclick");
            } else {
                self.imgClipWrap.find(".sysimg-btn-prev").removeClass("canclick");
                self.imgClipWrap.find(".sysimg-btn-next").bind("click", function () {
                    self.imgClipWrap.find(".sysimg-btn-prev").addClass("canclick");
                    if (Math.abs(parseInt(self.imgClipWrap.find(".sys-img-wrap ul").css("left"))) + 720 >= parseInt(self.imgClipWrap.find(".sys-img-wrap ul").css("width"))) {
                        self.imgClipWrap.find(".sys-img-wrap ul").css("left", -(parseInt(self.imgClipWrap.find(".sys-img-wrap ul").css("width")) - 360 - 35) + "px");
                        self.imgClipWrap.find(".sysimg-btn-next").removeClass("canclick");
                    } else {
                        self.imgClipWrap.find(".sys-img-wrap ul").css("left", (parseInt(self.imgClipWrap.find(".sys-img-wrap ul").css("left")) - 360) + "px");
                        if (Math.abs(parseInt(self.imgClipWrap.find(".sys-img-wrap ul").css("left")) - 720 - 35) == parseInt(self.imgClipWrap.find(".sys-img-wrap ul").css("width"))) {
                            self.imgClipWrap.find(".sysimg-btn-next").removeClass("canclick");
                        }
                    }
                });
                self.imgClipWrap.find(".sysimg-btn-prev").bind("click", function () {
                    self.imgClipWrap.find(".sysimg-btn-next").addClass("canclick");
                    //console.log(self.imgClipWrap.find(".sys-img-wrap ul").css("left"))
                    if (parseInt(self.imgClipWrap.find(".sys-img-wrap ul").css("left")) + 360 < 35) {
                        self.imgClipWrap.find(".sys-img-wrap ul").css("left", parseInt(self.imgClipWrap.find(".sys-img-wrap ul").css("left")) + 360 + "px");
                        if (parseInt(self.imgClipWrap.find(".sys-img-wrap ul").css("left")) + 360 == 35) {
                            self.imgClipWrap.find(".sysimg-btn-prev").removeClass("canclick");
                        }
                    } else {
                        self.imgClipWrap.find(".sys-img-wrap ul").css("left", "35px");
                        self.imgClipWrap.find(".sysimg-btn-prev").removeClass("canclick");
                    }
                });
            }

            //使用系统方案图片
            var sysDomObj = {};
            sysDomObj.sysImgUl = self.imgClipWrap.find(".sys-img-wrap ul");
            sysDomObj.historyImgUl = self.imgClipWrap.find(".img-select-wrap .sr-history-wrap ul");
            sysDomObj.selSaveBtn = self.imgClipWrap.find(".img-select-wrap .btn-tool-wrap button");
            sysDomObj.clipResetBtn = self.imgClipWrap.find(".img-clip-wrap .btn-tool-wrap button");
            //系统推荐图片
            sysDomObj.sysImgUl.find("li").click(function () {
                if ($(this).hasClass("visiHisHot"))
                {
                    return;
                }
                sysDomObj.sysImgUl.find("li").removeClass("visiHisHot");
                sysDomObj.historyImgUl.find("li").removeClass("visiHisHot");
                $(this).addClass("visiHisHot");
                self.setPreview(self, $(this).find("img").attr("src"), "sysimg");
            });
            self.initPCHistoryEvent(self);
            sysDomObj.selSaveBtn.click(function () {
                if (self.setting.selectSysImgFun && self.selImgType == "sysimg") {
                    self.setting.selectSysImgFun(self.selImgUrl);
                } else if (self.setting.selectHistoryImgFun && self.selImgType == "hisimg") {
                    self.setting.selectHistoryImgFun(self.selImgUrl);
                }
                //记录使用过的图片，然后更新历史图片
                self.setMyImgData(self, self.setting.pluginid, { imgurl: self.selImgUrl, title: "", lastdate: new Date() });
                //提示保存成功
                self.imgClipWrap.find(".img-select-wrap .save-tip-wrap").removeClass("erroe").addClass("succeed").text(self.setting.typeTitle + "更新成功。");
                setTimeout(function () {
                    self.imgClipWrap.find(".img-select-wrap .save-tip-wrap").removeClass("erroe").removeClass("succeed");
                }, 2000);
                sysDomObj.selSaveBtn.attr("disabled", "disabled");
                //然后更新DOM
                self.initPCHistoryElement(self);
            });
            //保存
            sysDomObj.clipResetBtn.eq(0).click(function () {
                if (self.setting.saveClipImgFun) {
                    self.setting.saveClipImgFun(self.clipImgInfo, function (status, previewSrc) {
                        if (status == "ok") {
                            self.imgClipWrap.find(".img-select-wrap").show();
                            self.imgClipWrap.find(".img-clip-wrap").hide();
                            //提示保存成功
                            self.imgClipWrap.find(".img-select-wrap .save-tip-wrap").removeClass("erroe").addClass("succeed").text(self.setting.typeTitle + "更新成功。");
                            setTimeout(function () {
                                self.imgClipWrap.find(".img-select-wrap .save-tip-wrap").removeClass("erroe").removeClass("succeed");
                            }, 2000);
                            sysDomObj.selSaveBtn.attr("disabled", "disabled");

                            //设置裁剪后的图片
                            var clipDomObj = {};
                            clipDomObj.previewMaxImg = self.imgClipWrap.find(".img-select-wrap .max-img-wrap img");
                            clipDomObj.previewMinImg = self.imgClipWrap.find(".img-select-wrap .min-img-wrap img");
                            clipDomObj.previewMaxImg.attr("src", self.setting.path + previewSrc).removeClass("rotateAngle-90").removeClass("rotateAngle-180").removeClass("rotateAngle-270");
                            clipDomObj.previewMinImg.attr("src", self.setting.path + previewSrc).removeClass("rotateAngle-90").removeClass("rotateAngle-180").removeClass("rotateAngle-270");
                            self.setMyImgData(self, self.setting.pluginid, { imgurl: self.setting.path + previewSrc, title: "", lastdate: new Date() });

                            //然后更新DOM
                            self.initPCHistoryElement(self);
                            if (self.setting.clipSucceed)
                            {
                                self.setting.clipSucceed(previewSrc);
                            }
                        } else {
                            //更新失败提示
                            if (self.setting.clipError) {
                                self.setting.clipError(previewSrc);
                            }
                        }
                    })
                } else {
                    //内置保存裁剪图片

                }
            });
            //重新选择
            sysDomObj.clipResetBtn.eq(1).click(function () {
                self.imgClipWrap.find(".img-select-wrap").show();
                self.imgClipWrap.find(".img-clip-wrap").hide();

                var resetDomObj = {};
                resetDomObj.previewMaxImg = self.imgClipWrap.find(".img-select-wrap .max-img-wrap img");
                resetDomObj.previewMinImg = self.imgClipWrap.find(".img-select-wrap .min-img-wrap img");
                resetDomObj.previewMaxImg.attr("src", self.setting.path + self.setting.nowImgUrl).removeClass("rotateAngle-90").removeClass("rotateAngle-180").removeClass("rotateAngle-270");
                resetDomObj.previewMinImg.attr("src", self.setting.path + self.setting.nowImgUrl).removeClass("rotateAngle-90").removeClass("rotateAngle-180").removeClass("rotateAngle-270");
            });

            //左右旋转
            self.imgClipWrap.find(".rotateAngle-left").click(function () {
                self.rotateImgEvent(self, -90);
            });
            self.imgClipWrap.find(".rotateAngle-right").click(function () {
                self.rotateImgEvent(self, 90);
            });
        },
        //加载PC版
        initPCElement: function () {
            var self = this;
            var img_select_wrap = $("<div>").attr("class", "img-select-wrap max-wrap");
            var img_clip_wrap = $("<div>").attr("class", "img-clip-wrap max-wrap");

            var select_innerHtml = '<div class="wrap-s-left">'
            select_innerHtml += '<div class="img-workspace">';
            select_innerHtml += '<span class="method-title">方案一：选择本地照片，上传编辑自己的' + self.setting.typeTitle + '</span>';
            select_innerHtml += '<div class="upload-btn-wrap">';
            select_innerHtml += '<button class="ml-btn ml-eft-default bg-red" type="button">上传本地照片</button>';
            select_innerHtml += '<input type="file" accept="image/*" title="上传图片" />';
            select_innerHtml += '</div>';
            select_innerHtml += '<span class="upload-tip-title">支持jpg、jpeg、gif、png、bmp格式的图片</span>';
            select_innerHtml += '<span class="method-title">方案二：选择系统推荐' + self.setting.typeTitle + '，快速使用优质' + self.setting.typeTitle + '</span>';
            select_innerHtml += '<div class="sys-img-wrap">';
            select_innerHtml += '<span class="sysimg-btn-prev">';
            select_innerHtml += '</span>';
            select_innerHtml += '<span class="sysimg-btn-next canclick">';
            select_innerHtml += '</span>';
            select_innerHtml += '<ul style="position:absolute;left:35px;top:0px;width:' + (self.setting.sysImgArry.length * 90) + 'px;">';

            if (self.setting.sysImgArry.length > 0)
            {
                for (var i in self.setting.sysImgArry)
                {
                    select_innerHtml += '<li>';
                    select_innerHtml += '<img title="' + self.setting.sysImgArry[i].title + '" src="' + self.setting.path + self.setting.sysImgArry[i].src + '" />';
                    select_innerHtml += '<span></span>';
                    select_innerHtml += '</li>';
                }
            }

            select_innerHtml += '</ul>';
            select_innerHtml += '</div>';
            select_innerHtml += '</div>';
            select_innerHtml += '<div class="btn-tool-wrap">';
            select_innerHtml += '<button class="ml-btn ml-eft-default bg-red" disabled type="button">保存</button>';
            select_innerHtml += '<span class="save-tip-wrap"></span>';
            select_innerHtml += '</div>';
            select_innerHtml += '</div>';
            select_innerHtml += '<div class="wrap-s-right">';
            select_innerHtml += '<span class="sr-title">' + self.setting.typeTitle + '预览</span>';
            select_innerHtml += '<div class="sr-maximg">';
            select_innerHtml += '<div class="max-img-wrap">';
            select_innerHtml += '<img src="' + self.setting.path + self.setting.nowImgUrl + '" />';
            select_innerHtml += '</div>';
            select_innerHtml += '<span>大' + self.setting.typeTitle + '100*100</span>';
            select_innerHtml += '</div>';
            select_innerHtml += '<div class="sr-minimg">';
            select_innerHtml += '<div class="min-img-wrap">';
            select_innerHtml += '<img src="' + self.setting.path + self.setting.nowImgUrl + '" />';
            select_innerHtml += '</div>';
            select_innerHtml += '<span>小' + self.setting.typeTitle + '55*55</span>';
            select_innerHtml += '</div>';
            select_innerHtml += '<div class="sr-history-wrap">';
            select_innerHtml += '<span>';
            select_innerHtml += '我使用过的' + self.setting.typeTitle + '';
            select_innerHtml += '</span>';
            select_innerHtml += '<ul>';
            /*select_innerHtml += '<li>';
            select_innerHtml += '<img src="sysImg/headicon02-130.png" />';
            select_innerHtml += '<span></span>';
            select_innerHtml += '</li>';
            select_innerHtml += '<li class="visiHisHot">';
            select_innerHtml += '<img src="sysImg/female02-130.png" />';
            select_innerHtml += '<span></span>';
            select_innerHtml += '</li>';
            select_innerHtml += '<li>';
            select_innerHtml += '<img src="sysImg/male03-130.png" />';
            select_innerHtml += '<span></span>';
            select_innerHtml += '</li>';*/
            select_innerHtml += '</ul>';
            select_innerHtml += '</div>';
            select_innerHtml += '</div>';
            img_select_wrap.append(select_innerHtml);

            var clip_innerHtml='<div class="wrap-s-left">';
            clip_innerHtml += '<div class="img-workspace">';
            clip_innerHtml += '<div class="clip-img-wrap" style="width:302px;height:302px;position:absolute;left:50%;top:50%;margin-left:-151px;margin-top:-151px;">';
            clip_innerHtml += '<img src="' + self.setting.path + self.setting.nowImgUrl + '" />';
            clip_innerHtml += '<span class="bottom-shade">';
            clip_innerHtml += '</span>';
            clip_innerHtml += '<!--当需要拖拽改变位置大小的时候是在这里注册事件-->';
            clip_innerHtml += '<div class="drag-shade" style="left: 51px; top: 51px; width: 200px; height: 200px;">';
            clip_innerHtml += '<div class="blueborder"></div>';
            clip_innerHtml += '<div class="radiusborder"></div>';
            clip_innerHtml += '<div class="drag-shade-full">';
            clip_innerHtml += '<img src="' + self.setting.path + self.setting.nowImgUrl + '" style="width: 302px; height: 302px; border: none; margin: 0px; padding: 0px; position: absolute; left: -51px; top: -51px; "/>';
            clip_innerHtml += '<!--当拖拽的时候透明度需要加上样式opacity:0.25,松开后又去掉-->';
            clip_innerHtml += '<span class="center-shade">';
            clip_innerHtml += '</span>';
            clip_innerHtml += '</div>';
            clip_innerHtml += '<div class="drag-shade-full-radius">';
            clip_innerHtml += '<img src="' + self.setting.path + self.setting.nowImgUrl + '" style="width: 302px; height: 302px; border: none; margin: 0px; padding: 0px; position: absolute; left: -51px; top: -51px; " />';
            clip_innerHtml += '</div>';
            clip_innerHtml += '<!--拖拽显示框,8个正方形点，4条分隔线（横竖）-->';
            clip_innerHtml += '<span class="jcrop-handle tl" type="tl"></span>';
            clip_innerHtml += '<span class="jcrop-handle tc" type="tc"></span>';
            clip_innerHtml += '<span class="jcrop-handle tr" type="tr"></span>';

            clip_innerHtml += '<span class="jcrop-handle cl" type="cl"></span>';
            clip_innerHtml += '<span class="jcrop-handle cr" type="cr"></span>';

            clip_innerHtml += '<span class="jcrop-handle bl" type="bl"></span>';
            clip_innerHtml += '<span class="jcrop-handle bc" type="bc"></span>';
            clip_innerHtml += '<span class="jcrop-handle br" type="br"></span>';

            clip_innerHtml += '<span class="jcrop-dragbar l" type="l"></span>';
            clip_innerHtml += '<span class="jcrop-dragbar r" type="r"></span>';
            clip_innerHtml += '<span class="jcrop-dragbar t" type="t"></span>';
            clip_innerHtml += '<span class="jcrop-dragbar b" type="b"></span>';
            clip_innerHtml += '<!--虚线-->';
            clip_innerHtml += '<span class="jcrop-line v33"></span>';
            clip_innerHtml += '<span class="jcrop-line v33"></span>';
            clip_innerHtml += '<span class="jcrop-line v66"></span>';
            clip_innerHtml += '<span class="jcrop-line h33"></span>';
            clip_innerHtml += '<span class="jcrop-line h66"></span>';
            clip_innerHtml += '</div>';
            clip_innerHtml += '</div>';
            clip_innerHtml += '<div class="rotateAngle-left"></div><div class="rotateAngle-right"></div>';
            clip_innerHtml += '</div>';
            clip_innerHtml += '<div class="btn-tool-wrap">';
            clip_innerHtml += '<button class="ml-btn ml-eft-default bg-red" type="button">保存</button>';
            clip_innerHtml += '<button class="ml-btn ml-eft-default" type="button">重新选择</button>';
            clip_innerHtml += '</div>';
            clip_innerHtml += '</div>';
            clip_innerHtml += '<div class="wrap-s-right">';
            clip_innerHtml += '<span class="sr-title">' + self.setting.typeTitle + '预览</span>';
            clip_innerHtml += '<div class="sr-maximg">';
            clip_innerHtml += ' <div class="max-img-wrap">';
            clip_innerHtml += '<img src="' + self.setting.path + self.setting.nowImgUrl + '" />';
            clip_innerHtml += '</div>';
            clip_innerHtml += '<span>大' + self.setting.typeTitle + '100*100</span>';
            clip_innerHtml += '</div>';
            clip_innerHtml += '<div class="sr-minimg">';
            clip_innerHtml += '<div class="min-img-wrap">';
            clip_innerHtml += '<img src="' + self.setting.path + self.setting.nowImgUrl + '" />';
            clip_innerHtml += '</div>';
            clip_innerHtml += '<span>小' + self.setting.typeTitle + '55*55</span>';
            clip_innerHtml += '</div>';
            clip_innerHtml += '<div class="sr-history-wrap">';
            clip_innerHtml += '<span>';
            clip_innerHtml += '我使用过的' + self.setting.typeTitle + '';
            clip_innerHtml += '</span>';
            clip_innerHtml += '<ul>';
            /*clip_innerHtml += '<li>';
            clip_innerHtml += '<img src="sysImg/headicon02-130.png" />';
            clip_innerHtml += '<span></span>';
            clip_innerHtml += '</li>';
            clip_innerHtml += '<li class="visiHisHot">';
            clip_innerHtml += '<img src="sysImg/female02-130.png" />';
            clip_innerHtml += '<span></span>';
            clip_innerHtml += '</li>';
            clip_innerHtml += '<li>';
            clip_innerHtml += '<img src="sysImg/male03-130.png" />';
            clip_innerHtml += '<span></span>';
            clip_innerHtml += '</li>';*/
            clip_innerHtml += '</ul>';
            clip_innerHtml += '</div>';
            clip_innerHtml += '</div>';
            img_clip_wrap.append(clip_innerHtml);

            self.imgClipWrap.append(img_select_wrap).append(img_clip_wrap);
        },
        //重新加载历史图片
        initPCHistoryElement: function (self) {
            var myHistoryImgArry = self.getMyImgData(self, self.setting.pluginid);
            //最后循环更新界面我使用过的头像DOM
            if (myHistoryImgArry.length > 0) {
                //数组反排序
                myHistoryImgArry.reverse();
                var temporary_html = '';
                $.each(myHistoryImgArry, function (index, row) {
                    //设置每个图片，最多设置三个
                    if (index < 3){
                        temporary_html += '<li>';
                        temporary_html += '<img src="' + row.imgurl + '" title="' + row.title + '"/>';
                        temporary_html += '<span></span>';
                        temporary_html += '</li>';
                    }
                });
                if (temporary_html) {
                    self.imgClipWrap.find(".sr-history-wrap ul").empty().html(temporary_html);
                    self.initPCHistoryEvent(self);
                }
            } else {
                //清空我使用过的图片内容
                self.imgClipWrap.find(".sr-history-wrap ul").empty();
            }
        },
        //重新加载历史图片的事件
        initPCHistoryEvent: function (self)
        {
            var sysDomObj = {};
            sysDomObj.sysImgUl = self.imgClipWrap.find(".sys-img-wrap ul");
            sysDomObj.historyImgUl = self.imgClipWrap.find(".img-select-wrap .sr-history-wrap ul");
            sysDomObj.historyImgUl2 = self.imgClipWrap.find(".img-clip-wrap .sr-history-wrap ul");
            sysDomObj.selImgWrap = self.imgClipWrap.find(".img-select-wrap");
            sysDomObj.clipImgWrap = self.imgClipWrap.find(".img-clip-wrap");

            //历史选择图片
            sysDomObj.historyImgUl.find("li").click(function () {
                if ($(this).hasClass("visiHisHot")) {
                    return;
                }
                sysDomObj.sysImgUl.find("li").removeClass("visiHisHot");
                sysDomObj.historyImgUl.find("li").removeClass("visiHisHot");
                $(this).addClass("visiHisHot");
                self.setPreview(self, $(this).find("img").attr("src"), "hisimg");
            });

            //截图页面历史图片事件

            sysDomObj.historyImgUl2.find("li").click(function () {
                if ($(this).hasClass("visiHisHot")) {
                    return;
                }
                sysDomObj.historyImgUl.find("li").eq($(this).index()).click();
                //显示方案选择图
                sysDomObj.selImgWrap.show();
                sysDomObj.clipImgWrap.hide();
            });
        },
        //重新设置截图预览图显示
        setClipPreview: function (self) {
            //注册拖拽事件
            //首先注册拖动，只改变left和top的参数（通过计算框宽度和距离左边的距离来算出是否能继续拖动）
            var DomObj = {};
            //外层容器
            DomObj.BoxWrap = self.imgClipWrap.find(".drag-shade");//外层盒子
            DomObj.ClipPreview = self.imgClipWrap.find(".img-clip-wrap").find(".wrap-s-right");//预览图

            //100的比例
            var MultipleW100 = 100 / DomObj.BoxWrap.width();
            //50的比例
            var MultipleW55 = 55 / DomObj.BoxWrap.width();
            //console.log(MultipleW100 + "1" + MultipleW50)
            var w100_width = MultipleW100 * DomObj.BoxWrap.parent().width();
            var w100_left = MultipleW100 * parseInt(DomObj.BoxWrap.css("left"));
            var w100_top = MultipleW100 * parseInt(DomObj.BoxWrap.css("top"));
            var w55_width = MultipleW55 * DomObj.BoxWrap.parent().width();
            var w55_left = MultipleW55 * parseInt(DomObj.BoxWrap.css("left"));
            var w55_top = MultipleW55 * parseInt(DomObj.BoxWrap.css("top"));



            if (self.clipImgInfo.rotateAngle == 90 || self.clipImgInfo.rotateAngle == 270) {
                //根据缩小比例调整
                if (self.clipImgInfo.imgHeight >= self.clipImgInfo.imgWidth) {
                    DomObj.ClipPreview.find(".max-img-wrap").find("img").attr("style", "height:" + w100_width + "px;margin-left:-" + (Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) * MultipleW100 + w100_left) + "px;margin-top:" + (((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) * MultipleW100 - w100_top) + "px");
                    DomObj.ClipPreview.find(".min-img-wrap").find("img").attr("style", "height:" + w55_width + "px;margin-left:-" + (Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) * MultipleW55 + w55_left) + "px;margin-top:" + (((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) * MultipleW55 - w55_top) + "px");
                } else {
                    DomObj.ClipPreview.find(".max-img-wrap").find("img").attr("style", "height:" + w100_width + "px;margin-left:" + (Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) * MultipleW100 - w100_left) + "px;margin-top:" + (((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) * MultipleW100 - w100_top) + "px");
                    DomObj.ClipPreview.find(".min-img-wrap").find("img").attr("style", "height:" + w55_width + "px;margin-left:" + (Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) * MultipleW55 - w55_left) + "px;margin-top:" + (((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) * MultipleW55 - w55_top) + "px");
                }

            } else {
                DomObj.ClipPreview.find(".max-img-wrap").find("img").attr("style", "width:" + w100_width + "px;margin-left:-" + w100_left + "px;margin-top:-" + w100_top + "px");
                DomObj.ClipPreview.find(".min-img-wrap").find("img").attr("style", "width:" + w55_width + "px;margin-left:-" + w55_left + "px;margin-top:-" + w55_top + "px");
            }

        },
        //设置预览图
        setPreview: function (self, imgurl, imgtype)
        {
            var sysDomObj = {};
            sysDomObj.previewMaxImg = self.imgClipWrap.find(".img-select-wrap .max-img-wrap img");
            sysDomObj.previewMinImg = self.imgClipWrap.find(".img-select-wrap .min-img-wrap img");
            sysDomObj.selSaveBtn = self.imgClipWrap.find(".img-select-wrap .btn-tool-wrap button");
            self.selImgUrl = imgurl;
            self.selImgType = imgtype;
            sysDomObj.previewMaxImg.attr("src", imgurl);
            sysDomObj.previewMinImg.attr("src", imgurl);
            //按钮可保存了
            sysDomObj.selSaveBtn.removeAttr("disabled");
        },
        //记录(set)我使用过的图片数据
        setMyImgData: function (self, recordKey, recordValue) {
            //同样判断是否支持localStorage缓存
            if (self.isSupportH5localStorage()) {
                //支持h5缓存
                if (!window.localStorage[recordKey]) {
                    window.localStorage[recordKey] = "[" + JSON.stringify(recordValue) + "]";
                } else {
                    var ls_arry = [];
                    var ls_p = JSON.parse(window.localStorage[recordKey]);
                    $.each(ls_p, function (index, row) {
                        ls_arry.push(row);
                    });
                    ls_arry.push(recordValue);
                    window.localStorage[recordKey] = JSON.stringify(ls_arry);
                }
            } else {
                //使用cookie缓存
                if (!self.getCookie(recordKey)) {
                    self.setCookie(recordKey, "[" + JSON.stringify(recordValue) + "]", 3650);
                } else {
                    var ls_arry = [];
                    var ls_p = JSON.parse(self.getCookie(recordKey));
                    $.each(ls_p, function (index, row) {
                        ls_arry.push(row);
                    });
                    ls_arry.push(recordValue);
                    self.setCookie(recordKey, JSON.stringify(ls_arry), 3650);
                }
            }
        },
        //获取(get)我使用过的图片缓存数据
        getMyImgData: function (self, recordKey)
        {
            //同样判断是否支持localStorage缓存
            if (self.isSupportH5localStorage()) {
                //支持h5缓存
                return JSON.parse(window.localStorage[recordKey]);
            } else {
                //使用cookie缓存
                return JSON.parse(self.getCookie(recordKey));
            }
        },
        //判断是否支持H5localstorage缓存方式
        isSupportH5localStorage: function () {
            try {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
        },
        //上传图片事件
        initPCUpimgEvent: function () {
            var self = this;
            self.imgClipWrap.find(".img-select-wrap .upload-btn-wrap input").change(function () {
                var file = this.files[0];
                //console.log(file);
                //判断类型是不是图片  
                if (!/image\/\w+/.test(file.type)) {
                    alert("请选择图像类型文件");
                    return false;
                }
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function (e) {
                    image_base64 = this.result.split(",")[1];
                    if (self.setting.uploadOriginalFun) {
                        //外置上传图片方法
                        self.setting.uploadOriginalFun(image_base64, file.name, function (imgpath) {
                            self.upimgSucceedEvent(self, imgpath);
                        });
                    } else {
                        //使用内置上传图片方法

                        //上传成功调用
                        if (self.setting.uploadOriginalSucceed) {
                            self.setting.uploadOriginalSucceed(self.setting.uploadImgFilePath + file.name);
                        }
                        self.upimgSucceedEvent(self, self.setting.uploadImgFilePath + file.name);

                        //如果上传失败调用
                        if (false)
                        {
                            if (self.setting.uploadOriginalError)
                            {
                                self.setting.uploadOriginalError("传递错误信息");
                            }
                        }
                    }
                }
            });
            self.imgClipWrap.find(".img-select-wrap .upload-btn-wrap button").click(function () {
                //这里做上传图片
                self.imgClipWrap.find(".img-select-wrap .upload-btn-wrap input").click();
            });
        },
        //图片上传成功调用事件
        upimgSucceedEvent: function (self, clipImgSrc) {
            //加载图片大小
            var DomObj = {};
            DomObj.ClipWrap = self.imgClipWrap.find(".clip-img-wrap");
            DomObj.MaxPreview = self.imgClipWrap.find(".max-img-wrap").find("img");
            DomObj.MinPreview = self.imgClipWrap.find(".min-img-wrap").find("img");
            //更改图片路径
            DomObj.ClipWrap.find("img").attr("src", self.setting.path + clipImgSrc);
            DomObj.MaxPreview.attr("src", self.setting.path + clipImgSrc);
            DomObj.MinPreview.attr("src", self.setting.path + clipImgSrc);

            DomObj.ClipWrap.find("img").removeClass("rotateAngle-90").removeClass("rotateAngle-180").removeClass("rotateAngle-270");
            DomObj.MaxPreview.removeClass("rotateAngle-90").removeClass("rotateAngle-180").removeClass("rotateAngle-270");
            DomObj.MinPreview.removeClass("rotateAngle-90").removeClass("rotateAngle-180").removeClass("rotateAngle-270");
            //获取图片大小
            //容器最大值（宽420*高302）
            //比例值
            var wrapRatio = 420 / 302;
            var newImgObj = { width: 420, height: 302 };
            var img = new Image();
            img.src = self.setting.path + clipImgSrc;
            img.onload = function () {
                if (img.width <= 420 && img.height <= 302)
                {
                    //图片宽度和高度还没超过容器
                    //直接使用实际宽度和高度了
                    newImgObj.width = img.width;
                    newImgObj.height = img.height;
                } else if (img.width / img.height >= wrapRatio) {
                    //按照缩放比例的话宽度超过容器范围
                    var widthRatio = img.width / 420;
                    newImgObj.width = 420;
                    newImgObj.height = parseInt(img.height / widthRatio);
                } else {
                    //按照缩放比例的话高度超过容器范围
                    var heightRatio = img.height / 302;
                    newImgObj.width = parseInt(img.width / heightRatio);
                    newImgObj.height = 302;
                }

                //大小初始化
                DomObj.ClipWrap.attr("style", "width: " + newImgObj.width + "px; height: " + newImgObj.height + "px; position: absolute; left: 50%; top: 50%; margin-left: -" + newImgObj.width / 2 + "px; margin-top: -" + newImgObj.height / 2 + "px;");
                //设置最底层图片大小
                DomObj.ClipWrap.find("img").eq(0).attr("style", "width: " + newImgObj.width + "px; height: " + newImgObj.height + "px;");
                //设置裁剪区域大小，最大不超过200，并且不能超过图片的宽高最小值
                var clipWidth = 200;
                if (newImgObj.width < 200 || newImgObj.height < 200)
                {
                    clipWidth = newImgObj.width > newImgObj.height ? newImgObj.height : newImgObj.width;
                }
                DomObj.ClipWrap.find(".drag-shade").attr("style", "left: " + (newImgObj.width - clipWidth) / 2 + "px; top: " + (newImgObj.height - clipWidth) / 2 + "px; width: " + clipWidth + "px; height: " + clipWidth + "px;");

                DomObj.ClipWrap.find(".drag-shade img").attr("style", "width: " + newImgObj.width + "px; height:  " + newImgObj.height + "px; border: none; margin: 0px; padding: 0px; position: absolute; left: -" + (newImgObj.width - clipWidth) / 2 + "px; top: -" + (newImgObj.height - clipWidth) / 2 + "px;");

                self.imgClipWrap.find(".img-select-wrap").hide();
                self.imgClipWrap.find(".img-clip-wrap").show();

                //图片加载完成，记录图片宽高，裁剪框宽高，裁剪框在图片上的左上角坐标
                self.clipImgInfo = {};
                self.clipImgInfo.imgSrc = clipImgSrc;
                self.clipImgInfo.imgWidth = newImgObj.width;
                self.clipImgInfo.imgHeight = newImgObj.height;
                self.clipImgInfo.clipWidth = clipWidth;
                self.clipImgInfo.clipHeight = clipWidth;
                self.clipImgInfo.x = parseInt((newImgObj.width - clipWidth) / 2);
                self.clipImgInfo.y = parseInt((newImgObj.height - clipWidth) / 2);
                //旋转角度(只记录顺时针的)
                self.clipImgInfo.rotateAngle = 0;
                self.initClipImgEvent(self);
            }

        },
        //注册裁剪事件
        initClipImgEvent: function (self) {

            //注册拖拽事件
            //首先注册拖动，只改变left和top的参数（通过计算框宽度和距离左边的距离来算出是否能继续拖动）
            var DomObj = {};
            //外层容器
            DomObj.BoxWrap = self.imgClipWrap.find(".drag-shade");//外层盒子
            DomObj.SquareImgDom = DomObj.BoxWrap.find(".drag-shade-full").find("img");//正方形里面的图片
            DomObj.SquareShadeDom = DomObj.BoxWrap.find(".drag-shade-full").find(".center-shade");//正方形里面的遮罩层
            DomObj.RoundImgDom = DomObj.BoxWrap.find(".drag-shade-full-radius").find("img");//圆形里面的图片
            DomObj.PointDom = DomObj.BoxWrap.find(".jcrop-handle");//点
            DomObj.LineDom = DomObj.BoxWrap.find(".jcrop-dragbar");//线
            DomObj.ClipPreview = self.imgClipWrap.find(".img-clip-wrap").find(".wrap-s-right");//预览图

            var ifBool = false;//判断鼠标是否按下
            var contact = "";//当前触点
            //上一个鼠标的位置
            var prevMousePosition = {};
            prevMousePosition.parentW = DomObj.BoxWrap.parent().width();//父容器的宽度
            prevMousePosition.parentH = DomObj.BoxWrap.parent().height();//父容器的高度

            DomObj.BoxWrap.mousedown(function (e) {
                e.stopPropagation();
                prevMousePosition.x = 0;
                prevMousePosition.y = 0;
                prevMousePosition.w = DomObj.BoxWrap.width();//容器的宽度
                prevMousePosition.h = DomObj.BoxWrap.height();//容器的高度
                contact = "move";
                ifBool = true;
            });
            //线条
            DomObj.LineDom.mousedown(function (e) {
                e.stopPropagation();
                prevMousePosition.x = 0;
                prevMousePosition.y = 0;
                contact = $(this).attr("type");
                ifBool = true;
            });
            //点
            DomObj.PointDom.mousedown(function (e) {
                e.stopPropagation();
                prevMousePosition.x = 0;
                prevMousePosition.y = 0;
                contact = $(this).attr("type");
                ifBool = true;
            });
            //拖动改变大小注意反向变负数问题
            //类型：左下和右上是单独的两种类型
            window.onmousemove = function (e) {
                if (ifBool) {
                    var xx = e.screenX || 0;
                    var yy = e.screenY || 0;
                    switch (contact) {
                        //移动裁剪框
                        case "move":
                            var box_left = (parseFloat(DomObj.BoxWrap.css("left")) + (xx - prevMousePosition.x));
                            if (prevMousePosition.x && xx != prevMousePosition.x && prevMousePosition.parentW > prevMousePosition.w && prevMousePosition.parentW > prevMousePosition.w && prevMousePosition.parentW >= prevMousePosition.w + box_left) {
                                //当前box_left+当前元素宽度不能大于父元素的宽度，否则就等于父元素的宽度-当前元素的宽度
                                if ((parseFloat(DomObj.BoxWrap.css("left")) == 0 && xx > prevMousePosition.x) || (parseFloat(DomObj.BoxWrap.css("left")) > 0 && box_left + prevMousePosition.w <= prevMousePosition.parentW)) {
                                    if (self.clipImgInfo.rotateAngle == 90 || self.clipImgInfo.rotateAngle == 270) {
                                        //横向
                                        if (self.clipImgInfo.imgHeight >= self.clipImgInfo.imgWidth) {
                                            DomObj.RoundImgDom.css("left", -(Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) + (box_left < 0 ? 0 : box_left)) + "px");
                                            DomObj.SquareImgDom.css("left", -(Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) + (box_left < 0 ? 0 : box_left)) + "px");
                                        } else {
                                            DomObj.RoundImgDom.css("left", (Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) - (box_left < 0 ? 0 : box_left)) + "px");
                                            DomObj.SquareImgDom.css("left", (Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) - (box_left < 0 ? 0 : box_left)) + "px");
                                        }
                                    } else {
                                        //竖向
                                        DomObj.RoundImgDom.css("left", -(box_left < 0 ? 0 : box_left) + "px");
                                        DomObj.SquareImgDom.css("left", -(box_left < 0 ? 0 : box_left) + "px");
                                    }
                                    DomObj.BoxWrap.css("left", box_left < 0 ? 0 : box_left + "px");
                                    DomObj.SquareShadeDom.attr("style", "opacity:0.25");
                                }
                            }
                            var box_top = (parseFloat(DomObj.BoxWrap.css("top")) + (yy - prevMousePosition.y));
                            if (prevMousePosition.y && yy != prevMousePosition.y && prevMousePosition.parentH > prevMousePosition.h && prevMousePosition.parentH >= prevMousePosition.h + box_top) {
                                //当前box_top+当前元素高度不能大于父元素的高度，否则就等于父元素的高度-当前元素的高度
                                if ((parseFloat(DomObj.BoxWrap.css("top")) == 0 && yy > prevMousePosition.y) || (parseFloat(DomObj.BoxWrap.css("top")) > 0 && box_top + prevMousePosition.h <= prevMousePosition.parentH)) {
                                    //最少距离为图片的宽度减去高度
                                    if (self.clipImgInfo.rotateAngle == 90 || self.clipImgInfo.rotateAngle == 270) {
                                        //横向
                                        DomObj.RoundImgDom.css("top", ((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) - (box_top < 0 ? 0 : box_top) + "px");
                                        DomObj.SquareImgDom.css("top", ((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) - (box_top < 0 ? 0 : box_top) + "px");
                                    } else {
                                        //竖向
                                        DomObj.RoundImgDom.css("top", -(box_top < 0 ? 0 : box_top) + "px");
                                        DomObj.SquareImgDom.css("top", -(box_top < 0 ? 0 : box_top) + "px");
                                    }
                                    DomObj.BoxWrap.css("top", box_top < 0 ? 0 : box_top + "px");
                                    DomObj.SquareShadeDom.attr("style", "opacity:0.25");
                                }
                            }

                            //console.log(getPosition(DomObj.BoxWrap));
                            break;
                        case "l":
                        case "t":
                        case "tl":
                        case "tc":
                        case "cl":
                            //如果是拖动的右边和底部的则使用移动值最大的轴向作为宽度和高度的更改
                            if ((prevMousePosition.x && xx != prevMousePosition.x) || (prevMousePosition.y && yy != prevMousePosition.y)) {
                                var box_width = DomObj.BoxWrap.width();
                                var box_height = DomObj.BoxWrap.height();
                                var box_left = (parseFloat(DomObj.BoxWrap.css("left")) + (xx - prevMousePosition.x));
                                var box_top = (parseFloat(DomObj.BoxWrap.css("top")) + (yy - prevMousePosition.y));
                                if (Math.abs(xx - prevMousePosition.x) >= Math.abs(yy - prevMousePosition.y)) {
                                    //x轴移动值最大
                                    box_width -= (xx - prevMousePosition.x);
                                    box_height -= (xx - prevMousePosition.x);
                                    box_top = (parseFloat(DomObj.BoxWrap.css("top")) + (xx - prevMousePosition.x));
                                } else {
                                    //y轴移动值最大
                                    box_width -= (yy - prevMousePosition.y);
                                    box_height -= (yy - prevMousePosition.y);
                                    box_left = (parseFloat(DomObj.BoxWrap.css("left")) + (yy - prevMousePosition.y));
                                }
                                if (box_top >= 0 && box_left >= 0 && box_width > 0) {

                                    if (self.clipImgInfo.rotateAngle == 90 || self.clipImgInfo.rotateAngle == 270) {
                                        //横向
                                        if (self.clipImgInfo.imgHeight >= self.clipImgInfo.imgWidth) {
                                            DomObj.RoundImgDom.css("left", -(Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) + (box_left < 0 ? 0 : box_left)) + "px");
                                            DomObj.SquareImgDom.css("left", -(Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) + (box_left < 0 ? 0 : box_left)) + "px");
                                        } else {
                                            DomObj.RoundImgDom.css("left", (Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) - (box_left < 0 ? 0 : box_left)) + "px");
                                            DomObj.SquareImgDom.css("left", (Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) - (box_left < 0 ? 0 : box_left)) + "px");
                                        }

                                        DomObj.RoundImgDom.css("top", ((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) - (box_top < 0 ? 0 : box_top) + "px");
                                        DomObj.SquareImgDom.css("top", ((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) - (box_top < 0 ? 0 : box_top) + "px");

                                    } else {
                                        //竖向
                                        DomObj.RoundImgDom.css("top", -(box_top < 0 ? 0 : box_top) + "px").css("left", -(box_left < 0 ? 0 : box_left) + "px");
                                        DomObj.SquareImgDom.css("top", -(box_top < 0 ? 0 : box_top) + "px").css("left", -(box_left < 0 ? 0 : box_left) + "px");
                                    }
                                    DomObj.BoxWrap.css("top", box_top < 0 ? 0 : box_top + "px").css("left", box_left < 0 ? 0 : box_left + "px");
                                }
                                //设置宽度和高度的时候注意是否到了边缘
                                if (box_top >= 0 && box_left >= 0)
                                    DomObj.BoxWrap.css("width", box_width + "px").css("height", box_height + "px");
                            }
                            break;
                        case "r":
                        case "b":
                        case "cr"://中间右边的点一样的动作
                        case "bc"://底部中间的点一样的动作
                        case "br"://底部右边的点一样的动作
                            //如果是拖动的右边和底部的则使用移动值最大的轴向作为宽度和高度的更改
                            if ((prevMousePosition.x && xx != prevMousePosition.x) || (prevMousePosition.y && yy != prevMousePosition.y)) {
                                var box_width = DomObj.BoxWrap.width();
                                var box_height = DomObj.BoxWrap.height();
                                var box_left = parseFloat(DomObj.BoxWrap.css("left"));
                                var box_top = parseFloat(DomObj.BoxWrap.css("top"));
                                if (Math.abs(xx - prevMousePosition.x) >= Math.abs(yy - prevMousePosition.y)) {
                                    //x轴移动值最大
                                    box_width += (xx - prevMousePosition.x);
                                    box_height += (xx - prevMousePosition.x);
                                } else {
                                    //y轴移动值最大
                                    box_width += (yy - prevMousePosition.y);
                                    box_height += (yy - prevMousePosition.y);
                                }
                                //设置宽度和高度的时候注意是否到了边缘
                                if (box_width + box_left <= prevMousePosition.parentW && box_height + box_top <= prevMousePosition.parentH)
                                    DomObj.BoxWrap.css("width", box_width + "px").css("height", box_height + "px");
                            }
                            break;

                        case "tr":
                            if ((prevMousePosition.x && xx != prevMousePosition.x) || (prevMousePosition.y && yy != prevMousePosition.y)) {
                                var box_width = DomObj.BoxWrap.width();
                                var box_height = DomObj.BoxWrap.height();
                                var box_left = parseFloat(DomObj.BoxWrap.css("left"));
                                var box_top = (parseFloat(DomObj.BoxWrap.css("top")) - (yy - prevMousePosition.y));
                                if (Math.abs(xx - prevMousePosition.x) >= Math.abs(yy - prevMousePosition.y)) {
                                    //x轴移动值最大
                                    box_width -= (prevMousePosition.x - xx);
                                    box_height -= (prevMousePosition.x - xx);
                                    box_top = (parseFloat(DomObj.BoxWrap.css("top")) + (prevMousePosition.x - xx));
                                } else {
                                    //y轴移动值最大

                                    box_width -= (yy - prevMousePosition.y);
                                    box_height -= (yy - prevMousePosition.y);
                                    box_top = (parseFloat(DomObj.BoxWrap.css("top")) + (yy - prevMousePosition.y));
                                }
                                if (box_top >= 0 && box_left >= 0 && box_width + box_left <= prevMousePosition.parentW && box_width > 0) {

                                    if (self.clipImgInfo.rotateAngle == 90 || self.clipImgInfo.rotateAngle == 270) {
                                        //横向
                                        DomObj.RoundImgDom.css("top", ((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) - (box_top < 0 ? 0 : box_top) + "px");
                                        DomObj.SquareImgDom.css("top", ((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) - (box_top < 0 ? 0 : box_top) + "px");
                                    } else {
                                        //竖向
                                        DomObj.RoundImgDom.css("top", -(box_top < 0 ? 0 : box_top) + "px");
                                        DomObj.SquareImgDom.css("top", -(box_top < 0 ? 0 : box_top) + "px");
                                    }
                                    DomObj.BoxWrap.css("top", box_top < 0 ? 0 : box_top + "px");
                                }
                                //设置宽度和高度的时候注意是否到了边缘
                                if (box_top >= 0 && box_left >= 0 && box_width + box_left <= prevMousePosition.parentW)
                                    DomObj.BoxWrap.css("width", box_width + "px").css("height", box_height + "px");
                            }
                            break;
                        case "bl":
                            if ((prevMousePosition.x && xx != prevMousePosition.x) || (prevMousePosition.y && yy != prevMousePosition.y)) {
                                var box_width = DomObj.BoxWrap.width();
                                var box_height = DomObj.BoxWrap.height();
                                var box_left = (parseFloat(DomObj.BoxWrap.css("left")) - (xx - prevMousePosition.x));
                                var box_top = parseFloat(DomObj.BoxWrap.css("top"));
                                if (Math.abs(xx - prevMousePosition.x) >= Math.abs(yy - prevMousePosition.y)) {
                                    //x轴移动值最大
                                    box_width += (prevMousePosition.x - xx);
                                    box_height += (prevMousePosition.x - xx);
                                    box_left = (parseFloat(DomObj.BoxWrap.css("left")) - (prevMousePosition.x - xx));
                                } else {
                                    //y轴移动值最大

                                    box_width += (yy - prevMousePosition.y);
                                    box_height += (yy - prevMousePosition.y);
                                    box_left = (parseFloat(DomObj.BoxWrap.css("left")) - (yy - prevMousePosition.y));
                                }
                                if (box_top >= 0 && box_left >= 0 && box_height + box_top <= prevMousePosition.parentH && box_width > 0) {

                                    if (self.clipImgInfo.rotateAngle == 90 || self.clipImgInfo.rotateAngle == 270) {
                                        //横向
                                        if (self.clipImgInfo.imgHeight >= self.clipImgInfo.imgWidth) {
                                            DomObj.RoundImgDom.css("left", -(Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) + (box_left < 0 ? 0 : box_left)) + "px");
                                            DomObj.SquareImgDom.css("left", -(Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) + (box_left < 0 ? 0 : box_left)) + "px");
                                        } else {
                                            DomObj.RoundImgDom.css("left", (Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) - (box_left < 0 ? 0 : box_left)) + "px");
                                            DomObj.SquareImgDom.css("left", (Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) - (box_left < 0 ? 0 : box_left)) + "px");
                                        }
                                    } else {
                                        //竖向
                                        DomObj.RoundImgDom.css("left", -(box_left < 0 ? 0 : box_left) + "px");
                                        DomObj.SquareImgDom.css("left", -(box_left < 0 ? 0 : box_left) + "px");
                                    }
                                    DomObj.BoxWrap.css("left", box_left < 0 ? 0 : box_left + "px");
                                }
                                //设置宽度和高度的时候注意是否到了边缘
                                if (box_top >= 0 && box_left >= 0 && box_height + box_top <= prevMousePosition.parentH)
                                    DomObj.BoxWrap.css("width", box_width + "px").css("height", box_height + "px");
                            }
                            break;
                    }
                    prevMousePosition.x = xx;
                    prevMousePosition.y = yy;
                    setChoice();
                }
            };
            //鼠标松开
            window.onmouseup = function (e) {
                ifBool = false;
                contact = "";
                DomObj.SquareShadeDom.removeAttr("style");
            };

            //获取元素的相对位置
            function getPosition(node) {
                var left = node.position().left;
                var top = node.position().top;
                return { "left": left, "top": top };
            }
            setChoice();

            //设置右边显示的
            function setChoice() {

                if (!self.clipImgInfo) {
                    self.clipImgInfo = {};
                    //旋转角度(只记录顺时针的)
                    self.clipImgInfo.rotateAngle = 0;
                }
                //100的比例
                var MultipleW100 = 100 / DomObj.BoxWrap.width();
                //50的比例
                var MultipleW55 = 55 / DomObj.BoxWrap.width();
                var w100_width = MultipleW100 * DomObj.BoxWrap.parent().width();
                var w100_left = MultipleW100 * parseInt(DomObj.BoxWrap.css("left"));
                var w100_top = MultipleW100 * parseInt(DomObj.BoxWrap.css("top"));

                var w55_width = MultipleW55 * DomObj.BoxWrap.parent().width();
                var w55_left = MultipleW55 * parseInt(DomObj.BoxWrap.css("left"));
                var w55_top = MultipleW55 * parseInt(DomObj.BoxWrap.css("top"));
                if (self.clipImgInfo.rotateAngle == 90 || self.clipImgInfo.rotateAngle == 270) {
                    //根据缩小比例调整
                    if (self.clipImgInfo.imgHeight >= self.clipImgInfo.imgWidth) {
                        DomObj.ClipPreview.find(".max-img-wrap").find("img").attr("style", "height:" + w100_width + "px;margin-left:-" + (Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) * MultipleW100 + w100_left) + "px;margin-top:" + (((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) * MultipleW100 - w100_top) + "px");
                        DomObj.ClipPreview.find(".min-img-wrap").find("img").attr("style", "height:" + w55_width + "px;margin-left:-" + (Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) * MultipleW55 + w55_left) + "px;margin-top:" + (((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) * MultipleW55 - w55_top) + "px");
                    } else {
                        DomObj.ClipPreview.find(".max-img-wrap").find("img").attr("style", "height:" + w100_width + "px;margin-left:" + (Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) * MultipleW100 - w100_left) + "px;margin-top:" + (((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) * MultipleW100 - w100_top) + "px");
                        DomObj.ClipPreview.find(".min-img-wrap").find("img").attr("style", "height:" + w55_width + "px;margin-left:" + (Math.abs((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) * MultipleW55 - w55_left) + "px;margin-top:" + (((self.clipImgInfo.imgHeight - self.clipImgInfo.imgWidth) / 2) * MultipleW55 - w55_top) + "px");
                    }

                } else {
                    DomObj.ClipPreview.find(".max-img-wrap").find("img").attr("style", "width:" + w100_width + "px;margin-left:-" + w100_left + "px;margin-top:-" + w100_top + "px");
                    DomObj.ClipPreview.find(".min-img-wrap").find("img").attr("style", "width:" + w55_width + "px;margin-left:-" + w55_left + "px;margin-top:-" + w55_top + "px");
                }

                self.clipImgInfo.clipWidth = parseInt(DomObj.BoxWrap.width());
                self.clipImgInfo.clipHeight = parseInt(DomObj.BoxWrap.width());
                self.clipImgInfo.x = parseInt(DomObj.BoxWrap.css("left"));
                self.clipImgInfo.y = parseInt(DomObj.BoxWrap.css("top"));
                console.log(self.clipImgInfo);
            }
        },
        //旋转事件(记录旋转状态，-90代表向左旋转，90代表向右旋转)
        rotateImgEvent: function (self, changeAngle) {
            //更改完后需要重新加载图片改变事件
            self.clipImgInfo.rotateAngle += changeAngle;
            if (self.clipImgInfo.rotateAngle >= 360)
            {
                self.clipImgInfo.rotateAngle = self.clipImgInfo.rotateAngle - 360;
            } else if (self.clipImgInfo.rotateAngle < 0)
            {
                self.clipImgInfo.rotateAngle = 360 + self.clipImgInfo.rotateAngle;
            }
            //给图片和插件重新计算和赋值(当旋转角度为180时不需要width和height对换)


            //加载图片大小
            var DomObj = {};
            DomObj.ClipWrap = self.imgClipWrap.find(".clip-img-wrap");
            DomObj.MaxPreview = self.imgClipWrap.find(".max-img-wrap").find("img");
            DomObj.MinPreview = self.imgClipWrap.find(".min-img-wrap").find("img");
            //更改图片旋转角度
            DomObj.ClipWrap.find("img").removeClass("rotateAngle-90").removeClass("rotateAngle-180").removeClass("rotateAngle-270");
            DomObj.MaxPreview.removeClass("rotateAngle-90").removeClass("rotateAngle-180").removeClass("rotateAngle-270");
            DomObj.MinPreview.removeClass("rotateAngle-90").removeClass("rotateAngle-180").removeClass("rotateAngle-270");
            if (self.clipImgInfo.rotateAngle > 0) {
                DomObj.ClipWrap.find("img").addClass("rotateAngle-" + self.clipImgInfo.rotateAngle + "");
                DomObj.MaxPreview.addClass("rotateAngle-" + self.clipImgInfo.rotateAngle + "");
                DomObj.MinPreview.addClass("rotateAngle-" + self.clipImgInfo.rotateAngle + "");
            }
            //获取图片大小
            //容器最大值（宽420*高302）
            //比例值
            var wrapRatio = 420 / 302;
            var newImgObj = { width: 420, height: 302 };
            var img = new Image();
            img.src = self.setting.path + self.clipImgInfo.imgSrc;
            img.onload = function () {
                var rotateImg = {};
                rotateImg.width = img.width;
                rotateImg.height = img.height;
                if (self.clipImgInfo.rotateAngle == 90 || self.clipImgInfo.rotateAngle == 270) {
                    rotateImg.width = img.height;
                    rotateImg.height = img.width;
                }
                //如果为90和270，则图片的宽度和高度对调
                if (rotateImg.width <= 420 && rotateImg.height <= 302) {
                    //图片宽度和高度还没超过容器
                    //直接使用实际宽度和高度了
                    newImgObj.width = rotateImg.width;
                    newImgObj.height = rotateImg.height;
                } else if (rotateImg.width / rotateImg.height >= wrapRatio) {
                    //按照缩放比例的话宽度超过容器范围
                    var widthRatio = rotateImg.width / 420;
                    newImgObj.width = 420;
                    newImgObj.height = parseInt(rotateImg.height / widthRatio);
                } else {
                    //按照缩放比例的话高度超过容器范围
                    var heightRatio = rotateImg.height / 302;
                    newImgObj.width = parseInt(rotateImg.width / heightRatio);
                    newImgObj.height = 302;
                }
                //图片的宽高
                var imgWH = {};
                imgWH.width = img.width;
                imgWH.height = img.height;
                //显示图片的宽高
                var showImgWH = { width: 420, height: 302 };
                //宽280，高462；
                if (self.clipImgInfo.rotateAngle == 90 || self.clipImgInfo.rotateAngle == 270) {
                    if (imgWH.height <= 420 && imgWH.width <= 302) {
                        //图片宽度和高度还没超过容器
                        //直接使用实际宽度和高度了
                        showImgWH.width = imgWH.width;
                        showImgWH.height = imgWH.height;
                    } else if (imgWH.height / imgWH.width >= wrapRatio) {
                        //按照缩放比例的话宽度超过容器范围
                        var widthRatio = imgWH.height / 420;
                        showImgWH.height = 420;
                        showImgWH.width = parseInt(imgWH.width / widthRatio);
                    } else {
                        //按照缩放比例的话高度超过容器范围
                        var heightRatio = imgWH.width / 302;
                        showImgWH.height = parseInt(imgWH.height / heightRatio);
                        showImgWH.width = 302;
                    }
                } else {
                    showImgWH.width = newImgObj.width;
                    showImgWH.height = newImgObj.height;
                }

                //大小初始化
                DomObj.ClipWrap.attr("style", "width: " + newImgObj.width + "px; height: " + newImgObj.height + "px; position: absolute; left: 50%; top: 50%; margin-left: -" + newImgObj.width / 2 + "px; margin-top: -" + newImgObj.height / 2 + "px;");
                //设置最底层图片大小
                DomObj.ClipWrap.find("img").eq(0).attr("style", "width: " + showImgWH.width + "px; height: " + showImgWH.height + "px;");
                if (self.clipImgInfo.rotateAngle == 90 || self.clipImgInfo.rotateAngle == 270)
                {
                    DomObj.ClipWrap.find("img").eq(0).attr("style", "position: absolute;left:50%;top:50%; width: " + showImgWH.width + "px; height: " + showImgWH.height + "px;margin-left: -" + showImgWH.width / 2 + "px; margin-top: -" + showImgWH.height / 2 + "px;");
                }
                //设置裁剪区域大小，最大不超过200，并且不能超过图片的宽高最小值
                var clipWidth = 200;
                if (newImgObj.width < 200 || newImgObj.height < 200) {
                    clipWidth = newImgObj.width > newImgObj.height ? newImgObj.height : newImgObj.width;
                }
                DomObj.ClipWrap.find(".drag-shade").attr("style", "left: " + (newImgObj.width - clipWidth) / 2 + "px; top: " + (newImgObj.height - clipWidth) / 2 + "px; width: " + clipWidth + "px; height: " + clipWidth + "px;");

                DomObj.ClipWrap.find(".drag-shade img").attr("style", "width: " + showImgWH.width + "px; height:  " + showImgWH.height + "px; border: none; margin: 0px; padding: 0px; position: absolute; left: -" + (showImgWH.width - clipWidth) / 2 + "px; top: -" + (showImgWH.height - clipWidth) / 2 + "px;");


                //图片加载完成，记录图片宽高，裁剪框宽高，裁剪框在图片上的左上角坐标
                //注意：后台处理一定是先旋转原图然后再缩放，最后再裁剪
                self.clipImgInfo.imgWidth = newImgObj.width;
                self.clipImgInfo.imgHeight = newImgObj.height;
                self.clipImgInfo.clipWidth = clipWidth;
                self.clipImgInfo.clipHeight = clipWidth;
                self.clipImgInfo.x = parseInt((newImgObj.width - clipWidth) / 2);
                self.clipImgInfo.y = parseInt((newImgObj.height - clipWidth) / 2);
                //console.log(self.clipImgInfo);
                self.initClipImgEvent(self);
            }

        },
        //加载Mobile版
        initMobileElement: function () {
            var self = this;
            if (self.setting.uploadOriginalSucceed) {
                self.setting.uploadOriginalSucceed("回调成功！");
            }
        },
        //初始化样式
        initImgClipStyleFile: function () {
            $("<link>").attr({
                rel: "stylesheet",
                type: "text/css",
                href: this.setting.path + "imgClip/css/imgClip.css"
            }).appendTo("head");
        },
        //检查参数是否合法
        isValid: function (options) {
            return !options || (options && typeof options === "object") ? true : false;
        },
        //设置cookie   setCookie(key，value，days)
        setCookie: function (cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + "; " + expires;
        },
        //获取cookie
        getCookie: function (cname)
        {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1);
                if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
            }
            return "";
        },
        //清除cookie
        clearCookie: function (cname)
        {
            setCookie(cname, "", -1);
        }
    };
    imgClip.init = function (options) {
        var _this_ = this;
        new _this_(options)
    }
    window["imgClip"] = imgClip;
})(jQuery);