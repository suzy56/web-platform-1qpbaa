$(function() {
    //音频课对象
    var mp3 = {
        funTimeupdate: null,
        renderLrc: null,
        //audio控制======================================================
        //获取音频对象
        audio: null,
        getAudio: function() {
            if (!this.audio) {
                this.audio = document.getElementById("YoukePlayer");
            }
            return this.audio;
        },
        //音频播放
        mp3Play: function() {
            this.getAudio().play();
        },
        //音频暂停
        mp3Pause: function() {
            this.getAudio().pause();
        },
        //重设音频
        mp3SetSrc: function(url) {
            this.getAudio().load(url);
        },
        //静音
        mp3Mute: function(Boole) {
            this.getAudio().muted = Boole;
        },
        //设置音量，控制音量的属性值为0-1;0为音量最小，1为音量最大
        mp3SetVolume: function(rate) {
            if (rate == 0) {
                $(".volume_btn").attr("id", "volume_pause")
            } else {
                $(".volume_btn").attr("id", "volume_on")
            }
            $(".volume_bar").css("width", rate * 100 + "%")
            $(".volume_control").css("left", rate * 100 + "%")
            this.getAudio().volume = rate;
        },
        //获取音量
        mp3GetVolume: function() {
            return this.getAudio().volume;
        },
        //获取播放时间
        mp3GetTime: function() {
            return this.getAudio().currentTime;
        },
        //获取总播放时间
        mp3GetDuration: function() {
            if (this.audio && this.audio.duration) {
                var alltime = this.audio.duration;
                return this.getFormatTimeBySecend(alltime)
            } else {
                return '加载中'
            }
        },
        mp3Durationback: function() {
            var audio = this.getAudio()
            var alltime = this.mp3GetDuration();
            $("#time_total").html(alltime)
            audio.addEventListener("canplay", function() {
                alltime = audio.duration;
                $(".play_btn").css("display", "inline-block")
                $(".play_loading").css("display", "none")
                $("#time_total").html(mp3.getFormatTimeBySecend(alltime))
            })

        },
        /*方法：秒转格式化时间*/
        getFormatTimeBySecend: function(time) {
            var _time = parseInt(time)
            var hours = Math.floor(_time / 3600);
            var minutes = Math.floor((_time - hours * 3600) / 60);
            var seconds = (_time - hours * 3600 - minutes * 60);
            return ((hours > 0) ? (hours + ":") : "") + ((minutes <= 9) ? "" : "") + minutes + ":" + ((seconds <= 9) ? "0" : "") + seconds;
        },
        //播放跳转
        mp3Seek: function(time) {
            this.getAudio().currentTime = time;
        },
        //获取音频持续播放时间
        onlineTime: 0,
        getMp3OnlineTime: function() {
            var _onlineTime = this.onlineTime;
            this.onlineTime = 0;
            return _onlineTime;
        },
        //初始化mp3播放器================================================
        initMp3: function() {
            var mp3Url = "weARE.mp3";
            var mp3Lrc = "weARE.lrc";
            this.renderAudioUI(mp3Url);
            this.initMp3Lrc(mp3Lrc);
            this.removeMp3Event(); //清理事件，防止重复绑定
            this.bindMp3Event();
            this.mp3Durationback();
        },
        //移除播放器
        destroyMp3: function() {
            this.destroyAudioUI();
            this.removeMp3Event();
            this.audio = null;
            this.onlineTime = 0;
        },
        //渲染audio界面
        renderAudioUI: function(mp3Url) {
            var $playerBox = $("#player-object");
            var outStr = "<audio id='YoukePlayer' class='kgc_hide' src='" + mp3Url + "'></audio>" +
                "<div id='mp3LrcBox' class='kgc_w'><div id='mp3LrcTxt'></div></div>" +
                "<div id='mp3CtrlBox' class='kgc_w'><div id='progress' class='progress'>" +
                "<p id='progress_bar' class='progress_bar'></p>" +
                "<span id='progress_control' class='progress_control'></span></div>" +
                "<span id='progress_pad' class='progress_pad'></span><div class='control_box'><div class='play_btn play_pause'></div><div class='play_loading'></div>" +
                "<div class='play_time'><span id='audioCurTime'>0:00</span>/<span id='time_total'></span></div>" +
                "<div class='volume_box'><span class='volume_btn' id='volume_on'></span><div class='volume_progress' id='volume_progress'>" +
                "<p class='volume_bar' id='volume_bar'></p><span class='volume_control' id='volume_control'></span></div><div class='audio_logo'></div></div></div>" +
                "</div>";
            this.audio = null;
            $playerBox.html(outStr);
        },
        destroyAudioUI: function() {
            $("#player-object").html('<div id="YoukePlayer"></div>');
        },

        //播放界面相关==========================================================================
        //渲染时间轴
        renderMp3TimeLine: function(audio) {
            var _mp3 = mp3;
            var value = audio.currentTime / audio.duration;
            $('#progress_bar').css('width', value * 100 + '%');
            $('#progress_control').css('left', value * 100 + '%');
            $('#audioCurTime').html(_mp3.getFormatTimeBySecend(audio.currentTime));
        },
        //字幕相关===========================================================================
        //初始化字幕，根据lrc文件解析出字幕
        lrcIndex: 0,
        lrcTime: new Array(),
        lrcTxt: new Array(),
        initMp3Lrc: function(lrcUrl) {
            var _mp3 = mp3;
            var binlyric = {
                obj: "",
                txt: "",
                index: _mp3.lrcIndex,
                time: _mp3.lrcTime,
                lyric: _mp3.lrcTxt,
                createPanel: function() { // 创建歌词面板
                    var i = 0;
                    var lrcDom = $(this.obj);
                    lrcDom.html("");
                    for (i = 0; i < this.index; i++) {
                        lrcDom.append("<div>" + this.lyric[i] + "</div>");
                    }
                },
                findTags: function(index, strArray, number) { // 查找标签（包括任何扩展的标签）
                    // 此方法能匹配所有格式的标签
                    // 因为此方法是在后面写的，所以时间标签并没有使用此方法
                    number = number || this.txt.length;
                    number = (number > this.txt.length) ? this.txt.length : number;
                    var i, j, complete = 0,
                        value;
                    var obj = new Object();
                    obj.booble = false;
                    obj.value = "[";
                    for (i = index; i < number; i++) {
                        if (this.txt.substr(i, 1) == strArray[complete].s) {
                            complete += 1;
                            if (complete > 1) {
                                if (complete < strArray.length) {
                                    obj.value += '{value:"' + this.txt.substr(value + 1, i - value - 1) + '"},';
                                } else {
                                    obj.value += '{value:"' + this.txt.substr(value + 1, i - value - 1) + '"}]';
                                }
                            }
                            if (complete == strArray.length) {
                                obj.txt = this.txt.substr(index, i - index + 1);
                                obj.value = eval('(' + obj.value + ')');
                                obj.index = i + 1;
                                obj.booble = true;
                                break
                            }
                            value = i;
                        } else if (this.txt.substr(i, 1) == "\n") {
                            obj.booble = false;
                            return obj;
                        } else if (this.txt.substr(i, 1) == strArray[0].s && complete > 0) // 遇到2次开始标志就退出
                        {
                            obj.booble = false;
                            return obj;
                        }
                    }
                    return obj;
                },
                findlyric: function(index) { // 查找歌词： 有则返回 歌词、继续查找的位置， 否则只返回继续查找的位置
                    var obj = {};
                    var str = this.txt;
                    var i;
                    for (i = index; i < str.length; i++) {
                        if (str.charAt(i) == "[") {
                            var _obj = this.findTags(i, [{ s: "[" }, { s: ":" }, { s: "]" }]);
                            if (_obj.booble) {
                                obj.index = i; //i + _obj.txt.length;
                                obj.lyric = str.substr(index, i - index);
                                return obj;
                            }
                        } else if (str.charAt(i) == "\n") {
                            obj.index = i + 1;
                            obj.lyric = str.substr(index, i - index);
                            return obj
                        }
                    }
                    if (i == str.length) // 专处理最后一句歌词（最后一句歌词比较特殊）
                    {
                        obj.index = i + 1;
                        obj.lyric = str.substr(index, i - index);
                        return obj;
                    }
                    obj.index = i;
                    return obj;
                },
                findTime: function(index) { // 查找时间 ： 有则返回 时间、继续查找的位置， 否则只返回继续查找的位置
                    // 此功能可以用 findTags 方法实现，更简单、更强大、代码更少
                    // findTags方法 是在后面写的，所以这里就不改了，具体可参考 findID方法里的使用实例
                    var obj = {};
                    var thisobj = this;
                    var str = this.txt;
                    obj.index = index;

                    function recursion() {
                        var _obj = thisobj.findTime(obj.index);
                        if (_obj.time) {
                            obj.time += _obj.time;
                            obj.index = _obj.index;
                        }
                    }
                    // --------------- 可以在这里 扩展 其它功能 ---------------
                    // lrc歌词只能精确到每句歌词，可以通过扩展lrc 精确 到 每个字
                    if (/\[\d{1,2}\:\d{1,2}\.\d{1,2}\]/.test(str.substr(index, 10))) // [mm:ss.ff]
                    {
                        obj.time = str.substr(index + 1, 8) + "|";
                        obj.index = index + 9 + 1;
                        recursion();
                    } else if (/\[\d{1,2}\:\d{1,2}\]/.test(str.substr(index, 7))) // [mm:ss]
                    {
                        obj.time = str.substr(index + 1, 5) + ".00" + "|";
                        obj.index = index + 6 + 1;
                        recursion();
                    }
                    return obj;
                },
                analysis: function() { // 解析
                    if (this.txt == "") return false;
                    var str = this.txt;
                    this.index = 0;
                    for (var i = 0; i < str.length; i++) {
                        if (str.charAt(i) == "[") {
                            var time = this.findTime(i);
                            if (time.time) { // 时间标签	
                                var lyric = this.findlyric(time.index);

                                if (lyric.lyric != "\n" && lyric.lyric != "") { // 去掉无意义歌词
                                    var timeArray = time.time.split("|");

                                    for (var j = 0; j < timeArray.length; j++) {
                                        if (timeArray[j] && ($.trim(lyric.lyric) != "")) {
                                            this.time[this.index] = timeArray[j];
                                            this.lyric[this.index] = lyric.lyric;
                                            this.index += 1;
                                            _mp3.lrcIndex = this.index;
                                        }
                                    }
                                }
                                i = time.index;
                            }
                        }
                    }
                    this.createPanel();
                },
            };
            if (lrcUrl.indexOf('.lrc') == -1) {
                $('#mp3LrcTxt').append("<div class='lrcTxtErr active'>此课程没有填词，请您欣赏~</div>");
            } else {
                $.get(lrcUrl, function(lrc) {
                    binlyric.txt = lrc;
                    if ($.trim(lrc) != "") {
                        binlyric.analysis();
                    } else {
                        $(binlyric.obj).append("<div class='lrcTxtErr active'>此课程没有填词，请您欣赏~</div>");
                    }
                })
            }
            binlyric.obj = "#mp3LrcTxt";

        },
        //渲染字幕
        renderMp3Lrc: function(time) {
            var idx = null;
            var obj = {
                obj: "#mp3LrcTxt"
            };

            function set(index) {
                var height = parseInt($(obj.obj).find("div").css("height"));
                var top = parseInt($(obj.obj).find("div").css("margin-top"));
                var topNum = (index * height + index * top) - (parseInt($(obj.obj).height() / 2) - height * 2);
                $(obj.obj).stop(true).animate({
                    scrollTop: (topNum)
                }, 200);
                $(obj.obj).find("div").eq(index).addClass('active').siblings().removeClass('active');
            }

            for (var i = 0; i < this.lrcIndex; i++) {

                if (time == timeType(this.lrcTime[i])) {
                    set(i);
                    return;
                } else if (time > timeType(this.lrcTime[i])) {
                    idx = i;
                }
            }

            set(idx); // 没找到匹配时间 则就近最小选择

            function timeType(position) {
                var timeArr = position.split(':');
                return parseInt(timeArr[0], 10) * 60 + parseFloat(timeArr[1])

            }
        },
        //相关事件=============================================================================
        //初始化音频播放器相关事件
        bindMp3Event: function() {
            var $doc = $(document);
            var eventObj = this.eventObj;
            var _mp3 = mp3
            $doc.on("mousedown", "#progress_control", eventObj.seekBtnDragBeginHandle)
                .on("click", "#progress", eventObj.progressClickHand)
                .on("click", "#progress_pad", eventObj.progressPadClickHand)
                .on("click", ".play_pause", eventObj.pauseBtnClickHandle)
                .on("click", ".play_on", eventObj.playBtnClickHandle)
                .on("click", "#volume_on,#volume_pause", eventObj.muteBtnClickHandle)
                .on("click", "#volume_progress", eventObj.volumeBtnClickHandle)
                .on("mousedown", "#volume_control", eventObj.volumeBtnDragHandle)
            var _audio = this.getAudio();
            // 监听音频播放时间并更新进度条
            this.funTimeupdate = function() {
                _mp3.renderMp3TimeLine(_audio)
            }
            _audio.addEventListener('timeupdate', this.funTimeupdate, false);
            this.renderLrc = function() {
                var time = _mp3.mp3GetTime();
                _mp3.renderMp3Lrc(time);
            }
            _audio.addEventListener('timeupdate', this.renderLrc, false);
            this.startOnlineTimeInterval();
        },
        //移除事件
        removeMp3Event: function() {
            var $doc = $(document);
            var eventObj = this.eventObj;
            $doc.off("mousedown", "#progress_control", eventObj.seekBtnDragBeginHandle)
                .off("click", "#progress", eventObj.progressClickHand)
                .off("click", "#progress_pad", eventObj.progressClickHand)
                .off("click", ".play_pause", eventObj.pauseBtnClickHandle)
                .off("click", ".play_on", eventObj.playBtnClickHandle)
                .off("click", ".volume_on,.volume_pause", eventObj.muteBtnClickHandle)
                .off("click", "#volume_progress", eventObj.volumeBtnClickHandle)
                .off("mousedown", "#volume_control", eventObj.volumeBtnDragHandle)
            this.stopOnlineTimeInterval();
            var _audio = this.getAudio();
            if (_audio) {
                _audio.removeEventListener('timeupdate', this.funTimeupdate);
                _audio.removeEventListener('timeupdate', this.renderLrc);
            }
        },
        //持续播放时间循环
        startOnlineTimeInterval: function() {
            this.onlineTimeInterval = setInterval(function() {
                var _mp3 = mp3;
                if (_mp3.getAudio() && !_mp3.getAudio().paused) {
                    _mp3.onlineTime++; //未暂停，增加持续播放时间
                }
            }, 1000)
        },
        stopOnlineTimeInterval: function() {
            clearInterval(this.onlineTimeInterval);
        },
        eventObj: {
            //播放器控制界面操作回调=================================================================
            // 点击进度条跳到指定点播放
            progressClickHand: function(e) {
                var _mp3 = mp3;
                var audio = _mp3.getAudio()
                if (e.target.id == "progress_control") {
                    return;
                }
                if (!audio.paused || audio.currentTime != 0) {
                    var pgsWidth = $('#progress').width();
                    var rate = e.offsetX / pgsWidth;
                    audio.currentTime = audio.duration * rate;
                    _mp3.renderMp3TimeLine(audio)
                }
            },
            // 点击进度条补充部分跳到进度末尾
            progressPadClickHand: function(e) {
                var _mp3 = mp3;
                var audio = _mp3.getAudio()
                if (!audio.paused || audio.currentTime != 0) {
                    audio.currentTime = audio.duration - 2;
                    _mp3.renderMp3TimeLine(audio)
                }
            },
            //开始拖动时间进度条回调
            seekBtnDragBeginHandle: function(e) {
                var _mp3 = mp3;
                var audio = _mp3.getAudio()
                var length;
                var rate;
                var pgsWidth = $('#progress').width();
                var dot = document.getElementById('progress_control');
                if (!audio.paused || audio.currentTime != 0) {
                    var oriLeft = dot.offsetLeft;
                    var mouseX = e.clientX;
                    var maxLeft = oriLeft; // 向左最大可拖动距离
                    var maxRight = document.getElementById('progress').offsetWidth - oriLeft; // 向右最大可拖动距离

                    // 禁止默认的选中事件
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        e.returnValue = false;
                    }
                    // 禁止事件冒泡
                    if (e && e.stopPropagation) {
                        e.stopPropagation();
                    } else {
                        window.event.cancelBubble = true;
                    }
                    //开始拖动
                    $(document).on("mousemove", function(e) {
                        audio.removeEventListener('timeupdate', _mp3.funTimeupdate, false)
                        length = e.clientX - mouseX;
                        if (length > maxRight) {
                            length = maxRight;
                        } else if (length < -maxLeft) {
                            length = -maxLeft;
                        }
                        $("#progress_control").css("left", oriLeft + length + "px")
                        $("#progress_bar").css("width", oriLeft + length + "px")
                        rate = (oriLeft + length) / pgsWidth;
                        $('#audioCurTime').html(_mp3.getFormatTimeBySecend(audio.duration * rate));
                    });

                    // 拖动结束
                    $(document).on("mouseup", function(e) {
                        audio.addEventListener('timeupdate', _mp3.funTimeupdate, false);
                        if (rate) {
                            audio.currentTime = audio.duration * rate;
                        }
                        _mp3.renderMp3TimeLine(audio)
                        $(document).off("mousemove")
                        $(document).off("mouseup")
                    });
                }
            },
            //暂停按钮点击事件回调
            pauseBtnClickHandle: function() {
                var _mp3 = mp3;
                var audio = _mp3.getAudio()
                _mp3.mp3Play();
                $(".play_pause").removeClass("play_pause").addClass("play_on");
            },
            //播放按钮点击事件回调
            playBtnClickHandle: function() {
                mp3.mp3Pause();
                $(".play_on").addClass("play_pause").removeClass("play_on")

            },
            //静音按钮点击事件回调
            muteBtnClickHandle: function(e) {
                var _mp3 = mp3;
                var _volumeNum = _mp3.mp3GetVolume()
                if (e.target.id == 'volume_on') {
                    _mp3.mp3Mute(true);
                    $(".volume_bar").css("width", 0 * 100 + "%")
                    $(".volume_control").css("left", 0 * 100 + "%")
                    $(".volume_btn").attr("id", "volume_pause")
                } else if (e.target.id == 'volume_pause') {
                    _mp3.mp3Mute(false);
                    if (_volumeNum == 0) {
                        _volumeNum = 0.05
                    }
                    _mp3.mp3SetVolume(_volumeNum)
                }
            },
            //点击音量调回调
            volumeBtnClickHandle: function(e) {
                var _mp3 = mp3;
                _mp3.mp3Mute(false);
                if (e.target.id == "volume_control") {
                    return;
                }
                var volPgsWidth = $('#volume_progress').width();
                var rate = e.offsetX / volPgsWidth;
                _mp3.mp3SetVolume(rate)
            },
            //拖拽音量条事件回调
            volumeBtnDragHandle: function(e) {
                var _mp3 = mp3;
                _mp3.mp3Mute(false);
                var audio = _mp3.getAudio()
                var length;
                var _dot = document.getElementById('volume_control');
                var oriLeft = _dot.offsetLeft;
                var mouseX = e.clientX;
                var maxLeft = oriLeft; // 向左最大可拖动距离
                var maxRight = document.getElementById('volume_progress').offsetWidth - oriLeft; // 向右最大可拖动距离

                // 禁止默认的选中事件
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }
                // 禁止事件冒泡
                if (e && e.stopPropagation) {
                    e.stopPropagation();
                } else {
                    window.event.cancelBubble = true;
                }
                //开始拖动
                $(document).on("mousemove", function(e) {
                    length = e.clientX - mouseX;
                    if (length > maxRight) {
                        length = maxRight;
                    } else if (length < -maxLeft) {
                        length = -maxLeft;
                    }
                    var pgsWidth = $('#volume_progress').width();
                    var rate = (oriLeft + length) / pgsWidth;
                    _mp3.mp3SetVolume(rate);
                });

                // 拖动结束
                $(document).on("mouseup", function(e) {
                    $(document).off("mousemove")
                    $(document).off("mouseup")
                });
            }
        }
    }
    mp3.initMp3();
})