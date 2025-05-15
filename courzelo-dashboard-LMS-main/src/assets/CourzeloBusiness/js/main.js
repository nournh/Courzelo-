/*
  Theme Name: Edubin - LMS Education HTML Template
  Author: Humayun Ahmed
  Author URL: https://themeforest.net/user/pixelcurve
  Support: humayunahmed82@gmail.com
  Description: Creative  HTML5 template.
  Version: 1.0
*/


$(function() {
    
    "use strict";
    
  
    
    //===== Sticky
    
    $(window).on('scroll', function(event) {    
        var scroll = $(window).scrollTop();
        if (scroll < 30) {
            $(".navigation").removeClass("sticky");
            $(".navigation-2 img").attr("src", "../assets/CourzeloBusiness/images/logo.png");
        } else{
            $(".navigation").addClass("sticky");
            $(".navigation-2 img").attr("src", "../assets/CourzeloBusiness/images/logo.png");
        }
    });
    
    
    
    $(".navbar-toggler").on('click', function() {
        $(this).toggleClass("active");
    });

    var subMenu = $('.sub-menu-bar .navbar-nav .sub-menu');
    
    if(subMenu.length) {
        subMenu.parent('li').children('a').append(function () {
            return '  ';
        });
        
        var subMenuToggler = $('.sub-menu-bar .navbar-nav .sub-nav-toggler');
        
        subMenuToggler.on('click', function() {
            $(this).parent().parent().children('.sub-menu').slideToggle();
            return false
        });
        
    }
    
    
    //for scrolling at job offer dashboard
    
    $(window).scroll(function(e){ 
        var $el = $('.right-side'); 
        var isPositionFixed = ($el.css('position') == 'fixed');
        if ($(this).scrollTop() > 120 && !isPositionFixed){ 
          $el.css({'position': 'fixed', 'top': '80px','right':'47px','height':'265px' ,
          'width':'auto'}); 

          if(window.matchMedia("(max-width: 1200px)"))
          {
            $el.css({'position': 'fixed', 'top': '80px','right':'27px','height':'265px' ,
          'width':'300px'}); 
          }
         

         

        }
        if ($(this).scrollTop() < 120 && isPositionFixed){
          $el.css({'position': 'static', 'top': '0px'}); 
        } 
      });
    

        
    $(window).scroll(function(e){ 
        var $el = $('.mat-sidenav'); 
        var isPositionFixed = ($el.css('position') == 'fixed');
        if ($(this).scrollTop() > 120 && !isPositionFixed){ 
          $el.css({'position': 'fixed', 'top': '66px','left':'0px','height':'fit-content' ,
          'width':'auto'}); 
        }
        if ($(this).scrollTop() < 120 && isPositionFixed){
            //$el.classList.toggle('.mat-sidenav')
          $el.css({'position': 'absolute', 'top': '0px'}); 
        } 
      });
    
    
});