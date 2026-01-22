/*!
 * QQ JavaScript SDK v1.0.0
 * (c) 2013-2014 Tencent, All rights reserved.
 * QQ互联JS SDK - http://connect.qq.com/
 */
(function() {
    var mqq = window.mqq || {};
    
    // 检测是否在QQ内置浏览器中
    mqq.isQQ = function() {
        var ua = navigator.userAgent.toLowerCase();
        return ua.indexOf('mqqbrowser') > -1 && ua.indexOf('qq/') > -1;
    };
    
    // 检测应用是否安装
    mqq.isAppInstalled = function(params, callback) {
        if (!mqq.isQQ()) {
            callback && callback({
                code: -1,
                message: '非QQ浏览器环境'
            });
            return;
        }
        
        if (typeof mqq !== 'undefined' && mqq.invoke) {
            mqq.invoke('app', 'isAppInstalled', params, function(result) {
                callback && callback(result);
            });
        } else {
            callback && callback({
                code: -2,
                message: 'QQ SDK未加载'
            });
        }
    };
    
    // 调起应用
    mqq.launchApp = function(params, callback) {
        if (!mqq.isQQ()) {
            callback && callback({
                code: -1,
                message: '非QQ浏览器环境'
            });
            return;
        }
        
        if (typeof mqq !== 'undefined' && mqq.invoke) {
            mqq.invoke('app', 'launchApp', params, function(result) {
                callback && callback(result);
            });
        } else {
            callback && callback({
                code: -2,
                message: 'QQ SDK未加载'
            });
        }
    };
    
    // 通用调用方法
    mqq.invoke = function(namespace, method, params, callback) {
        if (!mqq.isQQ()) {
            callback && callback({
                code: -1,
                message: '非QQ浏览器环境'
            });
            return;
        }
        
        // 尝试使用QQ内置的JSBridge
        if (window.QQJSBridge && window.QQJSBridge.call) {
            window.QQJSBridge.call(namespace + '.' + method, params, callback);
        } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.QQJSBridge) {
            // iOS WKWebView
            window.webkit.messageHandlers.QQJSBridge.postMessage({
                namespace: namespace,
                method: method,
                params: params,
                callback: callback
            });
        } else {
            // 尝试使用schema方式
            var schema = 'mqqapi://' + namespace + '/' + method + '?';
            var paramStr = '';
            for (var key in params) {
                if (paramStr) paramStr += '&';
                paramStr += key + '=' + encodeURIComponent(params[key]);
            }
            schema += paramStr;
            
            var iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = schema;
            document.body.appendChild(iframe);
            
            setTimeout(function() {
                document.body.removeChild(iframe);
                callback && callback({
                    code: 0,
                    message: 'success'
                });
            }, 100);
        }
    };
    
    // 导出到全局
    window.mqq = mqq;
    
    // 加载完成回调
    if (typeof window.onMqqReady === 'function') {
        window.onMqqReady(mqq);
    }
})();
