(function(CiscoPLESite, $, undefined) {

  var $carousel = $('.carousel'),
      $dropdownTrigger = $('.dropdown-trigger'),
      $dropdownMenu = $('.dropdown-menu'),
      $downloads = $dropdownMenu.find('a'),
      $downloadTrigger = $('.download-trigger'),
      $myContentTable = $('#my-content table'),
      $myContentTableItemLink = $myContentTable.find('td a');

  CiscoPLESite.init = function() { // Page Initialisation

    $('html').addClass('js');

    setCarouselNav();

    if ($('#banner-carousel').length > 0) {

      setBannerCarouselNav();
    
    }
    
    // Events

      $carousel.on('click', 'nav li', switchCarouselSlide);

      $downloadTrigger.on('click', disableLink);

      $dropdownTrigger.on('click', toggleDropDown);

      $downloads.on('click', selectDownload);
      
  }

  function disableLink(e) {
    e.preventDefault();
  }

  function setCarouselNav() { // We know number of main carousel sections so just assign class to first nav item

    $carousel.find('nav li').first().addClass('on');  

  }

  function setBannerCarouselNav() { // Handle ths carousel nav dynamically as we could have more or less than four banners

    $carousel.append('<nav><ol></ol></nav>');

    $carousel.find('article').each(function(){

      $carousel.find('nav ol').append('<li/>');

    });

    $carousel.find('nav li:first-child').addClass('on');

  }

  function switchCarouselSlide(e) { // Main carousel slide switch
    
    var index = $(this).index(),
        $carouselNav = $(this).parent().find('li');

    e.preventDefault();

    $carouselNav.filter('.on').removeClass('on');

    $carouselNav.eq(index).addClass('on');

    $carousel.find('> *:not(nav):visible').fadeOut();

    $carousel.find('> *:not(nav)').eq(index).fadeIn();

  }

  function toggleDropDown(e) {

    e.preventDefault();

    $(this).toggleClass('open')
    
    $dropdownMenu.toggle();

  }

  function selectDownload(e) {

    e.preventDefault();

    var self = $(this),
        text = self.text(),
        href = self.attr('href');

    $downloads.filter('.on').removeClass('on');
    
    self.addClass('on');

    $dropdownTrigger.html(text + '<span class="caret"/>');

    $downloadTrigger.unbind('click', disableLink).css('display','block');

    $downloadTrigger.attr('href', href);

    toggleDropDown(e);

  }

})(window.CiscoPLESite = window.CiscoPLESite || {}, jQuery);

CiscoPLESite.init();