// ==UserScript==
// @name         PyroEssentials
// @namespace    http://pyro2022.github.io
// @version      0.2.3
// @description  Take over CSDN and IDM
// @author       pyro2022
// @match        *://*/*
// @icon         https://tse2-mm.cn.bing.net/th/id/OIP-C.Xe7xsJ_q1ymkHn_HB5OGWAHaHa?w=172&h=180&c=7&r=0&o=5&pid=1.7
// @grant        none
// ==/UserScript==

(function() {
    //设置  启用：true  关闭：false
    //Srttings
        //CSDN设置
        //CSDN Settings
        var copyAvailable = true;//允许功能》》无需登录复制
        var modifyReward = true;//允许改动》》移除打赏
        var modifyIcon = true;//允许改动》》更改图标
    function ClosePage() {
        if (navigator.userAgent.indexOf("MSIE") > 0) {
            if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {
                window.opener = null; window.close();
            }else {
                window.open('', '_top'); window.top.close();
            }
        }else if (navigator.userAgent.indexOf("Firefox") > 0) {
            window.location.href = 'about:blank ';
            //火狐默认状态非window.open的页面window.close是无效的
            //window.history.go(-2);
        }else {
            window.opener = null;
            window.open('', '_self', '');
            window.close();
        }
    }
    var url = window.location.href;
    //alert(url);
    if(url.includes('csdn.net')){
        if(url.includes('article')){
            if(copyAvailable){//复制功能
                document.body.contentEditable = true;
                document.getElementsByClassName('time')[0].innerHTML += ' | 已自动开启无需登录复制模式';
                document.getElementsByClassName('hljs-button signin')[0].innerHTML = '';
            }
            if(modifyReward){//打赏去除
                document.getElementsByClassName('tool-item tool-item-size tool-active tool-item-reward').innerHTML = '';
            }
            if(modifyIcon){//更改图标
                var currentIcon = "https://s1.ax1x.com/2023/01/29/pSaYJCd.png"; //图床上的图标，黑色字体，背景不变
                var link = document.querySelector('link[rel*="icon"]');
                link.href = currentIcon;
            }
        }
    }
    document.getElementsByClassName('ns-tnvv0-e-0 x-layout GoogleActiveViewElement web-on-show')[0].innerHTML = '';//去除部分谷歌广告，未验证效果
    document.getElementById('aswift_2')[0].src = '';
    document.getElementById('aswift_1')[0].src = '';
    if(url.includes('internetdownloadmanager.com/download')){
        ClosePage();
    }
})();