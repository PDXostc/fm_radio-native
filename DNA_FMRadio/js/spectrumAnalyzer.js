$( document ).ready(function() {
function fluctuate(bar) {
    var hgt = Math.random() * 10;
    hgt += 1;
    var t = hgt * 30;

    bar.animate({
        height: hgt
    }, t, function() {
        fluctuate($(this));
    });
}

$(".bar").each(function(i) {
    fluctuate($(this));
});
});
