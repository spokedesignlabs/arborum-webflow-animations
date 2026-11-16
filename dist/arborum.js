/*! Arborum website animations v1.4.18 · https://github.com/spokedesignlabs/arborum-webflow-animations · includes Lenis (MIT) */
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // node_modules/lenis/dist/lenis.mjs
  var version = "1.3.26";
  function clamp(min, input, max) {
    return Math.max(min, Math.min(input, max));
  }
  function lerp(x, y, t) {
    return (1 - t) * x + t * y;
  }
  function damp(x, y, lambda, deltaTime) {
    return lerp(x, y, 1 - Math.exp(-lambda * deltaTime));
  }
  function modulo(n, d) {
    return (n % d + d) % d;
  }
  var Animate = class {
    constructor() {
      __publicField(this, "isRunning", false);
      __publicField(this, "value", 0);
      __publicField(this, "from", 0);
      __publicField(this, "to", 0);
      __publicField(this, "currentTime", 0);
      __publicField(this, "lerp");
      __publicField(this, "duration");
      __publicField(this, "easing");
      __publicField(this, "onUpdate");
    }
    /**
    * Advance the animation by the given delta time
    *
    * @param deltaTime - The time in seconds to advance the animation
    */
    advance(deltaTime) {
      if (!this.isRunning) return;
      let completed = false;
      if (this.duration && this.easing) {
        this.currentTime += deltaTime;
        const linearProgress = clamp(0, this.currentTime / this.duration, 1);
        completed = linearProgress >= 1;
        const easedProgress = completed ? 1 : this.easing(linearProgress);
        this.value = this.from + (this.to - this.from) * easedProgress;
      } else if (this.lerp) {
        this.value = damp(this.value, this.to, this.lerp * 60, deltaTime);
        if (Math.round(this.value) === Math.round(this.to)) {
          this.value = this.to;
          completed = true;
        }
      } else {
        this.value = this.to;
        completed = true;
      }
      if (completed) this.stop();
      this.onUpdate?.(this.value, completed);
    }
    /** Stop the animation */
    stop() {
      this.isRunning = false;
    }
    /**
    * Set up the animation from a starting value to an ending value
    * with optional parameters for lerping, duration, easing, and onUpdate callback
    *
    * @param from - The starting value
    * @param to - The ending value
    * @param options - Options for the animation
    */
    fromTo(from, to, { lerp: lerp2, duration, easing, onStart, onUpdate }) {
      this.from = this.value = from;
      this.to = to;
      this.lerp = lerp2;
      this.duration = duration;
      this.easing = easing;
      this.currentTime = 0;
      this.isRunning = true;
      onStart?.();
      this.onUpdate = onUpdate;
    }
  };
  function debounce(callback, delay) {
    let timer2;
    return function(...args) {
      clearTimeout(timer2);
      timer2 = setTimeout(() => {
        timer2 = void 0;
        callback.apply(this, args);
      }, delay);
    };
  }
  var Dimensions = class {
    constructor(wrapper, content, { autoResize = true, debounce: debounceValue = 250 } = {}) {
      __publicField(this, "width", 0);
      __publicField(this, "height", 0);
      __publicField(this, "scrollHeight", 0);
      __publicField(this, "scrollWidth", 0);
      __publicField(this, "debouncedResize");
      __publicField(this, "wrapperResizeObserver");
      __publicField(this, "contentResizeObserver");
      __publicField(this, "resize", () => {
        this.onWrapperResize();
        this.onContentResize();
      });
      __publicField(this, "onWrapperResize", () => {
        if (this.wrapper instanceof Window) {
          this.width = window.innerWidth;
          this.height = window.innerHeight;
        } else {
          this.width = this.wrapper.clientWidth;
          this.height = this.wrapper.clientHeight;
        }
      });
      __publicField(this, "onContentResize", () => {
        if (this.wrapper instanceof Window) {
          this.scrollHeight = this.content.scrollHeight;
          this.scrollWidth = this.content.scrollWidth;
        } else {
          this.scrollHeight = this.wrapper.scrollHeight;
          this.scrollWidth = this.wrapper.scrollWidth;
        }
      });
      this.wrapper = wrapper;
      this.content = content;
      if (autoResize) {
        this.debouncedResize = debounce(this.resize, debounceValue);
        if (this.wrapper instanceof Window) window.addEventListener("resize", this.debouncedResize);
        else {
          this.wrapperResizeObserver = new ResizeObserver(this.debouncedResize);
          this.wrapperResizeObserver.observe(this.wrapper);
        }
        this.contentResizeObserver = new ResizeObserver(this.debouncedResize);
        this.contentResizeObserver.observe(this.content);
      }
      this.resize();
    }
    destroy() {
      this.wrapperResizeObserver?.disconnect();
      this.contentResizeObserver?.disconnect();
      if (this.wrapper === window && this.debouncedResize) window.removeEventListener("resize", this.debouncedResize);
    }
    get limit() {
      return {
        x: this.scrollWidth - this.width,
        y: this.scrollHeight - this.height
      };
    }
  };
  var Emitter = class {
    constructor() {
      __publicField(this, "events", {});
    }
    /**
    * Emit an event with the given data
    * @param event Event name
    * @param args Data to pass to the event handlers
    */
    emit(event, ...args) {
      const callbacks = this.events[event] || [];
      for (let i = 0, length = callbacks.length; i < length; i++) callbacks[i]?.(...args);
    }
    /**
    * Add a callback to the event
    * @param event Event name
    * @param cb Callback function
    * @returns Unsubscribe function
    */
    on(event, cb) {
      if (this.events[event]) this.events[event].push(cb);
      else this.events[event] = [cb];
      return () => {
        this.events[event] = this.events[event]?.filter((i) => cb !== i);
      };
    }
    /**
    * Remove a callback from the event
    * @param event Event name
    * @param callback Callback function
    */
    off(event, callback) {
      this.events[event] = this.events[event]?.filter((i) => callback !== i);
    }
    /**
    * Remove all event listeners and clean up
    */
    destroy() {
      this.events = {};
    }
  };
  var LINE_HEIGHT = 100 / 6;
  var listenerOptions = { passive: false };
  function getDeltaMultiplier(deltaMode, size) {
    if (deltaMode === 1) return LINE_HEIGHT;
    if (deltaMode === 2) return size;
    return 1;
  }
  var VirtualScroll = class {
    constructor(element, options = {
      wheelMultiplier: 1,
      touchMultiplier: 1
    }) {
      __publicField(this, "touchStart", {
        x: 0,
        y: 0
      });
      __publicField(this, "lastDelta", {
        x: 0,
        y: 0
      });
      __publicField(this, "window", {
        width: 0,
        height: 0
      });
      __publicField(this, "emitter", new Emitter());
      /**
      * Event handler for 'touchstart' event
      *
      * @param event Touch event
      */
      __publicField(this, "onTouchStart", (event) => {
        const { clientX, clientY } = event.targetTouches ? event.targetTouches[0] : event;
        this.touchStart.x = clientX;
        this.touchStart.y = clientY;
        this.lastDelta = {
          x: 0,
          y: 0
        };
        this.emitter.emit("scroll", {
          deltaX: 0,
          deltaY: 0,
          event
        });
      });
      /** Event handler for 'touchmove' event */
      __publicField(this, "onTouchMove", (event) => {
        const { clientX, clientY } = event.targetTouches ? event.targetTouches[0] : event;
        const deltaX = -(clientX - this.touchStart.x) * this.options.touchMultiplier;
        const deltaY = -(clientY - this.touchStart.y) * this.options.touchMultiplier;
        this.touchStart.x = clientX;
        this.touchStart.y = clientY;
        this.lastDelta = {
          x: deltaX,
          y: deltaY
        };
        this.emitter.emit("scroll", {
          deltaX,
          deltaY,
          event
        });
      });
      __publicField(this, "onTouchEnd", (event) => {
        this.emitter.emit("scroll", {
          deltaX: this.lastDelta.x,
          deltaY: this.lastDelta.y,
          event
        });
      });
      /** Event handler for 'wheel' event */
      __publicField(this, "onWheel", (event) => {
        let { deltaX, deltaY, deltaMode } = event;
        const multiplierX = getDeltaMultiplier(deltaMode, this.window.width);
        const multiplierY = getDeltaMultiplier(deltaMode, this.window.height);
        deltaX *= multiplierX;
        deltaY *= multiplierY;
        deltaX *= this.options.wheelMultiplier;
        deltaY *= this.options.wheelMultiplier;
        this.emitter.emit("scroll", {
          deltaX,
          deltaY,
          event
        });
      });
      __publicField(this, "onWindowResize", () => {
        this.window = {
          width: window.innerWidth,
          height: window.innerHeight
        };
      });
      this.element = element;
      this.options = options;
      window.addEventListener("resize", this.onWindowResize);
      this.onWindowResize();
      this.element.addEventListener("wheel", this.onWheel, listenerOptions);
      this.element.addEventListener("touchstart", this.onTouchStart, listenerOptions);
      this.element.addEventListener("touchmove", this.onTouchMove, listenerOptions);
      this.element.addEventListener("touchend", this.onTouchEnd, listenerOptions);
    }
    /**
    * Add an event listener for the given event and callback
    *
    * @param event Event name
    * @param callback Callback function
    */
    on(event, callback) {
      return this.emitter.on(event, callback);
    }
    /** Remove all event listeners and clean up */
    destroy() {
      this.emitter.destroy();
      window.removeEventListener("resize", this.onWindowResize);
      this.element.removeEventListener("wheel", this.onWheel, listenerOptions);
      this.element.removeEventListener("touchstart", this.onTouchStart, listenerOptions);
      this.element.removeEventListener("touchmove", this.onTouchMove, listenerOptions);
      this.element.removeEventListener("touchend", this.onTouchEnd, listenerOptions);
    }
  };
  var defaultEasing = (t) => Math.min(1, 1.001 - 2 ** (-10 * t));
  var Lenis = class {
    constructor({ wrapper = window, content = document.documentElement, eventsTarget = wrapper, smoothWheel = true, syncTouch = false, syncTouchLerp = 0.075, touchInertiaExponent = 1.7, duration, easing, lerp: lerp2 = 0.1, infinite = false, orientation = "vertical", gestureOrientation = orientation === "horizontal" ? "both" : "vertical", touchMultiplier = 1, wheelMultiplier = 1, autoResize = true, prevent, virtualScroll, overscroll = true, autoRaf = false, anchors = false, autoToggle = false, allowNestedScroll = false, __experimental__naiveDimensions = false, naiveDimensions = __experimental__naiveDimensions, stopInertiaOnNavigate = false, respectReducedMotion = true } = {}) {
      __publicField(this, "_isScrolling", false);
      __publicField(this, "_isStopped", false);
      __publicField(this, "_isLocked", false);
      __publicField(this, "_preventNextNativeScrollEvent", false);
      __publicField(this, "_resetVelocityTimeout", null);
      __publicField(this, "_rafId", null);
      __publicField(this, "_isDraggingSelection", false);
      __publicField(this, "reducedMotionMediaQuery", window.matchMedia("(prefers-reduced-motion: reduce)"));
      /**
      * Whether or not the user is touching the screen
      */
      __publicField(this, "isTouching");
      /**
      * Whether or not the device is running iOS
      */
      __publicField(this, "isIos");
      /**
      * The time in ms since the lenis instance was created
      */
      __publicField(this, "time", 0);
      /**
      * User data that will be forwarded through the scroll event
      *
      * @example
      * lenis.scrollTo(100, {
      *   userData: {
      *     foo: 'bar'
      *   }
      * })
      */
      __publicField(this, "userData", {});
      /**
      * The last velocity of the scroll
      */
      __publicField(this, "lastVelocity", 0);
      /**
      * The current velocity of the scroll
      */
      __publicField(this, "velocity", 0);
      /**
      * The direction of the scroll
      */
      __publicField(this, "direction", 0);
      /**
      * The options passed to the lenis instance
      */
      __publicField(this, "options");
      /**
      * The target scroll value
      */
      __publicField(this, "targetScroll");
      /**
      * The animated scroll value
      */
      __publicField(this, "animatedScroll");
      __publicField(this, "animate", new Animate());
      __publicField(this, "emitter", new Emitter());
      __publicField(this, "dimensions");
      __publicField(this, "virtualScroll");
      __publicField(this, "onScrollEnd", (e) => {
        if (!(e instanceof CustomEvent)) {
          if (this.isScrolling === "smooth" || this.isScrolling === false) e.stopPropagation();
        }
      });
      __publicField(this, "dispatchScrollendEvent", () => {
        this.options.wrapper.dispatchEvent(new CustomEvent("scrollend", {
          bubbles: this.options.wrapper === window,
          detail: { lenisScrollEnd: true }
        }));
      });
      __publicField(this, "onTransitionEnd", (event) => {
        if (event.propertyName?.includes("overflow") && event.target === this.rootElement) this.checkOverflow();
      });
      __publicField(this, "onClick", (event) => {
        const linkElementsUrls = event.composedPath().filter((node) => node instanceof HTMLAnchorElement && node.href).map((element) => new URL(element.href));
        const currentUrl = new URL(window.location.href);
        if (this.options.anchors) {
          const anchorElementUrl = linkElementsUrls.find((targetUrl) => currentUrl.host === targetUrl.host && currentUrl.pathname === targetUrl.pathname && targetUrl.hash);
          if (anchorElementUrl) {
            const options = typeof this.options.anchors === "object" && this.options.anchors ? this.options.anchors : void 0;
            const target = decodeURIComponent(anchorElementUrl.hash);
            this.scrollTo(target, options);
            return;
          }
        }
        if (this.options.stopInertiaOnNavigate) {
          if (linkElementsUrls.some((targetUrl) => currentUrl.host === targetUrl.host && currentUrl.pathname !== targetUrl.pathname)) {
            this.reset();
            return;
          }
        }
      });
      __publicField(this, "onPointerDown", (event) => {
        if (event.button === 1) this.reset();
      });
      __publicField(this, "onVirtualScroll", (data) => {
        if (typeof this.options.virtualScroll === "function" && this.options.virtualScroll(data) === false) return;
        const { deltaX, deltaY, event } = data;
        this.emitter.emit("virtual-scroll", {
          deltaX,
          deltaY,
          event
        });
        if (event.ctrlKey) return;
        if (event.lenisStopPropagation) return;
        const isTouch = event.type.includes("touch");
        const isWheel = event.type.includes("wheel");
        if (isTouch && this.isIos) {
          if (event.type === "touchstart") this._isDraggingSelection = this.isTouchOnSelectionHandle(event);
          if (this._isDraggingSelection) {
            if (event.type === "touchend") this._isDraggingSelection = false;
            return;
          }
        }
        this.isTouching = event.type === "touchstart" || event.type === "touchmove";
        const isClickOrTap = deltaX === 0 && deltaY === 0;
        if (this.options.syncTouch && isTouch && event.type === "touchstart" && isClickOrTap && !this.isStopped && !this.isLocked) {
          this.reset();
          return;
        }
        const isUnknownGesture = this.options.gestureOrientation === "vertical" && deltaY === 0 || this.options.gestureOrientation === "horizontal" && deltaX === 0;
        if (isClickOrTap || isUnknownGesture) return;
        let composedPath = event.composedPath();
        composedPath = composedPath.slice(0, composedPath.indexOf(this.rootElement));
        const prevent = this.options.prevent;
        const gestureOrientation = Math.abs(deltaX) >= Math.abs(deltaY) ? "horizontal" : "vertical";
        if (composedPath.find((node) => node instanceof HTMLElement && (typeof prevent === "function" && prevent?.(node) || node.hasAttribute?.("data-lenis-prevent") || gestureOrientation === "vertical" && node.hasAttribute?.("data-lenis-prevent-vertical") || gestureOrientation === "horizontal" && node.hasAttribute?.("data-lenis-prevent-horizontal") || isTouch && node.hasAttribute?.("data-lenis-prevent-touch") || isWheel && node.hasAttribute?.("data-lenis-prevent-wheel") || this.options.allowNestedScroll && this.hasNestedScroll(node, {
          deltaX,
          deltaY
        })))) return;
        if (this.isStopped || this.isLocked) {
          if (event.cancelable) event.preventDefault();
          return;
        }
        if (!(this.options.syncTouch && isTouch || this.options.smoothWheel && isWheel)) {
          this.isScrolling = "native";
          this.animate.stop();
          event.lenisStopPropagation = true;
          return;
        }
        let delta = deltaY;
        if (this.options.gestureOrientation === "both") delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
        else if (this.options.gestureOrientation === "horizontal") delta = deltaX;
        if (!this.options.overscroll || this.options.infinite || this.options.wrapper !== window && this.limit > 0 && (this.animatedScroll > 0 && this.animatedScroll < this.limit || this.animatedScroll === 0 && deltaY > 0 || this.animatedScroll === this.limit && deltaY < 0)) event.lenisStopPropagation = true;
        if (event.cancelable) event.preventDefault();
        const isSyncTouch = isTouch && this.options.syncTouch;
        const hasTouchInertia = isTouch && event.type === "touchend";
        if (hasTouchInertia) delta = Math.sign(delta) * Math.abs(this.velocity) ** this.options.touchInertiaExponent;
        this.scrollTo(this.targetScroll + delta, {
          programmatic: false,
          ...isSyncTouch ? { lerp: hasTouchInertia ? this.options.syncTouchLerp : 1 } : {
            lerp: this.options.lerp,
            duration: this.options.duration,
            easing: this.options.easing
          }
        });
      });
      __publicField(this, "onNativeScroll", () => {
        if (this._resetVelocityTimeout !== null) {
          clearTimeout(this._resetVelocityTimeout);
          this._resetVelocityTimeout = null;
        }
        if (this._preventNextNativeScrollEvent) {
          this._preventNextNativeScrollEvent = false;
          return;
        }
        if (this.isScrolling === false || this.isScrolling === "native") {
          const lastScroll = this.animatedScroll;
          this.animatedScroll = this.targetScroll = this.actualScroll;
          this.lastVelocity = this.velocity;
          this.velocity = this.animatedScroll - lastScroll;
          this.direction = Math.sign(this.animatedScroll - lastScroll);
          if (!this.isStopped) this.isScrolling = "native";
          this.emit();
          if (this.velocity !== 0) this._resetVelocityTimeout = setTimeout(() => {
            this.lastVelocity = this.velocity;
            this.velocity = 0;
            this.isScrolling = false;
            this.emit();
          }, 400);
        }
      });
      /**
      * RequestAnimationFrame for lenis
      *
      * @param time The time in ms from an external clock like `requestAnimationFrame` or Tempus
      */
      __publicField(this, "raf", (time) => {
        const deltaTime = time - (this.time || time);
        this.time = time;
        this.animate.advance(deltaTime * 1e-3);
        if (this.options.autoRaf) this._rafId = requestAnimationFrame(this.raf);
      });
      window.lenisVersion = version;
      if (!window.lenis) window.lenis = {};
      window.lenis.version = version;
      if (orientation === "horizontal") window.lenis.horizontal = true;
      if (syncTouch === true) window.lenis.touch = true;
      this.isIos = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
      if (!wrapper || wrapper === document.documentElement) wrapper = window;
      if (typeof duration === "number" && typeof easing !== "function") easing = defaultEasing;
      else if (typeof easing === "function" && typeof duration !== "number") duration = 1;
      this.options = {
        wrapper,
        content,
        eventsTarget,
        smoothWheel,
        syncTouch,
        syncTouchLerp,
        touchInertiaExponent,
        duration,
        easing,
        lerp: lerp2,
        infinite,
        gestureOrientation,
        orientation,
        touchMultiplier,
        wheelMultiplier,
        autoResize,
        prevent,
        virtualScroll,
        overscroll,
        autoRaf,
        anchors,
        autoToggle,
        allowNestedScroll,
        naiveDimensions,
        stopInertiaOnNavigate,
        respectReducedMotion
      };
      this.dimensions = new Dimensions(wrapper, content, { autoResize });
      this.updateClassName();
      this.targetScroll = this.animatedScroll = this.actualScroll;
      this.options.wrapper.addEventListener("scroll", this.onNativeScroll);
      this.options.wrapper.addEventListener("scrollend", this.onScrollEnd, { capture: true });
      if (this.options.anchors || this.options.stopInertiaOnNavigate) this.options.wrapper.addEventListener("click", this.onClick);
      this.options.wrapper.addEventListener("pointerdown", this.onPointerDown);
      this.virtualScroll = new VirtualScroll(eventsTarget, {
        touchMultiplier,
        wheelMultiplier
      });
      this.virtualScroll.on("scroll", this.onVirtualScroll);
      if (this.options.autoToggle) {
        this.checkOverflow();
        this.rootElement.addEventListener("transitionend", this.onTransitionEnd);
      }
      if (this.options.autoRaf) this._rafId = requestAnimationFrame(this.raf);
    }
    /**
    * Destroy the lenis instance, remove all event listeners and clean up the class name
    */
    destroy() {
      this.emitter.destroy();
      this.options.wrapper.removeEventListener("scroll", this.onNativeScroll);
      this.options.wrapper.removeEventListener("scrollend", this.onScrollEnd, { capture: true });
      this.options.wrapper.removeEventListener("pointerdown", this.onPointerDown);
      if (this.options.anchors || this.options.stopInertiaOnNavigate) this.options.wrapper.removeEventListener("click", this.onClick);
      this.virtualScroll.destroy();
      this.dimensions.destroy();
      this.cleanUpClassName();
      if (this._rafId) cancelAnimationFrame(this._rafId);
    }
    on(event, callback) {
      return this.emitter.on(event, callback);
    }
    off(event, callback) {
      return this.emitter.off(event, callback);
    }
    get overflow() {
      const property = this.isHorizontal ? "overflow-x" : "overflow-y";
      return getComputedStyle(this.rootElement)[property];
    }
    checkOverflow() {
      if (["hidden", "clip"].includes(this.overflow)) this.internalStop();
      else this.internalStart();
    }
    setScroll(scroll) {
      if (this.isHorizontal) this.options.wrapper.scrollTo({
        left: scroll,
        behavior: "instant"
      });
      else this.options.wrapper.scrollTo({
        top: scroll,
        behavior: "instant"
      });
    }
    isTouchOnSelectionHandle(event) {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return false;
      const touch = event.targetTouches[0] ?? event.changedTouches[0];
      if (!touch) return false;
      const rects = selection.getRangeAt(0).getClientRects();
      if (rects.length === 0) return false;
      const first = rects[0];
      const last = rects[rects.length - 1];
      const HANDLE_RADIUS = 40;
      const nearStart = Math.hypot(touch.clientX - first.left, touch.clientY - first.top) <= HANDLE_RADIUS;
      const nearEnd = Math.hypot(touch.clientX - last.right, touch.clientY - last.bottom) <= HANDLE_RADIUS;
      return nearStart || nearEnd;
    }
    /**
    * Force lenis to recalculate the dimensions
    */
    resize() {
      this.dimensions.resize();
      this.animatedScroll = this.targetScroll = this.actualScroll;
      this.emit();
    }
    emit() {
      this.emitter.emit("scroll", this);
    }
    reset() {
      this.isLocked = false;
      this.isScrolling = false;
      this.animatedScroll = this.targetScroll = this.actualScroll;
      this.lastVelocity = this.velocity = 0;
      this.animate.stop();
    }
    /**
    * Start lenis scroll after it has been stopped
    */
    start() {
      if (!this.isStopped) return;
      if (this.options.autoToggle) {
        this.rootElement.style.removeProperty("overflow");
        return;
      }
      this.internalStart();
    }
    internalStart() {
      if (!this.isStopped) return;
      this.reset();
      this.isStopped = false;
      this.emit();
    }
    /**
    * Stop lenis scroll
    */
    stop() {
      if (this.isStopped) return;
      if (this.options.autoToggle) {
        this.rootElement.style.setProperty("overflow", "clip");
        return;
      }
      this.internalStop();
    }
    internalStop() {
      if (this.isStopped) return;
      this.reset();
      this.isStopped = true;
      this.emit();
    }
    /**
    * Scroll to a target value
    *
    * @param target The target value to scroll to
    * @param options The options for the scroll
    *
    * @example
    * lenis.scrollTo(100, {
    *   offset: 100,
    *   duration: 1,
    *   easing: (t) => 1 - Math.cos((t * Math.PI) / 2),
    *   lerp: 0.1,
    *   onStart: () => {
    *     console.log('onStart')
    *   },
    *   onComplete: () => {
    *     console.log('onComplete')
    *   },
    * })
    */
    scrollTo(_target, { offset = 0, immediate = false, lock = false, programmatic = true, lerp: lerp2 = programmatic ? this.options.lerp : void 0, duration = programmatic ? this.options.duration : void 0, easing = programmatic ? this.options.easing : void 0, onStart, onComplete, force = false, userData } = {}) {
      if (this.prefersReducedMotion) if (programmatic) immediate = true;
      else {
        lerp2 = 1;
        duration = void 0;
        easing = void 0;
      }
      if ((this.isStopped || this.isLocked) && !force) return;
      let target = _target;
      let adjustedOffset = offset;
      if (typeof target === "string" && [
        "top",
        "left",
        "start",
        "#"
      ].includes(target)) target = 0;
      else if (typeof target === "string" && [
        "bottom",
        "right",
        "end"
      ].includes(target)) target = this.limit;
      else {
        let node = null;
        if (typeof target === "string") {
          node = target.startsWith("#") ? document.getElementById(target.slice(1)) : document.querySelector(target);
          if (!node) if (target === "#top") target = 0;
          else console.warn("Lenis: Target not found", target);
        } else if (target instanceof HTMLElement && target?.nodeType) node = target;
        if (node) {
          if (this.options.wrapper !== window) {
            const wrapperRect = this.rootElement.getBoundingClientRect();
            adjustedOffset -= this.isHorizontal ? wrapperRect.left : wrapperRect.top;
          }
          const rect = node.getBoundingClientRect();
          const targetStyle = getComputedStyle(node);
          const scrollMargin = this.isHorizontal ? Number.parseFloat(targetStyle.scrollMarginLeft) : Number.parseFloat(targetStyle.scrollMarginTop);
          const containerStyle = getComputedStyle(this.rootElement);
          const scrollPadding = this.isHorizontal ? Number.parseFloat(containerStyle.scrollPaddingLeft) : Number.parseFloat(containerStyle.scrollPaddingTop);
          target = (this.isHorizontal ? rect.left : rect.top) + this.animatedScroll - (Number.isNaN(scrollMargin) ? 0 : scrollMargin) - (Number.isNaN(scrollPadding) ? 0 : scrollPadding);
        }
      }
      if (typeof target !== "number") return;
      target += adjustedOffset;
      if (this.options.infinite) {
        if (programmatic) {
          this.targetScroll = this.animatedScroll = this.scroll;
          const distance = target - this.animatedScroll;
          if (distance > this.limit / 2) target -= this.limit;
          else if (distance < -this.limit / 2) target += this.limit;
        }
      } else target = clamp(0, target, this.limit);
      if (target === this.targetScroll) {
        onStart?.(this);
        onComplete?.(this);
        return;
      }
      this.userData = userData ?? {};
      if (immediate) {
        this.animatedScroll = this.targetScroll = target;
        this.setScroll(this.scroll);
        this.reset();
        this.preventNextNativeScrollEvent();
        this.emit();
        onComplete?.(this);
        this.userData = {};
        requestAnimationFrame(() => {
          this.dispatchScrollendEvent();
        });
        return;
      }
      if (!programmatic) this.targetScroll = target;
      if (typeof duration === "number" && typeof easing !== "function") easing = defaultEasing;
      else if (typeof easing === "function" && typeof duration !== "number") duration = 1;
      this.animate.fromTo(this.animatedScroll, target, {
        duration,
        easing,
        lerp: lerp2,
        onStart: () => {
          if (lock) this.isLocked = true;
          this.isScrolling = "smooth";
          onStart?.(this);
        },
        onUpdate: (value, completed) => {
          this.isScrolling = "smooth";
          this.lastVelocity = this.velocity;
          this.velocity = value - this.animatedScroll;
          this.direction = Math.sign(this.velocity);
          this.animatedScroll = value;
          this.setScroll(this.scroll);
          if (programmatic) this.targetScroll = value;
          if (!completed) this.emit();
          if (completed) {
            this.reset();
            this.emit();
            onComplete?.(this);
            this.userData = {};
            requestAnimationFrame(() => {
              this.dispatchScrollendEvent();
            });
            this.preventNextNativeScrollEvent();
          }
        }
      });
    }
    preventNextNativeScrollEvent() {
      this._preventNextNativeScrollEvent = true;
      requestAnimationFrame(() => {
        this._preventNextNativeScrollEvent = false;
      });
    }
    hasNestedScroll(node, { deltaX, deltaY }) {
      const time = Date.now();
      if (!node._lenis) node._lenis = {};
      const cache = node._lenis;
      let hasOverflowX;
      let hasOverflowY;
      let isScrollableX;
      let isScrollableY;
      let hasOverscrollBehaviorX;
      let hasOverscrollBehaviorY;
      let scrollWidth;
      let scrollHeight;
      let clientWidth;
      let clientHeight;
      if (time - (cache.time ?? 0) > 2e3) {
        cache.time = Date.now();
        const computedStyle = window.getComputedStyle(node);
        cache.computedStyle = computedStyle;
        hasOverflowX = [
          "auto",
          "overlay",
          "scroll"
        ].includes(computedStyle.overflowX);
        hasOverflowY = [
          "auto",
          "overlay",
          "scroll"
        ].includes(computedStyle.overflowY);
        hasOverscrollBehaviorX = ["auto"].includes(computedStyle.overscrollBehaviorX);
        hasOverscrollBehaviorY = ["auto"].includes(computedStyle.overscrollBehaviorY);
        cache.hasOverflowX = hasOverflowX;
        cache.hasOverflowY = hasOverflowY;
        if (!(hasOverflowX || hasOverflowY)) return false;
        scrollWidth = node.scrollWidth;
        scrollHeight = node.scrollHeight;
        clientWidth = node.clientWidth;
        clientHeight = node.clientHeight;
        isScrollableX = scrollWidth > clientWidth;
        isScrollableY = scrollHeight > clientHeight;
        cache.isScrollableX = isScrollableX;
        cache.isScrollableY = isScrollableY;
        cache.scrollWidth = scrollWidth;
        cache.scrollHeight = scrollHeight;
        cache.clientWidth = clientWidth;
        cache.clientHeight = clientHeight;
        cache.hasOverscrollBehaviorX = hasOverscrollBehaviorX;
        cache.hasOverscrollBehaviorY = hasOverscrollBehaviorY;
      } else {
        isScrollableX = cache.isScrollableX;
        isScrollableY = cache.isScrollableY;
        hasOverflowX = cache.hasOverflowX;
        hasOverflowY = cache.hasOverflowY;
        scrollWidth = cache.scrollWidth;
        scrollHeight = cache.scrollHeight;
        clientWidth = cache.clientWidth;
        clientHeight = cache.clientHeight;
        hasOverscrollBehaviorX = cache.hasOverscrollBehaviorX;
        hasOverscrollBehaviorY = cache.hasOverscrollBehaviorY;
      }
      if (!(hasOverflowX && isScrollableX || hasOverflowY && isScrollableY)) return false;
      const orientation = Math.abs(deltaX) >= Math.abs(deltaY) ? "horizontal" : "vertical";
      let scroll;
      let maxScroll;
      let delta;
      let hasOverflow;
      let isScrollable;
      let hasOverscrollBehavior;
      if (orientation === "horizontal") {
        scroll = Math.round(node.scrollLeft);
        maxScroll = scrollWidth - clientWidth;
        delta = deltaX;
        hasOverflow = hasOverflowX;
        isScrollable = isScrollableX;
        hasOverscrollBehavior = hasOverscrollBehaviorX;
      } else if (orientation === "vertical") {
        scroll = Math.round(node.scrollTop);
        maxScroll = scrollHeight - clientHeight;
        delta = deltaY;
        hasOverflow = hasOverflowY;
        isScrollable = isScrollableY;
        hasOverscrollBehavior = hasOverscrollBehaviorY;
      } else return false;
      if (!hasOverscrollBehavior && (scroll >= maxScroll || scroll <= 0)) return true;
      return (delta > 0 ? scroll < maxScroll : scroll > 0) && hasOverflow && isScrollable;
    }
    /**
    * The root element on which lenis is instanced
    */
    get rootElement() {
      return this.options.wrapper === window ? document.documentElement : this.options.wrapper;
    }
    /**
    * The limit which is the maximum scroll value
    */
    get limit() {
      if (this.options.naiveDimensions) {
        if (this.isHorizontal) return this.rootElement.scrollWidth - this.rootElement.clientWidth;
        return this.rootElement.scrollHeight - this.rootElement.clientHeight;
      }
      return this.dimensions.limit[this.isHorizontal ? "x" : "y"];
    }
    /**
    * Whether or not the scroll is horizontal
    */
    get isHorizontal() {
      return this.options.orientation === "horizontal";
    }
    /**
    * The actual scroll value
    */
    get actualScroll() {
      const wrapper = this.options.wrapper;
      return this.isHorizontal ? wrapper.scrollX ?? wrapper.scrollLeft : wrapper.scrollY ?? wrapper.scrollTop;
    }
    /**
    * The current scroll value
    */
    get scroll() {
      return this.options.infinite ? modulo(this.animatedScroll, this.limit) : this.animatedScroll;
    }
    /**
    * The progress of the scroll relative to the limit
    */
    get progress() {
      return this.limit === 0 ? 1 : this.scroll / this.limit;
    }
    /**
    * Current scroll state
    */
    get isScrolling() {
      return this._isScrolling;
    }
    set isScrolling(value) {
      if (this._isScrolling !== value) {
        this._isScrolling = value;
        this.updateClassName();
      }
    }
    /**
    * Check if lenis is stopped
    */
    get isStopped() {
      return this._isStopped;
    }
    set isStopped(value) {
      if (this._isStopped !== value) {
        this._isStopped = value;
        this.updateClassName();
      }
    }
    /**
    * Check if lenis is locked
    */
    get isLocked() {
      return this._isLocked;
    }
    set isLocked(value) {
      if (this._isLocked !== value) {
        this._isLocked = value;
        this.updateClassName();
      }
    }
    /**
    * Check if lenis is smooth scrolling
    */
    get isSmooth() {
      return this.isScrolling === "smooth";
    }
    /**
    * Whether the user prefers reduced motion and lenis is honoring it (see `respectReducedMotion` option)
    */
    get prefersReducedMotion() {
      return this.options.respectReducedMotion && this.reducedMotionMediaQuery.matches;
    }
    /**
    * The class name applied to the wrapper element
    */
    get className() {
      let className = "lenis";
      if (this.options.autoToggle) className += " lenis-autoToggle";
      if (this.isStopped) className += " lenis-stopped";
      if (this.isLocked) className += " lenis-locked";
      if (this.isScrolling) className += " lenis-scrolling";
      if (this.isScrolling === "smooth") className += " lenis-smooth";
      return className;
    }
    updateClassName() {
      this.cleanUpClassName();
      this.className.split(" ").forEach((className) => {
        this.rootElement.classList.add(className);
      });
    }
    cleanUpClassName() {
      for (const className of Array.from(this.rootElement.classList)) if (className === "lenis" || className.startsWith("lenis-")) this.rootElement.classList.remove(className);
    }
  };

  // src/core/utils.js
  var FOLLOW_OS_REDUCED_MOTION = false;
  var RM = FOLLOW_OS_REDUCED_MOTION && matchMedia("(prefers-reduced-motion: reduce)").matches && !/[?&]motion=1/.test(location.search);
  var $ = (s, r = document) => r.querySelector(s);
  var $$ = (s, r = document) => [...r.querySelectorAll(s)];
  var NAVY = [5, 19, 28];
  var DEEP = [0, 113, 177];
  var LIGHT = [109, 194, 242];
  var VIO = [0, 113, 177];
  var mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  var rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  var clamp2 = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  var seed = 7;
  var setSeed = (v) => {
    seed = v;
  };
  var rnd = (a = 1, b) => {
    seed = seed * 16807 % 2147483647;
    const r = seed / 2147483647;
    return b === void 0 ? r * a : a + r * (b - a);
  };
  var DPR = Math.min(devicePixelRatio || 1, 1.5);
  function fit(c, h) {
    const d = DPR, r = c.getBoundingClientRect();
    const w = r.width, hh = h || r.height;
    c.width = w * d;
    c.height = hh * d;
    const x = c.getContext("2d");
    x.setTransform(d, 0, 0, d, 0, 0);
    return { x, w, h: hh };
  }
  function visible(el, cb) {
    if (!("IntersectionObserver" in window)) {
      cb(true);
      return;
    }
    new IntersectionObserver((e) => cb(e[0].isIntersecting), { rootMargin: "120px" }).observe(el);
  }
  function debounce2(f, ms) {
    let t;
    return function() {
      clearTimeout(t);
      t = setTimeout(f, ms || 150);
    };
  }
  function lift(host) {
    [].forEach.call(host.children, (ch) => {
      if (ch.tagName === "CANVAS" || /_fade\b/.test(ch.className)) return;
      if (getComputedStyle(ch).position === "static") ch.style.position = "relative";
      ch.style.zIndex = ch.style.zIndex || "1";
    });
  }
  function onLoad(fn, delay = 0) {
    if (document.readyState === "complete") setTimeout(fn, delay);
    else addEventListener("load", () => setTimeout(fn, delay));
  }
  function keyable(el, fn) {
    if (!el.hasAttribute("tabindex")) el.tabIndex = 0;
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fn(e);
      }
    });
  }
  var canvasIn = (host, cls) => host && host.querySelector("canvas." + cls);
  function play(el, frames, opts) {
    if (!el || !el.animate) return null;
    return el.animate(frames, Object.assign({ fill: "forwards" }, typeof opts === "number" ? { duration: opts } : opts));
  }
  var ON = (name) => {
    const s = window.arborumAnimations;
    return !s || s[name] !== false;
  };
  var EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

  // src/ui/smooth-scroll.js
  var lenis = null;
  var getLenis = () => lenis;
  function targetY(hash) {
    const el = hash && document.getElementById(hash.slice(1));
    if (!el) return null;
    const r = el.getBoundingClientRect(), top = r.top + scrollY, travel = Math.max(0, r.height - innerHeight);
    if (hash === "#energy") return top + travel * 0.45;
    if (hash === "#beyond") return top + travel * 0.16;
    return top;
  }
  function scrollToY(y) {
    if (y == null) return;
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else scrollTo({ top: y, behavior: RM ? "auto" : "smooth" });
  }
  function initSmoothScroll() {
    if (!RM) {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
      document.documentElement.style.scrollBehavior = "auto";
      if (window.ScrollTrigger) lenis.on("scroll", window.ScrollTrigger.update);
      (function raf(t) {
        lenis.raf(t);
        requestAnimationFrame(raf);
      })(performance.now());
      window.__lenis = lenis;
    }
    addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest('a[href*="#"]');
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || url.hash.length < 2) return;
      const y = targetY(url.hash);
      if (y == null) return;
      e.preventDefault();
      e.stopPropagation();
      history.replaceState(null, "", url.hash);
      scrollToY(y);
    }, true);
    if (location.hash.length > 1) addEventListener("load", () => setTimeout(() => {
      const y = targetY(location.hash);
      if (y != null) {
        if (lenis) lenis.scrollTo(y, { immediate: true });
        else scrollTo(0, y);
      }
    }, 350));
    const links = $$(".header_chapter-link"), en = $("#energy"), be = $("#beyond"), wo = $("#world-model") || $(".section_home-world");
    if (links.length && en && be) {
      const ch = () => {
        const mk = innerHeight * 0.5, p = en.getBoundingClientRect(), b = be.getBoundingClientRect(), w = wo ? wo.getBoundingClientRect().top : 1e9;
        const c1 = p.top <= mk && b.top > mk, c2 = b.top <= mk && w > mk;
        [c1, c2].forEach((on, k) => {
          if (!links[k]) return;
          const l = links[k];
          l.style.color = on ? "#0071B1" : "";
          l.style.fontWeight = on ? "600" : "";
          l.style.setProperty("background-size", on ? "100% 1.5px" : "", on ? "important" : "");
          l.style.setProperty("background-position", on ? "0% 100%" : "", on ? "important" : "");
          l.toggleAttribute("aria-current", on);
        });
      };
      addEventListener("scroll", ch, { passive: true });
      ch();
    }
  }

  // src/ui/popups.js
  var dw;
  var K;
  var T;
  var P;
  var L;
  var steps = [];
  var cur = null;
  var timer;
  var onClose = null;
  var openY = 0;
  function ensure() {
    if (dw !== void 0) return !!dw;
    dw = $(".popup_component");
    if (!dw) return false;
    K = $(".popup_kicker", dw);
    T = $(".popup_title", dw);
    P = $(".popup_text", dw);
    L = $(".popup_list", dw);
    steps = $$(".popup_step", dw);
    dw.id = dw.id || "dw";
    dw.setAttribute("role", "dialog");
    dw.setAttribute("aria-modal", "false");
    if (T) {
      T.id = T.id || "dwT";
      dw.setAttribute("aria-labelledby", T.id);
    }
    const x = $(".popup_close", dw);
    if (x) {
      x.setAttribute("role", "button");
      x.setAttribute("aria-label", "Close");
      x.addEventListener("click", closeWindow);
      keyable(x, closeWindow);
    }
    dw.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", closeWindow);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeWindow();
    });
    addEventListener("scroll", () => {
      if (cur && Math.abs(scrollY - openY) > 80) closeWindow();
    }, { passive: true });
    return true;
  }
  function stepOn(s, on) {
    const t = $(".popup_step-text", s), d = $(".popup_step-dot", s);
    if (t) t.style.color = on ? "#05131C" : "";
    if (d) d.style.backgroundColor = on ? "#0071B1" : "";
  }
  function openWindow(trigger, d, opts = {}) {
    if (!ensure()) return;
    if (cur === trigger) {
      closeWindow();
      return;
    }
    closeWindow();
    cur = trigger;
    onClose = opts.onClose || null;
    openY = scrollY;
    trigger.setAttribute("aria-expanded", "true");
    const list = d.l || [], wide = !!opts.wide;
    if (K) {
      K.textContent = d.k || "";
      K.style.display = wide || !d.k ? "none" : "";
    }
    if (T) {
      T.textContent = d.t;
      T.style.fontSize = wide ? "28px" : "";
      T.style.marginTop = wide ? "0" : "";
    }
    if (P) P.textContent = d.p;
    steps.forEach((s, i2) => {
      const t = $(".popup_step-text", s);
      if (t) t.textContent = list[i2] || "";
      s.style.display = i2 < list.length ? "" : "none";
      stepOn(s, false);
    });
    if (L) L.style.display = wide || !list.length ? "none" : "";
    dw.style.padding = wide ? "30px 32px 26px" : "";
    dw.style.display = "block";
    const r = trigger.getBoundingClientRect(), w = Math.min(opts.width || 440, innerWidth - 32);
    dw.style.width = w + "px";
    const x = Math.min(Math.max(16, opts.align === "center" ? r.left + r.width / 2 - w / 2 : r.left), innerWidth - w - 16);
    let y = r.bottom + 14;
    dw.style.left = x + "px";
    dw.style.top = y + "px";
    const h = dw.offsetHeight;
    const above = y + h > innerHeight - 16;
    if (above) {
      y = Math.max(16, r.top - h - 14);
      dw.style.top = y + "px";
    }
    if (!RM) {
      const ox = clamp2((r.left + r.width / 2 - x) / w * 100, 0, 100).toFixed(1) + "%";
      dw.style.transformOrigin = ox + (above ? " 100%" : " 0%");
      play(dw, [{ opacity: 0, transform: `translateY(${above ? -6 : 6}px) scale(.97)` }, { opacity: 1, transform: "none" }], { duration: 220, easing: EASE_OUT });
      const scan = $(".popup_scan", dw);
      play(scan, [{ transform: "translateY(0)", opacity: 0 }, { opacity: 1, offset: 0.1 }, { opacity: 1, offset: 0.9 }, { transform: `translateY(${h}px)`, opacity: 0 }], { duration: 700, easing: EASE_OUT });
    }
    const shown = steps.slice(0, list.length);
    if (RM) {
      shown.forEach((s) => stepOn(s, true));
      return;
    }
    let i = 0;
    clearTimeout(timer);
    (function step() {
      if (!cur) return;
      if (i < shown.length) {
        stepOn(shown[i], true);
        i++;
        timer = setTimeout(step, opts.step || 600);
      }
    })();
  }
  function closeWindow() {
    if (!cur) return;
    cur.setAttribute("aria-expanded", "false");
    const t = cur, f = onClose;
    cur = null;
    onClose = null;
    dw.style.display = "none";
    clearTimeout(timer);
    f && f(t);
  }
  function makeTrigger(el, d, opts) {
    el.setAttribute("role", "button");
    el.setAttribute("aria-expanded", "false");
    if (!el.hasAttribute("tabindex")) el.tabIndex = 0;
    const on = (v) => {
      el.style.setProperty("background-size", v ? "100% 2px, 100% 1px" : "", v ? "important" : "");
    };
    const open = (e) => {
      e && e.stopPropagation();
      openWindow(el, typeof d === "function" ? d() : d, Object.assign({ onClose: () => on(false) }, opts));
      on(cur === el);
    };
    el.addEventListener("click", open);
    keyable(el, open);
    return el;
  }
  var toast;
  var tt;
  function showToast(msg) {
    if (toast === void 0) {
      toast = $(".toast_component");
      if (toast) toast.setAttribute("role", "status");
    }
    if (!toast) return;
    toast.textContent = msg;
    toast.style.opacity = "1";
    toast.style.transform = "translate(-50%,0)";
    clearTimeout(tt);
    tt = setTimeout(() => {
      toast.style.opacity = "";
      toast.style.transform = "";
    }, 2200);
  }
  var PENDING = [
    [/energy dashboard/i, "Energy dashboard link pending from client"],
    [/live energy/i, "Dashboard link pending from client"],
    [/whitepaper/i, "Whitepaper link pending from client"],
    [/contact/i, "Contact form link (Google Form or Typeform) pending from client"],
    [/linkedin/i, "LinkedIn link pending from client"],
    [/^x$|twitter/i, "X link pending from client"],
    [/facebook/i, "Facebook link pending from client"]
  ];
  function initPopups() {
    $$('a[href="#"]').forEach((a) => {
      const label2 = (a.getAttribute("aria-label") || a.textContent).trim();
      const hit = PENDING.find(([re]) => re.test(label2));
      a.addEventListener("click", (e) => {
        e.preventDefault();
        showToast(a.dataset.t || (hit ? hit[1] : "Link coming soon"));
      });
    });
  }

  // src/ui/buttons.js
  function brackets(btn, on) {
    const bs = btn.querySelectorAll(".button_bracket");
    const col = on ? btn.classList.contains("is-on-dark") ? "#E6D5B7" : "#0071B1" : "";
    bs.forEach((b) => {
      b.style.transition = on ? "transform 200ms cubic-bezier(0.23, 1, 0.32, 1),border-color 200ms ease" : "transform 160ms cubic-bezier(0.23, 1, 0.32, 1),border-color 160ms ease";
      b.style.transform = on ? `translateX(${b.classList.contains("is-right") ? 5 : -5}px)` : "";
      b.style.borderColor = col;
    });
  }
  function initButtons() {
    document.querySelectorAll(".button").forEach((el) => {
      if (!el.querySelector(".button_bracket")) return;
      el.addEventListener("pointerenter", () => brackets(el, true));
      el.addEventListener("pointerleave", () => brackets(el, false));
      el.addEventListener("focus", () => brackets(el, true));
      el.addEventListener("blur", () => brackets(el, false));
    });
  }

  // src/ui/reveal.js
  var MOVE = 16;
  var DURATION = 700;
  var STAGGER = 60;
  var EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
  var REVEAL = [
    // Home
    [".home-statement_component", false],
    [".home-owm_list", true],
    [".home-owm_title", false],
    [".home-usecases_heading", false],
    [".home-usecases_body", false],
    [".home-world_heading", true],
    [".home-world_steps", true],
    [".home-world_ctas", true],
    // About
    [".about-block_heading", true],
    [".about-block_copy", true],
    [".about-partners_heading", true],
    [".about-partners_grid", true],
    // Both pages
    [".footer_top", false],
    [".footer_bottom", false]
  ];
  function initReveal() {
    if (RM || !("IntersectionObserver" in window)) return;
    const items = [];
    REVEAL.forEach(([sel, group]) => $$(sel).forEach((el) => {
      if (group) [...el.children].forEach((ch, i) => items.push([ch, i * STAGGER]));
      else items.push([el, 0]);
    }));
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target, delay = el.__rvDelay || 0;
      el.style.transition = `opacity ${DURATION}ms ${EASE} ${delay}ms, transform ${DURATION}ms ${EASE} ${delay}ms`;
      el.style.opacity = "1";
      el.style.transform = "none";
      setTimeout(() => {
        el.style.transition = "";
        el.style.opacity = "";
        el.style.transform = "";
      }, DURATION + delay + 50);
    }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach(([el, delay]) => {
      if (el.__rvDelay !== void 0) return;
      el.__rvDelay = delay;
      el.style.opacity = "0";
      el.style.transform = `translateY(${MOVE}px)`;
      io.observe(el);
    });
  }

  // src/ui/header.js
  var SHOW_AFTER = 140;
  var IN = "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)";
  var OUT = "transform 200ms cubic-bezier(0.23, 1, 0.32, 1)";
  function initHeader() {
    const left = $(".header_component .header_left");
    if (!left) return;
    const chapter2 = $(".header_component .header_chapter");
    const logo = $(".header_logo", left), div = $(".header_divider", left), link = $(".header_link", left);
    const phone = matchMedia("(max-width:767px)");
    let bar = false, shown = true, lastY = scrollY;
    const pillH = () => chapter2 && chapter2.offsetHeight || (phone.matches ? 32 : 40);
    function setBar(on) {
      if (on === bar) return;
      bar = on;
      if (on) {
        const h = pillH();
        Object.assign(left.style, {
          position: "fixed",
          top: phone.matches ? "16px" : "20px",
          left: "var(--nav-inset, 24px)",
          zIndex: "61",
          height: h + "px",
          boxSizing: "border-box",
          padding: phone.matches ? "0 10px" : "0 14px",
          backgroundColor: "rgba(255,255,255,.92)",
          border: "1px solid rgba(5,19,28,.14)",
          transform: "translateY(-160%)",
          transition: "none"
        });
        if (logo) {
          logo.style.filter = "brightness(0)";
          logo.style.height = Math.round(h * 0.5) + "px";
          logo.style.width = "auto";
        }
        if (div) div.style.backgroundColor = "rgba(5,19,28,.2)";
        if (link) link.style.color = "#05131C";
        if (chapter2) {
          chapter2.style.transition = OUT;
          chapter2.style.transform = "translateY(-160%)";
        }
        shown = false;
      } else {
        ["position", "top", "left", "zIndex", "height", "boxSizing", "padding", "backgroundColor", "border", "transform", "transition"].forEach((k) => left.style[k] = "");
        if (logo) {
          logo.style.filter = "";
          logo.style.height = "";
          logo.style.width = "";
        }
        if (div) div.style.backgroundColor = "";
        if (link) link.style.color = "";
        if (chapter2) {
          chapter2.style.transition = IN;
          chapter2.style.transform = "";
        }
        shown = true;
      }
    }
    function show(on) {
      if (on === shown) return;
      shown = on;
      [left, chapter2].forEach((el) => {
        if (!el) return;
        el.style.transition = on ? IN : OUT;
        el.style.transform = on ? "none" : "translateY(-160%)";
      });
    }
    addEventListener("scroll", () => {
      const y = scrollY, dy = y - lastY;
      lastY = y;
      if (y < SHOW_AFTER) {
        setBar(false);
        return;
      }
      setBar(true);
      if (Math.abs(dy) > 2) show(dy < 0);
    }, { passive: true });
    const inset = () => {
      const grid = [...document.querySelectorAll("main .padding-global .container-large")].find((c) => c.offsetWidth > 0);
      if (grid) document.documentElement.style.setProperty("--nav-inset", Math.round(grid.getBoundingClientRect().left) + "px");
    };
    inset();
    addEventListener("resize", () => {
      inset();
      if (bar) {
        setBar(false);
        setBar(true);
        show(true);
      }
    });
  }

  // src/ui/hero-title.js
  var EASE2 = "cubic-bezier(0.16, 1, 0.3, 1)";
  var START = 200;
  var WORD_MS = 1100;
  var WORD_GAP = 90;
  var WORD_RISE = ".32em";
  var WORD_BLUR = 10;
  var TEXT_DELAY = 750;
  var TEXT_MS = 1e3;
  var GLOBE_DELAY = 500;
  var GLOBE_MS = 1800;
  var GLOBE_RISE = 36;
  function initHeroTitle() {
    const hero = $(".section_home-hero");
    if (!hero) return;
    const h1 = $("h1", hero), p = $(".home-hero_text", hero), canv = $$("canvas", hero);
    const show = (el) => {
      if (el) {
        el.style.animation = "none";
        el.style.opacity = "1";
      }
    };
    [h1, p].forEach(show);
    if (RM || !h1 || !h1.animate) return;
    const words = [];
    [...h1.childNodes].forEach((n) => {
      if (n.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((t) => {
        if (!t) return;
        if (/^\s+$/.test(t)) {
          frag.appendChild(document.createTextNode(t));
          return;
        }
        const s = document.createElement("span");
        s.textContent = t;
        s.style.display = "inline-block";
        s.style.willChange = "transform, filter, opacity";
        frag.appendChild(s);
        words.push(s);
      });
      n.replaceWith(frag);
    });
    words.forEach((w, i) => {
      const a = w.animate([
        { opacity: 0, transform: `translateY(${WORD_RISE})`, filter: `blur(${WORD_BLUR}px)` },
        { opacity: 1, transform: "none", filter: "blur(0)" }
      ], { duration: WORD_MS, delay: START + i * WORD_GAP, easing: EASE2, fill: "backwards" });
      a.onfinish = () => {
        w.style.willChange = "";
      };
    });
    if (p) p.animate([
      { opacity: 0, transform: "translateY(12px)", filter: "blur(4px)" },
      { opacity: 1, transform: "none", filter: "blur(0)" }
    ], { duration: TEXT_MS, delay: START + TEXT_DELAY, easing: EASE2, fill: "backwards" });
    canv.forEach((c) => {
      const o = getComputedStyle(c).opacity;
      c.animate(
        [{ opacity: 0, translate: `0 ${GLOBE_RISE}px` }, { opacity: o, translate: "0 0" }],
        { duration: GLOBE_MS, delay: START + GLOBE_DELAY, easing: EASE2, fill: "backwards" }
      );
    });
  }

  // src/data/globe.json
  var globe_default = { land: [[82.7, -35], [82.3, -39.7], [82.2, -52.1], [82.1, -32], [81.9, -44.4], [81.8, -56.8], [81.7, -36.8], [81.6, -49.2], [81.5, -29.1], [81.4, -41.5], [81.3, -53.9], [81.2, -33.8], [81.1, -46.2], [81, -26.2], [81, -58.6], [80.9, -38.6], [80.8, -51], [80.7, -30.9], [80.6, -43.3], [80.5, -55.7], [80.4, -35.7], [80.3, -48.1], [80.2, -28], [80.2, -60.5], [80.1, -40.4], [80, -52.8], [79.9, -32.7], [79.8, -45.1], [79.8, -25.1], [79.7, -57.5], [79.7, -37.5], [79.6, -49.9], [79.5, -29.8], [79.5, -62.3], [79.4, -42.2], [79.3, -54.6], [79.2, -34.5], [79.1, -46.9], [79.1, -26.9], [79, -59.3], [79, -39.3], [78.9, -51.7], [78.8, -31.6], [78.8, -64.1], [78.7, -44], [78.7, -23.9], [78.6, -56.4], [78.6, -36.3], [78.5, -48.7], [78.4, -28.7], [78.4, -61.1], [78.3, -41.1], [78.3, -21], [78.2, -53.5], [78.2, -33.4], [78.1, -65.9], [78.1, -45.8], [78, -25.8], [78, -58.2], [77.9, -38.2], [77.9, -50.6], [77.8, -30.5], [77.8, -63], [77.7, -42.9], [77.7, -22.8], [77.6, -55.3], [77.6, -35.2], [77.5, -67.7], [77.5, -47.6], [77.4, -27.6], [77.4, -60], [77.3, -40], [77.3, -52.4], [77.2, -32.3], [77.2, -64.8], [77.1, -44.7], [77.1, -24.6], [77, -57.1], [77, -37], [77, -69.5], [76.9, -49.4], [76.9, -29.4], [76.8, -61.8], [76.8, -41.8], [76.7, -21.7], [76.7, -54.2], [76.6, -34.1], [76.6, 103.4], [76.6, -66.6], [76.6, -46.5], [76.5, -26.4], [76.5, -58.9], [76.4, -38.8], [76.4, -51.2], [76.3, -31.2], [76.3, 106.3], [76.3, -63.6], [76.2, -43.6], [76.2, -23.5], [76.2, -56], [76.1, -35.9], [76.1, 101.6], [76, -48.3], [76, -28.3], [76, -60.7], [75.9, -40.7], [75.9, 96.9], [75.9, -20.6], [75.8, -53.1], [75.8, -33], [75.8, 104.5], [75.8, -65.5], [75.7, -45.4], [75.7, -25.3], [75.6, -57.8], [75.6, -37.7], [75.6, 99.8], [75.5, -50.1], [75.5, -30.1], [75.5, 107.4], [75.4, -62.5], [75.4, -42.5], [75.4, 95], [75.3, -22.4], [75.3, -54.9], [75.3, -34.8], [75.3, 102.7], [75.2, -47.2], [75.2, -27.1], [75.1, 110.4], [75.1, -59.6], [75.1, -39.5], [75.1, 98], [75, -51.9], [75, -31.9], [75, 105.6], [74.9, -64.3], [74.9, -44.3], [74.9, 93.2], [74.8, -24.2], [74.8, -56.7], [74.8, -36.6], [74.8, 100.9], [74.7, -49], [74.7, -28.9], [74.7, 108.6], [74.6, -61.4], [74.6, -41.3], [74.6, 96.2], [74.5, -21.3], [74.5, -53.7], [74.5, -33.7], [74.5, 103.8], [74.4, -46.1], [74.4, 91.4], [74.4, -26], [74.4, 111.5], [74.3, -58.5], [74.3, -38.4], [74.3, 99.1], [74.2, -50.8], [74.2, 86.7], [74.2, -30.8], [74.2, 106.8], [74.2, -63.2], [74.1, -43.2], [74.1, 94.4], [74.1, -23.1], [74.1, 114.4], [74.1, -55.6], [74, -35.5], [74, 102], [73.9, -47.9], [73.9, 89.6], [73.9, -27.8], [73.9, 109.7], [73.9, -60.3], [73.8, -40.2], [73.8, 97.3], [73.8, -52.6], [73.8, 84.9], [73.7, -32.6], [73.7, 104.9], [73.7, -45], [73.7, 92.5], [73.6, -24.9], [73.6, 112.6], [73.6, -57.4], [73.6, -37.3], [73.5, 100.2], [73.5, -49.7], [73.5, 87.8], [73.4, -29.6], [73.4, 107.9], [73.4, -62.1], [73.4, -42], [73.4, 95.5], [73.3, -22], [73.3, 115.5], [73.3, -54.4], [73.3, 83.1], [73.3, -34.4], [73.3, 103.1], [73.2, -46.8], [73.2, 90.7], [73.2, -26.7], [73.2, 110.8], [73.1, -59.2], [73.1, -39.1], [73.1, 98.4], [73.1, 118.5], [73, -51.5], [73, 86], [73, -31.4], [73, 106.1], [72.9, -43.8], [72.9, 93.7], [72.9, -23.8], [72.9, 113.7], [72.9, -108.8], [72.9, -56.2], [72.9, 81.3], [72.8, -36.2], [72.8, 101.3], [72.8, 121.4], [72.8, -48.6], [72.8, 88.9], [72.8, 141.5], [72.7, -28.5], [72.7, 109], [72.7, -40.9], [72.7, 96.6], [72.6, 116.7], [72.6, -105.8], [72.6, -53.3], [72.6, 84.2], [72.6, 136.7], [72.6, -33.3], [72.6, 104.3], [72.5, 124.3], [72.5, -45.7], [72.5, 91.9], [72.5, -25.6], [72.5, 111.9], [72.5, -110.6], [72.5, -58.1], [72.4, 79.5], [72.4, -38], [72.4, 99.5], [72.4, 119.6], [72.4, -102.9], [72.4, -50.4], [72.3, 87.1], [72.3, 139.6], [72.3, -30.3], [72.3, 107.2], [72.3, 127.2], [72.3, -42.7], [72.2, 94.8], [72.2, -22.7], [72.2, 114.8], [72.2, -107.6], [72.2, -55.1], [72.2, 82.4], [72.2, 134.9], [72.2, -35.1], [72.2, 102.4], [72.1, 122.5], [72.1, -100], [72.1, -47.5], [72.1, 90], [72.1, 142.6], [72.1, -27.4], [72.1, 110.1], [72, -112.4], [72, 77.6], [72, 130.2], [72, -39.8], [72, 97.7], [72, 117.8], [72, -104.7], [71.9, -52.2], [71.9, 85.3], [71.9, 137.8], [71.9, -32.1], [71.9, 105.4], [71.9, 125.4], [71.9, -97.1], [71.8, -44.5], [71.8, 93], [71.8, 145.5], [71.8, -24.5], [71.8, 113], [71.8, -109.5], [71.8, -56.9], [71.8, 80.6], [71.8, 133.1], [71.7, -36.9], [71.7, 100.6], [71.7, 120.7], [71.7, -101.8], [71.7, -49.3], [71.7, 88.2], [71.7, 140.8], [71.6, -29.2], [71.6, 108.3], [71.6, -114.2], [71.6, 75.8], [71.6, 128.4], [71.6, -94.1], [71.6, -41.6], [71.6, 95.9], [71.6, 148.4], [71.5, 116], [71.5, -106.5], [71.5, -54], [71.5, 83.5], [71.5, 136], [71.5, -33.9], [71.5, 103.6], [71.5, 123.6], [71.4, -98.9], [71.4, -46.3], [71.4, 91.2], [71.4, 143.7], [71.4, -26.3], [71.4, 111.2], [71.4, -111.3], [71.4, 78.8], [71.4, 131.3], [71.3, -38.7], [71.3, 98.8], [71.3, 118.9], [71.3, -103.6], [71.3, -51.1], [71.3, 86.4], [71.3, 139], [71.2, -31], [71.2, 106.5], [71.2, -116], [71.2, 74], [71.2, 126.6], [71.2, -95.9], [71.2, -43.4], [71.2, 94.1], [71.2, 146.6], [71.2, -23.4], [71.1, 114.2], [71.1, -108.3], [71.1, -55.8], [71.1, 81.7], [71.1, 134.2], [71.1, -35.8], [71.1, 101.8], [71.1, 121.8], [71.1, -100.7], [71, -48.2], [71, 89.4], [71, 141.9], [71, -28.1], [71, 109.4], [71, -113.1], [71, 77], [71, 129.5], [71, -93], [70.9, -40.5], [70.9, 97], [70.9, 149.5], [70.9, 117.1], [70.9, -105.4], [70.9, -52.9], [70.9, 84.6], [70.9, 137.1], [70.9, -32.8], [70.8, 104.7], [70.8, -117.8], [70.8, 72.2], [70.8, 124.7], [70.8, -97.7], [70.8, -45.2], [70.8, 92.3], [70.8, 144.8], [70.8, -25.2], [70.8, 112.3], [70.8, -110.1], [70.7, 27.4], [70.7, 79.9], [70.7, 132.4], [70.7, -37.6], [70.7, 99.9], [70.7, 152.5], [70.7, -155], [70.7, 120], [70.7, -102.5], [70.7, -50], [70.6, 87.5], [70.6, 140.1], [70.6, -29.9], [70.6, 107.6], [70.6, -114.9], [70.6, 75.1], [70.6, 127.7], [70.6, -94.8], [70.6, -42.3], [70.6, 95.2], [70.5, 147.7], [70.5, -22.2], [70.5, 115.3], [70.5, -107.2], [70.5, -54.7], [70.5, 82.8], [70.5, 135.3], [70.5, -34.6], [70.5, 102.9], [70.5, -119.6], [70.5, 155.4], [70.4, 70.4], [70.4, -152.1], [70.4, 122.9], [70.4, -99.6], [70.4, -47], [70.4, 90.5], [70.4, 143], [70.4, -27], [70.4, 110.5], [70.4, -112], [70.4, 25.6], [70.4, 78.1], [70.3, 130.6], [70.3, -91.9], [70.3, -39.4], [70.3, 98.1], [70.3, 150.7], [70.3, -156.8], [70.3, 118.2], [70.3, -104.3], [70.3, -51.8], [70.3, 85.7], [70.3, 138.3], [70.2, -31.7], [70.2, 105.8], [70.2, -116.7], [70.2, 20.8], [70.2, 158.3], [70.2, 73.3], [70.2, -149.2], [70.2, 125.9], [70.2, -96.6], [70.2, -44.1], [70.2, 93.4], [70.2, 145.9], [70.1, -24], [70.1, 113.5], [70.1, -109], [70.1, 28.5], [70.1, 81], [70.1, 133.5], [70.1, -89], [70.1, -36.4], [70.1, 101.1], [70.1, -121.4], [70.1, 153.6], [70.1, 68.6], [70.1, -153.9], [70.1, 121.1], [70, -101.4], [70, -48.8], [70, 88.7], [70, 141.2], [70, -28.8], [70, 108.7], [70, -113.8], [70, 23.7], [70, 76.3], [70, -146.2], [70, 128.8], [70, -93.7], [69.9, -41.2], [69.9, 96.3], [69.9, -126.2], [69.9, 148.9], [69.9, -158.6], [69.9, 116.4], [69.9, -106.1], [69.9, -53.6], [69.9, 83.9], [69.9, -138.6], [69.9, 136.5], [69.9, -33.5], [69.9, 104], [69.9, -118.5], [69.8, 19], [69.8, 156.5], [69.8, 71.5], [69.8, -151], [69.8, 124.1], [69.8, -98.4], [69.8, -45.9], [69.8, 91.6], [69.8, -130.9], [69.8, 144.1], [69.8, -25.9], [69.8, 111.7], [69.8, -110.8], [69.8, 26.7], [69.7, 79.2], [69.7, -143.3], [69.7, 131.7], [69.7, -90.8], [69.7, -38.3], [69.7, 99.3], [69.7, -123.2], [69.7, 151.8], [69.7, 66.8], [69.7, -155.7], [69.7, 119.3], [69.7, -103.2], [69.7, -50.7], [69.7, 86.9], [69.7, -135.6], [69.7, 139.4], [69.6, -30.6], [69.6, 106.9], [69.6, -115.6], [69.6, 21.9], [69.6, 159.4], [69.6, 74.5], [69.6, -148], [69.6, 127], [69.6, -95.5], [69.6, -43], [69.6, 94.5], [69.6, -128], [69.6, 147], [69.6, -160.4], [69.5, 114.6], [69.5, -107.9], [69.5, 82.1], [69.5, -140.4], [69.5, 134.6], [69.5, -87.8], [69.5, -35.3], [69.5, 102.2], [69.5, -120.3], [69.5, 154.7], [69.5, 69.7], [69.5, -152.8], [69.5, 122.2], [69.5, -100.2], [69.4, -47.7], [69.4, 89.8], [69.4, -132.7], [69.4, 142.3], [69.4, -27.7], [69.4, 109.8], [69.4, -112.6], [69.4, 24.9], [69.4, 162.4], [69.4, 77.4], [69.4, -145.1], [69.4, 129.9], [69.4, -92.6], [69.4, -40.1], [69.4, 97.4], [69.3, -125], [69.3, 150], [69.3, 65], [69.3, -157.5], [69.3, 117.5], [69.3, -105], [69.3, -52.5], [69.3, 85], [69.3, -137.4], [69.3, 137.6], [69.3, -32.4], [69.3, 105.1], [69.3, -117.4], [69.3, 20.1], [69.3, 157.6], [69.2, 72.6], [69.2, -149.8], [69.2, 125.2], [69.2, -97.3], [69.2, -44.8], [69.2, 92.7], [69.2, -129.8], [69.2, 145.2], [69.2, -162.2], [69.2, 112.8], [69.2, -109.7], [69.2, 27.8], [69.2, 165.3], [69.2, 80.3], [69.2, -142.2], [69.1, 132.8], [69.1, -89.7], [69.1, -37.1], [69.1, 100.4], [69.1, -122.1], [69.1, 152.9], [69.1, 67.9], [69.1, -154.6], [69.1, 120.4], [69.1, -102.1], [69.1, -49.5], [69.1, 88], [69.1, -134.5], [69.1, 140.5], [69, -29.5], [69, 108], [69, -114.5], [69, 23.1], [69, 160.6], [69, 75.6], [69, -146.9], [69, 128.1], [69, -94.4], [69, -41.9], [69, 95.6], [69, -126.9], [69, 148.2], [69, 63.2], [69, -159.3], [69, 115.7], [69, -106.8], [68.9, 168.2], [68.9, -54.3], [68.9, 83.2], [68.9, -139.3], [68.9, 135.8], [68.9, -86.7], [68.9, -34.2], [68.9, 103.3], [68.9, -119.2], [68.9, 18.3], [68.9, 155.8], [68.9, 70.8], [68.9, -151.7], [68.9, 123.4], [68.9, -99.1], [68.9, -46.6], [68.9, 90.9], [68.9, -131.6], [68.8, 143.4], [68.8, 58.4], [68.8, -26.5], [68.8, 111], [68.8, -111.5], [68.8, 26], [68.8, 163.5], [68.8, 78.5], [68.8, -144], [68.8, 131], [68.8, -91.5], [68.8, -38.9], [68.8, 98.6], [68.8, -123.9], [68.8, 151.1], [68.8, 66.1], [68.8, -156.4], [68.7, 118.6], [68.7, -103.9], [68.7, 171.1], [68.7, -51.3], [68.7, 86.2], [68.7, -136.3], [68.7, 138.7], [68.7, -31.3], [68.7, 106.2], [68.7, -116.3], [68.7, 21.2], [68.7, 158.8], [68.7, 73.8], [68.7, -148.7], [68.7, 126.3], [68.7, -96.2], [68.6, -43.7], [68.6, 93.8], [68.6, -128.7], [68.6, 146.4], [68.6, 61.4], [68.6, -161.1], [68.6, 113.9], [68.6, -108.6], [68.6, 28.9], [68.6, 166.4], [68.6, 81.4], [68.6, -141.1], [68.6, 134], [68.6, -88.5], [68.6, -36], [68.6, 101.5], [68.6, -121], [68.6, 16.5], [68.5, 154], [68.5, 69], [68.5, -153.5], [68.5, 121.6], [68.5, -100.9], [68.5, 174.1], [68.5, -48.4], [68.5, 89.1], [68.5, -133.4], [68.5, 141.6], [68.5, 56.6], [68.5, -28.4], [68.5, 109.2], [68.5, -113.3], [68.5, 24.2], [68.5, 161.7], [68.5, 76.7], [68.5, -145.8], [68.4, 129.2], [68.4, -93.3], [68.4, -40.8], [68.4, 96.8], [68.4, -125.7], [68.4, 149.3], [68.4, 64.3], [68.4, -158.2], [68.4, 116.8], [68.4, -105.7], [68.4, 169.3], [68.4, -53.2], [68.4, 84.4], [68.4, -138.1], [68.4, 136.9], [68.4, -85.6], [68.4, 51.9], [68.3, -33.1], [68.3, 104.4], [68.3, -118.1], [68.3, 19.4], [68.3, 156.9], [68.3, 72], [68.3, -150.5], [68.3, 124.5], [68.3, -98], [68.3, -45.5], [68.3, 92], [68.3, -130.5], [68.3, 144.5], [68.3, 59.6], [68.3, -162.9], [68.3, 112.1], [68.3, -110.4], [68.3, 27.1], [68.3, 164.6], [68.2, 79.6], [68.2, -142.9], [68.2, 132.1], [68.2, -90.3], [68.2, -37.8], [68.2, 99.7], [68.2, -122.8], [68.2, 152.2], [68.2, 67.2], [68.2, -155.3], [68.2, 119.7], [68.2, -102.7], [68.2, 172.3], [68.2, -50.2], [68.2, 87.3], [68.2, -135.2], [68.2, 139.8], [68.1, 54.8], [68.1, -30.2], [68.1, 107.3], [68.1, -115.1], [68.1, 22.4], [68.1, 159.9], [68.1, 74.9], [68.1, -147.6], [68.1, 127.4], [68.1, -95.1], [68.1, -42.6], [68.1, 94.9], [68.1, -127.5], [68.1, 147.5], [68.1, 62.5], [68.1, -160], [68.1, 115], [68, -107.5], [68, 167.5], [68, 82.5], [68, -139.9], [68, 135.1], [68, -87.4], [68, 50.1], [68, -34.9], [68, 102.6], [68, -119.9], [68, 17.6], [68, 155.1], [68, 70.1], [68, -152.3], [68, 122.7], [68, -99.8], [68, 175.2], [68, -47.3], [68, 90.2], [67.9, -132.3], [67.9, 142.7], [67.9, 57.7], [67.9, -164.7], [67.9, 110.3], [67.9, -112.2], [67.9, 25.3], [67.9, 162.8], [67.9, 77.8], [67.9, -144.7], [67.9, 130.3], [67.9, -92.2], [67.9, 45.3], [67.9, -39.6], [67.9, 97.9], [67.9, -124.6], [67.9, 150.4], [67.9, 65.4], [67.8, -157.1], [67.8, 117.9], [67.8, -104.6], [67.8, 170.5], [67.8, -52], [67.8, 85.5], [67.8, -137], [67.8, 138], [67.8, -84.5], [67.8, 53], [67.8, -32], [67.8, 105.5], [67.8, -117], [67.8, 20.6], [67.8, 158.1], [67.8, 73.1], [67.8, -149.4], [67.8, 125.6], [67.8, -96.9], [67.7, 178.1], [67.7, -44.4], [67.7, 93.1], [67.7, -129.4], [67.7, 145.7], [67.7, 60.7], [67.7, -161.8], [67.7, 113.2], [67.7, -109.3], [67.7, 28.2], [67.7, 165.7], [67.7, 80.7], [67.7, -141.8], [67.7, 133.3], [67.7, -89.2], [67.7, 48.3], [67.7, -36.7], [67.7, 100.8], [67.7, -121.7], [67.7, 15.8], [67.7, 153.3], [67.6, 68.3], [67.6, -154.2], [67.6, 120.9], [67.6, -101.6], [67.6, 173.4], [67.6, -49.1], [67.6, 88.4], [67.6, -134.1], [67.6, 140.9], [67.6, 55.9], [67.6, 108.5], [67.6, -114], [67.6, 23.5], [67.6, 161], [67.6, 76], [67.6, -146.5], [67.6, 128.5], [67.5, -94], [67.5, 43.5], [67.5, -41.4], [67.5, 96.1], [67.5, -126.4], [67.5, 148.6], [67.5, 63.6], [67.5, -158.9], [67.5, 116.1], [67.5, -106.4], [67.5, 168.6], [67.5, 83.7], [67.5, -138.8], [67.5, 136.2], [67.5, -86.3], [67.5, 51.2], [67.5, -33.8], [67.5, 103.7], [67.5, -118.8], [67.4, 18.7], [67.4, 156.3], [67.4, 71.3], [67.4, -151.2], [67.4, 123.8], [67.4, -98.7], [67.4, 176.3], [67.4, -46.2], [67.4, 91.3], [67.4, -131.2], [67.4, 143.9], [67.4, 58.9], [67.4, -163.6], [67.4, 111.4], [67.4, -111.1], [67.4, 26.4], [67.4, 163.9], [67.4, 78.9], [67.4, -143.6], [67.3, 131.5], [67.3, -91], [67.3, 46.5], [67.3, -38.5], [67.3, 99], [67.3, -123.5], [67.3, 14], [67.3, 151.5], [67.3, 66.5], [67.3, -156], [67.3, 119.1], [67.3, -103.4], [67.3, 171.6], [67.3, -50.9], [67.3, 86.6], [67.3, -135.9], [67.3, 139.1], [67.3, 54.1], [67.3, 106.7], [67.2, -115.8], [67.2, 21.7], [67.2, 159.2], [67.2, 74.2], [67.2, -148.3], [67.2, 126.7], [67.2, -95.8], [67.2, 179.2], [67.2, -43.3], [67.2, 94.3], [67.2, -128.2], [67.2, 146.8], [67.2, 61.8], [67.2, -160.7], [67.2, 114.3], [67.2, -108.2], [67.2, 166.8], [67.2, 81.9], [67.2, -140.6], [67.1, 134.4], [67.1, -88.1], [67.1, 49.4], [67.1, -35.6], [67.1, 101.9], [67.1, -120.6], [67.1, 16.9], [67.1, 154.4], [67.1, 69.5], [67.1, -153], [67.1, 122], [67.1, -100.5], [67.1, 174.5], [67.1, -48], [67.1, 89.5], [67.1, -133], [67.1, 142], [67.1, 57.1], [67.1, -165.4], [67, 109.6], [67, -112.9], [67, 24.6], [67, 162.1], [67, 77.1], [67, -145.4], [67, 129.6], [67, -92.8], [67, 44.7], [67, -40.3], [67, 97.2], [67, -125.3], [67, 149.7], [67, 64.7], [67, -157.8], [67, 117.2], [67, -105.2], [67, 169.8], [67, -52.7], [67, 84.8], [66.9, -137.7], [66.9, 137.3], [66.9, -85.2], [66.9, 52.3], [66.9, 104.8], [66.9, -117.6], [66.9, 19.9], [66.9, 157.4], [66.9, 72.4], [66.9, -150.1], [66.9, 124.9], [66.9, -97.6], [66.9, 177.4], [66.9, -45.1], [66.9, 92.4], [66.9, -130], [66.9, 145], [66.9, 60], [66.9, -162.5], [66.8, 112.5], [66.8, -110], [66.8, 165], [66.8, 80], [66.8, -142.4], [66.8, 132.6], [66.8, -89.9], [66.8, 47.6], [66.8, -37.4], [66.8, 100.1], [66.8, -122.4], [66.8, 15.1], [66.8, 152.6], [66.8, 67.6], [66.8, -154.8], [66.8, 120.2], [66.8, -102.3], [66.8, 172.7], [66.8, -49.8], [66.8, 87.7], [66.7, -134.8], [66.7, 140.2], [66.7, 55.2], [66.7, 107.8], [66.7, -114.7], [66.7, 22.8], [66.7, 160.3], [66.7, 75.3], [66.7, -147.2], [66.7, 127.8], [66.7, -94.7], [66.7, 42.8], [66.7, -42.1], [66.7, 95.4], [66.7, -127.1], [66.7, 147.9], [66.7, 62.9], [66.7, -159.6], [66.6, 115.4], [66.6, -107.1], [66.6, 168], [66.6, 83], [66.6, -139.5], [66.6, 135.5], [66.6, -87], [66.6, 50.5], [66.6, -34.5], [66.6, 103], [66.6, -119.5], [66.6, 18.1], [66.6, 155.6], [66.6, 70.6], [66.6, -151.9], [66.6, 123.1], [66.6, -99.4], [66.6, 175.6], [66.6, -46.9], [66.6, 90.6], [66.6, -131.9], [66.5, 143.2], [66.5, 58.2], [66.5, -164.3], [66.5, 110.7], [66.5, -111.8], [66.5, 25.7], [66.5, 163.2], [66.5, 78.2], [66.5, -144.3], [66.5, 130.8], [66.5, -91.7], [66.5, 45.8], [66.5, -39.2], [66.5, 98.3], [66.5, -124.2], [66.5, 13.3], [66.5, 150.8], [66.5, 65.8], [66.5, -156.7], [66.5, 118.4], [66.4, -104.1], [66.4, 170.9], [66.4, -51.6], [66.4, 85.9], [66.4, -136.6], [66.4, 138.4], [66.4, -84.1], [66.4, 53.4], [66.4, 106], [66.4, -116.5], [66.4, 21], [66.4, 158.5], [66.4, 73.5], [66.4, -149], [66.4, 126], [66.4, -96.5], [66.4, 41], [66.4, 178.5], [66.4, -43.9], [66.4, 93.6], [66.4, -128.9], [66.3, 146.1], [66.3, 61.1], [66.3, -161.4], [66.3, 113.6], [66.3, -108.9], [66.3, 166.1], [66.3, 81.2], [66.3, -141.3], [66.3, 133.7], [66.3, -88.8], [66.3, 48.7], [66.3, -36.3], [66.3, 101.2], [66.3, -121.3], [66.3, 16.2], [66.3, 153.8], [66.3, 68.8], [66.3, -153.7], [66.3, 121.3], [66.3, -101.2], [66.2, 173.8], [66.2, -48.7], [66.2, 88.8], [66.2, -133.7], [66.2, 141.4], [66.2, 56.4], [66.2, -166.1], [66.2, 108.9], [66.2, -113.6], [66.2, 23.9], [66.2, 161.4], [66.2, 76.4], [66.2, -146.1], [66.2, 129], [66.2, -93.5], [66.2, 44], [66.2, -41], [66.2, 96.5], [66.2, -126], [66.2, 149], [66.1, 64], [66.1, -158.5], [66.1, 116.6], [66.1, -105.9], [66.1, 169.1], [66.1, 84.1], [66.1, -138.4], [66.1, 136.6], [66.1, -85.9], [66.1, 51.6], [66.1, 104.2], [66.1, -118.3], [66.1, 19.2], [66.1, 156.7], [66.1, 71.7], [66.1, -150.8], [66.1, 124.2], [66.1, -98.3], [66, 176.7], [66, -45.8], [66, 91.8], [66, -130.7], [66, 144.3], [66, 59.3], [66, -163.2], [66, 111.8], [66, -110.7], [66, 164.3], [66, 79.4], [66, -143.1], [66, 131.9], [66, -90.6], [66, 46.9], [66, -38.1], [66, 99.4], [66, -123.1], [66, 14.4], [66, 151.9], [65.9, 67], [65.9, -155.5], [65.9, 119.5], [65.9, -103], [65.9, 172], [65.9, -50.5], [65.9, 87], [65.9, -135.5], [65.9, 139.5], [65.9, 54.6], [65.9, -167.9], [65.9, 107.1], [65.9, -115.4], [65.9, 22.1], [65.9, 159.6], [65.9, 74.6], [65.9, -147.9], [65.9, 127.1], [65.9, -95.3], [65.9, 42.2], [65.9, -42.8], [65.8, 94.7], [65.8, -127.8], [65.8, 147.2], [65.8, 62.2], [65.8, -160.3], [65.8, 114.7], [65.8, -107.7], [65.8, 167.3], [65.8, 82.3], [65.8, -140.2], [65.8, 134.8], [65.8, -87.7], [65.8, 49.8], [65.8, 102.3], [65.8, -120.1], [65.8, 17.4], [65.8, 154.9], [65.8, 69.9], [65.8, -152.6], [65.7, 122.4], [65.7, -100.1], [65.7, 174.9], [65.7, -47.6], [65.7, 89.9], [65.7, -132.5], [65.7, 142.5], [65.7, 57.5], [65.7, -165], [65.7, 110], [65.7, -112.5], [65.7, 25], [65.7, 162.5], [65.7, 77.5], [65.7, -144.9], [65.7, 130.1], [65.7, -92.4], [65.7, 45.1], [65.7, -39.9], [65.7, 97.6], [65.7, -124.9], [65.6, 12.6], [65.6, 150.1], [65.6, 65.1], [65.6, -157.3], [65.6, 117.7], [65.6, -104.8], [65.6, 170.2], [65.6, -52.3], [65.6, 85.2], [65.6, -137.3], [65.6, 137.7], [65.6, -84.8], [65.6, 52.7], [65.6, 105.3], [65.6, -117.2], [65.6, 20.3], [65.6, 157.8], [65.6, 72.8], [65.6, -149.7], [65.6, 125.3], [65.6, -97.2], [65.5, 40.3], [65.5, 177.9], [65.5, -44.6], [65.5, 92.9], [65.5, -129.6], [65.5, 145.4], [65.5, 60.4], [65.5, -162.1], [65.5, 112.9], [65.5, -109.6], [65.5, 165.5], [65.5, 80.5], [65.5, -142], [65.5, 133], [65.5, -89.5], [65.5, 48], [65.5, 100.5], [65.5, -122], [65.5, 15.6], [65.5, 153.1], [65.4, 68.1], [65.4, -154.4], [65.4, 120.6], [65.4, -101.9], [65.4, 173.1], [65.4, -49.4], [65.4, 88.1], [65.4, -134.4], [65.4, 140.7], [65.4, 55.7], [65.4, -166.8], [65.4, 108.2], [65.4, -114.3], [65.4, 23.2], [65.4, 160.7], [65.4, 75.7], [65.4, -146.8], [65.4, 128.3], [65.4, -94.2], [65.4, 43.3], [65.4, -41.7], [65.3, 95.8], [65.3, -126.7], [65.3, 148.3], [65.3, 63.3], [65.3, -159.2], [65.3, 115.9], [65.3, -106.6], [65.3, 168.4], [65.3, 83.4], [65.3, -139.1], [65.3, 135.9], [65.3, -86.6], [65.3, 50.9], [65.3, 103.5], [65.3, -119], [65.3, 18.5], [65.3, 156], [65.3, 71], [65.3, -151.5], [65.2, 123.5], [65.2, -99], [65.2, 38.5], [65.2, 176], [65.2, -46.4], [65.2, 91.1], [65.2, -131.4], [65.2, 143.6], [65.2, 58.6], [65.2, -163.9], [65.2, 111.1], [65.2, -111.4], [65.2, 163.6], [65.2, 78.7], [65.2, -143.8], [65.2, 131.2], [65.2, -91.3], [65.2, 46.2], [65.2, 98.7], [65.2, -123.8], [65.2, 13.7], [65.2, 151.3], [65.1, 66.3], [65.1, -156.2], [65.1, 118.8], [65.1, -103.7], [65.1, 171.3], [65.1, -51.2], [65.1, 86.3], [65.1, -136.2], [65.1, 138.9], [65.1, -83.6], [65.1, 53.9], [65.1, 106.4], [65.1, -116.1], [65.1, 21.4], [65.1, 158.9], [65.1, 73.9], [65.1, -148.6], [65.1, 126.5], [65.1, -96], [65.1, 41.5], [65, -43.5], [65, 94], [65, -128.5], [65, 146.5], [65, 61.5], [65, -161], [65, 114.1], [65, -108.4], [65, 166.6], [65, 81.6], [65, -140.9], [65, 134.1], [65, -88.4], [65, 49.1], [65, 101.7], [65, -120.8], [65, 16.7], [65, 154.2], [65, 69.2], [65, -153.3], [64.9, -15.8], [64.9, 121.7], [64.9, -100.8], [64.9, 36.7], [64.9, 174.2], [64.9, -48.3], [64.9, 89.3], [64.9, -133.2], [64.9, 141.8], [64.9, 56.8], [64.9, -165.7], [64.9, 109.3], [64.9, -113.2], [64.9, 24.3], [64.9, 161.8], [64.9, 76.9], [64.9, -145.6], [64.9, 129.4], [64.9, -93.1], [64.9, 44.4], [64.9, -40.6], [64.9, 96.9], [64.9, -125.6], [64.9, 11.9], [64.8, 149.4], [64.8, 64.5], [64.8, -158], [64.8, -20.5], [64.8, 117], [64.8, -105.5], [64.8, 169.5], [64.8, 84.5], [64.8, -138], [64.8, 137], [64.8, -85.5], [64.8, 52.1], [64.8, 104.6], [64.8, -117.9], [64.8, 19.6], [64.8, 157.1], [64.8, 72.1], [64.8, -150.4], [64.8, 124.6], [64.8, -97.8], [64.8, 39.7], [64.8, 177.2], [64.7, -45.3], [64.7, 92.2], [64.7, -130.3], [64.7, 144.7], [64.7, 59.7], [64.7, -162.8], [64.7, 112.2], [64.7, -110.2], [64.7, 164.8], [64.7, 79.8], [64.7, -142.7], [64.7, 132.3], [64.7, -90.2], [64.7, 47.3], [64.7, 99.8], [64.7, -122.6], [64.7, 14.9], [64.7, 152.4], [64.7, 67.4], [64.7, -155.1], [64.7, -17.6], [64.6, 119.9], [64.6, -102.6], [64.6, 34.9], [64.6, 172.4], [64.6, -50.1], [64.6, 87.4], [64.6, -135], [64.6, 140], [64.6, -82.5], [64.6, 55], [64.6, 107.5], [64.6, -115], [64.6, 22.5], [64.6, 160], [64.6, 75], [64.6, -147.4], [64.6, 127.6], [64.6, -94.9], [64.6, 42.6], [64.6, -42.4], [64.6, 95.1], [64.6, -127.4], [64.6, 10.1], [64.6, 147.6], [64.5, 62.6], [64.5, -159.8], [64.5, -22.3], [64.5, 115.2], [64.5, -107.3], [64.5, 167.7], [64.5, 82.7], [64.5, -139.8], [64.5, 135.2], [64.5, -87.3], [64.5, 50.2], [64.5, 102.8], [64.5, -119.7], [64.5, 17.8], [64.5, 155.3], [64.5, 70.3], [64.5, -152.2], [64.5, -14.7], [64.5, 122.8], [64.5, -99.7], [64.5, 37.8], [64.5, 175.4], [64.5, -47.1], [64.4, 90.4], [64.4, -132.1], [64.4, 142.9], [64.4, 57.9], [64.4, -164.6], [64.4, 110.4], [64.4, -112.1], [64.4, 163], [64.4, 78], [64.4, -144.5], [64.4, 130.5], [64.4, -92], [64.4, 45.5], [64.4, 98], [64.4, -124.5], [64.4, 13.1], [64.4, 150.6], [64.4, 65.6], [64.4, -156.9], [64.4, -19.4], [64.4, 118.1], [64.3, -104.4], [64.3, 170.6], [64.3, 85.6], [64.3, -136.9], [64.3, 138.2], [64.3, -84.3], [64.3, 53.2], [64.3, 105.7], [64.3, -116.8], [64.3, 20.7], [64.3, 158.2], [64.3, 73.2], [64.3, -149.3], [64.3, 125.8], [64.3, -96.7], [64.3, 40.8], [64.3, -44.2], [64.3, 93.3], [64.3, -129.2], [64.3, 145.8], [64.2, 60.8], [64.2, -161.7], [64.2, 113.4], [64.2, -109.1], [64.2, 165.9], [64.2, 80.9], [64.2, -141.6], [64.2, 133.4], [64.2, -89.1], [64.2, 48.4], [64.2, 101], [64.2, -121.5], [64.2, 16], [64.2, 153.5], [64.2, 68.5], [64.2, -154], [64.2, -16.5], [64.2, 121], [64.2, -101.5], [64.2, 36], [64.2, 173.5], [64.2, -48.9], [64.2, 88.6], [64.1, -133.9], [64.1, 141.1], [64.1, 56.1], [64.1, -166.4], [64.1, 108.6], [64.1, -113.9], [64.1, 23.6], [64.1, 161.1], [64.1, 76.2], [64.1, -146.3], [64.1, 128.7], [64.1, -93.8], [64.1, 43.7], [64.1, -41.3], [64.1, 96.2], [64.1, -126.3], [64.1, 11.2], [64.1, 148.8], [64.1, 63.8], [64.1, -158.7], [64.1, -21.2], [64.1, 116.3], [64.1, -106.2], [64, 168.8], [64, 83.8], [64, -138.7], [64, 136.4], [64, -86.1], [64, 51.4], [64, 103.9], [64, -118.6], [64, 18.9], [64, 156.4], [64, 71.4], [64, -151.1], [64, 124], [64, -98.5], [64, 39], [64, 176.5], [64, -46], [64, 91.5], [64, -131], [64, 144], [64, 59], [64, -163.5], [63.9, 111.6], [63.9, -110.9], [63.9, 164.1], [63.9, 79.1], [63.9, -143.4], [63.9, 131.6], [63.9, -90.9], [63.9, 46.6], [63.9, 99.2], [63.9, -123.3], [63.9, 14.2], [63.9, 151.7], [63.9, 66.7], [63.9, -155.8], [63.9, -18.3], [63.9, 119.2], [63.9, -103.3], [63.9, 34.2], [63.9, 171.7], [63.9, 86.8], [63.9, -135.7], [63.9, 139.3], [63.8, -83.2], [63.8, 54.3], [63.8, 106.8], [63.8, -115.7], [63.8, 21.8], [63.8, 159.3], [63.8, 74.4], [63.8, -148.1], [63.8, 126.9], [63.8, -95.6], [63.8, 41.9], [63.8, -43.1], [63.8, 94.4], [63.8, -128.1], [63.8, 9.4], [63.8, 146.9], [63.8, 62], [63.8, -160.5], [63.8, 114.5], [63.8, -108], [63.8, 167], [63.8, 82], [63.7, -140.5], [63.7, 134.5], [63.7, -88], [63.7, 49.6], [63.7, 102.1], [63.7, -120.4], [63.7, 17.1], [63.7, 154.6], [63.7, 69.6], [63.7, -152.9], [63.7, 122.1], [63.7, -100.3], [63.7, 37.2], [63.7, 174.7], [63.7, -47.8], [63.7, 89.7], [63.7, -132.8], [63.7, 142.2], [63.7, 57.2], [63.7, -165.3], [63.7, 109.7], [63.7, -112.7], [63.6, 162.3], [63.6, 77.3], [63.6, -145.2], [63.6, 129.8], [63.6, -92.7], [63.6, 44.8], [63.6, 97.3], [63.6, -125.1], [63.6, 12.4], [63.6, 149.9], [63.6, 64.9], [63.6, -157.6], [63.6, 117.4], [63.6, -105.1], [63.6, 169.9], [63.6, 84.9], [63.6, -137.5], [63.6, 137.5], [63.6, -85], [63.6, 52.5], [63.5, 105], [63.5, -117.5], [63.5, 20], [63.5, 157.5], [63.5, 72.5], [63.5, -149.9], [63.5, 125.1], [63.5, -97.4], [63.5, 40.1], [63.5, -44.9], [63.5, 92.6], [63.5, -129.9], [63.5, 145.1], [63.5, 60.1], [63.5, -162.3], [63.5, 112.7], [63.5, -109.8], [63.5, 165.2], [63.5, 80.2], [63.5, -142.3], [63.5, 132.7], [63.5, -89.8], [63.4, 47.7], [63.4, 100.3], [63.4, -122.2], [63.4, 15.3], [63.4, 152.8], [63.4, 67.8], [63.4, -154.7], [63.4, 120.3], [63.4, -102.2], [63.4, 35.3], [63.4, 172.9], [63.4, -49.6], [63.4, 87.9], [63.4, -134.6], [63.4, 140.4], [63.4, 55.4], [63.4, 107.9], [63.4, -114.6], [63.4, 160.5], [63.4, 75.5], [63.4, -147], [63.3, 128], [63.3, -94.5], [63.3, 43], [63.3, -42], [63.3, 95.5], [63.3, -127], [63.3, 10.6], [63.3, 148.1], [63.3, 63.1], [63.3, -159.4], [63.3, 115.6], [63.3, -106.9], [63.3, 168.1], [63.3, 83.1], [63.3, -139.4], [63.3, 135.7], [63.3, -86.8], [63.3, 50.7], [63.3, 103.2], [63.3, -119.3], [63.3, 18.2], [63.3, 155.7], [63.2, 70.7], [63.2, -151.8], [63.2, 123.3], [63.2, -99.2], [63.2, 38.3], [63.2, -46.7], [63.2, 90.8], [63.2, -131.7], [63.2, 143.3], [63.2, 58.3], [63.2, -164.2], [63.2, 110.9], [63.2, -111.6], [63.2, 163.4], [63.2, 78.4], [63.2, -144.1], [63.2, 130.9], [63.2, -91.6], [63.2, 45.9], [63.2, 98.5], [63.2, -124], [63.1, 13.5], [63.1, 151], [63.1, 66], [63.1, -156.5], [63.1, 118.5], [63.1, -104], [63.1, 33.5], [63.1, 171], [63.1, 86.1], [63.1, -136.4], [63.1, 138.6], [63.1, -83.9], [63.1, 53.6], [63.1, 106.1], [63.1, -116.4], [63.1, 21.1], [63.1, 158.6], [63.1, 73.7], [63.1, -148.8], [63.1, 126.2], [63.1, -96.3], [63.1, 41.2], [63.1, -43.8], [63, 93.7], [63, -128.8], [63, 8.7], [63, 146.3], [63, 61.3], [63, -161.2], [63, 113.8], [63, -108.7], [63, 166.3], [63, 81.3], [63, -141.2], [63, 133.9], [63, -88.6], [63, 48.9], [63, 101.4], [63, -121.1], [63, 16.4], [63, 153.9], [63, 68.9], [63, -153.6], [63, 121.5], [63, -101], [63, 36.5], [62.9, 174], [62.9, -48.5], [62.9, 89], [62.9, -133.5], [62.9, 141.5], [62.9, 56.5], [62.9, -166], [62.9, 109.1], [62.9, -113.4], [62.9, 161.6], [62.9, 76.6], [62.9, -145.9], [62.9, 129.1], [62.9, -93.4], [62.9, 44.1], [62.9, 96.7], [62.9, -125.8], [62.9, 11.7], [62.9, 149.2], [62.9, 64.2], [62.9, -158.3], [62.8, 116.7], [62.8, -105.8], [62.8, 169.2], [62.8, 84.3], [62.8, -138.2], [62.8, 136.8], [62.8, -85.7], [62.8, 51.8], [62.8, 104.3], [62.8, -118.2], [62.8, 19.3], [62.8, 156.8], [62.8, 71.9], [62.8, -150.6], [62.8, 124.4], [62.8, -98.1], [62.8, 39.4], [62.8, -45.6], [62.8, 91.9], [62.8, -130.6], [62.8, 6.9], [62.8, 144.4], [62.8, 59.5], [62.7, -163], [62.7, 112], [62.7, -110.5], [62.7, 164.5], [62.7, 79.5], [62.7, -143], [62.7, 132], [62.7, -90.4], [62.7, 47.1], [62.7, 99.6], [62.7, -122.9], [62.7, 14.6], [62.7, 152.1], [62.7, 67.1], [62.7, -155.4], [62.7, 119.6], [62.7, -102.8], [62.7, 34.7], [62.7, 172.2], [62.7, 87.2], [62.7, -135.3], [62.7, 139.7], [62.6, 54.7], [62.6, 107.2], [62.6, -115.2], [62.6, 159.8], [62.6, 74.8], [62.6, -147.7], [62.6, 127.3], [62.6, -95.2], [62.6, 42.3], [62.6, -42.7], [62.6, 94.8], [62.6, -127.6], [62.6, 9.9], [62.6, 147.4], [62.6, 62.4], [62.6, -160.1], [62.6, 114.9], [62.6, -107.6], [62.6, 167.4], [62.6, 82.4], [62.6, -140], [62.5, 135], [62.5, -87.5], [62.5, 50], [62.5, 102.5], [62.5, -120], [62.5, 17.5], [62.5, 155], [62.5, 70], [62.5, -152.4], [62.5, 122.6], [62.5, -99.9], [62.5, 37.6], [62.5, -47.4], [62.5, 90.1], [62.5, -132.4], [62.5, 142.6], [62.5, 57.6], [62.5, -164.8], [62.5, 110.2], [62.5, -112.3], [62.5, 162.7], [62.5, 77.7], [62.4, -144.8], [62.4, 130.2], [62.4, -92.3], [62.4, 45.2], [62.4, 97.8], [62.4, -124.7], [62.4, 12.8], [62.4, 150.3], [62.4, 65.3], [62.4, -157.2], [62.4, 117.8], [62.4, -104.7], [62.4, 32.8], [62.4, 170.4], [62.4, 85.4], [62.4, -137.1], [62.4, 137.9], [62.4, 52.9], [62.4, 105.4], [62.4, -117.1], [62.4, 20.5], [62.4, 158], [62.3, 73], [62.3, -149.5], [62.3, 125.5], [62.3, -97], [62.3, 40.5], [62.3, -44.5], [62.3, 93], [62.3, -129.5], [62.3, 8.1], [62.3, 145.6], [62.3, 60.6], [62.3, -161.9], [62.3, 113.1], [62.3, -109.4], [62.3, 165.6], [62.3, 80.6], [62.3, -141.9], [62.3, 133.2], [62.3, -89.3], [62.3, 48.2], [62.3, 100.7], [62.3, -121.8], [62.2, 15.7], [62.2, 153.2], [62.2, 68.2], [62.2, -154.3], [62.2, 120.8], [62.2, -101.7], [62.2, 35.8], [62.2, 88.3], [62.2, -134.2], [62.2, 140.8], [62.2, 55.8], [62.2, 108.4], [62.2, -114.1], [62.2, 160.9], [62.2, 75.9], [62.2, -146.6], [62.2, 128.4], [62.2, -94.1], [62.2, 43.4], [62.2, 96], [62.1, -126.5], [62.1, 11], [62.1, 148.5], [62.1, 63.5], [62.1, -159], [62.1, 116], [62.1, -106.5], [62.1, 168.5], [62.1, 83.6], [62.1, -138.9], [62.1, 136.1], [62.1, -86.4], [62.1, 51.1], [62.1, 103.6], [62.1, -118.9], [62.1, 18.6], [62.1, 156.1], [62.1, 71.2], [62.1, -151.3], [62.1, 123.7], [62.1, -98.8], [62.1, 38.7], [62.1, -46.3], [62, 91.2], [62, -131.3], [62, 6.2], [62, 143.8], [62, 58.8], [62, -163.7], [62, 111.3], [62, -111.2], [62, 163.8], [62, 78.8], [62, -143.7], [62, 131.4], [62, -91.1], [62, 46.4], [62, 98.9], [62, -123.6], [62, 13.9], [62, 151.4], [62, 66.4], [62, -156.1], [62, 119], [62, -103.5], [62, 34], [61.9, 86.5], [61.9, -136], [61.9, 139], [61.9, 54], [61.9, 106.6], [61.9, -115.9], [61.9, 159.1], [61.9, 74.1], [61.9, -148.4], [61.9, 126.6], [61.9, -95.9], [61.9, 41.6], [61.9, -43.4], [61.9, 94.2], [61.9, -128.3], [61.9, 9.2], [61.9, 146.7], [61.9, 61.7], [61.9, -160.8], [61.9, 114.2], [61.9, -108.3], [61.8, 166.7], [61.8, 81.8], [61.8, -140.7], [61.8, 134.3], [61.8, -88.2], [61.8, 49.3], [61.8, 101.8], [61.8, -120.7], [61.8, 16.8], [61.8, 154.3], [61.8, 69.4], [61.8, -153.1], [61.8, 121.9], [61.8, -100.6], [61.8, 36.9], [61.8, 89.4], [61.8, -133.1], [61.8, 141.9], [61.8, 57], [61.8, -165.5], [61.8, 109.5], [61.7, -113], [61.7, 162], [61.7, 77], [61.7, -145.5], [61.7, 129.5], [61.7, -92.9], [61.7, 44.6], [61.7, 97.1], [61.7, -125.4], [61.7, 12.1], [61.7, 149.6], [61.7, 64.6], [61.7, -157.9], [61.7, 117.1], [61.7, -105.3], [61.7, 32.2], [61.7, 169.7], [61.7, 84.7], [61.7, -137.8], [61.7, 137.2], [61.7, 52.2], [61.6, 104.7], [61.6, -117.7], [61.6, 19.8], [61.6, 157.3], [61.6, 72.3], [61.6, -150.2], [61.6, 124.8], [61.6, -97.7], [61.6, 39.8], [61.6, -45.2], [61.6, 92.3], [61.6, -130.1], [61.6, 7.4], [61.6, 144.9], [61.6, 59.9], [61.6, -162.6], [61.6, 112.4], [61.6, -110.1], [61.6, 164.9], [61.6, 79.9], [61.6, -142.5], [61.6, 132.5], [61.6, -90], [61.6, 47.5], [61.5, 100], [61.5, -122.5], [61.5, 15], [61.5, 152.5], [61.5, -70], [61.5, 67.5], [61.5, -154.9], [61.5, 120.1], [61.5, -102.4], [61.5, 35.1], [61.5, 87.6], [61.5, -134.9], [61.5, 140.1], [61.5, 55.1], [61.5, 107.7], [61.5, -114.8], [61.5, 160.2], [61.5, 75.2], [61.5, -147.3], [61.5, 127.7], [61.5, -94.8], [61.5, 42.7], [61.4, 95.3], [61.4, -127.2], [61.4, 10.3], [61.4, 147.8], [61.4, 62.8], [61.4, -159.7], [61.4, 115.3], [61.4, -107.2], [61.4, 167.9], [61.4, 82.9], [61.4, -139.6], [61.4, 135.4], [61.4, -87.1], [61.4, 50.4], [61.4, 102.9], [61.4, -119.6], [61.4, 18], [61.4, 155.5], [61.4, 70.5], [61.4, -152], [61.4, 123], [61.4, -99.5], [61.4, 38], [61.3, 90.5], [61.3, -132], [61.3, 5.6], [61.3, 143.1], [61.3, 58.1], [61.3, -164.4], [61.3, 110.6], [61.3, -111.9], [61.3, 163.1], [61.3, 78.1], [61.3, -144.4], [61.3, 130.7], [61.3, -91.8], [61.3, 45.7], [61.3, 98.2], [61.3, -124.3], [61.3, 13.2], [61.3, 150.7], [61.3, 65.7], [61.3, -156.8], [61.3, 118.3], [61.3, -104.2], [61.3, 33.3], [61.2, 85.8], [61.2, -136.7], [61.2, 138.3], [61.2, 53.3], [61.2, 105.9], [61.2, -116.6], [61.2, 158.4], [61.2, 73.4], [61.2, -149.1], [61.2, 125.9], [61.2, -96.6], [61.2, 40.9], [61.2, -44], [61.2, 93.5], [61.2, -129], [61.2, 8.5], [61.2, 146], [61.2, 61], [61.2, -161.5], [61.2, 113.5], [61.2, -109], [61.1, 166], [61.1, 81.1], [61.1, -141.4], [61.1, 133.6], [61.1, -88.9], [61.1, 48.6], [61.1, 101.1], [61.1, -121.4], [61.1, 16.1], [61.1, 153.6], [61.1, -68.8], [61.1, 68.7], [61.1, -153.8], [61.1, 121.2], [61.1, -101.3], [61.1, 36.2], [61.1, 88.7], [61.1, -133.8], [61.1, 141.3], [61.1, 56.3], [61.1, 108.8], [61.1, -113.7], [61, 161.3], [61, 76.3], [61, -146.2], [61, 128.9], [61, -93.6], [61, 43.9], [61, 96.4], [61, -126.1], [61, 11.4], [61, 148.9], [61, 63.9], [61, -158.6], [61, 116.5], [61, -106], [61, 31.5], [61, 84], [61, -138.5], [61, 136.5], [61, 51.5], [61, 104.1], [61, -118.4], [60.9, 19.1], [60.9, 156.6], [60.9, 71.6], [60.9, -150.9], [60.9, 124.1], [60.9, -98.4], [60.9, 39.1], [60.9, -45.9], [60.9, 91.7], [60.9, -130.8], [60.9, 6.7], [60.9, 144.2], [60.9, 59.2], [60.9, -163.3], [60.9, 111.7], [60.9, -110.8], [60.9, 164.2], [60.9, 79.3], [60.9, -143.2], [60.9, 131.8], [60.9, -90.7], [60.9, 46.8], [60.9, 99.3], [60.9, -123.2], [60.8, 14.3], [60.8, 151.8], [60.8, -70.7], [60.8, 66.9], [60.8, -155.6], [60.8, 119.4], [60.8, -103.1], [60.8, 34.4], [60.8, 86.9], [60.8, -135.6], [60.8, 139.4], [60.8, 54.5], [60.8, 107], [60.8, -115.5], [60.8, 159.5], [60.8, 74.5], [60.8, -148], [60.8, 127], [60.8, -95.4], [60.8, 42.1], [60.8, 94.6], [60.8, -127.9], [60.7, 9.6], [60.7, 147.1], [60.7, 62.1], [60.7, -160.4], [60.7, 114.6], [60.7, -107.8], [60.7, 167.2], [60.7, 82.2], [60.7, -140.3], [60.7, 134.7], [60.7, -87.8], [60.7, 49.7], [60.7, 102.2], [60.7, -120.2], [60.7, 17.3], [60.7, 154.8], [60.7, -67.7], [60.7, 69.8], [60.7, -152.7], [60.7, 122.3], [60.7, -100.2], [60.7, 37.3], [60.7, 89.8], [60.7, -132.6], [60.6, 142.4], [60.6, 57.4], [60.6, -165.1], [60.6, 109.9], [60.6, -112.6], [60.6, 162.4], [60.6, 77.4], [60.6, -145], [60.6, 130], [60.6, -92.5], [60.6, 45], [60.6, 97.5], [60.6, -125], [60.6, 12.5], [60.6, 150], [60.6, 65], [60.6, -157.4], [60.6, 117.6], [60.6, -104.9], [60.6, 32.6], [60.6, 85.1], [60.6, -137.4], [60.5, 137.6], [60.5, 52.6], [60.5, 105.2], [60.5, -117.3], [60.5, 157.7], [60.5, 72.7], [60.5, -149.8], [60.5, 125.2], [60.5, -97.3], [60.5, 40.2], [60.5, -44.7], [60.5, 92.8], [60.5, -129.7], [60.5, 7.8], [60.5, 145.3], [60.5, 60.3], [60.5, -162.2], [60.5, 112.8], [60.5, -109.7], [60.5, 165.4], [60.5, 80.4], [60.5, -142.1], [60.4, 132.9], [60.4, -89.6], [60.4, 47.9], [60.4, 100.4], [60.4, -122.1], [60.4, 15.5], [60.4, 153], [60.4, -69.5], [60.4, 68], [60.4, -154.5], [60.4, 120.5], [60.4, -102], [60.4, 35.5], [60.4, 88], [60.4, -134.5], [60.4, 140.6], [60.4, 55.6], [60.4, 108.1], [60.4, -114.4], [60.4, 160.6], [60.4, 75.6], [60.4, -146.9], [60.3, 128.2], [60.3, -94.3], [60.3, 43.2], [60.3, 95.7], [60.3, -126.8], [60.3, 10.7], [60.3, 148.2], [60.3, 63.2], [60.3, -159.3], [60.3, 115.8], [60.3, -106.7], [60.3, 30.8], [60.3, 83.3], [60.3, -139.2], [60.3, 135.8], [60.3, 50.8], [60.3, 103.4], [60.3, -119.1], [60.3, 155.9], [60.3, -66.6], [60.3, 70.9], [60.3, -151.6], [60.3, 123.4], [60.2, -99.1], [60.2, 38.4], [60.2, 91], [60.2, -131.5], [60.2, 6], [60.2, 143.5], [60.2, 58.5], [60.2, -164], [60.2, 111], [60.2, -111.5], [60.2, 163.5], [60.2, 78.6], [60.2, -143.9], [60.2, 131.1], [60.2, -91.4], [60.2, 46.1], [60.2, 98.6], [60.2, -123.9], [60.2, 13.6], [60.2, 151.1], [60.2, -71.3], [60.2, 66.2], [60.2, -156.3], [60.2, 118.7], [60.2, -103.8], [60.1, 33.7], [60.1, 86.2], [60.1, -136.3], [60.1, 138.8], [60.1, 53.8], [60.1, 106.3], [60.1, -116.2], [60.1, 158.8], [60.1, 73.8], [60.1, -148.7], [60.1, 126.4], [60.1, -96.1], [60.1, 41.4], [60.1, 93.9], [60.1, -128.6], [60.1, 8.9], [60.1, 146.4], [60.1, 61.4], [60.1, -161.1], [60.1, 114], [60.1, -108.5], [60, 81.5], [60, -141], [60, 134], [60, 49], [60, 101.6], [60, -120.9], [60, 16.6], [60, 154.1], [60, -68.4], [60, 69.1], [60, -153.4], [60, 121.6], [60, -100.9], [60, 36.6], [60, 89.2], [60, -133.3], [60, 141.7], [60, 56.7], [60, 109.2], [60, -113.3], [59.9, 161.7], [59.9, 76.8], [59.9, -145.7], [59.9, 129.3], [59.9, -93.2], [59.9, 44.3], [59.9, 96.8], [59.9, -125.7], [59.9, 11.8], [59.9, 149.3], [59.9, 64.4], [59.9, -158.1], [59.9, 116.9], [59.9, -105.6], [59.9, 31.9], [59.9, 84.4], [59.9, -138.1], [59.9, 136.9], [59.9, 52], [59.9, 104.5], [59.9, -118], [59.9, 157], [59.8, -65.5], [59.8, 72], [59.8, -150.5], [59.8, 124.5], [59.8, -97.9], [59.8, 39.6], [59.8, 92.1], [59.8, -130.4], [59.8, 7.1], [59.8, 144.6], [59.8, 59.6], [59.8, -162.9], [59.8, 112.1], [59.8, -110.3], [59.8, 164.7], [59.8, 79.7], [59.8, -142.8], [59.8, 132.2], [59.8, -90.3], [59.8, 47.2], [59.8, 99.7], [59.8, -122.7], [59.8, 14.8], [59.8, 152.3], [59.8, -70.2], [59.8, 67.3], [59.7, -155.2], [59.7, 119.8], [59.7, -102.7], [59.7, 34.8], [59.7, 87.3], [59.7, -135.1], [59.7, 139.9], [59.7, 54.9], [59.7, 107.4], [59.7, -115.1], [59.7, 159.9], [59.7, 74.9], [59.7, -147.5], [59.7, 127.5], [59.7, -95], [59.7, 42.5], [59.7, 95], [59.7, -127.5], [59.7, 10], [59.7, 147.5], [59.7, 62.5], [59.7, -159.9], [59.6, 115.1], [59.6, -107.4], [59.6, 30.1], [59.6, 82.6], [59.6, -139.9], [59.6, 135.1], [59.6, 50.1], [59.6, 102.7], [59.6, -119.8], [59.6, 17.7], [59.6, 155.2], [59.6, -67.3], [59.6, 70.2], [59.6, -152.3], [59.6, 122.7], [59.6, -99.8], [59.6, 37.7], [59.6, 90.3], [59.6, -132.2], [59.6, 5.3], [59.6, 142.8], [59.6, 57.8], [59.5, 110.3], [59.5, -112.2], [59.5, 162.9], [59.5, 77.9], [59.5, 130.4], [59.5, -92.1], [59.5, 45.4], [59.5, 97.9], [59.5, -124.6], [59.5, 13], [59.5, 150.5], [59.5, -72], [59.5, 65.5], [59.5, -157], [59.5, 118], [59.5, -104.5], [59.5, 33], [59.5, 85.5], [59.5, -137], [59.5, 138.1], [59.5, 53.1], [59.5, 105.6], [59.5, -116.9], [59.4, 158.1], [59.4, -64.4], [59.4, 73.1], [59.4, -149.4], [59.4, 125.7], [59.4, -96.8], [59.4, 40.7], [59.4, 93.2], [59.4, -129.3], [59.4, 8.2], [59.4, 145.7], [59.4, 60.7], [59.4, -161.8], [59.4, 113.3], [59.4, -109.2], [59.4, 28.3], [59.4, 80.8], [59.4, -141.7], [59.4, 133.3], [59.4, 48.3], [59.4, 100.9], [59.4, -121.6], [59.4, 15.9], [59.3, 153.4], [59.3, -69.1], [59.3, 68.4], [59.3, -154.1], [59.3, 120.9], [59.3, -101.6], [59.3, 35.9], [59.3, 88.5], [59.3, -134], [59.3, 141], [59.3, 56], [59.3, 108.5], [59.3, -114], [59.3, 161], [59.3, 76.1], [59.3, 128.6], [59.3, -93.9], [59.3, 43.6], [59.3, 96.1], [59.3, -126.4], [59.3, 11.1], [59.3, 148.6], [59.2, 63.7], [59.2, -158.8], [59.2, 116.2], [59.2, -106.3], [59.2, 31.2], [59.2, 83.7], [59.2, -138.8], [59.2, 136.3], [59.2, 51.3], [59.2, 103.8], [59.2, -118.7], [59.2, 156.3], [59.2, -66.2], [59.2, 71.3], [59.2, -151.2], [59.2, 123.9], [59.2, -98.6], [59.2, 38.9], [59.2, 91.4], [59.2, -131.1], [59.2, 6.4], [59.2, 143.9], [59.2, 58.9], [59.1, -163.6], [59.1, 111.5], [59.1, -111], [59.1, 26.5], [59.1, 164], [59.1, 79], [59.1, 131.5], [59.1, -91], [59.1, 46.5], [59.1, 99.1], [59.1, -123.4], [59.1, 14.1], [59.1, 151.6], [59.1, -70.9], [59.1, 66.6], [59.1, -155.9], [59.1, 119.1], [59.1, -103.4], [59.1, 34.1], [59.1, 86.7], [59.1, -135.8], [59.1, 139.2], [59.1, 54.2], [59, 106.7], [59, -115.8], [59, 159.2], [59, -63.3], [59, 74.3], [59, 126.8], [59, -95.7], [59, 41.8], [59, 94.3], [59, -128.2], [59, 9.3], [59, 146.8], [59, 61.9], [59, -160.6], [59, 114.4], [59, -108.1], [59, 29.4], [59, 81.9], [59, 134.4], [59, 49.5], [59, 102], [59, -120.5], [58.9, 17], [58.9, 154.5], [58.9, -68], [58.9, 69.5], [58.9, -153], [58.9, 122], [58.9, -100.4], [58.9, 37.1], [58.9, 89.6], [58.9, -132.9], [58.9, 57.1], [58.9, 109.6], [58.9, -112.8], [58.9, 24.7], [58.9, 162.2], [58.9, 77.2], [58.9, 129.7], [58.9, -92.8], [58.9, 44.7], [58.9, 97.2], [58.9, -125.2], [58.9, 12.3], [58.9, 149.8], [58.8, -72.7], [58.8, 64.8], [58.8, -157.7], [58.8, 117.3], [58.8, -105.2], [58.8, 32.3], [58.8, 84.8], [58.8, -137.6], [58.8, 137.4], [58.8, 52.4], [58.8, 104.9], [58.8, -117.6], [58.8, 157.4], [58.8, -65.1], [58.8, 72.4], [58.8, -150], [58.8, 125], [58.8, -97.5], [58.8, 40], [58.8, 92.5], [58.8, -130], [58.8, 7.5], [58.8, 60], [58.8, -162.4], [58.7, 112.6], [58.7, -109.9], [58.7, 27.6], [58.7, 80.1], [58.7, 132.6], [58.7, 47.6], [58.7, 100.2], [58.7, -122.3], [58.7, 15.2], [58.7, 152.7], [58.7, -69.8], [58.7, 67.7], [58.7, -154.8], [58.7, 120.2], [58.7, -102.3], [58.7, 35.2], [58.7, 87.8], [58.7, -134.7], [58.7, 140.3], [58.7, 55.3], [58.7, 107.8], [58.6, -114.7], [58.6, 160.4], [58.6, 75.4], [58.6, 127.9], [58.6, -94.6], [58.6, 42.9], [58.6, 95.4], [58.6, -127.1], [58.6, 10.5], [58.6, 148], [58.6, 63], [58.6, -159.5], [58.6, 115.5], [58.6, -107], [58.6, 30.5], [58.6, 83], [58.6, 135.6], [58.6, 50.6], [58.6, 103.1], [58.6, -119.4], [58.5, 155.6], [58.5, -66.9], [58.5, 70.6], [58.5, -151.9], [58.5, 123.2], [58.5, -99.3], [58.5, 38.2], [58.5, 90.7], [58.5, -131.8], [58.5, 5.7], [58.5, 58.2], [58.5, 110.8], [58.5, -111.7], [58.5, 25.8], [58.5, 163.3], [58.5, 78.3], [58.5, 130.8], [58.5, -91.7], [58.5, 45.8], [58.5, 98.4], [58.5, -124.1], [58.5, 13.4], [58.5, 150.9], [58.5, -71.6], [58.5, 65.9], [58.4, -156.6], [58.4, 118.4], [58.4, -104.1], [58.4, 33.4], [58.4, 86], [58.4, -136.5], [58.4, 138.5], [58.4, 53.5], [58.4, 106], [58.4, -116.5], [58.4, 158.5], [58.4, -63.9], [58.4, 73.6], [58.4, 126.1], [58.4, -96.4], [58.4, 41.1], [58.4, 93.6], [58.4, -128.9], [58.4, 8.6], [58.4, 61.2], [58.4, -161.3], [58.3, 113.7], [58.3, -108.8], [58.3, 28.7], [58.3, 81.2], [58.3, 133.8], [58.3, 48.8], [58.3, 101.3], [58.3, -121.2], [58.3, 16.3], [58.3, 153.8], [58.3, -68.7], [58.3, 68.8], [58.3, -153.7], [58.3, 121.4], [58.3, -101.1], [58.3, 36.4], [58.3, 88.9], [58.3, -133.6], [58.3, 56.4], [58.3, 109], [58.3, -113.5], [58.3, 24], [58.2, 161.5], [58.2, 76.5], [58.2, 129], [58.2, -93.5], [58.2, 44], [58.2, 96.6], [58.2, -125.9], [58.2, 11.6], [58.2, -73.4], [58.2, 64.1], [58.2, -158.4], [58.2, 116.6], [58.2, -105.9], [58.2, 31.6], [58.2, 84.2], [58.2, 136.7], [58.2, 51.7], [58.2, 104.2], [58.2, -118.3], [58.2, 156.7], [58.2, -65.8], [58.2, 71.8], [58.1, 124.3], [58.1, -98.2], [58.1, 39.3], [58.1, 91.8], [58.1, -130.7], [58.1, 6.8], [58.1, 59.4], [58.1, 111.9], [58.1, -110.6], [58.1, 26.9], [58.1, 79.4], [58.1, 131.9], [58.1, 47], [58.1, 99.5], [58.1, -123], [58.1, 14.5], [58.1, -70.5], [58.1, 67], [58.1, -155.5], [58.1, 119.5], [58, -102.9], [58, 34.6], [58, 87.1], [58, 139.6], [58, 54.6], [58, 107.1], [58, -115.3], [58, 159.7], [58, -62.8], [58, 74.7], [58, 127.2], [58, -95.3], [58, 42.2], [58, 94.7], [58, -127.7], [58, 9.8], [58, 62.3], [58, -160.2], [58, 114.8], [58, -107.7], [58, 29.8], [57.9, 82.3], [57.9, 134.9], [57.9, 49.9], [57.9, 102.4], [57.9, -120.1], [57.9, -67.6], [57.9, 69.9], [57.9, -152.5], [57.9, 122.5], [57.9, -100], [57.9, 37.5], [57.9, 90], [57.9, -132.5], [57.9, 57.5], [57.9, 110.1], [57.9, -112.4], [57.9, 25.1], [57.9, 162.6], [57.9, 77.6], [57.8, 130.1], [57.8, -92.4], [57.8, 45.1], [57.8, 97.7], [57.8, -124.8], [57.8, 12.7], [57.8, -72.3], [57.8, 65.2], [57.8, -157.3], [57.8, 117.7], [57.8, -104.8], [57.8, 32.7], [57.8, 85.3], [57.8, 137.8], [57.8, 52.8], [57.8, 105.3], [57.8, -117.2], [57.8, 157.9], [57.8, -64.6], [57.8, 72.9], [57.8, 125.4], [57.8, -97.1], [57.7, 40.4], [57.7, 92.9], [57.7, -129.6], [57.7, 60.5], [57.7, -162], [57.7, 113], [57.7, -109.5], [57.7, 28], [57.7, 80.5], [57.7, -4.4], [57.7, 133.1], [57.7, 48.1], [57.7, 100.6], [57.7, -121.9], [57.7, 15.6], [57.7, -69.4], [57.7, 68.1], [57.7, -154.4], [57.7, 120.7], [57.7, -101.8], [57.7, 35.7], [57.6, 88.2], [57.6, -134.3], [57.6, 55.7], [57.6, 108.3], [57.6, -114.2], [57.6, 23.3], [57.6, 160.8], [57.6, -61.7], [57.6, 75.8], [57.6, 128.3], [57.6, -94.2], [57.6, 43.3], [57.6, 95.9], [57.6, -126.6], [57.6, 10.9], [57.6, -74.1], [57.6, 63.4], [57.6, -159.1], [57.6, 115.9], [57.6, -106.6], [57.6, 30.9], [57.6, 83.5], [57.6, 136], [57.5, 51], [57.5, 103.5], [57.5, -119], [57.5, 156], [57.5, -66.4], [57.5, 71.1], [57.5, 123.6], [57.5, -98.9], [57.5, 38.6], [57.5, 91.1], [57.5, -131.4], [57.5, 58.7], [57.5, 111.2], [57.5, -111.3], [57.5, 26.2], [57.5, 78.7], [57.5, 131.3], [57.5, -91.2], [57.5, 46.3], [57.4, 98.8], [57.4, -123.7], [57.4, 13.8], [57.4, -71.2], [57.4, 66.3], [57.4, -156.2], [57.4, 118.9], [57.4, -103.6], [57.4, 33.9], [57.4, 86.4], [57.4, 138.9], [57.4, 53.9], [57.4, 106.5], [57.4, -116], [57.4, 159], [57.4, -63.5], [57.4, 74], [57.4, 126.5], [57.4, -96], [57.4, 41.5], [57.4, 94.1], [57.4, -128.4], [57.3, -75.9], [57.3, 61.6], [57.3, -160.9], [57.3, 114.1], [57.3, -108.4], [57.3, 29.1], [57.3, 81.7], [57.3, -3.3], [57.3, 134.2], [57.3, 49.2], [57.3, 101.7], [57.3, -120.8], [57.3, -68.3], [57.3, 69.3], [57.3, 121.8], [57.3, -100.7], [57.3, 36.8], [57.3, 89.3], [57.3, -133.2], [57.3, 56.9], [57.2, 109.4], [57.2, -113.1], [57.2, 24.4], [57.2, 161.9], [57.2, 76.9], [57.2, 129.4], [57.2, -93.1], [57.2, 44.5], [57.2, 97], [57.2, -125.5], [57.2, 12], [57.2, -73], [57.2, 64.5], [57.2, -158], [57.2, 117], [57.2, -105.4], [57.2, 32.1], [57.2, 84.6], [57.2, 137.1], [57.2, 52.1], [57.2, 104.6], [57.2, -117.8], [57.1, 157.2], [57.1, -65.3], [57.1, 72.2], [57.1, 124.7], [57.1, -97.8], [57.1, 39.7], [57.1, 92.2], [57.1, -130.2], [57.1, 59.8], [57.1, 112.3], [57.1, -110.2], [57.1, 27.3], [57.1, 79.8], [57.1, -5.1], [57.1, 132.4], [57.1, 47.4], [57.1, 99.9], [57.1, -122.6], [57.1, 14.9], [57.1, -70.1], [57.1, 67.4], [57, -155], [57, 120], [57, -102.5], [57, 35], [57, 87.5], [57, 55], [57, 107.6], [57, -114.9], [57, 22.6], [57, 160.1], [57, -62.4], [57, 75.1], [57, 127.6], [57, -94.9], [57, 42.6], [57, 95.2], [57, -127.3], [57, 10.2], [57, -74.8], [57, 62.7], [57, -159.8], [57, 115.2], [57, -107.3], [56.9, 30.2], [56.9, 82.8], [56.9, -2.2], [56.9, 135.3], [56.9, 50.3], [56.9, 102.8], [56.9, -119.7], [56.9, 155.4], [56.9, -67.1], [56.9, 70.4], [56.9, 122.9], [56.9, -99.6], [56.9, 37.9], [56.9, 90.4], [56.9, -132.1], [56.9, 58], [56.9, 110.5], [56.9, -112], [56.9, 25.5], [56.9, 163], [56.9, 78], [56.8, 130.6], [56.8, -91.9], [56.8, 45.6], [56.8, 98.1], [56.8, -124.4], [56.8, 13.1], [56.8, -71.9], [56.8, 65.6], [56.8, -156.9], [56.8, 118.2], [56.8, -104.3], [56.8, 33.2], [56.8, 85.7], [56.8, 138.2], [56.8, 53.2], [56.8, 105.8], [56.8, -116.7], [56.8, 158.3], [56.8, -64.2], [56.8, 73.3], [56.8, 125.8], [56.8, -96.7], [56.8, 40.8], [56.7, 93.4], [56.7, -129.1], [56.7, -76.6], [56.7, 60.9], [56.7, -161.6], [56.7, 113.4], [56.7, -109.1], [56.7, 28.4], [56.7, 81], [56.7, -4], [56.7, 133.5], [56.7, 48.5], [56.7, 101], [56.7, -121.5], [56.7, 16], [56.7, -68.9], [56.7, 68.6], [56.7, 121.1], [56.7, -101.4], [56.7, 36.1], [56.7, 88.6], [56.6, 56.2], [56.6, 108.7], [56.6, -113.8], [56.6, 23.7], [56.6, 161.2], [56.6, -61.3], [56.6, 76.2], [56.6, 128.8], [56.6, -93.7], [56.6, 43.8], [56.6, 96.3], [56.6, -126.2], [56.6, 11.3], [56.6, -73.7], [56.6, 63.8], [56.6, -158.7], [56.6, 116.4], [56.6, -106.1], [56.6, 31.4], [56.6, 83.9], [56.6, 136.4], [56.6, 51.4], [56.5, 104], [56.5, -118.5], [56.5, 156.5], [56.5, -66], [56.5, 71.5], [56.5, 124], [56.5, -98.5], [56.5, 39], [56.5, 91.6], [56.5, -130.9], [56.5, 59.1], [56.5, 111.6], [56.5, -110.9], [56.5, 26.6], [56.5, 79.2], [56.5, 131.7], [56.5, -90.8], [56.5, 46.7], [56.5, 99.2], [56.5, -123.3], [56.5, 14.2], [56.4, -70.8], [56.4, 66.8], [56.4, 119.3], [56.4, -103.2], [56.4, 34.3], [56.4, 86.8], [56.4, 54.4], [56.4, 106.9], [56.4, -115.6], [56.4, 21.9], [56.4, 159.4], [56.4, -63.1], [56.4, 74.4], [56.4, 126.9], [56.4, -95.6], [56.4, 42], [56.4, 94.5], [56.4, -128], [56.4, -75.5], [56.4, 62], [56.4, -160.5], [56.3, 114.5], [56.3, -107.9], [56.3, 29.6], [56.3, 82.1], [56.3, -2.9], [56.3, 134.6], [56.3, 49.6], [56.3, 102.1], [56.3, -120.3], [56.3, -67.8], [56.3, 69.7], [56.3, 122.2], [56.3, -100.3], [56.3, 37.2], [56.3, 89.7], [56.3, -132.7], [56.3, 57.3], [56.3, 109.8], [56.3, -112.7], [56.3, 24.8], [56.3, 162.3], [56.2, 77.3], [56.2, 129.9], [56.2, -92.6], [56.2, 44.9], [56.2, 97.4], [56.2, -125.1], [56.2, 12.4], [56.2, -72.6], [56.2, 64.9], [56.2, -157.5], [56.2, 117.5], [56.2, -105], [56.2, 32.5], [56.2, 85], [56.2, 137.5], [56.2, 52.5], [56.2, 105.1], [56.2, -117.4], [56.2, 157.6], [56.2, -64.9], [56.2, 72.6], [56.2, 125.1], [56.1, -97.4], [56.1, 40.1], [56.1, 92.7], [56.1, -129.8], [56.1, -77.3], [56.1, 60.2], [56.1, 112.7], [56.1, -109.8], [56.1, 27.7], [56.1, 80.3], [56.1, -4.7], [56.1, 132.8], [56.1, -89.7], [56.1, 47.8], [56.1, 100.3], [56.1, -122.2], [56.1, 15.3], [56.1, -69.6], [56.1, 67.9], [56.1, 120.4], [56.1, -102.1], [56.1, 35.4], [56.1, 87.9], [56, 55.5], [56, 108], [56, -114.5], [56, 23], [56, 160.5], [56, -62], [56, 75.5], [56, 128.1], [56, -94.4], [56, 43.1], [56, 95.6], [56, -126.9], [56, -74.4], [56, 63.1], [56, -159.4], [56, 115.7], [56, -106.8], [56, 30.7], [56, 83.2], [56, -1.8], [56, 135.7], [56, 50.7], [55.9, 103.3], [55.9, -119.2], [55.9, 155.8], [55.9, -66.7], [55.9, 70.8], [55.9, 123.3], [55.9, -99.2], [55.9, 38.3], [55.9, 90.9], [55.9, -131.6], [55.9, 58.4], [55.9, 110.9], [55.9, -111.6], [55.9, 25.9], [55.9, 78.5], [55.9, 131], [55.9, -91.5], [55.9, 46], [55.9, 98.5], [55.9, -124], [55.8, -71.4], [55.8, 66.1], [55.8, 118.6], [55.8, -103.9], [55.8, 33.6], [55.8, 86.1], [55.8, 53.7], [55.8, 106.2], [55.8, -116.3], [55.8, 21.2], [55.8, 158.7], [55.8, -63.8], [55.8, 73.7], [55.8, 126.3], [55.8, -96.2], [55.8, 41.3], [55.8, 93.8], [55.8, -128.7], [55.8, -76.2], [55.8, 61.3], [55.7, 113.9], [55.7, -108.6], [55.7, 28.9], [55.7, 81.4], [55.7, -3.6], [55.7, 133.9], [55.7, -88.6], [55.7, 48.9], [55.7, 101.5], [55.7, -121], [55.7, -68.5], [55.7, 69], [55.7, 121.5], [55.7, -101], [55.7, 36.5], [55.7, 89.1], [55.7, 56.6], [55.7, 109.1], [55.7, -113.4], [55.7, 24.1], [55.7, 161.6], [55.7, -60.9], [55.7, 76.7], [55.6, 129.2], [55.6, -93.3], [55.6, 44.2], [55.6, 96.7], [55.6, -125.8], [55.6, -73.3], [55.6, 64.3], [55.6, 116.8], [55.6, -105.7], [55.6, 31.8], [55.6, 84.3], [55.6, 136.8], [55.6, 51.9], [55.6, 104.4], [55.6, -118.1], [55.6, 156.9], [55.6, -65.6], [55.6, 71.9], [55.6, 124.4], [55.6, -98.1], [55.6, 39.5], [55.5, 92], [55.5, -130.5], [55.5, -78], [55.5, 59.5], [55.5, 112], [55.5, -110.4], [55.5, 27.1], [55.5, 79.6], [55.5, 132.1], [55.5, -90.4], [55.5, 47.1], [55.5, 99.6], [55.5, -122.8], [55.5, -70.3], [55.5, 67.2], [55.5, 119.7], [55.5, -102.8], [55.5, 34.7], [55.5, 87.2], [55.4, 54.8], [55.4, 107.3], [55.4, -115.2], [55.4, 22.3], [55.4, 159.8], [55.4, -62.7], [55.4, 74.8], [55.4, 127.4], [55.4, -95.1], [55.4, 42.4], [55.4, 94.9], [55.4, -127.6], [55.4, -75.1], [55.4, 62.4], [55.4, -160], [55.4, 115], [55.4, -107.5], [55.4, 30], [55.4, 82.5], [55.4, -2.5], [55.4, 135], [55.4, 50], [55.4, 102.6], [55.3, -119.9], [55.3, -67.4], [55.3, 70.1], [55.3, 122.6], [55.3, -99.9], [55.3, 37.6], [55.3, 90.2], [55.3, 57.7], [55.3, 110.2], [55.3, -112.3], [55.3, 25.2], [55.3, -59.7], [55.3, 77.8], [55.3, 130.3], [55.3, -92.2], [55.3, 45.3], [55.3, 97.8], [55.3, -124.7], [55.3, -72.1], [55.3, 65.4], [55.2, 117.9], [55.2, -104.6], [55.2, 32.9], [55.2, 85.4], [55.2, 53], [55.2, 105.5], [55.2, -117], [55.2, 20.5], [55.2, 158], [55.2, -64.5], [55.2, 73], [55.2, 125.6], [55.2, -96.9], [55.2, 40.6], [55.2, 93.1], [55.2, -129.4], [55.2, -76.9], [55.2, 60.6], [55.2, 113.2], [55.2, -109.3], [55.2, 28.2], [55.1, 80.7], [55.1, -4.3], [55.1, 133.2], [55.1, -89.3], [55.1, 48.2], [55.1, 100.8], [55.1, -121.7], [55.1, -69.2], [55.1, 68.3], [55.1, 120.8], [55.1, -101.7], [55.1, 35.8], [55.1, 88.4], [55.1, 55.9], [55.1, 108.4], [55.1, -114.1], [55.1, 23.4], [55.1, 160.9], [55.1, -61.5], [55.1, 76], [55.1, 128.5], [55.1, -94], [55.1, 43.5], [55, 96], [55, -126.5], [55, -73.9], [55, 63.6], [55, 116.1], [55, -106.4], [55, 31.1], [55, 83.6], [55, -1.4], [55, 136.1], [55, 51.2], [55, 103.7], [55, -118.8], [55, 156.2], [55, -66.3], [55, 71.2], [55, 123.8], [55, -98.7], [55, 38.8], [55, 91.3], [54.9, -78.7], [54.9, 58.8], [54.9, 111.4], [54.9, -111.1], [54.9, 26.4], [54.9, 78.9], [54.9, -6.1], [54.9, 131.4], [54.9, -91.1], [54.9, 46.4], [54.9, 99], [54.9, -123.5], [54.9, -71], [54.9, 66.5], [54.9, 119], [54.9, -103.5], [54.9, 34], [54.9, 86.6], [54.9, 54.1], [54.9, 106.6], [54.9, -115.9], [54.8, 21.6], [54.8, 159.1], [54.8, -63.4], [54.8, 74.2], [54.8, 126.7], [54.8, -95.8], [54.8, 41.7], [54.8, 94.2], [54.8, -128.3], [54.8, -75.8], [54.8, 61.8], [54.8, 114.3], [54.8, -108.2], [54.8, 29.3], [54.8, 81.8], [54.8, -3.2], [54.8, 134.3], [54.8, -88.2], [54.8, 49.4], [54.8, 101.9], [54.8, -120.6], [54.8, -68.1], [54.8, 69.4], [54.7, 121.9], [54.7, -100.6], [54.7, 37], [54.7, 89.5], [54.7, 57], [54.7, 109.5], [54.7, -112.9], [54.7, 24.6], [54.7, -60.4], [54.7, 77.1], [54.7, 129.6], [54.7, -92.9], [54.7, 44.6], [54.7, 97.1], [54.7, -125.3], [54.7, -72.8], [54.7, 64.7], [54.7, 117.2], [54.7, -105.3], [54.7, 32.2], [54.7, 84.7], [54.6, 52.3], [54.6, 104.8], [54.6, -117.7], [54.6, 19.8], [54.6, 157.3], [54.6, -65.2], [54.6, 72.3], [54.6, 124.9], [54.6, -97.6], [54.6, 39.9], [54.6, 92.4], [54.6, -130.1], [54.6, -77.6], [54.6, 59.9], [54.6, 112.5], [54.6, -110], [54.6, 27.5], [54.6, 80], [54.6, -5], [54.6, 132.5], [54.6, -90], [54.6, 47.5], [54.5, 100.1], [54.5, -122.4], [54.5, -69.9], [54.5, 67.6], [54.5, 120.1], [54.5, -102.4], [54.5, 35.1], [54.5, 87.7], [54.5, 55.2], [54.5, 107.7], [54.5, -114.8], [54.5, 22.7], [54.5, 160.3], [54.5, -62.2], [54.5, 75.3], [54.5, 127.8], [54.5, -94.7], [54.5, 42.8], [54.5, 95.3], [54.5, -127.2], [54.5, -74.6], [54.5, 62.9], [54.4, 115.4], [54.4, -107.1], [54.4, 30.4], [54.4, 82.9], [54.4, -2], [54.4, 135.5], [54.4, -87], [54.4, 50.5], [54.4, 103], [54.4, -119.5], [54.4, 18], [54.4, 155.5], [54.4, -67], [54.4, 70.5], [54.4, 123.1], [54.4, -99.4], [54.4, 38.1], [54.4, 90.6], [54.4, -79.4], [54.4, 58.1], [54.4, 110.7], [54.4, -111.8], [54.4, 25.7], [54.4, -59.3], [54.3, 78.2], [54.3, -6.8], [54.3, 130.7], [54.3, -91.8], [54.3, 45.7], [54.3, 98.3], [54.3, -124.2], [54.3, -71.7], [54.3, 65.8], [54.3, 118.3], [54.3, -104.2], [54.3, 33.3], [54.3, 85.9], [54.3, 53.4], [54.3, 105.9], [54.3, -116.6], [54.3, 20.9], [54.3, 158.4], [54.3, -64], [54.3, 73.5], [54.3, 126], [54.3, -96.5], [54.3, 41], [54.2, 93.5], [54.2, -129], [54.2, -76.4], [54.2, 61.1], [54.2, 113.6], [54.2, -108.9], [54.2, 28.6], [54.2, 81.1], [54.2, -3.9], [54.2, 133.6], [54.2, -88.8], [54.2, 48.7], [54.2, 101.2], [54.2, -121.3], [54.2, 16.2], [54.2, -68.8], [54.2, 68.7], [54.2, 121.3], [54.2, -101.2], [54.2, 36.3], [54.2, 88.8], [54.2, 56.3], [54.1, 108.9], [54.1, -113.6], [54.1, 23.9], [54.1, -61.1], [54.1, 76.4], [54.1, -8.6], [54.1, 128.9], [54.1, -93.6], [54.1, 43.9], [54.1, 96.5], [54.1, -126], [54.1, -73.5], [54.1, 64], [54.1, 116.5], [54.1, -106], [54.1, 31.5], [54.1, 84.1], [54.1, -0.9], [54.1, -85.9], [54.1, 51.6], [54.1, 104.1], [54.1, -118.4], [54.1, 19.1], [54.1, 156.6], [54.1, -65.9], [54, 71.7], [54, 124.2], [54, -98.3], [54, 39.2], [54, 91.7], [54, -78.3], [54, 59.3], [54, 111.8], [54, -110.7], [54, 26.8], [54, -58.2], [54, 79.3], [54, 131.8], [54, -90.7], [54, 46.9], [54, 99.4], [54, -123.1], [54, 14.4], [54, -70.6], [54, 66.9], [54, 119.4], [54, -103.1], [54, 34.5], [53.9, 87], [53.9, 54.5], [53.9, 107], [53.9, -115.4], [53.9, 22.1], [53.9, 159.6], [53.9, -62.9], [53.9, 74.6], [53.9, 127.1], [53.9, -95.4], [53.9, 42.1], [53.9, 94.6], [53.9, -127.8], [53.9, 9.7], [53.9, -75.3], [53.9, 62.2], [53.9, 114.7], [53.9, -107.8], [53.9, 29.7], [53.9, 82.2], [53.9, -2.7], [53.9, 134.8], [53.9, -87.7], [53.9, 49.8], [53.8, 102.3], [53.8, -120.2], [53.8, 17.3], [53.8, -67.7], [53.8, 69.8], [53.8, 122.4], [53.8, -100.1], [53.8, 37.4], [53.8, 89.9], [53.8, -80.1], [53.8, 57.4], [53.8, 110], [53.8, -112.5], [53.8, 25], [53.8, -60], [53.8, 77.5], [53.8, -7.5], [53.8, 130], [53.8, -92.5], [53.8, 45], [53.8, 97.6], [53.8, -124.9], [53.8, 12.6], [53.8, -72.4], [53.7, 65.1], [53.7, 117.6], [53.7, -104.9], [53.7, 32.6], [53.7, 85.2], [53.7, 52.7], [53.7, 105.2], [53.7, -117.3], [53.7, 20.2], [53.7, 157.8], [53.7, -64.7], [53.7, 72.8], [53.7, 125.3], [53.7, -97.2], [53.7, 40.3], [53.7, 92.8], [53.7, -129.7], [53.7, 7.8], [53.7, -77.1], [53.7, 60.4], [53.7, 112.9], [53.7, -109.6], [53.7, 27.9], [53.6, 80.4], [53.6, -4.5], [53.6, 133], [53.6, -89.5], [53.6, 48], [53.6, 100.5], [53.6, -122], [53.6, 15.5], [53.6, -69.5], [53.6, 68], [53.6, 120.6], [53.6, -101.9], [53.6, 35.6], [53.6, 88.1], [53.6, 55.6], [53.6, 108.2], [53.6, -114.3], [53.6, 23.2], [53.6, -61.8], [53.6, 75.7], [53.6, -9.3], [53.6, 128.2], [53.6, -94.3], [53.6, 43.2], [53.5, 95.8], [53.5, -126.7], [53.5, 10.8], [53.5, -74.2], [53.5, 63.3], [53.5, 115.8], [53.5, -106.7], [53.5, 30.8], [53.5, 83.4], [53.5, -1.6], [53.5, -86.6], [53.5, 50.9], [53.5, 103.4], [53.5, -119.1], [53.5, 18.4], [53.5, 155.9], [53.5, -66.5], [53.5, 71], [53.5, 123.5], [53.5, -99], [53.5, 38.5], [53.5, 91], [53.5, -78.9], [53.5, 58.6], [53.4, 111.1], [53.4, -111.4], [53.4, 26.1], [53.4, -58.9], [53.4, 78.6], [53.4, -6.4], [53.4, 131.1], [53.4, -91.3], [53.4, 46.2], [53.4, 98.7], [53.4, -123.8], [53.4, 13.7], [53.4, -71.3], [53.4, 66.2], [53.4, 118.8], [53.4, -103.7], [53.4, 33.8], [53.4, 86.3], [53.4, 53.8], [53.4, 106.4], [53.4, -116.1], [53.4, 21.4], [53.4, 158.9], [53.4, -63.6], [53.4, 73.9], [53.3, 126.4], [53.3, -96.1], [53.3, 41.4], [53.3, 94], [53.3, -128.5], [53.3, 9], [53.3, -76], [53.3, 61.5], [53.3, 114], [53.3, -108.5], [53.3, 29], [53.3, 81.6], [53.3, -3.4], [53.3, 134.1], [53.3, -88.4], [53.3, 49.1], [53.3, 101.6], [53.3, -120.9], [53.3, 16.6], [53.3, -68.4], [53.3, 69.2], [53.3, 121.7], [53.3, -100.8], [53.3, 36.7], [53.3, 89.2], [53.2, -80.8], [53.2, 56.8], [53.2, 109.3], [53.2, -113.2], [53.2, 24.3], [53.2, -60.7], [53.2, 76.8], [53.2, -8.2], [53.2, 129.3], [53.2, -93.2], [53.2, 44.4], [53.2, 96.9], [53.2, -125.6], [53.2, 11.9], [53.2, -73.1], [53.2, 64.4], [53.2, 116.9], [53.2, -105.6], [53.2, 32], [53.2, 84.5], [53.2, -0.5], [53.2, -85.5], [53.2, 52], [53.2, 104.5], [53.1, -117.9], [53.1, 19.6], [53.1, 157.1], [53.1, -65.4], [53.1, 72.1], [53.1, 124.6], [53.1, -97.9], [53.1, 39.6], [53.1, 92.1], [53.1, 7.2], [53.1, -77.8], [53.1, 59.7], [53.1, 112.2], [53.1, -110.3], [53.1, 27.2], [53.1, -57.8], [53.1, 79.7], [53.1, 132.3], [53.1, -90.2], [53.1, 47.3], [53.1, 99.8], [53.1, -122.7], [53.1, 14.8], [53.1, -70.2], [53.1, 67.3], [53.1, 119.9], [53, -102.6], [53, 34.9], [53, 87.4], [53, 54.9], [53, 107.5], [53, -115], [53, 22.5], [53, -62.5], [53, 75], [53, -10], [53, 127.5], [53, -95], [53, 42.5], [53, 95.1], [53, -127.4], [53, 10.1], [53, -74.9], [53, 62.6], [53, 115.1], [53, -107.4], [53, 30.1], [53, 82.7], [53, -2.3], [53, 135.2], [52.9, -87.3], [52.9, 50.2], [52.9, 102.7], [52.9, -119.8], [52.9, 17.7], [52.9, -67.2], [52.9, 70.3], [52.9, 122.8], [52.9, -99.7], [52.9, 37.8], [52.9, 90.3], [52.9, -79.6], [52.9, 57.9], [52.9, 110.4], [52.9, -112.1], [52.9, 25.4], [52.9, -59.6], [52.9, 77.9], [52.9, -7], [52.9, 130.5], [52.9, -92], [52.9, 45.5], [52.9, 98], [52.9, -124.5], [52.9, 13], [52.8, -72], [52.8, 65.5], [52.8, 118.1], [52.8, -104.4], [52.8, 33.1], [52.8, 85.6], [52.8, -84.4], [52.8, 53.1], [52.8, 105.7], [52.8, -116.8], [52.8, 20.7], [52.8, 158.2], [52.8, -64.3], [52.8, 73.2], [52.8, 125.7], [52.8, -96.8], [52.8, 40.7], [52.8, 93.3], [52.8, 8.3], [52.8, -76.7], [52.8, 60.8], [52.8, 113.3], [52.8, -109.2], [52.8, 28.3], [52.7, 80.9], [52.7, -4.1], [52.7, 133.4], [52.7, -89.1], [52.7, 48.4], [52.7, 100.9], [52.7, -121.6], [52.7, 15.9], [52.7, -69], [52.7, 68.5], [52.7, 121], [52.7, -101.5], [52.7, 36], [52.7, 88.5], [52.7, 56.1], [52.7, 108.6], [52.7, -113.9], [52.7, 23.6], [52.7, -61.4], [52.7, 76.1], [52.7, -8.9], [52.7, 128.6], [52.7, -93.8], [52.7, 43.7], [52.6, 96.2], [52.6, -126.3], [52.6, 11.2], [52.6, -73.8], [52.6, 63.7], [52.6, 116.3], [52.6, -106.2], [52.6, 31.3], [52.6, 83.8], [52.6, -1.2], [52.6, -86.2], [52.6, 51.3], [52.6, 103.9], [52.6, -118.6], [52.6, 18.9], [52.6, 156.4], [52.6, -66.1], [52.6, 71.4], [52.6, 123.9], [52.6, -98.6], [52.6, 38.9], [52.6, 91.5], [52.6, 6.5], [52.6, -78.5], [52.6, 59], [52.5, 111.5], [52.5, -111], [52.5, 26.5], [52.5, -58.5], [52.5, 79.1], [52.5, 131.6], [52.5, -90.9], [52.5, 46.6], [52.5, 99.1], [52.5, -123.4], [52.5, 14.1], [52.5, -70.9], [52.5, 66.7], [52.5, 119.2], [52.5, -103.3], [52.5, 34.2], [52.5, 86.7], [52.5, -83.3], [52.5, 54.3], [52.5, 106.8], [52.5, -115.7], [52.5, 21.8], [52.5, -63.2], [52.5, 74.3], [52.4, 126.8], [52.4, -95.7], [52.4, 41.9], [52.4, 94.4], [52.4, -128.1], [52.4, 9.4], [52.4, -75.6], [52.4, 61.9], [52.4, 114.4], [52.4, -108.1], [52.4, 29.5], [52.4, 82], [52.4, -3], [52.4, 134.5], [52.4, -88], [52.4, 49.5], [52.4, 102], [52.4, -120.4], [52.4, 17.1], [52.4, -67.9], [52.4, 69.6], [52.4, 122.1], [52.4, -100.4], [52.4, 37.1], [52.4, 89.6], [52.3, -80.3], [52.3, 57.2], [52.3, 109.7], [52.3, -112.8], [52.3, 24.7], [52.3, -60.3], [52.3, 77.2], [52.3, -7.7], [52.3, 129.8], [52.3, -92.7], [52.3, 44.8], [52.3, 97.3], [52.3, -125.2], [52.3, 12.3], [52.3, -72.7], [52.3, 64.8], [52.3, 117.4], [52.3, -105.1], [52.3, 32.4], [52.3, 84.9], [52.3, -0.1], [52.3, -85.1], [52.3, 52.4], [52.3, 105], [52.3, -117.5], [52.3, 20], [52.3, 157.5], [52.2, -65], [52.2, 72.5], [52.2, 125], [52.2, -97.5], [52.2, 40], [52.2, 92.6], [52.2, 7.6], [52.2, -77.4], [52.2, 60.1], [52.2, 112.6], [52.2, -109.9], [52.2, 27.6], [52.2, -57.3], [52.2, 80.2], [52.2, -4.8], [52.2, 132.7], [52.2, -89.8], [52.2, 47.7], [52.2, 100.2], [52.2, -122.3], [52.2, 15.2], [52.2, -69.7], [52.2, 67.8], [52.2, 120.3], [52.2, -102.2], [52.2, 35.3], [52.1, 87.8], [52.1, 55.4], [52.1, 107.9], [52.1, -114.6], [52.1, 22.9], [52.1, -62.1], [52.1, 75.4], [52.1, -9.5], [52.1, 128], [52.1, -94.5], [52.1, 43], [52.1, 95.5], [52.1, -127], [52.1, 10.5], [52.1, -74.5], [52.1, 63], [52.1, 115.6], [52.1, -106.9], [52.1, 30.6], [52.1, 83.1], [52.1, -1.9], [52.1, 135.6], [52.1, -86.9], [52.1, 50.6], [52.1, 103.2], [52, -119.3], [52, 18.2], [52, -66.8], [52, 70.7], [52, 123.2], [52, -99.3], [52, 38.2], [52, 90.8], [52, 5.8], [52, -79.2], [52, 58.3], [52, 110.8], [52, -111.7], [52, 25.8], [52, -59.1], [52, 78.4], [52, 130.9], [52, -91.6], [52, 45.9], [52, 98.4], [52, -124.1], [52, 13.4], [52, -71.5], [52, 66], [52, 118.5], [52, -104], [51.9, 33.5], [51.9, 86], [51.9, -83.9], [51.9, 53.6], [51.9, 106.1], [51.9, -116.4], [51.9, 21.1], [51.9, -63.9], [51.9, 73.6], [51.9, 126.1], [51.9, -96.3], [51.9, 41.2], [51.9, 93.7], [51.9, 8.7], [51.9, -76.3], [51.9, 61.2], [51.9, 113.8], [51.9, -108.7], [51.9, 28.8], [51.9, 81.3], [51.9, -3.7], [51.9, 133.8], [51.9, -88.7], [51.9, 48.8], [51.8, 101.4], [51.8, -121.1], [51.8, 16.4], [51.8, -68.6], [51.8, 68.9], [51.8, 121.4], [51.8, -101.1], [51.8, 36.4], [51.8, 89], [51.8, -81], [51.8, 56.5], [51.8, 109], [51.8, -113.5], [51.8, 24], [51.8, -61], [51.8, 76.6], [51.8, 129.1], [51.8, -93.4], [51.8, 44.1], [51.8, 96.6], [51.8, -125.9], [51.8, 11.6], [51.8, -73.4], [51.8, 64.2], [51.7, 116.7], [51.7, -105.8], [51.7, 31.7], [51.7, 84.2], [51.7, -0.8], [51.7, 136.7], [51.7, -85.8], [51.7, 51.8], [51.7, 104.3], [51.7, -118.2], [51.7, 19.3], [51.7, 156.8], [51.7, -65.7], [51.7, 71.8], [51.7, 124.3], [51.7, -98.2], [51.7, 39.4], [51.7, 91.9], [51.7, 6.9], [51.7, -78.1], [51.7, 59.4], [51.7, 111.9], [51.7, -110.6], [51.7, 27], [51.7, -58], [51.7, 79.5], [51.7, -5.5], [51.7, 132], [51.6, -90.5], [51.6, 47], [51.6, 99.5], [51.6, -122.9], [51.6, 14.6], [51.6, -70.4], [51.6, 67.1], [51.6, 119.6], [51.6, -102.9], [51.6, 34.6], [51.6, 87.1], [51.6, -82.8], [51.6, 54.7], [51.6, 107.2], [51.6, -115.3], [51.6, 22.2], [51.6, -62.8], [51.6, 74.7], [51.6, 127.3], [51.6, -95.2], [51.6, 42.3], [51.6, 94.8], [51.6, 9.8], [51.6, -75.2], [51.5, 62.3], [51.5, 114.9], [51.5, -107.6], [51.5, 29.9], [51.5, 82.4], [51.5, -2.6], [51.5, 134.9], [51.5, -87.6], [51.5, 49.9], [51.5, 102.5], [51.5, -120], [51.5, 17.5], [51.5, -67.5], [51.5, 70], [51.5, 122.5], [51.5, -100], [51.5, 37.5], [51.5, 90.1], [51.5, 5.1], [51.5, -79.9], [51.5, 57.6], [51.5, 110.1], [51.5, -112.4], [51.5, 25.1], [51.5, -59.8], [51.5, 77.7], [51.4, 130.2], [51.4, -92.3], [51.4, 45.2], [51.4, 97.7], [51.4, -124.8], [51.4, 12.7], [51.4, -72.2], [51.4, 65.3], [51.4, 117.8], [51.4, -104.7], [51.4, 32.8], [51.4, 85.3], [51.4, 0.4], [51.4, -84.6], [51.4, 52.9], [51.4, 105.4], [51.4, -117.1], [51.4, 20.4], [51.4, -64.6], [51.4, 72.9], [51.4, 125.5], [51.4, -97], [51.4, 40.5], [51.4, 93], [51.4, 8], [51.3, -77], [51.3, 60.5], [51.3, 113.1], [51.3, -109.4], [51.3, 28.1], [51.3, 80.6], [51.3, -4.4], [51.3, 133.1], [51.3, -89.4], [51.3, 48.1], [51.3, 100.7], [51.3, -121.8], [51.3, 15.7], [51.3, -69.3], [51.3, 68.2], [51.3, 120.7], [51.3, -101.8], [51.3, 35.7], [51.3, 88.3], [51.3, -81.7], [51.3, 55.8], [51.3, 108.3], [51.3, -114.2], [51.3, 23.3], [51.3, -61.6], [51.2, 75.9], [51.2, 128.4], [51.2, -94.1], [51.2, 43.4], [51.2, 95.9], [51.2, -126.6], [51.2, 10.9], [51.2, -74], [51.2, 63.5], [51.2, 116], [51.2, -106.5], [51.2, 31], [51.2, 83.5], [51.2, -1.5], [51.2, 136], [51.2, -86.4], [51.2, 51.1], [51.2, 103.6], [51.2, -118.9], [51.2, 18.6], [51.2, 156.1], [51.2, -66.4], [51.2, 71.1], [51.2, 123.6], [51.2, -98.8], [51.2, 38.7], [51.2, 91.2], [51.1, 6.2], [51.1, -78.8], [51.1, 58.7], [51.1, 111.3], [51.1, -111.2], [51.1, 26.3], [51.1, -58.7], [51.1, 78.8], [51.1, 131.3], [51.1, -91.2], [51.1, 46.3], [51.1, 98.9], [51.1, -123.6], [51.1, 13.9], [51.1, -71.1], [51.1, 66.4], [51.1, 118.9], [51.1, -103.6], [51.1, 33.9], [51.1, 86.5], [51.1, -83.5], [51.1, 54], [51.1, 106.5], [51.1, -116], [51.1, 21.5], [51, -63.5], [51, 74.1], [51, 126.6], [51, -95.9], [51, 41.6], [51, 94.1], [51, 9.1], [51, -75.9], [51, 61.7], [51, 114.2], [51, -108.3], [51, 29.2], [51, 81.7], [51, -3.3], [51, 134.2], [51, -88.3], [51, 49.3], [51, 101.8], [51, -120.7], [51, 16.8], [51, -68.2], [51, 69.3], [51, 121.8], [51, -100.7], [51, 36.9], [50.9, 89.4], [50.9, 4.4], [50.9, -80.6], [50.9, 56.9], [50.9, 109.4], [50.9, -113.1], [50.9, 24.5], [50.9, -60.5], [50.9, 77], [50.9, 129.5], [50.9, -93], [50.9, 44.5], [50.9, 97], [50.9, -125.4], [50.9, 12.1], [50.9, -72.9], [50.9, 64.6], [50.9, 117.1], [50.9, -105.4], [50.9, 32.1], [50.9, 84.6], [50.9, -0.3], [50.9, 137.2], [50.9, -85.3], [50.9, 52.2], [50.9, 104.7], [50.9, -117.8], [50.8, 19.7], [50.8, -65.3], [50.8, 72.2], [50.8, 124.8], [50.8, -97.7], [50.8, 39.8], [50.8, 92.3], [50.8, 7.3], [50.8, -77.7], [50.8, 59.8], [50.8, 112.4], [50.8, -110.1], [50.8, 27.4], [50.8, 79.9], [50.8, -5.1], [50.8, 132.4], [50.8, -90.1], [50.8, 47.4], [50.8, 100], [50.8, -122.5], [50.8, 15], [50.8, -70], [50.8, 67.5], [50.8, 120], [50.8, -102.5], [50.8, 35], [50.7, 87.6], [50.7, 2.6], [50.7, -82.4], [50.7, 55.1], [50.7, 107.6], [50.7, -114.9], [50.7, 22.6], [50.7, -62.3], [50.7, 75.2], [50.7, 127.7], [50.7, -94.8], [50.7, 42.7], [50.7, 95.2], [50.7, 10.2], [50.7, -74.7], [50.7, 62.8], [50.7, 115.3], [50.7, -107.2], [50.7, 30.3], [50.7, 82.8], [50.7, -2.1], [50.7, 135.4], [50.7, -87.1], [50.7, 50.4], [50.7, 102.9], [50.7, -119.6], [50.6, 17.9], [50.6, -67.1], [50.6, 70.4], [50.6, 123], [50.6, -99.5], [50.6, 38], [50.6, 90.5], [50.6, 5.5], [50.6, -79.5], [50.6, 58], [50.6, 110.6], [50.6, -111.9], [50.6, 25.6], [50.6, -59.4], [50.6, 78.1], [50.6, 130.6], [50.6, -91.9], [50.6, 45.6], [50.6, 98.2], [50.6, -124.3], [50.6, 13.2], [50.6, -71.8], [50.6, 65.7], [50.6, 118.2], [50.6, -104.3], [50.6, 33.2], [50.5, 85.8], [50.5, -84.2], [50.5, 53.3], [50.5, 105.8], [50.5, -116.7], [50.5, 20.8], [50.5, -64.1], [50.5, 73.4], [50.5, 125.9], [50.5, -96.6], [50.5, 40.9], [50.5, 93.4], [50.5, 8.4], [50.5, -76.5], [50.5, 61], [50.5, 113.5], [50.5, -109], [50.5, 28.5], [50.5, 81], [50.5, -4], [50.5, 133.5], [50.5, -88.9], [50.5, 48.6], [50.5, 101.1], [50.4, -121.4], [50.4, 16.1], [50.4, -68.9], [50.4, 68.6], [50.4, 121.1], [50.4, -101.3], [50.4, 36.2], [50.4, 88.7], [50.4, 3.7], [50.4, -81.3], [50.4, 56.2], [50.4, 108.8], [50.4, -113.7], [50.4, 23.8], [50.4, -61.2], [50.4, 76.3], [50.4, 128.8], [50.4, -93.7], [50.4, 43.8], [50.4, 96.4], [50.4, -126.1], [50.4, 11.4], [50.4, -73.6], [50.4, 63.9], [50.4, 116.4], [50.4, -106.1], [50.4, 31.4], [50.3, 84], [50.3, 136.5], [50.3, -86], [50.3, 51.5], [50.3, 104], [50.3, -118.5], [50.3, 19], [50.3, -66], [50.3, 71.6], [50.3, 124.1], [50.3, -98.4], [50.3, 39.1], [50.3, 91.6], [50.3, 6.6], [50.3, -78.4], [50.3, 59.2], [50.3, 111.7], [50.3, -110.8], [50.3, 26.7], [50.3, 79.2], [50.3, -5.8], [50.3, 131.7], [50.3, -90.8], [50.3, 46.8], [50.3, 99.3], [50.2, -123.2], [50.2, 14.3], [50.2, -70.7], [50.2, 66.8], [50.2, 119.3], [50.2, -103.2], [50.2, 34.4], [50.2, 86.9], [50.2, 1.9], [50.2, -83.1], [50.2, 54.4], [50.2, 106.9], [50.2, -115.6], [50.2, 22], [50.2, -63], [50.2, 74.5], [50.2, 127], [50.2, -95.5], [50.2, 42], [50.2, 94.5], [50.2, 9.6], [50.2, -75.4], [50.2, 62.1], [50.2, 114.6], [50.2, -107.9], [50.2, 29.6], [50.1, 82.1], [50.1, 134.7], [50.1, -87.8], [50.1, 49.7], [50.1, 102.2], [50.1, -120.3], [50.1, 17.2], [50.1, -67.8], [50.1, 69.7], [50.1, 122.3], [50.1, -100.2], [50.1, 37.3], [50.1, 89.8], [50.1, 4.8], [50.1, -80.2], [50.1, 57.3], [50.1, 109.9], [50.1, -112.6], [50.1, 24.9], [50.1, 77.4], [50.1, 129.9], [50.1, -92.6], [50.1, 44.9], [50.1, 97.5], [50.1, -125], [50, 12.5], [50, -72.5], [50, 65], [50, 117.5], [50, -105], [50, 32.5], [50, 85.1], [50, 137.6], [50, -84.9], [50, 52.6], [50, 105.1], [50, -117.4], [50, 20.1], [50, -64.8], [50, 72.7], [50, 125.2], [50, -97.3], [50, 40.2], [50, 92.7], [50, 7.7], [50, -77.2], [50, 60.3], [50, 112.8], [50, -109.7], [50, 27.8], [49.9, 80.3], [49.9, 132.9], [49.9, -89.6], [49.9, 47.9], [49.9, 100.4], [49.9, -122.1], [49.9, 15.4], [49.9, -69.6], [49.9, 67.9], [49.9, 120.5], [49.9, -102], [49.9, 35.5], [49.9, 88], [49.9, 3], [49.9, -82], [49.9, 55.5], [49.9, 108.1], [49.9, -114.4], [49.9, 23.1], [49.9, -61.9], [49.9, 75.6], [49.9, 128.1], [49.9, -94.4], [49.9, 43.1], [49.9, 95.7], [49.9, 10.7], [49.8, -74.3], [49.8, 63.2], [49.8, 115.7], [49.8, -106.8], [49.8, 30.7], [49.8, 83.3], [49.8, 135.8], [49.8, -86.7], [49.8, 50.8], [49.8, 103.3], [49.8, -119.2], [49.8, 18.3], [49.8, -66.6], [49.8, 70.9], [49.8, 123.4], [49.8, -99.1], [49.8, 38.4], [49.8, 90.9], [49.8, 5.9], [49.8, -79], [49.8, 58.5], [49.8, 111], [49.8, -111.5], [49.8, 26], [49.8, 78.5], [49.7, 131], [49.7, -91.4], [49.7, 46.1], [49.7, 98.6], [49.7, -123.9], [49.7, 13.6], [49.7, -71.4], [49.7, 66.1], [49.7, 118.6], [49.7, -103.8], [49.7, 33.7], [49.7, 86.2], [49.7, 1.2], [49.7, -83.8], [49.7, 53.7], [49.7, 106.3], [49.7, -116.2], [49.7, 21.3], [49.7, -63.7], [49.7, 73.8], [49.7, 126.3], [49.7, -96.2], [49.7, 41.3], [49.7, 93.9], [49.7, 8.9], [49.6, -76.1], [49.6, 61.4], [49.6, 113.9], [49.6, -108.6], [49.6, 28.9], [49.6, 81.5], [49.6, 134], [49.6, -88.5], [49.6, 49], [49.6, 101.5], [49.6, -121], [49.6, 16.5], [49.6, -68.5], [49.6, 69.1], [49.6, 121.6], [49.6, -100.9], [49.6, 36.6], [49.6, 89.1], [49.6, 4.1], [49.6, -80.9], [49.6, 56.7], [49.6, 109.2], [49.6, -113.3], [49.6, 24.2], [49.6, 76.7], [49.5, 129.2], [49.5, -93.3], [49.5, 44.3], [49.5, 96.8], [49.5, 11.8], [49.5, -73.2], [49.5, 64.3], [49.5, 116.8], [49.5, -105.7], [49.5, 31.9], [49.5, 84.4], [49.5, 136.9], [49.5, -85.6], [49.5, 51.9], [49.5, 104.4], [49.5, -118.1], [49.5, 19.5], [49.5, -65.5], [49.5, 72], [49.5, 124.5], [49.5, -98], [49.5, 39.5], [49.5, 92], [49.5, 7.1], [49.5, -77.9], [49.4, 59.6], [49.4, 112.1], [49.4, -110.4], [49.4, 27.1], [49.4, 79.6], [49.4, 132.2], [49.4, -90.3], [49.4, 47.2], [49.4, 99.7], [49.4, -122.8], [49.4, 14.7], [49.4, -70.3], [49.4, 67.2], [49.4, 119.8], [49.4, -102.7], [49.4, 34.8], [49.4, 87.3], [49.4, 2.3], [49.4, -82.7], [49.4, 54.8], [49.4, 107.4], [49.4, -115.1], [49.4, 22.4], [49.4, -62.6], [49.4, 74.9], [49.4, 127.4], [49.3, -95.1], [49.3, 42.4], [49.3, 95], [49.3, 10], [49.3, -75], [49.3, 62.5], [49.3, 115], [49.3, -107.5], [49.3, 30], [49.3, 82.6], [49.3, 135.1], [49.3, -87.4], [49.3, 50.1], [49.3, 102.6], [49.3, -119.9], [49.3, 17.6], [49.3, -67.3], [49.3, 70.2], [49.3, 122.7], [49.3, -99.8], [49.3, 37.7], [49.3, 90.2], [49.3, 5.2], [49.3, -79.7], [49.3, 57.8], [49.2, 110.3], [49.2, -112.2], [49.2, 25.3], [49.2, 77.8], [49.2, 130.4], [49.2, -92.1], [49.2, 45.4], [49.2, 97.9], [49.2, -124.6], [49.2, 12.9], [49.2, -72.1], [49.2, 65.4], [49.2, 118], [49.2, -104.5], [49.2, 33], [49.2, 85.5], [49.2, 0.5], [49.2, 138], [49.2, -84.5], [49.2, 53], [49.2, 105.6], [49.2, -116.9], [49.2, 20.6], [49.2, -64.4], [49.2, 73.1], [49.2, 125.6], [49.2, -96.9], [49.2, 40.6], [49.1, 93.2], [49.1, 8.2], [49.1, -76.8], [49.1, 60.7], [49.1, 113.2], [49.1, -109.3], [49.1, 28.2], [49.1, 80.8], [49.1, 133.3], [49.1, -89.2], [49.1, 48.3], [49.1, 100.8], [49.1, -121.7], [49.1, 15.8], [49.1, -69.1], [49.1, 68.4], [49.1, 120.9], [49.1, -101.6], [49.1, 35.9], [49.1, 88.4], [49.1, 3.4], [49.1, -81.5], [49.1, 56], [49.1, 108.5], [49.1, -114], [49, 23.5], [49, 76], [49, 128.5], [49, -93.9], [49, 43.6], [49, 96.1], [49, 11.1], [49, -73.9], [49, 63.6], [49, 116.1], [49, -106.3], [49, 31.2], [49, 83.7], [49, -1.3], [49, 136.2], [49, -86.3], [49, 51.2], [49, 103.8], [49, -118.7], [49, 18.8], [49, -66.2], [49, 71.3], [49, 123.8], [49, -98.7], [49, 38.8], [49, 91.4], [48.9, 6.4], [48.9, -78.6], [48.9, 58.9], [48.9, 111.4], [48.9, -111.1], [48.9, 26.4], [48.9, 79], [48.9, 131.5], [48.9, -91], [48.9, 46.5], [48.9, 99], [48.9, -123.5], [48.9, 14], [48.9, -71], [48.9, 66.6], [48.9, 119.1], [48.9, -103.4], [48.9, 34.1], [48.9, 86.6], [48.9, 1.6], [48.9, 139.1], [48.9, -83.4], [48.9, 54.2], [48.9, 106.7], [48.9, -115.8], [48.9, 21.7], [48.8, -63.3], [48.8, 74.2], [48.8, 126.7], [48.8, -95.8], [48.8, 41.8], [48.8, 94.3], [48.8, 9.3], [48.8, -75.7], [48.8, 61.8], [48.8, 114.3], [48.8, -108.2], [48.8, 29.4], [48.8, 81.9], [48.8, 134.4], [48.8, -88.1], [48.8, 49.4], [48.8, 101.9], [48.8, -120.6], [48.8, 17], [48.8, -68], [48.8, 69.5], [48.8, 122], [48.8, -100.5], [48.8, 37], [48.8, 89.5], [48.8, 4.6], [48.7, -80.4], [48.7, 57.1], [48.7, 109.6], [48.7, -112.9], [48.7, 24.6], [48.7, 77.1], [48.7, 129.7], [48.7, -92.8], [48.7, 44.7], [48.7, 97.2], [48.7, 12.2], [48.7, -72.8], [48.7, 64.7], [48.7, 117.3], [48.7, -105.2], [48.7, 32.3], [48.7, 84.8], [48.7, -0.2], [48.7, 137.3], [48.7, -85.2], [48.7, 52.3], [48.7, 104.9], [48.7, -117.6], [48.7, 19.9], [48.7, -65.1], [48.7, 72.4], [48.6, 124.9], [48.6, -97.6], [48.6, 39.9], [48.6, 92.5], [48.6, 7.5], [48.6, -77.5], [48.6, 60], [48.6, 112.5], [48.6, -110], [48.6, 27.5], [48.6, 80.1], [48.6, 132.6], [48.6, -89.9], [48.6, 47.6], [48.6, 100.1], [48.6, -122.4], [48.6, 15.1], [48.6, -69.8], [48.6, 67.7], [48.6, 120.2], [48.6, -102.3], [48.6, 35.2], [48.6, 87.7], [48.6, 2.7], [48.6, -82.2], [48.6, 55.3], [48.5, 107.8], [48.5, -114.7], [48.5, 22.8], [48.5, 75.3], [48.5, 127.9], [48.5, -94.6], [48.5, 42.9], [48.5, 95.4], [48.5, 10.4], [48.5, -74.6], [48.5, 62.9], [48.5, 115.5], [48.5, -107], [48.5, 30.5], [48.5, 83], [48.5, -2], [48.5, 135.5], [48.5, -87], [48.5, 50.5], [48.5, 103.1], [48.5, -119.4], [48.5, 18.1], [48.5, -66.9], [48.5, 70.6], [48.5, 123.1], [48.5, -99.4], [48.5, 38.1], [48.4, 90.7], [48.4, 5.7], [48.4, -79.3], [48.4, 58.2], [48.4, 110.7], [48.4, -111.8], [48.4, 25.7], [48.4, 78.3], [48.4, 130.8], [48.4, -91.7], [48.4, 45.8], [48.4, 98.3], [48.4, -124.2], [48.4, 13.3], [48.4, -71.6], [48.4, 65.9], [48.4, 118.4], [48.4, -104.1], [48.4, 33.4], [48.4, 85.9], [48.4, 0.9], [48.4, 138.4], [48.4, -84], [48.4, 53.5], [48.4, 106], [48.4, -116.5], [48.3, 21], [48.3, 73.5], [48.3, 126], [48.3, -96.4], [48.3, 41.1], [48.3, 93.6], [48.3, 8.6], [48.3, -76.4], [48.3, 61.1], [48.3, 113.6], [48.3, -108.8], [48.3, 28.7], [48.3, 81.2], [48.3, 133.7], [48.3, -88.8], [48.3, 48.7], [48.3, 101.3], [48.3, -121.2], [48.3, 16.3], [48.3, -68.7], [48.3, 68.8], [48.3, 121.3], [48.3, -101.2], [48.3, 36.3], [48.3, 88.9], [48.2, 3.9], [48.2, -81.1], [48.2, 56.4], [48.2, 108.9], [48.2, -113.6], [48.2, 23.9], [48.2, 76.5], [48.2, 129], [48.2, -93.5], [48.2, 44], [48.2, 96.5], [48.2, 11.5], [48.2, -73.5], [48.2, 64.1], [48.2, 116.6], [48.2, -105.9], [48.2, 31.6], [48.2, 84.1], [48.2, -0.9], [48.2, 136.6], [48.2, -85.9], [48.2, 51.7], [48.2, 104.2], [48.2, -118.3], [48.2, 19.2], [48.2, -65.8], [48.2, 71.7], [48.1, 124.2], [48.1, -98.3], [48.1, 39.3], [48.1, 91.8], [48.1, 6.8], [48.1, -78.2], [48.1, 59.3], [48.1, 111.8], [48.1, -110.7], [48.1, 26.9], [48.1, 79.4], [48.1, 131.9], [48.1, -90.6], [48.1, 46.9], [48.1, 99.4], [48.1, -123.1], [48.1, 14.5], [48.1, -70.5], [48.1, 67], [48.1, 119.5], [48.1, -103], [48.1, 34.5], [48.1, 87], [48.1, 2.1], [48.1, 139.6], [48.1, -82.9], [48.1, 54.6], [48, 107.1], [48, -115.4], [48, 22.1], [48, 74.6], [48, 127.2], [48, -95.3], [48, 42.2], [48, 94.7], [48, 9.7], [48, -75.3], [48, 62.2], [48, 114.8], [48, -107.7], [48, 29.8], [48, 82.3], [48, -2.7], [48, 134.8], [48, -87.7], [48, 49.8], [48, 102.4], [48, -120.1], [48, 17.4], [48, -67.6], [48, 69.9], [48, 122.4], [48, -100.1], [48, 37.4], [47.9, 90], [47.9, 5], [47.9, -80], [47.9, 57.5], [47.9, 110], [47.9, -112.5], [47.9, 25], [47.9, 77.6], [47.9, 130.1], [47.9, -92.4], [47.9, 45.1], [47.9, 97.6], [47.9, 12.6], [47.9, -72.3], [47.9, 65.2], [47.9, 117.7], [47.9, -104.8], [47.9, 32.7], [47.9, 85.2], [47.9, 0.2], [47.9, 137.8], [47.9, -84.7], [47.9, 52.8], [47.9, 105.3], [47.9, -117.2], [47.8, 20.3], [47.8, -64.7], [47.8, 72.8], [47.8, 125.4], [47.8, -97.1], [47.8, 40.4], [47.8, 92.9], [47.8, 7.9], [47.8, -77.1], [47.8, 60.4], [47.8, 113], [47.8, -109.5], [47.8, 28], [47.8, 80.5], [47.8, 133], [47.8, -89.5], [47.8, 48], [47.8, 100.6], [47.8, -121.9], [47.8, 15.6], [47.8, -69.4], [47.8, 68.1], [47.8, 120.6], [47.8, -101.9], [47.8, 35.6], [47.8, 88.2], [47.7, 3.2], [47.7, -81.8], [47.7, 55.7], [47.7, 108.2], [47.7, -114.3], [47.7, 23.2], [47.7, 75.8], [47.7, 128.3], [47.7, -94.2], [47.7, 43.3], [47.7, 95.8], [47.7, 10.8], [47.7, -74.1], [47.7, 63.4], [47.7, 115.9], [47.7, -106.6], [47.7, 30.9], [47.7, 83.4], [47.7, -1.6], [47.7, 135.9], [47.7, -86.5], [47.7, 51], [47.7, 103.5], [47.7, -119], [47.7, 18.5], [47.7, -66.5], [47.7, 71], [47.6, 123.5], [47.6, -98.9], [47.6, 38.6], [47.6, 91.1], [47.6, 6.1], [47.6, -78.9], [47.6, 58.6], [47.6, 111.1], [47.6, -111.3], [47.6, 26.2], [47.6, 78.7], [47.6, 131.2], [47.6, -91.3], [47.6, 46.2], [47.6, 98.8], [47.6, -123.7], [47.6, 13.8], [47.6, -71.2], [47.6, 66.3], [47.6, 118.8], [47.6, -103.7], [47.6, 33.8], [47.6, 86.4], [47.6, 1.4], [47.6, 138.9], [47.6, -83.6], [47.6, 53.9], [47.5, 106.4], [47.5, -116.1], [47.5, 21.4], [47.5, 74], [47.5, 126.5], [47.5, -96], [47.5, 41.5], [47.5, 94], [47.5, 9], [47.5, -76], [47.5, 61.6], [47.5, 114.1], [47.5, -108.4], [47.5, 29.1], [47.5, 81.6], [47.5, -3.4], [47.5, 134.1], [47.5, -88.4], [47.5, 49.2], [47.5, 101.7], [47.5, -120.8], [47.5, 16.7], [47.5, -68.3], [47.5, 69.2], [47.5, 121.7], [47.5, -100.8], [47.5, 36.8], [47.4, 89.3], [47.4, 4.3], [47.4, -80.7], [47.4, 56.8], [47.4, 109.3], [47.4, -113.2], [47.4, 24.4], [47.4, 76.9], [47.4, 129.4], [47.4, -93.1], [47.4, 44.4], [47.4, 96.9], [47.4, 12], [47.4, -73], [47.4, 64.5], [47.4, 117], [47.4, -105.5], [47.4, 32], [47.4, 84.5], [47.4, -0.4], [47.4, 137.1], [47.4, -85.4], [47.4, 52.1], [47.4, 104.6], [47.4, -117.9], [47.4, 19.6], [47.4, -65.4], [47.3, 72.1], [47.3, 124.7], [47.3, -97.8], [47.3, 39.7], [47.3, 92.2], [47.3, 7.2], [47.3, -77.8], [47.3, 59.7], [47.3, 112.3], [47.3, -110.2], [47.3, 27.3], [47.3, 79.8], [47.3, 132.3], [47.3, -90.2], [47.3, 47.3], [47.3, 99.9], [47.3, -122.6], [47.3, 14.9], [47.3, -70.1], [47.3, 67.4], [47.3, 119.9], [47.3, -102.6], [47.3, 34.9], [47.3, 87.5], [47.3, 2.5], [47.3, -82.5], [47.2, 55], [47.2, 107.5], [47.2, -115], [47.2, 22.5], [47.2, 75.1], [47.2, 127.6], [47.2, -94.9], [47.2, 42.6], [47.2, 95.1], [47.2, 10.1], [47.2, -74.8], [47.2, 62.7], [47.2, 115.2], [47.2, -107.3], [47.2, 30.2], [47.2, 82.7], [47.2, -2.3], [47.2, 135.3], [47.2, -87.2], [47.2, 50.3], [47.2, 102.8], [47.2, -119.7], [47.2, 17.8], [47.2, -67.2], [47.2, 70.3], [47.2, 122.9], [47.2, -99.6], [47.2, 37.9], [47.1, 90.4], [47.1, 5.4], [47.1, -79.6], [47.1, 57.9], [47.1, 110.5], [47.1, -112], [47.1, 25.5], [47.1, 78], [47.1, 130.5], [47.1, -92], [47.1, 45.5], [47.1, 98.1], [47.1, 13.1], [47.1, -71.9], [47.1, 65.6], [47.1, 118.1], [47.1, -104.4], [47.1, 33.1], [47.1, 85.7], [47.1, 0.7], [47.1, 138.2], [47.1, -84.3], [47.1, 53.2], [47.1, 105.7], [47.1, -116.8], [47.1, 20.7], [47, -64.2], [47, 73.3], [47, 125.8], [47, -96.7], [47, 40.8], [47, 93.3], [47, 8.3], [47, -76.6], [47, 60.9], [47, 113.4], [47, -109.1], [47, 28.4], [47, 80.9], [47, 133.4], [47, -89], [47, 48.5], [47, 101], [47, -121.5], [47, 16], [47, -69], [47, 68.5], [47, 121], [47, -101.4], [47, 36.1], [47, 88.6], [47, 3.6], [46.9, -81.4], [46.9, 56.1], [46.9, 108.6], [46.9, -113.8], [46.9, 23.7], [46.9, 76.2], [46.9, 128.7], [46.9, -93.8], [46.9, 43.7], [46.9, 96.3], [46.9, 11.3], [46.9, -73.7], [46.9, 63.8], [46.9, 116.3], [46.9, -106.2], [46.9, 31.3], [46.9, 83.9], [46.9, -1.1], [46.9, 136.4], [46.9, -86.1], [46.9, 51.4], [46.9, 103.9], [46.9, -118.6], [46.9, 18.9], [46.9, -66.1], [46.9, 71.5], [46.9, 124], [46.8, -98.5], [46.8, 39], [46.8, 91.5], [46.8, 6.5], [46.8, -78.5], [46.8, 59.1], [46.8, 111.6], [46.8, -110.9], [46.8, 26.6], [46.8, 79.1], [46.8, 131.6], [46.8, -90.9], [46.8, 46.7], [46.8, 99.2], [46.8, -123.3], [46.8, 14.2], [46.8, -70.8], [46.8, 66.7], [46.8, 119.2], [46.8, -103.3], [46.8, 34.3], [46.8, 86.8], [46.8, 1.8], [46.8, -83.2], [46.8, 54.3], [46.8, 106.8], [46.8, -115.7], [46.7, 21.9], [46.7, -63.1], [46.7, 74.4], [46.7, 126.9], [46.7, -95.6], [46.7, 41.9], [46.7, 94.4], [46.7, 9.5], [46.7, -75.5], [46.7, 62], [46.7, 114.5], [46.7, -108], [46.7, 29.5], [46.7, 82], [46.7, -2.9], [46.7, 134.6], [46.7, -87.9], [46.7, 49.6], [46.7, 102.1], [46.7, -120.4], [46.7, 17.1], [46.7, -67.9], [46.7, 69.6], [46.7, 122.2], [46.7, -100.3], [46.7, 37.2], [46.7, 89.7], [46.7, 4.7], [46.6, -80.3], [46.6, 57.2], [46.6, 109.8], [46.6, -112.7], [46.6, 24.8], [46.6, 77.3], [46.6, 129.8], [46.6, -92.7], [46.6, 44.8], [46.6, 97.4], [46.6, 12.4], [46.6, -72.6], [46.6, 64.9], [46.6, 117.4], [46.6, -105.1], [46.6, 32.4], [46.6, 85], [46.6, -0], [46.6, 137.5], [46.6, -85], [46.6, 52.5], [46.6, 105], [46.6, -117.5], [46.6, 20], [46.6, -64.9], [46.6, 72.6], [46.6, 125.1], [46.5, -97.4], [46.5, 40.1], [46.5, 92.6], [46.5, 7.6], [46.5, -77.3], [46.5, 60.2], [46.5, 112.7], [46.5, -109.8], [46.5, 27.7], [46.5, 80.2], [46.5, 132.8], [46.5, -89.7], [46.5, 47.8], [46.5, 100.3], [46.5, -122.2], [46.5, 15.3], [46.5, -69.7], [46.5, 67.8], [46.5, 120.4], [46.5, -102.1], [46.5, 35.4], [46.5, 87.9], [46.5, 2.9], [46.5, -82.1], [46.5, 55.4], [46.5, 108], [46.5, -114.5], [46.4, 23], [46.4, -62], [46.4, 75.5], [46.4, 128], [46.4, -94.5], [46.4, 43], [46.4, 95.6], [46.4, 10.6], [46.4, -74.4], [46.4, 63.1], [46.4, 115.6], [46.4, -106.9], [46.4, 30.6], [46.4, 83.2], [46.4, -1.8], [46.4, 135.7], [46.4, -86.8], [46.4, 50.7], [46.4, 103.2], [46.4, -119.3], [46.4, 18.2], [46.4, -66.7], [46.4, 70.8], [46.4, 123.3], [46.4, -99.2], [46.4, 38.3], [46.4, 90.8], [46.4, 5.8], [46.3, -79.1], [46.3, 58.4], [46.3, 110.9], [46.3, -111.6], [46.3, 25.9], [46.3, 78.4], [46.3, 130.9], [46.3, -91.5], [46.3, 46], [46.3, 98.5], [46.3, 13.5], [46.3, -71.5], [46.3, 66], [46.3, 118.5], [46.3, -103.9], [46.3, 33.6], [46.3, 86.1], [46.3, 1.1], [46.3, -83.9], [46.3, 53.6], [46.3, 106.1], [46.3, -116.3], [46.3, 21.2], [46.3, -63.8], [46.3, 73.7], [46.3, 126.2], [46.2, -96.3], [46.2, 41.2], [46.2, 93.8], [46.2, 8.8], [46.2, -76.2], [46.2, 61.3], [46.2, 113.8], [46.2, -108.7], [46.2, 28.8], [46.2, 81.4], [46.2, 133.9], [46.2, -88.6], [46.2, 48.9], [46.2, 101.4], [46.2, -121.1], [46.2, 16.4], [46.2, -68.6], [46.2, 69], [46.2, 121.5], [46.2, -101], [46.2, 36.5], [46.2, 89], [46.2, 4], [46.2, -81], [46.2, 56.6], [46.2, 109.1], [46.2, -113.4], [46.2, 24.1], [46.1, -60.9], [46.1, 76.6], [46.1, 129.1], [46.1, -93.4], [46.1, 44.2], [46.1, 96.7], [46.1, 11.7], [46.1, -73.3], [46.1, 64.2], [46.1, 116.7], [46.1, -105.8], [46.1, 31.8], [46.1, 84.3], [46.1, -0.7], [46.1, 136.8], [46.1, -85.7], [46.1, 51.8], [46.1, 104.3], [46.1, -118.2], [46.1, 19.4], [46.1, -65.6], [46.1, 71.9], [46.1, 124.4], [46.1, -98.1], [46.1, 39.4], [46.1, 91.9], [46.1, 7], [46, -78], [46, 59.5], [46, 112], [46, -110.5], [46, 27], [46, 79.5], [46, 132.1], [46, -90.4], [46, 47.1], [46, 99.6], [46, -122.9], [46, 14.6], [46, -70.4], [46, 67.1], [46, 119.7], [46, -102.8], [46, 34.7], [46, 87.2], [46, 2.2], [46, -82.8], [46, 54.7], [46, 107.3], [46, -115.2], [46, 22.3], [46, -62.7], [46, 74.8], [46, 127.3], [46, -95.2], [46, 42.3], [45.9, 94.9], [45.9, 9.9], [45.9, -75.1], [45.9, 62.4], [45.9, 114.9], [45.9, -107.6], [45.9, 29.9], [45.9, 82.5], [45.9, 135], [45.9, -87.5], [45.9, 50], [45.9, 102.5], [45.9, -120], [45.9, 17.5], [45.9, -67.4], [45.9, 70.1], [45.9, 122.6], [45.9, -99.9], [45.9, 37.6], [45.9, 90.1], [45.9, 5.1], [45.9, -79.8], [45.9, 57.7], [45.9, 110.2], [45.9, -112.3], [45.9, 25.2], [45.8, 77.7], [45.8, 130.3], [45.8, -92.2], [45.8, 45.3], [45.8, 97.8], [45.8, 12.8], [45.8, -72.2], [45.8, 65.3], [45.8, 117.9], [45.8, -104.6], [45.8, 32.9], [45.8, 85.4], [45.8, 0.4], [45.8, -84.6], [45.8, 52.9], [45.8, 105.5], [45.8, -117], [45.8, 20.5], [45.8, -64.5], [45.8, 73], [45.8, 125.5], [45.8, -97], [45.8, 40.5], [45.8, 93.1], [45.8, 8.1], [45.8, -76.9], [45.8, 60.6], [45.7, 113.1], [45.7, -109.4], [45.7, 28.1], [45.7, 80.7], [45.7, 133.2], [45.7, -89.3], [45.7, 48.2], [45.7, 100.7], [45.7, -121.8], [45.7, 15.7], [45.7, -69.2], [45.7, 68.3], [45.7, 120.8], [45.7, -101.7], [45.7, 35.8], [45.7, 88.3], [45.7, 3.3], [45.7, -81.6], [45.7, 55.9], [45.7, 108.4], [45.7, -114.1], [45.7, 23.4], [45.7, -61.6], [45.7, 75.9], [45.7, 128.4], [45.7, -94], [45.7, 43.5], [45.6, 96], [45.6, 11], [45.6, -74], [45.6, 63.5], [45.6, 116], [45.6, -106.4], [45.6, 31.1], [45.6, 83.6], [45.6, -1.4], [45.6, 136.1], [45.6, -86.4], [45.6, 51.1], [45.6, 103.6], [45.6, -118.8], [45.6, 18.7], [45.6, -66.3], [45.6, 71.2], [45.6, 123.7], [45.6, -98.8], [45.6, 38.7], [45.6, 91.3], [45.6, 6.3], [45.6, -78.7], [45.6, 58.8], [45.6, 111.3], [45.6, -111.2], [45.6, 26.3], [45.6, 78.9], [45.5, 131.4], [45.5, -91.1], [45.5, 46.4], [45.5, 98.9], [45.5, -123.6], [45.5, 13.9], [45.5, -71.1], [45.5, 66.5], [45.5, 119], [45.5, -103.5], [45.5, 34], [45.5, 86.5], [45.5, 1.5], [45.5, -83.5], [45.5, 54.1], [45.5, 106.6], [45.5, -115.9], [45.5, 21.6], [45.5, -63.4], [45.5, 74.1], [45.5, 126.6], [45.5, -95.9], [45.5, 41.7], [45.5, 94.2], [45.5, 9.2], [45.5, -75.8], [45.5, 61.7], [45.4, 114.2], [45.4, -108.3], [45.4, 29.3], [45.4, 81.8], [45.4, 134.3], [45.4, -88.2], [45.4, 49.3], [45.4, 101.8], [45.4, -120.7], [45.4, 16.9], [45.4, -68.1], [45.4, 69.4], [45.4, 121.9], [45.4, -100.6], [45.4, 36.9], [45.4, 89.4], [45.4, 4.5], [45.4, -80.5], [45.4, 57], [45.4, 109.5], [45.4, -113], [45.4, 24.5], [45.4, 77], [45.4, 129.6], [45.4, -92.9], [45.4, 44.6], [45.4, 97.1], [45.3, 12.1], [45.3, -72.9], [45.3, 64.6], [45.3, 117.2], [45.3, -105.3], [45.3, 32.2], [45.3, 84.7], [45.3, -0.3], [45.3, -85.3], [45.3, 52.2], [45.3, 104.8], [45.3, -117.7], [45.3, 19.8], [45.3, -65.2], [45.3, 72.3], [45.3, 124.8], [45.3, -97.7], [45.3, 39.8], [45.3, 92.4], [45.3, 7.4], [45.3, -77.6], [45.3, 59.9], [45.3, 112.4], [45.3, -110.1], [45.3, 27.4], [45.3, 80], [45.3, 132.5], [45.3, -90], [45.2, 47.5], [45.2, 100], [45.2, -122.5], [45.2, 15], [45.2, -69.9], [45.2, 67.6], [45.2, 120.1], [45.2, -102.4], [45.2, 35.1], [45.2, 87.6], [45.2, 2.6], [45.2, -82.3], [45.2, 55.2], [45.2, 107.7], [45.2, -114.8], [45.2, 22.7], [45.2, 75.2], [45.2, 127.8], [45.2, -94.7], [45.2, 42.8], [45.2, 95.3], [45.2, 10.3], [45.2, -74.7], [45.2, 62.8], [45.2, 115.4], [45.2, -107.1], [45.2, 30.4], [45.1, 82.9], [45.1, 135.4], [45.1, -87.1], [45.1, 50.4], [45.1, 103], [45.1, -119.5], [45.1, 18], [45.1, -67], [45.1, 70.5], [45.1, 123], [45.1, -99.5], [45.1, 38], [45.1, 90.6], [45.1, 5.6], [45.1, -79.4], [45.1, 58.1], [45.1, 110.6], [45.1, -111.9], [45.1, 25.6], [45.1, 78.2], [45.1, 130.7], [45.1, -91.8], [45.1, 45.7], [45.1, 98.2], [45.1, 13.2], [45.1, -71.7], [45.1, 65.8], [45, 118.3], [45, -104.2], [45, 33.3], [45, 85.8], [45, 0.8], [45, -84.1], [45, 53.4], [45, 105.9], [45, -116.6], [45, 20.9], [45, -64.1], [45, 73.4], [45, 125.9], [45, -96.5], [45, 41], [45, 93.5], [45, 8.5], [45, -76.5], [45, 61], [45, 113.5], [45, -108.9], [45, 28.6], [45, 81.1], [45, 133.6], [45, -88.9], [45, 48.6], [44.9, 101.1], [44.9, -121.3], [44.9, 16.2], [44.9, -68.8], [44.9, 68.7], [44.9, 121.2], [44.9, -101.3], [44.9, 36.2], [44.9, 88.8], [44.9, 3.8], [44.9, 141.3], [44.9, -81.2], [44.9, 56.3], [44.9, 108.8], [44.9, -113.7], [44.9, 23.8], [44.9, 76.4], [44.9, 128.9], [44.9, -93.6], [44.9, 43.9], [44.9, 96.4], [44.9, 11.4], [44.9, -73.6], [44.9, 64], [44.9, 116.5], [44.9, -106], [44.9, 31.5], [44.9, 84], [44.9, -1], [44.8, -86], [44.8, 51.6], [44.8, 104.1], [44.8, -118.4], [44.8, 19.1], [44.8, -65.9], [44.8, 71.6], [44.8, 124.1], [44.8, -98.4], [44.8, 39.2], [44.8, 91.7], [44.8, 6.7], [44.8, -78.3], [44.8, 59.2], [44.8, 111.7], [44.8, -110.8], [44.8, 26.8], [44.8, 79.3], [44.8, 131.8], [44.8, -90.7], [44.8, 46.8], [44.8, 99.3], [44.8, -123.2], [44.8, 14.4], [44.8, -70.6], [44.8, 66.9], [44.8, 119.4], [44.8, -103.1], [44.7, 34.4], [44.7, 86.9], [44.7, 2], [44.7, -83], [44.7, 54.5], [44.7, 107], [44.7, -115.5], [44.7, 22], [44.7, 74.5], [44.7, 127.1], [44.7, -95.4], [44.7, 42.1], [44.7, 94.6], [44.7, 9.6], [44.7, -75.4], [44.7, 62.1], [44.7, 114.7], [44.7, -107.8], [44.7, 29.7], [44.7, 82.2], [44.7, -87.8], [44.7, 49.7], [44.7, 102.3], [44.7, -120.2], [44.7, 17.3], [44.7, -67.7], [44.6, 69.8], [44.6, 122.3], [44.6, -100.2], [44.6, 37.3], [44.6, 89.9], [44.6, 4.9], [44.6, 142.4], [44.6, -80.1], [44.6, 57.4], [44.6, 109.9], [44.6, -112.6], [44.6, 24.9], [44.6, 77.5], [44.6, 130], [44.6, -92.5], [44.6, 45], [44.6, 97.5], [44.6, 12.5], [44.6, -72.4], [44.6, 65.1], [44.6, 117.6], [44.6, -104.9], [44.6, 32.6], [44.6, 85.1], [44.6, 0.1], [44.6, -84.8], [44.6, 52.7], [44.5, 105.2], [44.5, -117.3], [44.5, 20.2], [44.5, 72.7], [44.5, 125.3], [44.5, -97.2], [44.5, 40.3], [44.5, 92.8], [44.5, 7.8], [44.5, -77.2], [44.5, 60.3], [44.5, 112.9], [44.5, -109.6], [44.5, 27.9], [44.5, 80.4], [44.5, 132.9], [44.5, -89.6], [44.5, 47.9], [44.5, 100.5], [44.5, -122], [44.5, 15.5], [44.5, -69.5], [44.5, 68], [44.5, 120.5], [44.5, -102], [44.5, 35.5], [44.5, 88.1], [44.5, 3.1], [44.4, -81.9], [44.4, 55.6], [44.4, 108.1], [44.4, -114.4], [44.4, 23.1], [44.4, 75.7], [44.4, 128.2], [44.4, -94.3], [44.4, 43.2], [44.4, 95.7], [44.4, 10.7], [44.4, -74.2], [44.4, 63.3], [44.4, 115.8], [44.4, -106.7], [44.4, 30.8], [44.4, 83.3], [44.4, -86.6], [44.4, 50.9], [44.4, 103.4], [44.4, -119.1], [44.4, 18.4], [44.4, -66.6], [44.4, 70.9], [44.4, 123.4], [44.4, -99], [44.3, 38.5], [44.3, 91], [44.3, 6], [44.3, 143.5], [44.3, -79], [44.3, 58.5], [44.3, 111], [44.3, -111.4], [44.3, 26.1], [44.3, 78.6], [44.3, 131.1], [44.3, -91.4], [44.3, 46.1], [44.3, 98.6], [44.3, -123.8], [44.3, 13.7], [44.3, -71.3], [44.3, 66.2], [44.3, 118.7], [44.3, -103.8], [44.3, 33.7], [44.3, 86.3], [44.3, 1.3], [44.3, -83.7], [44.3, 53.8], [44.3, 106.3], [44.3, -116.2], [44.3, 21.3], [44.2, 73.9], [44.2, 126.4], [44.2, -96.1], [44.2, 41.4], [44.2, 93.9], [44.2, 8.9], [44.2, -76.1], [44.2, 61.5], [44.2, 114], [44.2, -108.5], [44.2, 29], [44.2, 81.5], [44.2, -88.5], [44.2, 49.1], [44.2, 101.6], [44.2, -120.9], [44.2, 16.6], [44.2, -68.4], [44.2, 69.1], [44.2, 121.6], [44.2, -100.9], [44.2, 36.7], [44.2, 89.2], [44.2, 4.2], [44.2, 141.7], [44.2, -80.8], [44.2, 56.7], [44.1, 109.2], [44.1, -113.3], [44.1, 24.3], [44.1, 76.8], [44.1, 129.3], [44.1, -93.2], [44.1, 44.3], [44.1, 96.8], [44.1, 11.9], [44.1, -73.1], [44.1, 64.4], [44.1, 116.9], [44.1, -105.6], [44.1, 31.9], [44.1, 84.4], [44.1, -0.5], [44.1, -85.5], [44.1, 52], [44.1, 104.5], [44.1, -118], [44.1, 19.5], [44.1, 72], [44.1, 124.6], [44.1, -97.9], [44.1, 39.6], [44.1, 92.1], [44.1, 7.1], [44.1, 144.6], [44, -77.9], [44, 59.6], [44, 112.2], [44, -110.3], [44, 27.2], [44, 79.7], [44, 132.2], [44, -90.3], [44, 47.2], [44, 99.8], [44, -122.7], [44, 14.8], [44, -70.2], [44, 67.3], [44, 119.8], [44, -102.7], [44, 34.8], [44, 87.4], [44, 2.4], [44, -82.6], [44, 54.9], [44, 107.4], [44, -115.1], [44, 22.4], [44, 75], [44, 127.5], [44, -95], [44, 42.5], [43.9, 95], [43.9, 10], [43.9, -74.9], [43.9, 62.6], [43.9, 115.1], [43.9, -107.4], [43.9, 30.1], [43.9, 82.6], [43.9, -87.3], [43.9, 50.2], [43.9, 102.7], [43.9, -119.8], [43.9, 17.7], [43.9, -67.3], [43.9, 70.2], [43.9, 122.8], [43.9, -99.7], [43.9, 37.8], [43.9, 90.3], [43.9, 5.3], [43.9, 142.8], [43.9, -79.7], [43.9, 57.8], [43.9, 110.4], [43.9, -112.1], [43.9, 25.4], [43.9, 77.9], [43.8, 130.4], [43.8, -92.1], [43.8, 45.4], [43.8, 98], [43.8, 13], [43.8, -72], [43.8, 65.5], [43.8, 118], [43.8, -104.5], [43.8, 33], [43.8, 85.6], [43.8, 0.6], [43.8, -84.4], [43.8, 53.1], [43.8, 105.6], [43.8, -116.9], [43.8, 20.6], [43.8, 73.2], [43.8, 125.7], [43.8, -96.8], [43.8, 40.7], [43.8, 93.2], [43.8, -76.7], [43.8, 60.8], [43.8, 113.3], [43.8, -109.2], [43.7, 28.3], [43.7, 80.8], [43.7, -89.1], [43.7, 48.4], [43.7, 100.9], [43.7, -121.6], [43.7, 15.9], [43.7, -69.1], [43.7, 68.4], [43.7, 120.9], [43.7, -101.5], [43.7, 36], [43.7, 88.5], [43.7, 3.5], [43.7, 141], [43.7, -81.5], [43.7, 56], [43.7, 108.5], [43.7, -113.9], [43.7, 23.6], [43.7, 76.1], [43.7, 128.6], [43.7, -93.9], [43.7, 43.6], [43.7, 96.1], [43.7, 11.2], [43.7, -73.8], [43.7, 63.7], [43.6, 116.2], [43.6, -106.3], [43.6, 31.2], [43.6, 83.8], [43.6, -1.2], [43.6, -86.2], [43.6, 51.3], [43.6, 103.8], [43.6, -118.7], [43.6, 18.8], [43.6, 71.4], [43.6, 123.9], [43.6, -98.6], [43.6, 38.9], [43.6, 91.4], [43.6, 143.9], [43.6, -78.6], [43.6, 59], [43.6, 111.5], [43.6, -111], [43.6, 26.5], [43.6, 79], [43.6, 131.5], [43.6, -91], [43.6, 46.6], [43.6, 99.1], [43.6, -123.4], [43.5, 14.1], [43.5, -70.9], [43.5, 66.6], [43.5, 119.1], [43.5, -103.4], [43.5, 34.2], [43.5, 86.7], [43.5, 1.7], [43.5, -83.3], [43.5, 54.2], [43.5, 106.7], [43.5, -115.8], [43.5, 21.8], [43.5, 74.3], [43.5, 126.8], [43.5, -95.7], [43.5, 41.8], [43.5, 94.3], [43.5, 9.4], [43.5, -75.6], [43.5, 61.9], [43.5, 114.4], [43.5, -108.1], [43.5, 29.4], [43.5, 81.9], [43.5, -3], [43.5, -88], [43.4, 49.5], [43.4, 102], [43.4, -120.5], [43.4, 17], [43.4, -68], [43.4, 69.5], [43.4, 122.1], [43.4, -100.4], [43.4, 37.1], [43.4, 89.6], [43.4, 4.6], [43.4, 142.1], [43.4, -80.4], [43.4, 57.1], [43.4, 109.7], [43.4, -112.8], [43.4, 24.7], [43.4, 77.2], [43.4, 129.7], [43.4, -92.8], [43.4, 44.7], [43.4, 97.3], [43.4, 12.3], [43.4, -72.7], [43.4, 64.8], [43.4, 117.3], [43.4, -105.2], [43.4, 32.3], [43.4, 84.9], [43.3, -0.1], [43.3, -85.1], [43.3, 52.4], [43.3, 104.9], [43.3, -117.6], [43.3, 19.9], [43.3, 72.5], [43.3, 125], [43.3, -97.5], [43.3, 40], [43.3, 92.5], [43.3, -77.4], [43.3, 60.1], [43.3, 112.6], [43.3, -109.9], [43.3, 27.6], [43.3, 80.1], [43.3, -4.9], [43.3, -89.8], [43.3, 47.7], [43.3, 100.2], [43.3, -122.3], [43.3, 15.2], [43.3, -69.8], [43.3, 67.7], [43.3, 120.3], [43.3, -102.2], [43.2, 35.3], [43.2, 87.8], [43.2, 2.8], [43.2, -82.2], [43.2, 55.3], [43.2, 107.9], [43.2, -114.6], [43.2, 22.9], [43.2, 75.4], [43.2, 127.9], [43.2, -94.6], [43.2, 42.9], [43.2, 95.5], [43.2, 10.5], [43.2, -74.5], [43.2, 63], [43.2, 115.5], [43.2, -107], [43.2, 30.5], [43.2, 83.1], [43.2, -1.9], [43.2, -86.9], [43.2, 50.6], [43.2, 103.1], [43.2, -119.4], [43.2, 18.1], [43.2, 70.7], [43.1, 123.2], [43.1, -99.3], [43.1, 38.2], [43.1, 90.7], [43.1, 143.2], [43.1, -79.2], [43.1, 58.3], [43.1, 110.8], [43.1, -111.7], [43.1, 25.8], [43.1, 78.3], [43.1, -6.7], [43.1, 130.8], [43.1, -91.6], [43.1, 45.9], [43.1, 98.4], [43.1, 13.4], [43.1, -71.6], [43.1, 65.9], [43.1, 118.4], [43.1, -104], [43.1, 33.5], [43.1, 86], [43.1, 1], [43.1, -84], [43.1, 53.5], [43.1, 106], [43.1, -116.4], [43, 21.1], [43, 73.6], [43, 126.1], [43, -96.4], [43, 41.1], [43, 93.7], [43, -76.3], [43, 61.2], [43, 113.7], [43, -108.8], [43, 28.7], [43, 81.3], [43, -3.7], [43, -88.7], [43, 48.8], [43, 101.3], [43, -121.2], [43, -68.7], [43, 68.9], [43, 121.4], [43, -101.1], [43, 36.4], [43, 88.9], [43, 141.4], [43, -81.1], [43, 56.5], [42.9, 109], [42.9, -113.5], [42.9, 24], [42.9, 76.5], [42.9, -8.5], [42.9, 129], [42.9, -93.5], [42.9, 44.1], [42.9, 96.6], [42.9, 11.6], [42.9, -73.4], [42.9, 64.1], [42.9, 116.6], [42.9, -105.9], [42.9, 31.7], [42.9, 84.2], [42.9, -0.8], [42.9, -85.8], [42.9, 51.7], [42.9, 104.2], [42.9, -118.3], [42.9, 19.3], [42.9, 71.8], [42.9, 124.3], [42.9, -98.2], [42.9, 39.3], [42.9, 91.8], [42.8, -78.1], [42.8, 59.4], [42.8, 111.9], [42.8, -110.6], [42.8, 26.9], [42.8, 79.4], [42.8, -5.5], [42.8, -90.5], [42.8, 47], [42.8, 99.5], [42.8, -123], [42.8, 14.5], [42.8, -70.5], [42.8, 67], [42.8, 119.6], [42.8, -102.9], [42.8, 34.6], [42.8, 87.1], [42.8, 2.1], [42.8, -82.9], [42.8, 54.6], [42.8, 107.2], [42.8, -115.3], [42.8, 22.2], [42.8, 74.7], [42.8, 127.2], [42.8, -95.3], [42.8, 42.2], [42.7, 94.8], [42.7, -75.2], [42.7, 62.3], [42.7, 114.8], [42.7, -107.7], [42.7, 29.8], [42.7, 82.4], [42.7, -2.6], [42.7, -87.6], [42.7, 49.9], [42.7, 102.4], [42.7, -120.1], [42.7, 17.4], [42.7, 70], [42.7, 122.5], [42.7, -100], [42.7, 37.5], [42.7, 90], [42.7, 142.6], [42.7, -79.9], [42.7, 57.6], [42.7, 110.1], [42.7, -112.4], [42.7, 25.1], [42.7, 77.6], [42.6, -7.4], [42.6, 130.2], [42.6, -92.3], [42.6, 45.2], [42.6, 97.7], [42.6, 12.7], [42.6, -72.3], [42.6, 65.2], [42.6, 117.8], [42.6, -104.7], [42.6, 32.8], [42.6, 85.3], [42.6, 0.3], [42.6, -84.7], [42.6, 52.8], [42.6, 105.4], [42.6, -117.1], [42.6, 20.4], [42.6, 72.9], [42.6, 125.4], [42.6, -97.1], [42.6, 40.4], [42.6, 93], [42.6, -77], [42.6, 60.5], [42.6, 113], [42.6, -109.5], [42.6, 28], [42.5, 80.6], [42.5, -4.4], [42.5, -89.4], [42.5, 48.1], [42.5, 100.6], [42.5, -121.9], [42.5, 15.6], [42.5, -69.3], [42.5, 68.2], [42.5, 120.7], [42.5, -101.8], [42.5, 35.7], [42.5, 88.2], [42.5, 140.7], [42.5, -81.7], [42.5, 55.8], [42.5, 108.3], [42.5, -114.2], [42.5, 23.3], [42.5, 75.8], [42.5, 128.3], [42.5, -94.1], [42.5, 43.4], [42.5, 95.9], [42.5, -74.1], [42.5, 63.4], [42.4, 115.9], [42.4, -106.5], [42.4, 31], [42.4, 83.5], [42.4, -1.5], [42.4, -86.5], [42.4, 51], [42.4, 103.5], [42.4, -118.9], [42.4, 18.6], [42.4, 71.1], [42.4, 123.6], [42.4, -98.9], [42.4, 38.6], [42.4, 91.2], [42.4, 143.7], [42.4, -78.8], [42.4, 58.7], [42.4, 111.2], [42.4, -111.3], [42.4, 26.2], [42.4, 78.8], [42.4, -6.2], [42.4, 131.3], [42.4, -91.2], [42.4, 46.3], [42.4, 98.8], [42.4, -123.7], [42.4, 13.8], [42.4, -71.2], [42.3, 66.4], [42.3, 118.9], [42.3, -103.6], [42.3, 33.9], [42.3, 86.4], [42.3, 1.4], [42.3, -83.6], [42.3, 54], [42.3, 106.5], [42.3, -116], [42.3, 21.5], [42.3, 74], [42.3, 126.5], [42.3, -96], [42.3, 41.6], [42.3, 94.1], [42.3, -75.9], [42.3, 61.6], [42.3, 114.1], [42.3, -108.4], [42.3, 29.2], [42.3, 81.7], [42.3, -3.3], [42.3, -88.3], [42.3, 49.2], [42.3, 101.7], [42.2, -120.8], [42.2, 69.3], [42.2, 121.8], [42.2, -100.7], [42.2, 36.8], [42.2, 89.3], [42.2, 141.9], [42.2, -80.6], [42.2, 56.9], [42.2, 109.4], [42.2, -113.1], [42.2, 24.4], [42.2, 76.9], [42.2, -8], [42.2, 129.5], [42.2, -93], [42.2, 44.5], [42.2, 97], [42.2, 12], [42.2, -73], [42.2, 64.5], [42.2, 117.1], [42.2, -105.4], [42.2, 32.1], [42.2, 84.6], [42.2, -0.4], [42.2, -85.4], [42.2, 52.1], [42.1, 104.7], [42.1, -117.8], [42.1, 19.7], [42.1, 72.2], [42.1, 124.7], [42.1, -97.8], [42.1, 39.7], [42.1, 92.3], [42.1, -77.7], [42.1, 59.8], [42.1, 112.3], [42.1, -110.2], [42.1, 27.3], [42.1, 79.9], [42.1, -5.1], [42.1, -90.1], [42.1, 47.4], [42.1, 99.9], [42.1, -122.6], [42.1, 14.9], [42.1, -70], [42.1, 67.5], [42.1, 120], [42.1, -102.5], [42.1, 35], [42.1, 87.5], [42, -82.4], [42, 55.1], [42, 107.6], [42, -114.9], [42, 22.6], [42, 75.1], [42, 127.7], [42, -94.8], [42, 42.7], [42, 95.2], [42, -74.8], [42, 62.7], [42, 115.3], [42, -107.2], [42, 30.3], [42, 82.8], [42, -2.2], [42, -87.2], [42, 50.3], [42, 102.9], [42, -119.6], [42, 17.9], [42, 70.4], [42, 122.9], [42, -99.6], [42, 37.9], [41.9, 90.5], [41.9, 143], [41.9, -79.5], [41.9, 58], [41.9, 110.5], [41.9, -112], [41.9, 25.5], [41.9, 78.1], [41.9, -6.9], [41.9, 130.6], [41.9, -91.9], [41.9, 45.6], [41.9, 98.1], [41.9, 13.1], [41.9, -71.8], [41.9, 65.7], [41.9, 118.2], [41.9, -104.3], [41.9, 33.2], [41.9, 85.7], [41.9, 0.7], [41.9, -84.2], [41.9, 53.3], [41.9, 105.8], [41.9, -116.7], [41.9, 20.8], [41.9, 73.3], [41.9, 125.8], [41.9, -96.6], [41.8, 40.9], [41.8, 93.4], [41.8, -76.6], [41.8, 60.9], [41.8, 113.4], [41.8, -109], [41.8, 28.5], [41.8, 81], [41.8, -4], [41.8, -89], [41.8, 48.5], [41.8, 101], [41.8, -121.4], [41.8, 16.1], [41.8, 68.6], [41.8, 121.1], [41.8, -101.4], [41.8, 36.1], [41.8, 88.7], [41.8, 141.2], [41.8, -81.3], [41.8, 56.2], [41.8, 108.7], [41.8, -113.8], [41.8, 23.7], [41.8, 76.3], [41.7, -8.7], [41.7, 128.8], [41.7, -93.7], [41.7, 43.8], [41.7, 96.3], [41.7, -73.7], [41.7, 63.9], [41.7, 116.4], [41.7, -106.1], [41.7, 31.4], [41.7, 83.9], [41.7, -1.1], [41.7, -86.1], [41.7, 51.5], [41.7, 104], [41.7, -118.5], [41.7, 19], [41.7, 71.5], [41.7, 124], [41.7, -98.5], [41.7, 39.1], [41.7, 91.6], [41.7, -78.4], [41.7, 59.1], [41.7, 111.6], [41.7, -110.9], [41.7, 26.7], [41.6, 79.2], [41.6, -5.8], [41.6, -90.8], [41.6, 46.7], [41.6, 99.2], [41.6, -123.3], [41.6, 14.3], [41.6, 66.8], [41.6, 119.3], [41.6, -103.2], [41.6, 34.3], [41.6, 86.8], [41.6, 1.9], [41.6, -83.1], [41.6, 54.4], [41.6, 106.9], [41.6, -115.6], [41.6, 21.9], [41.6, 74.4], [41.6, 127], [41.6, -95.5], [41.6, 42], [41.6, 94.5], [41.6, -75.5], [41.6, 62], [41.6, 114.6], [41.5, -107.9], [41.5, 29.6], [41.5, 82.1], [41.5, -2.9], [41.5, -87.9], [41.5, 49.6], [41.5, 102.2], [41.5, -120.3], [41.5, 69.7], [41.5, 122.2], [41.5, -100.3], [41.5, 37.2], [41.5, 89.8], [41.5, 142.3], [41.5, -80.2], [41.5, 57.3], [41.5, 109.8], [41.5, -112.7], [41.5, 24.8], [41.5, 77.4], [41.5, -7.6], [41.5, 129.9], [41.5, -92.6], [41.5, 44.9], [41.5, 97.4], [41.5, -72.5], [41.5, 65], [41.4, 117.5], [41.4, -105], [41.4, 32.5], [41.4, 85], [41.4, 0], [41.4, -84.9], [41.4, 52.6], [41.4, 105.1], [41.4, -117.4], [41.4, 20.1], [41.4, 72.6], [41.4, 125.2], [41.4, -97.3], [41.4, 40.2], [41.4, 92.7], [41.4, -77.3], [41.4, 60.2], [41.4, 112.8], [41.4, -109.7], [41.4, 27.8], [41.4, 80.3], [41.4, -4.7], [41.4, -89.7], [41.4, 47.8], [41.4, 100.4], [41.4, -122.1], [41.4, 15.4], [41.3, 67.9], [41.3, 120.4], [41.3, -102.1], [41.3, 35.4], [41.3, 88], [41.3, 140.5], [41.3, -82], [41.3, 55.5], [41.3, 108], [41.3, -114.5], [41.3, 23], [41.3, 75.6], [41.3, 128.1], [41.3, -94.4], [41.3, 43.1], [41.3, 95.6], [41.3, -74.3], [41.3, 63.2], [41.3, 115.7], [41.3, -106.8], [41.3, 30.7], [41.3, 83.2], [41.3, -1.8], [41.3, -86.7], [41.3, 50.8], [41.3, 103.3], [41.2, -119.2], [41.2, 70.8], [41.2, 123.3], [41.2, -99.1], [41.2, 38.4], [41.2, 90.9], [41.2, -79.1], [41.2, 58.4], [41.2, 110.9], [41.2, -111.5], [41.2, 26], [41.2, 78.5], [41.2, -6.5], [41.2, -91.5], [41.2, 46], [41.2, 98.5], [41.2, 13.6], [41.2, 66.1], [41.2, 118.6], [41.2, -103.9], [41.2, 33.6], [41.2, 86.2], [41.2, 1.2], [41.2, -83.8], [41.2, 53.7], [41.1, 106.2], [41.1, -116.3], [41.1, 21.2], [41.1, 73.8], [41.1, 126.3], [41.1, -96.2], [41.1, 41.3], [41.1, 93.8], [41.1, -76.2], [41.1, 61.4], [41.1, 113.9], [41.1, -108.6], [41.1, 28.9], [41.1, 81.4], [41.1, -3.6], [41.1, -88.6], [41.1, 49], [41.1, 101.5], [41.1, -121], [41.1, 16.5], [41.1, 69], [41.1, 121.5], [41.1, -101], [41.1, 36.6], [41.1, 89.1], [41.1, 141.6], [41, -80.9], [41, 56.6], [41, 109.1], [41, -113.4], [41, 24.2], [41, 76.7], [41, -8.3], [41, 129.2], [41, -93.3], [41, 44.2], [41, 96.7], [41, -73.2], [41, 64.3], [41, 116.8], [41, -105.7], [41, 31.8], [41, 84.3], [41, -0.6], [41, -85.6], [41, 51.9], [41, 104.4], [41, -118.1], [41, 19.4], [41, 71.9], [41, 124.5], [41, -98], [41, 39.5], [41, 92], [40.9, -78], [40.9, 59.5], [40.9, 112.1], [40.9, -110.4], [40.9, 27.1], [40.9, 79.6], [40.9, -5.4], [40.9, -90.4], [40.9, 47.1], [40.9, 99.7], [40.9, -122.8], [40.9, 14.7], [40.9, 67.2], [40.9, 119.7], [40.9, -102.8], [40.9, 34.7], [40.9, 87.3], [40.9, -82.7], [40.9, 54.8], [40.9, 107.3], [40.9, -115.2], [40.9, 22.3], [40.9, 74.9], [40.9, 127.4], [40.9, -95.1], [40.9, 42.4], [40.8, 94.9], [40.8, -75], [40.8, 62.5], [40.8, 115], [40.8, -107.5], [40.8, 30], [40.8, 82.5], [40.8, -2.5], [40.8, -87.4], [40.8, 50.1], [40.8, 102.6], [40.8, -119.9], [40.8, 70.1], [40.8, 122.7], [40.8, -99.8], [40.8, 37.7], [40.8, 90.2], [40.8, -79.8], [40.8, 57.7], [40.8, 110.3], [40.8, -112.2], [40.8, 25.3], [40.8, 77.8], [40.8, -7.2], [40.8, -92.2], [40.8, 45.3], [40.7, 97.9], [40.7, 65.4], [40.7, 117.9], [40.7, -104.6], [40.7, 32.9], [40.7, 85.5], [40.7, 0.5], [40.7, -84.5], [40.7, 53], [40.7, 105.5], [40.7, -117], [40.7, 20.5], [40.7, 73.1], [40.7, 125.6], [40.7, -96.9], [40.7, 40.6], [40.7, 93.1], [40.7, -76.8], [40.7, 60.7], [40.7, 113.2], [40.7, -109.3], [40.7, 28.2], [40.7, 80.7], [40.7, -4.3], [40.6, -89.2], [40.6, 48.3], [40.6, 100.8], [40.6, -121.7], [40.6, 15.8], [40.6, 68.3], [40.6, 120.8], [40.6, -101.6], [40.6, 35.9], [40.6, 88.4], [40.6, 140.9], [40.6, -81.6], [40.6, 55.9], [40.6, 108.4], [40.6, -114], [40.6, 23.5], [40.6, 76], [40.6, -9], [40.6, 128.5], [40.6, -94], [40.6, 43.5], [40.6, 96], [40.6, -73.9], [40.6, 63.6], [40.6, 116.1], [40.6, -106.4], [40.6, 31.1], [40.6, 83.7], [40.5, -1.3], [40.5, -86.3], [40.5, 51.2], [40.5, 103.7], [40.5, -118.8], [40.5, 71.3], [40.5, 123.8], [40.5, -98.7], [40.5, 38.8], [40.5, 91.3], [40.5, -78.7], [40.5, 58.9], [40.5, 111.4], [40.5, -111.1], [40.5, 26.4], [40.5, 78.9], [40.5, -6.1], [40.5, -91.1], [40.5, 46.5], [40.5, 99], [40.5, 14], [40.5, 66.5], [40.5, 119], [40.5, -103.5], [40.5, 34.1], [40.4, 86.6], [40.4, -83.4], [40.4, 54.1], [40.4, 106.6], [40.4, -115.9], [40.4, 21.7], [40.4, 74.2], [40.4, 126.7], [40.4, -95.8], [40.4, 41.7], [40.4, 94.2], [40.4, -75.7], [40.4, 61.8], [40.4, 114.3], [40.4, -108.2], [40.4, 29.3], [40.4, 81.8], [40.4, -3.1], [40.4, -88.1], [40.4, 49.4], [40.4, 101.9], [40.4, -120.6], [40.4, 16.9], [40.4, 69.4], [40.4, 122], [40.4, -100.5], [40.4, 37], [40.3, 89.5], [40.3, 142], [40.3, -80.5], [40.3, 57], [40.3, 109.6], [40.3, -112.9], [40.3, 24.6], [40.3, 77.1], [40.3, -7.9], [40.3, -92.9], [40.3, 44.6], [40.3, 97.2], [40.3, 64.7], [40.3, 117.2], [40.3, -105.3], [40.3, 32.2], [40.3, 84.8], [40.3, -0.2], [40.3, -85.2], [40.3, 52.3], [40.3, 104.8], [40.3, -117.7], [40.3, 19.8], [40.3, 72.4], [40.3, 124.9], [40.2, -97.6], [40.2, 39.9], [40.2, 92.4], [40.2, -77.5], [40.2, 60], [40.2, 112.5], [40.2, -110], [40.2, 27.5], [40.2, 80], [40.2, -5], [40.2, -89.9], [40.2, 47.6], [40.2, 100.1], [40.2, -122.4], [40.2, 15.1], [40.2, 67.6], [40.2, 120.2], [40.2, -102.3], [40.2, 35.2], [40.2, 87.7], [40.2, 140.2], [40.2, -82.3], [40.2, 55.2], [40.2, 107.8], [40.2, -114.7], [40.2, 22.8], [40.2, 75.3], [40.1, 127.8], [40.1, -94.7], [40.1, 42.8], [40.1, 95.4], [40.1, -74.6], [40.1, 62.9], [40.1, 115.4], [40.1, -107.1], [40.1, 30.4], [40.1, 83], [40.1, -2], [40.1, -87], [40.1, 50.5], [40.1, 103], [40.1, -119.5], [40.1, 70.6], [40.1, 123.1], [40.1, -99.4], [40.1, 38.1], [40.1, 90.6], [40.1, -79.3], [40.1, 58.2], [40.1, 110.7], [40.1, -111.8], [40.1, 25.7], [40.1, 78.2], [40, -6.8], [40, -91.7], [40, 45.8], [40, 98.3], [40, 65.8], [40, 118.3], [40, -104.1], [40, 33.4], [40, 85.9], [40, -84.1], [40, 53.4], [40, 105.9], [40, -116.5], [40, 21], [40, 73.5], [40, 126], [40, -96.5], [40, 41], [40, 93.5], [40, -76.4], [40, 61.1], [40, 113.6], [40, -108.9], [40, 28.6], [39.9, 81.2], [39.9, -3.8], [39.9, -88.8], [39.9, 48.7], [39.9, 101.2], [39.9, -121.3], [39.9, 16.2], [39.9, 68.8], [39.9, 121.3], [39.9, -101.2], [39.9, 36.3], [39.9, 88.8], [39.9, 141.3], [39.9, -81.2], [39.9, 56.4], [39.9, 108.9], [39.9, -113.6], [39.9, 23.9], [39.9, 76.4], [39.9, -8.6], [39.9, -93.6], [39.9, 44], [39.9, 96.5], [39.9, 64], [39.9, 116.5], [39.9, -106], [39.9, 31.6], [39.8, 84.1], [39.8, -0.9], [39.8, -85.9], [39.8, 51.6], [39.8, 104.1], [39.8, -118.4], [39.8, 71.7], [39.8, 124.2], [39.8, -98.3], [39.8, 39.2], [39.8, 91.7], [39.8, -78.2], [39.8, 59.3], [39.8, 111.8], [39.8, -110.7], [39.8, 26.8], [39.8, 79.3], [39.8, -5.6], [39.8, -90.6], [39.8, 46.9], [39.8, 99.4], [39.8, -123.1], [39.8, 14.4], [39.8, 66.9], [39.8, 119.5], [39.7, -103], [39.7, 34.5], [39.7, 87], [39.7, 139.5], [39.7, -83], [39.7, 54.5], [39.7, 107.1], [39.7, -115.4], [39.7, 22.1], [39.7, 74.6], [39.7, 127.1], [39.7, -95.4], [39.7, 42.1], [39.7, 94.7], [39.7, -75.3], [39.7, 62.2], [39.7, 114.7], [39.7, -107.8], [39.7, 29.7], [39.7, 82.3], [39.7, -2.7], [39.7, -87.7], [39.7, 49.8], [39.7, 102.3], [39.7, -120.2], [39.7, 17.3], [39.7, 69.9], [39.6, 122.4], [39.6, -100.1], [39.6, 37.4], [39.6, 89.9], [39.6, -80], [39.6, 57.5], [39.6, 110], [39.6, -112.5], [39.6, 25], [39.6, 77.5], [39.6, -7.5], [39.6, -92.4], [39.6, 45.1], [39.6, 97.6], [39.6, 65.1], [39.6, 117.7], [39.6, -104.8], [39.6, 32.7], [39.6, 85.2], [39.6, 0.2], [39.6, -84.8], [39.6, 52.7], [39.6, 105.3], [39.6, -117.2], [39.6, 20.3], [39.6, 72.8], [39.5, 125.3], [39.5, -97.2], [39.5, 40.3], [39.5, 92.9], [39.5, -77.1], [39.5, 60.4], [39.5, 112.9], [39.5, -109.6], [39.5, 27.9], [39.5, 80.5], [39.5, -4.5], [39.5, -89.5], [39.5, 48], [39.5, 100.5], [39.5, -122], [39.5, 15.5], [39.5, 68.1], [39.5, 120.6], [39.5, -101.9], [39.5, 35.6], [39.5, 88.1], [39.5, 140.6], [39.5, -81.8], [39.5, 55.7], [39.5, 108.2], [39.5, -114.3], [39.5, 23.2], [39.5, 75.7], [39.4, 128.2], [39.4, -94.2], [39.4, 43.3], [39.4, 95.8], [39.4, 63.3], [39.4, 115.8], [39.4, -106.6], [39.4, 30.9], [39.4, 83.4], [39.4, -1.6], [39.4, -86.6], [39.4, 50.9], [39.4, 103.4], [39.4, -119], [39.4, 71], [39.4, 123.5], [39.4, -99], [39.4, 38.5], [39.4, 91], [39.4, -78.9], [39.4, 58.6], [39.4, 111.1], [39.4, -111.4], [39.3, 78.7], [39.3, -6.3], [39.3, -91.3], [39.3, 46.2], [39.3, 98.7], [39.3, 66.3], [39.3, 118.8], [39.3, -103.7], [39.3, 33.8], [39.3, 86.3], [39.3, -83.7], [39.3, 53.9], [39.3, 106.4], [39.3, -116.1], [39.3, 21.4], [39.3, 73.9], [39.3, 126.4], [39.3, -96.1], [39.3, 41.5], [39.3, 94], [39.3, -76], [39.3, 61.5], [39.3, 114], [39.3, -108.5], [39.3, 29.1], [39.2, 81.6], [39.2, -3.4], [39.2, -88.4], [39.2, 49.1], [39.2, 101.6], [39.2, -120.9], [39.2, 16.7], [39.2, 69.2], [39.2, 121.7], [39.2, -100.8], [39.2, 36.7], [39.2, 89.2], [39.2, 141.8], [39.2, -80.7], [39.2, 56.8], [39.2, 109.3], [39.2, -113.2], [39.2, 24.3], [39.2, 76.8], [39.2, -8.1], [39.2, -93.1], [39.2, 44.4], [39.2, 96.9], [39.2, 64.4], [39.2, 117], [39.2, -105.5], [39.2, 32], [39.1, 84.5], [39.1, -0.5], [39.1, -85.5], [39.1, 52], [39.1, 104.6], [39.1, -117.9], [39.1, 72.1], [39.1, 124.6], [39.1, -97.9], [39.1, 39.6], [39.1, 92.2], [39.1, -77.8], [39.1, 59.7], [39.1, 112.2], [39.1, -110.3], [39.1, 27.2], [39.1, 79.8], [39.1, -5.2], [39.1, -90.2], [39.1, 47.3], [39.1, 99.8], [39.1, -122.7], [39.1, 67.4], [39.1, 119.9], [39.1, -102.6], [39, 34.9], [39, 87.4], [39, 140], [39, -82.5], [39, 55], [39, 107.5], [39, -115], [39, 22.5], [39, 75], [39, 127.6], [39, -94.9], [39, 42.6], [39, 95.1], [39, -74.9], [39, 62.6], [39, 115.2], [39, -107.3], [39, 30.2], [39, 82.7], [39, -2.3], [39, -87.3], [39, 50.2], [39, 102.8], [39, -119.7], [39, 70.3], [39, 122.8], [38.9, -99.7], [38.9, 37.8], [38.9, 90.4], [38.9, -79.6], [38.9, 57.9], [38.9, 110.4], [38.9, -112.1], [38.9, 78], [38.9, -7], [38.9, -92], [38.9, 45.5], [38.9, 98], [38.9, 65.6], [38.9, 118.1], [38.9, -104.4], [38.9, 33.1], [38.9, 85.6], [38.9, -84.3], [38.9, 53.2], [38.9, 105.7], [38.9, -116.8], [38.9, 20.7], [38.9, 73.2], [38.9, 125.7], [38.8, -96.7], [38.8, 40.8], [38.8, 93.3], [38.8, -76.7], [38.8, 60.8], [38.8, 113.3], [38.8, -109.1], [38.8, 28.4], [38.8, 80.9], [38.8, -4.1], [38.8, -89.1], [38.8, 48.4], [38.8, 100.9], [38.8, -121.5], [38.8, 16], [38.8, 68.5], [38.8, 121], [38.8, -101.5], [38.8, 36], [38.8, 88.5], [38.8, 141.1], [38.8, -81.4], [38.8, 56.1], [38.8, 108.6], [38.8, -113.9], [38.8, 23.6], [38.8, 76.2], [38.8, -8.8], [38.7, -93.8], [38.7, 43.7], [38.7, 96.2], [38.7, 63.8], [38.7, 116.3], [38.7, -106.2], [38.7, 31.3], [38.7, 83.8], [38.7, -1.2], [38.7, -86.2], [38.7, 51.4], [38.7, 103.9], [38.7, -118.6], [38.7, 71.4], [38.7, 123.9], [38.7, -98.6], [38.7, 39], [38.7, 91.5], [38.7, -78.5], [38.7, 59], [38.7, 111.5], [38.7, -111], [38.7, 26.6], [38.7, 79.1], [38.7, -5.9], [38.6, -90.9], [38.6, 46.6], [38.6, 99.1], [38.6, 66.7], [38.6, 119.2], [38.6, -103.3], [38.6, 34.2], [38.6, 86.7], [38.6, 139.3], [38.6, -83.2], [38.6, 54.3], [38.6, 106.8], [38.6, -115.7], [38.6, 21.8], [38.6, 74.3], [38.6, 126.9], [38.6, -95.6], [38.6, 41.9], [38.6, 94.4], [38.6, -75.6], [38.6, 61.9], [38.6, 114.5], [38.6, -108], [38.6, 29.5], [38.6, 82], [38.5, -3], [38.5, -88], [38.5, 49.5], [38.5, 102.1], [38.5, -120.4], [38.5, 69.6], [38.5, -100.4], [38.5, 37.1], [38.5, 89.7], [38.5, -80.3], [38.5, 57.2], [38.5, 109.7], [38.5, -112.8], [38.5, 77.3], [38.5, -7.7], [38.5, -92.7], [38.5, 44.8], [38.5, 97.3], [38.5, 64.9], [38.5, 117.4], [38.5, -105.1], [38.5, 32.4], [38.5, 84.9], [38.4, -85], [38.4, 52.5], [38.4, 105], [38.4, -117.5], [38.4, 72.5], [38.4, 125.1], [38.4, -97.4], [38.4, 40.1], [38.4, 92.6], [38.4, -77.4], [38.4, 60.1], [38.4, 112.7], [38.4, -109.8], [38.4, 27.7], [38.4, 80.2], [38.4, -4.8], [38.4, -89.8], [38.4, 47.7], [38.4, 100.3], [38.4, -122.2], [38.4, 67.8], [38.4, -102.2], [38.4, 35.3], [38.4, 87.9], [38.3, 140.4], [38.3, -82.1], [38.3, 55.4], [38.3, 107.9], [38.3, -114.6], [38.3, 22.9], [38.3, 75.5], [38.3, -94.5], [38.3, 43], [38.3, 95.5], [38.3, 63.1], [38.3, 115.6], [38.3, -106.9], [38.3, 30.6], [38.3, 83.1], [38.3, -1.9], [38.3, -86.8], [38.3, 50.7], [38.3, 103.2], [38.3, -119.3], [38.3, 70.7], [38.3, 123.2], [38.3, -99.2], [38.3, 38.3], [38.3, 90.8], [38.2, -79.2], [38.2, 58.3], [38.2, 110.8], [38.2, -111.6], [38.2, 78.4], [38.2, -6.6], [38.2, -91.6], [38.2, 45.9], [38.2, 98.4], [38.2, 66], [38.2, 118.5], [38.2, -104], [38.2, 33.5], [38.2, 86], [38.2, -83.9], [38.2, 53.6], [38.2, 106.1], [38.2, -116.4], [38.2, 21.1], [38.2, 73.7], [38.2, 126.2], [38.2, -96.3], [38.2, 41.2], [38.2, 93.7], [38.1, -76.3], [38.1, 61.3], [38.1, 113.8], [38.1, -108.7], [38.1, 28.8], [38.1, 81.3], [38.1, -3.7], [38.1, -88.7], [38.1, 48.9], [38.1, 101.4], [38.1, -121.1], [38.1, 68.9], [38.1, -101.1], [38.1, 36.5], [38.1, 89], [38.1, 141.5], [38.1, -81], [38.1, 56.5], [38.1, 109], [38.1, -113.5], [38.1, 76.6], [38.1, -8.4], [38.1, -93.4], [38.1, 44.1], [38.1, 96.6], [38, 64.2], [38, 116.7], [38, -105.8], [38, 31.7], [38, 84.2], [38, -85.7], [38, 51.8], [38, 104.3], [38, -118.2], [38, 71.8], [38, 124.4], [38, -98.1], [38, 39.4], [38, 91.9], [38, -78.1], [38, 59.4], [38, 112], [38, -110.5], [38, 27], [38, 79.5], [38, -5.5], [38, -90.5], [38, 47], [38, 99.6], [37.9, 67.1], [37.9, -102.9], [37.9, 34.6], [37.9, 87.2], [37.9, 139.7], [37.9, -82.8], [37.9, 54.7], [37.9, 107.2], [37.9, -115.3], [37.9, 22.2], [37.9, 74.8], [37.9, 127.3], [37.9, -95.2], [37.9, 42.3], [37.9, 94.8], [37.9, -75.1], [37.9, 62.4], [37.9, 114.9], [37.9, -107.6], [37.9, 29.9], [37.9, 82.4], [37.9, -2.6], [37.9, -87.5], [37.9, 50], [37.9, 102.5], [37.8, -120], [37.8, 70], [37.8, -99.9], [37.8, 37.6], [37.8, 90.1], [37.8, -79.9], [37.8, 57.6], [37.8, 110.2], [37.8, -112.3], [37.8, 77.7], [37.8, -7.3], [37.8, -92.3], [37.8, 45.2], [37.8, 97.8], [37.8, 65.3], [37.8, 117.8], [37.8, -104.7], [37.8, 32.8], [37.8, 85.4], [37.8, -84.6], [37.8, 52.9], [37.8, 105.4], [37.7, -117.1], [37.7, 73], [37.7, 125.5], [37.7, -97], [37.7, 40.5], [37.7, 93], [37.7, -76.9], [37.7, 60.6], [37.7, 113.1], [37.7, -109.4], [37.7, 28.1], [37.7, 80.6], [37.7, -4.4], [37.7, -89.3], [37.7, 48.2], [37.7, 100.7], [37.7, -121.8], [37.7, 68.2], [37.7, -101.7], [37.7, 35.8], [37.7, 88.3], [37.7, 140.8], [37.7, -81.7], [37.7, 55.8], [37.7, 108.3], [37.7, -114.1], [37.6, 75.9], [37.6, -94.1], [37.6, 43.4], [37.6, 95.9], [37.6, 63.5], [37.6, 116], [37.6, -106.5], [37.6, 31], [37.6, 83.5], [37.6, -86.4], [37.6, 51.1], [37.6, 103.6], [37.6, -118.9], [37.6, 71.2], [37.6, -98.8], [37.6, 38.7], [37.6, 91.2], [37.6, -78.8], [37.6, 58.8], [37.6, 111.3], [37.6, -111.2], [37.5, 78.8], [37.5, -6.2], [37.5, -91.2], [37.5, 46.4], [37.5, 98.9], [37.5, 66.4], [37.5, -103.6], [37.5, 34], [37.5, 86.5], [37.5, 139], [37.5, -83.5], [37.5, 54], [37.5, 106.5], [37.5, -116], [37.5, 74.1], [37.5, 126.6], [37.5, -95.9], [37.5, 41.6], [37.5, 94.1], [37.5, -75.8], [37.5, 61.7], [37.5, 114.2], [37.5, -108.3], [37.4, 29.2], [37.4, 81.7], [37.4, -3.2], [37.4, -88.2], [37.4, 49.3], [37.4, 101.8], [37.4, -120.7], [37.4, 69.3], [37.4, -100.6], [37.4, 36.9], [37.4, 89.4], [37.4, -80.6], [37.4, 56.9], [37.4, 109.5], [37.4, -113], [37.4, 77], [37.4, -8], [37.4, -93], [37.4, 44.5], [37.4, 97.1], [37.4, 64.6], [37.4, 117.1], [37.4, -105.4], [37.4, 32.1], [37.3, 84.7], [37.3, -85.3], [37.3, 52.2], [37.3, 104.7], [37.3, -117.8], [37.3, 72.3], [37.3, 124.8], [37.3, -97.7], [37.3, 39.8], [37.3, 92.3], [37.3, -77.6], [37.3, 59.9], [37.3, 112.4], [37.3, -110.1], [37.3, 27.4], [37.3, 79.9], [37.3, -5.1], [37.3, -90], [37.3, 47.5], [37.3, 100], [37.3, 67.5], [37.3, -102.4], [37.3, 35.1], [37.2, 87.6], [37.2, 140.1], [37.2, -82.4], [37.2, 55.1], [37.2, 107.7], [37.2, -114.8], [37.2, 75.2], [37.2, -94.8], [37.2, 42.7], [37.2, 95.3], [37.2, 62.8], [37.2, 115.3], [37.2, -107.2], [37.2, 30.3], [37.2, 82.9], [37.2, -87.1], [37.2, 50.4], [37.2, 102.9], [37.2, -119.6], [37.2, 70.5], [37.2, -99.5], [37.2, 38], [37.1, 90.5], [37.1, -79.4], [37.1, 58.1], [37.1, 110.6], [37.1, -111.9], [37.1, 78.1], [37.1, -6.9], [37.1, -91.8], [37.1, 45.7], [37.1, 98.2], [37.1, 65.7], [37.1, 118.2], [37.1, -104.2], [37.1, 33.3], [37.1, 85.8], [37.1, 138.3], [37.1, -84.2], [37.1, 53.3], [37.1, 105.8], [37.1, -116.6], [37.1, 73.4], [37.1, 125.9], [37.1, -96.6], [37.1, 40.9], [37, 93.4], [37, -76.5], [37, 61], [37, 113.5], [37, -109], [37, 28.5], [37, 81], [37, -3.9], [37, -88.9], [37, 48.6], [37, 101.1], [37, -121.4], [37, 68.7], [37, -101.3], [37, 36.2], [37, 88.7], [37, 3.7], [37, 141.2], [37, -81.3], [37, 56.3], [37, 108.8], [37, -113.7], [37, 76.3], [37, -8.7], [37, -93.7], [37, 43.9], [36.9, 96.4], [36.9, 63.9], [36.9, 116.4], [36.9, -106.1], [36.9, 31.5], [36.9, 84], [36.9, 136.5], [36.9, -86], [36.9, 51.5], [36.9, 104], [36.9, -118.5], [36.9, 71.6], [36.9, -98.4], [36.9, 39.1], [36.9, 91.6], [36.9, 6.7], [36.9, -78.3], [36.9, 59.2], [36.9, 111.7], [36.9, -110.8], [36.9, 79.2], [36.9, -5.7], [36.9, -90.7], [36.9, 46.8], [36.9, 99.3], [36.8, 66.8], [36.8, -103.1], [36.8, 34.4], [36.8, 86.9], [36.8, 1.9], [36.8, 139.4], [36.8, -83.1], [36.8, 54.4], [36.8, 107], [36.8, -115.5], [36.8, 74.5], [36.8, 127], [36.8, -95.5], [36.8, 42], [36.8, 94.6], [36.8, 9.6], [36.8, -75.4], [36.8, 62.1], [36.8, 114.6], [36.8, -107.9], [36.8, 29.6], [36.8, 82.2], [36.8, -87.8], [36.8, 49.7], [36.8, 102.2], [36.8, -120.3], [36.7, 69.8], [36.7, -100.2], [36.7, 37.3], [36.7, 89.8], [36.7, 4.8], [36.7, -80.1], [36.7, 57.4], [36.7, 109.9], [36.7, -112.6], [36.7, 77.4], [36.7, -7.6], [36.7, -92.5], [36.7, 45], [36.7, 97.5], [36.7, 65], [36.7, 117.6], [36.7, -104.9], [36.7, 32.6], [36.7, 85.1], [36.7, 0.1], [36.7, 137.6], [36.7, -84.9], [36.7, 52.6], [36.7, 105.2], [36.7, -117.3], [36.6, 72.7], [36.6, 125.2], [36.6, -97.3], [36.6, 40.2], [36.6, 92.8], [36.6, 7.8], [36.6, -77.2], [36.6, 60.3], [36.6, 112.8], [36.6, -109.7], [36.6, 80.4], [36.6, -4.6], [36.6, -89.6], [36.6, 47.9], [36.6, 100.4], [36.6, 68], [36.6, -102], [36.6, 35.5], [36.6, 88], [36.6, 3], [36.6, 140.5], [36.6, -81.9], [36.6, 55.6], [36.6, 108.1], [36.6, -114.4], [36.5, 75.6], [36.5, -94.3], [36.5, 43.2], [36.5, 95.7], [36.5, 63.2], [36.5, 115.7], [36.5, -106.7], [36.5, 30.8], [36.5, 83.3], [36.5, 135.8], [36.5, -86.7], [36.5, 50.8], [36.5, 103.3], [36.5, -119.1], [36.5, 70.9], [36.5, -99.1], [36.5, 38.4], [36.5, 90.9], [36.5, 6], [36.5, -79], [36.5, 58.5], [36.5, 111], [36.5, -111.5], [36.4, 78.5], [36.4, -6.4], [36.4, -91.4], [36.4, 46.1], [36.4, 98.6], [36.4, 66.2], [36.4, 118.7], [36.4, -103.8], [36.4, 33.7], [36.4, 86.2], [36.4, 1.2], [36.4, 138.7], [36.4, -83.8], [36.4, 53.8], [36.4, 106.3], [36.4, -116.2], [36.4, 73.8], [36.4, 126.3], [36.4, -96.2], [36.4, 41.4], [36.4, 93.9], [36.4, 8.9], [36.4, -76.1], [36.4, 61.4], [36.4, 113.9], [36.4, -108.6], [36.4, 29], [36.4, 81.5], [36.3, -88.5], [36.3, 49], [36.3, 101.5], [36.3, -121], [36.3, 69.1], [36.3, -100.9], [36.3, 36.6], [36.3, 89.1], [36.3, 4.2], [36.3, -80.8], [36.3, 56.7], [36.3, 109.2], [36.3, -113.3], [36.3, 76.7], [36.3, -93.2], [36.3, 44.3], [36.3, 96.8], [36.3, 64.3], [36.3, 116.9], [36.3, -105.6], [36.3, 31.9], [36.3, 84.4], [36.3, -0.6], [36.2, 136.9], [36.2, -85.6], [36.2, 51.9], [36.2, 104.5], [36.2, -118], [36.2, 72], [36.2, -98], [36.2, 39.5], [36.2, 92.1], [36.2, 7.1], [36.2, -77.9], [36.2, 59.6], [36.2, 112.1], [36.2, -110.4], [36.2, 79.7], [36.2, -5.3], [36.2, -90.3], [36.2, 47.2], [36.2, 99.7], [36.2, 67.3], [36.2, -102.7], [36.2, 34.8], [36.2, 87.3], [36.2, 2.3], [36.2, 139.9], [36.1, -82.6], [36.1, 54.9], [36.1, 107.4], [36.1, -115.1], [36.1, 74.9], [36.1, -95], [36.1, 42.5], [36.1, 95], [36.1, 10], [36.1, 62.5], [36.1, 115.1], [36.1, -107.4], [36.1, 30.1], [36.1, 82.6], [36.1, -2.4], [36.1, 135.1], [36.1, -87.4], [36.1, 50.1], [36.1, 102.7], [36.1, -119.8], [36.1, 70.2], [36.1, -99.8], [36.1, 37.7], [36.1, 90.3], [36.1, 5.3], [36.1, -79.7], [36, 57.8], [36, 110.3], [36, -112.2], [36, 77.9], [36, -92.1], [36, 45.4], [36, 97.9], [36, 65.5], [36, 118], [36, -104.5], [36, 33], [36, 85.5], [36, 0.5], [36, 138], [36, -84.4], [36, 53.1], [36, 105.6], [36, -116.9], [36, 73.1], [36, -96.8], [36, 40.7], [36, 93.2], [36, 8.2], [36, -76.8], [36, 60.7], [35.9, 113.2], [35.9, -109.2], [35.9, 80.8], [35.9, -4.2], [35.9, -89.2], [35.9, 48.3], [35.9, 100.8], [35.9, 68.4], [35.9, -101.6], [35.9, 88.4], [35.9, 3.5], [35.9, -81.5], [35.9, 56], [35.9, 108.5], [35.9, -114], [35.9, 76], [35.9, -93.9], [35.9, 43.6], [35.9, 96.1], [35.9, 63.7], [35.8, 116.2], [35.8, -106.3], [35.8, 83.7], [35.8, -1.3], [35.8, 136.2], [35.8, -86.3], [35.8, 51.3], [35.8, 103.8], [35.8, -118.7], [35.8, 71.3], [35.8, -98.7], [35.8, 38.9], [35.8, 91.4], [35.8, 6.4], [35.8, -78.6], [35.8, 58.9], [35.8, 111.4], [35.8, -111.1], [35.8, 79], [35.8, -6], [35.8, -91], [35.8, 46.5], [35.8, 99], [35.8, 66.6], [35.8, 119.1], [35.8, -103.4], [35.7, 86.6], [35.7, 1.7], [35.7, 139.2], [35.7, -83.3], [35.7, 54.2], [35.7, 106.7], [35.7, -115.8], [35.7, 74.2], [35.7, 126.8], [35.7, -95.7], [35.7, 41.8], [35.7, 94.3], [35.7, 9.3], [35.7, 61.8], [35.7, 114.4], [35.7, -108.1], [35.7, 81.9], [35.7, -3.1], [35.7, 134.4], [35.7, -88.1], [35.7, 49.4], [35.7, 102], [35.7, -120.5], [35.7, 69.5], [35.7, -100.5], [35.7, 37], [35.6, 89.6], [35.6, 4.6], [35.6, -80.4], [35.6, 57.1], [35.6, 109.6], [35.6, -112.9], [35.6, 77.2], [35.6, -92.8], [35.6, 44.7], [35.6, 97.2], [35.6, 64.8], [35.6, 117.3], [35.6, -105.2], [35.6, 84.8], [35.6, -0.2], [35.6, 137.4], [35.6, -85.1], [35.6, 52.4], [35.6, 104.9], [35.6, -117.6], [35.6, 72.4], [35.6, -97.5], [35.6, 40], [35.5, 92.5], [35.5, 7.5], [35.5, -77.5], [35.5, 60], [35.5, 112.6], [35.5, -109.9], [35.5, 80.1], [35.5, -4.9], [35.5, -89.9], [35.5, 47.6], [35.5, 100.2], [35.5, 67.7], [35.5, -102.3], [35.5, 87.8], [35.5, 2.8], [35.5, -82.2], [35.5, 55.3], [35.5, 107.8], [35.5, -114.7], [35.5, 75.4], [35.5, -94.6], [35.5, 42.9], [35.5, 95.4], [35.4, 63], [35.4, 115.5], [35.4, -107], [35.4, 83], [35.4, -2], [35.4, 135.5], [35.4, -86.9], [35.4, 50.6], [35.4, 103.1], [35.4, -119.4], [35.4, 70.6], [35.4, -99.3], [35.4, 38.2], [35.4, 90.7], [35.4, 5.7], [35.4, -79.3], [35.4, 58.2], [35.4, 110.7], [35.4, -111.7], [35.4, 78.3], [35.4, -91.7], [35.4, 45.8], [35.4, 98.3], [35.3, 65.9], [35.3, 118.4], [35.3, -104.1], [35.3, 85.9], [35.3, 1], [35.3, 138.5], [35.3, -84], [35.3, 53.5], [35.3, 106], [35.3, -116.5], [35.3, 73.5], [35.3, -96.4], [35.3, 41.1], [35.3, 93.6], [35.3, 8.6], [35.3, -76.4], [35.3, 61.2], [35.3, 113.7], [35.3, -108.8], [35.3, 81.2], [35.3, -3.8], [35.3, 133.7], [35.3, -88.8], [35.3, 48.8], [35.3, 101.3], [35.3, 68.8], [35.2, -101.2], [35.2, 36.4], [35.2, 88.9], [35.2, 3.9], [35.2, -81.1], [35.2, 56.4], [35.2, 108.9], [35.2, -113.6], [35.2, 76.5], [35.2, -93.5], [35.2, 44], [35.2, 96.5], [35.2, 64.1], [35.2, 116.6], [35.2, -105.9], [35.2, 84.1], [35.2, -0.8], [35.2, 136.7], [35.2, -85.8], [35.2, 51.7], [35.2, 104.2], [35.2, -118.3], [35.2, 71.7], [35.1, -98.2], [35.1, 39.3], [35.1, 91.8], [35.1, 6.8], [35.1, -78.2], [35.1, 59.3], [35.1, 111.9], [35.1, -110.6], [35.1, 79.4], [35.1, -5.6], [35.1, -90.6], [35.1, 46.9], [35.1, 99.5], [35.1, 67], [35.1, 119.5], [35.1, -103], [35.1, 87.1], [35.1, 2.1], [35.1, -82.9], [35.1, 54.6], [35.1, 107.1], [35.1, -115.4], [35.1, 74.7], [35.1, -95.3], [35, 42.2], [35, 94.7], [35, 9.7], [35, 62.3], [35, 114.8], [35, -107.7], [35, 82.3], [35, -2.7], [35, 134.9], [35, -87.6], [35, 49.9], [35, 102.4], [35, 69.9], [35, -100], [35, 37.5], [35, 90], [35, 5], [35, -80], [35, 57.5], [35, 110.1], [35, -112.4], [35, 77.6], [35, -92.4], [35, 45.1], [34.9, 97.7], [34.9, 65.2], [34.9, 117.7], [34.9, -104.8], [34.9, 85.3], [34.9, 0.3], [34.9, 137.8], [34.9, -84.7], [34.9, 52.8], [34.9, 105.3], [34.9, -117.2], [34.9, 72.9], [34.9, -97.1], [34.9, 40.4], [34.9, 92.9], [34.9, 7.9], [34.9, -77], [34.9, 60.5], [34.9, 113], [34.9, -109.5], [34.9, 80.5], [34.9, -4.5], [34.9, 133], [34.9, -89.4], [34.9, 48.1], [34.9, 100.6], [34.8, 68.1], [34.8, -101.8], [34.8, 35.7], [34.8, 88.2], [34.8, 3.2], [34.8, -81.8], [34.8, 55.7], [34.8, 108.2], [34.8, -114.2], [34.8, 75.8], [34.8, -94.2], [34.8, 43.3], [34.8, 95.8], [34.8, 63.4], [34.8, 115.9], [34.8, -106.6], [34.8, 83.4], [34.8, -1.5], [34.8, 136], [34.8, -86.5], [34.8, 51], [34.8, 103.5], [34.8, -119], [34.7, 71], [34.7, -98.9], [34.7, 38.6], [34.7, 91.1], [34.7, 6.1], [34.7, -78.9], [34.7, 58.7], [34.7, 111.2], [34.7, -111.3], [34.7, 78.7], [34.7, -6.3], [34.7, -91.3], [34.7, 46.3], [34.7, 98.8], [34.7, 66.3], [34.7, 118.8], [34.7, -103.7], [34.7, 86.4], [34.7, 1.4], [34.7, -83.6], [34.7, 53.9], [34.7, 106.4], [34.7, -116.1], [34.7, 74], [34.6, -96], [34.6, 41.5], [34.6, 94], [34.6, 9.1], [34.6, 61.6], [34.6, 114.1], [34.6, -108.4], [34.6, 81.6], [34.6, -3.3], [34.6, 134.2], [34.6, -88.3], [34.6, 49.2], [34.6, 101.7], [34.6, 69.2], [34.6, -100.7], [34.6, 36.8], [34.6, 89.3], [34.6, 4.3], [34.6, -80.7], [34.6, 56.8], [34.6, 109.4], [34.6, -113.1], [34.6, 76.9], [34.5, -93.1], [34.5, 44.4], [34.5, 97], [34.5, 64.5], [34.5, 117], [34.5, -105.5], [34.5, 84.6], [34.5, -0.4], [34.5, 137.1], [34.5, -85.4], [34.5, 52.1], [34.5, 104.6], [34.5, -117.9], [34.5, 72.2], [34.5, -97.8], [34.5, 39.7], [34.5, 92.2], [34.5, 7.2], [34.5, -77.7], [34.5, 59.8], [34.5, 112.3], [34.5, -110.2], [34.5, 79.8], [34.5, -5.2], [34.5, 132.4], [34.5, -90.1], [34.5, 47.4], [34.4, 99.9], [34.4, 67.4], [34.4, 120], [34.4, -102.5], [34.4, 87.5], [34.4, 2.5], [34.4, -82.5], [34.4, 55], [34.4, 107.6], [34.4, -114.9], [34.4, 75.1], [34.4, -94.9], [34.4, 42.6], [34.4, 95.2], [34.4, 10.2], [34.4, 62.7], [34.4, 115.2], [34.4, -107.3], [34.4, 82.8], [34.4, -2.2], [34.4, 135.3], [34.4, -87.2], [34.4, 50.3], [34.4, 102.8], [34.3, 70.4], [34.3, -99.6], [34.3, 37.9], [34.3, 90.4], [34.3, 5.4], [34.3, -79.5], [34.3, 58], [34.3, 110.5], [34.3, -112], [34.3, 78], [34.3, -7], [34.3, -91.9], [34.3, 45.6], [34.3, 98.1], [34.3, 65.6], [34.3, 118.1], [34.3, -104.3], [34.3, 85.7], [34.3, 0.7], [34.3, -84.3], [34.3, 53.2], [34.3, 105.7], [34.3, -116.7], [34.2, 73.3], [34.2, -96.7], [34.2, 40.8], [34.2, 93.3], [34.2, 8.4], [34.2, 60.9], [34.2, 113.4], [34.2, -109.1], [34.2, 80.9], [34.2, -4], [34.2, 133.5], [34.2, -89], [34.2, 48.5], [34.2, 101], [34.2, 68.5], [34.2, -101.4], [34.2, 36.1], [34.2, 88.6], [34.2, 3.6], [34.2, -81.4], [34.2, 56.2], [34.2, 108.7], [34.2, -113.8], [34.2, 76.2], [34.1, -93.8], [34.1, 43.8], [34.1, 96.3], [34.1, 63.8], [34.1, 116.3], [34.1, -106.2], [34.1, 83.9], [34.1, -1.1], [34.1, -86.1], [34.1, 51.4], [34.1, 103.9], [34.1, -118.6], [34.1, 71.5], [34.1, -98.5], [34.1, 39], [34.1, 91.5], [34.1, 6.6], [34.1, -78.4], [34.1, 59.1], [34.1, 111.6], [34.1, -110.9], [34.1, 79.1], [34.1, -5.8], [34.1, 131.7], [34, -90.8], [34, 46.7], [34, 99.2], [34, 66.7], [34, 119.3], [34, -103.2], [34, 86.8], [34, 1.8], [34, -83.2], [34, 54.3], [34, 106.9], [34, -115.6], [34, 74.4], [34, -95.6], [34, 41.9], [34, 94.5], [34, 9.5], [34, 62], [34, 114.5], [34, -108], [34, 82.1], [34, -2.9], [34, 134.6], [34, -87.9], [34, 49.6], [33.9, 102.1], [33.9, 69.7], [33.9, -100.3], [33.9, 37.2], [33.9, 89.7], [33.9, 4.7], [33.9, -80.2], [33.9, 57.3], [33.9, 109.8], [33.9, -112.7], [33.9, 77.3], [33.9, -92.6], [33.9, 44.9], [33.9, 97.4], [33.9, 64.9], [33.9, 117.5], [33.9, -105], [33.9, 85], [33.9, 0], [33.9, -85], [33.9, 52.5], [33.9, 105.1], [33.9, -117.4], [33.8, 72.6], [33.8, -97.4], [33.8, 40.1], [33.8, 92.7], [33.8, 7.7], [33.8, 60.2], [33.8, 112.7], [33.8, -109.8], [33.8, 80.3], [33.8, -4.7], [33.8, 132.8], [33.8, -89.7], [33.8, 47.8], [33.8, 100.3], [33.8, 67.9], [33.8, 120.4], [33.8, -102.1], [33.8, 35.4], [33.8, 87.9], [33.8, 2.9], [33.8, -82], [33.8, 55.5], [33.8, 108], [33.8, -114.5], [33.7, 75.5], [33.7, -94.4], [33.7, 43.1], [33.7, 95.6], [33.7, 10.6], [33.7, 63.1], [33.7, 115.6], [33.7, -106.8], [33.7, 83.2], [33.7, -1.8], [33.7, -86.8], [33.7, 50.7], [33.7, 103.2], [33.7, 70.8], [33.7, -99.2], [33.7, 38.3], [33.7, 90.8], [33.7, 5.9], [33.7, -79.1], [33.7, 58.4], [33.7, 110.9], [33.7, -111.6], [33.7, 78.4], [33.7, -6.5], [33.6, -91.5], [33.6, 46], [33.6, 98.5], [33.6, 66], [33.6, 118.6], [33.6, -103.9], [33.6, 86.1], [33.6, 1.1], [33.6, -83.9], [33.6, 53.7], [33.6, 106.2], [33.6, -116.3], [33.6, 73.7], [33.6, -96.3], [33.6, 41.3], [33.6, 93.8], [33.6, 8.8], [33.6, 61.3], [33.6, 113.8], [33.6, -108.7], [33.6, 81.4], [33.6, -3.6], [33.6, 133.9], [33.6, -88.6], [33.6, 48.9], [33.5, 101.4], [33.5, 69], [33.5, -101], [33.5, 36.5], [33.5, 89], [33.5, 4.1], [33.5, -80.9], [33.5, 56.6], [33.5, 109.1], [33.5, -113.4], [33.5, 76.6], [33.5, -93.3], [33.5, 44.2], [33.5, 96.7], [33.5, 64.2], [33.5, 116.8], [33.5, -105.7], [33.5, 84.3], [33.5, -0.7], [33.5, -85.7], [33.5, 51.8], [33.5, 104.4], [33.5, -118.1], [33.4, 71.9], [33.4, -98.1], [33.4, 39.4], [33.4, 92], [33.4, 7], [33.4, -78], [33.4, 59.5], [33.4, 112], [33.4, -110.5], [33.4, 79.6], [33.4, -5.4], [33.4, 132.1], [33.4, -90.4], [33.4, 47.1], [33.4, 99.6], [33.4, 67.2], [33.4, 119.7], [33.4, -102.8], [33.4, 87.2], [33.4, 2.2], [33.4, -82.7], [33.4, 54.8], [33.4, 107.3], [33.4, -115.2], [33.3, 74.8], [33.3, -95.1], [33.3, 42.4], [33.3, 94.9], [33.3, 9.9], [33.3, 62.4], [33.3, 115], [33.3, -107.5], [33.3, 82.5], [33.3, -2.5], [33.3, -87.5], [33.3, 50], [33.3, 102.6], [33.3, 70.1], [33.3, -99.9], [33.3, 37.6], [33.3, 90.2], [33.3, 5.2], [33.3, -79.8], [33.3, 57.7], [33.3, 110.2], [33.3, -112.3], [33.3, 77.8], [33.3, -7.2], [33.2, -92.2], [33.2, 45.3], [33.2, 97.8], [33.2, 65.4], [33.2, 117.9], [33.2, -104.6], [33.2, 85.4], [33.2, 0.4], [33.2, -84.5], [33.2, 53], [33.2, 105.5], [33.2, -117], [33.2, 73], [33.2, -96.9], [33.2, 40.6], [33.2, 93.1], [33.2, 8.1], [33.2, 60.6], [33.2, 113.1], [33.2, -109.3], [33.2, 80.7], [33.2, -4.3], [33.2, 133.2], [33.2, -89.3], [33.2, 48.2], [33.1, 100.7], [33.1, 68.3], [33.1, -101.7], [33.1, 35.8], [33.1, 88.3], [33.1, 3.4], [33.1, -81.6], [33.1, 55.9], [33.1, 108.4], [33.1, -114.1], [33.1, 75.9], [33.1, -94], [33.1, 43.5], [33.1, 96], [33.1, 63.5], [33.1, 116.1], [33.1, -106.4], [33.1, 83.6], [33.1, -1.4], [33.1, -86.4], [33.1, 51.2], [33.1, 103.7], [33, 71.2], [33, -98.8], [33, 38.8], [33, 91.3], [33, 6.3], [33, -78.7], [33, 58.8], [33, 111.3], [33, -111.2], [33, 78.9], [33, -6.1], [33, 131.4], [33, -91.1], [33, 46.4], [33, 98.9], [33, 66.5], [33, 119], [33, -103.5], [33, 86.5], [33, 1.6], [33, -83.4], [33, 54.1], [33, 106.6], [33, -115.9], [33, 74.1], [32.9, -95.8], [32.9, 41.7], [32.9, 94.2], [32.9, 9.2], [32.9, 61.7], [32.9, 114.3], [32.9, -108.2], [32.9, 81.8], [32.9, -3.2], [32.9, -88.2], [32.9, 49.3], [32.9, 101.9], [32.9, 69.4], [32.9, -100.6], [32.9, 36.9], [32.9, 89.5], [32.9, 4.5], [32.9, -80.5], [32.9, 57], [32.9, 109.5], [32.9, -113], [32.9, 77.1], [32.9, -7.9], [32.8, -92.9], [32.8, 44.6], [32.8, 97.1], [32.8, 12.1], [32.8, 64.7], [32.8, 117.2], [32.8, -105.3], [32.8, 84.7], [32.8, -0.3], [32.8, -85.2], [32.8, 52.3], [32.8, 104.8], [32.8, 72.3], [32.8, -97.6], [32.8, 39.9], [32.8, 92.4], [32.8, 7.4], [32.8, 59.9], [32.8, 112.5], [32.8, -110], [32.8, 80], [32.8, -5], [32.8, 132.5], [32.8, -90], [32.8, 47.5], [32.7, 100.1], [32.7, 67.6], [32.7, 120.1], [32.7, -102.4], [32.7, 35.1], [32.7, 87.7], [32.7, 2.7], [32.7, -82.3], [32.7, 55.2], [32.7, 107.7], [32.7, -114.8], [32.7, 75.3], [32.7, -94.7], [32.7, 42.8], [32.7, 95.3], [32.7, 10.3], [32.7, 62.9], [32.7, 115.4], [32.7, -107.1], [32.7, 82.9], [32.7, -2.1], [32.7, -87], [32.7, 50.5], [32.7, 103], [32.6, 70.5], [32.6, -99.4], [32.6, 38.1], [32.6, 90.6], [32.6, 5.6], [32.6, -79.4], [32.6, 58.1], [32.6, 110.6], [32.6, -111.8], [32.6, 78.2], [32.6, -6.8], [32.6, -91.8], [32.6, 45.7], [32.6, 98.2], [32.6, 13.3], [32.6, 65.8], [32.6, 118.3], [32.6, -104.2], [32.6, 85.8], [32.6, 0.9], [32.6, -84.1], [32.6, 53.4], [32.6, 105.9], [32.6, -116.6], [32.6, 73.4], [32.5, -96.5], [32.5, 41], [32.5, 93.5], [32.5, 8.5], [32.5, 61], [32.5, 113.6], [32.5, -108.9], [32.5, 81.1], [32.5, -3.9], [32.5, -88.9], [32.5, 48.7], [32.5, 101.2], [32.5, 68.7], [32.5, -101.3], [32.5, 36.3], [32.5, 88.8], [32.5, 3.8], [32.5, -81.2], [32.5, 56.3], [32.5, 108.8], [32.5, -113.7], [32.5, 76.4], [32.5, -8.6], [32.5, -93.6], [32.5, 43.9], [32.4, 96.4], [32.4, 11.5], [32.4, 64], [32.4, 116.5], [32.4, -106], [32.4, 84], [32.4, -0.9], [32.4, -85.9], [32.4, 51.6], [32.4, 104.1], [32.4, 71.6], [32.4, -98.3], [32.4, 39.2], [32.4, 91.7], [32.4, 6.7], [32.4, 59.2], [32.4, 111.8], [32.4, -110.7], [32.4, 79.3], [32.4, -5.7], [32.4, 131.8], [32.4, -90.7], [32.4, 46.8], [32.4, 99.4], [32.3, 14.4], [32.3, 66.9], [32.3, 119.4], [32.3, -103.1], [32.3, 87], [32.3, 2], [32.3, -83], [32.3, 54.5], [32.3, 107], [32.3, -115.5], [32.3, 74.6], [32.3, -95.4], [32.3, 42.1], [32.3, 94.6], [32.3, 9.6], [32.3, 62.2], [32.3, 114.7], [32.3, -107.8], [32.3, 82.2], [32.3, -2.8], [32.3, -87.7], [32.3, 49.8], [32.3, 102.3], [32.3, 17.3], [32.3, 69.8], [32.2, -100.1], [32.2, 37.4], [32.2, 89.9], [32.2, 4.9], [32.2, -80.1], [32.2, 57.4], [32.2, 110], [32.2, -112.5], [32.2, 77.5], [32.2, -7.5], [32.2, -92.5], [32.2, 45], [32.2, 97.6], [32.2, 12.6], [32.2, 65.1], [32.2, 117.6], [32.2, -104.9], [32.2, 85.2], [32.2, 0.2], [32.2, -84.8], [32.2, 52.7], [32.2, 105.2], [32.2, 72.8], [32.2, -97.2], [32.1, 40.3], [32.1, 92.8], [32.1, 7.8], [32.1, 60.4], [32.1, 112.9], [32.1, -109.6], [32.1, 80.4], [32.1, -4.6], [32.1, -89.5], [32.1, 48], [32.1, 100.5], [32.1, 15.5], [32.1, 68], [32.1, 120.5], [32.1, -101.9], [32.1, 35.6], [32.1, 88.1], [32.1, 3.1], [32.1, -81.9], [32.1, 55.6], [32.1, 108.1], [32.1, -114.3], [32.1, 75.7], [32.1, -94.3], [32.1, 43.2], [32.1, 95.7], [32, 10.8], [32, 63.3], [32, 115.8], [32, -106.7], [32, 83.3], [32, -1.6], [32, -86.6], [32, 50.9], [32, 103.4], [32, 18.4], [32, 70.9], [32, -99], [32, 38.5], [32, 91], [32, 6], [32, 58.5], [32, 111.1], [32, -111.4], [32, 78.6], [32, -6.4], [32, 131.1], [32, -91.4], [32, 46.2], [32, 98.7], [32, 13.7], [32, 66.2], [31.9, 118.7], [31.9, -103.8], [31.9, 86.3], [31.9, 1.3], [31.9, -83.7], [31.9, 53.8], [31.9, 106.3], [31.9, -116.2], [31.9, 21.4], [31.9, 73.9], [31.9, -96.1], [31.9, 41.4], [31.9, 93.9], [31.9, 9], [31.9, 61.5], [31.9, 114], [31.9, -108.5], [31.9, 81.5], [31.9, -3.4], [31.9, -88.4], [31.9, 49.1], [31.9, 101.6], [31.9, 16.6], [31.9, 69.1], [31.9, -100.8], [31.8, 36.7], [31.8, 89.2], [31.8, 4.2], [31.8, -80.8], [31.8, 56.7], [31.8, 109.3], [31.8, -113.2], [31.8, 24.3], [31.8, 76.8], [31.8, -8.2], [31.8, -93.2], [31.8, 44.3], [31.8, 96.9], [31.8, 11.9], [31.8, 64.4], [31.8, 116.9], [31.8, -105.6], [31.8, 84.5], [31.8, -0.5], [31.8, -85.5], [31.8, 52], [31.8, 104.5], [31.8, 19.5], [31.8, 72.1], [31.8, -97.9], [31.8, 39.6], [31.8, 92.1], [31.7, 7.1], [31.7, 59.7], [31.7, 112.2], [31.7, -110.3], [31.7, 79.7], [31.7, -5.3], [31.7, -90.2], [31.7, 47.3], [31.7, 99.8], [31.7, 14.8], [31.7, 67.3], [31.7, 119.9], [31.7, -102.6], [31.7, 34.9], [31.7, 87.4], [31.7, 2.4], [31.7, -82.6], [31.7, 54.9], [31.7, 107.5], [31.7, -115], [31.7, 22.5], [31.7, 75], [31.7, -95], [31.7, 42.5], [31.7, 95.1], [31.7, 10.1], [31.7, 62.6], [31.6, 115.1], [31.6, -107.4], [31.6, 82.7], [31.6, -2.3], [31.6, -87.3], [31.6, 50.2], [31.6, 102.7], [31.6, 17.7], [31.6, 70.3], [31.6, -99.7], [31.6, 37.8], [31.6, 90.3], [31.6, 5.3], [31.6, 57.9], [31.6, 110.4], [31.6, -112.1], [31.6, 25.4], [31.6, 77.9], [31.6, -7.1], [31.6, 130.4], [31.6, -92], [31.6, 45.5], [31.6, 98], [31.6, 13], [31.6, 65.5], [31.6, 118], [31.6, -104.4], [31.5, 85.6], [31.5, 0.6], [31.5, -84.4], [31.5, 53.1], [31.5, 105.6], [31.5, 20.7], [31.5, 73.2], [31.5, -96.8], [31.5, 40.7], [31.5, 93.2], [31.5, 8.3], [31.5, 60.8], [31.5, 113.3], [31.5, -109.2], [31.5, 28.3], [31.5, 80.8], [31.5, -4.1], [31.5, -89.1], [31.5, 48.4], [31.5, 100.9], [31.5, 15.9], [31.5, 68.4], [31.5, 121], [31.5, -101.5], [31.5, 36], [31.5, 88.5], [31.4, 3.5], [31.4, -81.5], [31.4, 56], [31.4, 108.6], [31.4, -113.9], [31.4, 23.6], [31.4, 76.1], [31.4, -8.9], [31.4, -93.9], [31.4, 43.7], [31.4, 96.2], [31.4, 11.2], [31.4, 63.7], [31.4, 116.2], [31.4, -106.3], [31.4, 83.8], [31.4, -1.2], [31.4, -86.2], [31.4, 51.3], [31.4, 103.8], [31.4, 18.9], [31.4, 71.4], [31.4, -98.6], [31.4, 38.9], [31.4, 91.4], [31.4, 6.5], [31.4, 59], [31.3, 111.5], [31.3, -111], [31.3, 26.5], [31.3, 79], [31.3, -5.9], [31.3, -90.9], [31.3, 46.6], [31.3, 99.1], [31.3, 14.1], [31.3, 66.6], [31.3, 119.2], [31.3, -103.3], [31.3, 34.2], [31.3, 86.7], [31.3, 1.7], [31.3, -83.3], [31.3, 54.2], [31.3, 106.8], [31.3, 21.8], [31.3, 74.3], [31.3, -95.7], [31.3, 41.8], [31.3, 94.4], [31.3, 9.4], [31.3, 61.9], [31.3, 114.4], [31.3, -108.1], [31.3, 29.4], [31.2, 82], [31.2, -3], [31.2, -88], [31.2, 49.5], [31.2, 102], [31.2, 17], [31.2, 69.6], [31.2, -100.4], [31.2, 37.1], [31.2, 89.6], [31.2, 4.6], [31.2, 57.2], [31.2, 109.7], [31.2, -112.8], [31.2, 24.7], [31.2, 77.2], [31.2, -7.8], [31.2, -92.7], [31.2, 44.8], [31.2, 97.3], [31.2, 12.3], [31.2, 64.8], [31.2, 117.4], [31.2, -105.1], [31.2, 84.9], [31.2, -0.1], [31.1, -85.1], [31.1, 52.4], [31.1, 105], [31.1, 20], [31.1, 72.5], [31.1, -97.5], [31.1, 40], [31.1, 92.6], [31.1, 7.6], [31.1, 60.1], [31.1, 112.6], [31.1, -109.9], [31.1, 27.6], [31.1, 80.2], [31.1, -4.8], [31.1, -89.8], [31.1, 47.7], [31.1, 100.2], [31.1, 15.2], [31.1, 67.8], [31.1, 120.3], [31.1, -102.2], [31.1, 35.3], [31.1, 87.8], [31.1, 2.8], [31.1, -82.1], [31.1, 55.4], [31, 107.9], [31, -114.6], [31, 22.9], [31, 75.4], [31, -9.6], [31, -94.5], [31, 43], [31, 95.5], [31, 10.5], [31, 63], [31, 115.5], [31, -106.9], [31, 30.6], [31, 83.1], [31, -1.9], [31, -86.9], [31, 50.6], [31, 103.1], [31, 18.2], [31, 70.7], [31, -99.3], [31, 38.2], [31, 90.7], [31, 5.8], [31, 58.3], [31, 110.8], [31, -111.7], [31, 25.8], [30.9, 78.3], [30.9, -6.6], [30.9, -91.6], [30.9, 45.9], [30.9, 98.4], [30.9, 13.4], [30.9, 65.9], [30.9, 118.5], [30.9, -104], [30.9, 86], [30.9, 1], [30.9, -84], [30.9, 53.5], [30.9, 106.1], [30.9, 21.1], [30.9, 73.6], [30.9, -96.4], [30.9, 41.2], [30.9, 93.7], [30.9, 8.7], [30.9, 61.2], [30.9, 113.7], [30.9, -108.8], [30.9, 28.8], [30.9, 81.3], [30.9, -3.7], [30.8, -88.7], [30.8, 48.8], [30.8, 101.3], [30.8, 16.4], [30.8, 68.9], [30.8, 121.4], [30.8, -101.1], [30.8, 36.4], [30.8, 88.9], [30.8, 4], [30.8, -81], [30.8, 56.5], [30.8, 109], [30.8, -113.5], [30.8, 24], [30.8, 76.5], [30.8, -8.4], [30.8, -93.4], [30.8, 44.1], [30.8, 96.6], [30.8, 11.6], [30.8, 64.1], [30.8, 116.7], [30.8, -105.8], [30.8, 31.7], [30.8, 84.2], [30.8, -0.8], [30.8, -85.8], [30.8, 51.7], [30.8, 104.3], [30.7, 19.3], [30.7, 71.8], [30.7, -98.2], [30.7, 39.3], [30.7, 91.9], [30.7, 6.9], [30.7, 59.4], [30.7, 111.9], [30.7, -110.6], [30.7, 26.9], [30.7, 79.5], [30.7, -5.5], [30.7, -90.5], [30.7, 47], [30.7, 99.5], [30.7, 14.5], [30.7, 67.1], [30.7, 119.6], [30.7, -102.9], [30.7, 34.6], [30.7, 87.1], [30.7, 2.1], [30.7, -82.8], [30.7, 54.7], [30.7, 107.2], [30.7, 22.2], [30.7, 74.7], [30.6, -10.3], [30.6, -95.2], [30.6, 42.3], [30.6, 94.8], [30.6, 9.8], [30.6, 62.3], [30.6, 114.9], [30.6, -107.6], [30.6, 29.9], [30.6, 82.4], [30.6, -2.6], [30.6, -87.6], [30.6, 49.9], [30.6, 102.5], [30.6, 17.5], [30.6, 70], [30.6, -100], [30.6, 37.5], [30.6, 90.1], [30.6, 5.1], [30.6, 57.6], [30.6, 110.1], [30.6, -112.4], [30.6, 25.1], [30.6, 77.7], [30.6, -7.3], [30.6, -92.3], [30.6, 45.2], [30.5, 97.7], [30.5, 12.7], [30.5, 65.3], [30.5, 117.8], [30.5, -104.7], [30.5, 85.3], [30.5, 0.3], [30.5, -84.6], [30.5, 52.9], [30.5, 105.4], [30.5, 20.4], [30.5, 72.9], [30.5, -97], [30.5, 40.5], [30.5, 93], [30.5, 8], [30.5, 60.5], [30.5, 113], [30.5, -109.4], [30.5, 28.1], [30.5, 80.6], [30.5, -4.4], [30.5, -89.4], [30.5, 48.1], [30.5, 100.6], [30.5, 15.7], [30.4, 68.2], [30.4, 120.7], [30.4, -101.8], [30.4, 35.7], [30.4, 88.2], [30.4, 3.3], [30.4, -81.7], [30.4, 55.8], [30.4, 108.3], [30.4, 23.3], [30.4, 75.8], [30.4, -9.1], [30.4, -94.1], [30.4, 43.4], [30.4, 95.9], [30.4, 10.9], [30.4, 63.4], [30.4, 116], [30.4, -106.5], [30.4, 31], [30.4, 83.5], [30.4, -1.5], [30.4, -86.5], [30.4, 51], [30.4, 103.6], [30.4, 18.6], [30.4, 71.1], [30.3, -98.9], [30.3, 38.7], [30.3, 91.2], [30.3, 6.2], [30.3, 58.7], [30.3, 111.2], [30.3, -111.3], [30.3, 26.3], [30.3, 78.8], [30.3, -6.2], [30.3, -91.2], [30.3, 46.3], [30.3, 98.8], [30.3, 13.9], [30.3, 66.4], [30.3, 118.9], [30.3, -103.6], [30.3, 86.4], [30.3, 1.5], [30.3, -83.5], [30.3, 54], [30.3, 106.5], [30.3, 21.5], [30.3, 74], [30.3, -95.9], [30.3, 41.6], [30.3, 94.1], [30.2, 9.1], [30.2, 61.6], [30.2, 114.2], [30.2, -108.3], [30.2, 29.2], [30.2, 81.7], [30.2, -3.3], [30.2, -88.3], [30.2, 49.2], [30.2, 101.8], [30.2, 16.8], [30.2, 69.3], [30.2, -100.7], [30.2, 36.8], [30.2, 89.4], [30.2, 4.4], [30.2, 56.9], [30.2, 109.4], [30.2, -113.1], [30.2, 24.4], [30.2, 77], [30.2, -8], [30.2, -93], [30.2, 44.5], [30.2, 97], [30.2, 12], [30.2, 64.6], [30.1, 117.1], [30.1, -105.4], [30.1, 32.1], [30.1, 84.6], [30.1, -0.4], [30.1, -85.3], [30.1, 52.2], [30.1, 104.7], [30.1, 19.7], [30.1, 72.2], [30.1, -97.7], [30.1, 39.8], [30.1, 92.3], [30.1, 7.3], [30.1, 59.8], [30.1, 112.4], [30.1, -110.1], [30.1, 27.4], [30.1, 79.9], [30.1, -5.1], [30.1, -90.1], [30.1, 47.4], [30.1, 100], [30.1, 15], [30.1, 67.5], [30.1, 120], [30.1, -102.5], [30.1, 35], [30, 87.6], [30, 2.6], [30, -82.4], [30, 55.1], [30, 107.6], [30, 22.6], [30, 75.2], [30, -9.8], [30, -94.8], [30, 42.7], [30, 95.2], [30, 10.2], [30, 62.8], [30, 115.3], [30, -107.2], [30, 30.3], [30, 82.8], [30, -2.2], [30, -87.1], [30, 50.4], [30, 102.9], [30, 17.9], [30, 70.4], [30, -99.5], [30, 38], [30, 90.5], [30, 5.5], [29.9, 58], [29.9, 110.5], [29.9, -111.9], [29.9, 25.6], [29.9, 78.1], [29.9, -6.9], [29.9, -91.9], [29.9, 45.6], [29.9, 98.1], [29.9, 13.2], [29.9, 65.7], [29.9, 118.2], [29.9, -104.3], [29.9, 85.7], [29.9, 0.8], [29.9, -84.2], [29.9, 53.3], [29.9, 105.8], [29.9, 20.8], [29.9, 73.3], [29.9, -96.6], [29.9, 40.9], [29.9, 93.4], [29.9, 8.4], [29.9, 60.9], [29.9, 113.5], [29.9, -109], [29.8, 28.5], [29.8, 81], [29.8, -4], [29.8, -89], [29.8, 48.5], [29.8, 101.1], [29.8, 16.1], [29.8, 68.6], [29.8, 121.1], [29.8, -101.4], [29.8, 36.2], [29.8, 88.7], [29.8, 3.7], [29.8, -81.3], [29.8, 56.2], [29.8, 108.7], [29.8, 23.8], [29.8, 76.3], [29.8, -8.7], [29.8, -93.7], [29.8, 43.8], [29.8, 96.3], [29.8, 11.4], [29.8, 63.9], [29.8, 116.4], [29.8, -106.1], [29.8, 31.4], [29.8, 83.9], [29.7, -1], [29.7, 51.5], [29.7, 104], [29.7, 19], [29.7, 71.5], [29.7, -98.4], [29.7, 39.1], [29.7, 91.6], [29.7, 6.6], [29.7, 59.1], [29.7, 111.7], [29.7, -110.8], [29.7, 26.7], [29.7, 79.2], [29.7, -5.8], [29.7, -90.8], [29.7, 46.7], [29.7, 99.3], [29.7, 14.3], [29.7, 66.8], [29.7, 119.3], [29.7, -103.2], [29.7, 86.9], [29.7, 1.9], [29.7, -83.1], [29.7, 54.4], [29.6, 106.9], [29.6, 21.9], [29.6, 74.5], [29.6, -10.5], [29.6, -95.5], [29.6, 42], [29.6, 94.5], [29.6, 9.5], [29.6, 62.1], [29.6, 114.6], [29.6, -107.9], [29.6, 29.6], [29.6, 82.1], [29.6, -2.9], [29.6, -87.8], [29.6, 49.7], [29.6, 102.2], [29.6, 17.2], [29.6, 69.7], [29.6, -100.2], [29.6, 37.3], [29.6, 89.8], [29.6, 4.8], [29.6, 57.3], [29.6, 109.9], [29.6, -112.6], [29.6, 24.9], [29.6, 77.4], [29.5, -7.6], [29.5, -92.6], [29.5, 44.9], [29.5, 97.5], [29.5, 12.5], [29.5, 65], [29.5, 117.5], [29.5, -105], [29.5, 32.5], [29.5, 85.1], [29.5, 0.1], [29.5, 52.6], [29.5, 105.1], [29.5, 20.1], [29.5, 72.7], [29.5, -97.3], [29.5, 40.2], [29.5, 92.7], [29.5, 7.7], [29.5, 60.3], [29.5, 112.8], [29.5, -109.7], [29.5, 27.8], [29.5, 80.3], [29.5, -4.7], [29.5, -89.6], [29.5, 47.9], [29.4, 100.4], [29.4, 15.4], [29.4, 67.9], [29.4, 120.4], [29.4, -102], [29.4, 35.5], [29.4, 88], [29.4, 3], [29.4, -82], [29.4, 55.5], [29.4, 108], [29.4, 23.1], [29.4, 75.6], [29.4, -9.4], [29.4, -94.4], [29.4, 43.1], [29.4, 95.6], [29.4, 10.7], [29.4, 63.2], [29.4, 115.7], [29.4, -106.8], [29.4, 30.7], [29.4, 83.2], [29.4, -1.7], [29.4, 50.8], [29.4, 103.3], [29.4, 18.3], [29.3, 70.8], [29.3, -99.1], [29.3, 38.4], [29.3, 90.9], [29.3, 5.9], [29.3, 58.4], [29.3, 111], [29.3, -111.5], [29.3, 26], [29.3, 78.5], [29.3, -6.5], [29.3, -91.5], [29.3, 46], [29.3, 98.6], [29.3, 13.6], [29.3, 66.1], [29.3, 118.6], [29.3, -103.9], [29.3, 86.2], [29.3, 1.2], [29.3, -83.8], [29.3, 53.7], [29.3, 106.2], [29.3, 21.3], [29.3, 73.8], [29.3, -11.2], [29.3, -96.2], [29.2, 41.3], [29.2, 93.8], [29.2, 8.9], [29.2, 61.4], [29.2, 113.9], [29.2, -108.6], [29.2, 28.9], [29.2, 81.4], [29.2, -3.5], [29.2, 101.5], [29.2, 16.5], [29.2, 69], [29.2, -100.9], [29.2, 36.6], [29.2, 89.1], [29.2, 4.1], [29.2, -80.9], [29.2, 56.6], [29.2, 109.2], [29.2, 24.2], [29.2, 76.7], [29.2, -8.3], [29.2, -93.3], [29.2, 44.2], [29.2, 96.8], [29.2, 11.8], [29.1, 64.3], [29.1, 116.8], [29.1, -105.7], [29.1, 31.8], [29.1, 84.4], [29.1, -0.6], [29.1, 51.9], [29.1, 104.4], [29.1, 19.4], [29.1, 72], [29.1, -98], [29.1, 39.5], [29.1, 92], [29.1, 7], [29.1, 59.6], [29.1, 112.1], [29.1, -110.4], [29.1, 27.1], [29.1, 79.6], [29.1, -5.4], [29.1, -90.3], [29.1, 47.2], [29.1, 99.7], [29.1, 14.7], [29.1, 67.2], [29.1, 119.8], [29, -102.7], [29, 34.8], [29, 87.3], [29, 2.3], [29, -82.7], [29, 54.8], [29, 107.4], [29, 22.4], [29, 74.9], [29, -10.1], [29, -95.1], [29, 42.4], [29, 95], [29, 10], [29, 62.5], [29, 115], [29, -107.5], [29, 30], [29, 82.6], [29, -2.4], [29, 50.1], [29, 102.6], [29, 17.6], [29, 70.2], [29, -99.8], [29, 37.7], [29, 90.2], [28.9, 5.2], [28.9, 57.8], [28.9, 110.3], [28.9, -112.2], [28.9, 25.3], [28.9, 77.8], [28.9, -7.2], [28.9, -92.1], [28.9, 45.4], [28.9, 97.9], [28.9, 12.9], [28.9, 65.4], [28.9, 117.9], [28.9, -104.5], [28.9, 33], [28.9, 85.5], [28.9, 0.5], [28.9, 53], [28.9, 105.5], [28.9, 20.6], [28.9, 73.1], [28.9, -11.9], [28.9, -96.9], [28.9, 40.6], [28.9, 93.1], [28.9, 8.2], [28.9, 60.7], [28.8, 113.2], [28.8, -109.3], [28.8, 28.2], [28.8, 80.7], [28.8, -4.2], [28.8, 48.3], [28.8, 100.8], [28.8, 15.8], [28.8, 68.3], [28.8, 120.9], [28.8, -101.6], [28.8, 35.9], [28.8, 88.4], [28.8, 3.4], [28.8, -81.6], [28.8, 55.9], [28.8, 108.5], [28.8, 23.5], [28.8, 76], [28.8, -9], [28.8, -94], [28.8, 43.5], [28.8, 96.1], [28.8, 11.1], [28.8, 63.6], [28.8, 116.1], [28.8, -106.4], [28.8, 31.2], [28.8, 83.7], [28.7, -1.3], [28.7, 51.2], [28.7, 103.7], [28.7, 18.8], [28.7, 71.3], [28.7, -98.7], [28.7, 38.8], [28.7, 91.3], [28.7, 6.4], [28.7, 58.9], [28.7, 111.4], [28.7, -111.1], [28.7, 26.4], [28.7, 78.9], [28.7, -6], [28.7, 46.5], [28.7, 99], [28.7, 14], [28.7, 66.5], [28.7, 119.1], [28.7, -103.4], [28.7, 86.6], [28.7, 1.6], [28.7, 54.1], [28.6, 106.7], [28.6, 21.7], [28.6, 74.2], [28.6, -10.8], [28.6, -95.8], [28.6, 41.7], [28.6, 94.3], [28.6, 9.3], [28.6, 61.8], [28.6, 114.3], [28.6, -108.2], [28.6, 29.3], [28.6, 81.9], [28.6, -3.1], [28.6, 101.9], [28.6, 16.9], [28.6, 69.5], [28.6, -100.5], [28.6, 37], [28.6, 89.5], [28.6, 4.5], [28.6, 57.1], [28.6, 109.6], [28.6, 24.6], [28.6, 77.1], [28.5, -7.9], [28.5, -92.8], [28.5, 44.7], [28.5, 97.2], [28.5, 12.2], [28.5, 64.7], [28.5, 117.3], [28.5, -105.2], [28.5, 32.3], [28.5, 84.8], [28.5, -0.2], [28.5, 52.3], [28.5, 104.9], [28.5, 19.9], [28.5, 72.4], [28.5, -97.6], [28.5, 39.9], [28.5, 92.5], [28.5, 7.5], [28.5, 60], [28.5, 112.5], [28.5, -110], [28.5, 27.5], [28.5, 80.1], [28.5, -4.9], [28.5, 47.6], [28.4, 100.1], [28.4, 15.1], [28.4, 67.7], [28.4, 120.2], [28.4, -102.3], [28.4, 35.2], [28.4, 87.7], [28.4, 2.7], [28.4, -82.2], [28.4, 55.3], [28.4, 107.8], [28.4, 22.8], [28.4, 75.3], [28.4, -9.7], [28.4, -94.6], [28.4, 42.9], [28.4, 95.4], [28.4, 10.4], [28.4, 62.9], [28.4, 115.4], [28.4, -107], [28.4, 30.5], [28.4, 83], [28.4, -2], [28.4, 103], [28.4, 18.1], [28.4, 70.6], [28.3, -99.4], [28.3, 38.1], [28.3, 90.6], [28.3, 5.7], [28.3, 58.2], [28.3, 110.7], [28.3, -111.8], [28.3, 25.7], [28.3, 78.2], [28.3, -6.7], [28.3, 45.8], [28.3, 98.3], [28.3, 13.3], [28.3, 65.8], [28.3, 118.4], [28.3, -104.1], [28.3, 33.4], [28.3, 85.9], [28.3, 0.9], [28.3, 53.4], [28.3, 106], [28.3, 21], [28.3, 73.5], [28.3, -11.5], [28.3, -96.5], [28.3, 41], [28.2, 93.6], [28.2, 8.6], [28.2, 61.1], [28.2, 113.6], [28.2, -108.9], [28.2, 28.7], [28.2, 81.2], [28.2, -3.8], [28.2, 48.7], [28.2, 101.2], [28.2, 16.3], [28.2, 68.8], [28.2, -101.2], [28.2, 36.3], [28.2, 88.8], [28.2, 3.9], [28.2, -81.1], [28.2, 56.4], [28.2, 108.9], [28.2, 23.9], [28.2, 76.4], [28.2, -8.5], [28.2, -93.5], [28.2, 44], [28.2, 96.5], [28.2, 11.5], [28.2, 64], [28.1, 116.6], [28.1, -105.9], [28.1, 31.6], [28.1, 84.1], [28.1, -0.9], [28.1, 104.2], [28.1, 19.2], [28.1, 71.7], [28.1, -98.3], [28.1, 39.2], [28.1, 91.8], [28.1, 6.8], [28.1, 59.3], [28.1, 111.8], [28.1, -110.7], [28.1, 26.8], [28.1, 79.4], [28.1, -5.6], [28.1, 46.9], [28.1, 99.4], [28.1, 14.4], [28.1, 67], [28.1, 119.5], [28.1, -103], [28, 87], [28, 2], [28, 54.6], [28, 107.1], [28, 22.1], [28, 74.6], [28, -10.4], [28, -95.3], [28, 42.2], [28, 94.7], [28, 9.7], [28, 62.2], [28, 114.8], [28, -107.7], [28, 29.8], [28, 82.3], [28, -2.7], [28, 102.4], [28, 17.4], [28, 69.9], [28, -100.1], [28, 37.4], [28, 90], [28, 5], [28, 57.5], [27.9, 110], [27.9, 25], [27.9, 77.6], [27.9, -7.4], [27.9, 45.1], [27.9, 97.6], [27.9, 12.6], [27.9, 65.2], [27.9, 117.7], [27.9, -104.8], [27.9, 32.7], [27.9, 85.2], [27.9, 0.2], [27.9, 52.8], [27.9, 105.3], [27.9, 20.3], [27.9, 72.8], [27.9, -12.2], [27.9, -97.1], [27.9, 40.4], [27.9, 92.9], [27.9, 7.9], [27.9, 60.4], [27.9, 112.9], [27.9, -109.5], [27.9, 28], [27.8, 80.5], [27.8, -4.5], [27.8, 48], [27.8, 100.5], [27.8, 15.6], [27.8, 68.1], [27.8, 120.6], [27.8, -101.9], [27.8, 35.6], [27.8, 88.1], [27.8, 3.2], [27.8, -81.8], [27.8, 55.7], [27.8, 108.2], [27.8, 23.2], [27.8, 75.7], [27.8, -9.2], [27.8, 43.3], [27.8, 95.8], [27.8, 10.8], [27.8, 63.3], [27.8, 115.9], [27.8, -106.6], [27.8, 30.9], [27.8, 83.4], [27.8, -1.6], [27.7, 103.5], [27.7, 18.5], [27.7, 71], [27.7, -99], [27.7, 38.5], [27.7, 91.1], [27.7, 6.1], [27.7, 58.6], [27.7, 111.1], [27.7, -111.4], [27.7, 26.2], [27.7, 78.7], [27.7, -6.3], [27.7, 46.2], [27.7, 98.7], [27.7, 13.8], [27.7, 66.3], [27.7, 118.8], [27.7, -103.7], [27.7, 33.8], [27.7, 86.3], [27.7, 1.4], [27.7, 53.9], [27.7, 106.4], [27.7, 21.4], [27.6, 73.9], [27.6, -11], [27.6, -96], [27.6, 41.5], [27.6, 94], [27.6, 9], [27.6, 61.5], [27.6, 114.1], [27.6, -108.4], [27.6, 29.1], [27.6, 81.6], [27.6, -3.4], [27.6, 49.1], [27.6, 101.7], [27.6, 16.7], [27.6, 69.2], [27.6, -100.8], [27.6, 36.7], [27.6, 89.3], [27.6, 4.3], [27.6, -80.7], [27.6, 56.8], [27.6, 109.3], [27.6, 24.3], [27.6, 76.9], [27.6, -8.1], [27.6, 44.4], [27.5, 96.9], [27.5, 11.9], [27.5, 64.5], [27.5, 117], [27.5, -105.5], [27.5, 32], [27.5, 84.5], [27.5, -0.5], [27.5, 104.6], [27.5, 19.6], [27.5, 72.1], [27.5, -12.9], [27.5, -97.8], [27.5, 39.7], [27.5, 92.2], [27.5, 7.2], [27.5, 59.7], [27.5, 112.3], [27.5, -110.2], [27.5, 27.3], [27.5, 79.8], [27.5, -5.2], [27.5, 47.3], [27.5, 99.9], [27.5, 14.9], [27.5, 67.4], [27.4, 119.9], [27.4, -102.6], [27.4, 87.5], [27.4, 2.5], [27.4, 55], [27.4, 107.5], [27.4, 22.5], [27.4, 75.1], [27.4, -9.9], [27.4, 42.6], [27.4, 95.1], [27.4, 10.1], [27.4, 62.7], [27.4, 115.2], [27.4, -107.3], [27.4, 30.2], [27.4, 82.7], [27.4, -2.3], [27.4, 102.8], [27.4, 17.8], [27.4, 70.3], [27.4, -99.6], [27.4, 37.9], [27.3, 90.4], [27.3, 5.4], [27.3, 57.9], [27.3, 110.4], [27.3, 25.5], [27.3, 78], [27.3, -7], [27.3, 45.5], [27.3, 98], [27.3, 13.1], [27.3, 65.6], [27.3, 118.1], [27.3, -104.4], [27.3, 33.1], [27.3, 85.6], [27.3, 0.7], [27.3, 105.7], [27.3, 20.7], [27.3, 73.2], [27.3, -11.7], [27.3, -96.7], [27.3, 40.8], [27.3, 93.3], [27.3, 8.3], [27.3, 60.8], [27.2, 113.4], [27.2, -109.1], [27.2, 28.4], [27.2, 80.9], [27.2, -4.1], [27.2, 48.4], [27.2, 101], [27.2, 16], [27.2, 68.5], [27.2, -101.5], [27.2, 36], [27.2, 88.6], [27.2, 3.6], [27.2, -81.4], [27.2, 56.1], [27.2, 108.6], [27.2, 23.7], [27.2, 76.2], [27.2, -8.8], [27.2, 43.7], [27.2, 96.2], [27.2, 11.3], [27.2, 63.8], [27.2, 116.3], [27.2, -106.2], [27.2, 31.3], [27.2, 83.8], [27.1, -1.1], [27.1, 103.9], [27.1, 18.9], [27.1, 71.4], [27.1, -98.5], [27.1, 39], [27.1, 91.5], [27.1, 6.5], [27.1, 59], [27.1, 111.6], [27.1, -110.9], [27.1, 26.6], [27.1, 79.1], [27.1, -5.9], [27.1, 46.6], [27.1, 99.2], [27.1, 14.2], [27.1, 66.7], [27.1, 119.2], [27.1, -103.3], [27.1, 34.2], [27.1, 86.8], [27.1, 1.8], [27, 106.8], [27, 21.8], [27, 74.4], [27, -10.6], [27, 41.9], [27, 94.4], [27, 9.4], [27, 62], [27, 114.5], [27, -108], [27, 29.5], [27, 82], [27, -3], [27, 49.6], [27, 102.1], [27, 17.1], [27, 69.6], [27, -100.3], [27, 37.2], [27, 89.7], [27, 4.7], [27, 57.2], [27, 109.8], [27, 24.8], [27, 77.3], [26.9, -7.7], [26.9, 44.8], [26.9, 97.4], [26.9, 12.4], [26.9, 64.9], [26.9, 117.4], [26.9, -105.1], [26.9, 32.4], [26.9, 85], [26.9, -0], [26.9, 105], [26.9, 20], [26.9, 72.6], [26.9, -12.4], [26.9, -97.4], [26.9, 40.1], [26.9, 92.6], [26.9, 7.6], [26.9, 60.2], [26.9, 112.7], [26.9, -109.8], [26.9, 27.7], [26.9, 80.2], [26.9, -4.8], [26.9, 47.8], [26.9, 100.3], [26.8, 15.3], [26.8, 67.8], [26.8, -102.1], [26.8, 87.9], [26.8, 2.9], [26.8, 55.4], [26.8, 107.9], [26.8, 23], [26.8, 75.5], [26.8, -9.5], [26.8, 43], [26.8, 95.5], [26.8, 10.6], [26.8, 63.1], [26.8, 115.6], [26.8, -106.9], [26.8, 30.6], [26.8, 83.1], [26.8, -1.8], [26.8, 103.2], [26.8, 18.2], [26.8, 70.7], [26.7, -99.2], [26.7, 38.3], [26.7, 90.8], [26.7, 5.8], [26.7, 58.3], [26.7, 110.9], [26.7, 25.9], [26.7, 78.4], [26.7, -6.6], [26.7, 45.9], [26.7, 98.5], [26.7, 13.5], [26.7, 66], [26.7, 118.5], [26.7, -104], [26.7, 33.5], [26.7, 86.1], [26.7, 1.1], [26.7, 106.1], [26.7, 21.2], [26.7, 73.7], [26.7, -11.3], [26.7, 41.2], [26.7, 93.7], [26.7, 8.8], [26.6, 61.3], [26.6, 113.8], [26.6, -108.7], [26.6, 28.8], [26.6, 81.3], [26.6, -3.6], [26.6, 48.9], [26.6, 101.4], [26.6, 16.4], [26.6, 68.9], [26.6, -101], [26.6, 36.5], [26.6, 89], [26.6, 4], [26.6, -81], [26.6, 56.5], [26.6, 109.1], [26.6, 24.1], [26.6, 76.6], [26.6, -8.4], [26.6, 44.1], [26.6, 96.7], [26.6, 11.7], [26.6, 64.2], [26.6, 116.7], [26.6, -105.8], [26.6, 31.7], [26.5, 84.3], [26.5, -0.7], [26.5, 104.3], [26.5, 19.3], [26.5, 71.9], [26.5, -13.1], [26.5, -98.1], [26.5, 39.4], [26.5, 91.9], [26.5, 6.9], [26.5, 59.5], [26.5, 112], [26.5, -110.5], [26.5, 27], [26.5, 79.5], [26.5, -5.5], [26.5, 47.1], [26.5, 99.6], [26.5, 14.6], [26.5, 67.1], [26.5, 119.7], [26.5, -102.8], [26.5, 87.2], [26.5, 2.2], [26.4, 107.3], [26.4, 22.3], [26.4, 74.8], [26.4, -10.2], [26.4, 42.3], [26.4, 94.9], [26.4, 9.9], [26.4, 62.4], [26.4, 114.9], [26.4, -107.6], [26.4, 29.9], [26.4, 82.5], [26.4, -2.5], [26.4, 50], [26.4, 102.5], [26.4, 17.5], [26.4, 70.1], [26.4, -99.9], [26.4, 37.6], [26.4, 90.1], [26.4, 5.1], [26.4, 57.7], [26.4, 110.2], [26.4, 25.2], [26.3, 77.7], [26.3, -7.3], [26.3, 45.3], [26.3, 97.8], [26.3, 12.8], [26.3, 65.3], [26.3, 117.8], [26.3, -104.6], [26.3, 32.9], [26.3, 85.4], [26.3, 0.4], [26.3, 105.4], [26.3, 20.5], [26.3, 73], [26.3, -12], [26.3, 40.5], [26.3, 93], [26.3, 8.1], [26.3, 60.6], [26.3, 113.1], [26.3, -109.4], [26.3, 28.1], [26.3, 80.6], [26.3, -4.3], [26.3, 48.2], [26.2, 100.7], [26.2, 15.7], [26.2, 68.2], [26.2, -101.7], [26.2, 88.3], [26.2, 3.3], [26.2, 108.4], [26.2, 23.4], [26.2, 75.9], [26.2, -9.1], [26.2, 43.4], [26.2, 96], [26.2, 11], [26.2, 63.5], [26.2, 116], [26.2, -106.5], [26.2, 31], [26.2, 83.6], [26.2, -1.4], [26.2, 103.6], [26.2, 18.7], [26.2, 71.2], [26.1, -13.8], [26.1, -98.8], [26.1, 38.7], [26.1, 91.2], [26.1, 6.3], [26.1, 58.8], [26.1, 111.3], [26.1, 26.3], [26.1, 78.8], [26.1, -6.1], [26.1, 46.4], [26.1, 98.9], [26.1, 13.9], [26.1, 66.4], [26.1, 119], [26.1, -103.5], [26.1, 34], [26.1, 86.5], [26.1, 1.5], [26.1, 106.6], [26.1, 21.6], [26.1, 74.1], [26.1, -10.9], [26.1, 41.6], [26.1, 94.2], [26, 9.2], [26, 61.7], [26, 114.2], [26, -108.3], [26, 29.2], [26, 81.8], [26, -3.2], [26, 49.3], [26, 101.8], [26, 16.8], [26, 69.4], [26, -100.6], [26, 36.9], [26, 89.4], [26, 4.4], [26, -80.5], [26, 109.5], [26, 24.5], [26, 77], [26, -8], [26, 44.6], [26, 97.1], [26, 12.1], [26, 64.6], [26, 117.2], [26, -105.3], [25.9, 32.2], [25.9, 84.7], [25.9, -0.3], [25.9, 104.8], [25.9, 19.8], [25.9, 72.3], [25.9, -12.7], [25.9, -97.7], [25.9, 39.8], [25.9, 92.4], [25.9, 7.4], [25.9, 59.9], [25.9, 112.4], [25.9, -110.1], [25.9, 27.4], [25.9, 80], [25.9, -5], [25.9, 47.5], [25.9, 100], [25.9, 15], [25.9, 67.6], [25.9, -102.4], [25.9, 87.6], [25.9, 2.6], [25.8, 107.7], [25.8, 22.7], [25.8, 75.2], [25.8, -9.8], [25.8, 42.8], [25.8, 95.3], [25.8, 10.3], [25.8, 62.8], [25.8, 115.3], [25.8, -107.1], [25.8, 30.4], [25.8, 82.9], [25.8, -2.1], [25.8, 50.4], [25.8, 102.9], [25.8, 18], [25.8, 70.5], [25.8, -99.5], [25.8, 38], [25.8, 90.5], [25.8, 5.6], [25.8, 110.6], [25.8, 25.6], [25.7, 78.1], [25.7, -6.8], [25.7, 45.7], [25.7, 98.2], [25.7, 13.2], [25.7, 65.7], [25.7, 118.3], [25.7, -104.2], [25.7, 33.3], [25.7, 85.8], [25.7, 0.8], [25.7, 105.9], [25.7, 20.9], [25.7, 73.4], [25.7, -11.6], [25.7, 40.9], [25.7, 93.5], [25.7, 8.5], [25.7, 61], [25.7, 113.5], [25.7, -109], [25.7, 28.5], [25.7, 81.1], [25.7, -3.9], [25.7, 48.6], [25.6, 101.1], [25.6, 16.2], [25.6, 68.7], [25.6, -101.3], [25.6, 88.7], [25.6, 3.8], [25.6, 108.8], [25.6, 23.8], [25.6, 76.3], [25.6, -8.6], [25.6, 43.9], [25.6, 96.4], [25.6, 11.4], [25.6, 63.9], [25.6, 116.5], [25.6, -106], [25.6, 31.5], [25.6, 84], [25.6, -1], [25.6, 104.1], [25.6, 19.1], [25.6, 71.6], [25.5, -13.4], [25.5, -98.4], [25.5, 39.1], [25.5, 91.7], [25.5, 6.7], [25.5, 111.7], [25.5, 26.7], [25.5, 79.3], [25.5, -5.7], [25.5, 46.8], [25.5, 99.3], [25.5, 14.3], [25.5, 66.9], [25.5, -103.1], [25.5, 34.4], [25.5, 86.9], [25.5, 1.9], [25.5, 107], [25.5, 22], [25.5, 74.5], [25.5, -10.5], [25.5, 42.1], [25.5, 94.6], [25.4, 9.6], [25.4, 62.1], [25.4, 114.7], [25.4, -107.8], [25.4, 29.7], [25.4, 82.2], [25.4, -2.8], [25.4, 49.7], [25.4, 102.3], [25.4, 17.3], [25.4, 69.8], [25.4, -100.2], [25.4, 37.3], [25.4, 89.9], [25.4, 4.9], [25.4, -80.1], [25.4, 109.9], [25.4, 24.9], [25.4, 77.5], [25.4, -7.5], [25.4, 45], [25.4, 97.5], [25.4, 12.5], [25.4, 65.1], [25.4, 117.6], [25.4, -104.9], [25.3, 32.6], [25.3, 85.1], [25.3, 0.1], [25.3, 105.2], [25.3, 20.2], [25.3, 72.7], [25.3, -12.3], [25.3, -97.2], [25.3, 40.3], [25.3, 92.8], [25.3, 7.8], [25.3, 112.8], [25.3, -109.6], [25.3, 27.9], [25.3, 80.4], [25.3, -4.6], [25.3, 47.9], [25.3, 100.4], [25.3, 15.5], [25.3, 68], [25.3, -102], [25.3, 88], [25.3, 3.1], [25.2, 108.1], [25.2, 23.1], [25.2, 75.6], [25.2, -9.3], [25.2, 43.2], [25.2, 95.7], [25.2, 10.7], [25.2, 63.2], [25.2, 115.8], [25.2, -106.7], [25.2, 30.8], [25.2, 83.3], [25.2, -1.7], [25.2, 50.8], [25.2, 103.4], [25.2, 18.4], [25.2, 70.9], [25.2, -14.1], [25.2, -99.1], [25.2, 38.4], [25.2, 91], [25.2, 6], [25.2, 111], [25.2, 26], [25.1, 78.6], [25.1, -6.4], [25.1, 46.1], [25.1, 98.6], [25.1, 13.7], [25.1, 66.2], [25.1, -103.8], [25.1, 33.7], [25.1, 86.2], [25.1, 1.3], [25.1, 106.3], [25.1, 21.3], [25.1, 73.8], [25.1, -11.1], [25.1, 41.4], [25.1, 93.9], [25.1, 8.9], [25.1, 114], [25.1, -108.5], [25.1, 29], [25.1, 81.5], [25.1, -3.5], [25.1, 49], [25.1, 101.6], [25, 16.6], [25, 69.1], [25, -100.9], [25, 89.2], [25, 4.2], [25, 109.2], [25, 24.2], [25, 76.8], [25, -8.2], [25, 44.3], [25, 96.8], [25, 11.8], [25, 64.4], [25, 116.9], [25, -105.6], [25, 31.9], [25, 84.4], [25, -0.6], [25, 52], [25, 104.5], [25, 19.5], [25, 72], [25, -13], [24.9, -97.9], [24.9, 39.6], [24.9, 92.1], [24.9, 7.1], [24.9, 112.2], [24.9, -110.3], [24.9, 27.2], [24.9, 79.7], [24.9, -5.3], [24.9, 47.2], [24.9, 99.8], [24.9, 14.8], [24.9, 67.3], [24.9, -102.7], [24.9, 34.8], [24.9, 87.4], [24.9, 2.4], [24.9, 54.9], [24.9, 107.4], [24.9, 22.4], [24.9, 75], [24.9, -10], [24.9, 42.5], [24.9, 95], [24.9, 10], [24.8, 62.6], [24.8, 115.1], [24.8, -107.4], [24.8, 30.1], [24.8, 82.6], [24.8, -2.4], [24.8, 50.2], [24.8, 102.7], [24.8, 17.7], [24.8, 70.2], [24.8, -14.8], [24.8, -99.7], [24.8, 37.8], [24.8, 90.3], [24.8, 5.3], [24.8, 110.3], [24.8, 25.4], [24.8, 77.9], [24.8, -7.1], [24.8, 45.4], [24.8, 97.9], [24.8, 13], [24.8, 65.5], [24.8, 118], [24.8, -104.5], [24.8, 33], [24.7, 85.5], [24.7, 0.6], [24.7, 53.1], [24.7, 105.6], [24.7, 20.6], [24.7, 73.1], [24.7, -11.8], [24.7, 40.7], [24.7, 93.2], [24.7, 8.2], [24.7, 113.3], [24.7, -109.2], [24.7, 28.3], [24.7, 80.8], [24.7, -4.2], [24.7, 48.3], [24.7, 100.9], [24.7, 15.9], [24.7, 68.4], [24.7, -101.6], [24.7, 88.5], [24.7, 3.5], [24.7, 56], [24.6, 108.5], [24.6, 23.5], [24.6, 76.1], [24.6, -8.9], [24.6, 43.6], [24.6, 96.1], [24.6, 11.2], [24.6, 63.7], [24.6, 116.2], [24.6, -106.3], [24.6, 31.2], [24.6, 83.7], [24.6, -1.2], [24.6, 51.3], [24.6, 103.8], [24.6, 18.8], [24.6, 71.3], [24.6, -13.6], [24.6, -98.6], [24.6, 38.9], [24.6, 91.4], [24.6, 6.4], [24.6, 111.5], [24.6, 26.5], [24.6, 79], [24.6, -6], [24.5, 46.5], [24.5, 99.1], [24.5, 14.1], [24.5, 66.6], [24.5, -103.4], [24.5, 34.1], [24.5, 86.7], [24.5, 1.7], [24.5, 54.2], [24.5, 106.7], [24.5, 21.7], [24.5, 74.3], [24.5, -10.7], [24.5, 41.8], [24.5, 94.3], [24.5, 9.3], [24.5, 114.4], [24.5, -108.1], [24.5, 29.4], [24.5, 81.9], [24.5, -3.1], [24.5, 49.5], [24.5, 102], [24.5, 17], [24.4, 69.5], [24.4, -100.4], [24.4, 89.6], [24.4, 4.6], [24.4, 109.7], [24.4, 24.7], [24.4, 77.2], [24.4, -7.8], [24.4, 44.7], [24.4, 97.3], [24.4, 12.3], [24.4, 64.8], [24.4, 117.3], [24.4, -105.2], [24.4, 32.3], [24.4, 84.9], [24.4, -0.1], [24.4, 52.4], [24.4, 104.9], [24.4, 19.9], [24.4, 72.5], [24.4, -12.5], [24.4, -97.5], [24.4, 40], [24.3, 92.5], [24.3, 7.5], [24.3, 112.6], [24.3, -109.9], [24.3, 27.6], [24.3, 80.1], [24.3, -4.9], [24.3, 47.7], [24.3, 100.2], [24.3, 15.2], [24.3, 67.7], [24.3, -102.2], [24.3, 35.3], [24.3, 87.8], [24.3, 2.8], [24.3, 55.3], [24.3, 107.8], [24.3, 22.9], [24.3, 75.4], [24.3, -9.6], [24.3, 42.9], [24.3, 95.4], [24.3, 10.5], [24.2, 115.5], [24.2, -107], [24.2, 30.5], [24.2, 83], [24.2, -1.9], [24.2, 50.6], [24.2, 103.1], [24.2, 18.1], [24.2, 70.6], [24.2, -14.3], [24.2, -99.3], [24.2, 38.2], [24.2, 90.7], [24.2, 5.7], [24.2, 110.8], [24.2, 25.8], [24.2, 78.3], [24.2, -6.7], [24.2, 45.8], [24.2, 98.4], [24.2, 13.4], [24.2, 65.9], [24.2, -104.1], [24.2, 33.4], [24.2, 86], [24.2, 1], [24.1, 53.5], [24.1, 106], [24.1, 21], [24.1, 73.6], [24.1, -11.4], [24.1, 41.1], [24.1, 93.6], [24.1, 8.7], [24.1, 113.7], [24.1, -108.8], [24.1, 28.7], [24.1, 81.2], [24.1, -3.7], [24.1, 48.8], [24.1, 101.3], [24.1, 16.3], [24.1, 68.8], [24.1, -101.1], [24.1, 88.9], [24.1, 3.9], [24.1, 56.4], [24.1, 109], [24.1, 24], [24, 76.5], [24, -8.5], [24, 44], [24, 96.6], [24, 11.6], [24, 116.6], [24, -105.9], [24, 31.6], [24, 84.2], [24, -0.8], [24, 51.7], [24, 104.2], [24, 19.2], [24, 71.8], [24, -13.2], [24, -98.2], [24, 39.3], [24, 91.8], [24, 6.8], [24, 111.9], [24, 26.9], [24, 79.4], [24, -5.6], [24, 47], [23.9, 99.5], [23.9, 14.5], [23.9, 67], [23.9, -102.9], [23.9, 34.6], [23.9, 87.1], [23.9, 2.1], [23.9, 54.6], [23.9, 107.2], [23.9, 22.2], [23.9, 74.7], [23.9, -10.3], [23.9, 42.2], [23.9, 94.8], [23.9, 9.8], [23.9, 114.8], [23.9, -107.7], [23.9, 29.8], [23.9, 82.4], [23.9, -2.6], [23.9, 49.9], [23.9, 102.4], [23.9, 17.4], [23.9, 70], [23.9, -15], [23.8, -100], [23.8, 90], [23.8, 5], [23.8, 110.1], [23.8, 25.1], [23.8, 77.6], [23.8, -7.4], [23.8, 45.2], [23.8, 97.7], [23.8, 12.7], [23.8, -104.7], [23.8, 32.8], [23.8, 85.3], [23.8, 0.3], [23.8, 52.8], [23.8, 105.3], [23.8, 20.4], [23.8, 72.9], [23.8, -12.1], [23.8, -97.1], [23.8, 40.4], [23.8, 92.9], [23.8, 8], [23.7, 113], [23.7, -109.5], [23.7, 28], [23.7, 80.5], [23.7, -4.4], [23.7, 48.1], [23.7, 100.6], [23.7, 15.6], [23.7, 68.1], [23.7, -101.8], [23.7, 35.7], [23.7, 88.2], [23.7, 3.2], [23.7, 55.7], [23.7, 108.3], [23.7, 23.3], [23.7, 75.8], [23.7, -9.2], [23.7, 43.3], [23.7, 95.9], [23.7, 10.9], [23.7, 115.9], [23.7, -106.6], [23.7, 30.9], [23.7, 83.5], [23.6, -1.5], [23.6, 51], [23.6, 103.5], [23.6, 18.5], [23.6, 71.1], [23.6, -13.9], [23.6, -98.9], [23.6, 38.6], [23.6, 91.1], [23.6, 6.2], [23.6, 111.2], [23.6, 26.2], [23.6, 78.7], [23.6, -6.2], [23.6, 46.3], [23.6, 98.8], [23.6, 13.8], [23.6, 66.3], [23.6, -103.6], [23.6, 33.9], [23.6, 86.4], [23.6, 1.4], [23.6, 53.9], [23.6, 106.5], [23.5, 21.5], [23.5, 74], [23.5, -11], [23.5, 41.5], [23.5, 94.1], [23.5, 9.1], [23.5, 114.1], [23.5, -108.4], [23.5, 29.1], [23.5, 81.7], [23.5, -3.3], [23.5, 49.2], [23.5, 101.7], [23.5, 16.7], [23.5, 69.3], [23.5, -100.7], [23.5, 89.3], [23.5, 4.3], [23.5, 56.9], [23.5, 109.4], [23.5, 24.4], [23.5, 76.9], [23.5, -8.1], [23.5, 44.5], [23.4, 97], [23.4, 12], [23.4, -105.4], [23.4, 32.1], [23.4, 84.6], [23.4, -0.4], [23.4, 52.1], [23.4, 104.7], [23.4, 19.7], [23.4, 72.2], [23.4, -12.8], [23.4, -97.8], [23.4, 39.7], [23.4, 92.3], [23.4, 7.3], [23.4, 112.3], [23.4, 27.3], [23.4, 79.9], [23.4, -5.1], [23.4, 47.4], [23.4, 99.9], [23.4, 14.9], [23.4, 67.5], [23.3, -102.5], [23.3, 35], [23.3, 87.5], [23.3, 2.5], [23.3, 55.1], [23.3, 107.6], [23.3, 22.6], [23.3, 75.1], [23.3, -9.9], [23.3, 42.7], [23.3, 95.2], [23.3, 10.2], [23.3, 115.2], [23.3, -107.2], [23.3, 30.3], [23.3, 82.8], [23.3, -2.2], [23.3, 50.3], [23.3, 102.8], [23.3, 17.9], [23.3, 70.4], [23.3, -14.6], [23.3, -99.6], [23.3, 90.4], [23.3, 5.5], [23.2, 110.5], [23.2, 25.5], [23.2, 78], [23.2, -6.9], [23.2, 45.6], [23.2, 98.1], [23.2, 13.1], [23.2, -104.3], [23.2, 33.2], [23.2, 85.7], [23.2, 0.7], [23.2, 53.2], [23.2, 105.8], [23.2, 20.8], [23.2, 73.3], [23.2, -11.7], [23.2, 40.8], [23.2, 93.4], [23.2, 8.4], [23.2, 113.4], [23.2, 28.4], [23.1, 81], [23.1, -4], [23.1, 48.5], [23.1, 101], [23.1, 16], [23.1, 68.6], [23.1, -101.4], [23.1, 88.6], [23.1, 3.7], [23.1, 56.2], [23.1, 108.7], [23.1, 23.7], [23.1, 76.2], [23.1, -8.7], [23.1, 43.8], [23.1, 96.3], [23.1, 11.3], [23.1, -106.1], [23.1, 31.4], [23.1, 83.9], [23.1, -1.1], [23.1, 51.4], [23.1, 104], [23, 19], [23, 71.5], [23, -13.5], [23, -98.5], [23, 39], [23, 91.6], [23, 6.6], [23, 111.6], [23, 26.6], [23, 79.2], [23, -5.8], [23, 46.7], [23, 99.2], [23, 14.2], [23, -103.2], [23, 34.3], [23, 86.8], [23, 1.8], [23, 54.4], [23, 106.9], [23, 21.9], [23, 74.4], [23, -10.6], [22.9, 42], [22.9, 94.5], [22.9, 9.5], [22.9, 114.6], [22.9, -107.9], [22.9, 29.6], [22.9, 82.1], [22.9, -2.9], [22.9, 49.6], [22.9, 102.2], [22.9, 17.2], [22.9, 69.7], [22.9, -15.3], [22.9, -100.3], [22.9, 89.8], [22.9, 4.8], [22.9, 57.3], [22.9, 109.8], [22.9, 24.8], [22.9, 77.4], [22.9, -7.6], [22.9, 44.9], [22.9, 97.4], [22.9, 12.4], [22.8, -105], [22.8, 32.5], [22.8, 85], [22.8, 0], [22.8, 52.6], [22.8, 105.1], [22.8, 20.1], [22.8, 72.6], [22.8, -12.4], [22.8, -97.4], [22.8, 40.2], [22.8, 92.7], [22.8, 7.7], [22.8, 112.7], [22.8, 27.8], [22.8, 80.3], [22.8, -4.7], [22.8, 47.8], [22.8, 100.3], [22.8, 15.4], [22.8, -102.1], [22.8, 35.4], [22.8, 87.9], [22.8, 3], [22.7, 55.5], [22.7, 108], [22.7, 23], [22.7, 75.5], [22.7, -9.4], [22.7, 43.1], [22.7, 95.6], [22.7, 10.6], [22.7, -106.8], [22.7, 30.7], [22.7, 83.2], [22.7, -1.8], [22.7, 50.7], [22.7, 103.3], [22.7, 18.3], [22.7, 70.8], [22.7, -14.2], [22.7, -99.2], [22.7, 90.9], [22.7, 5.9], [22.7, 110.9], [22.7, 25.9], [22.6, 78.5], [22.6, -6.5], [22.6, 46], [22.6, 98.5], [22.6, 13.5], [22.6, -103.9], [22.6, 33.6], [22.6, 86.1], [22.6, 1.2], [22.6, 53.7], [22.6, 106.2], [22.6, 21.2], [22.6, 73.7], [22.6, -11.2], [22.6, 41.3], [22.6, 93.8], [22.6, 8.8], [22.6, 113.9], [22.6, 28.9], [22.6, 81.4], [22.6, -3.6], [22.6, 48.9], [22.5, 101.5], [22.5, 16.5], [22.5, 69], [22.5, -16], [22.5, -101], [22.5, 89.1], [22.5, 4.1], [22.5, 56.6], [22.5, 109.1], [22.5, 24.1], [22.5, 76.7], [22.5, -8.3], [22.5, 44.2], [22.5, 96.7], [22.5, 11.7], [22.5, -105.7], [22.5, 31.8], [22.5, 84.3], [22.5, -0.7], [22.5, 51.9], [22.5, 104.4], [22.5, 19.4], [22.5, 71.9], [22.5, -13.1], [22.5, -98], [22.4, 39.5], [22.4, 92], [22.4, 7], [22.4, 112.1], [22.4, 27.1], [22.4, 79.6], [22.4, -5.4], [22.4, 47.1], [22.4, 99.7], [22.4, 14.7], [22.4, -102.8], [22.4, 34.7], [22.4, 87.3], [22.4, 2.3], [22.4, 54.8], [22.4, 107.3], [22.4, 22.3], [22.4, 74.9], [22.4, -10.1], [22.4, 42.4], [22.4, 94.9], [22.4, 9.9], [22.3, -107.5], [22.3, 30], [22.3, 82.5], [22.3, -2.5], [22.3, 50.1], [22.3, 102.6], [22.3, 17.6], [22.3, 70.1], [22.3, -14.9], [22.3, -99.9], [22.3, 90.2], [22.3, 5.2], [22.3, 57.7], [22.3, 110.2], [22.3, 25.3], [22.3, 77.8], [22.3, -7.2], [22.3, 45.3], [22.3, 97.8], [22.3, 12.9], [22.3, -104.6], [22.3, 32.9], [22.3, 85.4], [22.3, 0.5], [22.2, 53], [22.2, 105.5], [22.2, 20.5], [22.2, 73], [22.2, -11.9], [22.2, 40.6], [22.2, 93.1], [22.2, 8.1], [22.2, 113.2], [22.2, 28.2], [22.2, 80.7], [22.2, -4.3], [22.2, 48.2], [22.2, 100.8], [22.2, 15.8], [22.2, -101.7], [22.2, 35.8], [22.2, 88.4], [22.2, 3.4], [22.2, 55.9], [22.2, 108.4], [22.2, 23.4], [22.1, 76], [22.1, -9], [22.1, 43.5], [22.1, 96], [22.1, 11.1], [22.1, -106.4], [22.1, 31.1], [22.1, 83.6], [22.1, -1.3], [22.1, 51.2], [22.1, 103.7], [22.1, 18.7], [22.1, 71.2], [22.1, -13.7], [22.1, -98.7], [22.1, 91.3], [22.1, 6.3], [22.1, 58.8], [22.1, 111.4], [22.1, 26.4], [22.1, 78.9], [22.1, -6.1], [22.1, 46.4], [22.1, 99], [22, 14], [22, -103.5], [22, 34], [22, 86.6], [22, 1.6], [22, 54.1], [22, 106.6], [22, 21.6], [22, 74.2], [22, -10.8], [22, 41.7], [22, 94.2], [22, 9.2], [22, 29.3], [22, 81.8], [22, -3.2], [22, 49.4], [22, 101.9], [22, 16.9], [22, 69.4], [22, -15.6], [22, -100.5], [21.9, 89.5], [21.9, 4.5], [21.9, -80.5], [21.9, 57], [21.9, 109.6], [21.9, 24.6], [21.9, 77.1], [21.9, -7.9], [21.9, 44.6], [21.9, 97.2], [21.9, 12.2], [21.9, -105.3], [21.9, 32.2], [21.9, 84.8], [21.9, -0.2], [21.9, 52.3], [21.9, 104.8], [21.9, 19.8], [21.9, 72.4], [21.9, -12.6], [21.9, -97.6], [21.9, 39.9], [21.9, 92.4], [21.9, 7.4], [21.8, 112.5], [21.8, 27.5], [21.8, 80], [21.8, -5], [21.8, 47.6], [21.8, 100.1], [21.8, 15.1], [21.8, -102.4], [21.8, 35.2], [21.8, 87.7], [21.8, 2.7], [21.8, -82.3], [21.8, 55.2], [21.8, 107.7], [21.8, 22.8], [21.8, 75.3], [21.8, -9.7], [21.8, 42.8], [21.8, 95.3], [21.8, 10.4], [21.8, -107.1], [21.8, 30.4], [21.8, 82.9], [21.8, -2], [21.7, 50.5], [21.7, 103], [21.7, 18], [21.7, 70.5], [21.7, -14.4], [21.7, -99.4], [21.7, 90.6], [21.7, 5.6], [21.7, -79.4], [21.7, 58.1], [21.7, 110.7], [21.7, 25.7], [21.7, 78.2], [21.7, -6.8], [21.7, 45.7], [21.7, 98.3], [21.7, 13.3], [21.7, -104.2], [21.7, 33.3], [21.7, 85.9], [21.7, 0.9], [21.7, 53.4], [21.7, 105.9], [21.7, 20.9], [21.7, 73.5], [21.6, -11.5], [21.6, 41], [21.6, 93.5], [21.6, 8.6], [21.6, 28.6], [21.6, 81.1], [21.6, -3.8], [21.6, 48.7], [21.6, 101.2], [21.6, 16.2], [21.6, -16.2], [21.6, -101.2], [21.6, 36.3], [21.6, 88.8], [21.6, 3.8], [21.6, -81.2], [21.6, 56.3], [21.6, 108.9], [21.6, 23.9], [21.6, 76.4], [21.6, -8.6], [21.6, 43.9], [21.6, 96.5], [21.6, 11.5], [21.5, -106], [21.5, 31.5], [21.5, 84.1], [21.5, -0.9], [21.5, 51.6], [21.5, 104.1], [21.5, 19.1], [21.5, 71.7], [21.5, -13.3], [21.5, -98.3], [21.5, 91.7], [21.5, 6.7], [21.5, -78.2], [21.5, 26.8], [21.5, 79.3], [21.5, -5.7], [21.5, 46.9], [21.5, 99.4], [21.5, 14.4], [21.5, -103], [21.5, 34.5], [21.4, 87], [21.4, 2], [21.4, 54.5], [21.4, 107.1], [21.4, 22.1], [21.4, 74.6], [21.4, -10.4], [21.4, 42.1], [21.4, 94.7], [21.4, 9.7], [21.4, 29.7], [21.4, 82.3], [21.4, -2.7], [21.4, 49.8], [21.4, 102.3], [21.4, 17.3], [21.4, -15.1], [21.4, -100.1], [21.4, 4.9], [21.4, -80.1], [21.4, 57.5], [21.4, 110], [21.3, 25], [21.3, 77.5], [21.3, -7.5], [21.3, 45.1], [21.3, 97.6], [21.3, 12.6], [21.3, -104.9], [21.3, 32.7], [21.3, 85.2], [21.3, 0.2], [21.3, 52.7], [21.3, 105.2], [21.3, 20.3], [21.3, 72.8], [21.3, -12.2], [21.3, -97.2], [21.3, 40.3], [21.3, 92.8], [21.3, 7.9], [21.3, -77.1], [21.3, 27.9], [21.3, 80.4], [21.3, -4.5], [21.3, 48], [21.2, 100.5], [21.2, 15.5], [21.2, -101.9], [21.2, 35.6], [21.2, 88.1], [21.2, 3.1], [21.2, 55.6], [21.2, 108.2], [21.2, 23.2], [21.2, 75.7], [21.2, -9.3], [21.2, 43.2], [21.2, 95.8], [21.2, 10.8], [21.2, 30.8], [21.2, 83.4], [21.2, -1.6], [21.2, 50.9], [21.2, 103.4], [21.2, 18.4], [21.2, 71], [21.2, -14], [21.2, -99], [21.1, 6.1], [21.1, -78.9], [21.1, 26.1], [21.1, 78.6], [21.1, -6.3], [21.1, 46.2], [21.1, 98.7], [21.1, 13.7], [21.1, -103.7], [21.1, 33.8], [21.1, 86.3], [21.1, 1.3], [21.1, 53.8], [21.1, 106.4], [21.1, 21.4], [21.1, 73.9], [21.1, -11.1], [21.1, 41.4], [21.1, 94], [21.1, 9], [21, 29], [21, 81.6], [21, -3.4], [21, 49.1], [21, 101.6], [21, 16.6], [21, -15.8], [21, -100.8], [21, 36.7], [21, 4.2], [21, 56.8], [21, 24.3], [21, 76.8], [21, -8.2], [21, 44.4], [21, 96.9], [21, 11.9], [21, -105.5], [21, 32], [21, 84.5], [21, -0.5], [20.9, 52], [20.9, 104.6], [20.9, 19.6], [20.9, 72.1], [20.9, -12.9], [20.9, -97.9], [20.9, 39.6], [20.9, 92.2], [20.9, 7.2], [20.9, -77.8], [20.9, 27.2], [20.9, 79.8], [20.9, -5.2], [20.9, 47.3], [20.9, 99.8], [20.9, 14.8], [20.9, -102.6], [20.9, 34.9], [20.9, 87.4], [20.9, 2.4], [20.9, 55], [20.9, 107.5], [20.9, 22.5], [20.9, 75], [20.8, -10], [20.8, 42.6], [20.8, 95.1], [20.8, 10.1], [20.8, 30.2], [20.8, 82.7], [20.8, -2.3], [20.8, -87.3], [20.8, 50.2], [20.8, 102.7], [20.8, 17.8], [20.8, -14.7], [20.8, -99.7], [20.8, 5.4], [20.8, 25.4], [20.8, 77.9], [20.8, -7], [20.8, 45.5], [20.8, 98], [20.8, 13], [20.7, -104.4], [20.7, 33.1], [20.7, 85.6], [20.7, 0.6], [20.7, 53.1], [20.7, 105.7], [20.7, 20.7], [20.7, 73.2], [20.7, -11.8], [20.7, -96.8], [20.7, 40.7], [20.7, 93.3], [20.7, 8.3], [20.7, -76.7], [20.7, 28.3], [20.7, 80.9], [20.7, -4.1], [20.7, -89.1], [20.7, 48.4], [20.7, 100.9], [20.7, 15.9], [20.7, -16.5], [20.7, -101.5], [20.7, 36], [20.6, 3.6], [20.6, 56.1], [20.6, 23.6], [20.6, 76.1], [20.6, -8.8], [20.6, 43.7], [20.6, 96.2], [20.6, 11.2], [20.6, 31.3], [20.6, 83.8], [20.6, -1.2], [20.6, 51.3], [20.6, 103.9], [20.6, 18.9], [20.6, 71.4], [20.6, -13.6], [20.6, -98.6], [20.6, 6.5], [20.6, 26.5], [20.5, 79.1], [20.5, -5.9], [20.5, 46.6], [20.5, 99.1], [20.5, 14.1], [20.5, -103.3], [20.5, 34.2], [20.5, 86.7], [20.5, 1.7], [20.5, 54.3], [20.5, 106.8], [20.5, 21.8], [20.5, 74.3], [20.5, -10.7], [20.5, 41.9], [20.5, 94.4], [20.5, 9.4], [20.5, 29.5], [20.5, 82], [20.5, -3], [20.5, -88], [20.5, 49.5], [20.4, 102.1], [20.4, 17.1], [20.4, -15.4], [20.4, -100.4], [20.4, 37.1], [20.4, 4.7], [20.4, 57.2], [20.4, 24.7], [20.4, 77.3], [20.4, -7.7], [20.4, 44.8], [20.4, 97.3], [20.4, 12.3], [20.4, -105.1], [20.4, 32.4], [20.4, 84.9], [20.4, -0.1], [20.4, 52.5], [20.4, 105], [20.4, 20], [20.4, 72.5], [20.4, -12.5], [20.4, -97.5], [20.4, 40.1], [20.3, 92.6], [20.3, 7.6], [20.3, 27.7], [20.3, 80.2], [20.3, -4.8], [20.3, -89.8], [20.3, 47.7], [20.3, 100.2], [20.3, 15.3], [20.3, -102.2], [20.3, 35.3], [20.3, 2.9], [20.3, 55.4], [20.3, 22.9], [20.3, 75.4], [20.3, -9.5], [20.3, 43], [20.3, 95.5], [20.3, 10.5], [20.2, 30.6], [20.2, 83.1], [20.2, -1.9], [20.2, 50.6], [20.2, 103.2], [20.2, 18.2], [20.2, -14.3], [20.2, -99.3], [20.2, 5.8], [20.2, 25.8], [20.2, 78.4], [20.2, -6.6], [20.2, 45.9], [20.2, 98.4], [20.2, 13.4], [20.2, -104], [20.2, 33.5], [20.2, 86], [20.2, 1.1], [20.2, 53.6], [20.1, 106.1], [20.1, 21.1], [20.1, 73.6], [20.1, -11.3], [20.1, -96.3], [20.1, 41.2], [20.1, 93.7], [20.1, 8.7], [20.1, 28.8], [20.1, 81.3], [20.1, -3.7], [20.1, -88.7], [20.1, 48.8], [20.1, 101.4], [20.1, 16.4], [20.1, -16.1], [20.1, -101.1], [20.1, 36.4], [20.1, 4], [20.1, 56.5], [20.1, 24], [20.1, 76.6], [20.1, -8.4], [20, 44.1], [20, 96.6], [20, 11.6], [20, 31.7], [20, 84.2], [20, -0.8], [20, 51.8], [20, 104.3], [20, 19.3], [20, -13.2], [20, -98.1], [20, 6.9], [20, 27], [20, 79.5], [20, -5.5], [20, -90.5], [20, 47], [20, 99.6], [20, 14.6], [19.9, -102.9], [19.9, 34.6], [19.9, 2.2], [19.9, 54.7], [19.9, 107.2], [19.9, 22.2], [19.9, 74.8], [19.9, -10.2], [19.9, 42.3], [19.9, 94.8], [19.9, 9.8], [19.9, 29.9], [19.9, 82.4], [19.9, -2.6], [19.9, -87.6], [19.9, 50], [19.9, 102.5], [19.9, 17.5], [19.9, -15], [19.9, -100], [19.9, 5.1], [19.8, 25.2], [19.8, 77.7], [19.8, -7.3], [19.8, 45.2], [19.8, 97.7], [19.8, 12.8], [19.8, 32.8], [19.8, 85.3], [19.8, 0.4], [19.8, 52.9], [19.8, 105.4], [19.8, 20.4], [19.8, 72.9], [19.8, -12], [19.8, -97], [19.8, 40.5], [19.8, 8], [19.8, 28.1], [19.8, 80.6], [19.7, -4.4], [19.7, -89.4], [19.7, 48.1], [19.7, 100.7], [19.7, 15.7], [19.7, -16.8], [19.7, -101.8], [19.7, 35.7], [19.7, 3.3], [19.7, 55.8], [19.7, 23.3], [19.7, 75.9], [19.7, -9.1], [19.7, 43.4], [19.7, 95.9], [19.7, 10.9], [19.7, 31], [19.7, 83.5], [19.7, -1.4], [19.7, 51.1], [19.7, 103.6], [19.7, 18.6], [19.6, -13.8], [19.6, -98.8], [19.6, 6.2], [19.6, 26.3], [19.6, 78.8], [19.6, -6.2], [19.6, -91.2], [19.6, 46.3], [19.6, 98.9], [19.6, 13.9], [19.6, -103.6], [19.6, 33.9], [19.6, 1.5], [19.6, 54], [19.6, 106.5], [19.6, 21.5], [19.6, 74.1], [19.6, -10.9], [19.6, -95.9], [19.6, 41.6], [19.6, 94.1], [19.5, 9.1], [19.5, 29.2], [19.5, 81.7], [19.5, -3.3], [19.5, -88.2], [19.5, 49.3], [19.5, 101.8], [19.5, 16.8], [19.5, -15.7], [19.5, -100.6], [19.5, 36.9], [19.5, 4.4], [19.5, 24.5], [19.5, 77], [19.5, -8], [19.5, 44.5], [19.5, 97.1], [19.5, 12.1], [19.5, 32.1], [19.4, 84.7], [19.4, -0.3], [19.4, 52.2], [19.4, 104.7], [19.4, 19.7], [19.4, 72.3], [19.4, -12.7], [19.4, -97.7], [19.4, 7.3], [19.4, 27.4], [19.4, 79.9], [19.4, -5.1], [19.4, -90.1], [19.4, 47.5], [19.4, 100], [19.4, 15], [19.4, -102.5], [19.4, 35.1], [19.4, 2.6], [19.4, 55.1], [19.3, 22.7], [19.3, 75.2], [19.3, -9.8], [19.3, 42.7], [19.3, 95.2], [19.3, 10.3], [19.3, 30.3], [19.3, 82.8], [19.3, -2.1], [19.3, 50.4], [19.3, 102.9], [19.3, 17.9], [19.3, -14.5], [19.3, -99.5], [19.3, 5.5], [19.3, 25.6], [19.3, 78.1], [19.3, -6.9], [19.3, -91.9], [19.3, 45.6], [19.2, 98.2], [19.2, 13.2], [19.2, 33.2], [19.2, 0.8], [19.2, 53.3], [19.2, 105.8], [19.2, 20.8], [19.2, 73.4], [19.2, -11.6], [19.2, -96.6], [19.2, 40.9], [19.2, 8.4], [19.2, 28.5], [19.2, 81], [19.2, -3.9], [19.2, -88.9], [19.2, 48.6], [19.2, 101.1], [19.2, 16.1], [19.2, -16.3], [19.2, -101.3], [19.2, 36.2], [19.1, 3.7], [19.1, 23.8], [19.1, 76.3], [19.1, -8.7], [19.1, 43.8], [19.1, 96.4], [19.1, 11.4], [19.1, 31.4], [19.1, 84], [19.1, -1], [19.1, 51.5], [19.1, 104], [19.1, 19], [19.1, -13.4], [19.1, -98.4], [19.1, 6.6], [19, 26.7], [19, 79.2], [19, -5.8], [19, -90.7], [19, 46.8], [19, 99.3], [19, 14.3], [19, 34.4], [19, 1.9], [19, 54.4], [19, 107], [19, 22], [19, 74.5], [19, -10.5], [19, -95.5], [19, 42], [19, 94.6], [19, 9.6], [19, 29.6], [19, 82.2], [19, -2.8], [19, -87.8], [19, 49.7], [18.9, 102.2], [18.9, 17.2], [18.9, -15.2], [18.9, -100.2], [18.9, 37.3], [18.9, 4.8], [18.9, 24.9], [18.9, 77.4], [18.9, -7.6], [18.9, -92.6], [18.9, 45], [18.9, 97.5], [18.9, 12.5], [18.9, 32.6], [18.9, 0.1], [18.9, 52.6], [18.9, 105.1], [18.9, 20.2], [18.9, 72.7], [18.9, -12.3], [18.9, -97.3], [18.8, 7.8], [18.8, 27.8], [18.8, 80.3], [18.8, -4.6], [18.8, -89.6], [18.8, 47.9], [18.8, 100.4], [18.8, 15.4], [18.8, -102], [18.8, 35.5], [18.8, 3], [18.8, 55.5], [18.8, 23.1], [18.8, 75.6], [18.8, -9.4], [18.8, 43.1], [18.8, 95.7], [18.8, 10.7], [18.7, 30.7], [18.7, 83.3], [18.7, -1.7], [18.7, 50.8], [18.7, 103.3], [18.7, 18.3], [18.7, -14.1], [18.7, -99.1], [18.7, 5.9], [18.7, 26], [18.7, 78.5], [18.7, -6.4], [18.7, -91.4], [18.7, 46.1], [18.7, 98.6], [18.7, 13.6], [18.7, 33.7], [18.7, 1.2], [18.7, 53.7], [18.6, 106.3], [18.6, 21.3], [18.6, 73.8], [18.6, -11.2], [18.6, -96.2], [18.6, 41.3], [18.6, 8.9], [18.6, 28.9], [18.6, 81.5], [18.6, -3.5], [18.6, -88.5], [18.6, 49], [18.6, 101.5], [18.6, 16.5], [18.6, -15.9], [18.6, -100.9], [18.6, 36.6], [18.6, 4.1], [18.6, 24.2], [18.6, 76.7], [18.6, -8.3], [18.6, -93.2], [18.5, 44.3], [18.5, 96.8], [18.5, 11.8], [18.5, 31.9], [18.5, -0.6], [18.5, 51.9], [18.5, 104.5], [18.5, 19.5], [18.5, -13], [18.5, -98], [18.5, 7.1], [18.5, 27.1], [18.5, 79.7], [18.5, -5.3], [18.5, -90.3], [18.5, 47.2], [18.5, 99.7], [18.5, 14.7], [18.4, 34.8], [18.4, 2.3], [18.4, 54.9], [18.4, 22.4], [18.4, 74.9], [18.4, -10.1], [18.4, -95.1], [18.4, 42.5], [18.4, 95], [18.4, 10], [18.4, 30.1], [18.4, 82.6], [18.4, -2.4], [18.4, 50.1], [18.4, 102.6], [18.4, 17.7], [18.4, -14.8], [18.4, -99.8], [18.4, 37.7], [18.4, 5.3], [18.3, 25.3], [18.3, 77.8], [18.3, -7.1], [18.3, -92.1], [18.3, 45.4], [18.3, 97.9], [18.3, 12.9], [18.3, 33], [18.3, 0.5], [18.3, 53], [18.3, 105.6], [18.3, 20.6], [18.3, 73.1], [18.3, -11.9], [18.3, -96.9], [18.3, 8.2], [18.3, 28.2], [18.3, 80.8], [18.3, -4.2], [18.2, -89.2], [18.2, 48.3], [18.2, 100.8], [18.2, 15.8], [18.2, -16.6], [18.2, 35.9], [18.2, 3.4], [18.2, 23.5], [18.2, 76], [18.2, -8.9], [18.2, 43.6], [18.2, 96.1], [18.2, 11.1], [18.2, 31.2], [18.2, 83.7], [18.2, -1.3], [18.2, 51.2], [18.2, 103.8], [18.2, 18.8], [18.2, -13.7], [18.1, -98.7], [18.1, 6.4], [18.1, 26.4], [18.1, 79], [18.1, -6], [18.1, -91], [18.1, 46.5], [18.1, 99], [18.1, 14], [18.1, 34.1], [18.1, 1.6], [18.1, 54.2], [18.1, 21.7], [18.1, 74.2], [18.1, -10.8], [18.1, -95.7], [18.1, 41.8], [18.1, 9.3], [18, 29.4], [18, 81.9], [18, -3.1], [18, -88.1], [18, 49.4], [18, 102], [18, 17], [18, -15.5], [18, -100.5], [18, 37], [18, 4.6], [18, 24.6], [18, 77.2], [18, -7.8], [18, -92.8], [18, 44.7], [18, 97.2], [18, 12.2], [18, 32.3], [18, -0.2], [17.9, 52.4], [17.9, 104.9], [17.9, 19.9], [17.9, -12.6], [17.9, -97.6], [17.9, 7.5], [17.9, 27.6], [17.9, 80.1], [17.9, -4.9], [17.9, -89.9], [17.9, 47.6], [17.9, 100.1], [17.9, 15.2], [17.9, 120.2], [17.9, 35.2], [17.9, 2.8], [17.9, 22.8], [17.9, 75.3], [17.9, -9.6], [17.8, -94.6], [17.8, 42.9], [17.8, 95.4], [17.8, 10.4], [17.8, 30.5], [17.8, 83], [17.8, -2], [17.8, 50.5], [17.8, 103.1], [17.8, 18.1], [17.8, -14.4], [17.8, -99.4], [17.8, 5.7], [17.8, 25.7], [17.8, 78.3], [17.8, -6.7], [17.8, -91.7], [17.8, 45.8], [17.8, 98.3], [17.8, 13.3], [17.7, 33.4], [17.7, 0.9], [17.7, 53.5], [17.7, 106], [17.7, 21], [17.7, 73.5], [17.7, -11.4], [17.7, -96.4], [17.7, 8.6], [17.7, 28.7], [17.7, 81.2], [17.7, -3.8], [17.7, -88.8], [17.7, 48.7], [17.7, 101.3], [17.7, 16.3], [17.7, -16.2], [17.7, 121.3], [17.7, 36.3], [17.7, 3.9], [17.6, 23.9], [17.6, 76.5], [17.6, -8.5], [17.6, -93.5], [17.6, 44], [17.6, 96.5], [17.6, 11.5], [17.6, 31.6], [17.6, -0.9], [17.6, 51.7], [17.6, 104.2], [17.6, 19.2], [17.6, -13.3], [17.6, -98.2], [17.6, 6.8], [17.6, 26.9], [17.6, 79.4], [17.6, -5.6], [17.5, -90.6], [17.5, 46.9], [17.5, 99.5], [17.5, 14.5], [17.5, 34.5], [17.5, 2.1], [17.5, 22.1], [17.5, 74.7], [17.5, -10.3], [17.5, -95.3], [17.5, 42.2], [17.5, 9.7], [17.5, 29.8], [17.5, 82.3], [17.5, -2.7], [17.5, 49.9], [17.5, 102.4], [17.5, 17.4], [17.4, -15.1], [17.4, 37.5], [17.4, 5], [17.4, 25.1], [17.4, 77.6], [17.4, -7.4], [17.4, -92.4], [17.4, 45.1], [17.4, 97.6], [17.4, 12.7], [17.4, 32.7], [17.4, 0.3], [17.4, 52.8], [17.4, 105.3], [17.4, 20.3], [17.4, -12.1], [17.4, -97.1], [17.4, 7.9], [17.3, 28], [17.3, 80.5], [17.3, -4.5], [17.3, -89.5], [17.3, 48], [17.3, 100.6], [17.3, 15.6], [17.3, -16.9], [17.3, 120.6], [17.3, 35.6], [17.3, 3.2], [17.3, 23.2], [17.3, 75.8], [17.3, -9.2], [17.3, -94.2], [17.3, 43.3], [17.3, 95.8], [17.3, 10.8], [17.3, 30.9], [17.3, -1.6], [17.2, 51], [17.2, 103.5], [17.2, 18.5], [17.2, -13.9], [17.2, -98.9], [17.2, 6.1], [17.2, 26.2], [17.2, 78.7], [17.2, -6.3], [17.2, -91.3], [17.2, 46.2], [17.2, 98.8], [17.2, 13.8], [17.2, 33.8], [17.2, 1.4], [17.2, 53.9], [17.2, 21.4], [17.2, 74], [17.2, -11], [17.1, -96], [17.1, 41.5], [17.1, 9], [17.1, 29.1], [17.1, 81.6], [17.1, -3.4], [17.1, -88.3], [17.1, 49.2], [17.1, 101.7], [17.1, 16.7], [17.1, -15.8], [17.1, 121.7], [17.1, 36.8], [17.1, 4.3], [17.1, 24.4], [17.1, 76.9], [17.1, -8.1], [17.1, -93.1], [17.1, 44.4], [17.1, 97], [17.1, 12], [17, 32], [17, -0.4], [17, 52.1], [17, 104.6], [17, 19.6], [17, -12.8], [17, -97.8], [17, 7.2], [17, 27.3], [17, 79.8], [17, -5.2], [17, -90.2], [17, 47.4], [17, 99.9], [17, 14.9], [17, 35], [17, 2.5], [16.9, 22.6], [16.9, 75.1], [16.9, -9.9], [16.9, -94.9], [16.9, 42.6], [16.9, 10.2], [16.9, 30.2], [16.9, -2.2], [16.9, 50.3], [16.9, 102.8], [16.9, 17.8], [16.9, -14.6], [16.9, 37.9], [16.9, 5.4], [16.9, 25.5], [16.9, 78], [16.9, -7], [16.8, -92], [16.8, 45.5], [16.8, 98.1], [16.8, 13.1], [16.8, 33.1], [16.8, 0.7], [16.8, 53.2], [16.8, 105.7], [16.8, 20.7], [16.8, 73.3], [16.8, -11.7], [16.8, -96.7], [16.8, 8.3], [16.8, 28.4], [16.8, 80.9], [16.8, -4.1], [16.8, -89], [16.8, 48.5], [16.8, 101], [16.8, 16], [16.8, -16.4], [16.7, 121.1], [16.7, 36.1], [16.7, 3.6], [16.7, 23.7], [16.7, 76.2], [16.7, -8.8], [16.7, -93.8], [16.7, 43.7], [16.7, 11.3], [16.7, 31.3], [16.7, -1.1], [16.7, 51.4], [16.7, 103.9], [16.7, 18.9], [16.7, -13.5], [16.7, 6.5], [16.6, 26.6], [16.6, 79.1], [16.6, -5.9], [16.6, -90.8], [16.6, 46.7], [16.6, 99.2], [16.6, 14.2], [16.6, 34.3], [16.6, 1.8], [16.6, 21.9], [16.6, 74.4], [16.6, -10.6], [16.6, -95.6], [16.6, 41.9], [16.6, 9.5], [16.6, 29.5], [16.6, -2.9], [16.6, -87.9], [16.6, 49.6], [16.5, 102.1], [16.5, 17.1], [16.5, -15.3], [16.5, 122.2], [16.5, 37.2], [16.5, 4.7], [16.5, 24.8], [16.5, 77.3], [16.5, -7.7], [16.5, -92.7], [16.5, 44.9], [16.5, 97.4], [16.5, 12.4], [16.5, 32.5], [16.5, -0], [16.5, 52.5], [16.5, 105], [16.5, 20.1], [16.5, -12.4], [16.5, -97.4], [16.4, 7.7], [16.4, 27.7], [16.4, 80.2], [16.4, -4.7], [16.4, -89.7], [16.4, 47.8], [16.4, 100.3], [16.4, 15.3], [16.4, 120.4], [16.4, 35.4], [16.4, 2.9], [16.4, 23], [16.4, 75.5], [16.4, -9.5], [16.4, -94.5], [16.4, 43], [16.4, 10.6], [16.3, 30.6], [16.3, -1.8], [16.3, 50.7], [16.3, 103.2], [16.3, 18.2], [16.3, -14.2], [16.3, 38.3], [16.3, 5.8], [16.3, 25.9], [16.3, 78.4], [16.3, -6.6], [16.3, -91.5], [16.3, 46], [16.3, 98.5], [16.3, 13.5], [16.3, 33.6], [16.3, 1.1], [16.2, 106.2], [16.2, 21.2], [16.2, 73.7], [16.2, -11.3], [16.2, -96.3], [16.2, 8.8], [16.2, 28.8], [16.2, 81.4], [16.2, -3.6], [16.2, -88.6], [16.2, 48.9], [16.2, 101.4], [16.2, 16.4], [16.2, -16], [16.2, 121.5], [16.2, 36.5], [16.2, 4], [16.2, 24.1], [16.2, 76.6], [16.2, -8.4], [16.2, -93.3], [16.2, 44.2], [16.1, 11.7], [16.1, 31.8], [16.1, -0.7], [16.1, 51.8], [16.1, 104.3], [16.1, 19.4], [16.1, -13.1], [16.1, 7], [16.1, 27], [16.1, 79.6], [16.1, -5.4], [16.1, -90.4], [16.1, 47.1], [16.1, 99.6], [16.1, 14.6], [16.1, 34.7], [16, 2.2], [16, 22.3], [16, 74.8], [16, -10.2], [16, -95.2], [16, 42.4], [16, 9.9], [16, 30], [16, -2.5], [16, 50], [16, 102.5], [16, 17.6], [16, -14.9], [16, 122.6], [16, 37.6], [16, 5.2], [15.9, 25.2], [15.9, 77.7], [15.9, -7.2], [15.9, -92.2], [15.9, 45.3], [15.9, 97.8], [15.9, 12.8], [15.9, 32.9], [15.9, 0.4], [15.9, 105.5], [15.9, 20.5], [15.9, -12], [15.9, 8.1], [15.9, 28.1], [15.9, 80.7], [15.9, -4.3], [15.9, -89.3], [15.9, 48.2], [15.9, 100.7], [15.8, 15.7], [15.8, -16.7], [15.8, 120.8], [15.8, 35.8], [15.8, 3.3], [15.8, 23.4], [15.8, 75.9], [15.8, -9.1], [15.8, -94], [15.8, 43.5], [15.8, 11], [15.8, 31.1], [15.8, -1.4], [15.8, 51.1], [15.8, 103.7], [15.8, 18.7], [15.8, -13.8], [15.8, 38.7], [15.7, 6.3], [15.7, 26.3], [15.7, 78.9], [15.7, -6.1], [15.7, -91.1], [15.7, 46.4], [15.7, 98.9], [15.7, 13.9], [15.7, 34], [15.7, 1.5], [15.7, 106.6], [15.7, 21.6], [15.7, 74.1], [15.7, -10.9], [15.7, -95.8], [15.7, 9.2], [15.7, 29.3], [15.6, -3.2], [15.6, -88.2], [15.6, 49.3], [15.6, 101.9], [15.6, 16.9], [15.6, -15.6], [15.6, 121.9], [15.6, 36.9], [15.6, 4.5], [15.6, 24.5], [15.6, 77.1], [15.6, -7.9], [15.6, -92.9], [15.6, 44.6], [15.6, 97.1], [15.6, 12.1], [15.6, 32.2], [15.6, -0.3], [15.6, 104.8], [15.6, 19.8], [15.5, -12.7], [15.5, 7.4], [15.5, 27.5], [15.5, 80], [15.5, -5], [15.5, -90], [15.5, 47.5], [15.5, 100], [15.5, 15.1], [15.5, 120.1], [15.5, 35.1], [15.5, 2.7], [15.5, 22.7], [15.5, 75.2], [15.5, -9.7], [15.5, -94.7], [15.5, 42.8], [15.5, 10.3], [15.4, 30.4], [15.4, -2.1], [15.4, -87.1], [15.4, 50.4], [15.4, 103], [15.4, 18], [15.4, -14.5], [15.4, 123], [15.4, 38], [15.4, 5.6], [15.4, 25.6], [15.4, 78.2], [15.4, -6.8], [15.4, -91.8], [15.4, 45.7], [15.4, 98.2], [15.4, 13.2], [15.4, 33.3], [15.3, 0.8], [15.3, 105.9], [15.3, 20.9], [15.3, -11.6], [15.3, 8.5], [15.3, 28.6], [15.3, -3.9], [15.3, -88.9], [15.3, 48.6], [15.3, 101.2], [15.3, 16.2], [15.3, -16.3], [15.3, 121.2], [15.3, 36.2], [15.3, 3.8], [15.3, 23.8], [15.3, 76.4], [15.2, -8.6], [15.2, -93.6], [15.2, 43.9], [15.2, 11.4], [15.2, 31.5], [15.2, -1], [15.2, -85.9], [15.2, 104.1], [15.2, 19.1], [15.2, -13.4], [15.2, 6.7], [15.2, 26.8], [15.2, 79.3], [15.2, -5.7], [15.2, -90.7], [15.2, 46.8], [15.2, 99.4], [15.2, 14.4], [15.1, 34.4], [15.1, 2], [15.1, 107], [15.1, 22], [15.1, 74.6], [15.1, -10.4], [15.1, 9.6], [15.1, 29.7], [15.1, -2.8], [15.1, -87.8], [15.1, 102.3], [15.1, 17.3], [15.1, -15.2], [15.1, 122.3], [15.1, 37.4], [15.1, 4.9], [15, 25], [15, 77.5], [15, -7.5], [15, -92.5], [15, 45], [15, 97.5], [15, 12.6], [15, 32.6], [15, 0.2], [15, -84.8], [15, 105.2], [15, 20.2], [15, -12.2], [15, 7.8], [15, 27.9], [15, -4.6], [15, -89.6], [14.9, 47.9], [14.9, 100.5], [14.9, 15.5], [14.9, 120.5], [14.9, 35.5], [14.9, 3.1], [14.9, 23.1], [14.9, 75.7], [14.9, -9.3], [14.9, 43.2], [14.9, 10.7], [14.9, 30.8], [14.9, -1.7], [14.9, -86.6], [14.9, 103.4], [14.9, 18.4], [14.9, -14.1], [14.8, 38.5], [14.8, 6], [14.8, 26.1], [14.8, 78.6], [14.8, -6.4], [14.8, -91.4], [14.8, 46.1], [14.8, 98.7], [14.8, 13.7], [14.8, 33.7], [14.8, 1.3], [14.8, -83.7], [14.8, 106.3], [14.8, 21.3], [14.8, -11.1], [14.8, 8.9], [14.7, 29], [14.7, -3.5], [14.7, -88.4], [14.7, 101.6], [14.7, 16.6], [14.7, -15.9], [14.7, 121.6], [14.7, 36.7], [14.7, 4.2], [14.7, 24.3], [14.7, 76.8], [14.7, -8.2], [14.7, -93.2], [14.7, 44.3], [14.7, 11.9], [14.7, 31.9], [14.7, -0.5], [14.7, -85.5], [14.6, 104.5], [14.6, 19.5], [14.6, -12.9], [14.6, 7.1], [14.6, 27.2], [14.6, 79.7], [14.6, -5.3], [14.6, -90.3], [14.6, 47.3], [14.6, 99.8], [14.6, 14.8], [14.6, 34.9], [14.6, 2.4], [14.6, 107.4], [14.6, 22.5], [14.6, 75], [14.6, -10], [14.5, 10.1], [14.5, 30.1], [14.5, -2.3], [14.5, -87.3], [14.5, 102.7], [14.5, 17.7], [14.5, -14.7], [14.5, 122.8], [14.5, 37.8], [14.5, 5.3], [14.5, 25.4], [14.5, 77.9], [14.5, -7.1], [14.5, -92.1], [14.5, 45.4], [14.5, 98], [14.5, 13], [14.5, 33], [14.4, 0.6], [14.4, -84.4], [14.4, 105.6], [14.4, 20.6], [14.4, -11.8], [14.4, 8.2], [14.4, 28.3], [14.4, -4.2], [14.4, -89.1], [14.4, 100.9], [14.4, 15.9], [14.4, -16.6], [14.4, 121], [14.4, 36], [14.4, 3.5], [14.4, 23.6], [14.3, 76.1], [14.3, -8.9], [14.3, 11.2], [14.3, 31.2], [14.3, -1.2], [14.3, -86.2], [14.3, 103.8], [14.3, 18.8], [14.3, -13.6], [14.3, 38.9], [14.3, 6.4], [14.3, 26.5], [14.3, 79], [14.3, -6], [14.3, -90.9], [14.3, 46.6], [14.3, 99.1], [14.3, 14.1], [14.2, 34.2], [14.2, 1.7], [14.2, -83.3], [14.2, 106.7], [14.2, 21.8], [14.2, 74.3], [14.2, -10.7], [14.2, 9.4], [14.2, 29.4], [14.2, -3], [14.2, -88], [14.2, 102], [14.2, 17], [14.2, -15.4], [14.2, 122.1], [14.2, 37.1], [14.2, 4.6], [14.1, 24.7], [14.1, 77.2], [14.1, -7.8], [14.1, 44.8], [14.1, 97.3], [14.1, 12.3], [14.1, 32.4], [14.1, -0.1], [14.1, -85.1], [14.1, 104.9], [14.1, 20], [14.1, -12.5], [14.1, 7.6], [14.1, 27.6], [14.1, -4.8], [14, -89.8], [14, 100.2], [14, 15.2], [14, 120.3], [14, 35.3], [14, 2.8], [14, 22.9], [14, 75.4], [14, -9.6], [14, 10.5], [14, 30.5], [14, -1.9], [14, -86.9], [14, 103.1], [14, 18.1], [14, -14.3], [13.9, 123.2], [13.9, 38.2], [13.9, 5.7], [13.9, 25.8], [13.9, 78.3], [13.9, -6.7], [13.9, -91.6], [13.9, 45.9], [13.9, 98.4], [13.9, 13.4], [13.9, 33.5], [13.9, 1], [13.9, -84], [13.9, 106.1], [13.9, 21.1], [13.9, -11.4], [13.9, 8.7], [13.8, 28.7], [13.8, -3.7], [13.8, -88.7], [13.8, 101.3], [13.8, 16.3], [13.8, -16.1], [13.8, 121.4], [13.8, 36.4], [13.8, 3.9], [13.8, 24], [13.8, 76.5], [13.8, -8.5], [13.8, 11.6], [13.8, 31.7], [13.8, -0.8], [13.8, -85.8], [13.7, 104.2], [13.7, 19.3], [13.7, -13.2], [13.7, 39.3], [13.7, 6.9], [13.7, 26.9], [13.7, 79.5], [13.7, -5.5], [13.7, -90.5], [13.7, 99.5], [13.7, 14.5], [13.7, 34.6], [13.7, 2.1], [13.7, 107.2], [13.7, 22.2], [13.7, 74.7], [13.7, -10.3], [13.6, 9.8], [13.6, 29.9], [13.6, -2.6], [13.6, -87.6], [13.6, 102.4], [13.6, 17.5], [13.6, -15], [13.6, 122.5], [13.6, 37.5], [13.6, 5.1], [13.6, 25.1], [13.6, 77.6], [13.6, -7.3], [13.6, 45.2], [13.6, 97.7], [13.6, 12.7], [13.6, 32.8], [13.5, 0.3], [13.5, -84.7], [13.5, 105.4], [13.5, 20.4], [13.5, -12.1], [13.5, 40.4], [13.5, 8], [13.5, 28], [13.5, -4.4], [13.5, -89.4], [13.5, 100.6], [13.5, 15.6], [13.5, 120.7], [13.5, 35.7], [13.5, 3.2], [13.5, 23.3], [13.4, 75.8], [13.4, -9.2], [13.4, 10.9], [13.4, 31], [13.4, -1.5], [13.4, -86.5], [13.4, 103.6], [13.4, 18.6], [13.4, -13.9], [13.4, 123.6], [13.4, 38.6], [13.4, 6.2], [13.4, 26.2], [13.4, 78.8], [13.4, -6.2], [13.4, 98.8], [13.4, 13.8], [13.3, 33.9], [13.3, 1.4], [13.3, -83.5], [13.3, 106.5], [13.3, 21.5], [13.3, -11], [13.3, 9.1], [13.3, 29.2], [13.3, -3.3], [13.3, -88.3], [13.3, 101.7], [13.3, 16.8], [13.3, -15.7], [13.3, 121.8], [13.3, 36.8], [13.3, 4.4], [13.2, 24.4], [13.2, 77], [13.2, -8], [13.2, 12], [13.2, 32.1], [13.2, -0.4], [13.2, -85.4], [13.2, 104.7], [13.2, 19.7], [13.2, -12.8], [13.2, 39.8], [13.2, 7.3], [13.2, 27.4], [13.2, -5.1], [13.1, -90.1], [13.1, 99.9], [13.1, 15], [13.1, 35], [13.1, 2.6], [13.1, 107.6], [13.1, 22.6], [13.1, 75.1], [13.1, -9.8], [13.1, 10.2], [13.1, 30.3], [13.1, -2.2], [13.1, -87.2], [13.1, 102.9], [13.1, 17.9], [13.1, -14.6], [13.1, 122.9], [13, 37.9], [13, 5.5], [13, 25.5], [13, 78.1], [13, -6.9], [13, 98.1], [13, 13.1], [13, 33.2], [13, 0.7], [13, -84.2], [13, 105.8], [13, 20.8], [13, -11.7], [13, 40.9], [13, 8.4], [12.9, 28.5], [12.9, -4], [12.9, -89], [12.9, 101.1], [12.9, 16.1], [12.9, 121.1], [12.9, 36.1], [12.9, 3.7], [12.9, 23.7], [12.9, 76.3], [12.9, -8.7], [12.9, 11.3], [12.9, 31.4], [12.9, -1.1], [12.9, -86], [12.9, 104], [12.8, 19], [12.8, -13.5], [12.8, 124], [12.8, 39.1], [12.8, 6.6], [12.8, 26.7], [12.8, 79.2], [12.8, -5.8], [12.8, 99.2], [12.8, 14.3], [12.8, 34.3], [12.8, 1.9], [12.8, -83.1], [12.8, 106.9], [12.8, 21.9], [12.8, -10.5], [12.7, 9.5], [12.7, 29.6], [12.7, -2.9], [12.7, -87.9], [12.7, 102.2], [12.7, 17.2], [12.7, -15.3], [12.7, 122.2], [12.7, 37.3], [12.7, 4.8], [12.7, 24.9], [12.7, 77.4], [12.7, -7.6], [12.7, 97.4], [12.7, 12.5], [12.7, 32.5], [12.6, 0.1], [12.6, -84.9], [12.6, 105.1], [12.6, 20.1], [12.6, -12.3], [12.6, 40.2], [12.6, 7.7], [12.6, 27.8], [12.6, -4.7], [12.6, 15.4], [12.6, 120.4], [12.6, 35.4], [12.6, 3], [12.6, 108], [12.6, 23], [12.6, 75.6], [12.5, -9.4], [12.5, 10.6], [12.5, 30.7], [12.5, -1.8], [12.5, -86.7], [12.5, 103.3], [12.5, 18.3], [12.5, -14.2], [12.5, 123.4], [12.5, 38.4], [12.5, 5.9], [12.5, 26], [12.5, 78.5], [12.5, -6.5], [12.5, 98.6], [12.5, 13.6], [12.4, 33.6], [12.4, 1.2], [12.4, -83.8], [12.4, 106.2], [12.4, 21.2], [12.4, -11.2], [12.4, 41.3], [12.4, 8.8], [12.4, 28.9], [12.4, -3.6], [12.4, -88.5], [12.4, 101.5], [12.4, 16.5], [12.4, 121.5], [12.4, 36.6], [12.4, 4.1], [12.3, 24.2], [12.3, 76.7], [12.3, -8.3], [12.3, 11.8], [12.3, 31.8], [12.3, -0.6], [12.3, -85.6], [12.3, 104.4], [12.3, 19.4], [12.3, -13], [12.3, 39.5], [12.3, 7], [12.3, 27.1], [12.3, -5.4], [12.2, 99.7], [12.2, 14.7], [12.2, 34.8], [12.2, 2.3], [12.2, 107.3], [12.2, 22.4], [12.2, -10.1], [12.2, 10], [12.2, 30], [12.2, -2.4], [12.2, -87.4], [12.2, 102.6], [12.2, 17.6], [12.2, -14.8], [12.2, 122.7], [12.2, 37.7], [12.1, 5.2], [12.1, 25.3], [12.1, 77.8], [12.1, -7.2], [12.1, 97.9], [12.1, 12.9], [12.1, 32.9], [12.1, 0.5], [12.1, -84.5], [12.1, 105.5], [12.1, 20.5], [12.1, -11.9], [12.1, 40.6], [12.1, 8.1], [12.1, 28.2], [12, -4.3], [12, 15.8], [12, 120.9], [12, 35.9], [12, 3.4], [12, 108.5], [12, 23.5], [12, 76], [12, -9], [12, 11.1], [12, 31.1], [12, -1.3], [12, -86.3], [12, 103.7], [12, 18.7], [11.9, -13.7], [11.9, 123.8], [11.9, 38.8], [11.9, 6.3], [11.9, 26.4], [11.9, 78.9], [11.9, -6.1], [11.9, 99], [11.9, 14], [11.9, 34.1], [11.9, 1.6], [11.9, -83.4], [11.9, 106.6], [11.9, 21.7], [11.9, -10.8], [11.9, 41.7], [11.9, 9.3], [11.8, 29.3], [11.8, -3.1], [11.8, 101.9], [11.8, 16.9], [11.8, 122], [11.8, 37], [11.8, 4.5], [11.8, 24.6], [11.8, 77.1], [11.8, -7.9], [11.8, 12.2], [11.8, 32.3], [11.8, -0.2], [11.8, -85.2], [11.7, 104.8], [11.7, 19.9], [11.7, -12.6], [11.7, 39.9], [11.7, 7.5], [11.7, 27.5], [11.7, -4.9], [11.7, 100.1], [11.7, 15.1], [11.7, 35.2], [11.7, 2.7], [11.7, 107.8], [11.7, 22.8], [11.7, 75.3], [11.7, -9.7], [11.6, 10.4], [11.6, 30.4], [11.6, -2], [11.6, -87], [11.6, 50.5], [11.6, 103], [11.6, 18], [11.6, -14.4], [11.6, 123.1], [11.6, 38.1], [11.6, 5.6], [11.6, 25.7], [11.6, 78.2], [11.6, -6.8], [11.6, 98.3], [11.6, 13.3], [11.6, -71.7], [11.6, 33.4], [11.5, 0.9], [11.5, -84.1], [11.5, 106], [11.5, 21], [11.5, -11.5], [11.5, 41], [11.5, 8.6], [11.5, 28.6], [11.5, -3.8], [11.5, 48.7], [11.5, 16.2], [11.5, 121.3], [11.5, 36.3], [11.5, 3.8], [11.5, 23.9], [11.4, 76.4], [11.4, -8.6], [11.4, 11.5], [11.4, 31.6], [11.4, -0.9], [11.4, -85.9], [11.4, 104.1], [11.4, 19.2], [11.4, -13.3], [11.4, 124.2], [11.4, 39.2], [11.4, 6.8], [11.4, 26.8], [11.4, -5.6], [11.4, 46.9], [11.4, 99.4], [11.4, 14.4], [11.3, -70.6], [11.3, 34.5], [11.3, 2], [11.3, 107.1], [11.3, 22.1], [11.3, -10.4], [11.3, 42.2], [11.3, 9.7], [11.3, 29.8], [11.3, -2.7], [11.3, 49.8], [11.3, 102.3], [11.3, 17.4], [11.3, 122.4], [11.3, 37.4], [11.3, 5], [11.2, 25], [11.2, 77.5], [11.2, -7.4], [11.2, 45.1], [11.2, 97.6], [11.2, 12.6], [11.2, -72.4], [11.2, 32.7], [11.2, 0.2], [11.2, -84.8], [11.2, 105.3], [11.2, 20.3], [11.2, -12.2], [11.2, 40.3], [11.2, 7.9], [11.2, 27.9], [11.2, -4.5], [11.1, 48], [11.1, 15.5], [11.1, -69.4], [11.1, 35.6], [11.1, 3.1], [11.1, 23.2], [11.1, 75.7], [11.1, -9.3], [11.1, 10.8], [11.1, 30.9], [11.1, -1.6], [11.1, 103.5], [11.1, 18.5], [11.1, -14], [11.1, 123.5], [11, 38.5], [11, 6.1], [11, 26.1], [11, 78.7], [11, -6.3], [11, 46.2], [11, 98.7], [11, 13.7], [11, -71.2], [11, 33.8], [11, 1.3], [11, -83.6], [11, 106.4], [11, 21.4], [11, -11.1], [11, 41.5], [11, 9], [11, 29.1], [10.9, -3.4], [10.9, 49.1], [10.9, 16.7], [10.9, -68.3], [10.9, 121.7], [10.9, 36.7], [10.9, 4.3], [10.9, 24.3], [10.9, 76.9], [10.9, -8.1], [10.9, 44.4], [10.9, 11.9], [10.9, -73.1], [10.9, 32], [10.9, -0.5], [10.9, -85.5], [10.9, 104.6], [10.9, 19.6], [10.8, -12.9], [10.8, 124.6], [10.8, 39.7], [10.8, 7.2], [10.8, 27.3], [10.8, -5.2], [10.8, 47.3], [10.8, 99.8], [10.8, 14.9], [10.8, -70.1], [10.8, 34.9], [10.8, 2.5], [10.8, 22.5], [10.8, -9.9], [10.8, 42.6], [10.8, 10.1], [10.7, 30.2], [10.7, -2.3], [10.7, 50.2], [10.7, 17.8], [10.7, -67.2], [10.7, 122.8], [10.7, 37.8], [10.7, 5.4], [10.7, 25.4], [10.7, 78], [10.7, -7], [10.7, 45.5], [10.7, 98], [10.7, 13], [10.7, -71.9], [10.7, 33.1], [10.7, 0.6], [10.7, -84.3], [10.6, 105.7], [10.6, 20.7], [10.6, -11.8], [10.6, 40.8], [10.6, 8.3], [10.6, 28.4], [10.6, -4.1], [10.6, 48.4], [10.6, 16], [10.6, -69], [10.6, 121], [10.6, 36], [10.6, 3.6], [10.6, 23.6], [10.6, 76.2], [10.6, -8.8], [10.5, 43.7], [10.5, 11.2], [10.5, -73.7], [10.5, 31.3], [10.5, -1.2], [10.5, 103.9], [10.5, 18.9], [10.5, -66.1], [10.5, -13.6], [10.5, 123.9], [10.5, 39], [10.5, 6.5], [10.5, 26.6], [10.5, -5.9], [10.5, 46.6], [10.5, 99.1], [10.5, 14.2], [10.5, -70.8], [10.5, 34.2], [10.4, 1.8], [10.4, -83.2], [10.4, 106.8], [10.4, 21.8], [10.4, -10.6], [10.4, 41.9], [10.4, 9.4], [10.4, 29.5], [10.4, -3], [10.4, 49.6], [10.4, 17.1], [10.4, -67.9], [10.4, 122.1], [10.4, 37.2], [10.4, 4.7], [10.4, 24.8], [10.3, 77.3], [10.3, -7.7], [10.3, 44.8], [10.3, 12.4], [10.3, -72.6], [10.3, 32.4], [10.3, -0], [10.3, -85], [10.3, 105], [10.3, 20], [10.3, -65], [10.3, -12.4], [10.3, 125.1], [10.3, 40.1], [10.3, 7.6], [10.3, 27.7], [10.3, -4.8], [10.3, 47.7], [10.3, 100.3], [10.3, 15.3], [10.2, -69.7], [10.2, 35.3], [10.2, 2.9], [10.2, 22.9], [10.2, -9.5], [10.2, 43], [10.2, 10.5], [10.2, -74.4], [10.2, 30.6], [10.2, -1.9], [10.2, 18.2], [10.2, -66.8], [10.2, 123.3], [10.2, 38.3], [10.2, 5.8], [10.1, 25.9], [10.1, 78.4], [10.1, -6.6], [10.1, 45.9], [10.1, 98.5], [10.1, 13.5], [10.1, -71.5], [10.1, 33.5], [10.1, 1.1], [10.1, -83.9], [10.1, 106.1], [10.1, 21.1], [10.1, -63.8], [10.1, -11.3], [10.1, 41.2], [10.1, 8.7], [10.1, 28.8], [10.1, -3.7], [10.1, 48.9], [10, 16.4], [10, -68.6], [10, 121.4], [10, 36.5], [10, 4], [10, 24.1], [10, 76.6], [10, -8.4], [10, 44.1], [10, 11.7], [10, -73.3], [10, 31.7], [10, -0.7], [10, 104.3], [10, 19.3], [10, -65.7], [10, -13.1], [10, 124.4], [10, 39.4], [9.9, 6.9], [9.9, 27], [9.9, -5.5], [9.9, 47.1], [9.9, 99.6], [9.9, 14.6], [9.9, -70.4], [9.9, 34.7], [9.9, 2.2], [9.9, -82.8], [9.9, 22.3], [9.9, -62.7], [9.9, -10.2], [9.9, 42.3], [9.9, 9.9], [9.9, -75.1], [9.9, 29.9], [9.8, -2.5], [9.8, 17.5], [9.8, -67.5], [9.8, 122.6], [9.8, 37.6], [9.8, 5.1], [9.8, 25.2], [9.8, 77.7], [9.8, -7.3], [9.8, 45.2], [9.8, 12.8], [9.8, -72.2], [9.8, 32.8], [9.8, 0.4], [9.8, 105.4], [9.8, 20.4], [9.8, -64.5], [9.7, -12], [9.7, 40.5], [9.7, 8], [9.7, 28.1], [9.7, -4.4], [9.7, 48.2], [9.7, 100.7], [9.7, 15.7], [9.7, -69.3], [9.7, 35.8], [9.7, 3.3], [9.7, 23.4], [9.7, -61.6], [9.7, -9.1], [9.7, 43.4], [9.7, 11], [9.7, -74], [9.6, 31], [9.6, -1.4], [9.6, 18.6], [9.6, -66.3], [9.6, -13.8], [9.6, 123.7], [9.6, 38.7], [9.6, 6.2], [9.6, 26.3], [9.6, -6.2], [9.6, 46.4], [9.6, 98.9], [9.6, 13.9], [9.6, -71.1], [9.6, 34], [9.6, 1.5], [9.6, -83.5], [9.5, 21.6], [9.5, -63.4], [9.5, -10.9], [9.5, 41.6], [9.5, 9.2], [9.5, 29.2], [9.5, -3.2], [9.5, 49.3], [9.5, 16.8], [9.5, -68.2], [9.5, 121.9], [9.5, 36.9], [9.5, 4.4], [9.5, 24.5], [9.5, 77], [9.5, -8], [9.5, 44.6], [9.4, 12.1], [9.4, -72.9], [9.4, 32.2], [9.4, -0.3], [9.4, 104.7], [9.4, 19.8], [9.4, -65.2], [9.4, -12.7], [9.4, 124.8], [9.4, 39.8], [9.4, 7.4], [9.4, 27.4], [9.4, -5], [9.4, 47.5], [9.4, 100], [9.4, 15], [9.4, -70], [9.4, 35.1], [9.3, 2.6], [9.3, -82.4], [9.3, 22.7], [9.3, -62.3], [9.3, -9.8], [9.3, 42.7], [9.3, 10.3], [9.3, -74.7], [9.3, 30.3], [9.3, -2.1], [9.3, 17.9], [9.3, -67], [9.3, 123], [9.3, 38], [9.3, 5.5], [9.3, 25.6], [9.3, 78.1], [9.2, -6.9], [9.2, 45.7], [9.2, 98.2], [9.2, 13.2], [9.2, -71.8], [9.2, 33.3], [9.2, 0.8], [9.2, 20.9], [9.2, -64.1], [9.2, -11.6], [9.2, 40.9], [9.2, 8.5], [9.2, 28.5], [9.2, -3.9], [9.2, 48.6], [9.2, 16.1], [9.2, -68.8], [9.1, 36.2], [9.1, 3.7], [9.1, -81.2], [9.1, 23.8], [9.1, -61.2], [9.1, -8.7], [9.1, 43.9], [9.1, 11.4], [9.1, -73.6], [9.1, 31.5], [9.1, -1], [9.1, 19.1], [9.1, -65.9], [9.1, -13.4], [9.1, 124.1], [9.1, 39.1], [9.1, 6.7], [9, 26.7], [9, -5.7], [9, 46.8], [9, 99.3], [9, 14.3], [9, -70.7], [9, 34.4], [9, 1.9], [9, -83.1], [9, 22], [9, -63], [9, -10.5], [9, 42.1], [9, 9.6], [9, -75.4], [9, 29.7], [9, -2.8], [8.9, 17.3], [8.9, -67.7], [8.9, 122.3], [8.9, 37.3], [8.9, 4.9], [8.9, 24.9], [8.9, -60.1], [8.9, 77.4], [8.9, -7.5], [8.9, 45], [8.9, 12.5], [8.9, -72.5], [8.9, 32.6], [8.9, 0.1], [8.9, 20.2], [8.9, -64.8], [8.9, -12.3], [8.9, 125.2], [8.9, 40.2], [8.8, 7.8], [8.8, 27.8], [8.8, -4.6], [8.8, 47.9], [8.8, 100.4], [8.8, 15.4], [8.8, -69.5], [8.8, 35.5], [8.8, 3], [8.8, -81.9], [8.8, 23.1], [8.8, -61.9], [8.8, -9.4], [8.8, 43.2], [8.8, 10.7], [8.8, -74.3], [8.8, 30.8], [8.8, -1.7], [8.7, 18.4], [8.7, -66.6], [8.7, 123.4], [8.7, 38.4], [8.7, 6], [8.7, 26], [8.7, -6.4], [8.7, 46.1], [8.7, 98.6], [8.7, 13.6], [8.7, -71.3], [8.7, 33.7], [8.7, 1.2], [8.7, 21.3], [8.7, -63.7], [8.7, -11.2], [8.6, 41.4], [8.6, 8.9], [8.6, -76.1], [8.6, 29], [8.6, -3.5], [8.6, 49], [8.6, 16.6], [8.6, -68.4], [8.6, 121.6], [8.6, 36.6], [8.6, 4.2], [8.6, -80.8], [8.6, 24.2], [8.6, -60.8], [8.6, -8.2], [8.6, 44.3], [8.6, 11.8], [8.6, -73.2], [8.5, 31.9], [8.5, -0.6], [8.5, 19.5], [8.5, -65.5], [8.5, -13], [8.5, 124.5], [8.5, 39.6], [8.5, 7.1], [8.5, 27.2], [8.5, -5.3], [8.5, 47.2], [8.5, 99.7], [8.5, 14.8], [8.5, -70.2], [8.5, 34.8], [8.5, 2.4], [8.5, 22.4], [8.4, -62.6], [8.4, -10], [8.4, 42.5], [8.4, 10], [8.4, -75], [8.4, 30.1], [8.4, -2.4], [8.4, 17.7], [8.4, -67.3], [8.4, 122.7], [8.4, 37.7], [8.4, 5.3], [8.4, -79.7], [8.4, 25.3], [8.4, -59.6], [8.4, 77.9], [8.4, -7.1], [8.4, 45.4], [8.4, 12.9], [8.3, -72], [8.3, 33], [8.3, 0.5], [8.3, 20.6], [8.3, -64.4], [8.3, -11.9], [8.3, 125.7], [8.3, 40.7], [8.3, 8.2], [8.3, -76.8], [8.3, 28.3], [8.3, -4.2], [8.3, 48.3], [8.3, 100.9], [8.3, 15.9], [8.3, -69.1], [8.3, 35.9], [8.3, 3.5], [8.3, -81.5], [8.2, 23.5], [8.2, -61.4], [8.2, -8.9], [8.2, 43.6], [8.2, 11.1], [8.2, -73.8], [8.2, 31.2], [8.2, -1.3], [8.2, 18.8], [8.2, -66.2], [8.2, 123.8], [8.2, 38.9], [8.2, 6.4], [8.2, -78.6], [8.2, 26.5], [8.2, -58.5], [8.2, -6], [8.2, 46.5], [8.1, 99], [8.1, 14.1], [8.1, -70.9], [8.1, 34.1], [8.1, 1.7], [8.1, 21.7], [8.1, -63.3], [8.1, -10.7], [8.1, 41.8], [8.1, 9.3], [8.1, -75.7], [8.1, 29.4], [8.1, -3.1], [8.1, 17], [8.1, -68], [8.1, 122], [8.1, 37.1], [8, 4.6], [8, -80.4], [8, 24.7], [8, -60.3], [8, -7.8], [8, 44.7], [8, 12.3], [8, -72.7], [8, 32.3], [8, -0.1], [8, 19.9], [8, -65.1], [8, -12.5], [8, 125], [8, 40], [8, 7.5], [8, -77.5], [8, 27.6], [7.9, -4.9], [7.9, 47.6], [7.9, 100.2], [7.9, 15.2], [7.9, -69.8], [7.9, 35.2], [7.9, 2.8], [7.9, 22.8], [7.9, -62.1], [7.9, -9.6], [7.9, 42.9], [7.9, 10.4], [7.9, -74.5], [7.9, 30.5], [7.9, -2], [7.9, 18.1], [7.9, -66.9], [7.8, 123.2], [7.8, 38.2], [7.8, 5.7], [7.8, 25.8], [7.8, -59.2], [7.8, -6.7], [7.8, 45.8], [7.8, 98.4], [7.8, 13.4], [7.8, -71.6], [7.8, 33.4], [7.8, 1], [7.8, 21], [7.8, -63.9], [7.8, -11.4], [7.8, 41.1], [7.8, 8.6], [7.8, -76.3], [7.7, 28.7], [7.7, 81.2], [7.7, -3.8], [7.7, 48.8], [7.7, 101.3], [7.7, 16.3], [7.7, -68.7], [7.7, 36.4], [7.7, 3.9], [7.7, 24], [7.7, -61], [7.7, -8.5], [7.7, 44], [7.7, 11.6], [7.7, -73.4], [7.7, 31.6], [7.7, -0.8], [7.6, 19.2], [7.6, -65.8], [7.6, 124.3], [7.6, 39.3], [7.6, 6.8], [7.6, 26.9], [7.6, -58.1], [7.6, -5.6], [7.6, 47], [7.6, 99.5], [7.6, 14.5], [7.6, -70.5], [7.6, 34.6], [7.6, 2.1], [7.6, 22.2], [7.6, -62.8], [7.6, -10.3], [7.6, 42.2], [7.5, 9.8], [7.5, -75.2], [7.5, 29.8], [7.5, -2.6], [7.5, 17.4], [7.5, -67.6], [7.5, 122.5], [7.5, 37.5], [7.5, 5], [7.5, 25.1], [7.5, -59.9], [7.5, -7.4], [7.5, 45.1], [7.5, 12.7], [7.5, -72.3], [7.5, 32.7], [7.5, 0.3], [7.4, 20.3], [7.4, -64.6], [7.4, -12.1], [7.4, 40.4], [7.4, 7.9], [7.4, -77], [7.4, 28], [7.4, -57], [7.4, 80.5], [7.4, -4.5], [7.4, 48.1], [7.4, 100.6], [7.4, 15.6], [7.4, -69.4], [7.4, 35.7], [7.4, 3.2], [7.4, 23.3], [7.4, -61.7], [7.4, -9.2], [7.3, 43.3], [7.3, 10.9], [7.3, -74.1], [7.3, 30.9], [7.3, -1.5], [7.3, 18.5], [7.3, -66.4], [7.3, 38.6], [7.3, 6.1], [7.3, 26.2], [7.3, -58.8], [7.3, -6.3], [7.3, 46.3], [7.3, 98.8], [7.3, 13.8], [7.3, -71.2], [7.3, 33.9], [7.2, 1.4], [7.2, 21.5], [7.2, -63.5], [7.2, -11], [7.2, 41.5], [7.2, 9.1], [7.2, -75.9], [7.2, 29.1], [7.2, 81.6], [7.2, -3.3], [7.2, 16.7], [7.2, -68.3], [7.2, 36.8], [7.2, 4.3], [7.2, 24.4], [7.1, -60.6], [7.1, -8.1], [7.1, 44.5], [7.1, 12], [7.1, -73], [7.1, 32.1], [7.1, -0.4], [7.1, 19.7], [7.1, -65.3], [7.1, 39.7], [7.1, 7.3], [7.1, -77.7], [7.1, 27.3], [7.1, -57.7], [7.1, -5.1], [7.1, 47.4], [7.1, 99.9], [7.1, 14.9], [7.1, -70.1], [7, 35], [7, 2.5], [7, 22.6], [7, -62.4], [7, -9.9], [7, 42.6], [7, 10.2], [7, -74.8], [7, 30.2], [7, -2.2], [7, 17.8], [7, -67.1], [7, 37.9], [7, 5.4], [6.9, 25.5], [6.9, -59.5], [6.9, -7], [6.9, 45.6], [6.9, 13.1], [6.9, -71.9], [6.9, 33.2], [6.9, 0.7], [6.9, 20.8], [6.9, -64.2], [6.9, 40.8], [6.9, 8.4], [6.9, -76.6], [6.9, 28.4], [6.9, -56.6], [6.9, 81], [6.9, -4], [6.8, 101], [6.8, 16], [6.8, -68.9], [6.8, 36.1], [6.8, 3.6], [6.8, 23.7], [6.8, -61.3], [6.8, -8.8], [6.8, 43.8], [6.8, 11.3], [6.8, -73.7], [6.8, 31.4], [6.8, -1.1], [6.8, 19], [6.8, -66], [6.8, 39], [6.7, 6.6], [6.7, 26.6], [6.7, -58.4], [6.7, -5.8], [6.7, 46.7], [6.7, 99.2], [6.7, 14.2], [6.7, -70.8], [6.7, 34.3], [6.7, 1.8], [6.7, 21.9], [6.7, -63.1], [6.7, -10.6], [6.7, 42], [6.7, 9.5], [6.7, -75.5], [6.7, 29.6], [6.7, -55.4], [6.7, -2.9], [6.6, 17.2], [6.6, -67.8], [6.6, 37.2], [6.6, 4.8], [6.6, 24.8], [6.6, -60.2], [6.6, -7.6], [6.6, 44.9], [6.6, 12.4], [6.6, -72.6], [6.6, 32.5], [6.6, 0], [6.6, 20.1], [6.6, -64.9], [6.5, 40.1], [6.5, 7.7], [6.5, -77.3], [6.5, 27.7], [6.5, -57.2], [6.5, -4.7], [6.5, 47.8], [6.5, 100.3], [6.5, 15.3], [6.5, -69.6], [6.5, 35.4], [6.5, 2.9], [6.5, 23], [6.5, -62], [6.5, -9.5], [6.5, 43.1], [6.5, 10.6], [6.5, -74.4], [6.5, 30.7], [6.4, -1.8], [6.4, 18.3], [6.4, -66.7], [6.4, 38.3], [6.4, 5.9], [6.4, 25.9], [6.4, -59.1], [6.4, -6.5], [6.4, 46], [6.4, 13.5], [6.4, -71.4], [6.4, 33.6], [6.4, 1.1], [6.4, 21.2], [6.3, -63.8], [6.3, 41.3], [6.3, 8.8], [6.3, -76.2], [6.3, 28.9], [6.3, -56.1], [6.3, -3.6], [6.3, 101.4], [6.3, 16.5], [6.3, -68.5], [6.3, 36.5], [6.3, 4.1], [6.3, 24.1], [6.3, -60.9], [6.3, -8.3], [6.3, 44.2], [6.3, 11.7], [6.3, -73.3], [6.2, 116.8], [6.2, 31.8], [6.2, -0.7], [6.2, 19.4], [6.2, -65.6], [6.2, 39.5], [6.2, 7], [6.2, -78], [6.2, 27.1], [6.2, -57.9], [6.2, -5.4], [6.2, 47.1], [6.2, 99.6], [6.2, 14.7], [6.2, -70.3], [6.2, 34.7], [6.2, 2.3], [6.1, 22.3], [6.1, -62.7], [6.1, -10.1], [6.1, 42.4], [6.1, 9.9], [6.1, -75.1], [6.1, 30], [6.1, -55], [6.1, -2.5], [6.1, 17.6], [6.1, -67.4], [6.1, 37.6], [6.1, 5.2], [6.1, 25.2], [6.1, -59.7], [6.1, -7.2], [6.1, 45.3], [6, 12.8], [6, -72.1], [6, 32.9], [6, 0.4], [6, 20.5], [6, -64.5], [6, 40.6], [6, 8.1], [6, -76.9], [6, 28.2], [6, -56.8], [6, -4.3], [6, 100.8], [6, 15.8], [6, -69.2], [6, 35.8], [5.9, 3.4], [5.9, 23.4], [5.9, -61.6], [5.9, -9], [5.9, 43.5], [5.9, 11], [5.9, -73.9], [5.9, 116.1], [5.9, 31.1], [5.9, -53.9], [5.9, -1.4], [5.9, 18.7], [5.9, -66.3], [5.9, 38.8], [5.9, 6.3], [5.9, -78.7], [5.9, 26.4], [5.9, -58.6], [5.9, -6.1], [5.8, 46.4], [5.8, 14], [5.8, -71], [5.8, 34], [5.8, 1.6], [5.8, 21.6], [5.8, -63.4], [5.8, 41.7], [5.8, 9.2], [5.8, -75.8], [5.8, 29.3], [5.8, -55.7], [5.8, -3.2], [5.8, 101.9], [5.8, 16.9], [5.8, -68.1], [5.7, 37], [5.7, 24.6], [5.7, -60.4], [5.7, -7.9], [5.7, 44.6], [5.7, 12.2], [5.7, -72.8], [5.7, 117.2], [5.7, 32.2], [5.7, -0.2], [5.7, 19.8], [5.7, -65.2], [5.7, 39.9], [5.7, 7.4], [5.7, -77.6], [5.7, 27.5], [5.6, -57.5], [5.6, -5], [5.6, 47.5], [5.6, 100.1], [5.6, 15.1], [5.6, -69.9], [5.6, 35.1], [5.6, 22.7], [5.6, -62.2], [5.6, -9.7], [5.6, 42.8], [5.6, 10.3], [5.6, -74.6], [5.6, 115.4], [5.6, 30.4], [5.6, -54.6], [5.6, -2.1], [5.6, 18], [5.5, -67], [5.5, 38.1], [5.5, 5.6], [5.5, 25.7], [5.5, -59.3], [5.5, -6.8], [5.5, 45.7], [5.5, 13.3], [5.5, -71.7], [5.5, 33.3], [5.5, 20.9], [5.5, -64.1], [5.5, 41], [5.5, 8.5], [5.5, -76.4], [5.4, 28.6], [5.4, -56.4], [5.4, -3.9], [5.4, 101.2], [5.4, 16.2], [5.4, -68.8], [5.4, 36.3], [5.4, 23.9], [5.4, -61.1], [5.4, -8.6], [5.4, 43.9], [5.4, 11.5], [5.4, -73.5], [5.4, 116.5], [5.4, 31.5], [5.4, -53.5], [5.3, 19.1], [5.3, -65.9], [5.3, 39.2], [5.3, 6.7], [5.3, -78.3], [5.3, 26.8], [5.3, -58.2], [5.3, -5.7], [5.3, 46.9], [5.3, 14.4], [5.3, -70.6], [5.3, 34.5], [5.3, 22.1], [5.3, -62.9], [5.3, 42.1], [5.2, 9.7], [5.2, -75.3], [5.2, 114.7], [5.2, 29.7], [5.2, -55.3], [5.2, -2.7], [5.2, 17.3], [5.2, -67.7], [5.2, 37.4], [5.2, 25], [5.2, -60], [5.2, -7.5], [5.2, 45], [5.2, 12.6], [5.2, -72.4], [5.2, 32.6], [5.2, -52.3], [5.1, 20.2], [5.1, -64.7], [5.1, 40.3], [5.1, 7.8], [5.1, -77.1], [5.1, 27.9], [5.1, -57.1], [5.1, -4.6], [5.1, 100.5], [5.1, 15.5], [5.1, -69.5], [5.1, 35.6], [5.1, 23.2], [5.1, -61.8], [5.1, -9.3], [5, 43.2], [5, 10.8], [5, -74.2], [5, 115.8], [5, 30.8], [5, -54.2], [5, 18.4], [5, -66.6], [5, 38.5], [5, -78.9], [5, 26.1], [5, -58.9], [5, -6.4], [5, 46.2], [5, 13.7], [5, -71.3], [5, 33.8], [4.9, 21.4], [4.9, -63.6], [4.9, 41.4], [4.9, 9], [4.9, -76], [4.9, 29], [4.9, -56], [4.9, 101.6], [4.9, 16.6], [4.9, -68.4], [4.9, 36.7], [4.9, 24.3], [4.8, -60.7], [4.8, -8.2], [4.8, 44.4], [4.8, 11.9], [4.8, -73.1], [4.8, 116.9], [4.8, 32], [4.8, -53], [4.8, 19.6], [4.8, -65.4], [4.8, 39.6], [4.8, 7.2], [4.8, -77.8], [4.8, 27.2], [4.8, -57.8], [4.8, -5.2], [4.8, 47.3], [4.8, 14.8], [4.8, -70.2], [4.7, 34.9], [4.7, 22.5], [4.7, -62.5], [4.7, 42.5], [4.7, 10.1], [4.7, -74.9], [4.7, 115.1], [4.7, 30.1], [4.7, -54.8], [4.7, 17.7], [4.7, -67.2], [4.7, 37.8], [4.6, 25.4], [4.6, -59.6], [4.6, -7.1], [4.6, 45.5], [4.6, 13], [4.6, -72], [4.6, 33.1], [4.6, -51.9], [4.6, 20.7], [4.6, -64.3], [4.6, 40.7], [4.6, 8.3], [4.6, -76.7], [4.6, 28.3], [4.6, -56.7], [4.6, 100.9], [4.5, 15.9], [4.5, -69.1], [4.5, 36], [4.5, 23.6], [4.5, -61.4], [4.5, 43.7], [4.5, 11.2], [4.5, -73.8], [4.5, 116.2], [4.5, 31.3], [4.5, -53.7], [4.5, 18.9], [4.5, -66.1], [4.5, 38.9], [4.4, -78.5], [4.4, 26.5], [4.4, -58.5], [4.4, 46.6], [4.4, 14.1], [4.4, -70.9], [4.4, 34.2], [4.4, 21.8], [4.4, -63.2], [4.4, 41.9], [4.4, 9.4], [4.4, -75.6], [4.4, 114.4], [4.4, 29.5], [4.4, -55.5], [4.3, 102], [4.3, 17.1], [4.3, -67.9], [4.3, 37.1], [4.3, 24.7], [4.3, -60.3], [4.3, -7.7], [4.3, 44.8], [4.3, 12.3], [4.3, -72.7], [4.3, 117.4], [4.3, 32.4], [4.3, -52.6], [4.3, 20], [4.3, -65], [4.3, 40], [4.2, -77.4], [4.2, 27.6], [4.2, -57.3], [4.2, 15.2], [4.2, -69.7], [4.2, 35.3], [4.2, 22.9], [4.2, -62.1], [4.2, 43], [4.2, 10.5], [4.2, -74.5], [4.2, 115.6], [4.2, 30.6], [4.1, -54.4], [4.1, 18.2], [4.1, -66.8], [4.1, 38.2], [4.1, -79.2], [4.1, 25.8], [4.1, -59.2], [4.1, 45.9], [4.1, 13.4], [4.1, -71.6], [4.1, 33.5], [4.1, 21.1], [4.1, -63.9], [4, 41.2], [4, -76.3], [4, 113.7], [4, 28.8], [4, -56.2], [4, 101.3], [4, 16.4], [4, -68.6], [4, 36.4], [4, 24], [4, -61], [4, 44.1], [4, 11.6], [4, -73.4], [3.9, 116.7], [3.9, 31.7], [3.9, -53.3], [3.9, 19.3], [3.9, -65.7], [3.9, 39.4], [3.9, -78.1], [3.9, 27], [3.9, -58], [3.9, 14.6], [3.9, -70.4], [3.9, 34.6], [3.8, 22.2], [3.8, -62.8], [3.8, 42.3], [3.8, 9.8], [3.8, -75.2], [3.8, 114.9], [3.8, 29.9], [3.8, -55.1], [3.8, 102.5], [3.8, 17.5], [3.8, -67.5], [3.8, 37.5], [3.8, 25.1], [3.8, -59.8], [3.8, 45.2], [3.8, 12.7], [3.7, -72.2], [3.7, 32.8], [3.7, -52.2], [3.7, 20.4], [3.7, -64.6], [3.7, 40.5], [3.7, -77], [3.7, 113.1], [3.7, 28.1], [3.7, -56.9], [3.7, 100.7], [3.7, 15.7], [3.7, -69.3], [3.7, 35.7], [3.6, 23.3], [3.6, -61.7], [3.6, 43.4], [3.6, 95.9], [3.6, 10.9], [3.6, -74], [3.6, 116], [3.6, 31], [3.6, -54], [3.6, 18.6], [3.6, -66.4], [3.6, 38.7], [3.6, -78.8], [3.6, 26.3], [3.6, -58.7], [3.6, 46.3], [3.5, 13.9], [3.5, -71.1], [3.5, 33.9], [3.5, 21.5], [3.5, -63.5], [3.5, 41.6], [3.5, 9.1], [3.5, -75.9], [3.5, 114.2], [3.5, 29.2], [3.5, -55.8], [3.5, 101.8], [3.5, 16.8], [3.5, -68.2], [3.5, 36.9], [3.4, 24.5], [3.4, -60.5], [3.4, 44.5], [3.4, 12.1], [3.4, -72.9], [3.4, 117.1], [3.4, 32.1], [3.4, -52.9], [3.4, 19.7], [3.4, -65.3], [3.4, 39.8], [3.4, -77.7], [3.4, 112.4], [3.4, 27.4], [3.4, -57.6], [3.3, 15], [3.3, -70], [3.3, 35], [3.3, 22.6], [3.3, -62.3], [3.3, 42.7], [3.3, 10.2], [3.3, -74.7], [3.3, 115.3], [3.3, 30.3], [3.3, -54.7], [3.3, 17.9], [3.3, -67.1], [3.2, 38], [3.2, -79.5], [3.2, 25.6], [3.2, -59.4], [3.2, 45.6], [3.2, 13.2], [3.2, -71.8], [3.2, 33.2], [3.2, -51.8], [3.2, 20.8], [3.2, -64.2], [3.2, 40.9], [3.2, -76.5], [3.2, 113.5], [3.1, 28.5], [3.1, -56.5], [3.1, 101.1], [3.1, 16.1], [3.1, -68.9], [3.1, 36.2], [3.1, 23.8], [3.1, -61.2], [3.1, 43.8], [3.1, 96.3], [3.1, 11.4], [3.1, -73.6], [3.1, 116.4], [3.1, 31.4], [3.1, -53.6], [3.1, 19], [3, -66], [3, 39.1], [3, -78.4], [3, 26.7], [3, -58.3], [3, 14.3], [3, -70.7], [3, 34.4], [3, 22], [3, -63], [3, 42], [3, 9.6], [3, -75.4], [2.9, 114.6], [2.9, 29.6], [2.9, -55.4], [2.9, 102.2], [2.9, 17.2], [2.9, -67.8], [2.9, 37.3], [2.9, 24.9], [2.9, -60.1], [2.9, 44.9], [2.9, 97.5], [2.9, 12.5], [2.9, -72.5], [2.9, 117.5], [2.9, 32.5], [2.9, -52.4], [2.8, 20.1], [2.8, -64.8], [2.8, 40.2], [2.8, -77.2], [2.8, 112.8], [2.8, 27.8], [2.8, -57.2], [2.8, 15.4], [2.8, -69.6], [2.8, 35.5], [2.8, 23.1], [2.8, -61.9], [2.8, 43.1], [2.7, 10.7], [2.7, -74.3], [2.7, 115.7], [2.7, 30.7], [2.7, -54.3], [2.7, 18.3], [2.7, -66.7], [2.7, 38.4], [2.7, -79], [2.7, 26], [2.7, -59], [2.7, 13.6], [2.7, -71.4], [2.7, 33.7], [2.7, -51.3], [2.6, 21.3], [2.6, -63.7], [2.6, 41.3], [2.6, -76.1], [2.6, 113.9], [2.6, 28.9], [2.6, -56.1], [2.6, 16.5], [2.6, -68.5], [2.6, 36.6], [2.6, 24.2], [2.6, -60.8], [2.5, 44.2], [2.5, 96.8], [2.5, 11.8], [2.5, -73.2], [2.5, 116.8], [2.5, 31.9], [2.5, -53.1], [2.5, 19.5], [2.5, -65.5], [2.5, 39.5], [2.5, -77.9], [2.5, 112.1], [2.5, 27.1], [2.5, -57.9], [2.5, 14.7], [2.5, -70.3], [2.5, 34.8], [2.4, 22.4], [2.4, -62.6], [2.4, 42.4], [2.4, 10], [2.4, -75], [2.4, 115], [2.4, 30], [2.4, -54.9], [2.4, 102.6], [2.4, 17.6], [2.4, -67.3], [2.4, 37.7], [2.4, -79.7], [2.4, 25.3], [2.4, -59.7], [2.3, 97.9], [2.3, 12.9], [2.3, -72.1], [2.3, 33], [2.3, -52], [2.3, 20.6], [2.3, -64.4], [2.3, 40.6], [2.3, -76.8], [2.3, 113.2], [2.3, 28.2], [2.3, -56.8], [2.3, 15.8], [2.3, -69.2], [2.2, 35.9], [2.2, 23.5], [2.2, -61.5], [2.2, 43.6], [2.2, 11.1], [2.2, -73.9], [2.2, 116.1], [2.2, 31.2], [2.2, -53.8], [2.2, 18.8], [2.2, -66.2], [2.2, 38.8], [2.2, -78.6], [2.1, 111.4], [2.1, 26.4], [2.1, -58.6], [2.1, 14], [2.1, -71], [2.1, 34.1], [2.1, -50.9], [2.1, 21.7], [2.1, -63.3], [2.1, 41.7], [2.1, 9.3], [2.1, -75.7], [2.1, 114.3], [2.1, 29.4], [2.1, -55.6], [2, 17], [2, -68], [2, 37], [2, 24.6], [2, -60.4], [2, 44.7], [2, 97.2], [2, 12.2], [2, -72.8], [2, 117.3], [2, 32.3], [2, -52.7], [2, 19.9], [2, -65.1], [2, 39.9], [1.9, -77.5], [1.9, 112.5], [1.9, 27.5], [1.9, -57.4], [1.9, 15.1], [1.9, -69.8], [1.9, 35.2], [1.9, 22.8], [1.9, -62.2], [1.9, 42.9], [1.9, 10.4], [1.9, -74.6], [1.9, 115.5], [1.9, 30.5], [1.9, -54.5], [1.8, 18.1], [1.8, -66.9], [1.8, 38.1], [1.8, -79.3], [1.8, 110.7], [1.8, 25.7], [1.8, -59.3], [1.8, 98.3], [1.8, 13.3], [1.8, -71.7], [1.8, 33.4], [1.8, -51.6], [1.8, 21], [1.8, -64], [1.8, 41.1], [1.7, -76.4], [1.7, 113.6], [1.7, 28.7], [1.7, -56.3], [1.7, 16.3], [1.7, -68.7], [1.7, 36.3], [1.7, 23.9], [1.7, -61.1], [1.7, 44], [1.7, 11.5], [1.7, -73.5], [1.7, 116.6], [1.7, 31.6], [1.7, -53.4], [1.6, 19.2], [1.6, -65.8], [1.6, 39.2], [1.6, -78.2], [1.6, 111.8], [1.6, 26.9], [1.6, -58.1], [1.6, 14.5], [1.6, -70.5], [1.6, 34.5], [1.6, 22.1], [1.6, -62.9], [1.5, 42.2], [1.5, 9.7], [1.5, -75.3], [1.5, 114.8], [1.5, 29.8], [1.5, -55.2], [1.5, 17.4], [1.5, -67.6], [1.5, 37.4], [1.5, -80], [1.5, 110], [1.5, 25], [1.5, -59.9], [1.5, 97.6], [1.5, 12.6], [1.5, -72.3], [1.5, 117.7], [1.4, 32.7], [1.4, -52.3], [1.4, 20.3], [1.4, -64.7], [1.4, 40.4], [1.4, -77.1], [1.4, 113], [1.4, 28], [1.4, -57], [1.4, 15.6], [1.4, -69.4], [1.4, 35.6], [1.4, 23.2], [1.3, -61.8], [1.3, 43.3], [1.3, 10.8], [1.3, -74.2], [1.3, 115.9], [1.3, 30.9], [1.3, -54.1], [1.3, 18.5], [1.3, -66.5], [1.3, 38.6], [1.3, -78.9], [1.3, 111.1], [1.3, 26.2], [1.3, -58.8], [1.3, 98.7], [1.3, 13.8], [1.3, -71.2], [1.2, 33.8], [1.2, -51.2], [1.2, 21.4], [1.2, -63.6], [1.2, 41.5], [1.2, 9], [1.2, -76], [1.2, 114.1], [1.2, 29.1], [1.2, -55.9], [1.2, 16.7], [1.2, -68.3], [1.2, 36.7], [1.1, 109.3], [1.1, 24.4], [1.1, -60.6], [1.1, 12], [1.1, -73], [1.1, 117], [1.1, 32], [1.1, -53], [1.1, 19.6], [1.1, -65.4], [1.1, 39.7], [1.1, -77.8], [1.1, 112.3], [1.1, 27.3], [1.1, -57.7], [1.1, 99.9], [1, 14.9], [1, -70.1], [1, 34.9], [1, 22.5], [1, -62.4], [1, 42.6], [1, 10.1], [1, -74.8], [1, 115.2], [1, 30.2], [1, -54.8], [1, 17.8], [1, -67.2], [1, 37.9], [0.9, -79.6], [0.9, 110.5], [0.9, 25.5], [0.9, -59.5], [0.9, 98.1], [0.9, 13.1], [0.9, -71.9], [0.9, 33.1], [0.9, -51.9], [0.9, 20.7], [0.9, -64.3], [0.9, 40.8], [0.9, -76.7], [0.9, 113.4], [0.9, 28.4], [0.9, -56.6], [0.8, 16], [0.8, -69], [0.8, 36.1], [0.8, 23.7], [0.8, -61.3], [0.8, 43.7], [0.8, 11.3], [0.8, -73.7], [0.8, 116.3], [0.8, 31.3], [0.8, -53.7], [0.8, 18.9], [0.8, -66.1], [0.8, 39], [0.7, -78.5], [0.7, 111.6], [0.7, 26.6], [0.7, -58.4], [0.7, 99.2], [0.7, 14.2], [0.7, -70.8], [0.7, 34.2], [0.7, -50.7], [0.7, 21.9], [0.7, -63.1], [0.7, 41.9], [0.7, 9.5], [0.7, -75.5], [0.7, 114.5], [0.7, 29.5], [0.7, -55.5], [0.6, 17.1], [0.6, -67.9], [0.6, 37.2], [0.6, 109.8], [0.6, 24.8], [0.6, -60.2], [0.6, 12.4], [0.6, -72.6], [0.6, 117.4], [0.6, 32.4], [0.6, -52.5], [0.6, 20], [0.6, -64.9], [0.5, 40.1], [0.5, -77.3], [0.5, 112.7], [0.5, 27.7], [0.5, -57.3], [0.5, 100.3], [0.5, 15.3], [0.5, -69.7], [0.5, 120.4], [0.5, 35.4], [0.5, 23], [0.5, -62], [0.5, 43], [0.5, 10.6], [0.5, -74.4], [0.5, 115.6], [0.4, 30.6], [0.4, -54.4], [0.4, 18.2], [0.4, -66.8], [0.4, 38.3], [0.4, -79.2], [0.4, 110.9], [0.4, 25.9], [0.4, -59.1], [0.4, 98.5], [0.4, 13.5], [0.4, -71.5], [0.4, 33.6], [0.4, -51.4], [0.4, 21.2], [0.3, -63.8], [0.3, 41.2], [0.3, -76.2], [0.3, 113.8], [0.3, 28.8], [0.3, -56.2], [0.3, 16.4], [0.3, -68.6], [0.3, 121.5], [0.3, 36.5], [0.3, 24.1], [0.3, -60.9], [0.3, 11.7], [0.2, -73.3], [0.2, 116.7], [0.2, 31.7], [0.2, -53.2], [0.2, 19.4], [0.2, -65.6], [0.2, 39.4], [0.2, -78], [0.2, 112], [0.2, 27], [0.2, -58], [0.2, 99.6], [0.2, 14.6], [0.2, -70.4], [0.2, 34.7], [0.2, -50.3], [0.1, 22.3], [0.1, -62.7], [0.1, 42.3], [0.1, 9.9], [0.1, -75.1], [0.1, 114.9], [0.1, 29.9], [0.1, -55], [0.1, 17.5], [0.1, -67.4], [0.1, 122.6], [0.1, 37.6], [0.1, -79.8], [0.1, 110.2], [0.1, 25.2], [0.1, -59.8], [0, 12.8], [0, -72.2], [0, 32.9], [0, -52.1], [0, 20.5], [0, -64.5], [0, 40.5], [-0, -76.9], [-0, 113.1], [-0, 28.1], [-0, -56.9], [-0, 100.7], [-0, 15.7], [-0, -69.3], [-0, 120.8], [-0, 35.8], [-0.1, 23.4], [-0.1, -61.6], [-0.1, 11], [-0.1, -74], [-0.1, 116], [-0.1, 31.1], [-0.1, -53.9], [-0.1, 18.7], [-0.1, -66.3], [-0.1, 123.7], [-0.1, 38.7], [-0.1, -78.7], [-0.1, 111.3], [-0.1, 26.3], [-0.1, -58.7], [-0.2, 98.9], [-0.2, 13.9], [-0.2, -71.1], [-0.2, 34], [-0.2, -51], [-0.2, 21.6], [-0.2, -63.4], [-0.2, 41.6], [-0.2, 9.2], [-0.2, -75.8], [-0.2, 114.2], [-0.2, 29.2], [-0.2, -55.7], [-0.2, 16.9], [-0.2, -68.1], [-0.2, 121.9], [-0.2, 36.9], [-0.3, 109.5], [-0.3, 24.5], [-0.3, -60.5], [-0.3, 12.1], [-0.3, -72.9], [-0.3, 32.2], [-0.3, -52.8], [-0.3, 19.8], [-0.3, -65.2], [-0.3, 39.8], [-0.3, -77.6], [-0.3, 112.4], [-0.3, 27.4], [-0.4, -57.5], [-0.4, 100], [-0.4, 15], [-0.4, -69.9], [-0.4, 120.1], [-0.4, 35.1], [-0.4, -49.9], [-0.4, 22.7], [-0.4, -62.3], [-0.4, 10.3], [-0.4, -74.7], [-0.4, 115.4], [-0.4, 30.4], [-0.4, -54.6], [-0.4, 18], [-0.4, -67], [-0.5, 123], [-0.5, 38], [-0.5, -79.4], [-0.5, 110.6], [-0.5, 25.6], [-0.5, -59.4], [-0.5, 13.2], [-0.5, -71.8], [-0.5, 33.3], [-0.5, -51.7], [-0.5, 20.9], [-0.5, -64.1], [-0.5, 41], [-0.5, -76.5], [-0.6, 113.5], [-0.6, 28.6], [-0.6, -56.4], [-0.6, 101.1], [-0.6, 16.2], [-0.6, -68.8], [-0.6, 121.2], [-0.6, 36.2], [-0.6, -48.8], [-0.6, 23.8], [-0.6, -61.2], [-0.6, 11.4], [-0.6, -73.6], [-0.6, 116.5], [-0.6, 31.5], [-0.6, -53.5], [-0.7, 19.1], [-0.7, -65.9], [-0.7, 39.1], [-0.7, -78.3], [-0.7, 111.7], [-0.7, 26.7], [-0.7, -58.2], [-0.7, 99.3], [-0.7, 14.4], [-0.7, -70.6], [-0.7, 34.4], [-0.7, -50.6], [-0.7, 22], [-0.7, -63], [-0.7, 42.1], [-0.7, 9.6], [-0.8, -75.4], [-0.8, 114.7], [-0.8, 29.7], [-0.8, -55.3], [-0.8, 102.3], [-0.8, 17.3], [-0.8, -67.7], [-0.8, 122.3], [-0.8, 37.3], [-0.8, -80.1], [-0.8, 109.9], [-0.8, 24.9], [-0.8, -60], [-0.8, 12.5], [-0.8, -72.4], [-0.8, 32.6], [-0.8, -52.4], [-0.9, 20.2], [-0.9, -64.8], [-0.9, 40.3], [-0.9, -77.2], [-0.9, 112.9], [-0.9, 27.9], [-0.9, -57.1], [-0.9, 100.5], [-0.9, 15.5], [-0.9, -69.5], [-0.9, 120.5], [-0.9, 35.5], [-0.9, -49.5], [-0.9, 23.1], [-0.9, -61.9], [-1, 10.7], [-1, -74.3], [-1, 115.8], [-1, 30.8], [-1, -54.2], [-1, 18.4], [-1, -66.6], [-1, 123.4], [-1, 38.5], [-1, -79], [-1, 111], [-1, 26.1], [-1, -58.9], [-1, 131.1], [-1, 13.7], [-1, -71.3], [-1, 33.7], [-1, -51.3], [-1.1, 21.3], [-1.1, -63.7], [-1.1, 41.4], [-1.1, -76.1], [-1.1, 114], [-1.1, 29], [-1.1, -56], [-1.1, 101.6], [-1.1, 16.6], [-1.1, -68.4], [-1.1, 121.6], [-1.1, 36.6], [-1.1, -48.3], [-1.1, 24.2], [-1.1, -60.7], [-1.2, 11.9], [-1.2, -73.1], [-1.2, 31.9], [-1.2, -53.1], [-1.2, 19.5], [-1.2, -65.5], [-1.2, 39.6], [-1.2, -77.9], [-1.2, 112.2], [-1.2, 27.2], [-1.2, -57.8], [-1.2, 99.8], [-1.2, 14.8], [-1.2, -70.2], [-1.2, 119.8], [-1.3, 34.8], [-1.3, -50.1], [-1.3, 22.4], [-1.3, -62.5], [-1.3, 10], [-1.3, -74.9], [-1.3, 115.1], [-1.3, 30.1], [-1.3, -54.9], [-1.3, 102.7], [-1.3, 17.7], [-1.3, -67.3], [-1.3, 122.8], [-1.3, 37.8], [-1.3, -47.2], [-1.3, -79.7], [-1.3, 110.4], [-1.3, 25.4], [-1.4, -59.6], [-1.4, 13], [-1.4, -72], [-1.4, 33], [-1.4, -52], [-1.4, 20.6], [-1.4, -64.4], [-1.4, 40.7], [-1.4, -76.8], [-1.4, 113.3], [-1.4, 28.3], [-1.4, -56.7], [-1.4, 100.9], [-1.4, 15.9], [-1.4, -69.1], [-1.5, 120.9], [-1.5, 36], [-1.5, -49], [-1.5, 23.6], [-1.5, -61.4], [-1.5, 11.2], [-1.5, -73.8], [-1.5, 31.2], [-1.5, -53.8], [-1.5, 18.8], [-1.5, -66.2], [-1.5, 38.9], [-1.5, -78.6], [-1.6, 111.5], [-1.6, 26.5], [-1.6, -58.5], [-1.6, 14.1], [-1.6, -70.9], [-1.6, 34.1], [-1.6, -50.8], [-1.6, 21.7], [-1.6, -63.2], [-1.6, -75.6], [-1.6, 114.4], [-1.6, 29.4], [-1.6, -55.6], [-1.6, 102], [-1.7, 17], [-1.7, -68], [-1.7, 122.1], [-1.7, 37.1], [-1.7, -47.9], [-1.7, -80.4], [-1.7, 24.7], [-1.7, -60.3], [-1.7, 12.3], [-1.7, -72.7], [-1.7, 32.3], [-1.7, -52.6], [-1.7, 19.9], [-1.7, -65], [-1.7, 40], [-1.8, -77.4], [-1.8, 112.6], [-1.8, 27.6], [-1.8, -57.4], [-1.8, 132.7], [-1.8, 100.2], [-1.8, 15.2], [-1.8, -69.8], [-1.8, 120.3], [-1.8, 35.3], [-1.8, -49.7], [-1.8, 22.9], [-1.8, -62.1], [-1.8, 10.5], [-1.8, -74.5], [-1.8, 115.5], [-1.8, 30.5], [-1.8, -54.5], [-1.9, 103.1], [-1.9, 18.1], [-1.9, -66.9], [-1.9, 123.2], [-1.9, 38.2], [-1.9, -46.8], [-1.9, -79.3], [-1.9, 110.8], [-1.9, 25.8], [-1.9, -59.2], [-1.9, 13.4], [-1.9, -71.6], [-1.9, 33.5], [-1.9, -51.5], [-1.9, 21.1], [-1.9, -63.9], [-2, -76.3], [-2, 113.7], [-2, 28.7], [-2, -56.3], [-2, 133.8], [-2, 101.3], [-2, 16.3], [-2, -68.7], [-2, 121.4], [-2, 36.4], [-2, -48.6], [-2, 24], [-2, -61], [-2, 11.6], [-2, -73.4], [-2, 31.6], [-2, -53.3], [-2.1, 19.2], [-2.1, -65.7], [-2.1, 39.3], [-2.1, -45.7], [-2.1, -78.1], [-2.1, 111.9], [-2.1, 26.9], [-2.1, -58.1], [-2.1, 99.5], [-2.1, 14.5], [-2.1, -70.5], [-2.1, 119.6], [-2.1, 34.6], [-2.1, -50.4], [-2.1, 22.2], [-2.1, -62.8], [-2.2, 9.8], [-2.2, -75.2], [-2.2, 114.8], [-2.2, 29.8], [-2.2, -55.1], [-2.2, 134.9], [-2.2, 102.4], [-2.2, 17.4], [-2.2, -67.5], [-2.2, 122.5], [-2.2, 37.5], [-2.2, -47.5], [-2.2, -79.9], [-2.2, 25.1], [-2.2, -59.9], [-2.2, 12.7], [-2.2, -72.3], [-2.3, 32.8], [-2.3, -52.2], [-2.3, 20.4], [-2.3, -64.6], [-2.3, 40.4], [-2.3, -44.6], [-2.3, -77], [-2.3, 113], [-2.3, 28], [-2.3, -57], [-2.3, 133.1], [-2.3, 100.6], [-2.3, 15.6], [-2.3, -69.4], [-2.3, 120.7], [-2.3, 35.7], [-2.3, -49.3], [-2.4, 23.3], [-2.4, -61.7], [-2.4, 10.9], [-2.4, -74.1], [-2.4, 31], [-2.4, -54], [-2.4, 136], [-2.4, 103.5], [-2.4, 18.6], [-2.4, -66.4], [-2.4, 38.6], [-2.4, -46.4], [-2.4, -78.8], [-2.4, 111.2], [-2.4, 26.2], [-2.4, -58.8], [-2.4, 13.8], [-2.5, -71.2], [-2.5, 33.9], [-2.5, -51.1], [-2.5, 21.5], [-2.5, -63.5], [-2.5, -75.9], [-2.5, 114.1], [-2.5, 29.1], [-2.5, -55.8], [-2.5, 134.2], [-2.5, 101.7], [-2.5, 16.8], [-2.5, -68.2], [-2.5, 121.8], [-2.5, 36.8], [-2.5, -48.2], [-2.5, -80.6], [-2.6, 24.4], [-2.6, -60.6], [-2.6, 12], [-2.6, -73], [-2.6, 32.1], [-2.6, -52.9], [-2.6, 137.1], [-2.6, 19.7], [-2.6, -65.3], [-2.6, 39.7], [-2.6, -45.2], [-2.6, -77.7], [-2.6, 112.3], [-2.6, 27.3], [-2.6, -57.6], [-2.7, 99.9], [-2.7, 14.9], [-2.7, -70], [-2.7, 120], [-2.7, 35], [-2.7, -50], [-2.7, 22.6], [-2.7, -62.4], [-2.7, 10.2], [-2.7, -74.8], [-2.7, 30.3], [-2.7, -54.7], [-2.7, 135.3], [-2.7, 102.9], [-2.7, 17.9], [-2.7, -67.1], [-2.7, 37.9], [-2.7, -47.1], [-2.8, -79.5], [-2.8, 25.5], [-2.8, -59.5], [-2.8, 13.1], [-2.8, -71.9], [-2.8, 33.2], [-2.8, -51.8], [-2.8, 138.2], [-2.8, 20.8], [-2.8, -64.2], [-2.8, -44.1], [-2.8, -76.6], [-2.8, 113.4], [-2.8, 28.5], [-2.8, -56.5], [-2.9, 133.5], [-2.9, 101], [-2.9, 16.1], [-2.9, -68.9], [-2.9, 121.1], [-2.9, 36.1], [-2.9, -48.9], [-2.9, 23.7], [-2.9, -61.3], [-2.9, 11.3], [-2.9, -73.7], [-2.9, 31.4], [-2.9, -53.6], [-2.9, 136.4], [-2.9, 104], [-2.9, 19], [-2.9, -66], [-3, 39], [-3, -45.9], [-3, -78.4], [-3, 26.6], [-3, -58.3], [-3, 14.3], [-3, -70.7], [-3, 119.3], [-3, 34.3], [-3, -50.7], [-3, 139.4], [-3, 21.9], [-3, -63.1], [-3, -43], [-3, -75.5], [-3, 114.6], [-3, 29.6], [-3.1, -55.4], [-3.1, 134.6], [-3.1, 102.2], [-3.1, 17.2], [-3.1, -67.8], [-3.1, 122.2], [-3.1, 37.2], [-3.1, -47.7], [-3.1, -80.2], [-3.1, 24.8], [-3.1, -60.1], [-3.1, 12.4], [-3.1, -72.5], [-3.1, 32.5], [-3.1, -52.5], [-3.1, 137.5], [-3.1, 20.1], [-3.1, -64.9], [-3.2, 40.2], [-3.2, -44.8], [-3.2, -77.3], [-3.2, 112.8], [-3.2, 27.8], [-3.2, -57.2], [-3.2, 15.4], [-3.2, -69.6], [-3.2, 120.4], [-3.2, 35.4], [-3.2, -49.6], [-3.2, 140.5], [-3.2, 23], [-3.2, -62], [-3.2, 10.6], [-3.2, -74.4], [-3.3, 30.7], [-3.3, -54.3], [-3.3, 135.7], [-3.3, 103.3], [-3.3, 18.3], [-3.3, -66.7], [-3.3, 38.4], [-3.3, -46.6], [-3.3, -79.1], [-3.3, 26], [-3.3, -59], [-3.3, 13.6], [-3.3, -71.4], [-3.3, 33.6], [-3.3, -51.4], [-3.3, 138.7], [-3.4, 21.2], [-3.4, -63.8], [-3.4, -43.7], [-3.4, -76.2], [-3.4, 113.9], [-3.4, 28.9], [-3.4, -56.1], [-3.4, 133.9], [-3.4, 101.5], [-3.4, 16.5], [-3.4, -68.5], [-3.4, 121.5], [-3.4, 36.5], [-3.4, -48.4], [-3.4, 141.6], [-3.4, 24.1], [-3.4, -60.8], [-3.5, 11.8], [-3.5, -73.2], [-3.5, 31.8], [-3.5, -53.2], [-3.5, 136.9], [-3.5, 104.4], [-3.5, 19.4], [-3.5, -65.6], [-3.5, 39.5], [-3.5, -45.5], [-3.5, -78], [-3.5, 27.1], [-3.5, -57.9], [-3.5, 14.7], [-3.5, -70.3], [-3.5, 34.7], [-3.5, -50.2], [-3.5, 139.8], [-3.6, 22.3], [-3.6, -62.6], [-3.6, -42.6], [-3.6, -75], [-3.6, 30], [-3.6, -55], [-3.6, 135], [-3.6, 102.6], [-3.6, 17.6], [-3.6, -67.4], [-3.6, 37.7], [-3.6, -47.3], [-3.6, -79.8], [-3.6, 25.3], [-3.6, -59.7], [-3.7, 12.9], [-3.7, -72.1], [-3.7, 32.9], [-3.7, -52.1], [-3.7, 138], [-3.7, 20.5], [-3.7, -64.5], [-3.7, -44.4], [-3.7, -76.9], [-3.7, 28.2], [-3.7, -56.8], [-3.7, 15.8], [-3.7, -69.2], [-3.7, 120.8], [-3.7, 35.9], [-3.8, -49.1], [-3.8, 140.9], [-3.8, 23.5], [-3.8, -61.5], [-3.8, -41.5], [-3.8, 11.1], [-3.8, -73.9], [-3.8, 31.1], [-3.8, -53.9], [-3.8, 136.2], [-3.8, 103.7], [-3.8, 18.7], [-3.8, -66.3], [-3.8, 38.8], [-3.8, -46.2], [-3.8, -78.7], [-3.8, 26.4], [-3.8, -58.6], [-3.9, 14], [-3.9, -71], [-3.9, 34], [-3.9, -50.9], [-3.9, 139.1], [-3.9, 21.6], [-3.9, -63.3], [-3.9, -43.3], [-3.9, -75.7], [-3.9, 29.3], [-3.9, -55.7], [-3.9, 134.4], [-3.9, 101.9], [-3.9, 16.9], [-3.9, -68.1], [-4, 122], [-4, 37], [-4, -48], [-4, 142], [-4, -80.5], [-4, 24.6], [-4, -60.4], [-4, -40.3], [-4, 12.2], [-4, -72.8], [-4, 32.2], [-4, -52.7], [-4, 137.3], [-4, 104.8], [-4, 19.8], [-4, -65.1], [-4, 39.9], [-4, -45.1], [-4, -77.5], [-4.1, 27.5], [-4.1, -57.5], [-4.1, 15.1], [-4.1, -69.9], [-4.1, 35.2], [-4.1, -49.8], [-4.1, 140.2], [-4.1, 22.8], [-4.1, -62.2], [-4.1, -42.2], [-4.1, -74.6], [-4.1, 30.4], [-4.1, -54.6], [-4.1, 135.5], [-4.1, 103], [-4.1, 18], [-4.2, -67], [-4.2, 38.1], [-4.2, -46.9], [-4.2, -79.4], [-4.2, 25.7], [-4.2, -59.3], [-4.2, 13.3], [-4.2, -71.7], [-4.2, 33.4], [-4.2, -51.6], [-4.2, 138.4], [-4.2, 21], [-4.2, -64], [-4.2, -44], [-4.3, -76.4], [-4.3, 28.6], [-4.3, -56.4], [-4.3, 16.2], [-4.3, -68.8], [-4.3, 121.3], [-4.3, 36.3], [-4.3, -48.7], [-4.3, 141.3], [-4.3, 23.9], [-4.3, -61.1], [-4.3, -41], [-4.3, 11.5], [-4.3, -73.5], [-4.3, 31.5], [-4.3, -53.4], [-4.3, 136.6], [-4.4, 104.1], [-4.4, 19.1], [-4.4, -65.8], [-4.4, 39.2], [-4.4, -45.8], [-4.4, -78.2], [-4.4, 26.8], [-4.4, -58.2], [-4.4, 14.4], [-4.4, -70.6], [-4.4, 34.5], [-4.4, -50.5], [-4.4, 139.5], [-4.4, 22.1], [-4.4, -62.9], [-4.4, -42.8], [-4.5, -75.3], [-4.5, 29.7], [-4.5, -55.2], [-4.5, 134.8], [-4.5, 17.3], [-4.5, -67.6], [-4.5, 37.4], [-4.5, -47.6], [-4.5, 142.4], [-4.5, -80], [-4.5, 25], [-4.5, -60], [-4.5, -39.9], [-4.5, 12.6], [-4.5, -72.4], [-4.5, 32.7], [-4.5, -52.3], [-4.6, 137.7], [-4.6, 105.3], [-4.6, 20.3], [-4.6, -64.7], [-4.6, -44.7], [-4.6, -77.1], [-4.6, 27.9], [-4.6, -57.1], [-4.6, 15.5], [-4.6, -69.5], [-4.6, 35.6], [-4.6, -49.4], [-4.6, 140.6], [-4.6, 23.2], [-4.6, -61.8], [-4.7, -41.7], [-4.7, -74.2], [-4.7, 30.9], [-4.7, -54.1], [-4.7, 135.9], [-4.7, 103.4], [-4.7, 18.5], [-4.7, -66.5], [-4.7, 38.5], [-4.7, -46.5], [-4.7, 143.6], [-4.7, -78.9], [-4.7, 26.1], [-4.7, -58.9], [-4.7, -38.8], [-4.7, 13.7], [-4.7, -71.3], [-4.8, 33.8], [-4.8, -51.2], [-4.8, 138.8], [-4.8, 21.4], [-4.8, -63.6], [-4.8, -43.5], [-4.8, -76], [-4.8, 29], [-4.8, -55.9], [-4.8, 16.6], [-4.8, -68.3], [-4.8, 36.7], [-4.8, -48.3], [-4.8, 141.8], [-4.8, -80.7], [-4.8, 24.3], [-4.9, -60.7], [-4.9, -40.6], [-4.9, 11.9], [-4.9, -73.1], [-4.9, 32], [-4.9, -53], [-4.9, 137], [-4.9, 104.6], [-4.9, 19.6], [-4.9, -65.4], [-4.9, 39.6], [-4.9, -45.3], [-4.9, -77.8], [-4.9, 27.2], [-4.9, -57.7], [-4.9, -37.7], [-4.9, 14.8], [-5, -70.1], [-5, 34.9], [-5, -50.1], [-5, 139.9], [-5, 22.5], [-5, -62.5], [-5, -42.4], [-5, -74.9], [-5, 30.2], [-5, -54.8], [-5, 17.8], [-5, -67.2], [-5, 37.8], [-5, -47.2], [-5, 142.9], [-5, -79.6], [-5.1, 25.4], [-5.1, -59.6], [-5.1, -39.5], [-5.1, 13], [-5.1, -72], [-5.1, 33.1], [-5.1, -51.9], [-5.1, 138.1], [-5.1, 20.7], [-5.1, -64.3], [-5.1, -44.2], [-5.1, -76.7], [-5.1, 28.4], [-5.1, -56.6], [-5.2, 16], [-5.2, -69], [-5.2, 36], [-5.2, -49], [-5.2, 141.1], [-5.2, 23.6], [-5.2, -61.4], [-5.2, -41.3], [-5.2, -73.8], [-5.2, 31.3], [-5.2, -53.7], [-5.2, 136.3], [-5.2, 18.9], [-5.2, -66.1], [-5.2, 38.9], [-5.2, -46], [-5.3, 144], [-5.3, -78.5], [-5.3, 26.5], [-5.3, -58.4], [-5.3, -38.4], [-5.3, 14.1], [-5.3, -70.8], [-5.3, 34.2], [-5.3, -50.8], [-5.3, 139.3], [-5.3, 21.8], [-5.3, -63.2], [-5.3, -43.1], [-5.3, -75.6], [-5.3, 29.5], [-5.3, -55.5], [-5.4, 17.1], [-5.4, -67.9], [-5.4, 37.1], [-5.4, -47.8], [-5.4, 142.2], [-5.4, -80.3], [-5.4, 24.7], [-5.4, -60.2], [-5.4, -40.2], [-5.4, 12.3], [-5.4, -72.6], [-5.4, 32.4], [-5.4, -52.6], [-5.4, 137.4], [-5.4, 105], [-5.4, 20], [-5.4, -65], [-5.5, -44.9], [-5.5, -77.4], [-5.5, 27.7], [-5.5, -57.3], [-5.5, -37.3], [-5.5, 15.3], [-5.5, -69.7], [-5.5, 35.3], [-5.5, -49.7], [-5.5, 140.4], [-5.5, 22.9], [-5.5, -62.1], [-5.5, -42], [-5.5, -74.5], [-5.5, 30.6], [-5.6, -54.4], [-5.6, 18.2], [-5.6, -66.8], [-5.6, 38.3], [-5.6, -46.7], [-5.6, 143.3], [-5.6, -79.2], [-5.6, 25.9], [-5.6, -59.1], [-5.6, -39.1], [-5.6, 13.5], [-5.6, -71.5], [-5.6, 33.5], [-5.6, -51.5], [-5.6, 138.6], [-5.6, 21.1], [-5.7, -63.9], [-5.7, -43.8], [-5.7, -76.3], [-5.7, 28.8], [-5.7, -56.2], [-5.7, -36.1], [-5.7, 16.4], [-5.7, -68.6], [-5.7, 36.4], [-5.7, -48.5], [-5.7, 141.5], [-5.7, 24], [-5.7, -60.9], [-5.7, -40.9], [-5.7, -73.3], [-5.8, 31.7], [-5.8, -53.3], [-5.8, 136.8], [-5.8, 19.3], [-5.8, -65.7], [-5.8, 39.4], [-5.8, -45.6], [-5.8, 144.4], [-5.8, -78.1], [-5.8, 27], [-5.8, -58], [-5.8, -37.9], [-5.8, 14.6], [-5.8, -70.4], [-5.8, 34.6], [-5.8, -50.3], [-5.8, 139.7], [-5.9, 22.2], [-5.9, -62.7], [-5.9, -42.7], [-5.9, -75.1], [-5.9, 29.9], [-5.9, -55.1], [-5.9, 17.5], [-5.9, -67.5], [-5.9, 37.6], [-5.9, -47.4], [-5.9, 142.6], [-5.9, -79.9], [-5.9, 25.2], [-5.9, -59.8], [-5.9, -39.8], [-6, 12.8], [-6, -72.2], [-6, 32.8], [-6, -52.2], [-6, 137.9], [-6, 20.4], [-6, -64.6], [-6, -44.5], [-6, -77], [-6, 28.1], [-6, -56.9], [-6, -36.8], [-6, 15.7], [-6, -69.3], [-6, 35.8], [-6, -49.2], [-6.1, 140.8], [-6.1, 23.4], [-6.1, -61.6], [-6.1, -41.6], [-6.1, -74], [-6.1, 31], [-6.1, -54], [-6.1, 18.6], [-6.1, -66.4], [-6.1, 38.7], [-6.1, -46.3], [-6.1, 143.7], [-6.1, -78.8], [-6.1, 26.3], [-6.1, -58.7], [-6.2, -38.6], [-6.2, 13.9], [-6.2, -71.1], [-6.2, 33.9], [-6.2, -51], [-6.2, 139], [-6.2, 21.5], [-6.2, -63.4], [-6.2, -43.4], [-6.2, -75.8], [-6.2, 29.2], [-6.2, -55.8], [-6.2, -35.7], [-6.2, 16.8], [-6.2, -68.2], [-6.3, 36.9], [-6.3, -48.1], [-6.3, 141.9], [-6.3, 24.5], [-6.3, -60.5], [-6.3, -40.4], [-6.3, 12.1], [-6.3, -72.9], [-6.3, 32.1], [-6.3, -52.8], [-6.3, 19.7], [-6.3, -65.2], [-6.3, -45.2], [-6.3, 144.8], [-6.3, -77.6], [-6.3, 27.4], [-6.4, -57.6], [-6.4, -37.5], [-6.4, 15], [-6.4, -70], [-6.4, 35.1], [-6.4, -49.9], [-6.4, 140.1], [-6.4, 22.7], [-6.4, -62.3], [-6.4, -42.3], [-6.4, -74.7], [-6.4, 30.3], [-6.4, -54.7], [-6.4, 17.9], [-6.5, -67.1], [-6.5, 38], [-6.5, -47], [-6.5, 143], [-6.5, -79.5], [-6.5, 25.6], [-6.5, -59.4], [-6.5, -39.3], [-6.5, 13.2], [-6.5, -71.8], [-6.5, 33.3], [-6.5, -51.7], [-6.5, 138.3], [-6.5, 105.8], [-6.5, 20.9], [-6.5, -64.1], [-6.5, -44.1], [-6.5, 146], [-6.5, -76.5], [-6.6, 28.5], [-6.6, -56.5], [-6.6, -36.4], [-6.6, 16.1], [-6.6, -68.9], [-6.6, 36.2], [-6.6, -48.8], [-6.6, 141.2], [-6.6, 23.8], [-6.6, -61.2], [-6.6, -41.1], [-6.6, -73.6], [-6.6, 31.4], [-6.6, -53.5], [-6.7, 19], [-6.7, -65.9], [-6.7, 39.1], [-6.7, -45.9], [-6.7, 144.2], [-6.7, -78.3], [-6.7, 26.7], [-6.7, -58.3], [-6.7, -38.2], [-6.7, 14.3], [-6.7, -70.7], [-6.7, 34.4], [-6.7, -50.6], [-6.7, 139.4], [-6.7, 107], [-6.7, 22], [-6.7, -63], [-6.7, -42.9], [-6.8, -75.4], [-6.8, 29.6], [-6.8, -55.3], [-6.8, 17.2], [-6.8, -67.7], [-6.8, 37.3], [-6.8, -47.7], [-6.8, 142.3], [-6.8, 24.9], [-6.8, -60.1], [-6.8, -40], [-6.8, 12.5], [-6.8, -72.5], [-6.8, 32.6], [-6.8, -52.4], [-6.9, 20.2], [-6.9, -64.8], [-6.9, -44.8], [-6.9, 145.3], [-6.9, -77.2], [-6.9, 27.8], [-6.9, -57.2], [-6.9, -37.1], [-6.9, 15.4], [-6.9, -69.6], [-6.9, 35.5], [-6.9, -49.5], [-6.9, 140.5], [-6.9, 108.1], [-6.9, 23.1], [-6.9, -61.9], [-7, -41.8], [-7, -74.3], [-7, 30.8], [-7, -54.2], [-7, 18.4], [-7, -66.6], [-7, 38.4], [-7, -46.6], [-7, 143.5], [-7, -79], [-7, 26], [-7, -59], [-7, -38.9], [-7, 13.6], [-7, -71.4], [-7.1, 33.7], [-7.1, -51.3], [-7.1, 138.7], [-7.1, 21.3], [-7.1, -63.7], [-7.1, -43.6], [-7.1, 146.4], [-7.1, -76.1], [-7.1, 28.9], [-7.1, -56], [-7.1, -36], [-7.1, 16.5], [-7.1, -68.4], [-7.1, 36.6], [-7.1, -48.4], [-7.1, 141.7], [-7.1, 109.2], [-7.1, 24.2], [-7.2, -60.8], [-7.2, -40.7], [-7.2, -73.2], [-7.2, 31.9], [-7.2, -53.1], [-7.2, 19.5], [-7.2, -65.5], [-7.2, -45.4], [-7.2, 144.6], [-7.2, -77.9], [-7.2, 27.1], [-7.2, -57.8], [-7.2, -37.8], [-7.2, 14.7], [-7.3, -70.2], [-7.3, 34.8], [-7.3, -50.2], [-7.3, 139.8], [-7.3, 107.4], [-7.3, 22.4], [-7.3, -62.6], [-7.3, -42.5], [-7.3, -75], [-7.3, 30.1], [-7.3, -54.9], [-7.3, 17.7], [-7.3, -67.3], [-7.3, 37.7], [-7.3, -47.3], [-7.3, 142.8], [-7.4, 110.3], [-7.4, 25.3], [-7.4, -59.7], [-7.4, -39.6], [-7.4, 12.9], [-7.4, -72.1], [-7.4, 33], [-7.4, -52], [-7.4, 20.6], [-7.4, -64.4], [-7.4, -44.3], [-7.4, 145.7], [-7.4, -76.8], [-7.4, 28.3], [-7.4, -56.7], [-7.5, -36.7], [-7.5, 15.9], [-7.5, -69.1], [-7.5, 35.9], [-7.5, -49.1], [-7.5, 141], [-7.5, 108.5], [-7.5, 23.5], [-7.5, -61.5], [-7.5, -41.4], [-7.5, -73.9], [-7.5, 31.2], [-7.5, -53.8], [-7.5, 18.8], [-7.5, -66.2], [-7.5, 38.8], [-7.5, -46.1], [-7.6, 143.9], [-7.6, -78.6], [-7.6, 111.4], [-7.6, 26.4], [-7.6, -58.5], [-7.6, -38.5], [-7.6, 14], [-7.6, -70.9], [-7.6, 34.1], [-7.6, -50.9], [-7.6, 139.2], [-7.6, 21.7], [-7.6, -63.3], [-7.6, -43.2], [-7.6, 146.8], [-7.6, -75.7], [-7.6, 29.4], [-7.6, -55.6], [-7.7, 17], [-7.7, -68], [-7.7, 37], [-7.7, -47.9], [-7.7, 142.1], [-7.7, 109.6], [-7.7, 24.6], [-7.7, -60.3], [-7.7, -40.3], [-7.7, -72.7], [-7.7, 32.3], [-7.7, -52.7], [-7.7, 19.9], [-7.7, -65.1], [-7.8, -45], [-7.8, 145], [-7.8, -77.5], [-7.8, 112.5], [-7.8, 27.6], [-7.8, -57.4], [-7.8, -37.4], [-7.8, 15.2], [-7.8, -69.8], [-7.8, 35.2], [-7.8, -49.8], [-7.8, 140.3], [-7.8, 107.8], [-7.8, 22.8], [-7.8, -62.2], [-7.8, -42.1], [-7.8, 147.9], [-7.8, -74.6], [-7.9, 30.5], [-7.9, -54.5], [-7.9, 18.1], [-7.9, -66.9], [-7.9, 38.2], [-7.9, -46.8], [-7.9, 143.2], [-7.9, -79.3], [-7.9, 110.7], [-7.9, 25.8], [-7.9, -59.2], [-7.9, -39.2], [-7.9, 13.4], [-7.9, -71.6], [-7.9, 33.4], [-7.9, -51.6], [-8, 21], [-8, -64], [-8, -43.9], [-8, 146.1], [-8, -76.4], [-8, 113.7], [-8, 28.7], [-8, -56.3], [-8, -36.2], [-8, 16.3], [-8, -68.7], [-8, 36.3], [-8, -48.6], [-8, 141.4], [-8, 23.9], [-8, -61], [-8, -41], [-8.1, -73.4], [-8.1, 31.6], [-8.1, -53.4], [-8.1, 19.2], [-8.1, -65.8], [-8.1, -45.7], [-8.1, 144.3], [-8.1, -78.2], [-8.1, 26.9], [-8.1, -58.1], [-8.1, -38], [-8.1, 14.5], [-8.1, -70.5], [-8.1, 34.5], [-8.1, -50.4], [-8.2, 22.1], [-8.2, -62.8], [-8.2, -42.8], [-8.2, 147.2], [-8.2, -75.2], [-8.2, 29.8], [-8.2, -55.2], [-8.2, 17.4], [-8.2, -67.6], [-8.2, 37.5], [-8.2, -47.5], [-8.2, 142.5], [-8.2, 25.1], [-8.2, -59.9], [-8.3, -39.9], [-8.3, -72.3], [-8.3, 32.7], [-8.3, -52.3], [-8.3, 20.3], [-8.3, -64.7], [-8.3, -44.6], [-8.3, 145.4], [-8.3, -77.1], [-8.3, 28], [-8.3, -57], [-8.3, -36.9], [-8.3, 15.6], [-8.3, -69.4], [-8.3, 35.7], [-8.4, -49.3], [-8.4, 140.7], [-8.4, 23.3], [-8.4, -61.7], [-8.4, -41.7], [-8.4, 148.4], [-8.4, -74.1], [-8.4, 30.9], [-8.4, -54.1], [-8.4, 18.5], [-8.4, -66.5], [-8.4, 38.6], [-8.4, -46.4], [-8.4, 143.6], [-8.4, -78.9], [-8.4, 26.2], [-8.5, -58.8], [-8.5, -38.7], [-8.5, 13.8], [-8.5, -71.2], [-8.5, 33.8], [-8.5, -51.1], [-8.5, 21.4], [-8.5, -63.5], [-8.5, -43.5], [-8.5, 146.6], [-8.5, -75.9], [-8.5, 29.1], [-8.5, -55.9], [-8.5, 16.7], [-8.5, -68.3], [-8.6, 36.8], [-8.6, -48.2], [-8.6, 141.8], [-8.6, 24.4], [-8.6, -60.6], [-8.6, -40.5], [-8.6, -73], [-8.6, 32], [-8.6, -52.9], [-8.6, 19.6], [-8.6, -65.3], [-8.6, -45.3], [-8.6, 144.7], [-8.6, -77.7], [-8.7, 27.3], [-8.7, -57.7], [-8.7, -37.6], [-8.7, 14.9], [-8.7, -70.1], [-8.7, 35], [-8.7, -50], [-8.7, 22.6], [-8.7, -62.4], [-8.7, -42.4], [-8.7, 147.7], [-8.7, -74.8], [-8.7, 30.2], [-8.7, -54.8], [-8.8, 17.8], [-8.8, -67.2], [-8.8, 37.9], [-8.8, -47.1], [-8.8, 142.9], [-8.8, 25.5], [-8.8, -59.5], [-8.8, -39.4], [-8.8, 13.1], [-8.8, -71.9], [-8.8, 33.2], [-8.8, -51.8], [-8.8, 20.8], [-8.8, -64.2], [-8.8, -44.2], [-8.9, 145.9], [-8.9, -76.6], [-8.9, 28.4], [-8.9, -56.6], [-8.9, -36.5], [-8.9, 16], [-8.9, -69], [-8.9, 36.1], [-8.9, -48.9], [-8.9, 141.1], [-8.9, 23.7], [-8.9, -61.3], [-8.9, -41.2], [-8.9, 148.8], [-8.9, -73.7], [-8.9, 31.3], [-8.9, -53.6], [-9, 18.9], [-9, -66], [-9, 39], [-9, -46], [-9, 144.1], [-9, -78.4], [-9, 26.6], [-9, -58.4], [-9, -38.3], [-9, 14.2], [-9, -70.8], [-9, 34.3], [-9, -50.7], [-9, 21.9], [-9, -63.1], [-9.1, -43], [-9.1, -75.5], [-9.1, 29.5], [-9.1, -55.4], [-9.1, 17.1], [-9.1, -67.8], [-9.1, 37.2], [-9.1, -47.8], [-9.1, 24.8], [-9.1, -60.2], [-9.1, -40.1], [-9.1, -72.6], [-9.2, 32.5], [-9.2, -52.5], [-9.2, 20.1], [-9.2, -64.9], [-9.2, -44.9], [-9.2, -77.3], [-9.2, 27.7], [-9.2, -57.3], [-9.2, -37.2], [-9.2, 15.3], [-9.2, -69.7], [-9.2, 35.4], [-9.2, -49.6], [-9.3, 23], [-9.3, -62], [-9.3, -41.9], [-9.3, -74.4], [-9.3, 30.7], [-9.3, -54.3], [-9.3, 18.3], [-9.3, -66.7], [-9.3, 38.3], [-9.3, -46.7], [-9.3, 25.9], [-9.3, -59.1], [-9.3, -39], [-9.4, 13.5], [-9.4, -71.5], [-9.4, 33.6], [-9.4, -51.4], [-9.4, 21.2], [-9.4, -63.8], [-9.4, -43.7], [-9.4, -76.2], [-9.4, 28.8], [-9.4, -56.1], [-9.4, 16.4], [-9.4, -68.5], [-9.4, 36.5], [-9.4, -48.5], [-9.5, 24.1], [-9.5, -60.9], [-9.5, -40.8], [-9.5, -73.3], [-9.5, 31.8], [-9.5, -53.2], [-9.5, 19.4], [-9.5, -65.6], [-9.5, -45.5], [-9.5, -78], [-9.5, 27], [-9.5, -57.9], [-9.6, -37.9], [-9.6, 14.6], [-9.6, -70.3], [-9.6, 34.7], [-9.6, -50.3], [-9.6, 22.3], [-9.6, -62.7], [-9.6, -42.6], [-9.6, -75.1], [-9.6, 30], [-9.6, -55], [-9.6, 17.6], [-9.6, -67.4], [-9.7, 37.6], [-9.7, -47.4], [-9.7, 25.2], [-9.7, -59.8], [-9.7, -39.7], [-9.7, 12.8], [-9.7, -72.2], [-9.7, 32.9], [-9.7, -52.1], [-9.7, 20.5], [-9.7, -64.5], [-9.7, -44.4], [-9.7, -76.9], [-9.8, 28.2], [-9.8, -56.8], [-9.8, -36.8], [-9.8, 15.8], [-9.8, -69.2], [-9.8, 35.8], [-9.8, -49.2], [-9.8, 23.4], [-9.8, -61.6], [-9.8, -41.5], [-9.8, -74], [-9.8, 31.1], [-9.8, -53.9], [-9.8, 18.7], [-9.9, -66.3], [-9.9, 38.7], [-9.9, -46.2], [-9.9, 26.3], [-9.9, -58.6], [-9.9, -38.6], [-9.9, 13.9], [-9.9, -71], [-9.9, 34], [-9.9, -51], [-9.9, 21.6], [-9.9, -63.4], [-9.9, -43.3], [-10, -75.8], [-10, 29.3], [-10, -55.7], [-10, 16.9], [-10, -68.1], [-10, 36.9], [-10, -48], [-10, 24.5], [-10, -60.4], [-10, -40.4], [-10, -72.8], [-10, 32.2], [-10, -52.8], [-10.1, 19.8], [-10.1, -65.2], [-10.1, -45.1], [-10.1, -77.6], [-10.1, 27.5], [-10.1, -57.5], [-10.1, -37.5], [-10.1, 15.1], [-10.1, -69.9], [-10.1, 35.1], [-10.1, -49.9], [-10.1, 22.7], [-10.1, -62.3], [-10.2, -42.2], [-10.2, -74.7], [-10.2, 30.4], [-10.2, -54.6], [-10.2, 18], [-10.2, -67], [-10.2, 38.1], [-10.2, -46.9], [-10.2, 25.7], [-10.2, -59.3], [-10.2, -39.3], [-10.2, 13.3], [-10.2, -71.7], [-10.2, 33.3], [-10.3, -51.7], [-10.3, 20.9], [-10.3, -64.1], [-10.3, -44], [-10.3, -76.5], [-10.3, 28.6], [-10.3, -56.4], [-10.3, 16.2], [-10.3, -68.8], [-10.3, 36.2], [-10.3, -48.7], [-10.3, 23.8], [-10.4, -61.1], [-10.4, -41.1], [-10.4, -73.5], [-10.4, 31.5], [-10.4, -53.5], [-10.4, 19.1], [-10.4, -65.9], [-10.4, 39.2], [-10.4, -45.8], [-10.4, 26.8], [-10.4, -58.2], [-10.4, -38.1], [-10.4, 14.4], [-10.5, -70.6], [-10.5, 34.4], [-10.5, -50.5], [-10.5, 22], [-10.5, -62.9], [-10.5, -42.9], [-10.5, -75.3], [-10.5, 29.7], [-10.5, -55.3], [-10.5, 17.3], [-10.5, -67.7], [-10.5, 37.4], [-10.5, -47.6], [-10.6, 25], [-10.6, -60], [-10.6, -40], [-10.6, -72.4], [-10.6, 32.6], [-10.6, -52.4], [-10.6, 20.2], [-10.6, -64.8], [-10.6, -44.7], [-10.6, -77.2], [-10.6, 27.9], [-10.6, -57.1], [-10.7, 15.5], [-10.7, -69.5], [-10.7, 35.6], [-10.7, -49.4], [-10.7, 23.2], [-10.7, -61.8], [-10.7, -41.8], [-10.7, -74.2], [-10.7, 30.8], [-10.7, -54.2], [-10.7, 18.4], [-10.7, -66.6], [-10.7, 38.5], [-10.8, -46.5], [-10.8, 26.1], [-10.8, -58.9], [-10.8, -38.8], [-10.8, 13.7], [-10.8, -71.3], [-10.8, 33.7], [-10.8, -51.2], [-10.8, 21.3], [-10.8, -63.6], [-10.8, -43.6], [-10.8, -76], [-10.8, 29], [-10.9, -56], [-10.9, 16.6], [-10.9, -68.4], [-10.9, 36.7], [-10.9, -48.3], [-10.9, 24.3], [-10.9, -60.7], [-10.9, -40.6], [-10.9, -73.1], [-10.9, 31.9], [-10.9, -53], [-10.9, 19.5], [-11, -65.4], [-11, -45.4], [-11, 27.2], [-11, -57.8], [-11, -37.7], [-11, 14.8], [-11, -70.2], [-11, 34.9], [-11, -50.1], [-11, 22.5], [-11, -62.5], [-11, -42.5], [-11, -74.9], [-11.1, 30.1], [-11.1, -54.9], [-11.1, 17.7], [-11.1, -67.3], [-11.1, 37.8], [-11.1, -47.2], [-11.1, 25.4], [-11.1, -59.6], [-11.1, -39.5], [-11.1, 13], [-11.1, -72], [-11.1, 33.1], [-11.1, -51.9], [-11.2, 20.7], [-11.2, -64.3], [-11.2, -44.3], [-11.2, -76.7], [-11.2, 28.3], [-11.2, -56.7], [-11.2, 15.9], [-11.2, -69.1], [-11.2, 36], [-11.2, -49], [-11.2, 23.6], [-11.2, -61.4], [-11.3, -41.3], [-11.3, -73.8], [-11.3, 31.2], [-11.3, -53.7], [-11.3, 18.8], [-11.3, -66.1], [-11.3, 38.9], [-11.3, -46.1], [-11.3, 26.5], [-11.3, -58.5], [-11.3, -38.4], [-11.3, 14.1], [-11.3, -70.9], [-11.3, 34.2], [-11.4, -50.8], [-11.4, 21.8], [-11.4, -63.2], [-11.4, -43.1], [-11.4, -75.6], [-11.4, 29.4], [-11.4, -55.5], [-11.4, 17], [-11.4, -67.9], [-11.4, 37.1], [-11.4, -47.9], [-11.4, 24.7], [-11.5, -60.3], [-11.5, -40.2], [-11.5, -72.7], [-11.5, 32.4], [-11.5, -52.6], [-11.5, 20], [-11.5, -65], [-11.5, -45], [-11.5, 27.6], [-11.5, -57.4], [-11.5, 15.2], [-11.6, -69.8], [-11.6, 35.3], [-11.6, -49.7], [-11.6, 22.9], [-11.6, -62.1], [-11.6, -42], [-11.6, -74.5], [-11.6, 30.6], [-11.6, -54.4], [-11.6, 18.2], [-11.6, -66.8], [-11.6, 38.2], [-11.6, -46.8], [-11.7, 25.8], [-11.7, -59.2], [-11.7, -39.1], [-11.7, 13.4], [-11.7, -71.6], [-11.7, 33.5], [-11.7, -51.5], [-11.7, 21.1], [-11.7, -63.9], [-11.7, -43.8], [-11.7, -76.3], [-11.7, 28.7], [-11.7, -56.2], [-11.8, 16.3], [-11.8, -68.6], [-11.8, 36.4], [-11.8, -48.6], [-11.8, 24], [-11.8, -61], [-11.8, -40.9], [-11.8, -73.4], [-11.8, 31.7], [-11.8, -53.3], [-11.8, 19.3], [-11.8, -65.7], [-11.9, 39.3], [-11.9, -45.6], [-11.9, 26.9], [-11.9, -58], [-11.9, -38], [-11.9, 14.5], [-11.9, -70.4], [-11.9, 34.6], [-11.9, -50.4], [-11.9, 22.2], [-11.9, -62.8], [-11.9, -42.7], [-11.9, -75.2], [-12, 29.9], [-12, -55.1], [-12, 17.5], [-12, -67.5], [-12, 37.5], [-12, -47.5], [-12, 25.1], [-12, -59.9], [-12, 130.2], [-12, -39.8], [-12, 12.7], [-12, -72.3], [-12, 32.8], [-12, -52.2], [-12, 20.4], [-12.1, -64.6], [-12.1, -44.5], [-12.1, -77], [-12.1, 28.1], [-12.1, -56.9], [-12.1, 133.1], [-12.1, 15.7], [-12.1, -69.3], [-12.1, 35.7], [-12.1, -49.3], [-12.1, 23.3], [-12.1, -61.7], [-12.1, -41.6], [-12.2, -74.1], [-12.2, 31], [-12.2, -54], [-12.2, 136], [-12.2, 18.6], [-12.2, -66.4], [-12.2, 38.6], [-12.2, -46.3], [-12.2, 26.2], [-12.2, -58.7], [-12.2, 131.3], [-12.2, -38.7], [-12.2, 13.8], [-12.2, -71.1], [-12.2, 33.9], [-12.2, -51.1], [-12.3, 21.5], [-12.3, -63.5], [-12.3, -43.4], [-12.3, -75.9], [-12.3, 29.2], [-12.3, -55.8], [-12.3, 134.2], [-12.3, 16.8], [-12.3, -68.2], [-12.3, 36.8], [-12.3, -48.1], [-12.3, 24.4], [-12.3, -60.5], [-12.4, 129.5], [-12.4, -40.5], [-12.4, -72.9], [-12.4, 32.1], [-12.4, -52.9], [-12.4, 19.7], [-12.4, -65.3], [-12.4, -45.2], [-12.4, 27.4], [-12.4, -57.6], [-12.4, 132.4], [-12.4, 15], [-12.4, -70], [-12.5, 35], [-12.5, -50], [-12.5, 22.6], [-12.5, -62.4], [-12.5, -42.3], [-12.5, -74.8], [-12.5, 30.3], [-12.5, -54.7], [-12.5, 135.3], [-12.5, 17.9], [-12.5, -67.1], [-12.5, 38], [-12.5, -47], [-12.6, 25.6], [-12.6, -59.4], [-12.6, 130.6], [-12.6, -39.4], [-12.6, 13.2], [-12.6, -71.8], [-12.6, 33.2], [-12.6, -51.8], [-12.6, 20.8], [-12.6, -64.2], [-12.6, -44.1], [-12.6, -76.6], [-12.6, 28.5], [-12.6, -56.5], [-12.6, 133.5], [-12.6, 48.5], [-12.7, 16.1], [-12.7, -68.9], [-12.7, 36.1], [-12.7, -48.8], [-12.7, 23.7], [-12.7, -61.2], [-12.7, -41.2], [-12.7, -73.6], [-12.7, 31.4], [-12.7, -53.6], [-12.7, 136.5], [-12.7, 19], [-12.7, -66], [-12.7, 39.1], [-12.7, -45.9], [-12.8, 26.7], [-12.8, -58.3], [-12.8, 131.7], [-12.8, -38.2], [-12.8, 14.3], [-12.8, -70.7], [-12.8, 34.3], [-12.8, -50.6], [-12.8, 21.9], [-12.8, -63], [-12.8, -43], [-12.8, -75.4], [-12.8, 29.6], [-12.8, -55.4], [-12.9, 134.6], [-12.9, 17.2], [-12.9, -67.8], [-12.9, 37.3], [-12.9, -47.7], [-12.9, 24.9], [-12.9, -60.1], [-12.9, 129.9], [-12.9, -40.1], [-12.9, 12.5], [-12.9, -72.5], [-12.9, 32.5], [-12.9, -52.5], [-12.9, 20.1], [-12.9, -64.9], [-13, -44.8], [-13, 27.8], [-13, -57.2], [-13, 132.8], [-13, 47.9], [-13, 15.4], [-13, -69.6], [-13, 35.5], [-13, -49.5], [-13, 23.1], [-13, -61.9], [-13, -41.9], [-13, -74.3], [-13.1, 30.7], [-13.1, -54.3], [-13.1, 135.8], [-13.1, 18.3], [-13.1, -66.7], [-13.1, 38.4], [-13.1, -46.6], [-13.1, 26], [-13.1, -59], [-13.1, 131], [-13.1, -38.9], [-13.1, 13.6], [-13.1, -71.4], [-13.1, 33.6], [-13.1, -51.3], [-13.2, 21.2], [-13.2, -63.7], [-13.2, -43.7], [-13.2, -76.1], [-13.2, 28.9], [-13.2, -56.1], [-13.2, 134], [-13.2, 49], [-13.2, 16.5], [-13.2, -68.5], [-13.2, 36.6], [-13.2, -48.4], [-13.2, 24.2], [-13.2, -60.8], [-13.2, 129.2], [-13.3, -40.7], [-13.3, -73.2], [-13.3, 31.8], [-13.3, -53.1], [-13.3, 136.9], [-13.3, 19.4], [-13.3, -65.5], [-13.3, 39.5], [-13.3, -45.5], [-13.3, 27.1], [-13.3, -57.9], [-13.3, 132.1], [-13.3, 14.7], [-13.3, -70.3], [-13.3, 34.8], [-13.4, -50.2], [-13.4, 22.4], [-13.4, -62.6], [-13.4, -42.6], [-13.4, -75], [-13.4, 30], [-13.4, -55], [-13.4, 135.1], [-13.4, 17.6], [-13.4, -67.4], [-13.4, 37.7], [-13.4, -47.3], [-13.4, 25.3], [-13.5, -59.7], [-13.5, 130.3], [-13.5, -39.6], [-13.5, 12.9], [-13.5, -72.1], [-13.5, 33], [-13.5, -52], [-13.5, 20.6], [-13.5, -64.4], [-13.5, -44.4], [-13.5, 28.2], [-13.5, -56.8], [-13.5, 133.3], [-13.5, 48.3], [-13.5, 15.8], [-13.6, -69.2], [-13.6, 35.9], [-13.6, -49.1], [-13.6, 23.5], [-13.6, -61.5], [-13.6, 128.5], [-13.6, -41.4], [-13.6, -73.9], [-13.6, 31.1], [-13.6, -53.8], [-13.6, 136.2], [-13.6, 18.7], [-13.6, -66.2], [-13.6, 38.8], [-13.6, -46.2], [-13.7, 26.4], [-13.7, -58.6], [-13.7, 131.5], [-13.7, -38.5], [-13.7, 14], [-13.7, -71], [-13.7, 34.1], [-13.7, -50.9], [-13.7, 21.7], [-13.7, -63.3], [-13.7, -43.2], [-13.7, -75.7], [-13.7, 29.3], [-13.7, -55.6], [-13.8, 134.4], [-13.8, 49.4], [-13.8, 16.9], [-13.8, -68], [-13.8, 37], [-13.8, -48], [-13.8, 24.6], [-13.8, -60.4], [-13.8, 129.6], [-13.8, -40.3], [-13.8, -72.8], [-13.8, 32.3], [-13.8, -52.7], [-13.8, 137.3], [-13.8, 19.9], [-13.8, -65.1], [-13.9, -45.1], [-13.9, 27.5], [-13.9, -57.5], [-13.9, 132.6], [-13.9, 47.6], [-13.9, 15.1], [-13.9, -69.9], [-13.9, 35.2], [-13.9, -49.8], [-13.9, 22.8], [-13.9, -62.2], [-13.9, 127.8], [-13.9, -42.1], [-13.9, -74.6], [-14, 30.5], [-14, -54.5], [-14, 135.5], [-14, 18.1], [-14, -66.9], [-14, 38.1], [-14, -46.9], [-14, 25.7], [-14, -59.3], [-14, 130.8], [-14, -39.2], [-14, 13.3], [-14, -71.7], [-14, 33.4], [-14, -51.6], [-14.1, 21], [-14.1, -64], [-14.1, -43.9], [-14.1, 28.6], [-14.1, -56.3], [-14.1, 133.7], [-14.1, 48.7], [-14.1, 16.2], [-14.1, -68.7], [-14.1, 36.3], [-14.1, -48.7], [-14.1, 23.9], [-14.1, -61.1], [-14.1, 129], [-14.2, -41], [-14.2, -73.5], [-14.2, 31.6], [-14.2, -53.4], [-14.2, 136.6], [-14.2, 19.2], [-14.2, -65.8], [-14.2, 39.2], [-14.2, -45.7], [-14.2, 26.8], [-14.2, -58.1], [-14.2, 131.9], [-14.2, 46.9], [-14.2, 14.4], [-14.2, -70.5], [-14.2, 34.5], [-14.3, -50.5], [-14.3, 22.1], [-14.3, -62.9], [-14.3, 127.1], [-14.3, -42.8], [-14.3, -75.3], [-14.3, 29.8], [-14.3, -55.2], [-14.3, 134.8], [-14.3, 17.4], [-14.3, -67.6], [-14.3, 37.4], [-14.3, -47.6], [-14.3, 25], [-14.4, -60], [-14.4, 130.1], [-14.4, -39.9], [-14.4, 12.6], [-14.4, -72.4], [-14.4, 32.7], [-14.4, -52.3], [-14.4, 137.7], [-14.4, 20.3], [-14.4, -64.7], [-14.4, -44.6], [-14.4, 28], [-14.4, -57], [-14.4, 133], [-14.4, 48], [-14.5, 15.6], [-14.5, -69.4], [-14.5, 35.6], [-14.5, -49.4], [-14.5, 23.2], [-14.5, -61.8], [-14.5, 128.3], [-14.5, -41.7], [-14.5, -74.2], [-14.5, 30.9], [-14.5, -54.1], [-14.5, 135.9], [-14.5, 18.5], [-14.5, -66.5], [-14.5, 38.5], [-14.5, -46.4], [-14.6, 26.1], [-14.6, -58.8], [-14.6, 131.2], [-14.6, 46.2], [-14.6, 13.7], [-14.6, -71.2], [-14.6, 33.8], [-14.6, -51.2], [-14.6, 21.4], [-14.6, -63.6], [-14.6, 126.5], [-14.6, -43.5], [-14.6, 29.1], [-14.6, -55.9], [-14.7, 134.1], [-14.7, 49.1], [-14.7, 16.7], [-14.7, -68.3], [-14.7, 36.7], [-14.7, -48.2], [-14.7, 24.3], [-14.7, -60.6], [-14.7, 129.4], [-14.7, -40.6], [-14.7, -73], [-14.7, 32], [-14.7, -53], [-14.7, 137], [-14.7, 19.6], [-14.7, -65.4], [-14.8, 39.7], [-14.8, -45.3], [-14.8, 144.7], [-14.8, 27.3], [-14.8, -57.7], [-14.8, 132.3], [-14.8, 47.3], [-14.8, 14.9], [-14.8, -70.1], [-14.8, 34.9], [-14.8, -50.1], [-14.8, 22.5], [-14.8, -62.5], [-14.8, 127.6], [-14.8, -42.4], [-14.9, 30.2], [-14.9, -54.8], [-14.9, 135.2], [-14.9, 17.8], [-14.9, -67.2], [-14.9, 37.9], [-14.9, -47.1], [-14.9, 25.5], [-14.9, -59.5], [-14.9, 130.5], [-14.9, 45.5], [-14.9, -39.5], [-14.9, 13.1], [-14.9, -71.9], [-14.9, 33.1], [-14.9, -51.9], [-14.9, 138.2], [-15, 20.7], [-15, -64.3], [-15, 125.8], [-15, -44.2], [-15, 28.4], [-15, -56.6], [-15, 133.4], [-15, 48.4], [-15, 16], [-15, -69], [-15, 36], [-15, -48.9], [-15, 23.6], [-15, -61.3], [-15, 128.7], [-15.1, -41.3], [-15.1, -73.7], [-15.1, 31.3], [-15.1, -53.7], [-15.1, 136.4], [-15.1, 18.9], [-15.1, -66.1], [-15.1, 39], [-15.1, -46], [-15.1, 144], [-15.1, 26.6], [-15.1, -58.4], [-15.1, 131.6], [-15.1, 46.6], [-15.1, 14.2], [-15.1, -70.8], [-15.2, 34.2], [-15.2, -50.7], [-15.2, 21.8], [-15.2, -63.1], [-15.2, 126.9], [-15.2, -43.1], [-15.2, 29.5], [-15.2, -55.5], [-15.2, 134.5], [-15.2, 49.6], [-15.2, 17.1], [-15.2, -67.9], [-15.2, 37.2], [-15.2, -47.8], [-15.3, 24.8], [-15.3, -60.2], [-15.3, 129.8], [-15.3, -40.2], [-15.3, 12.4], [-15.3, -72.6], [-15.3, 32.4], [-15.3, -52.6], [-15.3, 137.5], [-15.3, 20], [-15.3, -65], [-15.3, 125.1], [-15.3, -44.9], [-15.3, 145.1], [-15.3, 27.7], [-15.3, -57.3], [-15.3, 132.7], [-15.3, 47.8], [-15.4, 15.3], [-15.4, -69.7], [-15.4, 35.4], [-15.4, -49.6], [-15.4, 23], [-15.4, -62], [-15.4, 128], [-15.4, -42], [-15.4, 30.6], [-15.4, -54.4], [-15.4, 135.7], [-15.4, 18.2], [-15.4, -66.8], [-15.4, 38.3], [-15.5, -46.7], [-15.5, 143.3], [-15.5, 25.9], [-15.5, -59.1], [-15.5, 130.9], [-15.5, 45.9], [-15.5, 13.5], [-15.5, -71.5], [-15.5, 33.5], [-15.5, -51.4], [-15.5, 138.6], [-15.5, 21.1], [-15.5, -63.8], [-15.5, 126.2], [-15.5, -43.8], [-15.5, 28.8], [-15.6, -56.2], [-15.6, 133.9], [-15.6, 48.9], [-15.6, 16.4], [-15.6, -68.6], [-15.6, 36.5], [-15.6, -48.5], [-15.6, 24.1], [-15.6, -60.9], [-15.6, 129.1], [-15.6, -40.9], [-15.6, -73.3], [-15.6, 31.7], [-15.6, -53.2], [-15.6, 136.8], [-15.7, 19.3], [-15.7, -65.6], [-15.7, 124.4], [-15.7, -45.6], [-15.7, 144.4], [-15.7, 27], [-15.7, -58], [-15.7, 132], [-15.7, 47.1], [-15.7, 14.6], [-15.7, -70.4], [-15.7, 34.7], [-15.7, -50.3], [-15.7, 22.3], [-15.7, -62.7], [-15.7, 127.3], [-15.7, -42.7], [-15.8, 29.9], [-15.8, -55.1], [-15.8, 135], [-15.8, 17.5], [-15.8, -67.5], [-15.8, 37.6], [-15.8, -47.4], [-15.8, 142.6], [-15.8, 25.2], [-15.8, -59.8], [-15.8, 130.2], [-15.8, 45.3], [-15.8, -39.7], [-15.8, 12.8], [-15.8, -72.2], [-15.8, 32.9], [-15.8, -52.1], [-15.9, 137.9], [-15.9, 20.5], [-15.9, -64.5], [-15.9, 125.5], [-15.9, -44.5], [-15.9, 145.6], [-15.9, 28.1], [-15.9, -56.9], [-15.9, 133.2], [-15.9, 48.2], [-15.9, 15.7], [-15.9, -69.3], [-15.9, 35.8], [-15.9, -49.2], [-15.9, 23.4], [-15.9, -61.6], [-16, 128.4], [-16, -41.5], [-16, 31], [-16, -53.9], [-16, 136.1], [-16, 18.6], [-16, -66.3], [-16, 123.7], [-16, 38.7], [-16, -46.3], [-16, 143.8], [-16, 26.3], [-16, -58.7], [-16, 131.4], [-16, 46.4], [-16, 13.9], [-16.1, -71.1], [-16.1, 34], [-16.1, -51], [-16.1, 139], [-16.1, 21.6], [-16.1, -63.4], [-16.1, 126.6], [-16.1, -43.4], [-16.1, 29.2], [-16.1, -55.7], [-16.1, 134.3], [-16.1, 49.3], [-16.1, 16.8], [-16.1, -68.1], [-16.1, 36.9], [-16.1, -48.1], [-16.2, 141.9], [-16.2, 24.5], [-16.2, -60.5], [-16.2, 129.5], [-16.2, 44.6], [-16.2, -40.4], [-16.2, 12.1], [-16.2, 32.2], [-16.2, -52.8], [-16.2, 137.2], [-16.2, 19.8], [-16.2, -65.2], [-16.2, 124.8], [-16.2, -45.2], [-16.2, 144.9], [-16.2, 27.4], [-16.2, -57.6], [-16.3, 132.5], [-16.3, 47.5], [-16.3, 15], [-16.3, -70], [-16.3, 35.1], [-16.3, -49.9], [-16.3, 22.7], [-16.3, -62.3], [-16.3, 127.7], [-16.3, -42.2], [-16.3, 30.4], [-16.3, -54.6], [-16.3, 135.4], [-16.3, 18], [-16.3, -67], [-16.4, 38], [-16.4, -47], [-16.4, 143.1], [-16.4, 25.6], [-16.4, -59.4], [-16.4, 130.7], [-16.4, 45.7], [-16.4, 13.2], [-16.4, -71.8], [-16.4, 33.3], [-16.4, -51.7], [-16.4, 138.3], [-16.4, 20.9], [-16.4, -64.1], [-16.4, 125.9], [-16.4, -44], [-16.4, 146], [-16.5, 28.5], [-16.5, -56.4], [-16.5, 133.6], [-16.5, 48.6], [-16.5, 16.1], [-16.5, -68.8], [-16.5, 36.2], [-16.5, -48.8], [-16.5, 141.3], [-16.5, 23.8], [-16.5, -61.2], [-16.5, 128.9], [-16.5, -41.1], [-16.5, 31.5], [-16.5, -53.5], [-16.5, 136.5], [-16.6, 19.1], [-16.6, -65.9], [-16.6, 124.1], [-16.6, -45.9], [-16.6, 144.2], [-16.6, 26.7], [-16.6, -58.2], [-16.6, 131.8], [-16.6, 46.8], [-16.6, 14.3], [-16.6, -70.6], [-16.6, 34.4], [-16.6, -50.6], [-16.6, 139.4], [-16.6, 22], [-16.6, -63], [-16.7, 127], [-16.7, -42.9], [-16.7, 29.7], [-16.7, -55.3], [-16.7, 134.7], [-16.7, 49.7], [-16.7, 17.3], [-16.7, -67.7], [-16.7, 37.3], [-16.7, -47.7], [-16.7, 142.4], [-16.7, 24.9], [-16.7, -60.1], [-16.7, 130], [-16.7, 45], [-16.7, -40], [-16.7, 12.5], [-16.8, 32.6], [-16.8, -52.4], [-16.8, 137.6], [-16.8, 20.2], [-16.8, -64.8], [-16.8, 125.2], [-16.8, -44.7], [-16.8, 145.3], [-16.8, 27.9], [-16.8, -57.1], [-16.8, 132.9], [-16.8, 47.9], [-16.8, 15.5], [-16.8, -69.5], [-16.8, 35.5], [-16.8, -49.5], [-16.8, 140.6], [-16.9, 23.1], [-16.9, -61.9], [-16.9, 128.2], [-16.9, -41.8], [-16.9, 30.8], [-16.9, -54.2], [-16.9, 135.8], [-16.9, 18.4], [-16.9, -66.6], [-16.9, 123.4], [-16.9, -46.5], [-16.9, 143.5], [-16.9, 26], [-16.9, -58.9], [-16.9, 131.1], [-17, 46.1], [-17, 13.6], [-17, -71.3], [-17, 33.7], [-17, -51.3], [-17, 138.8], [-17, 21.3], [-17, -63.7], [-17, 126.4], [-17, -43.6], [-17, 146.4], [-17, 29], [-17, -56], [-17, 134], [-17, 49], [-17, 16.6], [-17, -68.4], [-17.1, 36.6], [-17.1, -48.4], [-17.1, 141.7], [-17.1, 24.2], [-17.1, -60.7], [-17.1, 129.3], [-17.1, 44.3], [-17.1, -40.7], [-17.1, 31.9], [-17.1, -53.1], [-17.1, 136.9], [-17.1, 19.5], [-17.1, -65.5], [-17.1, 124.5], [-17.1, -45.4], [-17.1, 144.6], [-17.2, 27.2], [-17.2, -57.8], [-17.2, 132.2], [-17.2, 47.2], [-17.2, 14.8], [-17.2, -70.2], [-17.2, 34.8], [-17.2, -50.2], [-17.2, 139.9], [-17.2, 22.4], [-17.2, -62.6], [-17.2, 127.5], [-17.2, -42.5], [-17.2, 30.1], [-17.2, -54.9], [-17.2, 135.1], [-17.3, 17.7], [-17.3, -67.3], [-17.3, 122.7], [-17.3, -47.2], [-17.3, 142.8], [-17.3, 25.4], [-17.3, -59.6], [-17.3, 130.4], [-17.3, 45.4], [-17.3, 13], [-17.3, 33], [-17.3, -52], [-17.3, 138.1], [-17.3, 20.6], [-17.3, -64.4], [-17.3, 125.7], [-17.4, -44.3], [-17.4, 145.7], [-17.4, 28.3], [-17.4, -56.7], [-17.4, 133.3], [-17.4, 48.3], [-17.4, 15.9], [-17.4, -69.1], [-17.4, 35.9], [-17.4, -49], [-17.4, 141], [-17.4, 23.5], [-17.4, -61.4], [-17.4, 128.6], [-17.4, -41.4], [-17.5, 31.2], [-17.5, -53.8], [-17.5, 136.3], [-17.5, 18.8], [-17.5, -66.2], [-17.5, 123.9], [-17.5, -46.1], [-17.5, 143.9], [-17.5, 26.5], [-17.5, -58.5], [-17.5, 131.5], [-17.5, 46.5], [-17.5, 14.1], [-17.5, 34.1], [-17.5, -50.9], [-17.5, 139.2], [-17.6, 21.7], [-17.6, -63.2], [-17.6, 126.8], [-17.6, -43.2], [-17.6, 146.8], [-17.6, 29.4], [-17.6, -55.6], [-17.6, 134.4], [-17.6, 49.5], [-17.6, 17], [-17.6, -68], [-17.6, 122], [-17.6, 37.1], [-17.6, -47.9], [-17.6, 142.1], [-17.6, 24.7], [-17.6, -60.3], [-17.6, 129.7], [-17.7, 44.7], [-17.7, -40.3], [-17.7, 12.3], [-17.7, 32.3], [-17.7, -52.7], [-17.7, 137.4], [-17.7, 19.9], [-17.7, -65.1], [-17.7, 125], [-17.7, -45], [-17.7, 145], [-17.7, 27.6], [-17.7, -57.4], [-17.7, 132.6], [-17.7, 47.7], [-17.7, 15.2], [-17.7, -69.8], [-17.8, 35.3], [-17.8, -49.7], [-17.8, 140.3], [-17.8, 22.9], [-17.8, -62.1], [-17.8, 127.9], [-17.8, -42.1], [-17.8, 30.5], [-17.8, -54.5], [-17.8, 135.6], [-17.8, 18.1], [-17.8, -66.9], [-17.8, 123.2], [-17.8, -46.8], [-17.8, 143.2], [-17.9, 25.8], [-17.9, -59.2], [-17.9, 130.8], [-17.9, 45.8], [-17.9, 13.4], [-17.9, 33.4], [-17.9, -51.5], [-17.9, 138.5], [-17.9, 21], [-17.9, -63.9], [-17.9, 126.1], [-17.9, -43.9], [-17.9, 146.2], [-17.9, 28.7], [-17.9, -56.3], [-17.9, 133.8], [-18, 48.8], [-18, 16.3], [-18, -68.7], [-18, 121.4], [-18, 36.4], [-18, -48.6], [-18, 141.4], [-18, 24], [-18, -61], [-18, 129], [-18, 44], [-18, -41], [-18, 31.6], [-18, -53.4], [-18, 136.7], [-18, 19.2], [-18, -65.7], [-18, 124.3], [-18.1, -45.7], [-18.1, 144.3], [-18.1, 26.9], [-18.1, -58.1], [-18.1, 131.9], [-18.1, 47], [-18.1, 14.5], [-18.1, 34.6], [-18.1, -50.4], [-18.1, 139.6], [-18.1, 22.2], [-18.1, -62.8], [-18.1, 127.2], [-18.1, -42.8], [-18.1, 147.3], [-18.2, 29.8], [-18.2, -55.2], [-18.2, 134.9], [-18.2, 17.4], [-18.2, -67.6], [-18.2, 122.5], [-18.2, -47.5], [-18.2, 142.5], [-18.2, 25.1], [-18.2, -59.9], [-18.2, 130.1], [-18.2, 45.2], [-18.2, 12.7], [-18.2, 32.8], [-18.2, -52.2], [-18.2, 137.8], [-18.3, 20.4], [-18.3, -64.6], [-18.3, 125.4], [-18.3, -44.6], [-18.3, 145.5], [-18.3, 28], [-18.3, -57], [-18.3, 133.1], [-18.3, 48.1], [-18.3, 15.6], [-18.3, -69.4], [-18.3, 120.7], [-18.3, 35.7], [-18.3, -49.3], [-18.3, 140.7], [-18.3, 23.3], [-18.3, -61.7], [-18.3, 128.3], [-18.4, -41.6], [-18.4, 30.9], [-18.4, -54], [-18.4, 136], [-18.4, 18.5], [-18.4, -66.4], [-18.4, 123.6], [-18.4, -46.4], [-18.4, 143.7], [-18.4, 26.2], [-18.4, -58.8], [-18.4, 131.3], [-18.4, 46.3], [-18.4, 13.8], [-18.5, 33.9], [-18.5, -51.1], [-18.5, 138.9], [-18.5, 21.5], [-18.5, -63.5], [-18.5, 126.5], [-18.5, -43.5], [-18.5, 146.6], [-18.5, 29.1], [-18.5, -55.9], [-18.5, 134.2], [-18.5, 16.7], [-18.5, -68.2], [-18.5, 121.8], [-18.5, -48.2], [-18.5, 141.8], [-18.6, 24.4], [-18.6, -60.6], [-18.6, 129.4], [-18.6, 44.5], [-18.6, -40.5], [-18.6, 32.1], [-18.6, -52.9], [-18.6, 137.1], [-18.6, 19.7], [-18.6, -65.3], [-18.6, 124.7], [-18.6, -45.3], [-18.6, 144.8], [-18.6, 27.3], [-18.6, -57.7], [-18.7, 132.4], [-18.7, 47.4], [-18.7, 14.9], [-18.7, 120], [-18.7, 35], [-18.7, -50], [-18.7, 140], [-18.7, 22.6], [-18.7, -62.4], [-18.7, 127.6], [-18.7, -42.3], [-18.7, 147.7], [-18.7, 30.3], [-18.7, -54.7], [-18.7, 135.3], [-18.7, 17.9], [-18.7, -67.1], [-18.8, 122.9], [-18.8, -47.1], [-18.8, 143], [-18.8, 25.5], [-18.8, -59.5], [-18.8, 130.6], [-18.8, 45.6], [-18.8, 13.1], [-18.8, 33.2], [-18.8, -51.8], [-18.8, 138.2], [-18.8, 20.8], [-18.8, -64.2], [-18.8, 125.8], [-18.8, -44.1], [-18.8, 145.9], [-18.9, 28.4], [-18.9, -56.5], [-18.9, 133.5], [-18.9, 48.5], [-18.9, 16], [-18.9, -68.9], [-18.9, 121.1], [-18.9, 36.1], [-18.9, -48.9], [-18.9, 141.2], [-18.9, 23.7], [-18.9, -61.3], [-18.9, 128.8], [-18.9, -41.2], [-18.9, 31.4], [-18.9, -53.6], [-19, 136.4], [-19, 19], [-19, -66], [-19, 124], [-19, -46], [-19, 144.1], [-19, 26.6], [-19, -58.4], [-19, 131.7], [-19, 46.7], [-19, 14.2], [-19, 119.3], [-19, 34.3], [-19, -50.7], [-19, 139.3], [-19, 21.9], [-19, -63.1], [-19.1, 126.9], [-19.1, -43], [-19.1, 147], [-19.1, 29.6], [-19.1, -55.4], [-19.1, 134.6], [-19.1, 17.2], [-19.1, -67.8], [-19.1, 122.2], [-19.1, -47.8], [-19.1, 142.3], [-19.1, 24.8], [-19.1, -60.2], [-19.1, 129.9], [-19.1, 44.9], [-19.2, 32.5], [-19.2, -52.5], [-19.2, 137.5], [-19.2, 20.1], [-19.2, -64.9], [-19.2, 125.1], [-19.2, -44.8], [-19.2, 145.2], [-19.2, 27.8], [-19.2, -57.2], [-19.2, 132.8], [-19.2, 47.8], [-19.2, 15.4], [-19.2, -69.6], [-19.2, 120.4], [-19.2, 35.4], [-19.2, -49.6], [-19.3, 140.5], [-19.3, 23], [-19.3, -62], [-19.3, 128.1], [-19.3, -41.9], [-19.3, 148.1], [-19.3, 30.7], [-19.3, -54.3], [-19.3, 135.7], [-19.3, 18.3], [-19.3, -66.7], [-19.3, 123.3], [-19.3, -46.6], [-19.3, 143.4], [-19.3, 25.9], [-19.3, -59], [-19.4, 131], [-19.4, 46], [-19.4, 13.5], [-19.4, 118.6], [-19.4, 33.6], [-19.4, -51.4], [-19.4, 138.7], [-19.4, 21.2], [-19.4, -63.8], [-19.4, 126.3], [-19.4, -43.7], [-19.4, 146.3], [-19.4, 28.9], [-19.4, -56.1], [-19.4, 133.9], [-19.5, 16.5], [-19.5, -68.5], [-19.5, 121.5], [-19.5, -48.5], [-19.5, 141.6], [-19.5, 24.1], [-19.5, -60.9], [-19.5, 129.2], [-19.5, 44.2], [-19.5, -40.8], [-19.5, 31.8], [-19.5, -53.2], [-19.5, 136.8], [-19.5, 19.4], [-19.5, -65.6], [-19.5, 124.4], [-19.5, -45.5], [-19.6, 144.5], [-19.6, 27.1], [-19.6, -57.9], [-19.6, 132.1], [-19.6, 47.1], [-19.6, 14.7], [-19.6, 119.7], [-19.6, 34.7], [-19.6, -50.3], [-19.6, 139.8], [-19.6, 22.3], [-19.6, -62.7], [-19.6, 127.4], [-19.6, -42.6], [-19.6, 147.4], [-19.6, 30], [-19.7, -55], [-19.7, 135], [-19.7, 17.6], [-19.7, -67.4], [-19.7, 122.6], [-19.7, -47.3], [-19.7, 142.7], [-19.7, 25.3], [-19.7, -59.7], [-19.7, 130.3], [-19.7, 45.3], [-19.7, 12.9], [-19.7, 117.9], [-19.7, 32.9], [-19.7, -52.1], [-19.7, 138], [-19.8, 20.5], [-19.8, -64.5], [-19.8, 125.6], [-19.8, -44.4], [-19.8, 145.6], [-19.8, 28.2], [-19.8, -56.8], [-19.8, 133.2], [-19.8, 48.2], [-19.8, 15.8], [-19.8, -69.2], [-19.8, 120.8], [-19.8, -49.1], [-19.8, 140.9], [-19.8, 23.4], [-19.8, -61.5], [-19.8, 128.5], [-19.9, -41.5], [-19.9, 148.6], [-19.9, 31.1], [-19.9, -53.9], [-19.9, 136.2], [-19.9, 18.7], [-19.9, -66.3], [-19.9, 123.8], [-19.9, -46.2], [-19.9, 143.8], [-19.9, 26.4], [-19.9, -58.6], [-19.9, 131.4], [-19.9, 46.4], [-19.9, 14], [-19.9, 119], [-20, 34], [-20, -51], [-20, 139.1], [-20, 21.6], [-20, -63.4], [-20, 126.7], [-20, -43.3], [-20, 146.7], [-20, 29.3], [-20, -55.7], [-20, 134.3], [-20, 16.9], [-20, -68.1], [-20, 121.9], [-20, -48], [-20, 142], [-20.1, 24.6], [-20.1, -60.4], [-20.1, 129.6], [-20.1, 44.6], [-20.1, 117.2], [-20.1, 32.2], [-20.1, -52.8], [-20.1, 137.3], [-20.1, 19.8], [-20.1, -65.2], [-20.1, 124.9], [-20.1, -45.1], [-20.1, 144.9], [-20.1, 27.5], [-20.1, -57.5], [-20.1, 132.5], [-20.2, 47.6], [-20.2, 15.1], [-20.2, -69.9], [-20.2, 120.1], [-20.2, -49.8], [-20.2, 140.2], [-20.2, 22.8], [-20.2, -62.2], [-20.2, 127.8], [-20.2, -42.2], [-20.2, 147.9], [-20.2, 30.4], [-20.2, -54.6], [-20.2, 135.5], [-20.2, 18], [-20.2, -67], [-20.3, 123.1], [-20.3, -46.9], [-20.3, 143.1], [-20.3, 25.7], [-20.3, -59.3], [-20.3, 130.7], [-20.3, 45.7], [-20.3, 13.3], [-20.3, 118.3], [-20.3, 33.3], [-20.3, -51.6], [-20.3, 138.4], [-20.3, 20.9], [-20.3, -64], [-20.3, 126], [-20.3, -44], [-20.3, 146.1], [-20.4, 28.6], [-20.4, -56.4], [-20.4, 133.7], [-20.4, 16.2], [-20.4, -68.8], [-20.4, 121.3], [-20.4, -48.7], [-20.4, 141.3], [-20.4, 23.9], [-20.4, -61.1], [-20.4, 128.9], [-20.4, -41.1], [-20.4, 149], [-20.4, 116.5], [-20.4, 31.5], [-20.4, -53.5], [-20.5, 136.6], [-20.5, 19.1], [-20.5, -65.8], [-20.5, 124.2], [-20.5, -45.8], [-20.5, 144.2], [-20.5, 26.8], [-20.5, -58.2], [-20.5, 131.8], [-20.5, 46.9], [-20.5, 14.4], [-20.5, 119.4], [-20.5, 34.5], [-20.5, -50.5], [-20.5, 139.5], [-20.5, 22.1], [-20.6, -62.9], [-20.6, 127.1], [-20.6, -42.9], [-20.6, 147.2], [-20.6, 29.7], [-20.6, -55.3], [-20.6, 134.8], [-20.6, 17.3], [-20.6, -67.7], [-20.6, 122.4], [-20.6, -47.6], [-20.6, 142.4], [-20.6, 25], [-20.6, -60], [-20.6, 130], [-20.6, 45.1], [-20.7, 117.6], [-20.7, 32.7], [-20.7, -52.3], [-20.7, 137.7], [-20.7, 20.3], [-20.7, -64.7], [-20.7, 125.3], [-20.7, -44.7], [-20.7, 145.4], [-20.7, 27.9], [-20.7, -57.1], [-20.7, 133], [-20.7, 48], [-20.7, 15.5], [-20.7, -69.5], [-20.7, 120.6], [-20.8, -49.4], [-20.8, 140.6], [-20.8, 23.2], [-20.8, -61.8], [-20.8, 128.2], [-20.8, -41.7], [-20.8, 148.3], [-20.8, 30.8], [-20.8, -54.1], [-20.8, 135.9], [-20.8, 18.4], [-20.8, -66.5], [-20.8, 123.5], [-20.8, -46.5], [-20.8, 143.6], [-20.9, 26.1], [-20.9, -58.9], [-20.9, 131.2], [-20.9, 46.2], [-20.9, 13.7], [-20.9, 118.8], [-20.9, 33.8], [-20.9, -51.2], [-20.9, 138.8], [-20.9, 21.4], [-20.9, -63.6], [-20.9, 126.4], [-20.9, -43.6], [-20.9, 146.5], [-20.9, 29], [-20.9, -56], [-20.9, 134.1], [-21, 16.6], [-21, -68.3], [-21, 121.7], [-21, -48.3], [-21, 141.7], [-21, 24.3], [-21, -60.7], [-21, 129.3], [-21, 44.4], [-21, 149.4], [-21, 116.9], [-21, 32], [-21, -53], [-21, 137], [-21, 19.6], [-21, -65.4], [-21.1, 124.6], [-21.1, -45.4], [-21.1, 144.7], [-21.1, 27.2], [-21.1, -57.8], [-21.1, 132.3], [-21.1, 47.3], [-21.1, 14.8], [-21.1, -70.2], [-21.1, 119.9], [-21.1, 34.9], [-21.1, -50.1], [-21.1, 139.9], [-21.1, 22.5], [-21.1, -62.5], [-21.1, 127.5], [-21.1, -42.4], [-21.1, 147.6], [-21.2, 30.2], [-21.2, -54.8], [-21.2, 135.2], [-21.2, 17.8], [-21.2, -67.2], [-21.2, 122.8], [-21.2, -47.2], [-21.2, 142.9], [-21.2, 25.4], [-21.2, -59.6], [-21.2, 130.5], [-21.2, 45.5], [-21.2, 118.1], [-21.2, 33.1], [-21.2, -51.9], [-21.3, 138.1], [-21.3, 20.7], [-21.3, -64.3], [-21.3, 125.7], [-21.3, -44.2], [-21.3, 145.8], [-21.3, 28.3], [-21.3, -56.6], [-21.3, 133.4], [-21.3, 15.9], [-21.3, -69], [-21.3, 121], [-21.3, -49], [-21.3, 141.1], [-21.3, 23.6], [-21.3, -61.4], [-21.4, 128.7], [-21.4, -41.3], [-21.4, 148.7], [-21.4, 116.3], [-21.4, 31.3], [-21.4, -53.7], [-21.4, 136.3], [-21.4, 18.9], [-21.4, -66.1], [-21.4, 123.9], [-21.4, -46.1], [-21.4, 144], [-21.4, 26.5], [-21.4, -58.5], [-21.4, 131.6], [-21.4, 46.6], [-21.5, 14.1], [-21.5, 119.2], [-21.5, 34.2], [-21.5, -50.8], [-21.5, 139.2], [-21.5, 21.8], [-21.5, -63.2], [-21.5, 126.8], [-21.5, -43.1], [-21.5, 146.9], [-21.5, 29.5], [-21.5, -55.5], [-21.5, 134.5], [-21.5, 17.1], [-21.5, -67.9], [-21.5, 122.1], [-21.6, -47.9], [-21.6, 142.2], [-21.6, 24.7], [-21.6, -60.3], [-21.6, 129.8], [-21.6, 44.8], [-21.6, 149.8], [-21.6, 117.4], [-21.6, 32.4], [-21.6, -52.6], [-21.6, 137.4], [-21.6, 20], [-21.6, -65], [-21.6, 125], [-21.6, -44.9], [-21.6, 145.1], [-21.7, 27.7], [-21.7, -57.3], [-21.7, 132.7], [-21.7, 47.7], [-21.7, 15.3], [-21.7, -69.7], [-21.7, 120.3], [-21.7, -49.7], [-21.7, 140.4], [-21.7, 22.9], [-21.7, -62.1], [-21.7, 128], [-21.7, -42], [-21.7, 148], [-21.7, 115.6], [-21.7, 30.6], [-21.7, -54.4], [-21.7, 135.6], [-21.8, 18.2], [-21.8, -66.8], [-21.8, 123.2], [-21.8, -46.7], [-21.8, 143.3], [-21.8, 25.8], [-21.8, -59.1], [-21.8, 130.9], [-21.8, 45.9], [-21.8, 13.4], [-21.8, 118.5], [-21.8, 33.5], [-21.8, -51.5], [-21.8, 138.6], [-21.8, 21.1], [-21.8, -63.9], [-21.9, 126.2], [-21.9, -43.8], [-21.9, 146.2], [-21.9, 28.8], [-21.9, -56.2], [-21.9, 133.8], [-21.9, 16.4], [-21.9, -68.6], [-21.9, 121.4], [-21.9, -48.6], [-21.9, 141.5], [-21.9, 24], [-21.9, -61], [-21.9, 129.1], [-21.9, 44.1], [-21.9, 149.1], [-22, 116.7], [-22, 31.7], [-22, -53.3], [-22, 136.7], [-22, 19.3], [-22, -65.7], [-22, 124.3], [-22, -45.6], [-22, 144.4], [-22, 27], [-22, -58], [-22, 132], [-22, 47], [-22, 14.6], [-22, 119.6], [-22, 34.6], [-22, -50.4], [-22.1, 139.7], [-22.1, 22.2], [-22.1, -62.8], [-22.1, 127.3], [-22.1, -42.7], [-22.1, 147.3], [-22.1, 114.9], [-22.1, 29.9], [-22.1, -55.1], [-22.1, 134.9], [-22.1, 17.5], [-22.1, -67.5], [-22.1, 122.5], [-22.1, -47.4], [-22.1, 142.6], [-22.2, 25.2], [-22.2, -59.8], [-22.2, 130.2], [-22.2, 45.2], [-22.2, 150.3], [-22.2, 117.8], [-22.2, 32.8], [-22.2, -52.2], [-22.2, 137.9], [-22.2, 20.4], [-22.2, -64.6], [-22.2, 125.5], [-22.2, -44.5], [-22.2, 145.5], [-22.2, 28.1], [-22.2, -56.9], [-22.2, 133.1], [-22.3, 15.7], [-22.3, -69.3], [-22.3, 120.7], [-22.3, -49.2], [-22.3, 140.8], [-22.3, 23.3], [-22.3, -61.6], [-22.3, 128.4], [-22.3, -41.6], [-22.3, 148.5], [-22.3, 116], [-22.3, 31], [-22.3, -54], [-22.3, 136.1], [-22.3, 18.6], [-22.3, -66.4], [-22.3, 123.7], [-22.4, -46.3], [-22.4, 143.7], [-22.4, 26.3], [-22.4, -58.7], [-22.4, 131.3], [-22.4, 46.3], [-22.4, 13.9], [-22.4, 118.9], [-22.4, 33.9], [-22.4, -51.1], [-22.4, 139], [-22.4, 21.5], [-22.4, -63.5], [-22.4, 126.6], [-22.4, -43.4], [-22.4, 146.6], [-22.5, 114.2], [-22.5, 29.2], [-22.5, -55.8], [-22.5, 134.2], [-22.5, 16.8], [-22.5, -68.2], [-22.5, 121.8], [-22.5, -48.1], [-22.5, 141.9], [-22.5, 24.5], [-22.5, -60.5], [-22.5, 129.5], [-22.5, 44.5], [-22.5, 149.6], [-22.5, 117.1], [-22.5, 32.1], [-22.5, -52.9], [-22.6, 137.2], [-22.6, 19.7], [-22.6, -65.3], [-22.6, 124.8], [-22.6, -45.2], [-22.6, 144.8], [-22.6, 27.4], [-22.6, -57.6], [-22.6, 132.4], [-22.6, 47.4], [-22.6, 15], [-22.6, -70], [-22.6, 120], [-22.6, -49.9], [-22.6, 140.1], [-22.6, 22.7], [-22.7, -62.3], [-22.7, 127.7], [-22.7, -42.3], [-22.7, 147.8], [-22.7, 115.3], [-22.7, 30.3], [-22.7, -54.7], [-22.7, 135.4], [-22.7, 17.9], [-22.7, -67.1], [-22.7, 123], [-22.7, -47], [-22.7, 143], [-22.7, 25.6], [-22.7, -59.4], [-22.7, 130.6], [-22.7, 45.6], [-22.8, 150.7], [-22.8, 118.2], [-22.8, 33.2], [-22.8, -51.7], [-22.8, 138.3], [-22.8, 20.8], [-22.8, -64.1], [-22.8, 125.9], [-22.8, -44.1], [-22.8, 146], [-22.8, 28.5], [-22.8, -56.5], [-22.8, 133.6], [-22.8, 16.1], [-22.8, -68.9], [-22.8, 121.2], [-22.9, -48.8], [-22.9, 141.2], [-22.9, 23.8], [-22.9, -61.2], [-22.9, 128.8], [-22.9, 148.9], [-22.9, 116.4], [-22.9, 31.4], [-22.9, -53.6], [-22.9, 136.5], [-22.9, 19], [-22.9, -66], [-22.9, 124.1], [-22.9, -45.9], [-22.9, 144.1], [-23, 26.7], [-23, -58.3], [-23, 131.7], [-23, 46.8], [-23, 14.3], [-23, 119.3], [-23, 34.4], [-23, -50.6], [-23, 139.4], [-23, 22], [-23, -63], [-23, 127], [-23, -43], [-23, 147.1], [-23, 114.6], [-23, 29.6], [-23, -55.4], [-23.1, 134.7], [-23.1, 17.2], [-23.1, -67.8], [-23.1, 122.3], [-23.1, -47.7], [-23.1, 142.3], [-23.1, 24.9], [-23.1, -60.1], [-23.1, 129.9], [-23.1, 44.9], [-23.1, 150], [-23.1, 117.5], [-23.1, 32.6], [-23.1, -52.4], [-23.1, 137.6], [-23.1, 20.2], [-23.2, -64.8], [-23.2, 125.2], [-23.2, -44.8], [-23.2, 145.3], [-23.2, 27.8], [-23.2, -57.2], [-23.2, 132.9], [-23.2, 15.4], [-23.2, -69.6], [-23.2, 120.5], [-23.2, -49.5], [-23.2, 140.5], [-23.2, 23.1], [-23.2, -61.9], [-23.2, 128.1], [-23.3, 148.2], [-23.3, 115.7], [-23.3, 30.7], [-23.3, -54.2], [-23.3, 135.8], [-23.3, 18.3], [-23.3, -66.6], [-23.3, 123.4], [-23.3, -46.6], [-23.3, 143.5], [-23.3, 26], [-23.3, -59], [-23.3, 131.1], [-23.3, 46.1], [-23.3, 151.1], [-23.4, 118.7], [-23.4, 33.7], [-23.4, -51.3], [-23.4, 138.7], [-23.4, 21.3], [-23.4, -63.7], [-23.4, 126.3], [-23.4, -43.7], [-23.4, 146.4], [-23.4, 28.9], [-23.4, -56.1], [-23.4, 134], [-23.4, 16.5], [-23.4, -68.5], [-23.4, 121.6], [-23.4, -48.4], [-23.4, 141.6], [-23.5, 24.2], [-23.5, -60.8], [-23.5, 129.2], [-23.5, 44.3], [-23.5, 149.3], [-23.5, 116.8], [-23.5, 31.9], [-23.5, -53.1], [-23.5, 136.9], [-23.5, 19.5], [-23.5, -65.5], [-23.5, 124.5], [-23.5, -45.5], [-23.5, 144.6], [-23.5, 27.1], [-23.5, -57.9], [-23.6, 132.2], [-23.6, 47.2], [-23.6, 14.7], [-23.6, -70.3], [-23.6, 119.8], [-23.6, 34.8], [-23.6, -50.2], [-23.6, 139.8], [-23.6, 22.4], [-23.6, -62.6], [-23.6, 127.4], [-23.6, 147.5], [-23.6, 115], [-23.6, 30.1], [-23.6, -54.9], [-23.6, 135.1], [-23.7, 17.7], [-23.7, -67.3], [-23.7, 122.7], [-23.7, -47.3], [-23.7, 142.8], [-23.7, 25.3], [-23.7, -59.7], [-23.7, 130.4], [-23.7, 45.4], [-23.7, 150.4], [-23.7, 118], [-23.7, 33], [-23.7, -52], [-23.7, 138], [-23.7, 20.6], [-23.7, -64.4], [-23.7, 125.6], [-23.8, -44.3], [-23.8, 145.7], [-23.8, 28.2], [-23.8, -56.7], [-23.8, 133.3], [-23.8, 15.8], [-23.8, -69.1], [-23.8, 120.9], [-23.8, -49.1], [-23.8, 141], [-23.8, 23.5], [-23.8, -61.5], [-23.8, 128.6], [-23.8, 148.6], [-23.9, 116.2], [-23.9, 31.2], [-23.9, -53.8], [-23.9, 136.2], [-23.9, 18.8], [-23.9, -66.2], [-23.9, 123.8], [-23.9, -46.2], [-23.9, 143.9], [-23.9, 26.4], [-23.9, -58.6], [-23.9, 131.5], [-23.9, 46.5], [-23.9, 151.5], [-23.9, 119.1], [-23.9, 34.1], [-23.9, -50.9], [-24, 139.1], [-24, 21.7], [-24, -63.3], [-24, 126.7], [-24, 146.8], [-24, 114.3], [-24, 29.4], [-24, -55.6], [-24, 134.4], [-24, 17], [-24, -68], [-24, 122], [-24, -48], [-24, 142.1], [-24.1, 24.6], [-24.1, -60.4], [-24.1, 129.7], [-24.1, 44.7], [-24.1, 149.7], [-24.1, 117.3], [-24.1, 32.3], [-24.1, -52.7], [-24.1, 137.3], [-24.1, 19.9], [-24.1, -65.1], [-24.1, 124.9], [-24.1, -45], [-24.1, 145], [-24.1, 27.6], [-24.1, -57.4], [-24.1, 132.6], [-24.2, 15.2], [-24.2, -69.8], [-24.2, 120.2], [-24.2, -49.8], [-24.2, 140.3], [-24.2, 22.8], [-24.2, -62.2], [-24.2, 127.9], [-24.2, 147.9], [-24.2, 115.5], [-24.2, 30.5], [-24.2, -54.5], [-24.2, 135.5], [-24.2, 18.1], [-24.2, -66.9], [-24.3, 123.1], [-24.3, -46.8], [-24.3, 143.2], [-24.3, 25.7], [-24.3, -59.2], [-24.3, 130.8], [-24.3, 45.8], [-24.3, 150.9], [-24.3, 118.4], [-24.3, 33.4], [-24.3, -51.6], [-24.3, 138.5], [-24.3, 21], [-24.3, -64], [-24.3, 126.1], [-24.4, 146.1], [-24.4, 28.7], [-24.4, -56.3], [-24.4, 133.7], [-24.4, 16.3], [-24.4, -68.7], [-24.4, 121.3], [-24.4, -48.7], [-24.4, 141.4], [-24.4, 23.9], [-24.4, -61.1], [-24.4, 129], [-24.4, 149], [-24.4, 116.6], [-24.4, 31.6], [-24.5, -53.4], [-24.5, 136.6], [-24.5, 19.2], [-24.5, -65.8], [-24.5, 124.2], [-24.5, -45.7], [-24.5, 144.3], [-24.5, 26.9], [-24.5, -58.1], [-24.5, 131.9], [-24.5, 46.9], [-24.5, 14.5], [-24.5, 152], [-24.5, -70.5], [-24.5, 119.5], [-24.5, 34.5], [-24.5, -50.5], [-24.5, 139.6], [-24.6, 22.1], [-24.6, -62.9], [-24.6, 127.2], [-24.6, 147.2], [-24.6, 114.8], [-24.6, 29.8], [-24.6, -55.2], [-24.6, 134.8], [-24.6, 17.4], [-24.6, -67.6], [-24.6, 122.4], [-24.6, -47.5], [-24.6, 142.5], [-24.6, 25.1], [-24.6, -59.9], [-24.7, 130.1], [-24.7, 150.2], [-24.7, 117.7], [-24.7, 32.7], [-24.7, -52.3], [-24.7, 137.8], [-24.7, 20.3], [-24.7, -64.7], [-24.7, 125.4], [-24.7, 145.4], [-24.7, 28], [-24.7, -57], [-24.7, 133], [-24.8, 15.6], [-24.8, -69.4], [-24.8, 120.6], [-24.8, -49.3], [-24.8, 140.7], [-24.8, 23.2], [-24.8, -61.7], [-24.8, 128.3], [-24.8, 148.4], [-24.8, 115.9], [-24.8, 30.9], [-24.8, -54.1], [-24.8, 136], [-24.8, 18.5], [-24.8, -66.5], [-24.8, 123.6], [-24.9, -46.4], [-24.9, 143.6], [-24.9, 26.2], [-24.9, -58.8], [-24.9, 131.2], [-24.9, 151.3], [-24.9, 118.8], [-24.9, 33.8], [-24.9, -51.2], [-24.9, 138.9], [-24.9, 21.4], [-24.9, -63.6], [-24.9, 126.5], [-24.9, 146.5], [-25, 29.1], [-25, -55.9], [-25, 134.1], [-25, 16.7], [-25, -68.3], [-25, 121.7], [-25, -48.2], [-25, 141.8], [-25, 24.4], [-25, -60.6], [-25, 129.4], [-25, 149.5], [-25, 117], [-25, 32], [-25, -53], [-25.1, 137.1], [-25.1, 19.6], [-25.1, -65.4], [-25.1, 124.7], [-25.1, 144.7], [-25.1, 27.3], [-25.1, -57.7], [-25.1, 132.3], [-25.1, 14.9], [-25.1, 152.4], [-25.1, -70.1], [-25.1, 119.9], [-25.1, -50], [-25.1, 140], [-25.2, 22.6], [-25.2, -62.4], [-25.2, 127.6], [-25.2, 147.7], [-25.2, 115.2], [-25.2, 30.2], [-25.2, -54.8], [-25.2, 135.3], [-25.2, 17.8], [-25.2, -67.2], [-25.2, 122.9], [-25.2, -47.1], [-25.2, 142.9], [-25.2, 25.5], [-25.2, -59.5], [-25.2, 130.5], [-25.3, 150.6], [-25.3, 118.1], [-25.3, 33.1], [-25.3, -51.8], [-25.3, 138.2], [-25.3, 20.7], [-25.3, -64.2], [-25.3, 125.8], [-25.3, 145.9], [-25.3, 28.4], [-25.3, -56.6], [-25.3, 133.5], [-25.3, 16], [-25.3, -69], [-25.4, 121.1], [-25.4, -48.9], [-25.4, 141.1], [-25.4, 23.7], [-25.4, -61.3], [-25.4, 128.7], [-25.4, 148.8], [-25.4, 116.3], [-25.4, 31.3], [-25.4, -53.7], [-25.4, 136.4], [-25.4, 18.9], [-25.4, -66.1], [-25.4, 124], [-25.5, 144], [-25.5, 26.6], [-25.5, -58.4], [-25.5, 131.6], [-25.5, 151.7], [-25.5, 119.2], [-25.5, -50.7], [-25.5, 139.3], [-25.5, 21.9], [-25.5, -63.1], [-25.5, 126.9], [-25.5, 147], [-25.6, 114.5], [-25.6, 29.5], [-25.6, -55.5], [-25.6, 134.6], [-25.6, 17.1], [-25.6, -67.9], [-25.6, 122.2], [-25.6, -47.8], [-25.6, 142.2], [-25.6, 24.8], [-25.6, -60.2], [-25.6, 129.8], [-25.6, 149.9], [-25.6, 117.4], [-25.6, 32.4], [-25.6, -52.5], [-25.7, 137.5], [-25.7, 20.1], [-25.7, -64.9], [-25.7, 125.1], [-25.7, 145.2], [-25.7, 27.7], [-25.7, -57.3], [-25.7, 132.8], [-25.7, 15.3], [-25.7, -69.7], [-25.7, 120.4], [-25.7, -49.6], [-25.7, 140.4], [-25.7, 23], [-25.8, -62], [-25.8, 128], [-25.8, 148.1], [-25.8, 115.6], [-25.8, 30.6], [-25.8, -54.3], [-25.8, 135.7], [-25.8, 18.2], [-25.8, -66.7], [-25.8, 123.3], [-25.8, 143.4], [-25.8, 25.9], [-25.8, -59.1], [-25.8, 131], [-25.9, 151], [-25.9, 118.6], [-25.9, 33.6], [-25.9, -51.4], [-25.9, 138.6], [-25.9, 21.2], [-25.9, -63.8], [-25.9, 126.2], [-25.9, 146.3], [-25.9, 28.8], [-25.9, -56.2], [-25.9, 133.9], [-25.9, 16.4], [-25.9, -68.6], [-26, 121.5], [-26, -48.5], [-26, 141.5], [-26, 24.1], [-26, -60.9], [-26, 129.1], [-26, 149.2], [-26, 116.7], [-26, 31.8], [-26, -53.2], [-26, 136.8], [-26, 19.4], [-26, -65.6], [-26, 124.4], [-26.1, 144.5], [-26.1, 27], [-26.1, -58], [-26.1, 132.1], [-26.1, 152.1], [-26.1, -70.4], [-26.1, 119.7], [-26.1, -50.3], [-26.1, 139.7], [-26.1, 22.3], [-26.1, -62.7], [-26.1, 127.3], [-26.1, 147.4], [-26.2, 114.9], [-26.2, 29.9], [-26.2, -55], [-26.2, 135], [-26.2, 17.6], [-26.2, -67.4], [-26.2, 122.6], [-26.2, 142.7], [-26.2, 25.2], [-26.2, -59.8], [-26.2, 130.3], [-26.2, 150.3], [-26.2, 117.9], [-26.2, 32.9], [-26.2, -52.1], [-26.3, 137.9], [-26.3, 20.5], [-26.3, -64.5], [-26.3, 125.5], [-26.3, 145.6], [-26.3, 28.1], [-26.3, -56.8], [-26.3, 133.2], [-26.3, 15.7], [-26.3, -69.2], [-26.3, 120.8], [-26.3, -49.2], [-26.3, 140.9], [-26.4, 23.4], [-26.4, -61.6], [-26.4, 128.5], [-26.4, 148.5], [-26.4, 116.1], [-26.4, 31.1], [-26.4, -53.9], [-26.4, 136.1], [-26.4, 18.7], [-26.4, -66.3], [-26.4, 123.7], [-26.4, 143.8], [-26.4, 26.3], [-26.4, -58.7], [-26.4, 131.4], [-26.5, 151.4], [-26.5, 119], [-26.5, -51], [-26.5, 139], [-26.5, 21.6], [-26.5, -63.4], [-26.5, 126.6], [-26.5, 146.7], [-26.5, 29.3], [-26.5, -55.7], [-26.5, 134.3], [-26.5, 16.9], [-26.6, -68.1], [-26.6, 121.9], [-26.6, 142], [-26.6, 24.5], [-26.6, -60.5], [-26.6, 129.6], [-26.6, 149.6], [-26.6, 117.2], [-26.6, 32.2], [-26.6, -52.8], [-26.6, 137.2], [-26.6, 19.8], [-26.6, -65.2], [-26.6, 124.8], [-26.7, 144.9], [-26.7, 27.4], [-26.7, -57.5], [-26.7, 132.5], [-26.7, 15.1], [-26.7, 152.6], [-26.7, -69.9], [-26.7, 120.1], [-26.7, -49.9], [-26.7, 140.2], [-26.7, 22.7], [-26.7, -62.3], [-26.7, 127.8], [-26.7, 147.8], [-26.8, 115.4], [-26.8, 30.4], [-26.8, -54.6], [-26.8, 135.4], [-26.8, 18], [-26.8, -67], [-26.8, 123], [-26.8, 143.1], [-26.8, 25.6], [-26.8, -59.3], [-26.8, 130.7], [-26.8, 150.7], [-26.8, 118.3], [-26.8, -51.7], [-26.9, 138.4], [-26.9, 20.9], [-26.9, -64.1], [-26.9, 126], [-26.9, 146], [-26.9, 28.6], [-26.9, -56.4], [-26.9, 133.6], [-26.9, 16.2], [-26.9, -68.8], [-26.9, 121.2], [-26.9, -48.8], [-26.9, 141.3], [-27, 23.8], [-27, -61.2], [-27, 128.9], [-27, 148.9], [-27, 116.5], [-27, 31.5], [-27, -53.5], [-27, 136.5], [-27, 19.1], [-27, -65.9], [-27, 124.1], [-27, 144.2], [-27, 26.8], [-27, -58.2], [-27.1, 131.8], [-27.1, 151.9], [-27.1, -70.6], [-27.1, 119.4], [-27.1, -50.6], [-27.1, 139.5], [-27.1, 22], [-27.1, -63], [-27.1, 127.1], [-27.1, 147.1], [-27.1, 114.7], [-27.1, 29.7], [-27.1, -55.3], [-27.1, 134.7], [-27.2, 17.3], [-27.2, -67.7], [-27.2, 122.3], [-27.2, 142.4], [-27.2, 25], [-27.2, -60], [-27.2, 130], [-27.2, 150.1], [-27.2, 117.6], [-27.2, 32.6], [-27.2, -52.4], [-27.2, 137.7], [-27.2, 20.2], [-27.2, -64.8], [-27.3, 125.3], [-27.3, 145.3], [-27.3, 27.9], [-27.3, -57.1], [-27.3, 132.9], [-27.3, 15.5], [-27.3, -69.5], [-27.3, 120.5], [-27.3, -49.4], [-27.3, 140.6], [-27.3, 23.1], [-27.3, -61.8], [-27.3, 128.2], [-27.4, 148.2], [-27.4, 115.8], [-27.4, 30.8], [-27.4, -54.2], [-27.4, 135.9], [-27.4, 18.4], [-27.4, -66.6], [-27.4, 123.5], [-27.4, 143.5], [-27.4, 26.1], [-27.4, -58.9], [-27.4, 131.1], [-27.4, 151.2], [-27.4, 118.7], [-27.5, -51.3], [-27.5, 138.8], [-27.5, 21.3], [-27.5, -63.7], [-27.5, 126.4], [-27.5, 146.4], [-27.5, 29], [-27.5, -56], [-27.5, 134], [-27.5, 16.6], [-27.5, -68.4], [-27.5, 121.6], [-27.6, 141.7], [-27.6, 24.3], [-27.6, -60.7], [-27.6, 129.3], [-27.6, 149.4], [-27.6, 116.9], [-27.6, 31.9], [-27.6, -53.1], [-27.6, 137], [-27.6, 19.5], [-27.6, -65.5], [-27.6, 124.6], [-27.6, 144.6], [-27.7, 27.2], [-27.7, -57.8], [-27.7, 132.2], [-27.7, 152.3], [-27.7, -70.2], [-27.7, 119.8], [-27.7, -50.1], [-27.7, 139.9], [-27.7, 22.5], [-27.7, -62.5], [-27.7, 127.5], [-27.7, 147.6], [-27.7, 115.1], [-27.7, 30.1], [-27.7, -54.9], [-27.7, 135.2], [-27.8, 17.7], [-27.8, -67.3], [-27.8, 122.8], [-27.8, 142.8], [-27.8, 25.4], [-27.8, -59.6], [-27.8, 130.4], [-27.8, 150.5], [-27.8, 118], [-27.8, -51.9], [-27.8, 138.1], [-27.9, 20.6], [-27.9, -64.3], [-27.9, 125.7], [-27.9, 145.7], [-27.9, 28.3], [-27.9, -56.7], [-27.9, 133.4], [-27.9, 15.9], [-27.9, -69.1], [-27.9, 121], [-27.9, 141], [-27.9, 23.6], [-27.9, -61.4], [-27.9, 128.6], [-28, 148.7], [-28, 116.2], [-28, 31.2], [-28, -53.8], [-28, 136.3], [-28, 18.8], [-28, -66.2], [-28, 123.9], [-28, 143.9], [-28, 26.5], [-28, -58.5], [-28, 131.5], [-28.1, 151.6], [-28.1, 119.1], [-28.1, -50.8], [-28.1, 139.2], [-28.1, 21.8], [-28.1, -63.2], [-28.1, 126.8], [-28.1, 146.9], [-28.1, 29.4], [-28.1, -55.6], [-28.1, 134.5], [-28.1, 17], [-28.1, -68], [-28.1, 122.1], [-28.2, 142.1], [-28.2, 24.7], [-28.2, -60.3], [-28.2, 129.7], [-28.2, 149.8], [-28.2, 117.3], [-28.2, 32.3], [-28.2, -52.6], [-28.2, 137.4], [-28.2, 20], [-28.2, -65], [-28.2, 125], [-28.3, 145.1], [-28.3, 27.6], [-28.3, -57.4], [-28.3, 132.7], [-28.3, -69.8], [-28.3, 120.3], [-28.3, 140.3], [-28.3, 22.9], [-28.3, -62.1], [-28.3, 127.9], [-28.3, 148], [-28.3, 115.5], [-28.4, 30.5], [-28.4, -54.4], [-28.4, 135.6], [-28.4, 18.1], [-28.4, -66.8], [-28.4, 123.2], [-28.4, 143.2], [-28.4, 25.8], [-28.4, -59.2], [-28.4, 130.9], [-28.4, 150.9], [-28.4, 118.5], [-28.4, -51.5], [-28.5, 138.5], [-28.5, 21.1], [-28.5, -63.9], [-28.5, 126.1], [-28.5, 146.2], [-28.5, 28.7], [-28.5, -56.3], [-28.5, 133.8], [-28.5, 16.3], [-28.5, -68.7], [-28.5, 121.4], [-28.5, 141.4], [-28.6, 24], [-28.6, -61], [-28.6, 129], [-28.6, 149.1], [-28.6, 116.6], [-28.6, 31.7], [-28.6, -53.3], [-28.6, 136.7], [-28.6, 19.3], [-28.6, -65.7], [-28.6, 124.3], [-28.6, 144.4], [-28.6, 26.9], [-28.6, -58.1], [-28.7, 132], [-28.7, 152], [-28.7, -70.5], [-28.7, 119.6], [-28.7, -50.4], [-28.7, 139.6], [-28.7, 22.2], [-28.7, -62.8], [-28.7, 127.2], [-28.7, 147.3], [-28.7, 114.8], [-28.7, 29.8], [-28.7, -55.1], [-28.7, 134.9], [-28.8, 17.5], [-28.8, -67.5], [-28.8, 122.5], [-28.8, 142.6], [-28.8, 25.1], [-28.8, -59.9], [-28.8, 130.2], [-28.8, 150.2], [-28.8, 117.8], [-28.8, -52.2], [-28.8, 137.8], [-28.8, 20.4], [-28.8, -64.6], [-28.9, 125.4], [-28.9, 145.5], [-28.9, 28], [-28.9, -56.9], [-28.9, 133.1], [-28.9, -69.3], [-28.9, 120.7], [-28.9, 140.7], [-28.9, 23.3], [-28.9, -61.7], [-28.9, 128.4], [-29, 148.4], [-29, 116], [-29, 31], [-29, -54], [-29, 136], [-29, 18.6], [-29, -66.4], [-29, 123.6], [-29, 143.7], [-29, 26.2], [-29, -58.8], [-29, 131.3], [-29, 151.3], [-29.1, 118.9], [-29.1, -51.1], [-29.1, 138.9], [-29.1, 21.5], [-29.1, -63.5], [-29.1, 126.5], [-29.1, 146.6], [-29.1, 29.2], [-29.1, -55.8], [-29.1, 134.2], [-29.1, 16.8], [-29.1, -68.2], [-29.1, 121.8], [-29.2, 141.9], [-29.2, 24.4], [-29.2, -60.6], [-29.2, 129.5], [-29.2, 149.5], [-29.2, 117.1], [-29.2, -52.9], [-29.2, 137.1], [-29.2, 19.7], [-29.2, -65.3], [-29.2, 124.7], [-29.2, 144.8], [-29.3, 27.3], [-29.3, -57.6], [-29.3, 132.4], [-29.3, -70], [-29.3, 120], [-29.3, 140.1], [-29.3, 22.6], [-29.3, -62.4], [-29.3, 127.7], [-29.3, 147.7], [-29.3, 115.3], [-29.3, 30.3], [-29.4, -54.7], [-29.4, 135.3], [-29.4, 17.9], [-29.4, -67.1], [-29.4, 122.9], [-29.4, 143], [-29.4, 25.5], [-29.4, -59.4], [-29.4, 130.6], [-29.4, 150.6], [-29.4, 118.2], [-29.4, -51.8], [-29.4, 138.2], [-29.5, 20.8], [-29.5, -64.2], [-29.5, 125.9], [-29.5, 145.9], [-29.5, 28.5], [-29.5, -56.5], [-29.5, 133.5], [-29.5, -68.9], [-29.5, 121.1], [-29.5, 141.2], [-29.6, 23.7], [-29.6, -61.3], [-29.6, 128.8], [-29.6, 148.8], [-29.6, 116.4], [-29.6, -53.6], [-29.6, 136.4], [-29.6, 19], [-29.6, -66], [-29.6, 124], [-29.6, 144.1], [-29.6, 26.7], [-29.6, -58.3], [-29.7, 131.7], [-29.7, 151.8], [-29.7, -70.7], [-29.7, 119.3], [-29.7, 139.4], [-29.7, 21.9], [-29.7, -63.1], [-29.7, 127], [-29.7, 147], [-29.7, 29.6], [-29.7, -55.4], [-29.7, 134.6], [-29.8, 17.2], [-29.8, -67.8], [-29.8, 122.2], [-29.8, 142.3], [-29.8, 24.8], [-29.8, -60.1], [-29.8, 129.9], [-29.8, 150], [-29.8, 117.5], [-29.8, -52.5], [-29.8, 137.6], [-29.8, 20.1], [-29.8, -64.9], [-29.9, 125.2], [-29.9, 145.2], [-29.9, 27.8], [-29.9, -57.2], [-29.9, 132.8], [-29.9, -69.6], [-29.9, 120.4], [-29.9, 140.5], [-29.9, 23], [-29.9, -61.9], [-29.9, 128.1], [-30, 148.1], [-30, 115.7], [-30, 30.7], [-30, -54.3], [-30, 135.7], [-30, 18.3], [-30, -66.7], [-30, 123.4], [-30, 143.4], [-30, 26], [-30, -59], [-30, 131], [-30.1, 151.1], [-30.1, 118.6], [-30.1, -51.4], [-30.1, 138.7], [-30.1, 21.2], [-30.1, -63.8], [-30.1, 126.3], [-30.1, 146.3], [-30.1, 28.9], [-30.1, -56.1], [-30.1, 133.9], [-30.1, -68.5], [-30.1, 121.5], [-30.2, 141.6], [-30.2, 24.2], [-30.2, -60.8], [-30.2, 129.2], [-30.2, 149.3], [-30.2, 116.8], [-30.2, -53.2], [-30.2, 136.9], [-30.2, 19.4], [-30.2, -65.6], [-30.2, 124.5], [-30.3, 144.5], [-30.3, 27.1], [-30.3, -57.9], [-30.3, 132.1], [-30.3, -70.3], [-30.3, 119.7], [-30.3, 139.8], [-30.3, 22.3], [-30.3, -62.6], [-30.3, 127.4], [-30.3, 147.5], [-30.4, 115], [-30.4, 30], [-30.4, -55], [-30.4, 135.1], [-30.4, 17.6], [-30.4, -67.4], [-30.4, 122.7], [-30.4, 142.7], [-30.4, 25.3], [-30.4, -59.7], [-30.4, 130.3], [-30.4, 150.4], [-30.4, 117.9], [-30.5, -52], [-30.5, 138], [-30.5, 20.5], [-30.5, -64.4], [-30.5, 125.6], [-30.5, 145.6], [-30.5, 28.2], [-30.5, -56.8], [-30.5, 133.2], [-30.5, -69.2], [-30.5, 120.9], [-30.5, 140.9], [-30.6, 23.5], [-30.6, -61.5], [-30.6, 128.5], [-30.6, 148.6], [-30.6, 116.1], [-30.6, -53.9], [-30.6, 136.2], [-30.6, 18.7], [-30.6, -66.3], [-30.6, 123.8], [-30.6, 143.8], [-30.7, 26.4], [-30.7, -58.6], [-30.7, 131.4], [-30.7, 151.5], [-30.7, -71], [-30.7, 119], [-30.7, 139.1], [-30.7, 21.7], [-30.7, -63.3], [-30.7, 126.7], [-30.7, 146.8], [-30.7, 29.3], [-30.7, -55.7], [-30.8, 134.4], [-30.8, 16.9], [-30.8, -68.1], [-30.8, 122], [-30.8, 142], [-30.8, 24.6], [-30.8, -60.4], [-30.8, 129.6], [-30.8, 149.7], [-30.8, 117.2], [-30.8, -52.7], [-30.8, 137.3], [-30.9, 19.8], [-30.9, -65.1], [-30.9, 124.9], [-30.9, 145], [-30.9, 27.5], [-30.9, -57.5], [-30.9, 132.6], [-30.9, -69.9], [-30.9, 120.2], [-30.9, 140.2], [-30.9, 22.8], [-31, -62.2], [-31, 127.8], [-31, 147.9], [-31, 115.4], [-31, -54.5], [-31, 135.5], [-31, 18], [-31, -66.9], [-31, 123.1], [-31, 143.1], [-31, 25.7], [-31, -59.3], [-31.1, 130.7], [-31.1, 150.8], [-31.1, 118.4], [-31.1, 138.4], [-31.1, 21], [-31.1, -64], [-31.1, 126], [-31.1, 146.1], [-31.1, 28.6], [-31.1, -56.4], [-31.1, 133.7], [-31.2, -68.8], [-31.2, 121.3], [-31.2, 141.3], [-31.2, 23.9], [-31.2, -61.1], [-31.2, 128.9], [-31.2, 149], [-31.2, 116.5], [-31.2, -53.4], [-31.2, 136.6], [-31.2, 19.2], [-31.3, -65.8], [-31.3, 124.2], [-31.3, 144.3], [-31.3, 26.8], [-31.3, -58.2], [-31.3, 131.9], [-31.3, -70.6], [-31.3, 119.5], [-31.3, 139.5], [-31.3, 22.1], [-31.3, -62.9], [-31.3, 127.1], [-31.4, 147.2], [-31.4, -55.2], [-31.4, 134.8], [-31.4, 17.3], [-31.4, -67.6], [-31.4, 122.4], [-31.4, 142.5], [-31.4, 25], [-31.4, -60], [-31.4, 130.1], [-31.5, 150.1], [-31.5, 117.7], [-31.5, -52.3], [-31.5, 137.7], [-31.5, 20.3], [-31.5, -64.7], [-31.5, 125.3], [-31.5, 145.4], [-31.5, 27.9], [-31.5, -57], [-31.5, 133], [-31.5, -69.4], [-31.6, 120.6], [-31.6, 140.6], [-31.6, 23.2], [-31.6, -61.8], [-31.6, 128.2], [-31.6, 148.3], [-31.6, 115.9], [-31.6, -54.1], [-31.6, 135.9], [-31.6, 18.5], [-31.6, -66.5], [-31.6, 123.5], [-31.7, 143.6], [-31.7, 26.1], [-31.7, -58.9], [-31.7, 131.2], [-31.7, 151.2], [-31.7, 118.8], [-31.7, 138.8], [-31.7, 21.4], [-31.7, -63.6], [-31.7, 126.4], [-31.8, 146.5], [-31.8, -55.9], [-31.8, 134.1], [-31.8, -68.3], [-31.8, 121.7], [-31.8, 141.8], [-31.8, 24.3], [-31.8, -60.7], [-31.8, 129.4], [-31.8, 149.4], [-31.9, 117], [-31.9, -53], [-31.9, 137], [-31.9, 19.6], [-31.9, -65.4], [-31.9, 124.6], [-31.9, 144.7], [-31.9, 27.2], [-31.9, -57.7], [-31.9, 132.3], [-31.9, -70.1], [-31.9, 119.9], [-32, 140], [-32, 22.5], [-32, -62.5], [-32, 127.6], [-32, 147.6], [-32, 115.2], [-32, -54.8], [-32, 135.2], [-32, 17.8], [-32, -67.2], [-32, 122.8], [-32.1, 142.9], [-32.1, 25.4], [-32.1, -59.5], [-32.1, 130.5], [-32.1, 150.5], [-32.1, 118.1], [-32.1, 138.1], [-32.1, 20.7], [-32.1, -64.3], [-32.1, 125.7], [-32.1, 145.8], [-32.2, -56.6], [-32.2, 133.4], [-32.2, -69], [-32.2, 121], [-32.2, 141.1], [-32.2, 23.6], [-32.2, -61.4], [-32.2, 128.7], [-32.2, 148.7], [-32.2, 116.3], [-32.3, -53.7], [-32.3, 136.3], [-32.3, 18.9], [-32.3, -66.1], [-32.3, 123.9], [-32.3, 144], [-32.3, 26.6], [-32.3, -58.4], [-32.3, 131.6], [-32.3, -70.8], [-32.3, 119.2], [-32.4, 139.3], [-32.4, 21.8], [-32.4, -63.2], [-32.4, 126.9], [-32.4, 146.9], [-32.4, -55.5], [-32.4, 134.5], [-32.4, -67.9], [-32.4, 122.1], [-32.4, 142.2], [-32.5, 24.7], [-32.5, -60.2], [-32.5, 129.8], [-32.5, 149.9], [-32.5, 117.4], [-32.5, 137.5], [-32.5, 20], [-32.5, -65], [-32.5, 125.1], [-32.5, 145.1], [-32.6, 27.7], [-32.6, -57.3], [-32.6, 132.7], [-32.6, -69.7], [-32.6, 120.3], [-32.6, 140.4], [-32.6, 22.9], [-32.6, -62], [-32.6, 128], [-32.6, 148], [-32.6, 115.6], [-32.7, -54.4], [-32.7, 135.6], [-32.7, 18.2], [-32.7, -66.8], [-32.7, 123.2], [-32.7, 143.3], [-32.7, 25.9], [-32.7, -59.1], [-32.7, 130.9], [-32.7, 151], [-32.7, 118.5], [-32.8, 138.6], [-32.8, 21.1], [-32.8, -63.9], [-32.8, 126.2], [-32.8, 146.2], [-32.8, -56.2], [-32.8, 133.8], [-32.8, -68.6], [-32.8, 121.4], [-32.8, 141.5], [-32.9, 24.1], [-32.9, -60.9], [-32.9, 129.1], [-32.9, 149.2], [-32.9, 116.7], [-32.9, -53.3], [-32.9, 136.8], [-32.9, 19.3], [-32.9, -65.7], [-32.9, 124.4], [-32.9, 144.4], [-33, 27], [-33, -58], [-33, 132], [-33, -70.4], [-33, 119.6], [-33, 139.7], [-33, 22.2], [-33, -62.7], [-33, 127.3], [-33, 147.4], [-33, -55.1], [-33.1, 135], [-33.1, -67.5], [-33.1, 122.6], [-33.1, 142.6], [-33.1, 25.2], [-33.1, -59.8], [-33.1, 130.2], [-33.1, 150.3], [-33.1, 117.8], [-33.2, 137.9], [-33.2, 20.4], [-33.2, -64.5], [-33.2, 145.5], [-33.2, -56.9], [-33.2, 133.1], [-33.2, -69.3], [-33.2, 120.7], [-33.2, 140.8], [-33.3, 23.4], [-33.3, -61.6], [-33.3, 128.4], [-33.3, 148.5], [-33.3, 116], [-33.3, -54], [-33.3, 136.1], [-33.3, 18.6], [-33.3, -66.4], [-33.3, 143.7], [-33.4, 26.3], [-33.4, -58.7], [-33.4, 131.3], [-33.4, -71.1], [-33.4, 118.9], [-33.4, 139], [-33.4, 21.6], [-33.4, -63.4], [-33.4, 146.7], [-33.4, -55.8], [-33.5, 134.3], [-33.5, -68.2], [-33.5, 141.9], [-33.5, 24.5], [-33.5, -60.5], [-33.5, 149.6], [-33.5, 117.1], [-33.5, 137.2], [-33.6, 19.7], [-33.6, -65.2], [-33.6, 144.9], [-33.6, -57.6], [-33.6, 132.5], [-33.6, -70], [-33.6, 140.1], [-33.7, 22.7], [-33.7, -62.3], [-33.7, 147.8], [-33.7, 115.3], [-33.7, -54.6], [-33.7, 135.4], [-33.7, -67], [-33.7, 143], [-33.8, 25.6], [-33.8, -59.4], [-33.8, 150.7], [-33.8, 138.3], [-33.8, 20.9], [-33.8, -64.1], [-33.8, 146], [-33.8, -56.5], [-33.9, 133.6], [-33.9, -68.9], [-33.9, 141.2], [-33.9, 23.8], [-33.9, -61.2], [-33.9, 148.9], [-34, 136.5], [-34, 19.1], [-34, -65.9], [-34, 144.2], [-34, -58.3], [-34, -70.7], [-34, 139.4], [-34.1, 22], [-34.1, -63], [-34.1, 147.1], [-34.1, -55.3], [-34.1, -67.7], [-34.1, 142.4], [-34.2, 24.9], [-34.2, -60.1], [-34.2, 150], [-34.2, 137.6], [-34.2, 20.2], [-34.2, -64.8], [-34.2, 145.3], [-34.3, -57.1], [-34.3, -69.5], [-34.3, 140.5], [-34.3, 23.1], [-34.3, -61.9], [-34.3, 148.2], [-34.4, 135.8], [-34.4, -66.6], [-34.4, 143.5], [-34.4, -59], [-34.4, -71.4], [-34.5, 138.7], [-34.5, 21.3], [-34.5, -63.7], [-34.5, 146.4], [-34.5, -56], [-34.5, -68.4], [-34.5, 141.7], [-34.6, -60.8], [-34.6, 149.3], [-34.6, 136.9], [-34.6, 19.5], [-34.6, -65.5], [-34.6, 144.6], [-34.7, -57.8], [-34.7, -70.2], [-34.7, 139.9], [-34.7, -62.6], [-34.7, 147.5], [-34.8, -54.9], [-34.8, -67.3], [-34.8, 142.8], [-34.8, -59.6], [-34.8, 150.4], [-34.9, 138], [-34.9, -64.4], [-34.9, 145.7], [-34.9, -56.7], [-34.9, -69.1], [-35, 141], [-35, -61.5], [-35, 148.6], [-35, -66.2], [-35, 143.9], [-35.1, -58.5], [-35.1, -70.9], [-35.1, 139.2], [-35.1, -63.3], [-35.1, 146.8], [-35.2, -55.6], [-35.2, -68], [-35.2, 142.1], [-35.2, -60.3], [-35.2, 149.8], [-35.3, 137.4], [-35.3, -65.1], [-35.3, 145], [-35.3, -57.4], [-35.3, -69.8], [-35.4, 140.3], [-35.4, -62.1], [-35.4, 147.9], [-35.4, -66.9], [-35.5, 143.2], [-35.5, -59.2], [-35.5, -71.6], [-35.5, 138.5], [-35.5, -64], [-35.6, 146.1], [-35.6, -56.3], [-35.6, -68.7], [-35.6, 141.4], [-35.6, -61], [-35.7, 149.1], [-35.7, -65.8], [-35.7, 144.3], [-35.7, -58.1], [-35.7, -70.5], [-35.8, 139.6], [-35.8, -62.8], [-35.8, 147.3], [-35.8, -67.6], [-35.9, 142.5], [-35.9, -59.9], [-35.9, 150.2], [-35.9, -64.6], [-36, 145.4], [-36, -57], [-36, -69.4], [-36, 140.7], [-36, -61.7], [-36.1, 148.4], [-36.1, -66.5], [-36.1, 143.6], [-36.1, -58.8], [-36.2, -71.2], [-36.2, 138.9], [-36.2, -63.5], [-36.2, 146.6], [-36.3, -68.3], [-36.3, 141.8], [-36.3, -60.6], [-36.3, 149.5], [-36.4, -65.3], [-36.4, 144.8], [-36.4, -57.7], [-36.4, -70.1], [-36.4, 140], [-36.5, -62.4], [-36.5, 147.7], [-36.5, -67.1], [-36.5, 142.9], [-36.6, -59.5], [-36.6, -64.2], [-36.6, 145.9], [-36.7, -69], [-36.7, 141.1], [-36.7, -61.3], [-36.7, 148.8], [-36.8, -66], [-36.8, 144.1], [-36.8, -58.4], [-36.8, -70.8], [-36.9, -63.1], [-36.9, 147], [-36.9, -67.8], [-37, 142.3], [-37, -60.2], [-37, 149.9], [-37, -64.9], [-37.1, 145.2], [-37.1, -57.2], [-37.1, -69.6], [-37.1, 140.4], [-37.1, -62], [-37.2, 148.1], [-37.2, -66.7], [-37.2, 143.4], [-37.2, -59.1], [-37.3, -71.5], [-37.3, -63.8], [-37.3, 146.3], [-37.4, -68.5], [-37.4, 141.6], [-37.4, -60.9], [-37.4, -65.6], [-37.5, 144.5], [-37.5, -57.9], [-37.5, -70.3], [-37.5, -62.7], [-37.6, 147.4], [-37.6, -67.4], [-37.6, 142.7], [-37.6, -59.7], [-37.7, -64.5], [-37.7, 145.6], [-37.8, -69.2], [-37.8, -61.6], [-37.9, -66.3], [-37.9, 143.8], [-37.9, -58.6], [-37.9, -71], [-38, -63.4], [-38, -68.1], [-38.1, 142], [-38.1, -60.4], [-38.1, -65.2], [-38.2, 144.9], [-38.2, -69.9], [-38.2, -62.2], [-38.3, -67], [-38.3, 143.1], [-38.3, -59.3], [-38.4, -71.7], [-38.4, -64.1], [-38.5, -68.8], [-38.5, -61.1], [-38.6, -65.9], [-38.6, 144.2], [-38.6, -70.6], [-38.7, -62.9], [-38.7, -67.7], [-38.8, -60], [-38.8, -64.7], [-38.9, -69.5], [-38.9, -61.8], [-39, -66.6], [-39, -71.3], [-39.1, -63.6], [-39.2, -68.4], [-39.2, -60.7], [-39.3, -65.4], [-39.3, -70.2], [-39.4, -62.5], [-39.4, -67.2], [-39.4, 175.3], [-39.5, -72], [-39.5, -64.3], [-39.6, -69.1], [-39.6, -61.4], [-39.7, -66.1], [-39.7, -70.9], [-39.8, -63.2], [-39.9, -67.9], [-39.9, 174.6], [-40, -65], [-40, -69.7], [-40.1, -62.1], [-40.1, -66.8], [-40.1, 175.7], [-40.2, -71.6], [-40.2, -63.9], [-40.3, -68.6], [-40.3, 173.9], [-40.4, -65.7], [-40.5, -70.4], [-40.5, -62.8], [-40.6, -67.5], [-40.6, 175], [-40.6, -72.2], [-40.7, -64.6], [-40.7, -69.3], [-40.7, 173.2], [-40.8, -66.4], [-40.9, -71.1], [-40.9, -63.5], [-41, -68.2], [-41, 174.4], [-41.1, -65.3], [-41.2, -70], [-41.2, 172.5], [-41.3, -67.1], [-41.3, -71.8], [-41.4, -64.2], [-41.4, -68.9], [-41.5, 173.7], [-41.5, -66], [-41.6, -70.7], [-41.6, 171.9], [-41.7, -67.8], [-41.8, -72.5], [-41.8, -64.8], [-41.9, -69.6], [-41.9, 173], [-42, -66.7], [-42.1, -71.4], [-42.1, 171.2], [-42.2, -68.5], [-42.2, -73.2], [-42.3, -65.5], [-42.3, -70.3], [-42.4, 172.3], [-42.4, -67.3], [-42.5, -72.1], [-42.6, -69.2], [-42.7, -66.2], [-42.8, -71], [-42.8, 171.6], [-42.9, -68], [-43, -72.8], [-43.1, -69.8], [-43.2, -66.9], [-43.2, -71.7], [-43.3, 170.9], [-43.4, -68.7], [-43.4, -73.5], [-43.5, -65.8], [-43.5, -70.5], [-43.6, -67.6], [-43.7, -72.3], [-43.7, 170.2], [-43.8, -69.4], [-43.9, -66.5], [-44, -71.2], [-44.1, -68.3], [-44.2, -73], [-44.2, 169.5], [-44.3, -70.1], [-44.4, -67.2], [-44.5, -71.9], [-44.6, -69], [-44.6, -73.7], [-44.7, 168.8], [-44.7, -66.1], [-44.7, -70.8], [-44.9, -67.9], [-44.9, -72.6], [-45, -69.7], [-45.2, -66.8], [-45.2, -71.5], [-45.3, -68.6], [-45.4, -73.3], [-45.5, -70.4], [-45.6, -67.4], [-45.7, -72.2], [-45.8, -69.3], [-45.9, -74], [-46, -71.1], [-46.1, -68.1], [-46.2, -72.9], [-46.3, -69.9], [-46.4, -67], [-46.5, -71.8], [-46.6, -68.8], [-46.7, -73.6], [-46.8, -70.6], [-46.9, 167.2], [-46.9, -67.7], [-47, -72.4], [-47.1, -69.5], [-47.2, -74.3], [-47.3, -71.3], [-47.4, -68.4], [-47.5, -73.1], [-47.6, -70.2], [-47.7, -67.3], [-47.8, -72], [-47.9, -69.1], [-48, -73.8], [-48.1, -70.9], [-48.2, -68], [-48.3, -72.7], [-48.4, -69.8], [-48.5, -74.5], [-48.6, -71.6], [-48.7, -68.7], [-48.8, -73.4], [-48.9, -70.5], [-49.1, -72.3], [-49.2, -69.4], [-49.3, -74.1], [-49.4, -71.2], [-49.5, -68.2], [-49.6, -73], [-49.7, -70], [-49.9, -71.9], [-50, -68.9], [-50.1, -73.7], [-50.2, -70.7], [-50.4, -72.5], [-50.6, -69.6], [-50.8, -71.4], [-51.1, -70.3], [-51.3, -72.1], [-51.6, -71], [-52.2, -71.7]], hubs: [[17.4, 78.5], [28.6, 77.2], [19.1, 72.9], [1.3, 103.8], [25.2, 55.3], [39.9, 116.4], [35.7, 139.7], [-33.9, 151.2], [50.1, 8.7], [51.5, -0.1], [6.5, 3.4], [-1.3, 36.8], [-26.2, 28], [40.7, -74], [37.8, -122.4], [-23.5, -46.6], [55.8, 37.6]], edges: [[0, 4], [0, 1], [0, 2], [1, 4], [1, 2], [2, 4], [1, 3], [2, 3], [0, 3], [0, 5], [1, 5], [5, 6], [1, 6], [3, 6], [5, 7], [6, 7], [3, 7], [4, 8], [8, 16], [8, 9], [9, 10], [9, 16], [8, 10], [10, 12], [10, 11], [4, 11], [11, 12], [4, 12], [8, 13], [9, 13], [13, 14], [9, 14], [6, 14], [13, 15], [12, 15], [10, 15], [4, 16]] };

  // src/sections/hero-globe.js
  var route = "home";
  function initHeroGlobe() {
    var heroEl = document.querySelector(".section_home-hero");
    if (!heroEl || !ON("heroGlobe")) return;
    heroEl.id = heroEl.id || "hero";
    if (getComputedStyle(heroEl).position === "static") heroEl.style.position = "relative";
    heroEl.style.backgroundImage = "linear-gradient(#005C96 0%,#0071B1 16%,#1A82C4 32%,#3E9FD8 48%,#5BB6EC 62%,#6DC2F2 70%,#A6CFEA 77%,#DCCFE0 83%,#F0CDBE 88%,#F4D3B6 93%,#F3F2EE 100%)";
    var cv = canvasIn(heroEl, "home-hero_globe");
    if (!cv) return;
    cv.id = "globe";
    cv.setAttribute("aria-hidden", "true");
    var dotsCv = canvasIn(heroEl, "home-hero_dots");
    if (dotsCv) dotsCv.setAttribute("aria-hidden", "true");
    var btn = heroEl.querySelector(".button");
    lift(heroEl);
    const hero = heroEl;
    const gc = $("#globe");
    let gx, gW = 0, gH = 0, gR = 0, gCx = 0, gCy = 0, gOn = false, gRaf = 0;
    const toV = (la, lo) => {
      const a = la * Math.PI / 180, b = lo * Math.PI / 180;
      return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)];
    };
    const LV = new Float32Array(globe_default.land.length * 3);
    globe_default.land.forEach((p, i) => {
      const v = toV(p[0], p[1]);
      LV[i * 3] = v[0];
      LV[i * 3 + 1] = v[1];
      LV[i * 3 + 2] = v[2];
    });
    const HV = globe_default.hubs.map((h) => toV(h[0], h[1]));
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const ARCS = globe_default.edges.map(([i, j]) => {
      const a = HV[i], b = HV[j], o = Math.acos(clamp2(dot(a, b), -1, 1)), pts = [];
      for (let k = 0; k <= 36; k++) {
        const t = k / 36, s1 = Math.sin((1 - t) * o) / Math.sin(o), s2 = Math.sin(t * o) / Math.sin(o), lift2 = 1 + 0.018 * Math.sin(Math.PI * t) * Math.min(1, o);
        pts.push([(s1 * a[0] + s2 * b[0]) * lift2, (s1 * a[1] + s2 * b[1]) * lift2, (s1 * a[2] + s2 * b[2]) * lift2]);
      }
      return { i, j, pts };
    });
    const ADJ = globe_default.hubs.map(() => []);
    ARCS.forEach((e, k) => {
      ADJ[e.i].push([e.j, k]);
      ADJ[e.j].push([e.i, k]);
    });
    const LAT0 = -36;
    let lon = 78, lat = LAT0, vLon = 0, tLat = LAT0, pLon = 0, dragging = false, wave = null;
    function buildGlobe() {
      const f = fit(gc);
      gx = f.x;
      gW = f.w;
      gH = f.h;
      gR = clamp2(gW * 0.46, 300, 760);
      gCx = gW / 2;
      const ps = heroEl.querySelectorAll("p"), anchor = btn || ps[ps.length - 1] || heroEl, ctaB = anchor.getBoundingClientRect(), gT = gc.getBoundingClientRect().top, crestY = ctaB.height ? Math.min(ctaB.bottom - gT + (btn ? 56 : 50), gH - 170) : gH * 0.68;
      gCy = (gW < gH ? Math.max(crestY, $("#hero").getBoundingClientRect().bottom - gT - (gW < 600 ? 210 : 330)) : crestY) + gR;
      drawGlobe(performance.now());
    }
    function proj(v, out) {
      const a = (lon + pLon) * Math.PI / 180, b = lat * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
      const x = v[0] * ca - v[2] * sa, z0 = v[0] * sa + v[2] * ca, y = v[1] * cb - z0 * sb, z = v[1] * sb + z0 * cb;
      out[0] = gCx + x * gR;
      out[1] = gCy - y * gR;
      out[2] = z;
      return out;
    }
    function unproj(px, py) {
      const X = (px - gCx) / gR, Y = (gCy - py) / gR, q = X * X + Y * Y;
      if (q >= 1) return null;
      const Z = Math.sqrt(1 - q), a = (lon + pLon) * Math.PI / 180, b = lat * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
      const z0 = Z * cb - Y * sb, y = Y * cb + Z * sb;
      return [X * ca + z0 * sa, y, -X * sa + z0 * ca];
    }
    const easeOut = (t) => 1 - Math.pow(1 - t, 3), WAVE = 4.4;
    const FIRST_PULSE_MS = 3e3;
    const P3 = [0, 0, 0];
    function at3(e, u) {
      const n = e.pts.length - 1, f = clamp2(u, 0, 1) * n, i = Math.min(n - 1, f | 0), k = f - i, a = e.pts[i], b = e.pts[i + 1];
      P3[0] = a[0] + (b[0] - a[0]) * k;
      P3[1] = a[1] + (b[1] - a[1]) * k;
      P3[2] = a[2] + (b[2] - a[2]) * k;
      return P3;
    }
    const GRAT = [];
    for (let lo = 0; lo < 180; lo += 30) {
      const a = [];
      for (let la = -180; la <= 180; la += 5) a.push(toV(la <= 90 && la >= -90 ? la : la > 0 ? 180 - la : -180 - la, la <= 90 && la >= -90 ? lo : lo + 180));
      GRAT.push(a);
    }
    for (let la = -60; la <= 60; la += 30) {
      const a = [];
      for (let lo = -180; lo <= 180; lo += 5) a.push(toV(la, lo));
      GRAT.push(a);
    }
    function drawGlobe(t) {
      if (!gx) return;
      let x = gx;
      x.clearRect(0, 0, gW, gH);
      const FX = (() => {
        const c = dotsCv;
        if (!c) return gx;
        if (c.width !== gc.width || c.height !== gc.height) {
          c.width = gc.width;
          c.height = gc.height;
        }
        const f = c.getContext("2d");
        f.setTransform(1, 0, 0, 1, 0, 0);
        f.clearRect(0, 0, c.width, c.height);
        f.setTransform(gx.getTransform());
        return f;
      })();
      const hi = gR - 70, ho = gR + 170, hs = (gR - hi) / (ho - hi);
      const halo = x.createRadialGradient(gCx, gCy, hi, gCx, gCy, ho);
      halo.addColorStop(0, "rgba(255,255,255,0)");
      halo.addColorStop(hs, "rgba(255,255,255,.8)");
      halo.addColorStop(hs + 0.035, "rgba(255,255,255,.3)");
      halo.addColorStop(hs + 0.26, "rgba(255,255,255,0)");
      halo.addColorStop(1, "rgba(255,255,255,0)");
      x.fillStyle = halo;
      x.fillRect(0, 0, gW, gH);
      const disc = x.createRadialGradient(gCx - gR * 0.24, gCy - gR * 0.8, gR * 0.04, gCx, gCy, gR);
      disc.addColorStop(0, "#2E9BDA");
      disc.addColorStop(0.3, "#0071B1");
      disc.addColorStop(0.72, "#00497A");
      disc.addColorStop(1, "#04304F");
      x.fillStyle = disc;
      x.beginPath();
      x.arc(gCx, gCy, gR, 0, 6.283);
      x.fill();
      const crest = x.createLinearGradient(gCx - gR, 0, gCx + gR, 0);
      crest.addColorStop(0, "rgba(109,194,242,0)");
      crest.addColorStop(0.3, "rgba(255,255,255,.9)");
      crest.addColorStop(0.5, "rgba(255,255,255,1)");
      crest.addColorStop(0.7, "rgba(255,255,255,.9)");
      crest.addColorStop(1, "rgba(109,194,242,0)");
      x.strokeStyle = crest;
      x.lineWidth = 1.2;
      x.beginPath();
      x.arc(gCx, gCy, gR, 0, 6.283);
      x.stroke();
      const o = [0, 0, 0], w = wave;
      let age = 0, rr = 0, amp = 0;
      if (w) {
        age = (t - w.t) / 1e3;
        if (age > WAVE) {
          wave = null;
        } else {
          rr = easeOut(age / WAVE) * 1.25;
          amp = 1 - Math.pow(age / WAVE, 2);
        }
      }
      const buckets = [[], [], [], []];
      const hot = [];
      const sc = clamp2(gW / 1440, 0.72, 1.15);
      const ra = (lon + pLon) * Math.PI / 180, rb = lat * Math.PI / 180, ca = Math.cos(ra), sa = Math.sin(ra), cb = Math.cos(rb), sb = Math.sin(rb);
      const wv = wave ? w.v : null;
      for (let i = 0; i < LV.length; i += 3) {
        const vx = LV[i], vy = LV[i + 1], vz = LV[i + 2], xx = vx * ca - vz * sa, z0 = vx * sa + vz * ca, yy = vy * cb - z0 * sb, zz = vy * sb + z0 * cb;
        if (zz <= 0.01) continue;
        const px = gCx + xx * gR, py = gCy - yy * gR;
        if (py > gH + 4 || px < -4 || px > gW + 4) continue;
        let b = 0;
        if (wv) {
          const ang = Math.acos(clamp2(vx * wv[0] + vy * wv[1] + vz * wv[2], -1, 1));
          b = (Math.exp(-(((ang - rr) / 0.1) ** 2)) + Math.exp(-((ang / 0.12) ** 2)) * Math.max(0, 1 - age * 0.55)) * amp;
        }
        buckets[Math.min(3, zz * 5 | 0)].push(px, py, zz);
      }
      buckets.forEach((a, k) => {
        const x2 = FX;
        x2.fillStyle = rgba(mix([200, 232, 250], [0, 84, 140], k / 3), 0.95);
        x2.beginPath();
        for (let i = 0; i < a.length; i += 3) {
          const r = (1 + 0.8 * a[i + 2]) * sc;
          x2.moveTo(a[i] + r, a[i + 1]);
          x2.arc(a[i], a[i + 1], r, 0, 6.283);
        }
        x2.fill();
      });
      const F = FX, SIG = [77, 173, 255], NAVYL = "rgba(5,19,28,", WHITE = [255, 255, 255];
      for (const h of hot) {
        const r = (1 + 0.8 * h[2]) * sc * (1 + 0.35 * clamp2(h[3]));
        F.fillStyle = rgba(mix([200, 232, 250], SIG, clamp2(h[3] * 1.1)), 0.95);
        F.beginPath();
        F.arc(h[0], h[1], r, 0, 6.283);
        F.fill();
      }
      x.lineWidth = 0.7;
      x.strokeStyle = "rgba(255,255,255,.13)";
      x.beginPath();
      for (const l of GRAT) {
        let up = false;
        for (const p of l) {
          proj(p, o);
          if (o[2] <= 0.02) {
            up = false;
            continue;
          }
          up ? x.lineTo(o[0], o[1]) : x.moveTo(o[0], o[1]);
          up = true;
        }
      }
      x.stroke();
      const AR = window.__arcR == null ? 1 : window.__arcR;
      const yT = gCy - gR, span = Math.max(1, gH - yT), DEEP2 = [0, 113, 177];
      const LG = (a) => {
        const c1 = mix([46, 155, 218], WHITE, fvG), c2 = mix(DEEP2, WHITE, fvG), g = F.createLinearGradient(0, yT, 0, gH);
        g.addColorStop(0, "rgba(255,255,255," + a + ")");
        g.addColorStop(0.3, "rgba(255,255,255," + a + ")");
        g.addColorStop(0.58, rgba(c1, a));
        g.addColorStop(1, rgba(c2, a));
        return g;
      };
      const CASE = (a) => {
        if (fvG > 0.5) return NAVYL + a + ")";
        const g = F.createLinearGradient(0, yT, 0, gH);
        g.addColorStop(0, NAVYL + a + ")");
        g.addColorStop(0.45, NAVYL + a * 0.6 + ")");
        g.addColorStop(0.7, "rgba(255,255,255," + a * 1.6 + ")");
        g.addColorStop(1, "rgba(255,255,255," + a * 1.6 + ")");
        return g;
      };
      const tint = (y) => {
        const k = clamp2(((y - yT) / span - 0.3) / 0.4) * (1 - fvG);
        return mix(WHITE, DEEP2, k * k * (3 - 2 * k));
      };
      const fvG = w ? clamp2(age / 0.35) * (1 - clamp2((age - 2.9) / 1.3)) : 0;
      const fv = w ? clamp2(age / 0.35) * (1 - clamp2((age - 2.9) / 1.3)) : 0;
      if (fv > 0) {
        const vg = F.createRadialGradient(gCx, gCy - gR * 0.6, gR * 0.1, gCx, gCy, gR);
        vg.addColorStop(0, "rgba(0,113,177," + 0.5 * fv + ")");
        vg.addColorStop(0.7, "rgba(0,92,150," + 0.6 * fv + ")");
        vg.addColorStop(1, "rgba(0,73,122," + 0.68 * fv + ")");
        F.fillStyle = vg;
        F.beginPath();
        F.arc(gCx, gCy, gR, 0, 6.283);
        F.fill();
      }
      const arcPath = (e, u0, u1, fwd) => {
        const n = e.pts.length - 1;
        F.beginPath();
        let up = false, hx = null, hy = null;
        const add = (p) => {
          proj(p, o);
          if (o[2] <= 0.04) {
            up = false;
            return;
          }
          up ? F.lineTo(o[0], o[1]) : F.moveTo(o[0], o[1]);
          up = true;
          hx = o[0];
          hy = o[1];
        };
        for (let m = Math.floor(n * u0); m <= Math.floor(n * u1); m++) {
          const p = e.pts[fwd ? m : n - m];
          if (p) add(p);
        }
        if (u1 < 1) add(at3(e, fwd ? u1 : 1 - u1));
        return hx == null ? null : [hx, hy];
      };
      F.lineCap = "round";
      const rest = 1 - 0.6 * fv;
      if (AR > 0) ARCS.forEach((e) => {
        if (!arcPath(e, 0, 1, true)) return;
        F.lineWidth = 2.2 * sc;
        F.strokeStyle = CASE(0.2 * rest);
        F.stroke();
        F.lineWidth = 1.2 * sc;
        F.strokeStyle = LG(0.92 * rest);
        F.shadowColor = rgba(SIG, 0.55 * rest);
        F.shadowBlur = 6;
        F.stroke();
        F.shadowBlur = 0;
      });
      if (AR >= 1) ARCS.forEach((e, k) => {
        const n = e.pts.length - 1, u0 = (t / (4200 + k % 5 * 500) + k * 0.37) % 1, fade = Math.sin(u0 * Math.PI) * rest;
        if (fade <= 0.02) return;
        for (let d = 0; d < 5; d++) {
          const u = u0 - d * 0.025;
          if (u < 0) break;
          proj(at3(e, u), o);
          if (o[2] <= 0.03) continue;
          const tc = tint(o[1]);
          F.fillStyle = rgba(d ? mix(tc, SIG, d / 4) : tc, fade * (1 - d * 0.17));
          F.beginPath();
          F.arc(o[0], o[1], Math.max(0.7, (2.4 - d * 0.35) * sc), 0, 6.283);
          F.fill();
        }
      });
      const arrive = [];
      if (w) {
        const HOP = 0.5, TRAVEL = 0.95;
        HV.forEach((h, i) => {
          const L2 = w.lv[i];
          arrive[i] = L2 >= 99 ? null : L2 * HOP + (L2 ? TRAVEL : 0);
        });
        ARCS.forEach((e) => {
          const li = w.lv[e.i], lj = w.lv[e.j];
          if (Math.min(li, lj) >= 99 || li === lj) return;
          const fwd = li < lj, st = Math.min(li, lj) * HOP, q = (age - st) / TRAVEL;
          if (q <= 0) return;
          const n = e.pts.length - 1;
          const lit = (u1, a) => {
            if (!arcPath(e, 0, u1, fwd)) return;
            F.lineWidth = 3.2 * sc;
            F.strokeStyle = CASE(0.38 * a);
            F.stroke();
            F.lineWidth = 1.4 * sc;
            F.strokeStyle = LG(0.95 * a);
            F.shadowColor = rgba(SIG, 0.9 * a);
            F.shadowBlur = 9;
            F.stroke();
            F.shadowBlur = 0;
          };
          if (q >= 1) {
            const fd = clamp2(1 - (q - 1) * TRAVEL / 1.6);
            if (fd > 0) lit(1, fd);
            return;
          }
          const head = easeOut(q);
          lit(head, 1);
          const pn = e.pts.length - 1;
          for (let d = 0; d < 11; d++) {
            const u = head - d * 0.032;
            if (u < 0) break;
            proj(at3(e, fwd ? u : 1 - u), o);
            if (o[2] <= 0.04) continue;
            const rr2 = (3.4 - d * 0.26) * sc, al = 1 - d * 0.075;
            F.fillStyle = rgba(d ? mix(WHITE, SIG, Math.min(1, d / 5)) : WHITE, al);
            if (!d) {
              F.shadowColor = "rgba(255,255,255,.95)";
              F.shadowBlur = 12;
            }
            F.beginPath();
            F.arc(o[0], o[1], Math.max(0.8, rr2), 0, 6.283);
            F.fill();
            F.shadowBlur = 0;
          }
        });
      }
      window.__hub = window.__hub || [];
      HV.forEach((v, i) => {
        proj(v, o);
        window.__hub[i] = [o[0], o[1], o[2]];
        if (o[2] <= 0.02 || AR <= 0) return;
        const r = 3 * sc;
        const fa = w && arrive[i] != null ? (age - arrive[i]) / 0.9 : -1;
        if (fa >= 0 && fa < 1) {
          F.strokeStyle = rgba(SIG, 1 - fa);
          F.lineWidth = 1.4;
          F.beginPath();
          F.arc(o[0], o[1], r + fa * 16 * sc, 0, 6.283);
          F.stroke();
        }
        const boost = fa >= 0 && fa < 1 ? 1 + 0.6 * (1 - fa) : 1;
        F.fillStyle = rgba(SIG, 0.3);
        F.beginPath();
        F.arc(o[0], o[1], r * 2.6 * boost, 0, 6.283);
        F.fill();
        F.fillStyle = "#fff";
        F.beginPath();
        F.arc(o[0], o[1], r * boost, 0, 6.283);
        F.fill();
        F.lineWidth = 0.8;
        F.strokeStyle = NAVYL + ".35)";
        F.stroke();
      });
      if (w) {
        proj(w.v, o);
        if (o[2] > 0) {
          const pu = clamp2(age / 1.2);
          F.strokeStyle = rgba(WHITE, 1 - pu);
          F.lineWidth = 1.4;
          F.beginPath();
          F.arc(o[0], o[1], 4 + pu * 20 * sc, 0, 6.283);
          F.stroke();
          F.fillStyle = rgba(WHITE, Math.max(0, 1 - age / 2.6));
          F.beginPath();
          F.arc(o[0], o[1], 3.2 * sc, 0, 6.283);
          F.fill();
        }
      }
    }
    let gDrift = 1, gLast = 0;
    function gLoop(t) {
      gRaf = 0;
      if (!gOn) return;
      const dt = Math.min(50, t - gLast || 16);
      gLast = t;
      if (!dragging) {
        if (!RM) {
          const m = (lon - 78 + 540) % 360 - 180;
          if (m > 42) gDrift = -1;
          else if (m < -42) gDrift = 1;
          lon += dt * 16e-4 * gDrift;
        }
        lon += vLon;
        vLon *= 0.94;
        if (Math.abs(vLon) < 1e-3) vLon = 0;
      }
      lat += (tLat - lat) * 0.05;
      pLon += (tPLon - pLon) * 0.05;
      drawGlobe(t);
      if (!RM || wave || dragging || vLon || Math.abs(tPLon - pLon) > 0.01 || Math.abs(tLat - lat) > 0.01) gRaf = requestAnimationFrame(gLoop);
    }
    let tPLon = 0;
    const gKick = () => {
      if (gOn && !gRaf) gRaf = requestAnimationFrame(gLoop);
    };
    visible(hero, (v) => {
      gOn = v;
      gKick();
    });
    function sendWave(v, raw) {
      if (window.__arcReveal) window.__arcReveal(v);
      let best = 0, bd = -2;
      HV.forEach((h, i) => {
        const d = dot(h, v);
        if (d > bd) {
          bd = d;
          best = i;
        }
      });
      const lv = globe_default.hubs.map(() => 99);
      lv[best] = 0;
      const q = [best];
      while (q.length) {
        const a = q.shift();
        for (const [b] of ADJ[a]) if (lv[b] === 99) {
          lv[b] = lv[a] + 1;
          q.push(b);
        }
      }
      wave = { v: raw ? v : HV[best], t: performance.now(), lv };
      gKick();
    }
    const hint = { style: {} };
    let down = null, lastHit = 0;
    hero.addEventListener("pointerdown", (e) => {
      if (e.target.closest("a")) return;
      down = { x: e.clientX, y: e.clientY, lon, moved: false };
      hero.setPointerCapture && hero.setPointerCapture(e.pointerId);
    });
    hero.addEventListener("pointermove", (e) => {
      const r = gc.getBoundingClientRect();
      if (down) {
        const d = e.clientX - down.x;
        if (Math.abs(d) > 4) {
          down.moved = true;
          dragging = true;
        }
        if (down.moved) {
          const n = down.lon - d * 0.075;
          vLon = (n - lon) * 0.45;
          lon = n;
          gKick();
        }
      } else if (!RM) {
        tPLon = -((e.clientX - r.left) / r.width - 0.5) * 2.4;
        tLat = LAT0 + ((e.clientY - r.top) / r.height - 0.5) * 0.9;
        gKick();
      }
    });
    hero.addEventListener("pointerup", (e) => {
      if (!down) return;
      const m = down.moved;
      down = null;
      dragging = false;
      if (m) {
        gKick();
        return;
      }
      const r = gc.getBoundingClientRect();
      const v = unproj(e.clientX - r.left, e.clientY - r.top);
      let target = v;
      if (!target) {
        const dx = e.clientX - r.left - gCx, dy = gCy - (e.clientY - r.top), n = Math.hypot(dx, dy) || 1;
        target = unproj(gCx + dx / n * gR * 0.92, gCy - dy / n * gR * 0.92) || HV[0];
      }
      sendWave(target);
      lastHit = performance.now();
      hint.style.opacity = 0;
      0;
    });
    hero.addEventListener("pointerleave", () => {
      tPLon = 0;
      tLat = LAT0;
      gKick();
    });
    if (!RM) setTimeout(() => {
      if (!wave && route === "home") {
        const c = unproj(gCx, gCy - gR * 0.985);
        if (c) sendWave(c, true);
      }
    }, FIRST_PULSE_MS);
    buildGlobe();
    addEventListener("resize", debounce2(buildGlobe));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(buildGlobe);
  }

  // src/sections/statement-energy.js
  var IMG = [1536, 1024];
  var FOCUS = [730, 560];
  var ZOOM = 0.28;
  var PIN = { desktop: "270vh", phone: "230vh" };
  var TOWERS = [
    [402, 497, "Transmission line", "Moves power from plants to cities", "Carrying load", "Hot afternoons lower how much it can carry"],
    [668, 497, "Grid corridor", "A shared route for many lines", "Linked", "A fault here reroutes power across the grid"],
    [1062, 380, "Demand ahead", "Cities at the end of the line", "Rising", "Evening peak on its way"]
  ];
  var CRITICAL = {
    k: "Critical decisions",
    t: "Decisions that cannot wait",
    p: "Some decisions keep a city running: how much power to make, when to store it, where to send it. They have to be right, and they have to be made fast.",
    l: ["A storm is forecast for tomorrow", "Wind output will drop", "Gas plants need to be ready", "The plan is set before the storm arrives"]
  };
  var SCRIM = "linear-gradient(rgba(5,19,28,0) 0%,rgba(5,19,28,.12) 35%,rgba(5,19,28,.62) 62%,rgba(5,19,28,.9) 100%)";
  var SCRIM_PORTRAIT = (hp) => `linear-gradient(rgba(5,19,28,0) 0,rgba(5,19,28,0) ${hp * 0.5}px,rgba(5,19,28,.45) ${hp * 0.8}px,#05131C ${hp}px,#05131C 100%)`;
  function initStatementEnergy() {
    const hero = $(".section_home-hero"), bridge = $(".section_home-statement"), pin = $("#energy");
    const stage = pin && $(".home-energy_stage", pin);
    if (!hero || !bridge || !stage) return;
    const ph = $(".home-energy_photo", stage), scrim = $(".home-energy_scrim", stage), pad = $(".home-energy_padding", stage);
    const heading = bridge.querySelector("h2");
    const POPUP_ON = false;
    if (POPUP_ON) {
      const hl = $(".home-statement_highlight", bridge);
      if (hl) makeTrigger(hl, CRITICAL, { width: 440 });
    }
    const phone = matchMedia("(max-width:767px)");
    const pinStyle = () => Object.assign(pin.style, { height: phone.matches ? PIN.phone : PIN.desktop, minHeight: "0", padding: "0", overflow: "visible", display: "block", backgroundColor: "#F3F2EE" });
    if (!RM) {
      pinStyle();
      phone.addEventListener("change", pinStyle);
      Object.assign(stage.style, { position: "sticky", top: "0", height: "100svh", overflow: "hidden", backgroundColor: "#F3F2EE" });
      if (ph) Object.assign(ph.style, { position: "absolute", inset: "0", zIndex: "0", backgroundRepeat: "no-repeat" });
      if (scrim) Object.assign(scrim.style, { position: "absolute", inset: "0", zIndex: "1", pointerEvents: "none" });
      if (pad) Object.assign(pad.style, { position: "relative", zIndex: "4", width: "100%" });
    }
    const copy = $(".home-energy_copy", stage);
    const texts = [$(".home-energy_title", stage), copy && copy.querySelector("h3"), copy && copy.querySelector("p")].filter(Boolean);
    if (!RM) texts.forEach((el, i) => {
      el.style.transition = `opacity .7s ${i === 1 ? ".12s" : "0s"},transform .7s cubic-bezier(.2,.7,.2,1) ${i === 1 ? ".12s" : "0s"}`;
      el.style.opacity = "0";
      el.style.transform = "translateY(22px)";
    });
    const showText = (el, on) => {
      el.style.opacity = on ? "1" : "0";
      el.style.transform = on ? "none" : "translateY(22px)";
    };
    let zoom = 1;
    function cover(p, z = zoom) {
      const W = stage.offsetWidth, H = stage.offsetHeight, P2 = W < H;
      const k = P2 ? Math.min(W / 760, H * 0.78 / IMG[1]) : Math.max(W / IMG[0], H / IMG[1]);
      const zz = P2 ? 1 : z;
      const ox = P2 ? Math.min(0, Math.max(W - IMG[0] * k, W / 2 - FOCUS[0] * k)) : (W - IMG[0] * k) / 2;
      const oy = P2 ? 0 : (H - IMG[1] * k) / 2;
      const b = (q) => [ox + q[0] * k, oy + q[1] * k], fs = b(FOCUS), bp = b(p);
      return [fs[0] + (bp[0] - fs[0]) * zz, fs[1] + (bp[1] - fs[1]) * zz];
    }
    const tips = (z) => TOWERS.map((p) => cover(p, z)).sort((a, b) => b[0] - a[0]);
    const hots = [];
    const card = null;
    const cTitle = card && $(".home-energy_card-title", card), cVals = card ? $$(".home-energy_card-value", card) : [];
    let openI = -1, hotOn = false;
    if (card) card.setAttribute("role", "tooltip");
    function show(i) {
      if (!card) return;
      const d = TOWERS[i], b = hots[i];
      openI = i;
      if (cTitle) cTitle.textContent = d[2];
      cVals.forEach((v, k) => v.textContent = d[3 + k] || "");
      const x = parseFloat(b.style.left), y = parseFloat(b.style.top), W = stage.offsetWidth, w = card.offsetWidth || 250;
      let left = x + 26;
      if (left + w > W - 24) left = x - 26 - w;
      card.style.transformOrigin = (left > x ? "0%" : "100%") + " 30%";
      card.style.transition = `opacity 180ms ${EASE_OUT}, transform 180ms ${EASE_OUT}`;
      card.style.left = Math.max(16, left) + "px";
      card.style.top = Math.min(Math.max(80, y - 60), stage.offsetHeight - card.offsetHeight - 24) + "px";
      card.style.opacity = "1";
      card.style.transform = "none";
    }
    function hide() {
      openI = -1;
      if (card) {
        card.style.transition = `opacity 140ms ${EASE_OUT}, transform 140ms ${EASE_OUT}`;
        card.style.opacity = "";
        card.style.transform = "";
      }
      hots.forEach((h) => h.__tap = false);
    }
    hots.forEach((b, i) => {
      b.setAttribute("role", "button");
      b.tabIndex = 0;
      b.setAttribute("aria-label", "Details for " + TOWERS[i][2]);
      b.addEventListener("mouseenter", () => show(i));
      b.addEventListener("mouseleave", () => {
        if (!b.__tap) hide();
      });
      b.addEventListener("focus", () => show(i));
      b.addEventListener("blur", hide);
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        b.__tap = true;
        openI === i ? hide() : show(i);
      });
      if (!RM) play(b, [{ boxShadow: "0 0 0 0 rgba(109,194,242,.55)" }, { boxShadow: "0 0 0 14px rgba(109,194,242,0)", offset: 0.7 }, { boxShadow: "0 0 0 0 rgba(109,194,242,0)" }], { duration: 2400, iterations: Infinity, easing: "ease-out", fill: "none" });
    });
    const setHot = (on) => {
      if (on === hotOn) return;
      hotOn = on;
      hots.forEach((b) => {
        b.style.opacity = on ? "1" : "";
        b.style.pointerEvents = on ? "auto" : "";
      });
    };
    const threadsOn = ON("frontierThreads");
    const tc = threadsOn ? canvasIn(document, "home-statement_threads") : null;
    const sc = threadsOn ? canvasIn(stage, "home-energy_threads") : null;
    let tx = null, tW = 0, tH = 0, sx = null, cW = 0, cH = 0, threads = [], ENTRY = [], stageS = 0, stageE = 0, prog = 0;
    function polyline(pts) {
      let L2 = 0;
      const out = [[pts[0][0], pts[0][1], 0]];
      for (let i = 1; i < pts.length; i++) {
        L2 += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        out.push([pts[i][0], pts[i][1], L2]);
      }
      return { pts: out, L: L2 };
    }
    function strokePart(c, t, q) {
      const lim = t.L * q;
      let last = t.pts[0];
      c.beginPath();
      c.moveTo(last[0], last[1]);
      for (const p of t.pts) {
        if (p[2] > lim) {
          const k = (lim - last[2]) / (p[2] - last[2] || 1);
          last = [last[0] + (p[0] - last[0]) * k, last[1] + (p[1] - last[1]) * k];
          c.lineTo(last[0], last[1]);
          break;
        }
        c.lineTo(p[0], p[1]);
        last = p;
      }
      c.stroke();
      return last;
    }
    function build() {
      if (!stage.offsetWidth) return;
      ENTRY = tips(1);
      if (sc) {
        cW = stage.offsetWidth;
        cH = stage.offsetHeight;
        sc.width = cW * DPR;
        sc.height = cH * DPR;
        sx = sc.getContext("2d");
        sx.setTransform(DPR, 0, 0, DPR, 0, 0);
      }
      if (tc) {
        const host = tc.offsetParent || document.body;
        const R = host.getBoundingClientRect(), pr = pin.getBoundingClientRect(), hr = hero.getBoundingClientRect();
        tW = R.width;
        tH = pr.top - R.top + 2;
        tc.style.height = tH + "px";
        tc.width = tW * DPR;
        tc.height = tH * DPR;
        tx = tc.getContext("2d");
        tx.setTransform(DPR, 0, 0, DPR, 0, 0);
        const sy = hr.top - R.top + hero.offsetHeight * 0.98;
        const rg = document.createRange();
        rg.selectNodeContents(heading);
        const tr = rg.getBoundingClientRect();
        const tl = tr.left - R.left, trr = tr.right - R.left, tb = tr.bottom - R.top + 18;
        let nR = ENTRY.filter((t) => t[0] > tW / 2).length, nL = 0;
        threads = ENTRY.map((t) => {
          const ex = t[0], ey = pr.top - R.top;
          const x0 = ex > tW / 2 ? Math.min(tW - 10, trr + 44 + --nR * 56) : Math.max(10, tl - 44 - nL++ * 56);
          const mid = tb + (ey - tb) * 0.5, pts = [[x0, sy], [x0, tb]];
          for (let k = 1; k <= 40; k++) {
            const u = k / 40, v = 1 - u;
            pts.push([v * v * v * x0 + 3 * v * v * u * x0 + 3 * v * u * u * ex + u * u * u * ex, v * v * v * tb + 3 * v * v * u * mid + 3 * v * u * u * mid + u * u * u * ey]);
          }
          return polyline(pts);
        });
      }
      tick();
    }
    function drawThreads() {
      if (!tx) return;
      tx.clearRect(0, 0, tW, tH);
      tx.lineWidth = 1.2;
      tx.strokeStyle = "rgba(5,19,28,.5)";
      tx.fillStyle = "#05131C";
      threads.forEach((t, i) => {
        const q = RM ? 1 : clamp2(prog * 1.12 - i * 0.04);
        if (q <= 0) return;
        const tip = strokePart(tx, t, q);
        if (q < 1) {
          tx.beginPath();
          tx.arc(tip[0], tip[1], 4, 0, 6.283);
          tx.fill();
        }
      });
    }
    function drawStage() {
      if (!sx || !cW) return;
      const f = sx;
      f.clearRect(0, 0, cW, cH);
      tips().forEach((t, i) => {
        const e = ENTRY[i];
        if (!e) return;
        const q = clamp2(stageE * 1.08 - i * 0.04);
        if (q <= 0) return;
        const B = (u) => {
          const v = 1 - u, x0 = e[0], y0 = 0, x1 = e[0], y1 = t[1] * 0.5, x2 = t[0], y2 = t[1] * 0.55, x3 = t[0], y3 = t[1];
          return [v * v * v * x0 + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x3, v * v * v * y0 + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y3];
        };
        const gg = f.createLinearGradient(0, 0, 0, cH * 0.42);
        gg.addColorStop(0, "rgba(5,19,28,.5)");
        gg.addColorStop(0.55, "rgba(5,19,28,.35)");
        gg.addColorStop(1, "rgba(255,255,255,.85)");
        f.strokeStyle = gg;
        f.lineWidth = 1.3;
        f.beginPath();
        f.moveTo(e[0], 0);
        for (let k = 1; k <= 40; k++) {
          const p = B(k / 40 * q);
          f.lineTo(p[0], p[1]);
        }
        f.stroke();
        const h = B(q);
        f.fillStyle = h[1] < cH * 0.3 ? "#05131C" : "#fff";
        f.beginPath();
        f.arc(h[0], h[1], q < 1 ? 4 : 2.6, 0, 6.283);
        f.fill();
        if (q >= 1) {
          f.strokeStyle = "rgba(255,255,255,.6)";
          f.beginPath();
          f.arc(h[0], h[1], 7, 0, 6.283);
          f.stroke();
        }
      });
    }
    function tick() {
      const vh = innerHeight;
      const top = hero.getBoundingClientRect().top + scrollY;
      const a = top + hero.offsetHeight * 0.45, b = Math.max(a + vh * 0.5, top + hero.offsetHeight + bridge.offsetHeight - vh * 0.92);
      prog = clamp2((scrollY - a) / (b - a));
      drawThreads();
      const pr = pin.getBoundingClientRect(), trav = Math.max(1, pr.height - vh);
      stageS = clamp2(-pr.top / trav);
      stageE = RM ? 1 : clamp2((vh * 0.92 - pr.top) / (vh * 0.92 + trav * 0.06));
      const enter = RM ? 1 : clamp2((vh - pr.top) / vh);
      zoom = 1 + ZOOM * (RM ? 0 : stageS);
      const portrait = stage.offsetWidth < stage.offsetHeight;
      if (ph && !RM) {
        const o = cover([0, 0]), e = cover(IMG), hp = e[1] - o[1];
        ph.style.backgroundSize = (e[0] - o[0]).toFixed(1) + "px " + hp.toFixed(1) + "px";
        ph.style.backgroundPosition = o[0].toFixed(1) + "px " + o[1].toFixed(1) + "px";
        const m = `linear-gradient(transparent 0,rgba(0,0,0,.35) ${(4 + (1 - enter) * 16).toFixed(2)}%,#000 ${(16 + (1 - enter) * 34).toFixed(2)}%)`;
        ph.style.webkitMaskImage = ph.style.maskImage = m;
        if (scrim) scrim.style.backgroundImage = portrait ? SCRIM_PORTRAIT(hp) : SCRIM;
        stage.style.backgroundColor = portrait ? "#05131C" : "#F3F2EE";
      }
      hots.forEach((h, i) => {
        const q = cover(TOWERS[i]);
        h.style.left = q[0] + "px";
        h.style.top = q[1] + "px";
      });
      setHot(stageS > 0.06);
      if (stageS <= 0.06 && openI >= 0) hide();
      if (!RM) texts.forEach((el, i) => showText(el, stageS > (i < 2 ? 0.12 : 0.42)));
      drawStage();
    }
    addEventListener("scroll", tick, { passive: true });
    document.addEventListener("click", hide);
    let lw = innerWidth;
    addEventListener("resize", debounce2(() => {
      if (innerWidth !== lw) {
        lw = innerWidth;
        build();
      } else tick();
    }));
    onLoad(build, 300);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => onLoad(build, 300));
    tick();
  }

  // src/sections/one-world-model.js
  var IN2 = "#0071B1";
  var OUT2 = "#6DC2F2";
  var DRAW_MS = 1300;
  var STAGGER_MS = 70;
  var OUT_DELAY_MS = 900;
  var DOT_MS = 3200;
  function initOneWorldModel() {
    const dep = $(".home-owm_component");
    const cv = canvasIn(dep, "home-owm_lines");
    if (!cv) return;
    const STILL = RM || !ON("oneWorldModel");
    const lists = $$(".home-owm_list", dep), title = $(".home-owm_title", dep);
    if (lists.length < 2 || !title) return;
    cv.setAttribute("aria-hidden", "true");
    let x = null, W = 0, H = 0, lines = [], on = false, seenAt = 0, hot = -1, raf = 0;
    function curve(x0, y0, x1, y1, down) {
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, pts = [];
      let L2 = 0;
      for (let k = 0; k <= 48; k++) {
        const u = k / 48, v = 1 - u;
        const p = down ? [v * v * v * x0 + 3 * v * v * u * x0 + 3 * v * u * u * x1 + u * u * u * x1, v * v * v * y0 + 3 * v * v * u * my + 3 * v * u * u * my + u * u * u * y1] : [v * v * v * x0 + 3 * v * v * u * mx + 3 * v * u * u * mx + u * u * u * x1, v * v * v * y0 + 3 * v * v * u * y0 + 3 * v * u * u * y1 + u * u * u * y1];
        if (k) L2 += Math.hypot(p[0] - pts[k - 1][0], p[1] - pts[k - 1][1]);
        pts.push([p[0], p[1], L2]);
      }
      return { pts, L: L2 };
    }
    const at = (c, d) => {
      for (let i = 1; i < c.pts.length; i++) if (c.pts[i][2] >= d) {
        const a = c.pts[i - 1], b = c.pts[i], k = (d - a[2]) / (b[2] - a[2] || 1);
        return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
      }
      return c.pts[c.pts.length - 1];
    };
    function box(el) {
      const b = el.getBoundingClientRect(), t = getComputedStyle(el).transform;
      if (!t || t === "none") return b;
      const m = new DOMMatrixReadOnly(t), l = b.left - m.e, tp = b.top - m.f;
      return { left: l, top: tp, right: l + b.width, bottom: tp + b.height, width: b.width, height: b.height };
    }
    function build() {
      const r = dep.getBoundingClientRect();
      lines = [];
      W = r.width;
      H = r.height;
      cv.width = W * DPR;
      cv.height = H * DPR;
      x = cv.getContext("2d");
      x.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (!W) return;
      const ct = box(title), cy = ct.top - r.top + ct.height / 2, lx = ct.left - r.left - 18, rx = ct.right - r.left + 18;
      if (innerWidth < 768) {
        const cx = ct.left - r.left + ct.width / 2, ty = ct.top - r.top - 10, by = ct.bottom - r.top + 10;
        $$(".home-owm_item", lists[0]).forEach((s, i) => {
          const b = box(s);
          lines.push({ el: s, c: curve(b.left - r.left + b.width / 2, b.bottom - r.top + 6, cx, ty, true), col: IN2, i, side: 0 });
        });
        $$(".home-owm_item", lists[1]).forEach((s, i) => {
          const b = box(s);
          lines.push({ el: s, c: curve(cx, by, b.left - r.left + b.width / 2, b.top - r.top - 6, true), col: OUT2, i, side: 1 });
        });
        kick();
        return;
      }
      $$(".home-owm_item", lists[0]).forEach((s, i) => {
        const b = box(s);
        lines.push({ el: s, c: curve(b.right - r.left + 14, b.top - r.top + b.height / 2, lx, cy), col: IN2, i, side: 0 });
      });
      $$(".home-owm_item", lists[1]).forEach((s, i) => {
        const b = box(s);
        lines.push({ el: s, c: curve(rx, cy, b.left - r.left - 14, b.top - r.top + b.height / 2), col: OUT2, i, side: 1 });
      });
      lines.forEach((l, k) => {
        l.el.onmouseenter = () => {
          hot = k;
          kick();
        };
        l.el.onmouseleave = () => {
          hot = -1;
          kick();
        };
      });
      kick();
    }
    function draw(t) {
      if (!x) return;
      x.clearRect(0, 0, W, H);
      const age = seenAt ? t - seenAt : 0;
      let busy = false;
      for (let k = 0; k < lines.length; k++) {
        const l = lines[k], c = l.c;
        const q = STILL ? 1 : seenAt ? clamp2((age - (l.side ? OUT_DELAY_MS : 0) - l.i * STAGGER_MS) / DRAW_MS) : 0;
        if (q < 1) busy = true;
        if (q <= 0) continue;
        const e = q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
        x.globalAlpha = hot < 0 ? 0.5 : hot === k ? 1 : 0.14;
        x.strokeStyle = l.col;
        x.lineWidth = hot === k ? 1.6 : 1.2;
        x.beginPath();
        x.moveTo(c.pts[0][0], c.pts[0][1]);
        const lim = c.L * e;
        for (const p of c.pts) {
          if (p[2] > lim) {
            const m = at(c, lim);
            x.lineTo(m[0], m[1]);
            break;
          }
          x.lineTo(p[0], p[1]);
        }
        x.stroke();
        if (!STILL && q >= 1) {
          const u = (t / DOT_MS + l.i / 6 + (l.side ? 0.5 : 0)) % 1, p = at(c, c.L * u);
          x.globalAlpha = Math.sin(u * Math.PI);
          x.fillStyle = l.col;
          x.beginPath();
          x.arc(p[0], p[1], 2.6, 0, 6.283);
          x.fill();
        }
      }
      x.globalAlpha = 1;
      return busy;
    }
    function loop(t) {
      raf = 0;
      if (!on) return;
      draw(t);
      if (!STILL) raf = requestAnimationFrame(loop);
    }
    function kick() {
      if (STILL) {
        draw(performance.now());
        return;
      }
      if (on && !raf) raf = requestAnimationFrame(loop);
    }
    if ("IntersectionObserver" in window) new IntersectionObserver((e) => {
      on = e[0].isIntersecting;
      if (on && !seenAt && e[0].intersectionRatio >= 0.3) seenAt = performance.now();
      kick();
    }, { threshold: [0, 0.3] }).observe(dep);
    else {
      on = true;
      seenAt = 1;
    }
    onLoad(build, 100);
    addEventListener("resize", debounce2(build));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  }

  // src/sections/use-cases.js
  var CDN = "https://cdn.prod.website-files.com/6af68d8e7acb8dbd77201062/";
  var UC = [
    { k: "Power generators", t: "Generation Forecast + Scheduling", d: "High-accuracy generation forecast and smarter, block-level scheduling decisions across day-ahead and intraday markets.", i: "6af69ac735c5dc2d29c69745_arborum-generation-licensed.jpg", m: "6af69ac61ea333a9ea2210d4_arborum-generation-licensed-m.jpg", p: "50% 50%" },
    { k: "Power distributors", t: "Load Forecast + Scheduling", d: "High-accuracy demand forecasting and intelligent scheduling to balance demand and supply across every block.", i: "6af69ac5505d0468f3762034_arborum-distribution-licensed.jpg", m: "6af69ac5505d0468f3762034_arborum-distribution-licensed.jpg", p: "62% 50%" },
    { k: "Battery energy storage systems", t: "Battery Charging + Discharging Optimisation", d: "AI-powered battery optimisation to maximise returns, reduce deviations and respond dynamically to changing grid conditions.", i: "6af69ac415bf88c09c359668_arborum-bess-licensed.jpg", m: "6af69ac415bf88c09c359668_arborum-bess-licensed.jpg", p: "50% 60%" }
  ];
  var ROTATE_MS = 7e3;
  function initUseCases() {
    const tabs = $$(".home-usecases_tab"), panel = $(".home-usecases_panel");
    if (tabs.length !== 3 || !panel) return;
    const mq = matchMedia("(max-width:767px)");
    const card = $(".home-usecases_card", panel), photo = $(".home-usecases_photo", panel);
    const K2 = $(".home-usecases_kicker", card), T2 = $(".home-usecases_title", card), D = $(".home-usecases_text", card);
    const bars = tabs.map((t) => $(".home-usecases_progress", t));
    let cur2 = 0, sw, since = performance.now(), vis = false;
    UC.forEach((u) => [u.i, u.m].forEach((s) => {
      const im = new Image();
      im.src = CDN + s;
    }));
    card.style.transition = "opacity 220ms ease, filter 220ms ease";
    const autoOn = ON("powerUseCases");
    const auto = () => autoOn && vis && !RM && !mq.matches && !document.hidden;
    function layout() {
      if (cur2 < 0 && !mq.matches) return set(0);
      panel.style.display = cur2 < 0 ? "none" : "";
      if (cur2 < 0) {
        tabs.forEach((t, j) => {
          t.style.order = String(j * 2);
        });
        return;
      }
      tabs.forEach((t, j) => {
        t.style.order = mq.matches ? String(j <= cur2 ? j * 2 : j * 2 + 2) : "";
      });
      panel.style.order = mq.matches ? String(cur2 * 2 + 1) : "";
      panel.style.backgroundImage = mq.matches ? "none" : "url(" + CDN + UC[cur2].i + ")";
      panel.style.backgroundPosition = UC[cur2].p;
    }
    const ACC_MS = 320, ACC_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
    let ghost = null;
    let closing = 0;
    const clearAnim = () => ["height", "marginBottom", "overflow", "opacity", "transition"].forEach((k) => panel.style[k] = "");
    function accordion(fill, from) {
      if (ghost) {
        ghost.remove();
        ghost = null;
      }
      clearTimeout(closing);
      clearAnim();
      const H = panel.offsetHeight, mb = getComputedStyle(panel).marginBottom, oldOrder = panel.style.order;
      if (from < 0) {
        fill();
        layout();
        if (RM) return;
        const h2 = panel.offsetHeight;
        Object.assign(panel.style, { height: "0px", marginBottom: "0px", overflow: "hidden", opacity: "0", transition: "none" });
        void panel.offsetHeight;
        Object.assign(panel.style, { transition: `height ${ACC_MS}ms ${ACC_EASE}, margin-bottom ${ACC_MS}ms ${ACC_EASE}, opacity ${ACC_MS}ms ease`, height: h2 + "px", marginBottom: mb, opacity: "1" });
        closing = setTimeout(clearAnim, ACC_MS + 40);
        return;
      }
      if (!RM) {
        ghost = panel.cloneNode(true);
        ghost.setAttribute("aria-hidden", "true");
        ghost.removeAttribute("id");
        Object.assign(ghost.style, { order: oldOrder, height: H + "px", overflow: "hidden", transition: "none", pointerEvents: "none" });
        panel.parentElement.appendChild(ghost);
      }
      fill();
      layout();
      if (RM) return;
      const h = panel.offsetHeight;
      Object.assign(panel.style, { height: "0px", marginBottom: "0px", overflow: "hidden", opacity: "0", transition: "none" });
      void panel.offsetHeight;
      const tr = `height ${ACC_MS}ms ${ACC_EASE}, margin-bottom ${ACC_MS}ms ${ACC_EASE}, opacity ${ACC_MS}ms ease`;
      Object.assign(panel.style, { transition: tr, height: h + "px", marginBottom: mb, opacity: "1" });
      Object.assign(ghost.style, { transition: tr, height: "0px", marginBottom: "0px", opacity: "0" });
      const g = ghost;
      closing = setTimeout(() => {
        g.remove();
        if (ghost === g) ghost = null;
        clearAnim();
        if (cur2 < 0) return;
        const t = tabs[cur2].getBoundingClientRect().top;
        if (t < 72) {
          const y = scrollY + t - 80, ln = window.__lenis;
          if (ln) ln.scrollTo(y, { duration: 0.5 });
          else scrollTo({ top: y, behavior: "smooth" });
        }
      }, ACC_MS + 40);
    }
    const mark = (i) => tabs.forEach((t, j) => {
      const on = j === i, l = $(".home-usecases_label", t), ic = $(".home-usecases_icon", t);
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on);
      t.setAttribute("aria-expanded", on);
      if (l) l.classList.toggle("is-active", on);
      if (ic) {
        ic.classList.toggle("is-active", on);
        ic.textContent = on ? "\u2212" : "+";
      }
    });
    function closeAll() {
      if (ghost) {
        ghost.remove();
        ghost = null;
      }
      clearTimeout(closing);
      cur2 = -1;
      mark(-1);
      if (RM) {
        layout();
        return;
      }
      clearAnim();
      Object.assign(panel.style, { height: panel.offsetHeight + "px", overflow: "hidden", transition: "none" });
      void panel.offsetHeight;
      Object.assign(panel.style, { transition: `height ${ACC_MS}ms ${ACC_EASE}, margin-bottom ${ACC_MS}ms ${ACC_EASE}, opacity ${ACC_MS}ms ease`, height: "0px", marginBottom: "0px", opacity: "0" });
      closing = setTimeout(() => {
        clearAnim();
        layout();
      }, ACC_MS + 40);
    }
    function set(i) {
      if (i === cur2) {
        if (mq.matches) closeAll();
        return;
      }
      const from = cur2;
      cur2 = i;
      since = performance.now();
      mark(i);
      const fill = () => {
        const u = UC[i];
        K2.textContent = u.k;
        T2.textContent = u.t;
        D.textContent = u.d;
        if (photo) {
          photo.style.backgroundImage = "url(" + CDN + u.m + ")";
          photo.style.backgroundPosition = u.p;
        }
      };
      clearTimeout(sw);
      if (mq.matches) {
        accordion(fill, from);
        return;
      }
      card.style.opacity = "0";
      card.style.filter = RM ? "" : "blur(2px)";
      sw = setTimeout(() => {
        fill();
        layout();
        card.style.opacity = "";
        card.style.filter = "";
      }, RM ? 0 : 220);
      layout();
    }
    const pick = (j) => {
      set(j);
      since = performance.now();
    };
    tabs.forEach((t, j) => {
      t.setAttribute("role", "tab");
      t.setAttribute("aria-selected", j === 0);
      t.addEventListener("click", () => pick(j));
      keyable(t, () => pick(j));
    });
    mq.addEventListener("change", layout);
    layout();
    const sec = panel.closest("section");
    if (sec) sec.style.overflowAnchor = "none";
    new IntersectionObserver((es) => {
      const v = es[0].isIntersecting;
      if (v && !vis) since = performance.now();
      vis = v;
    }, { threshold: 0.3 }).observe(panel);
    (function loop(t) {
      let p = 1;
      if (auto()) {
        p = Math.min(1, (t - since) / ROTATE_MS);
        if (p >= 1) {
          set((cur2 + 1) % 3);
          p = 0;
        }
      } else if (autoOn && !mq.matches) {
        since = t;
        p = 0;
      }
      bars.forEach((b, j) => {
        if (b) b.style.transform = "scaleX(" + (j === cur2 ? !autoOn || mq.matches || RM ? 1 : p : 0) + ")";
      });
      requestAnimationFrame(loop);
    })(performance.now());
  }

  // src/sections/beyond-energy.js
  var COPY = [
    ["Different networks. Endless possibilities.", "The world\u2019s most critical systems (telecom, finance, logistics and beyond) are complex networks of interconnected systems. We are extending World Model beyond energy to understand them, anticipate problems and discover better solutions."],
    ["Understanding networks. Improving how they operate.", "We are extending our World Models to telecom networks, spanning infrastructure asset management and network operations. By modelling how interconnected network components behave, we aim to help operators make better decisions across increasingly complex and distributed systems."],
    ["A world model for every complex network.", "From data centres to logistics and other critical infrastructure, we see an opportunity to apply the same underlying technology to systems where multiple assets, constraints and decisions interact. We are building towards a future where complex networks can be modelled, simulated and optimised through a common intelligence layer."]
  ];
  var STEPS = [1 / 3, 2 / 3];
  var TURN = 0.07;
  var SETTLE = [1 / 6, 1 / 2, 5 / 6];
  var SETTLE_AFTER = 220;
  var SETTLE_S = 0.9;
  var sm = (t) => {
    t = clamp2(t);
    return t * t * (3 - 2 * t);
  };
  var chapter = (p) => sm((p - (STEPS[0] - TURN)) / (2 * TURN)) + sm((p - (STEPS[1] - TURN)) / (2 * TURN));
  function initCopy(bs) {
    const copy = bs.querySelector(".home-beyond_copy"), h3 = copy && copy.querySelector("h3"), pp = copy && copy.querySelector("p"), nets = $$(".home-beyond_net:not(.is-arrow)", bs);
    const trig = copy && (copy.querySelector(".home-beyond_trigger") || h3);
    let cur2 = -1, tm;
    if (copy) copy.style.transition = "opacity 240ms ease,transform 240ms cubic-bezier(0.23, 1, 0.32, 1),filter 240ms ease";
    function set(i) {
      if (i === cur2) return;
      const first = cur2 < 0;
      cur2 = i;
      nets.forEach((n, k) => n.classList.toggle("is-active", k === i));
      if (first || !copy) return;
      copy.style.opacity = "0";
      copy.style.transform = "translateY(6px)";
      copy.style.filter = RM ? "" : "blur(2px)";
      clearTimeout(tm);
      tm = setTimeout(() => {
        trig.textContent = COPY[i][0];
        pp.textContent = COPY[i][1];
        copy.style.opacity = "";
        copy.style.transform = "";
        copy.style.filter = "";
      }, RM ? 0 : 240);
    }
    function tick() {
      const r = bs.getBoundingClientRect(), p = clamp2(-r.top / Math.max(1, r.height - innerHeight));
      set(Math.round(chapter(p)));
    }
    addEventListener("scroll", tick, { passive: true });
    tick();
    let st = 0, gliding = false, fromCh = null;
    const progress = () => {
      const r = bs.getBoundingClientRect();
      return -r.top / Math.max(1, r.height - innerHeight);
    };
    addEventListener("touchstart", () => {
      const p = progress();
      fromCh = p > 0 && p < 1 ? Math.round(chapter(clamp2(p))) : null;
    }, { passive: true });
    addEventListener("scroll", () => {
      clearTimeout(st);
      if (gliding || RM) return;
      st = setTimeout(() => {
        const r = bs.getBoundingClientRect(), travel = Math.max(1, r.height - innerHeight), p = -r.top / travel;
        if (p < 0.08 || p > 0.92) {
          fromCh = null;
          return;
        }
        let k = SETTLE.reduce((a, b, j) => Math.abs(b - p) < Math.abs(SETTLE[a] - p) ? j : a, 0);
        if (fromCh != null) k = Math.max(fromCh - 1, Math.min(fromCh + 1, k));
        fromCh = null;
        const target = SETTLE[k], y = r.top + scrollY + target * travel;
        if (Math.abs((target - p) * travel) < 6) return;
        const l = getLenis();
        gliding = true;
        if (l) l.scrollTo(y, { duration: SETTLE_S, onComplete: () => {
          gliding = false;
        } });
        else {
          scrollTo({ top: y, behavior: "smooth" });
          setTimeout(() => gliding = false, SETTLE_S * 1e3);
        }
      }, SETTLE_AFTER);
    }, { passive: true });
  }
  function initMorph() {
    var morphSec = document.getElementById("beyond"), stage = morphSec && morphSec.querySelector(".home-beyond_sticky");
    if (!stage) return;
    var cv = canvasIn(stage, "home-beyond_canvas");
    if (!cv) return;
    cv.id = "morph";
    cv.setAttribute("aria-hidden", "true");
    lift(stage);
    let morphP = 0, morphE = 0, morphM = 0;
    function mScroll() {
      const vh = innerHeight, m = morphSec.getBoundingClientRect();
      morphP = clamp2(-m.top / Math.max(1, m.height - vh));
      {
        const c = chapter(morphP);
        morphM = c <= 1 ? 0.1 + 0.41 * c : 0.51 + 0.39 * (c - 1);
      }
      morphE = RM ? 1 : clamp2((vh * 0.6 - m.top) / (vh * 0.6 + (m.height - vh) * 0.08));
    }
    addEventListener("scroll", mScroll, { passive: true });
    mScroll();
    const mc = $("#morph");
    let mf, MP = [], ME = [[], [], []], mOn = false, MTH = [];
    const N = 456;
    function ease(t) {
      return t * t * (3 - 2 * t);
    }
    let TB = null;
    function buildMorph() {
      mf = fit(mc);
      {
        const c = stage.querySelector(".home-beyond_component"), cr = mc.getBoundingClientRect();
        if (c) {
          const r = c.getBoundingClientRect(), cs = getComputedStyle(c);
          TB = [r.top - cr.top + parseFloat(cs.paddingTop), r.bottom - cr.top - parseFloat(cs.paddingBottom)];
        }
      }
      setSeed(11);
      MP = [];
      ME = [[], [], []];
      const A = [], B = [], C = [];
      for (let s2 = 0; s2 < 2; s2++) for (let r = 0; r < 12; r++) for (let c = 0; c < 19; c++) A.push([(c - 9) * 38 + r % 2 * 19, (s2 ? 1 : -1) * (74 + rnd(-3, 3)), 60 + r * 62]);
      const at = (s2, r, c) => s2 * 228 + r * 19 + c;
      for (let s2 = 0; s2 < 2; s2++) for (let r = 0; r < 12; r++) for (let c = 0; c < 19; c++) {
        if (c < 18) ME[0].push([at(s2, r, c), at(s2, r, c + 1)]);
        if (r < 11) {
          ME[0].push([at(s2, r, c), at(s2, r + 1, c)]);
          if (c < 18 && r % 2) ME[0].push([at(s2, r, c), at(s2, r + 1, c + 1)]);
        }
      }
      for (let r = 0; r < 12; r++) for (let i = 0; i < 38; i++) {
        const th = i / 38 * 6.283 + r * 0.16;
        B.push([Math.cos(th) * 210, Math.sin(th) * 122, 60 + r * 62]);
        ME[1].push([r * 38 + i, r * 38 + (i + 1) % 38]);
        if (r < 11 && i % 3 === 0) ME[1].push([r * 38 + i, (r + 1) * 38 + i]);
      }
      const CC = [];
      for (let i = 0; i < 12; i++) CC.push([rnd(-260, 260), rnd(-130, 130), rnd(90, 760)]);
      for (let i = 0; i < N; i++) {
        const c = CC[i % 12], th = rnd(6.283), ph = Math.acos(rnd(-1, 1)), R = Math.pow(rnd(), 0.6) * 46;
        C.push([c[0] + Math.sin(ph) * Math.cos(th) * R, c[1] + Math.cos(ph) * R * 0.8, c[2] + Math.sin(ph) * Math.sin(th) * R]);
        if (i >= 12) ME[2].push([i, i % 12]);
      }
      for (let i = 0; i < N; i++) MP.push({ a: A[i], b: B[i], c: C[i], r: rnd(1.5, 2.8), ph: rnd(6.28) });
      MTH = [at(1, 5, 3), at(1, 4, 15), at(1, 8, 9)];
      drawMorph(performance.now());
    }
    function drawMorph(t) {
      const { x, w: W, h: H } = mf;
      if (!W) return;
      const p = morphM, P0 = morphP, w0 = 1 - ease(clamp2((p - 0.22) / 0.2)), w2 = ease(clamp2((p - 0.6) / 0.2)), w1 = clamp2(1 - w0 - w2);
      const end = clamp2((1 - P0) / 0.12);
      const C0 = [243, 242, 238], bg = mix(mix(mix(C0, [212, 233, 246], clamp2(p / 0.2)), [228, 225, 247], w1), [248, 229, 211], w2), bgc = mix(C0, bg, end * clamp2(morphE * 1.2));
      x.fillStyle = rgba(bgc);
      x.fillRect(0, 0, W, H);
      const f = Math.min(W * 0.66, H * 1.05), cz = -70 + p * (RM ? 0 : 330), o = RM ? 0 : t / 2600, cx = W / 2, cy = H / 2, P2 = [];
      const col = mix(mix(DEEP, [84, 82, 176], w1), mix(VIO, NAVY, 0.12), w2);
      for (let i = 0; i < N; i++) {
        const m = MP[i], X = m.a[0] * w0 + m.b[0] * w1 + m.c[0] * w2, Y = m.a[1] * w0 + m.b[1] * w1 + m.c[1] * w2, Z = m.a[2] * w0 + m.b[2] * w1 + m.c[2] * w2;
        let d = Z - cz;
        if (d < 14) {
          d += 0;
          P2.push(null);
          continue;
        }
        const k = f / d;
        P2.push([cx + (X + Math.sin(o + m.ph) * 2) * k, cy - (Y + Math.cos(o * 1.2 + m.ph) * 2) * k, d, k]);
      }
      const fadeD = (d) => clamp2((d - 14) / 46) * clamp2(1.12 - d / 820);
      const bk = [[], [], [], []];
      [w0, w1, w2].forEach((w, k) => {
        if (w < 0.02) return;
        for (const [a, b] of ME[k]) {
          const q = P2[a], r = P2[b];
          if (!q || !r) continue;
          const al = fadeD((q[2] + r[2]) / 2) * w;
          if (al < 0.03) continue;
          bk[Math.min(3, al * 4 | 0)].push(q[0], q[1], r[0], r[1]);
        }
      });
      x.lineWidth = 1;
      bk.forEach((a, k) => {
        if (!a.length) return;
        x.strokeStyle = rgba(col, 0.16 + k * 0.2);
        x.beginPath();
        for (let i = 0; i < a.length; i += 4) {
          x.moveTo(a[i], a[i + 1]);
          x.lineTo(a[i + 2], a[i + 3]);
        }
        x.stroke();
      });
      for (let i = 0; i < N; i++) {
        const q = P2[i];
        if (!q || q[0] < -8 || q[0] > W + 8 || q[1] < -8 || q[1] > H + 8) continue;
        const a = fadeD(q[2]);
        if (a < 0.02) continue;
        x.fillStyle = rgba(col, 0.92 * a);
        x.beginPath();
        x.arc(q[0], q[1], clamp2(MP[i].r * q[3] * 0.42, 0.7, 6), 0, 6.283);
        x.fill();
      }
      if (TB && TB[1] > TB[0]) {
        const y0 = TB[0] - 110, y3 = TB[1] + 70, L2 = y3 - y0, v = x.createLinearGradient(0, y0, 0, y3);
        v.addColorStop(0, rgba(bgc, 0));
        v.addColorStop(100 / L2, rgba(bgc, 0.9));
        v.addColorStop(1 - 60 / L2, rgba(bgc, 0.9));
        v.addColorStop(1, rgba(bgc, 0));
        x.fillStyle = v;
        x.fillRect(0, y0, W, L2);
      } else {
        const v = x.createLinearGradient(0, cy - H * 0.34, 0, cy + H * 0.34);
        v.addColorStop(0, rgba(bgc, 0));
        v.addColorStop(0.3, rgba(bgc, 0.72));
        v.addColorStop(0.7, rgba(bgc, 0.72));
        v.addColorStop(1, rgba(bgc, 0));
        x.fillStyle = v;
        x.fillRect(0, 0, W, H);
      }
      const ta = 1 - clamp2((p - 0.14) / 0.1);
      if (ta > 0 && morphE > 0) MTH.forEach((id, i) => {
        const q = P2[id];
        if (!q) return;
        const qq = clamp2(morphE * 1.08 - i * 0.04);
        if (qq <= 0) return;
        const ex = cx + MP[id].a[0] * f / (MP[id].a[2] + 70), B = (u) => {
          const w = 1 - u;
          return [w * w * w * ex + 3 * w * w * u * ex + 3 * w * u * u * q[0] + u * u * u * q[0], 3 * w * w * u * q[1] * 0.5 + 3 * w * u * u * q[1] * 0.55 + u * u * u * q[1]];
        };
        x.strokeStyle = `rgba(5,19,28,${0.55 * ta})`;
        x.lineWidth = 1.2;
        x.beginPath();
        x.moveTo(ex, 0);
        for (let k = 1; k <= 30; k++) {
          const b = B(k / 30 * qq);
          x.lineTo(b[0], b[1]);
        }
        x.stroke();
        const h = B(qq);
        x.fillStyle = `rgba(5,19,28,${ta})`;
        x.beginPath();
        x.arc(h[0], h[1], qq < 1 ? 4 : 2.6, 0, 6.283);
        x.fill();
        if (qq >= 1) {
          x.strokeStyle = `rgba(5,19,28,${0.4 * ta})`;
          x.beginPath();
          x.arc(h[0], h[1], 7, 0, 6.283);
          x.stroke();
        }
      });
    }
    (function loop(t) {
      if (mOn && mf) drawMorph(t);
      requestAnimationFrame(loop);
    })(0);
    visible(mc, (v) => mOn = v);
    buildMorph();
    addEventListener("resize", debounce2(buildMorph));
  }
  function initBeyondEnergy() {
    const bs = document.getElementById("beyond");
    if (!bs) return;
    initCopy(bs);
    if (ON("beyondEnergy")) initMorph();
  }

  // src/core/net.js
  function Net(canvas, opt) {
    const o = Object.assign({ spacing: 118, fade: () => 1, dark: true }, opt);
    let W = 0, H = 0, x, nodes = [], edges = [], waves = [], mouse = null, on = true, raf = 0, last = 0;
    function build() {
      const f = fit(canvas, o.height && o.height());
      x = f.x;
      W = f.w;
      H = f.h;
      setSeed(o.seed || 7);
      nodes = [];
      edges = [];
      const s = Math.max(74, Math.min(o.spacing, W / 9));
      const rows = Math.ceil(H / (s * 0.866)) + 2, cols = Math.ceil(W / s) + 2;
      for (let j = -1; j < rows; j++) for (let i = -1; i < cols; i++) {
        nodes.push({ x: (i + 0.5 * ((j + 2) % 2)) * s + rnd(-0.2, 0.2) * s, y: j * s * 0.866 + rnd(-0.2, 0.2) * s, v: 0, base: rnd(0.75, 1.1), ph: rnd(6.28) });
      }
      for (let a = 0; a < nodes.length; a++) for (let b = a + 1; b < nodes.length; b++) {
        const dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
        if (dx * dx + dy * dy < s * s * 1.75) edges.push([a, b]);
      }
      o.onBuild && o.onBuild(nodes, W, H);
      draw(performance.now());
    }
    function draw(t) {
      x.clearRect(0, 0, W, H);
      const sp = o.speed || 420;
      waves = waves.filter((w) => (t - w.t) / 1e3 < w.life);
      for (const n of nodes) {
        let v = 0;
        for (const w of waves) {
          const age = (t - w.t) / 1e3, r = age * sp, d = Math.hypot(n.x - w.x, n.y - w.y);
          const band = Math.exp(-((d - r) ** 2) / (2 * 95 * 95));
          const core = Math.exp(-d * d / (2 * 160 * 160)) * Math.exp(-age * 1.1);
          v += (band * 1.35 + core) * Math.exp(-age * 0.42);
        }
        if (mouse) {
          const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
          v += Math.exp(-d * d / (2 * 150 * 150)) * 0.72;
        }
        n.v += (v - n.v) * 0.2;
        n.drift = RM ? 0 : Math.sin(t / 1800 + n.ph) * 0.08;
      }
      for (const [a, b] of edges) {
        const A = nodes[a], B = nodes[b], v = clamp2((A.v + B.v) / 2), m = (A.y + B.y) / 2, f = o.fade(m, H, (A.x + B.x) / 2, W);
        if (f <= 0.01) continue;
        const al = (0.24 + 0.7 * v) * f;
        x.strokeStyle = rgba(mix(mix(LIGHT, DEEP, 0.5), DEEP, clamp2(v * 1.25)), al);
        x.lineWidth = 0.8 + 1.3 * v;
        x.beginPath();
        x.moveTo(A.x, A.y);
        x.lineTo(B.x, B.y);
        x.stroke();
      }
      for (const n of nodes) {
        const f = o.fade(n.y, H, n.x, W);
        if (f <= 0.01) continue;
        const v = clamp2(n.v), r = (2.1 + 4.6 * v) * n.base;
        x.fillStyle = rgba(mix(mix(LIGHT, DEEP, 0.5), DEEP, clamp2(v * 1.25)), clamp2(0.62 + n.drift + 0.38 * v) * f);
        x.beginPath();
        x.arc(n.x, n.y, r, 0, 6.283);
        x.fill();
      }
      for (const w of waves) {
        const age = Math.max(0, (t - w.t) / 1e3), r = age * sp, a = 0.9 * Math.exp(-age * 0.75);
        if (a < 0.01) continue;
        const f = o.fade(w.y, H, w.x, W);
        x.strokeStyle = rgba(VIO, a * f);
        x.lineWidth = 1.8;
        x.beginPath();
        x.arc(w.x, w.y, r, 0, 6.283);
        x.stroke();
        if (age < 1.2) {
          x.fillStyle = rgba(VIO, f * (1 - age / 1.2));
          x.beginPath();
          x.arc(w.x, w.y, 6, 0, 6.283);
          x.fill();
        }
      }
      o.after && o.after(x, t, W, H);
    }
    function loop(t) {
      if (!on) {
        raf = 0;
        return;
      }
      draw(t);
      if (RM && !waves.length && !mouse && nodes.every((n) => n.v < 0.01)) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
    }
    const kick = () => {
      if (on && !raf) raf = requestAnimationFrame(loop);
    };
    const api = {
      build,
      ripple(px, py, life = 5) {
        const n = nearest(px, py);
        waves.push({ x: n.x, y: n.y, t: performance.now(), life });
        if (waves.length > 6) waves.shift();
        kick();
        return n;
      },
      nearest,
      setMouse(m) {
        mouse = m;
        kick();
      },
      get nodes() {
        return nodes;
      },
      get size() {
        return [W, H];
      },
      run(v) {
        on = v;
        kick();
      }
    };
    function nearest(px, py) {
      let b = nodes[0], bd = 1e12;
      for (const n of nodes) {
        const d = (n.x - px) ** 2 + (n.y - py) ** 2;
        if (d < bd) {
          bd = d;
          b = n;
        }
      }
      return b;
    }
    return api;
  }

  // src/sections/world-model.js
  var TAGS = [["Weather", 0.09, 0.28], ["Price", 0.29, 0.22], ["Transmission", 0.5, 0.26], ["Policy", 0.7, 0.22], ["Fault", 0.9, 0.3], ["Demand", 0.18, 0.64], ["Market", 0.39, 0.6], ["Storage", 0.6, 0.66], ["Asset", 0.79, 0.6], ["Grievance", 0.93, 0.7]];
  var SPEED = 360;
  var INFO = {
    Weather: "Weather forecasts feed into the model to capture their impact on both demand and generation. It accounts for heatwaves, cloud cover and wind patterns to produce block-level forecasts of load, generation and prices.",
    Demand: "The model learns demand patterns across hours, seasons and emerging loads such as data centres and EV charging. It adapts to changing consumption patterns to forecast demand and plan generation, procurement and storage.",
    Price: "Fuel costs and market prices shape the economics of power generation. The model tracks these changes across the generation mix to identify cost shifts and guide procurement, scheduling and bidding decisions.",
    Market: "Day-ahead and real-time markets bring together prices, supply and competing bids. The model adapts to changing market conditions to recommend bids and schedules that balance commercial returns with delivery commitments.",
    Transmission: "The model accounts for transmission capacity, line limits and substation constraints to anticipate congestion, curtailment and regional price differences before they affect grid operations.",
    Storage: "The model evaluates market prices, grid demand and generation to determine when batteries and pumped hydro should charge, discharge or hold. It optimises dispatch to maximise asset value while meeting operational constraints.",
    Policy: "Tariffs, renewable purchase obligations and grid codes shape how power assets operate. The model incorporates regulatory changes to assess their impact on generation, scheduling and market economics.",
    Asset: "Every turbine, transformer, server and telecom tower wears down with use. Early signs of trouble show up in temperature, vibration and output long before a breakdown. The model reads these signals so that maintenance is planned on time instead of forced by failure.",
    Fault: "A single failure rarely stays where it started. A tripped feeder, a failed cooling unit or a cut fibre link can set off hundreds of alarms in a grid control room or a network operations centre. The model traces those alarms back to the root cause, so teams fix the problem and not the symptoms.",
    Grievance: "Every complaint is a signal about something real in the network. A high bill, a power cut or a dropped connection usually traces back to a specific event on the ground. The model links each grievance to that event, so customers get an answer based on facts."
  };
  var TAGS_PHONE = { Weather: [0.24, 0.24], Price: [0.74, 0.2], Transmission: [0.3, 0.52], Demand: [0.76, 0.5], Market: [0.24, 0.82], Storage: [0.72, 0.8] };
  var AUTO_MS = 4e3;
  var AUTO_POP_MS = 7e3;
  var LOOK = {
    open: { backgroundColor: "#0071B1", color: "#fff", boxShadow: "0 0 0 4px rgba(109,194,242,.3)" },
    on: { backgroundColor: "#0071B1", color: "#fff", boxShadow: "none" },
    hit: { backgroundColor: "rgba(109,194,242,.22)", color: "#05131C", boxShadow: "inset 0 0 0 1px #0071B1" },
    rest: { backgroundColor: "", color: "", boxShadow: "" }
  };
  var label = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
  function initWorldModel() {
    const pg = $(".home-world_network");
    const cv = canvasIn(pg, "home-world_canvas");
    if (!pg) return;
    if (!ON("worldModel")) return infoOnly(pg);
    if (!cv) return;
    cv.setAttribute("aria-hidden", "true");
    pg.style.backgroundImage = "none";
    const phone = matchMedia("(max-width:767px)");
    const chips = $$(".home-world_chip", pg);
    const tagEls = TAGS.map(([s]) => chips.find((c) => label(c) === s)).filter(Boolean);
    tagEls.forEach((el) => {
      el.__k = label(el);
      el.__s = {};
      el.setAttribute("role", "button");
      el.setAttribute("aria-haspopup", "dialog");
      Object.assign(el.style, { right: "auto", bottom: "auto", margin: "0", zIndex: "2", transform: "translate(-50%,-140%)" });
    });
    const shown = () => tagEls.filter((t) => t.offsetParent !== null);
    function paint(el) {
      const s = el.__s;
      Object.assign(el.style, LOOK[s.open ? "open" : s.on ? "on" : s.hit ? "hit" : "rest"]);
    }
    function state(el, k, v) {
      el.__s[k] = v;
      paint(el);
    }
    const wm = Net(cv, {
      seed: 21,
      spacing: 112,
      speed: SPEED,
      fade: (y, H) => clamp2(Math.min(y, H - y) / (H * 0.14)),
      onBuild: (ns, W, H) => {
        tagEls.forEach((el) => {
          const t = TAGS.find((t2) => t2[0] === el.__k), pp = phone.matches && TAGS_PHONE[el.__k];
          const n = nearestIn(ns, W * (pp ? pp[0] : t[1]), H * (pp ? pp[1] : t[2]));
          el.style.left = n.x + "px";
          el.style.top = n.y + "px";
          el.__n = n;
        });
      }
    });
    function nearestIn(ns, x, y) {
      let b = ns[0], bd = 1e12;
      for (const n of ns) {
        const d = (n.x - x) ** 2 + (n.y - y) ** 2;
        if (d < bd) {
          bd = d;
          b = n;
        }
      }
      return b;
    }
    let tms = [];
    function hit(t, on) {
      state(t, "hit", on);
      const a = $(".home-world_affected", t);
      if (a) a.style.opacity = on ? "1" : "";
      if (on && !RM) play(t, [{ boxShadow: "inset 0 0 0 1px #0071B1, 0 0 0 0 rgba(109,194,242,.6)" }, { boxShadow: "inset 0 0 0 1px #0071B1, 0 0 0 16px rgba(109,194,242,0)" }], { duration: 1100, easing: "ease-out", fill: "none" });
    }
    function affect(b) {
      tms.forEach(clearTimeout);
      tms = [];
      tagEls.forEach((t) => hit(t, false));
      const x0 = parseFloat(b.style.left), y0 = parseFloat(b.style.top);
      shown().forEach((t) => {
        if (t === b) return;
        const d = Math.hypot(parseFloat(t.style.left) - x0, parseFloat(t.style.top) - y0), ms = RM ? 0 : d / SPEED * 1e3;
        tms.push(setTimeout(() => hit(t, true), ms));
        tms.push(setTimeout(() => hit(t, false), ms + 2200));
      });
    }
    function wave(el) {
      tagEls.forEach((e) => state(e, "on", e === el));
      if (el.__n) wm.ripple(el.__n.x, el.__n.y, 6);
      affect(el);
    }
    let wmVis = false, nextAt = performance.now() + 1200, idx = -1, autoOpen = null, lastScroll = 0;
    addEventListener("scroll", () => {
      lastScroll = performance.now();
    }, { passive: true });
    const winOpts = { wide: true, width: 520, align: "center", step: 450 };
    function tap(el) {
      if (autoOpen) {
        autoOpen = null;
        closeWindow();
      }
      wave(el);
      idx = shown().indexOf(el);
      nextAt = performance.now() + AUTO_MS;
      state(el, "open", true);
      openWindow(el, { t: el.__k, p: INFO[el.__k] || "" }, Object.assign({ onClose: (t) => state(t, "open", false) }, winOpts));
    }
    tagEls.forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        tap(el);
      });
      keyable(el, () => tap(el));
    });
    visible(pg, (v) => {
      wmVis = v;
      wm.run(v);
      if (v) nextAt = Math.max(nextAt, performance.now() + 600);
    });
    setInterval(() => {
      if (!wmVis || document.hidden || RM || performance.now() < nextAt) return;
      if (tagEls.some((e) => e.__s.open && e !== autoOpen)) {
        nextAt = performance.now() + AUTO_MS;
        return;
      }
      const list = shown();
      if (!list.length) return;
      idx = (idx + 1) % list.length;
      const el = list[idx];
      if (el.__n) wave(el);
      const r = el.getBoundingClientRect(), now = performance.now();
      if (now - lastScroll > 700 && r.top > 70 && r.bottom < innerHeight - 70) {
        autoOpen = el;
        state(el, "open", true);
        openWindow(el, { t: el.__k, p: INFO[el.__k] || "" }, Object.assign({ onClose: (t) => {
          state(t, "open", false);
          if (autoOpen === t) autoOpen = null;
        } }, winOpts));
        nextAt = now + AUTO_POP_MS;
      } else {
        if (autoOpen) closeWindow();
        nextAt = now + AUTO_MS;
      }
    }, 200);
    wm.build();
    addEventListener("resize", debounce2(() => wm.build()));
    phone.addEventListener("change", () => wm.build());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => wm.build());
  }
  function infoOnly(pg) {
    $$(".home-world_chip", pg).forEach((el) => {
      const k = label(el);
      if (!INFO[k]) return;
      el.setAttribute("role", "button");
      el.setAttribute("aria-haspopup", "dialog");
      if (!el.hasAttribute("tabindex")) el.tabIndex = 0;
      el.style.cursor = "pointer";
      const look = (on) => Object.assign(el.style, LOOK[on ? "open" : "rest"]);
      const open = (e) => {
        if (e) e.stopPropagation();
        look(true);
        openWindow(el, { t: k, p: INFO[k] }, { wide: true, width: 520, align: "center", step: 450, onClose: () => look(false) });
      };
      el.addEventListener("click", open);
      keyable(el, open);
    });
  }

  // src/sections/about-network.js
  function initAboutNetwork() {
    const host0 = document.querySelector(".section_about-hero");
    if (!host0) return;
    const c = canvasIn(host0, "about-hero_canvas");
    if (!c) return;
    c.setAttribute("aria-hidden", "true");
    lift(host0);
    host0.style.backgroundImage = "linear-gradient(#05131C 0%,#073554 22%,#0071B1 46%,#3E9FD8 58%,#9CD3F1 65%,#F4D3B6 66.2%,#E8EEF0 70%,#F3F2EE 100%)";
    const host = host0, x = c.getContext("2d");
    let W = 0, H = 0, dpr = 1, N = [], E = [], P2 = [], on = false, raf = 0, seed2 = 7;
    const rnd2 = () => (seed2 = seed2 * 16807 % 2147483647) / 2147483647;
    function build() {
      const r = host.getBoundingClientRect();
      W = r.width;
      H = r.height;
      if (!W || !H) return;
      dpr = Math.min(2, devicePixelRatio || 1);
      c.width = W * dpr;
      c.height = H * dpr;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed2 = 7;
      N = [];
      const cols = W < 700 ? 22 : 34, rows = 26;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const z = 1.4 + j * 1, X = (i / (cols - 1) - 0.5) * 34 + (rnd2() - 0.5) * 0.8;
        N.push({ X, z: z + (rnd2() - 0.5) * 0.5, hub: rnd2() < 0.05 });
      }
      E = [];
      N.forEach((a, i) => {
        const near = N.map((b, k) => [k, Math.hypot(a.X - b.X, a.z - b.z)]).filter((q) => q[0] !== i && q[1] < 1.7).sort((p, q) => p[1] - q[1]).slice(0, 4);
        near.forEach(([k]) => {
          if (k > i && rnd2() < 0.72) E.push([i, k]);
        });
      });
      P2 = [];
      for (let k = 0; k < (W < 700 ? 8 : 16); k++) P2.push({ e: rnd2() * E.length | 0, t: rnd2(), v: 25e-4 + rnd2() * 3e-3 });
      draw(performance.now());
    }
    function pr(n) {
      const hy = H * 0.66, f = H * 0.95, cam = (H * 1.08 - hy) / f;
      return [W / 2 + n.X * W * 0.06 / n.z, hy + cam * f / n.z];
    }
    function draw() {
      x.clearRect(0, 0, W, H);
      const hy = H * 0.66;
      const g = x.createLinearGradient(0, hy - H * 0.06, 0, hy + H * 0.04);
      g.addColorStop(0, "rgba(242,191,149,0)");
      g.addColorStop(0.6, "rgba(242,191,149,.45)");
      g.addColorStop(1, "rgba(242,191,149,0)");
      x.fillStyle = g;
      x.fillRect(0, hy - H * 0.06, W, H * 0.1);
      const Q = N.map(pr), A = N.map((n) => Math.max(0, Math.min(1, (27.5 - n.z) / 13)) * 0.95);
      x.lineWidth = 1;
      E.forEach(([i, k]) => {
        const a = Math.min(A[i], A[k]);
        if (a <= 0.02) return;
        x.strokeStyle = "rgba(0,113,177," + (a * 0.5).toFixed(3) + ")";
        x.beginPath();
        x.moveTo(Q[i][0], Q[i][1]);
        x.lineTo(Q[k][0], Q[k][1]);
        x.stroke();
      });
      N.forEach((n, i) => {
        const a = A[i];
        if (a <= 0.02) return;
        const r = Math.max(0.6, 3.2 / Math.sqrt(n.z));
        x.fillStyle = n.hub ? "rgba(242,191,149," + a + ")" : "rgba(0,92,150," + (a * 0.85).toFixed(3) + ")";
        x.beginPath();
        x.arc(Q[i][0], Q[i][1], n.hub ? r * 1.6 : r, 0, 6.283);
        x.fill();
        if (n.hub && a > 0.3) {
          x.fillStyle = "rgba(242,191,149," + (a * 0.18).toFixed(3) + ")";
          x.beginPath();
          x.arc(Q[i][0], Q[i][1], r * 5, 0, 6.283);
          x.fill();
        }
      });
      P2.forEach((p) => {
        const [i, k] = E[p.e] || [0, 0], a = Math.min(A[i], A[k]);
        if (a < 0.1) return;
        const X = Q[i][0] + (Q[k][0] - Q[i][0]) * p.t, Y = Q[i][1] + (Q[k][1] - Q[i][1]) * p.t;
        x.fillStyle = "rgba(240,150,90," + Math.min(1, a * 1.2).toFixed(3) + ")";
        x.beginPath();
        x.arc(X, Y, Math.max(1.4, 2.6 * a), 0, 6.283);
        x.fill();
      });
    }
    function loop(t) {
      raf = 0;
      if (!on) return;
      P2.forEach((p) => {
        p.t += p.v;
        if (p.t >= 1) {
          p.t = 0;
          const k = E[p.e][1], nx = E.map((e, j) => [e, j]).filter(([e]) => e[0] === k || e[1] === k);
          if (nx.length) {
            const [e, j] = nx[rnd2() * nx.length | 0];
            p.e = j;
            if (e[1] === k) {
              E[j] = [e[1], e[0]];
            }
          } else p.e = rnd2() * E.length | 0;
        }
      });
      draw(t);
      raf = requestAnimationFrame(loop);
    }
    new ResizeObserver(() => build()).observe(host);
    new IntersectionObserver((es) => {
      on = es[0].isIntersecting && !RM;
      if (on && !raf) raf = requestAnimationFrame(loop);
    }).observe(host);
  }

  // src/sections/footer-dots.js
  function initFooterDots() {
    const foot = $(".footer_component");
    const dc = canvasIn(foot, "footer_dots");
    if (!dc) return;
    dc.setAttribute("aria-hidden", "true");
    lift(foot);
    const mq = matchMedia("(max-width:767px)");
    const bg = () => {
      foot.style.backgroundImage = mq.matches ? "linear-gradient(#F3F2EE 0,#F2BF95 14%,#E6D5B7 38%,#6DC2F2 68%,#0071B1 100%)" : "linear-gradient(#F3F2EE 0,#F2BF95 18%,#E6D5B7 34%,#6DC2F2 54%,#0071B1 84%)";
    };
    bg();
    mq.addEventListener("change", bg);
    let df, fOn = false, fLast = 0;
    const buildDots = () => {
      df = fit(dc);
    };
    buildDots();
    addEventListener("resize", debounce2(buildDots));
    function drawDots(t) {
      const { x, w: W, h: H } = df;
      x.clearRect(0, 0, W, H);
      const s = 22, T2 = RM ? 0 : t / 5200;
      for (let y = 0, j = 0; y < H + s; y += s * 0.866, j++) {
        const fade = clamp2((y / H - 0.35) / 0.4);
        if (fade <= 0) continue;
        for (let i = 0; i < W / s + 2; i++) {
          const X = (i + 0.5 * (j % 2)) * s;
          let v = 0.5 + 0.27 * Math.sin(X / 190 + T2) + 0.23 * Math.sin(y / 130 - T2 * 1.3 + X / 420);
          v = Math.max(0, (v - 0.42) * 1.75);
          x.fillStyle = "rgba(255,255,255," + (clamp2(0.05 + v * 0.2) * fade).toFixed(3) + ")";
          x.beginPath();
          x.arc(X, y, 0.9 + v * 3.6, 0, 6.283);
          x.fill();
        }
      }
    }
    const WAVE_AT = 0.2, WAVE_S = 1.7, BACK_GAP = 0.15, BACK_S = 1.5, BACK_STRENGTH = 0.45;
    const img = $(".footer_wordmark", foot), wc = canvasIn(foot, "footer_wordmark-canvas");
    const logoOn = ON("footerLogo") && img && wc;
    let wx = null, ww = 0, wh = 0, off = null, ox = null, ready = false, state = "rest", t0 = 0;
    const pic = new Image();
    pic.crossOrigin = "anonymous";
    function buildWord() {
      if (!ready) return;
      ww = wc.getBoundingClientRect().width;
      if (!ww) return;
      wh = ww * pic.naturalHeight / pic.naturalWidth;
      wc.style.height = wh + "px";
      wc.width = ww * DPR;
      wc.height = wh * DPR;
      wx = wc.getContext("2d");
      wx.setTransform(DPR, 0, 0, DPR, 0, 0);
      off = off || document.createElement("canvas");
      off.width = wc.width;
      off.height = wc.height;
      ox = off.getContext("2d");
      ox.setTransform(DPR, 0, 0, DPR, 0, 0);
      drawWord(performance.now());
    }
    function band(o, w, dir, strength) {
      const sm2 = w < 0.5 ? 2 * w * w : 1 - Math.pow(-2 * w + 2, 2) / 2, pos = dir > 0 ? sm2 : 1 - sm2, c = ww * (-0.25 + 1.5 * pos), bw = ww * (dir > 0 ? 0.16 : 0.12);
      const cream = rgba(mix([255, 255, 255], [230, 213, 183], strength)), peach = rgba(mix([255, 255, 255], [242, 191, 149], strength));
      const g = o.createLinearGradient(0, 0, ww, 0), at = (x) => clamp2(x / ww);
      g.addColorStop(0, "#fff");
      g.addColorStop(at(c - bw), "#fff");
      g.addColorStop(at(c - bw * 0.4), cream);
      g.addColorStop(at(c), peach);
      g.addColorStop(at(c + bw * 0.4), cream);
      g.addColorStop(at(c + bw), "#fff");
      g.addColorStop(1, "#fff");
      o.globalCompositeOperation = "source-in";
      o.fillStyle = g;
      o.fillRect(0, 0, ww, wh);
    }
    function drawWord(t) {
      if (!wx) return;
      wx.clearRect(0, 0, ww, wh);
      if (state === "rest") {
        wx.drawImage(pic, 0, 0, ww, wh);
        return;
      }
      const e = (t - t0) / 1e3, o = ox;
      o.globalCompositeOperation = "source-over";
      o.clearRect(0, 0, ww, wh);
      o.drawImage(pic, 0, 0, ww, wh);
      const w1 = (e - WAVE_AT) / WAVE_S, w2 = (e - WAVE_AT - WAVE_S - BACK_GAP) / BACK_S;
      if (w1 > 0 && w1 < 1) band(o, w1, 1, 1);
      else if (w2 > 0 && w2 < 1) band(o, w2, -1, BACK_STRENGTH);
      wx.save();
      wx.setTransform(1, 0, 0, 1, 0, 0);
      wx.drawImage(off, 0, 0);
      wx.restore();
    }
    function flowCheck() {
      const r = wc.getBoundingClientRect();
      if (state === "rest" && r.bottom < innerHeight - 10 && !RM) {
        state = "shown";
        t0 = performance.now();
      } else if (state === "shown" && r.top > innerHeight) state = "rest";
    }
    if (logoOn) {
      wc.setAttribute("role", "img");
      wc.setAttribute("aria-label", img.alt || "Arborum");
      pic.onload = () => {
        ready = true;
        img.style.display = "none";
        wc.style.display = "block";
        buildWord();
        flowCheck();
      };
      pic.src = img.currentSrc || img.src;
      addEventListener("resize", debounce2(buildWord));
      addEventListener("scroll", flowCheck, { passive: true });
    }
    visible(foot, (v) => {
      fOn = v;
    });
    (function loop(t) {
      if (fOn && df) {
        if (logoOn) drawWord(t);
        if (t - fLast > 33) {
          drawDots(t);
          fLast = t;
        }
      }
      requestAnimationFrame(loop);
    })(0);
  }

  // src/index.js
  function start() {
    if (window.__arborumAnim) return;
    window.__arborumAnim = "1.4.18";
    const parts = [
      ["smooth scroll", initSmoothScroll],
      ["pop-ups", initPopups],
      ["buttons", initButtons],
      ["reveal", initReveal],
      ["header", initHeader],
      ["hero entrance", initHeroTitle],
      ["hero globe", initHeroGlobe],
      ["statement + energy", initStatementEnergy],
      ["one world model", initOneWorldModel],
      ["use cases", initUseCases],
      ["beyond energy", initBeyondEnergy],
      ["world model", initWorldModel],
      ["about network", initAboutNetwork],
      ["footer", initFooterDots]
    ];
    parts.forEach(([name, fn]) => {
      try {
        fn();
      } catch (e) {
        console.error("[arborum] " + name + ":", e);
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
