color = {
    "length":19,
    "material_50":[
        "#FFEBEE", "#FCE4EC", "#F3E5F5", "#EDE7F6", "#E8EAF6",
        "#E3F2FD", "#E1F5FE", "#E0F7FA", "#E0F2F1", "#E8F5E9",
        "#F1F8E9", "#F9FBE7", "#FFFDE7", "#FFF8E1", "#FFF3E0",
        "#FBE9E7", "#EFEBE9", "#FAFAFA", "#EFEBE9"
    ],
    "material_100":[
        "#FFCDD2", "#F8BBD0", "#E1BEE7", "#D1C4E9", "#C5CAE9",
        "#BBDEFB", "#B3E5FC", "#B2EBF2", "#B2DFDB", "#C8E6C9",
        "#DCEDC8", "#F0F4C3", "#FFF9C4", "#FFECB3", "#FFE0B2",
        "#FFCCBC", "#D7CCC8", "#F5F5F5", "#CFD8DC"
    ],
    "material_300":[
        "#E57373", "#F06292", "#BA68C8", "#9575CD", "#7986CB",
        "#64B5F6", "#4FC3F7", "#4DD0E1", "#4DB6AC", "#81C784",
        "#AED581", "#DCE775", "#FFF176", "#FFD54F", "#FFB74D",
        "#FF8A65", "#A1887F", "#E0E0E0", "#90A4AE"
    ],
    "material_500":[
        "#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5",
        "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50",
        "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800",
        "#FF5722", "#795548", "#9E9E9E", "#607D8B"
    ],
    "material_600": [
        "#E53935", "#D81B60", "#8E24AA", "#5E35B1", "#3949AB",
        "#1E88E5", "#039BE5", "#00ACC1", "#00897B", "#43A047",
        "#7CB342", "#C0CA33", "#FDD835", "#FFB300", "#FB8C00",
        "#F4511E", "#6D4C41", "#757575", "#546E7A"
    ],
    "material_700":[
        "#D32F2F", "#C2185B", "#7B1FA2", "#512DA8", "#303F9F",
        "#1976D2", "#0288D1", "#0097A7", "#00796B", "#388E3C",
        "#689F38", "#AFB42B", "#FBC02D", "#FFA000", "#F57C00",
        "#E64A19", "#5D4037", "#616161", "#455A64"
    ],
    "material_800": [
        "#C62828", "#AD1457", "#6A1B9A", "#4527A0", "#283593",
        "#1565C0", "#0277BD", "#00838F", "#00695C", "#2E7D32",
        "#558B2F", "#9E9D24", "#F9A825", "#FF8F00", "#EF6C00",
        "#D84315", "#4E342E", "#424242", "#37474F"
    ],
    "material_900":[
        "#B71C1C", "#880E4F", "#4A148C", "#311B92", "#1A237E",
        "#0D47A1", "#01579B", "#006064", "#004D40", "#1B5E20",
        "#33691E", "#827717", "#F57F17", "#FF6F00", "#E65100",
        "#BF360C", "#3E2723", "#212121", "#263238"
    ],
    "material_a100": [
        "#FF8A80", "#FF80AB", "#EA80FC", "#B388FF", "#8C9EFF",
        "#82B1FF", "#80D8FF", "#84FFFF", "#A7FFEB", "#B9F6CA",
        "#CCFF90", "#F4FF81", "#FFFF8D", "#FFE57F", "#FFD180",
        "#FF9E80", "#D7CCC8", "#F5F5F5", "#CFD8DC"
    ],
    "name": [
        "Red",          "Pink",          "Purple",      "Deep Purple",  "Indigo",
        "Blue",         "Light Blue",    "Cyan",        "Teal",         "Green",
        "Light Green",  "Lime",          "Yellow",      "Amber",        "Orange",
        "Deep Orange",  "Brown",         "Grey",        "Blue Grey"
    ]
}
function dice(n, s, b) {
    var out = 0;
    for (i = 0; i < n; i++) {
        out += Math.ceil( Math.random() * s );
    }
    return out + b;
}

if(window.localStorage["theme_color"] == "true") {
    color.i = window.localStorage["theme_color__i"];
} else {
    color.i = dice(1, color.length, -1);
}

if(color.i == 12 /*yellow*/){ color.material_500 = color.material_600; }
if(color.i == 17 /* grey */){ color.i = 5; }
console.log("COLOR CODE: " + color.name[color.i]);

function coloring() {
    $("header").css({"background":color.material_700[color.i]});
    $("#sub_header .filter_bt, #column_bt").hover(function(){
        $(this).css({"background":color.material_700[color.i]});
    },function(){
        $(this).css({"background":color.material_500[color.i]});
    })
    $("#sub_header > #line1").css({"background":color.material_500[color.i]});
    $("dl .material-icons, a:not(nav a), #to_github, #to_github > i").css({"color":color.material_500[color.i],"fill":color.material_500[color.i]})

    $("link[rel~='icon']").attr("href", "img/[favicon]/favicon" + color.i + ".ico");
    $("meta[name='theme-color']").attr("content", color.material_700[color.i]);
}

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
        $("nav, #sub_header, #nav_footer > i").removeClass("fold");
        setTimeout(function(){
            $("body").removeClass("fold");
        },300);
        window.localStorage['nav_fold'] = "false";
    }

    function nav_fold(){
        $("nav, #sub_header, #nav_footer > i").addClass("fold");
        setTimeout(function(){
            $("body").addClass("fold");
        },300);
        window.localStorage['nav_fold'] = "true";
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
        setTimeout(function(){columns();},300);
        // columns();
    });

    $('body').append('<div id="tooltip_nav"><div id="tooltip_nav_text"></div><div id="tooltip_nav_before"></div></div>');
    $("#tooltip_nav").css({"background":color.material_700[color.i]});
    $("#tooltip_nav").append($("#tooltip_before"));
    $("#nav h3").hover(function(){
        if($("nav").attr("class")=="fold"){
            if (document.height === null) {pageYOffset = document.documentElement.scrollTop;}
            $('#tooltip_nav_text').html($(this).children("a").children("span:nth(0)").text());
            $('#tooltip_nav').css({ 'visibility':'visible', 'opacity':1,
            'top':$(this).offset().top - pageYOffset  + 'px',
            'left':68 + 16 + 'px'});
            $("#tooltip_nav_before").css({"border-color":"transparent " + color.material_700[color.i] + " transparent transparent", "border-width": "1ex 1ex 1ex 0","left":"-.9ex","bottom":"calc(50% - .5em)"});
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
            $("#tooltip_nav_before").css({"border-color":"transparent " + color.material_700[color.i] + " transparent transparent", "border-width": "1ex 1ex 1ex 0","left":"-.9ex","bottom":"calc(50% - .5em)"});
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
            $("#tooltip_nav_before").css({"border-color":"transparent " + color.material_700[color.i] + " transparent transparent", "border-width": "1ex 1ex 1ex 0","left":"-.9ex","bottom":"calc(50% - .5em)"});
        }
    },
    function(){$('#tooltip_nav').css({ 'visibility':'hidden' , 'opacity':"0" });});

    //for mobile
    $("nav a").on("click",function(){ $("nav, #nav_bg").removeClass("on"); });
}

function toast(msg, icon, time) {
    if ( icon == null ) { icon = "priority_high"; }
    if ( time == null ) { time = 1500; }

    $('#toast').remove();
    $('body').append('<div id="toast" class="shadow"><i class="material-icons">' + icon + '</i>' + msg + '</div>');
    $('#toast').css("left","calc(1em + " + $("nav").width() + "px)").addClass("on").removeClass("off");

    setTimeout(function(){
        $("#toast").addClass("off").removeClass("on", function() { $(this).delay(300).remove(); });
    }, time + 300);
}

function scroll_smooth() {
    $("[href^='#']").click(function(event) {
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
            } else if(target.css("display") != "none") {
                target_position = target.offset().top - 114;
            } else {
                toast("항목이 없습니다.");
            }

            $('html, body').animate({
                scrollTop: target_position
            }, 500, function() {
                bg_change(target, target_bg, ".75s");
            });
        }

        scroll(target, event);
        bg_change(target, color.material_a100[color.i], ".25s");

        if (isNotNav) {
            toast("원래 자리로 가려면 더블 클릭.", "refresh", 2500);
            document.ondblclick = function(event) {
                if (reversible) {
                    scroll(target_reverse, event);
                    bg_change(target_reverse, color.material_a100[color.i], ".25s");
                    reversible = false;
                }
            };
        }
        // alert(target_reverse.offset().top);
    });
}

function scroll_at_open(){

    if(window.location.href.substring(window.location.href.length-8, window.location.href.length) != window.location.pathname.substring(window.location.pathname.length-8, window.location.pathname.length)){
        setTimeout(function(){
            $('html, body').animate({
                scrollTop: $(window.location.href.substring(window.location.href.indexOf("#"))).offset().top - 116
            }, 500);
        },250)
    }
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
        $("#tooltip").css({"background":color.material_700[color.i]});
        $("#tooltip").append($("#tooltip_before"));
        $("#tooltip_before").css({"border-color":color.material_700[color.i]+" transparent transparent transparent"});
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
                    'top':$(this).offset().top - $('#tooltip').outerHeight() - pageYOffset - 12  + 'px',
                    'left':left + 'px'});
                },
                function(){$('#tooltip').css({ 'visibility':'hidden' , 'opacity':0 });}
            );
        }
    );
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

function imgReady() {

    function showImg(src)   {
        $("body").append("<div id='img_wrap'><img class='shadow' src='" + src + "'></img></div>")
        $("#img_wrap").fadeIn(500);;
        $("#img_wrap").on("click",function(){
            $(this).fadeOut(500,function(){$(this).remove();})
        })

        $("#img_wrap > img").load(function(){
            if($("#img_wrap > img").height()>=$(window).height()*.9){
                $("#img_wrap > img").css({"width":"initial","height":"90%","top":"5%"});
            } else {
                $("#img_wrap > img").css("top", function(){
                    return "calc(50% - " + $(this).height()/2 + "px)"
                });
            }
        });
    }

    $("a[src]").each(function(){
        var src = $(this).attr("src");
        $(this).on("click",function(){showImg(src)});
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
            // console.log(i+"번 값 저장: " + $(this).children("img").width() + ", " + $(this).children("img").height());
        });
        $(this).children().each(function(){
            j = $(".img:nth(" + i + ") > div").index(this);
            flex = 100 * obj[j][0] * obj[0][1] / obj[j][1];
            // console.log(i+"번 .img의 "+j+"번째 img 정렬: " + flex);
            $(this).css( {"flex" : flex + "%" } );
        });
    });
}

function columns(){
    if(column_only_mode!="true"){
        $("body").addClass("columns");
        $("#column_bt i").text("view_stream");
        var columns = Math.floor($("body").width()/500);
        if(columns<=1 ){
            $("body").removeClass("columns");
            $("#column_bt").addClass("disabled");
            $(".card_wrap").not(":first").css({"max-width":"600px"});
            // setTimeout(function(){
            $('section.sub').masonry({
                // options
                itemSelector: '.card_wrap',
                columnWidth: $("body").width()
            });
            headline();
            // toast("priority_high", "창 너비가 좁아 단일 열로 보여집니다.");
            // },100);
        }else{
            // $("body").addClass("columns");
            $("#column_bt").removeClass("disabled");
            var c_w = $("body").width() / columns ;
            $(".card_wrap").not(":first").css({"max-width":c_w - 16 + "px"});
            console.log("columns: "+columns);
            // setTimeout(function(){
            $('section.sub').masonry({
                // options
                itemSelector: '.card_wrap',
                columnWidth: c_w
            });
            headline();
            // },100);
        }
    }else{
        $("body").removeClass("columns");
        $("#column_bt i").text("dashboard");
        var columns = Math.floor(($("html").width()-$("nav").width()-152)/500);
        if(columns<=1 ){
            $("#column_bt").addClass("disabled");
        }else{
            $("#column_bt").removeClass("disabled");
        }
        $(".card_wrap").not(":first").css({"max-width":"600px"});
        // setTimeout(function(){
        $('section.sub').masonry({
            // options
            itemSelector: '.card_wrap',
            columnWidth: $("body").width()
        });
        headline();
        // },100);
    }
}

var column_only_mode = window.localStorage['column_only_mode'];

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

    // $("a[href]:not(nav a):not([href$='.zip']):not([href^='#'])").prepend("<i class='material-icons'>open_in_new</i>");
    // $("a[href$='.zip']").prepend("<i class='material-icons'>save</i>");
    // $("a[href^='#']:not(nav a)").prepend("<i class='material-icons'>find_in_page</i>");
    // $("a[onclick]").prepend("<i class='material-icons'>theaters</i>");
    // $("a[src]").prepend("<i class='material-icons'>photo</i>");
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
    var percent_total;
    function  checke_total() {
        percent_total = ($("input[checked]").length / ($("input").length - $("input[failed]").length) * 100).toFixed(0);
        if(percent_total >= 75){ $("#재귀함수_75").attr("checked", true); }
        if(percent_total >= 50){ $("#재귀함수_50").attr("checked", true); }
        if(percent_total >= 25){ $("#재귀함수_25").attr("checked", true); }

        if(percent_total != ($("input[checked]").length / ($("input").length - $("input[failed]").length) * 100).toFixed(0)) {
            checke_total();
        }
    }
    checke_total();

    if(percent_total >= 75){
        $("#재귀함수_75 + dt + dd > .date").text("." + percent_total + " 완료");
    } else if(percent_total >= 50){
        $("#재귀함수_50 + dt + dd > .date").text("." + percent_total + " 완료");
    } else if(percent_total >= 25){
        $("#재귀함수_25 + dt + dd > .date").text("." + percent_total + " 완료");
    }

    $("h1").append("<class class='percentage'>" + percent_total + "% (" +
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

    var item = [
        "strict_filtering", "theme_color",
        "cccv", "cccv__style", "cccv__to_here"
    ];

    function check_setting(){

        $("#setting .header").css({"background":color.material_500[color.i]});
        $("#setting .setting_item input").prev("i").remove();

        for(i=0;i<item.length;i++){
            if(window.localStorage[ item[i] ] == "true"){
                $("#" + item[i] + " input").attr("checked",true);
            }else {
                $("#" + item[i] + " input").attr("checked",false);
            }
        };

        $("#setting input[checked]").before("<i class='material-icons'>check_box</i>");
        $("#setting input:not([checked]):not([failed])").before("<i class='material-icons'>check_box_outline_blank</i>");
        $("#setting .material-icons").css({"color":color.material_500[color.i]});

        $("#setting input").next().next().next(".off").removeClass("hide");
        $("#setting input").next().next(".on").removeClass("hide");
        $("#setting input[checked]").next().next().next(".off").addClass("hide");
        $("#setting input:not([checked])").next().next(".on").addClass("hide");

        // 개별 적용
        if(window.localStorage["theme_color"] == "true"){
            $("#theme_color dd.on").text("현재 색(" + color.name[color.i] + ")이 테마 색으로 지정되었습니다.");
        }
        if(window.localStorage["cccv"] == "false"){
            $("#cccv__style").addClass("disabled");
            $("#cccv__to_here").addClass("disabled");
        } else {
            $("#cccv__style").removeClass("disabled");
            $("#cccv__to_here").removeClass("disabled");
        }
    }
    $("#setting_bt").on("click", function(){
        // $(this).css("color",color.material_500[color.i]);
        $('#tooltip_nav').css({ 'visibility':'hidden' , 'opacity':"0" });
        $("#setting, #setting_bg").toggleClass("on");
        $("#setting").css({"top":$("#setting_bt").offset().top - pageYOffset,"left":$("#nav").width()-16});
        check_setting();
    });
    $("#setting > .setting_item").on("click",function(){
        // console.log($(this).hasClass("disabled"));
        if(!$(this).hasClass("disabled")){
            var i = $("#setting > .setting_item").index(this);
            if(window.localStorage[item[i]] == "true"){
                window.localStorage[item[i]] = "false"
            }else {
                window.localStorage[item[i]] = "true"
            }
            toast("설정이 저장되었습니다.", "save");

            if($(this)[0] == $("#theme_color")[0] && window.localStorage["theme_color"] == "true"){
                window.localStorage["theme_color__i"] = color.i;
            }

            filter();
            columns();
            check_setting();
        }
    });

}

function contextmenu() {
    $("body").on("contextmenu", function(event) { event.preventDefault(); });
    $(".card_wrap").on("contextmenu", function(event) {
        // event.preventDefault();
        if(window.localStorage["cccv"] == "true"){
            var c = $("#contextmenu");
            var target = $(this);
            var output = "";

            function print() {
                if(window.localStorage["cccv__style"] == "true"){
                    output += '<link rel="stylesheet" type="text/css" href="http://admin0.github.io/bucket/style_card.css">\n<style>\n\t.card_wrap { margin:1em auto; display: block; font-size: 16px; }\n</style>\n\n';
                }
                output += '<div class=card_wrap>' + target.html() + '</div>';
                if(window.localStorage["cccv__to_here"] == "true"){
                    var id;
                    if(target.children().attr("id") != null){
                        id = "#"+target.children().attr("id");
                    } else if(target.children().children().attr("id") != null){
                        id = "#"+target.children().children().attr("id");
                    } else {
                        id = "";
                    }
                    output = '<h2><a href="http://admin0.github.io/bucket/'+id+'">버킷리스트</a></h2>\n\n' + output;
                }
                $("#contextmenu > .output").val(output).select();
            }

            function set_location(){

                var context_x,
                context_y,
                con_sub_x,
                con_sub_y;
                if ($(document).width() - $("#contextmenu").outerWidth() > event.pageX) {
                    context_x = event.pageX;
                } else {
                    context_x = $(document).width() - $("#contextmenu").outerWidth();
                }
                if ($(window).height() - $("#contextmenu").outerHeight() > event.pageY - $(document).scrollTop()) {
                    context_y = event.pageY - $(document).scrollTop();
                } else {
                    context_y = $(window).height() - $("#contextmenu").outerHeight();
                }
                $("#contextmenu").css({
                    'left': context_x + "px",
                    'top': context_y + "px"
                }).addClass("on");
                $('.contextmenu').parent().hover(function() { //하위 메뉴 항목
                    if ($(document).width() - $("#contextmenu").outerWidth() - target.children().last().outerWidth() > event.pageX) {
                        con_sub_x = 'calc(100% - .5em)';
                    } else {
                        con_sub_x = 'calc(' + (-target.children().last().outerWidth()) + 'px + .5em)';
                    }
                    if ($(window).height() - target.children().last().outerHeight() - target.position().top > event.pageY - $(document).scrollTop()) {
                        con_sub_y = '-7px';
                    } else {
                        con_sub_y = $(window).height() - $("#contextmenu").position().top - target.position().top - target.children().last().outerHeight() + 'px';
                    }
                    target.children().last().css({
                        'left': con_sub_x,
                        'top': con_sub_y
                    });
                });
            }

            set_location();
            print();
        }
    })
    $(document).on("click", function() {
        if ($('#contextmenu:hover').length > 0) {
            if ($('.context_able:hover').length > 0) {
                //      $('#output_for_contextmenu').html('1');
                $("#contextmenu").removeClass("on");
            } else {
                //      $('#output_for_contextmenu').html('2');
            }
        } else {
            //    $('#output_for_contextmenu').html('3');
            $("#contextmenu").removeClass("on");
        }
    });
}

$(window).scroll(function(){
    for(i=$("h3:not(nav h3)").length-1; i>=0; i--){
        var target = $("h3:not(nav h3):nth("+i+")");
        // console.log(target.offset().top);
        if(target.offset().top < pageYOffset + 256 && target.css("display") != "none"){
            $("nav h3 a").css({"color":"inherit"});
            $("nav h3:nth("+i+") a").css({"color":color.material_500[color.i]});
            // console.log(target.text());
            break;
        }
    }
    // $("h2:not(nav h2), h3:not(nav h3)").each(function(){
    //     if($(this).offset().top < pageYOffset){
    //         console.log($(this).text());
    //     }
    // });
    // console.log("sex");
});

$(window).resize(function() {
    columns();
});

$(document).ready(function(){
        setting();
        percentage();
        card_wrap();
        nav_create();
        scroll_smooth();
        checkbox();
        filter();
        title_tooltip();
        columns();
        contextmenu();
        coloring();
});

$(window).load(function() {
    setTimeout(function () {
        columns();
        scroll_at_open();
    }, 0);
    imgReady();

});
