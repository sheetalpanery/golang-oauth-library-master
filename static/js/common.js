	$(document).ready(function() {
    var $accordionClick = $('.accordion .accordion-section-click');
    var $accordionContent = $('.accordion .accordion-section-content .book-data');
    var $contain = $('.accordion-section-content .update');
    var $confirmPopup = $('.update-overlay-popup');
    var $overlay = $('.overlay');

    function popclose() {
        $('.open').removeClass('open');
    }

    function close_accordion_section() {
        $accordionClick.removeClass('active');
        $accordionContent.removeClass('open');
    }
    $contain.bind('click', function(e) {
        popclose();
        $overlay.addClass('open');
        $confirmPopup.addClass('open');
        book_title = $(this).attr('data-title');
        $confirmPopup.find('.book-title').html(book_title);
    });
    $('.popup-close,.overlay,.thanks').on('click', function(e) {
        popclose();
        $overlay.removeClass('open');
        $confirmPopup.removeClass('open');
    });
    $confirmPopup.find('.update').bind('click', function(e) {
        popclose();
        if (book_title === $('.book-title').html()) {
            var value = $('.book-title').html();
            $('.accordion-section-content .update[data-title="' + value + '"]').addClass('updating').removeClass('update');
            $('.updating').html('Updating')
            $(".updating").unbind("click");
        }
        $overlay.removeClass('open');
        $confirmPopup.removeClass('open');
    });
    $('.pop-icon').on('click', function(e) {
        if ($(this).hasClass('open')) {
            $('.version-data').removeClass('open');
            $(this).removeClass('open');
            $accordionContent.removeClass('open');
            $accordionClick.removeClass('active');
        } else {
            $('.version-data').removeClass('open');
            $('.pop-icon').removeClass('open');
            $(this).addClass('open');
            $(this).closest('.accordion-section-content').find('.version-data').addClass('open');
            $accordionContent.removeClass('open');
            $(this).closest('.accordion-section-content').find('.book-data').addClass('open');
            $(this).closest('.accordion-section-content').find('.accordion-section-click').addClass('active');
        }

    });
    $accordionClick.click(function(e) {
        popclose();
        var currentAttrValue = $(this).attr('href');
        if ($(e.target).is('.active')) {
            close_accordion_section();
            $(this).removeClass('active');
        } else {
            if ($(this).hasClass('active')) {
                $accordionClick.removeClass('active');
                $accordionContent.removeClass('open');
            } else {
                $accordionClick.removeClass('active');
                $(this).addClass('active');
                $accordionContent.removeClass('open');
                $(this).closest('.accordion-section-content').find('.book-data').addClass('open');
            }

        }
        e.preventDefault();
    });
});
