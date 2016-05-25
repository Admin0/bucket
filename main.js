function nav_create() {
    $("body").prepend("<nav></nav>");
    // $("nav").prepend("<section id='in-page'></section>");
    $("h2,h3").each(function(){
        $(this).clone()
        .html("<a href='#"+$(this).attr("id")+"'>"+$(this).html()+"</a>")
        .attr("id",null)
        .appendTo($("nav"));
        // .appendTo($("#in-page"));
    })

    //for mobile
    $("nav a").on("click",function(){ $("nav, #nav_bg").removeClass("on"); });
}

function scroll_smooth() {
    $("a[href^='#']").click(function(event) {
        event.preventDefault();

        if (document.height === null) {
            pageYOffset = document.documentElement.scrollTop;
        }

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

            target_position = target.offset().top - 56;

            $('html, body').animate({
                scrollTop: target_position
            }, 500, function() {
                bg_change(target, target_bg, ".75s");
            });
        }

        scroll(target, event);
        bg_change(target, color.material_a100[color_i - 1], ".25s");
        // toast("원래 자리로 가려면 더블클릭");

        // document.ondblclick = function(event) {
        //     if (reversible) {
        //         scroll(target_reverse, event);
        //         bg_change(target_reverse, "#ffeb3b", ".25s");
        //         reversible = false;
        //     }
        // };
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
        "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800",
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
    $("#sub_header").css({"background":color.material_500[color_i]});
    $("input, a:not(nav a)").css({"color":color.material_500[color_i]})
}

function card_wrapping() {
    $(".card").each(function(){
        $(this).after("<div class='card_wrap'></div>")
        $(this).appendTo($(this).next());
    })
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
    $("img").on("click",function(){
        showImg($(this).attr("src"));
    });
}

function columns(){
    var columns = Math.floor(($(document).width() - 256 - 32)/400);
    if(columns<=0){columns = 1}
    $("section").css({"column-count":columns});
    // $("body").css({"width":400*columns+"px"});
}
$( window ).resize(function() {
    columns();
});

function filter(){
$("#sub_header .filter_bt").on("click",function(){
    console.log("dddd");
    $("#sub_header .filter_bt").removeClass("on");
    $(this).addClass("on");
    if($(this).attr("id")=="filter_11"){    //show all
        $("input").parent().parent().css({"display":"inline-block"});
    }else if($(this).attr("id")=="filter_10"){  //show acheieved
        $("input:not([checked])").parent().parent().css({"display":"none"});
            $("input[checked]").parent().parent().css({"display":"inline-block"});
    }else{  //show notyet
        $("input[checked]").parent().parent().css({"display":"none"});
            $("input:not([checked])").parent().parent().css({"display":"inline-block"});
    }
});
}

$(function() {
    imgReady();
    nav_create();
    scroll_smooth();
    coloring();
    columns();
    filter();
});
