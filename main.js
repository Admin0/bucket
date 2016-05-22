function nav_create() {
    $("body").prepend("<nav></nav>");
    // $("nav").prepend("<section id='in-page'></section>");
    $("h2,h3,h4").each(function(){
        $(this).clone()
        .html("<a href='#"+$(this).attr("id")+"'>"+$(this).text()+"</a>")
        .attr("id",null)
        .appendTo($("nav"));
        // .appendTo($("#in-page"));
    })
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

            target_position = target.offset().top - 15;

            $('html, body').animate({
                scrollTop: target_position
            }, 300, function() {
                bg_change(target, target_bg, ".75s");
            });
        }

        scroll(target, event);
        bg_change(target, "#"+color.material_a100[color_i - 1], ".25s");
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


$(function() {
    nav_create();
    scroll_smooth();
});
