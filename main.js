function AppDataModel() {
    var n = this;
    n.userInfoUrl = "/api/Me";
    n.siteUrl = "/";
    n.returnUrl = n.siteUrl;

    n.setAccessToken = function (n) {
        sessionStorage.setItem("accessToken", n);
    };

    n.getAccessToken = function () {
        return sessionStorage.getItem("accessToken");
    };
}

function AppViewModel(n) {
    var t = this;
    t.Views = { Loading: {} };
    t.dataModel = n;
    t.view = ko.observable(t.Views.Loading);

    t.loading = ko.computed(function () {
        return t.view() === t.Views.Loading;
    });

    t.addViewModel = function (i) {
        var u = new i.factory(t, n),
            r;

        t.Views[i.name] = u;
        t[i.bindingMemberName] = ko.computed(function () {
            if (!n.getAccessToken()) var r = common.getFragment();
            return t.Views[i.name];
        });

        r = typeof i.navigatorFactory != "undefined" ? i.navigatorFactory(t, n) : function () {
            window.location.hash = i.bindingMemberName;
        };

        t["navigateTo" + i.name] = r;
    };

    t.initialize = function () {};
}

function HomeViewModel() {
    return this;
}

window.common = (function () {
    function t(n) {
        var u = {},
            f, t, i, e, o, s, h, r;

        if (n === null) return u;

        for (f = n.split("&"), r = 0; r < f.length; r++) {
            t = f[r];
            i = t.indexOf("=");
            i === -1 ? (e = t, o = null) : (e = t.substr(0, i), o = t.substr(i + 1));
            s = decodeURIComponent(e);
            h = decodeURIComponent(o);
            u[s] = h;
        }

        return u;
    }

    var n = {};
    n.getFragment = function () {
        return window.location.hash.indexOf("#") === 0 ? t(window.location.hash.substr(1)) : {};
    };

    return n;
})();

var app = new AppViewModel(new AppDataModel());
app.addViewModel({ name: "Home", bindingMemberName: "home", factory: HomeViewModel });

(function () {
    "use strict";

    (function () {
        function n(n) {
            this.el = n;
            for (var r = n.className.replace(/^\s+|\s+$/g, "").split(/\s+/), t = 0; t < r.length; t++) i.call(this, r[t]);
        }

        function r(n, t, i) {
            Object.defineProperty ? Object.defineProperty(n, t, { get: i }) : n.__defineGetter__(t, i);
        }

        if (!("undefined" == typeof window.Element || "classList" in document.documentElement)) {
            var t = Array.prototype,
                i = t.push,
                u = t.splice,
                f = t.join;

            n.prototype = {
                add: function (n) {
                    this.contains(n) || (i.call(this, n), this.el.className = this.toString());
                },
                contains: function (n) {
                    return -1 != this.el.className.indexOf(n);
                },
                item: function (n) {
                    return this[n] || null;
                },
                remove: function (n) {
                    if (this.contains(n)) {
                        for (var t = 0; t < this.length && this[t] != n; t++);
                        u.call(this, t, 1);
                        this.el.className = this.toString();
                    }
                },
                toString: function () {
                    return f.call(this, " ");
                },
                toggle: function (n) {
                    return this.contains(n) ? this.remove(n) : this.add(n), this.contains(n);
                }
            };

            window.DOMTokenList = n;
            r(Element.prototype, "classList", function () {
                return new n(this);
            });
        }
    })();

    window.canUse = function (n) {
        window._canUse || (window._canUse = document.createElement("div"));
        var t = window._canUse.style,
            i = n.charAt(0).toUpperCase() + n.slice(1);

        return n in t || "Moz" + i in t || "Webkit" + i in t || "O" + i in t || "ms" + i in t;
    };

    (function () {
        "addEventListener" in window || (window.addEventListener = function (n, t) {
            window.attachEvent("on" + n, t);
        });
    })();

    var n = document.querySelector("body");
    n.classList.add("is-loading");

    window.addEventListener("load", function () {
        window.setTimeout(function () {
            n.classList.remove("is-loading");
        }, 100);
    });

    // ...existing code...
})();
