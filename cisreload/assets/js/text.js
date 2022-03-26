if (!!window.ActiveXObject || "ActiveXObject" in window) { //is IE?
    alert('朋友，上古浏览器不支持呢~');
}
let divTyping = document.getElementById('xf_type')
let i = 0,
    timer = 0,
    str = '此页面由原生HTML，CSS，JS开发! 本站UI由小枫原创，并且源图和代码全部开源供大家学习使用(严禁商用)。' //text
    //本人能够能够灵活使用PS,AI,PR,AE,CAD软件的操作,熟练HTML5,CSS3,JavaScript等前端开发技术。并且在学习这些技术的过程中运营过idc行业, 通过售卖云服的过程中学到如何去维护网站及服务器。 21 年下半年有过半年的电商美工经验, 做过淘宝、 拼多多、 虾皮、 速卖通、 国际站平台店铺的装修。（ 轮播、 海报、 LOGO....）淘宝（ PC端首页, 详情）, 速卖通, 国际站平台兼容代码装修实现动态交互效果 兼容CSS3、 banner、 雪花效果、 循环渐变效果....。差不多就这些吧。
function typing() {
    if (i <= str.length) {
        divTyping.innerHTML = str.slice(0, i++) + '_'
        timer = setTimeout(typing, 150) //time
    } else {
        divTyping.innerHTML = str
        clearTimeout(timer)
    }
}

typing()
var binft = function (r) {
    function t() {
        return b[Math.floor(Math.random() * b.length)]
    }
    function e() {
        return String.fromCharCode(94 * Math.random() + 33)
    }
    function n(r) {
        for (var n = document.createDocumentFragment(), i = 0; r > i; i++) {
            var l = document.createElement("span");
            l.textContent = e(),
                l.style.color = t(),
                n.appendChild(l)
        }
        return n
    }
    function i() {
        var t = o[c.skillI];
        c.step ? c.step-- : (c.step = g, c.prefixP < l.length ? (c.prefixP >= 0 && (c.text += l[c.prefixP]), c.prefixP++) : "forward" === c.direction ? c.skillP < t.length ? (c.text += t[c.skillP], c.skillP++) : c.delay ? c.delay-- : (c.direction = "backward", c.delay = a) : c.skillP > 0 ? (c.text = c.text.slice(0, -1), c.skillP--) : (c.skillI = (c.skillI + 1) % o.length, c.direction = "forward")),
            r.textContent = c.text,
            r.appendChild(n(c.prefixP < l.length ? Math.min(s, s + c.prefixP) : Math.min(s, t.length - c.skillP))),
            setTimeout(i, d)
    }
    var l = "",
        o = ["大道至简,开发由我","饿了么,一起来学习吧",].map(function (r) {
            return r + "."
        }),
        a = 2,
        g = 1,
        s = 5,
        d = 75,
        b = ["rgb(110,64,170)", "rgb(150,61,179)", "rgb(191,60,175)", "rgb(228,65,157)", "rgb(254,75,131)", "rgb(255,94,99)", "rgb(255,120,71)", "rgb(251,150,51)", "rgb(226,183,47)", "rgb(198,214,60)", "rgb(175,240,91)", "rgb(127,246,88)", "rgb(82,246,103)", "rgb(48,239,130)", "rgb(29,223,163)", "rgb(26,199,194)", "rgb(35,171,216)", "rgb(54,140,225)", "rgb(76,110,219)", "rgb(96,84,200)"],
        c = {
            text: "",
            prefixP: 10,
            skillI: 0,
            skillP: 0,
            direction: "forward",
            delay: a,
            step: g
        };
    i()
};
binft(document.getElementById('xf_txt'));