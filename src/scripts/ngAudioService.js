'use strict';
angular.module('ngAudio')
    .provider('ngAudioService', function () {
        var audios = [];//音频列表
        var curIndex = 0;//当前音频索引

        function checkSame(audio) {
            for (var i = 0, len = audios.length; i < len; i++) {
                if (audios[i].nodeId === audio.nodeId) { //找到列表中已存在音频索引
                    return i;
                }
            }
            return false;
        }

        function cleanSelected() {
            angular.forEach(audios, function (item) {
                item.isActive = false;
            });
        }

        this.$get = ['$rootScope', function ($rootScope) {
            return {
                load: function () {
                    if (audios.length > 0) {
                        cleanSelected();
                        audios[curIndex].isActive = true;
                    }
                    $rootScope.$broadcast('AUDIOS_UPDATE');
                },

                addAudio: function (audio) {
                    var flag = checkSame(audio);
                    if (flag !== false) {
                        audios.splice(flag, 1); //移除相同音频
                    }
                    audios.unshift(audio);//插入到audio数组头
                    curIndex = 0; //选中音频列表头
                    this.load(); //加载
                    $('.ky-audio-container').show(100);
                },

                getAudios: function () {
                    return audios;
                },

                getCurIndex: function () {
                    return curIndex;
                },

                setCurIndex: function (num) {
                    curIndex = num;
                },

                removeAudio: function (index) {
                    audios.splice(index, 1);
                }
            }
        }]
    });
