(function() {
    'use strict';

    /* eslint-disable no-undef */
    const Common = {
        init() {
            // Getting real vh for mobile browsers
            (function() {
                const customViewportCorrectionVariable = 'vh';

                function setViewportProperty(doc) {
                    const customVar = '--' + (customViewportCorrectionVariable);
                    let prevClientHeight;

                    function handleResize() {
                        const clientHeight = doc.clientHeight;
                        if (clientHeight === prevClientHeight) return;
                        requestAnimationFrame(function updateViewportHeight() {
                            doc.style.setProperty(customVar, clientHeight * 0.01 + 'px');
                            prevClientHeight = clientHeight;
                        });
                    }
                    handleResize();
                    return handleResize;
                }
                window.addEventListener('resize', setViewportProperty(document.documentElement));
            })();

            // Fullpage
            (function() {
                const scrollDown = document.querySelector('.btn-scroll');
                const slideToQuiz = document.querySelector('.btn-quiz');
                const slideToSection = document.querySelectorAll('[data-scrollto]');
                let quizTop;
                const fp = window.fp = new fullpage('#fullpage', {
                    licenseKey: '73438E6B-32424808-B5E93D50-0E3A4BE3',
                    responsiveWidth: 744,
                    menu: '#menu',
                    scrollOverflow: false,
                    controlArrows: false,
                    scrollingSpeed: 500,
                    credits: {
                        enabled: false
                    },
                    beforeLeave: function(origin, destination) {
                        if (!scrollDown) return;
                        scrollDown.classList.toggle('btn-scroll--texty', destination.anchor === 'whois');
                        scrollDown.classList.toggle('btn-light', destination.anchor !== 'whois');
                        scrollDown.classList.toggle('invisible', destination.anchor === 'contacts');
                    },
                    onSlideLeave: function(section, origin, destination) {
                        if (destination.anchor === 'quiz' && window.Quiz) {
                            window.Quiz.init();
                        }
                    },
                    afterResponsive: function(isResponsive) {
                        if (isResponsive) {
                            quizTop = document.querySelector('.section--quiz').getBoundingClientRect().top + window.scrollY;
                        }
                    }
                });
                fp.setAllowScrolling(false, 'left, right');
                fp.setKeyboardScrolling(false, 'left, right');
                if (scrollDown) {
                    scrollDown.addEventListener('click', function() {
                        fp.moveSectionDown();
                    });
                }
                if (slideToQuiz) {
                    slideToQuiz.addEventListener('click', function() {
                        fp.moveSlideRight();
                        window.scrollTo({
                            top: quizTop,
                            behavior: 'smooth'
                        });
                    });
                }
                Array.prototype.slice.call(slideToSection).forEach(function(link) {
                    link.addEventListener('click', function(event) {
                        const anchor = event.target.getAttribute('data-scrollto') || 'hero';
                        fp.moveTo(anchor);
                    });
                });
            })();

            // Parallax
            (function() {
                const parallax = document.querySelector('.parallax');
                if (!parallax) return;
                new Parallax(parallax);
            })();

            // Lightbox
            (function() {
                GLightbox({
                    selector: '.glightbox'
                });
            })();
        }
    };

    /* eslint-disable no-undef */
    const Header = {
        config: {
            body: document.body,
            nav: document.querySelector('#navigation'),
            navLinks: document.querySelectorAll('#menu .nav-link'),
            mql: window.matchMedia('(min-width: 744px)')
        },
        navHide() {
            new bootstrap.Collapse(this.config.nav, {
                hide: true
            });
        },
        init() {
            if (!this.config.nav) {
                return;
            }
            Array.prototype.slice.call(this.config.navLinks).forEach(link => {
                link.addEventListener('click', () => {
                    if (!this.config.mql.matches) {
                        this.navHide();
                    }
                });
            });
            this.config.body.addEventListener('keyup', event => {
                if (this.config.nav.classList.contains('show') && event.key === 'Escape') {
                    this.navHide();
                }
            });
            this.config.nav.addEventListener('show.bs.collapse', () => {
                this.config.nav.classList.add('show');
                this.config.body.classList.add('overflow-hidden');
            });
            this.config.nav.addEventListener('hide.bs.collapse', () => {
                this.config.body.classList.remove('overflow-hidden');
            });
        }
    };

    /* eslint-disable no-undef */
    const Quiz = window.Quiz = {
        config: {
            body: document.body,
            sliderEl: document.querySelector('.quizz-slider'),
            slider: null,
            elements: document.querySelectorAll('.quizz-vars-item input[type="radio"]'),
            progress: document.querySelector('.quizz-progress .progress'),
            bar: document.querySelector('.quizz-progress .bar'),
            offsetProperty: '--offset',
            animatedClass: 'animated',
            hiddenClass: 'hidden',
            processClass: 'page-quiz-process'
        },
        setOffset(el, counter, count) {
            const offset = Math.PI * (380 - 57) * ((100 - counter * 100 / count) / 100);
            el.style.setProperty(this.config.offsetProperty, offset + 'px');
        },
        init() {
            const count = this.config.sliderEl.querySelectorAll('.quizz-item').length;
            let inProgress = false;
            if (this.config.slider) {
                this.reset();
            }
            this.initSlider();
            const swiper = this.config.sliderEl.swiper;
            this.config.body.classList.add(this.config.processClass);
            Array.prototype.slice.call(this.config.elements).forEach(el => {
                el.addEventListener('click', event => {
                    if (inProgress) {
                        event.preventDefault();
                    }
                });
                el.addEventListener('change', event => {
                    if (inProgress || swiper.destroyed) {
                        event.preventDefault();
                        return;
                    }
                    this.config.sliderEl.classList.add('disabled');
                    inProgress = true;
                    if (swiper.activeIndex + 1 < count) {
                        setTimeout(() => {
                            this.config.sliderEl.classList.remove('disabled');
                            this.setOffset(this.config.bar, swiper.activeIndex + 1, count);
                            swiper.slideNext();
                            inProgress = false;
                        }, 350);
                    } else {
                        this.config.body.classList.remove(this.config.processClass);
                        this.config.progress.classList.add(this.config.animatedClass);
                        this.setOffset(this.config.bar, swiper.activeIndex + 1, count);
                        this.config.sliderEl.classList.add(this.config.hiddenClass);
                        const waiter = document.createElement('div');
                        waiter.className = 'quizz-waiter';
                        waiter.textContent = 'Секунду, мы считаем твой результат! Пока можешь немного позаниматься творожной аэробикой.';
                        this.config.sliderEl.parentNode.appendChild(waiter);
                        setTimeout(() => {
                            document.querySelector('.quizz-waiter').classList.add('show');
                        }, 350);
                        setTimeout(() => {
                            this.config.sliderEl.classList.remove('disabled');
                            window.fp.moveSlideRight();
                            inProgress = false;
                        }, 4000);
                    }
                });
            });
        },
        initSlider() {
            this.config.slider = new Swiper(this.config.sliderEl, {
                allowTouchMove: false,
                autoHeight: true,
                pagination: {
                    el: '.quizz-pages',
                    type: 'fraction'
                }
            });
        },
        reset() {
            this.config.progress.classList.remove(this.config.animatedClass);
            this.config.bar.style.removeProperty(this.config.offsetProperty);
            Array.prototype.slice.call(this.config.elements).forEach(el => {
                el.checked = false;
            });
            if (this.config.sliderEl.swiper) {
                const waiter = document.querySelector('.quizz-waiter');
                if (waiter) {
                    waiter.remove();
                }
                this.config.sliderEl.swiper.destroy();
                this.config.sliderEl.classList.remove(this.config.hiddenClass);
                this.config.slider = null;
            }
        }
    };

    window.addEventListener('DOMContentLoaded', function() {
        Common.init();
        Header.init();
        window.Quiz = Quiz;
    });

})();