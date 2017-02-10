(function() {
  'use strict';

  var Data = {
    releaseStyle: {
      'disabled': false
    },
    popup: false,
    popupStyle: {
      'left': '0'
    },
    popupType: 'imgs',
    acceptFileType: {
      imgs: 'image/png,image/gif,image/jpg,image/jpeg',
      video: 'video/*',
      files: '*/*'
    },
    text: '',
    imgs: [
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
    ],
    video: [
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
    ],
    files: [
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
      {name:null, objUrl: null, file: null},
    ],
  };

  new Vue({
    el: '.js-sendTweets',
    data: Data,
    methods: {
      showPicDialog: function(e) {
        var self = this;
        self.popupStyle.left = '0';
        self.popupType = 'imgs';
        self.popup = false;
        self.popup = true;
      },
      showVideoDialog: function(e) {
        var self = this;
        self.popupStyle.left = '5rem';
        self.popupType = 'video';
        self.popup = false;
        self.popup = true;
      },
      showFilesDialog: function(e) {
        var self = this;
        self.popupStyle.left = '10rem';
        self.popupType = 'files';
        self.popup = false;
        self.popup = true;
      },
      selectFile: function(index, event) {
        var self = this;

        var type = event.target.getAttribute('data-type');
        var selectImgs   = document.getElementsByClassName('js-imgs')[0];
        var selectVideo  = document.getElementsByClassName('js-video')[0];
        var selectFiles  = document.getElementsByClassName('js-files')[0];

        if ('imgs' === type) {
          var imgPrev   = document.getElementById('js-imgPrev');
          var imgPrevs  = document.getElementsByClassName('js-imgPrevs');

          imgPrev.onload = function(e) {
            if (imgPrev.width < imgPrev.height) {
              imgPrevs[index].style.height = '100%';
            } else {
              imgPrevs[index].style.width = '100%';
            }
            console.log('图片尺寸：' + imgPrev.width + 'x' + imgPrev.height);
          };

          selectImgs.onchange = function(e){
            var fileList = e.target.files;
            var file = fileList[0];
            var objUrl;

            if (0 === fileList.length) return false;
            objUrl = window.URL.createObjectURL(file);

            self.imgs[index].name = file.name;
            self.imgs[index].objUrl = imgPrev.src = imgPrevs[index].src = objUrl;
            self.imgs[index].file = file;
            console.log('选择文件：' + file.name + '; 大小：' + file.size);
          };

          selectImgs.click();
        }

        if ('video' === type) {
          selectVideo.onchange = function(e){
            var fileList = e.target.files;
            var file = fileList[0];
            var objUrl;

            if (0 === fileList.length) return false;
            objUrl = window.URL.createObjectURL(file);

            self.video[index].name = file.name;
            self.video[index].objUrl = objUrl;
            self.video[index].file = file;
            console.log('选择文件：' + file.name + '; 大小：' + file.size);
          };

          selectVideo.click();
        }

        if ('files' === type) {
          selectFiles.onchange = function(e){
            var fileList = e.target.files;
            var file = fileList[0];
            var objUrl;

            if (0 === fileList.length) return false;
            objUrl = window.URL.createObjectURL(file);

            self.files[index].name = file.name;
            self.files[index].objUrl = objUrl;
            self.files[index].file = file;
            console.log('选择文件：' + file.name + '; 大小：' + file.size);
          };

          selectFiles.click();
        }
      },
      delThisSelect: function(index, type) {
        var self = this;
        var imgPrevs  = document.getElementsByClassName('js-imgPrevs');

        self[type][index].name = null;
        self[type][index].objUrl = null;
        self[type][index].file = null;

        imgPrevs[index].removeAttribute('src');
        imgPrevs[index].removeAttribute('style');
      },
      closeDialog: function(e) {
        this.popup = false;
      },
      release: function(e) {
        var self = this;
        var formData = new FormData();

        formData.append('text', self.text);

        self.imgs.forEach(function(img, i) {
          if (img.name) formData.append(i+'_img', img.file);
        });

        self.video.forEach(function(v, i) {
          if (v.name) formData.append(i+'_video', v.file);
        });

        self.files.forEach(function(file, i) {
          if (file.name) formData.append(i+'_file', file.file);
        });

        self.releaseStyle.disabled = true;
        axios.post('/api/sendTweets', formData)
          .then(function(resp) {
            if (resp.data.success) {
              var imgPrevs  = document.getElementsByClassName('js-imgPrevs');

              for (var i=0; i<9; i++) {
                self.imgs[i].name   = null;
                self.imgs[i].objUrl = null;
                self.imgs[i].file   = null;

                self.video[i].name   = null;
                self.video[i].objUrl = null;
                self.video[i].file   = null;

                self.files[i].name   = null;
                self.files[i].objUrl = null;
                self.files[i].file   = null;

                imgPrevs[i].removeAttribute('src');
                imgPrevs[i].removeAttribute('style');
              }

              self.text = '';
              self.popup = false;
            }

            self.releaseStyle.disabled = false;
          });
      }
    }
  });

  var socket = io(window.location.origin);

  socket.on('/api/sendTweets/result', function(data) {
    var msg = '';

    msg += '<h5 class="mb0">发布成功！</h5>';
    msg += '<h6 class="mb0">Hash: ' + data.infoHash + '</h6>';
    msg += '<h6 class="mb0">Peers: ' + data.numPeers + '</h6>';

    console.log(data);
    notie.alert('success', msg, 3);
  });

  window.Data = Data;
})();
