'use strict';
angular.module('test', ['ngAudio'])
    .controller('testController', ['$scope', '$timeout', 'ngAudioService',
        function ($scope, $timeout, ngAudioService) {
            $timeout(function () {
                ngAudioService.addAudio({
                    src: '/test/李荣浩 - 出卖.mp3',
                    name: '李荣浩 - 出卖.mp3'
                })
            })
        }]);