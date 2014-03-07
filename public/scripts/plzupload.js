requirejs.config({
    //By default load any module IDs from scripts
    baseUrl: 'scripts'
});


require(['lib/jquery-2.1.0.min', 'dragDrop', 'lib/MenuController', 'lib/FacebookManager'],
	function(a, DragDropController, MenuController, FacebookManager) {
  var menuController = new MenuController();
  var dragDrop = new DragDropController('centeredZone', menuController);


  //===== CPScene =====//

  new CPGame("settings.json", function(cpGame) {

  	var onResourcesLoaded = function() {
      console.log('Resources loaded !');
    
	    // Launch 1rst scene
	    CPSceneManager.instance.setScene("MainScene");
	  }.bind(this)
	  var onResourcesProgress = function(progress) {
	      //console.log(progress + '%');
	  }

	  CPResourceManager.instance.init(cpGame.allImages, onResourcesLoaded, onResourcesProgress);

    CPResourceManager.instance.startLoading();
  });

  var timer = null;
  $(window).resize(function(e) {
  	//TODO: More smooth, with safe area (not on every resize)

  	window.clearTimeout(timer);
  	timer = window.setTimeout(resize, 500);

  	function resize() {
	  	CPGame.instance.canvasWidth = $(window).width();
	    CPGame.instance.canvasHeight = $(window).height();

	  	$('canvas').attr('width', CPGame.instance.canvasWidth);
	  	$('canvas').attr('height', CPGame.instance.canvasHeight);

	  	$('body').trigger('resizeEnd');
  	}
	  	
  });

  //===== Glooty animation =====//

  $('#centeredZone').on('dragover', function(e) {
  	$('body').trigger('fileDragOver');
  });

  $('#centeredZone').on('dragleave', function(e) {
  	$('body').trigger('fileDragFinished');
  });

  $('#centeredZone').on('dragend', function(e) {
  	$('body').trigger('fileDragFinished');
  });

  $('#centeredZone').on('drop', function(e) {
  	$('body').trigger('fileDropped');
  });

  //===== Facebook login =====//

	var fbManager = new FacebookManager();

	fbManager.setServerValidationUrl(location.origin + '/ws/facebookLogin');

	$('#FBLogin').click(function() {
		fbManager.login(function(success) {

				if (success) {
					fbManager.getUserInfo(function(response) {
						fbManager.currentUser.name = response.name;
						if (menuController) menuController.onFBLogin(fbManager.currentUser.name);
						$('body').trigger('authorizeMultiupload');
					});
				} else {
					console.log('User resigned :(');
				}
		}, 'email');
	});

	$('#FBLogout').click(function() {
		fbManager.logout(function(success) {
				if (success) {
					if (menuController) menuController.onFBLogout();
						$('body').trigger('unauthorizeMultiupload');
				} else {
					console.log('Failed to logout ? :(');
				}
		});
	});
  
  function checkUserStatus() {
		fbManager.checkUserStatus(function(userStatus) {
			//if (!$('#facebookLogin').length) initLoginButton();

			if (userStatus == 'connected') {

				if (menuController) menuController.onFBLogin(fbManager.currentUser.name);
				
				fbManager.getUserInfo(function(response) {
					fbManager.currentUser.name = response.name;
				});
				fbManager.login(function(success) {
					console.log("Autologin success ? ", success);

					fbManager.getUserInfo(function(response) {
						fbManager.currentUser.name = response.name;
					});
				}, 'email');
			} else {
				console.log('NOT connected');

				/*fbManager.login(function(success) {
					console.log("Autologin success ? ", success);

					fbManager.getUserInfo(function(response) {
						fbManager.currentUser.name = response.name;
					});
				}, 'email');*/
			}
		})
	}

  fbManager.init({
		appId: '126267960876070', // real one : 601752169899573
		//channelUrl: '//book.fruitygames.fr/channel.html',
		locale: 'en_GB'
		/*onLoginStatusConnectedCB,
		onLoginStatusNotAuthorizedCB,
		onLoginStatusNotConnectedCB,*/
	}, checkUserStatus);
});