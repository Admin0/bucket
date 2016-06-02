function nav_create() {
    // $("body").prepend("<nav><div id='nav_header'></div><div id='nav'></div><div id='nav_footer'><i class='material-icons'>chevron_left</i></div></nav>");
    // $("nav").prepend("<section id='in-page'></section>");
    $("h2,h3").each(function(){
        $(this).clone()
        .html("<a href='#"+$(this).attr("id")+"'>"+$(this).html()+"</a>")
        .attr("id",null)
        .appendTo($("#nav"));
        // .appendTo($("#in-page"));
    })

    var nav_w = 256;
    var nav_w_folded = 68;

    function nav_expand(){
        $("nav, body, #sub_header, #nav_footer > i").removeClass("fold");
        window.localStorage['nav_fold'] = "false";
    }

    function nav_fold(){
        $("nav, body, #sub_header, #nav_footer > i").addClass("fold");
        window.localStorage['nav_fold'] = "true";
        // $("body").css({"padding-left":"calc(1em + "+nav_w_folded+"px)"});
        // $("#sub_header").css({"width":"calc(100% - "+nav_w_folded+"px)","padding-left":nav_w_folded+"px"});
        // $("#nav_footer > i").css({"transform":"rotate(180deg)"});
    }

    if(window.localStorage['nav_fold'] == "true"){
        nav_fold();
    }else{
        nav_expand();
    }

    $("#nav_footer").on("click",function(){
        if(window.localStorage['nav_fold'] != "true"){
            nav_fold();
        }else{
            nav_expand();
        }
        columns();
    });

    $('body').append('<div id="tooltip_nav"><div id="tooltip_nav_text"></div><div id="tooltip_nav_before"></div></div>');
    $("#tooltip_nav").css({"background":color.material_700[color_i]});
    $("#tooltip_nav").append($("#tooltip_before"));
    $("#nav h3").hover(function(){
        if($("nav").attr("class")=="fold"){
            if (document.height === null) {pageYOffset = document.documentElement.scrollTop;}
            $('#tooltip_nav_text').html($(this).children("a").children("span:nth(0)").text());
            $('#tooltip_nav').css({ 'visibility':'visible', 'opacity':1,
            'top':$(this).offset().top - pageYOffset  + 'px',
            'left':68 + 16 + 'px'});
            $("#tooltip_nav_before").css({"border-color":"transparent " + color.material_700[color_i] + " transparent transparent", "border-width": "1ex 1ex 1ex 0","left":"-.9ex","bottom":"calc(50% - .5em)"});
        }
    },
    function(){$('#tooltip_nav').css({ 'visibility':'hidden' , 'opacity':"0" });});
    $("#nav #setting_bt").hover(function(){
        if($("nav").attr("class")=="fold"){
            if (document.height === null) {pageYOffset = document.documentElement.scrollTop;}
            $('#tooltip_nav_text').html("설정");
            $('#tooltip_nav').css({ 'visibility':'visible', 'opacity':1,
            'top':$(this).offset().top - pageYOffset  + 'px',
            'left':68 + 16 + 'px'});
            $("#tooltip_nav_before").css({"border-color":"transparent " + color.material_700[color_i] + " transparent transparent", "border-width": "1ex 1ex 1ex 0","left":"-.9ex","bottom":"calc(50% - .5em)"});
        }
    },
    function(){$('#tooltip_nav').css({ 'visibility':'hidden' , 'opacity':"0" });});
    $("#nav #to_github").hover(function(){
        if($("nav").attr("class")=="fold"){
            if (document.height === null) {pageYOffset = document.documentElement.scrollTop;}
            $('#tooltip_nav_text').html("소스 보기");
            $('#tooltip_nav').css({ 'visibility':'visible', 'opacity':1,
            'top':$(this).offset().top - pageYOffset  + 'px',
            'left':68 + 16 + 'px'});
            $("#tooltip_nav_before").css({"border-color":"transparent " + color.material_700[color_i] + " transparent transparent", "border-width": "1ex 1ex 1ex 0","left":"-.9ex","bottom":"calc(50% - .5em)"});
        }
    },
    function(){$('#tooltip_nav').css({ 'visibility':'hidden' , 'opacity':"0" });});

    //for mobile
    $("nav a").on("click",function(){ $("nav, #nav_bg").removeClass("on"); });
}

function toast(icon, msg, time) {
    $('#toast').remove();
    $('body').append('<div id="toast" class="shadow"><i class="material-icons">' + icon + '</i>' + msg + '</div>');
    $('#toast').css("left","calc(1em + " + $("nav").width() + "px)");
    $('#toast').hide().fadeIn(500, function(){  $('#toast').delay(time).fadeOut(500, function(){ $('#toast').remove(); }); });
}

function scroll_smooth() {
    $("a[href^='#']").click(function(event) {
        event.preventDefault();

        if (document.height === null) { pageYOffset = document.documentElement.scrollTop; }
        var isNotNav = true;
        if ($(this).parent().prop("tagName")=="H3"||$(this).parent().prop("tagName")=="H2") { isNotNav = false; }

        var target = $(this.hash);
        var target_reverse = $(this);
        var target_bg;
        var reversible = true;

        function bg_change(t, color, time) {
            if (t[0].tagName == "TR") {
                t.children("td").css({
                    "background-color": color,
                    "transition": time
                });
            } else {
                t.css({
                    "background-color": color,
                    "transition": time
                });
            }
        }

        function scroll(target, event) {
            if (target[0].tagName == "TR") {
                target_bg = target.children("td").css("background-color");
            } else {
                target_bg = target.css("background-color");
            }

            if (isNotNav) {
                target_position = target.offset().top - event.pageY + pageYOffset + target.height() / 2;
            } else {
                target_position = target.offset().top - 114;
            }

            $('html, body').animate({
                scrollTop: target_position
            }, 500, function() {
                bg_change(target, target_bg, ".75s");
            });
        }

        scroll(target, event);
        bg_change(target, color.material_a100[color_i], ".25s");

        if (isNotNav) {
            toast("refresh", "원래 자리로 가려면 더블 클릭", 2500);
            document.ondblclick = function(event) {
                if (reversible) {
                    scroll(target_reverse, event);
                    bg_change(target_reverse, "#ffeb3b", ".25s");
                    reversible = false;
                }
            };
        }
        // alert(target_reverse.offset().top);
    });
}

// $(document).scroll(function() {
//     if (document.height === null) {
//         pageYOffset = document.documentElement.scrollTop;
//     }
//     if($( document ).width()>=600){
//         if (pageYOffset >= 89.88) {
//             $("nav").css({"position":"fixed",   "top":"1em", "max-height": "calc(100% -  4em)"});
//         } else{
//             $("nav").css({"position":"absolute","top":"7em", "max-height": "calc(100% - 10em)"});
//         }
//     }
// });

function title_tooltip(){
    $('[title]').attr( {
        'data-title': function() { return this.title; },'title': null } );
        $('body').append('<div id="tooltip"><div id="tooltip_text"></div><div id="tooltip_before"></div></div>');
        $("#tooltip").css({"background":color.material_700[color_i]});
        $("#tooltip").append($("#tooltip_before"));
        $("#tooltip_before").css({"border-color":color.material_700[color_i]+" transparent transparent transparent"});
        $('[data-title]').each(function(){
            $(this).hover(
                function(){
                    console.log($(this).attr('data-title'));
                    if (document.height === null) {pageYOffset = document.documentElement.scrollTop;}
                    var left = $(this).offset().left + ( $(this).outerWidth() - $('#tooltip').outerWidth() )/2;
                    if(left<=0){
                        left=0;
                    }
                    $('#tooltip_text').html($(this).attr('data-title'))
                    $('#tooltip').css({ 'visibility':'visible', 'opacity':1,
                    'top':$(this).offset().top - $(this).outerHeight() - pageYOffset - 12  + 'px',
                    'left':left + 'px'});
                },
                function(){$('#tooltip').css({ 'visibility':'hidden' , 'opacity':0 });}
            );
        }
    );
}

color = {
    "length":15,
    "material_50":[
        "#FFEBEE", "#FCE4EC", "#F3E5F5", "#EDE7F6", "#E8EAF6",
        "#E3F2FD", "#E1F5FE", "#E0F7FA", "#E0F2F1", "#E8F5E9",
        "#F1F8E9", "#F9FBE7", "#FFFDE7", "#FFF8E1", "#FFF3E0",
        "#FBE9E7", "#EFEBE9", "#FAFAFA", "#EFEBE9"
    ],
    "material_500":[
        "#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5",
        "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50",
        "#8BC34A", "#CDDC39", "#FDD835", "#FFC107", "#FF9800",  //yellow:600
        "#FF5722", "#795548", "#9E9E9E", "#607D8B"
    ],
    "material_700":[
        "#D32F2F", "#C2185B", "#7B1FA2", "#512DA8", "#303F9F",
        "#1976D2", "#0288D1", "#0097A7", "#00796B", "#388E3C",
        "#689F38", "#AFB42B", "#FBC02D", "#FFA000", "#F57C00",
        "#E64A19", "#5D4037", "#616161", "#455A64"
    ],
    "material_a100": [
        "#FF8A80", "#FF80AB", "#EA80FC", "#B388FF", "#8C9EFF",
        "#82B1FF", "#80D8FF", "#84FFFF", "#A7FFEB", "#B9F6CA",
        "#CCFF90", "#F4FF81", "#FFFF8D", "#FFE57F", "#FFD180",
        "#FF9E80", "#D7CCC8", "#F5F5F5", "#CFD8DC"
    ],
    "font": [
        "#FF8A80", "#FF80AB", "#EA80FC", "#B388FF", "#8C9EFF",
        "#82B1FF", "#80D8FF", "#84FFFF", "#A7FFEB", "#B9F6CA",
        "#CCFF90", "#F4FF81", "#FFFF8D", "#FFE57F", "#FFD180",
        "#FF9E80", "#D7CCC8", "#F5F5F5", "#CFD8DC"
    ]
}
function dice(n, s, b) {
    var r = Math.random();
    var s_for = 0;
    var out1 = 0,
    out2 = 0;
    for (jj = 0; jj < n; jj++) {
        for (ii = 0; ii < s; ii++) {
            s_for++;
            if (s_for >= s * r) {
                out1 = s_for;
                break;
            }
        }
        r = Math.random();
        s_for = 0;
        out2 = out2 + out1;
    }
    return out2 + b;
}
var color_i = dice(1, color.length, 0);

function coloring() {
    $("header").css({"background":color.material_700[color_i]});
    $("#sub_header .filter_bt, #column_bt").hover(function(){
        $(this).css({"background":color.material_700[color_i]});
    },function(){
        $(this).css({"background":color.material_500[color_i]});
    })
    $("#sub_header > #line1").css({"background":color.material_500[color_i]});
    $("dl .material-icons, a:not(nav a), #to_github, #to_github > i").css({"color":color.material_500[color_i],"fill":color.material_500[color_i]})

    $("link[rel~='icon']").attr("href", "images/favicon" + color_i + ".ico");
    $("meta[name='theme-color']").attr("content", color.material_700[color_i]);
}

function showMovie(src) {
    var url = src.replace("watch?v=", "embed/");
    $("body").append("<div id='movie_wrap'><iframe class='shadow' width='560' height='315' src='" + url + "?rel=0&amp;showinfo=0'  frameborder='0' allowfullscreen></iframe></div>")
    $("#movie_wrap").fadeIn(500);
    $("#movie_wrap").on("click",function(){
        $(this).fadeOut(500,function(){$(this).remove();})
    })
    $("#movie_wrap > iframe").css({
        "height": $("#movie_wrap > iframe").width()*315/560 + "px",
        "top":"calc(50% - " + $("#movie_wrap > iframe").width()*315/560/2 + "px)"
    });
}

function showImg(src)   {
    $("body").append("<div id='img_wrap'><img class='shadow' src='" + src + "'></img></div>")
    $("#img_wrap").fadeIn(500);;
    $("#img_wrap").on("click",function(){
        $(this).fadeOut(500,function(){$(this).remove();})
    })

    if($("#img_wrap > img").height()>=$(window).height()*.9){
        $("#img_wrap > img").css({"width":"initial","height":"90%","top":"5%"});
    } else {
        $("#img_wrap > img").css("top", function(){
            return "calc(50% - " + $(this).height()/2 + "px)"
        });
    }
}

function imgReady() {
    $("a[src]").each(function(){
        var src = $(this).attr("src");
        $(this).on("click",function(){showImg(src)});
        $(this).parent().after("<img src='"+src+"' hide />");   //이미지를 미리 불러와야 클릭했을 떄 높이 조절이 되는고얌
    });

    $("img").on("click",function(){                             //이미지를 클릭하면 크게 보이는 고얌
        showImg($(this).attr("src"));
    });
    
    var obj, flex, i, j;
    $(".img img").wrap("<div></div>");                          //.img로 묶인 이미지를 높이에 맞게 정렬
    $(".img").each(function(){
        obj = new Array();
        i = $(".img").index(this);
        $(this).children().each(function(){
            obj.push([$(this).children("img").width(),$(this).children("img").height()]);
        });
        $(this).children().each(function(){
            j = $(".img:nth(" + i + ") > div").index(this);
            flex = 100 * obj[j][0] * obj[0][1] / obj[j][1];
            console.log(i+"번 .img의 "+j+"번째 img 정렬: " + flex);
            $(this).css( {"flex" : flex } );
        });
    });
}

function columns(){
    if(column_only_mode!="true"){
        $("body").addClass("columns");
        var columns = Math.floor($("body").width()/500);
        if(columns<=1 ){
            $("body").removeClass("columns");
            $(".card_wrap").not(":first").css({"max-width":"600px"});
            setTimeout(function(){
                $('section.sub').masonry({
                    // options
                    itemSelector: '.card_wrap',
                    columnWidth: $("body").width()
                });
                headline();
            },100);
        }else{
            // $("body").addClass("columns");
            var c_w = $("body").width() / columns ;
            $(".card_wrap").not(":first").css({"max-width":c_w - 16 + "px"});
            console.log("columns: "+columns);
            setTimeout(function(){
                $('section.sub').masonry({
                    // options
                    itemSelector: '.card_wrap',
                    columnWidth: c_w
                });
                headline();
            },100);
            $("#column_bt i").text("view_stream");
        }
    }else{
        $("body").removeClass("columns");
        $(".card_wrap").not(":first").css({"max-width":"600px"});
        setTimeout(function(){
            $('section.sub').masonry({
                // options
                itemSelector: '.card_wrap',
                columnWidth: $("body").width()
            });
            headline();
        },100);
        $("#column_bt i").text("dashboard");
    }
}

var column_only_mode = window.localStorage['column_only_mode'];

$(window).resize(function() {
    columns();
});

function filter(){

    $("#column_bt").on("click",function(){
        if(column_only_mode == "false"){
            column_only_mode = "true";
        }else{
            column_only_mode = "false";
        }
        columns();
        window.localStorage['column_only_mode'] = column_only_mode;
    });

    function hide_all(){
        $("input").each(function(){
            if($(this).parent().parent().parent().parent().attr('class')=='card_wrap') {
                $(this).parent().parent().parent().parent().addClass("hide");
                // console.log(".card");
            } else if($(this).parent().parent().parent().attr('class')=='card_wrap'){
                $(this).parent().parent().parent().addClass("hide");
                // console.log("dl.card");
            } else if($(this).parent().parent().attr('class')=='card_wrap'){
                $(this).parent().parent().addClass("hide");
                // console.log("dl");
            }
            if(window.localStorage['strict_filtering'] == "true" && $(this).parent().parent().attr("id")!="setting"){
                $(this).prev().addClass("hide");
                $(this).next().addClass("hide");
                $(this).next().next().addClass("hide");
            } else {
                $(".card_wrap *.hide").removeClass("hide");
            }
        });
    }

    function filter_11(){
        $(".card_wrap").removeClass("hide");
        $("input").parent().children(".hide").removeClass("hide");
    }

    function filter_10(){
        hide_all();
        $("input[checked]").parent().parent().parent().parent(".card_wrap").removeClass("hide");
        $("input[checked]").parent().parent().parent(".card_wrap").removeClass("hide");
        $("input[checked]").parent().parent(".card_wrap").removeClass("hide");
        if(window.localStorage['strict_filtering'] == "true"){
            $("input[checked]").prev().removeClass("hide");
            $("input[checked]").next().removeClass("hide");
            $("input[checked]").next().next().removeClass("hide");
        }
    }

    function filter_01(){
        hide_all();
        $("input:not([checked]):not([failed]").parent().parent().parent().parent(".card_wrap").removeClass("hide");
        $("input:not([checked]):not([failed]").parent().parent().parent(".card_wrap").removeClass("hide");
        $("input:not([checked]):not([failed]").parent().parent(".card_wrap").removeClass("hide");
        if(window.localStorage['strict_filtering'] == "true"){
            $("input:not([checked]):not([failed])").prev().removeClass("hide");
            $("input:not([checked]):not([failed])").next().removeClass("hide");
            $("input:not([checked]):not([failed])").next().next().removeClass("hide");
        }
    }

    function filter_00(){
        hide_all();
        $("input[failed]").parent().parent().parent().parent(".card_wrap").removeClass("hide");
        $("input[failed]").parent().parent().parent(".card_wrap").removeClass("hide");
        $("input[failed]").parent().parent(".card_wrap").removeClass("hide");
        if(window.localStorage['strict_filtering'] == "true"){
            $("input[failed]").prev().removeClass("hide");
            $("input[failed]").next().removeClass("hide");
            $("input[failed]").next().next().removeClass("hide");
        }
    }

    if(window.localStorage['filter'] == "filter_10"){
        $("#sub_header .filter_bt").removeClass("on");
        $("#filter_10").addClass("on");
        filter_10();
    }else if(window.localStorage['filter'] == "filter_01") {
        $("#sub_header .filter_bt").removeClass("on");
        $("#filter_01").addClass("on");
        filter_01();
    }else if(window.localStorage['filter'] == "filter_00") {
        $("#sub_header .filter_bt").removeClass("on");
        $("#filter_00").addClass("on");
        filter_00();
    }else {
        // filter_11();
    }

    $("#sub_header .filter_bt").on("click",function(){
        $("#sub_header .filter_bt").removeClass("on");
        $(this).addClass("on");
        if($(this).attr("id")=="filter_11"){    //show all
            window.localStorage['filter'] = "filter_11";
            filter_11();
        }else if($(this).attr("id")=="filter_10"){  //show acheieved
            window.localStorage['filter'] = "filter_10";
            filter_10();
        }else if($(this).attr("id")=="filter_01"){  //show notyet
            window.localStorage['filter'] = "filter_01";
            filter_01();
        }else if($(this).attr("id")=="filter_00"){  //show notyet
            window.localStorage['filter'] = "filter_00";
            filter_00();
        }
        columns();
    });

}

function headline(){

    $("section.sup > h3").each(function(){
        if($(this).next().height()==0){
            $(this).css("display","none");
        }else{
            $(this).css("display","block");
        };
    });
    $("h2:not(nav h2)").each(function(){
        if($(this).next().height()==0){
            $(this).css("display","none");
        }else{
            $(this).css("display","block");
        };
    });
}

function checkbox(){
    $("input[checked]").before("<i class='material-icons'>check_box</i>");
    $("input:not([checked]):not([failed])").before("<i class='material-icons'>check_box_outline_blank</i>");
    $("input[failed]").before("<i class='material-icons'>priority_high</i>");

    $("a[href]:not(nav a):not([href$='sharing']):not([href^='#'])").prepend("<i class='material-icons'>open_in_new</i>");
    $("a[href$='sharing']").prepend("<i class='material-icons'>save</i>");
    $("a[href^='#']:not(nav a)").prepend("<i class='material-icons'>find_in_page</i>");
    $("a[onclick]").prepend("<i class='material-icons'>theaters</i>");
    $("a[src]").prepend("<i class='material-icons'>photo</i>");
}

function card_wrap(){
    $(".card").each(function(){
        $(this).after("<div class='card_wrap'></div>")
        $(this).appendTo($(this).next());
    });
    $("dl").each(function(){
        if($(this).parent().attr("class")=="sub"){
            $(this).after("<div class='card_wrap'></div>")
            $(this).appendTo($(this).next());
        }
    });
    $(".back li").each(function(){
        $(this).replaceWith('<li><span>' + $(this).html() +'</span></li>');
    });
}

function percentage(){
    $("h1").append("<class class='percentage'>" + ($("input[checked]").length / ($("input").length - $("input[failed]").length) * 100).toFixed(0) + "% (" +
    $("input[checked]").length + "/" + ($("input").length - $("input[failed]").length) + ")</span>");

    $("h2:not(nav h2)").each(function(){
        var i = $("h2").index(this);
        $(this).append( "<span class='percentage'>" + ($("h2:nth(" + i + ") + section.sup input[checked]").length / $("h2:nth(" + i + ") + section.sup input").length * 100).toFixed(0) + "%</span>" );
    });

    $("h3:not(nav h3)").each(function(){
        var i = $("h3").index(this);
        $(this).append( "<span class='percentage'>" + ($("h3:nth(" + i + ") + section.sub input[checked]").length / $("h3:nth(" + i + ") + section.sub input").length * 100).toFixed(0) + "%</span>" );
    });
}

function setting(){
    function check_setting(){
        $("#setting input").each(function(){
            // $(this)
        });

        $("#strict_filtering input").prev("i").remove();
        if(window.localStorage['strict_filtering'] == "true"){
            $("#strict_filtering input").attr("checked",true);
        }else {
            $("#strict_filtering input").attr("checked",false);
        }

        $("#setting input[checked]").before("<i class='material-icons'>check_box</i>");
        $("#setting input:not([checked]):not([failed])").before("<i class='material-icons'>check_box_outline_blank</i>");
        $("#setting .material-icons").css({"color":color.material_500[color_i]});

        $("#setting input").next().next().next(".off").removeClass("hide");
        $("#setting input").next().next(".on").removeClass("hide");
        $("#setting input[checked]").next().next().next(".off").addClass("hide");
        $("#setting input:not([checked])").next().next(".on").addClass("hide");
    }
    $("#setting_bt").on("click", function(){
        // $(this).css("color",color.material_500[color_i]);
        $('#tooltip_nav').css({ 'visibility':'hidden' , 'opacity':"0" });
        $("#setting, #setting_bg").toggleClass("on");
        $("#setting").css({"top":$("#setting_bt").offset().top - pageYOffset,"left":$("#nav").width()-16});
        check_setting();
    });
    $("#strict_filtering").on("click",function(){
        if(window.localStorage['strict_filtering'] == "true"){
            window.localStorage['strict_filtering'] = "false"
        }else {
            window.localStorage['strict_filtering'] = "true"
        }
        filter();
        columns();
        check_setting();
    });
}

$(function() {
    setting();
    percentage();
    card_wrap();
    nav_create();
    scroll_smooth();
    checkbox();
    filter();
    columns();
    title_tooltip();
    imgReady();
    coloring();
});
