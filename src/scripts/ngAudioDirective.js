'use strict';
angular.module('ngAudio')
    .directive('ngAudio', ['$timeout', 'ngAudioService', function ($timeout, ngAudioService) {
        return {
            restrict: 'E',
            templateUrl: 'ngAudioViewer.html',
            scope: {
                curIndex: '@'
            },
            link: function (scope, element, attr) {
                function refresh() {
                    scope.audios = ngAudioService.getAudios();
                    scope.curIndex = ngAudioService.getCurIndex();
                    audio[0].src = scope.audios[scope.curIndex].ossUrl;
                    setVolumeStyle();//改变音量部分显示样式
                }

                //接收到AUDIOS_UPDATE事件时刷新界面
                scope.$on('AUDIOS_UPDATE', refresh);

                var audio = $('audio');//音频标签
                var playProgress = $('#audioPlayBar'); //音频播放进度条
                var loadingBar = $('#loadingBar');//音频缓冲进度较
                scope.volumeState = 'up'; //初始音频图标

                scope.playState = 'pause';//初始播放图标状态

                scope.timeShow = {//音频播放当前时间和时长显示
                    currentTime: '00:00',
                    duration: '00:00'
                };

                //暂停播放按钮点击事件
                scope.playOrPause = function () {
                    if (audio[0].paused) {
                        audio[0].play();
                    } else {
                        audio[0].pause();
                    }
                };

                //调用play方法或设置相应的autoplay属性
                audio.on('play', function () {
                    $timeout(function () {
                        scope.playState = 'pause';
                    })
                });

                //调用pause方法
                audio.on('pause', function () {
                    $timeout(function () {
                        scope.playState = 'play';
                    })
                });

                //播放滚动条点击事件
                scope.updatePlayTime = function () {
                    if (!isNaN(audio[0].duration)) {
                        var audioBar = $('#audioBar')[0].getBoundingClientRect();//获取元素相对窗口定位
                        //修改当前时间
                        var curX = event.clientX - audioBar.left;
                        audio[0].currentTime = curX / audioBar.width * audio[0].duration;
                    }
                };

                //静音状态
                scope.mutedChange = function () {
                    audio[0].muted = !audio[0].muted;
                };

                //音频滚动条点击事件
                scope.changeVolume = function () {
                    audio[0].muted = false;
                    var volumeBar = $('#volumeBar')[0].getBoundingClientRect();//获取音频滚动元素相对窗口定位
                    audio[0].volume = (event.clientX - volumeBar.left) / volumeBar.width;
                };

                //监听currentTime属性变化
                audio.on('timeupdate', function () {
                    playProgress.css('width', audio[0].currentTime * 100 / audio[0].duration + '%');//更新播放进度条
                    $timeout(function () {//更新当前时间显示
                        scope.timeShow.currentTime = formatAudioTime(audio[0].currentTime);
                    });
                });

                //加载媒体内容事件
                audio.on('progress', function () {
                    if (!isNaN(audio[0].duration)) {//设置滚动条样式
                        loadingBar.css('width', audio[0].buffered.end(audio[0].buffered.length - 1) / audio[0].duration * 100 + '%');
                    }
                });

                scope.canPlay = false;//可播放||loading状态

                //为缓冲足够数据导致播放未能开始或播放停止
                audio.on('waiting', function () {
                    $timeout(
                        scope.canPlay = false
                    );
                });
                //已经开始播放媒体文件
                audio.on('playing', function () {
                    $timeout(
                        scope.canPlay = true
                    );
                });
                //由于各种错误阻止媒体内容加载时
                audio.on('error', function () {
                    if (!audio[0].paused) {//只有在音频播放时才显示
                        console.log('音频加载失败');
                    }
                });

                /**
                 * 格式化秒为‘分：秒’||‘时：分：秒’
                 * @param seconds
                 * @returns {string}
                 */
                function formatAudioTime(seconds) {
                    var m = parseInt(seconds / 60);
                    var s = parseInt(seconds % 60);
                    s = s < 10 ? '0' + s : s;
                    if (m < 60) { //小于1小时的音频
                        m = m < 10 ? '0' + m : m;
                        return [m, s].join(':');
                    } else { //超过1小时显示
                        var h = parseInt(m / 60);
                        h = h < 10 ? '0' + h : h;
                        m = parseInt(m % 60);
                        m = m < 10 ? '0' + m : m;
                        return [h, m, s].join(':');
                    }
                }

                //音频时长发生改变时
                audio.on('durationchange', function () {
                    $timeout(function () {
                        scope.timeShow.duration = formatAudioTime(audio[0].duration);
                    });
                });

                //自动播放
                audio.on('canplay', function () {
                    this.play();
                });

                //设置音频滚动和喇叭状态
                function setVolumeStyle() {
                    var volume = audio[0].volume;
                    if (volume === 0 || audio[0].muted) {
                        $timeout(function () {//触发脏值检测
                            scope.volumeState = 'off';
                        });
                        $('#volumeProgress').css('width', 0);
                    } else if (volume > 0.5) {
                        $timeout(function () {
                            scope.volumeState = 'up';
                        });
                        $('#volumeProgress').css('width', volume * 100 + '%');
                    } else {
                        $timeout(function () {
                            scope.volumeState = 'down';
                        });
                        $('#volumeProgress').css('width', volume * 100 + '%');
                    }

                }

                //音量改变事件
                audio.on('volumechange', setVolumeStyle);

                //列表模式
                scope.resizeFull = function () {
                    $('.ky-audio-container').css('width', '580px');
                    $('.ky-audio-min-container').hide(100);
                    $('.dialog-header').show(100);
                    $('.dialog-body').show(100);

                };

                //迷你模式
                scope.resizeSmall = function () {
                    $('.dialog-header').hide(100);
                    $('.dialog-body').hide(100);
                    $('.ky-audio-container').css('width', '300px');
                    $('.ky-audio-min-container').show(100);
                };

                //点击列表切换音频
                scope.changeAudioList = function (index) {
                    if (scope.curIndex === index) {//同一音频不做切换
                        return;
                    }
                    scope.curIndex = index; //改变当前索引
                    ngAudioService.setCurIndex(scope.curIndex); //改变当前索引
                    ngAudioService.load(); //加载音频并播放
                };

                //上一曲
                scope.goPrevious = function () {
                    scope.curIndex--;
                    if (scope.audios.length === 1) { //只存在一个音频不重新播放
                        return;
                    }
                    if (scope.curIndex < 0) {//循环播放
                        scope.curIndex = scope.audios.length - 1;
                    }
                    ngAudioService.setCurIndex(scope.curIndex); //改变当前索引
                    ngAudioService.load(); //加载音频并播放
                };

                //下一曲
                scope.goNext = function () {
                    scope.curIndex++;
                    if (scope.audios.length === 1) { //只存在一个音频不重新播放
                        return;
                    }
                    if (scope.curIndex > scope.audios.length - 1) {//循环播放
                        scope.curIndex = 0;
                    }
                    ngAudioService.setCurIndex(scope.curIndex); //改变当前索引
                    ngAudioService.load(); //加载音频并播放
                }
            }
        }
    }]);
