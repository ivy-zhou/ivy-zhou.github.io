/*jshint esversion: 6 */

(function () {
    var bodyEl = document.body,
        content = document.querySelector('.content-wrap'),
        openbtn = document.getElementById('open-button'),
        menu = document.getElementById('life-settings'),
        isOpen = false;

    function toggleMenu() {
        if (isOpen) {
            bodyEl.classList.remove('show-menu');
        } else {
            bodyEl.classList.add('show-menu');
        }
        isOpen = !isOpen;
        openbtn.setAttribute('aria-expanded', String(isOpen));
        openbtn.setAttribute('aria-label', isOpen ? 'Close Life settings' : 'Open Life settings');
        menu.setAttribute('aria-hidden', String(!isOpen));
    }

    function closeMenu() {
        bodyEl.classList.remove('show-menu');
        isOpen = false;
        openbtn.setAttribute('aria-expanded', 'false');
        openbtn.setAttribute('aria-label', 'Open Life settings');
        menu.setAttribute('aria-hidden', 'true');
        window.conwayBG.start();
    }

    function isCanvasSupported() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    }

    function initEvents() {
        openbtn.addEventListener('click', toggleMenu);

        // close the menu element if the target it´s not the menu element or one of its descendants..
        bodyEl.addEventListener('click', function (ev) {
            if (!document.querySelector('.menu-wrap').contains(ev.target) && !openbtn.contains(ev.target) && document.querySelector('.content-wrap').contains(ev.target)) {
                closeMenu();
            }
        });

        window.addEventListener('keydown', function (ev) {
            if (ev.key === 'Escape' && isOpen) {
                closeMenu();
                openbtn.focus();
            }
        });
    }

    initEvents();

    // If the canvas isn't supported draw the background
    if (!isCanvasSupported()) {
        document.getElementsByClassName('content-wrap')[0]
            .style.backgroundColor = "#EFF2EF";
    }


}());
