// script.js
console.log("Script v8 Loaded. Loader Fix + Focus Styles + Final Refresh...");

// --- Global State & Helpers ---
let isMobile = window.innerWidth < 768;
const lerp = (start, end, amount) => (1 - amount) * start + amount * end;
const clamp = (val, min, max) => Math.max(min, Math.min(val, max));
let rafId = null; // For cursor animation frame

// --- Utility Function ---
function showFatalError(message, forceVisible = true) {
    console.error("FATAL ERROR:", message);
    if (forceVisible) {
        const l = document.querySelector('.loader');
        if (l) l.style.display = 'none'; // Hide loader forcefully
        document.body.classList.remove('loading', 'no-scroll');
        document.body.classList.add('page-loaded'); // Force body visible
        document.body.style.opacity = '1'; // Ensure opacity is set
        document.body.style.cursor = 'auto'; // Restore cursor
        document.querySelectorAll('.cursor').forEach(el => el.style.display = 'none');
        console.warn("Forced page visibility due to error.");
    }
}

// --- Register GSAP Plugins ---
try {
    if (typeof gsap === 'undefined') throw new Error("GSAP core not loaded");
    if (typeof ScrollTrigger === 'undefined') throw new Error("ScrollTrigger plugin not loaded");
    if (typeof ScrollToPlugin === 'undefined') throw new Error("ScrollToPlugin not loaded");
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    gsap.config({ nullTargetWarn: false }); // Suppress warnings for null targets
    console.log("GSAP Plugins Registered.");
} catch (error) {
    showFatalError(error.message);
    throw error; // Re-throw to stop script execution if critical libs missing
}

// --- Custom Cursor ---
class EnhancedCursor {
     constructor() {
        this.cursor = document.querySelector('.cursor');
        this.dot = document.querySelector('.cursor-dot');
        this.outline = document.querySelector('.cursor-outline');
        this.pos = { x: 0, y: 0 };
        this.target = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.lastPos = { x: 0, y: 0 };
        this.rotation = 0;
        this.outlineScale = 0;
        this.outlineOpacity = 0; // Start transparent
        this.rafId = null; // Separate rafId for cursor

        if (!this.cursor || !this.dot || !this.outline || isMobile) {
            console.warn("Enhanced cursor disabled (Mobile or elements missing).");
            if(this.cursor) this.cursor.style.display = 'none';
            document.body.style.cursor = 'auto'; // Ensure default cursor if custom one fails
            return;
        }

        console.log("Initializing Enhanced Cursor");
        try {
            document.body.style.cursor = 'none'; // Hide default cursor
            document.body.classList.add('cursor-initialized'); // Signal CSS
            this.setupEventListeners();
            this.update(); // Start animation loop
        } catch (error) {
            console.error("Error initializing Enhanced Cursor:", error);
            if(this.cursor) this.cursor.style.display = 'none';
            document.body.style.cursor = 'auto';
        }
    }
    setupEventListeners() {
        window.addEventListener('mousemove', e => {
            this.target.x = e.clientX;
            this.target.y = e.clientY;
        });
        document.body.addEventListener('mouseenter', () => this.setVisible(true));
        document.body.addEventListener('mouseleave', () => this.setVisible(false));

        // Links, buttons, interactive elements
        document.querySelectorAll('a, button, .magnetic, .nav-trigger, input, textarea, .card-v2-link, .contact-button-v4').forEach(el => {
            el.addEventListener('mouseenter', () => this.setCursorState('pointer'));
            el.addEventListener('mouseleave', () => this.setCursorState('default'));
        });
        // Elements to indicate hover possibility
        document.querySelectorAll('.project-card-v2').forEach(el => {
             el.addEventListener('mouseenter', () => this.setCursorState('hover'));
             el.addEventListener('mouseleave', () => this.setCursorState('default'));
        });
        // Text elements
        document.querySelectorAll('p, h1, h2, h3, span, strong, .skill-list, .card-v2-desc').forEach(el => {
             // Avoid setting 'text' state on elements that contain interactive children like links
             if (!el.querySelector('a, button')) {
                 el.addEventListener('mouseenter', (e) => {
                     // Prevent state change if hovering over a child link/button inside the text
                     if (e.target === el) {
                         this.setCursorState('text');
                     }
                 });
                 el.addEventListener('mouseleave', (e) => {
                      if (e.target === el) {
                          this.setCursorState('default');
                      }
                 });
            }
        });
    }
    update() {
        // Lerp position
        this.pos.x = lerp(this.pos.x, this.target.x, 0.1);
        this.pos.y = lerp(this.pos.y, this.target.y, 0.1);

        // Calculate velocity and angle for rotation
        this.velocity.x = this.pos.x - this.lastPos.x;
        this.velocity.y = this.pos.y - this.lastPos.y;
        this.lastPos.x = this.pos.x;
        this.lastPos.y = this.pos.y;
        const angle = Math.atan2(this.velocity.y, this.velocity.x) * (180 / Math.PI);
        this.rotation = lerp(this.rotation, angle, 0.15); // Slightly faster rotation lerp

        // Apply transformations
        this.cursor.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;
        // Update outline scale/rotation separately if needed, or keep as is
        this.outline.style.transform = `translate(-50%, -50%) scale(${this.outlineScale}) rotate(${this.rotation}deg)`; // Added translate back
        this.outline.style.opacity = this.outlineOpacity;

        this.rafId = requestAnimationFrame(this.update.bind(this));
    }
    setVisible(visible) {
        // Animate outline visibility
        gsap.to(this, {
            duration: 0.4,
            outlineScale: visible ? 1 : 0,
            outlineOpacity: visible ? 0.5 : 0, // Adjust base opacity if needed
            ease: "power2.out"
        });
    }
    setCursorState(state) {
        // Toggle body classes to control cursor appearance via CSS
        document.body.classList.remove('cursor-hover', 'cursor-pointer', 'cursor-text');
        if (state === 'hover') document.body.classList.add('cursor-hover');
        else if (state === 'pointer') document.body.classList.add('cursor-pointer');
        else if (state === 'text') document.body.classList.add('cursor-text');
        // Default state has no specific class
    }
     // Method to stop the animation loop if needed
     destroy() {
         if (this.rafId) {
             cancelAnimationFrame(this.rafId);
             this.rafId = null;
         }
         // Remove event listeners if necessary (though typically not needed if object is just dereferenced)
         console.log("Cursor destroyed.");
     }
}

// --- Refined Interactive Canvas Background ---
class RefinedCanvas { /* Keep Same as v5 */ constructor(id) { this.c = document.getElementById(id); if (!this.c) {console.warn("Canvas not found:",id);return;} try { this.x=this.c.getContext('2d'); if(!this.x) throw new Error("No 2D Ctx"); this.m={x:undefined,y:undefined,r:100,v:{x:0,y:0},lx:0,ly:0}; this.p=[]; this.h=210; this.ch=this.h; console.log("Init Canvas"); this.rC(); this.cP(); this.sEL(); this.a(); } catch(e) {console.error("Err Canvas:",e);} } rC() { const dpr = window.devicePixelRatio || 1; this.c.width = window.innerWidth * dpr; this.c.height = window.innerHeight * dpr; this.c.style.width = `${window.innerWidth}px`; this.c.style.height = `${window.innerHeight}px`; if(this.x) this.x.scale(dpr, dpr); else console.warn("No ctx resize."); } sEL() { window.addEventListener('resize',()=>{this.rC();this.p=[];this.cP();}); window.addEventListener('mousemove',(e)=>{const cX=e.clientX;const cY=e.clientY; this.m.v.x=cX-(this.m.lx||cX);this.m.v.y=cY-(this.m.ly||cY); this.m.x=cX;this.m.y=cY;this.m.lx=cX;this.m.ly=cY;}); window.addEventListener('mouseout',()=>{this.m.x=undefined;this.m.y=undefined;this.m.v={x:0,y:0};}); } cP() { const dF=20000; const pC=Math.max(50, Math.floor((this.c.width/window.devicePixelRatio*this.c.height/window.devicePixelRatio)/dF)); this.p=[]; for(let i=0; i<pC; i++){this.p.push(new RefinedParticle(this.c.width/window.devicePixelRatio, this.c.height/window.devicePixelRatio));} } hP() { const cD=100; const mS=Math.sqrt(this.m.v.x**2+this.m.v.y**2); const tH=this.h+clamp(mS*1.5,-30,30); this.ch=lerp(this.ch,tH,0.05); for(let i=0;i<this.p.length; i++){ this.p[i].update(this.m); this.p[i].draw(this.x,this.ch); for(let j=i+1;j<this.p.length; j++){ const dx=this.p[i].x-this.p[j].x; const dy=this.p[i].y-this.p[j].y; const d=Math.sqrt(dx*dx+dy*dy); if(d<cD){ this.x.beginPath(); const o=Math.max(0,1-(d/cD))*0.5; this.x.strokeStyle=`hsla(${this.ch}, 80%, 70%, ${o})`; this.x.lineWidth=0.3; this.x.moveTo(this.p[i].x,this.p[i].y); this.x.lineTo(this.p[j].x,this.p[j].y); this.x.stroke(); this.x.closePath(); }} if(this.p[i].isOutOfBounds()){ this.p[i]=new RefinedParticle(this.c.width/window.devicePixelRatio,this.c.height/window.devicePixelRatio);}}} a(){if(!this.x)return; this.x.clearRect(0,0,this.c.width/window.devicePixelRatio,this.c.height/window.devicePixelRatio); this.hP(); requestAnimationFrame(this.a.bind(this));} }
class RefinedParticle { constructor(cw, ch) { this.cw = cw; this.ch = ch; if (Math.random() > 0.5) { this.x = Math.random() < 0.5 ? 0 : cw; this.y = Math.random() * ch; } else { this.x = Math.random() * cw; this.y = Math.random() < 0.5 ? 0 : ch; } this.size = Math.random() * 1.8 + 0.6; this.baseSize = this.size; this.sx = (Math.random() - 0.5) * 0.3; this.sy = (Math.random() - 0.5) * 0.3; this.life = 1; } update(m) { this.x += this.sx; this.y += this.sy; if (m.x !== undefined && m.y !== undefined) { const dx = this.x - m.x; const dy = this.y - m.y; const d = Math.max(1, Math.sqrt(dx*dx + dy*dy)); const md = m.r; /* Use mouse radius 'r' from main class */ if (d < md) { const f = (md - d) / md; const ps = 2; this.x += (dx / d) * f * ps; this.y += (dy / d) * f * ps; this.size = Math.min(this.baseSize * 1.5, this.size + f * 0.1); } else { this.size = lerp(this.size, this.baseSize, 0.05); } } else { this.size = lerp(this.size, this.baseSize, 0.05); } } draw(c, h) { const o = Math.min(1, this.size * 0.5); if (o > 0.05 && this.size > 0.1) { c.fillStyle = `hsla(${h}, 80%, 75%, ${o})`; c.beginPath(); c.arc(this.x, this.y, this.size, 0, Math.PI * 2); c.fill(); } } isOutOfBounds() { const p = 50; return this.x < -p || this.x > this.cw + p || this.y < -p || this.y > this.ch + p || this.life <= 0; } }


// --- Refined Magnetic Effect Class ---
class RefinedMagneticFx { /* Keep Same as v5 */ constructor(el) { this.el = el; if (!this.el || isMobile) return; this.s = parseFloat(el.dataset.strength) || 25; this.d = parseFloat(el.dataset.distortion) || 0; this.p = { x: 0, y: 0 }; this.t = { x: 0, y: 0 }; this.h = false; this.r = null; try { this.setup(); } catch (e) { console.error("Error MagneticFx setup:", e, el); } } setup() { this.el.addEventListener('mouseenter', () => { this.h = true; if (!this.r) this.upd(); }); this.el.addEventListener('mouseleave', () => { this.h = false; this.t.x = 0; this.t.y = 0; /* No need to call upd() here, the loop checks this.h */ }); this.el.addEventListener('mousemove', (e) => { if (!this.h) return; const b = this.el.getBoundingClientRect(); const mX = e.clientX; const mY = e.clientY; const cX = b.left + b.width / 2; const cY = b.top + b.height / 2; this.t.x = clamp((mX - cX) * 0.4, -this.s, this.s); /* Adjusted multiplier */ this.t.y = clamp((mY - cY) * 0.4, -this.s, this.s); }); } upd() { this.p.x = lerp(this.p.x, this.t.x, 0.08); this.p.y = lerp(this.p.y, this.t.y, 0.08); let T = `translate(${this.p.x}px, ${this.p.y}px)`; if (this.d > 0) { const sX = clamp(this.p.x*this.d*0.2, -5, 5); const sY = clamp(this.p.y*this.d*0.2, -5, 5); T += ` skew(${sX}deg, ${sY}deg)`; } this.el.style.transform = T; if (!this.h && Math.abs(this.p.x)<0.1 && Math.abs(this.p.y)<0.1) { this.el.style.transform = 'none'; // Reset transform when idle
            cancelAnimationFrame(this.r); this.r = null; } else { this.r = requestAnimationFrame(this.upd.bind(this)); } } }


// --- Enhanced Core Animation Logic ---
function initEnhancedAnimations() {
    console.log("Initializing Enhanced Animations v8...");

    try {
        // --- Splitting JS ---
        console.log("Attempting Splitting.js initialization...");
        try {
            if (typeof Splitting === 'function') {
                const targets = document.querySelectorAll('[data-splitting]');
                if (targets.length > 0) {
                    Splitting({ target: targets, by: 'chars' });
                    console.log(`Splitting.js finished on ${targets.length} targets.`);
                } else {
                     console.log("Splitting.js: No targets found with [data-splitting].");
                }
            } else {
                console.warn("Splitting.js library not found or not loaded.");
            }
        } catch (e) {
            console.error("Splitting.js execution failed:", e);
            // Don't necessarily show fatal error, animations might degrade gracefully
        }
        console.log("Splitting.js attempt complete.");


        // --- Loader Animation - Grid Loader Logic (FIXED VISIBILITY) ---
        const loader = document.querySelector('.loader');
        const loaderGridItems = document.querySelectorAll('.loader-grid div');
        const loaderText = document.querySelector('.loader-text-v2'); // Ensure this uses data-splitting in HTML
        const loaderTextChars = loaderText ? loaderText.querySelectorAll('.char') : [];

        // Ensure elements exist before creating timeline
        if (loader && loaderGridItems.length === 9 && loaderText && loaderTextChars.length > 0) {
            console.log("LOADER: Found necessary elements. Defining v5 (grid) timeline.");

            // Set initial states EXPLICITLY with GSAP for reliability
            // Ensure loader itself is visible before starting
            gsap.set(loader, { opacity: 1, visibility: 'visible', display: 'grid'});
            gsap.set(loaderGridItems, { scale: 0, opacity: 0 }); // Start grid items hidden
            gsap.set(loaderText, { opacity: 1 }); // Container visible
            gsap.set(loaderTextChars, { y: "100%", opacity: 0 }); // Chars initially hidden below

            const loaderTl = gsap.timeline({
                delay: 0.3, // Small delay before starting
                onStart: () => console.log("LOADER: Timeline started."),
                onComplete: () => {
                    console.log("LOADER: Timeline complete.");
                    // Smoothly fade out the entire loader
                    gsap.to(loader, {
                        opacity: 0,
                        duration: 0.6,
                        ease: "power1.inOut",
                        onComplete: () => {
                            if (loader) loader.style.display = 'none'; // Hide completely after fade
                            document.body.classList.remove('no-scroll'); // Allow scrolling
                            document.body.classList.add('page-loaded'); // Trigger body fade-in via CSS
                            console.log("LOADER: Fade out complete. Body class 'page-loaded' added.");
                            playEnhancedIntro(); // Start intro animation AFTER loader is GONE
                        }
                    });
                }
            });

            // Loader Animation Sequence
            loaderTl
                .to(loaderGridItems, {
                    scale: 1,
                    opacity: 1,
                    stagger: { each: 0.05, from: "center", grid: "auto" },
                    duration: 0.6,
                    ease: "power2.out"
                }, "start") // Label start
                .to(loaderTextChars, {
                    y: "0%",
                    opacity: 1,
                    stagger: 0.04,
                    duration: 0.5,
                    ease: "power2.out"
                 }, "start+=0.2") // Stagger text reveal slightly after grid starts
                .to({}, { duration: 0.5 }) // Hold briefly
                .to(loaderTextChars, {
                    y: "-100%",
                    opacity: 0,
                    stagger: { each: 0.03, from: "end" }, // Animate out from the end
                    duration: 0.4,
                    ease: "power2.in"
                }, "fadeOut") // Label fadeOut start
                .to(loaderGridItems, {
                    scale: 0,
                    opacity: 0,
                    stagger: { each: 0.04, from: "center", grid: "auto" }, // Reverse stagger
                    duration: 0.5,
                    ease: "power2.in"
                }, "fadeOut+=0.1"); // Stagger grid fade slightly after text starts fading

            console.log("LOADER: Timeline defined and should play automatically.");

        } else { // Fallback if loader elements missing
            console.warn("LOADER: Critical elements missing, cannot run animation. Forcing visibility.", {
                loaderExists: !!loader,
                gridItemsCount: loaderGridItems.length,
                loaderTextExists: !!loaderText,
                loaderTextCharsCount: loaderTextChars.length
            });
            if (loader) loader.style.display = 'none'; // Hide loader immediately
            document.body.classList.remove('no-scroll', 'loading'); // Ensure scrolling and remove loading state
            document.body.classList.add('page-loaded'); // Make body visible NOW
             document.body.style.opacity = '1'; // Force opacity
            playEnhancedIntro(); // Attempt intro anyway
        }


        // --- Enhanced Intro Animation (Hero) ---
        function playEnhancedIntro() {
             console.log("Playing Enhanced Intro Animation");
             // Use a minimal delay to ensure DOM is ready after loader removal
             gsap.delayedCall(0.1, () => {
                const heroTitleWords=document.querySelectorAll('#hero-section .hero-title .word');
                const heroSubtitleChars=document.querySelectorAll('#hero-section .hero-subtitle .char'); // Uses .anim-chars class + splitting
                const heroLinks=document.querySelector('#hero-section .hero-links');
                const scrollPrompt=document.querySelector('.scroll-prompt');
                const tl=gsap.timeline({delay: 0.1}); // Small delay after function call

                 // Animate Hero Title Words/Chars
                heroTitleWords.forEach((word, wordIndex) => {
                    const chars = word.querySelectorAll('.char');
                    if (chars && chars.length > 0) {
                        tl.to(chars, {
                            y: "0%",
                            opacity: 1,
                            rotation: 0,
                            stagger: 0.035,
                            duration: 1.0, // Slightly faster duration
                            ease: "expo.out"
                        }, wordIndex * 0.1); // Stagger word animations slightly
                    } else {
                        console.warn("No chars found for hero title word:", word);
                        // Fallback for non-split words? Maybe animate the word itself
                         tl.fromTo(word, { y: "50%", opacity: 0 }, { y: "0%", opacity: 1, duration: 1.0, ease: "expo.out" }, wordIndex * 0.1);
                    }
                });

                // Animate Hero Subtitle Chars
                if(heroSubtitleChars && heroSubtitleChars.length > 0){
                    tl.to(heroSubtitleChars, {
                        y: 0,
                        opacity: 1,
                        stagger: isMobile ? 0.025 : 0.015, // Adjusted stagger
                        duration: 0.6,
                        ease: "power2.out"
                    }, "-=0.6"); // Overlap slightly with title animation ending
                } else {
                    console.warn("No chars found for hero subtitle. Animating container.");
                    const subtitleContainer = document.querySelector('#hero-section .hero-subtitle');
                    if (subtitleContainer) {
                        tl.fromTo(subtitleContainer, { y: 30, opacity: 0}, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out"}, "-=0.6");
                    }
                }

                // Animate Hero Links
                if(heroLinks){
                    tl.fromTo(heroLinks, {
                        y: 40,
                        opacity: 0
                    }, {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        ease: "power3.out"
                    }, "-=0.4"); // Overlap more
                }

                // Animate Scroll Prompt (Non-Mobile)
                if(scrollPrompt && !isMobile){
                    tl.fromTo(scrollPrompt, {
                        y: 20,
                        opacity: 0
                    }, {
                        y: 0,
                        opacity: 0.7,
                        duration: 1,
                        ease: "power1.inOut"
                    }, "-=0.5"); // Overlap significantly
                }

                 console.log("Intro animation sequence timeline created.");
             });
         }


        // --- Enhanced ScrollTrigger Setup ---
        console.log("Setting up ScrollTriggers...");
        ScrollTrigger.config({ ignoreMobileResize: true });

        // 1. Dynamic Color Change & Nav Active State
        const sections = document.querySelectorAll('.content-section');
        sections.forEach((section) => {
             const bgColor = section.dataset.colorBg || '#08080A'; // Default BG
             const accentRaw = section.dataset.colorAccent || '#F6009B'; // Default Accent

             ScrollTrigger.create({
                 trigger: section,
                 start: "top 40%", // When section top hits 40% from viewport top
                 end: "bottom 60%", // When section bottom hits 60% from viewport top
                 // markers: true, // Uncomment for debugging trigger points
                 onEnter: () => updateTheme(bgColor, accentRaw, section.id),
                 onEnterBack: () => updateTheme(bgColor, accentRaw, section.id),
                 onLeave: () => { /* Optional: Handle leaving transition if needed */ },
                 onLeaveBack: () => {
                     // Find previous section to set its color when scrolling up
                     const prevSection = section.previousElementSibling;
                     if (prevSection && prevSection.matches('.content-section')) {
                        const prevBg = prevSection.dataset.colorBg || '#08080A';
                        const prevAccent = prevSection.dataset.colorAccent || '#F6009B';
                         updateTheme(prevBg, prevAccent, prevSection.id);
                     } else if (!prevSection) { // Handle scrolling back to top (Hero)
                         const heroSection = document.getElementById('hero-section');
                         if (heroSection) {
                             const heroBg = heroSection.dataset.colorBg || '#08080A';
                             const heroAccent = heroSection.dataset.colorAccent || '#F6009B';
                             updateTheme(heroBg, heroAccent, heroSection.id);
                         }
                     }
                 }
             });

            // Function to update colors and nav link
            const updateTheme = (bg, accent, sectionId) => {
                 gsap.to('body', { backgroundColor: bg, duration: 1.0, ease: 'sine.inOut', overwrite: 'auto' });
                 gsap.to(':root', { '--color-accent': accent, duration: 1.0, ease: 'sine.inOut', overwrite: 'auto' });
                 document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                 const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
                 if (activeLink) activeLink.classList.add('active');
                 // console.log(`Theme updated for: ${sectionId}, BG: ${bg}, Accent: ${accent}`);
            };


             // 2. Parallax Effect (Keep Same - Disabled on Mobile)
             if (!isMobile) {
                 section.querySelectorAll('[data-speed]').forEach(el => {
                     const speedFactor = parseFloat(el.dataset.speed) || 1.0;
                     // Adjust multiplier for desired parallax intensity
                     const movement = -(speedFactor - 1) * 80; // Example: speed 1.1 -> -8, speed 0.9 -> +8
                     gsap.to(el, {
                         yPercent: movement,
                         ease: "none",
                         scrollTrigger: {
                             trigger: section,
                             start: "top bottom", // Start when section top enters viewport bottom
                             end: "bottom top", // End when section bottom leaves viewport top
                             scrub: 1.5 // Smooth scrubbing effect
                         }
                     });
                 });
             }

             // 3. Generic Element Animations (Stagger children if needed)
             const staggerVal = isMobile ? 0.15 : 0.1;
             section.querySelectorAll('.anim-fade-up').forEach((el, idx) => {
                 gsap.fromTo(el, {y: 60, opacity: 0}, {
                     y: 0,
                     opacity: 1,
                     duration: isMobile ? 0.9 : 1.1,
                     ease: 'power3.out',
                     delay: el.closest('.skills-layout') ? idx * staggerVal : 0, // Stagger only within skill items
                     scrollTrigger: {
                         trigger: el,
                         start: "top 88%", // Trigger slightly later
                         toggleActions: "play none none reverse"
                         // markers: true // Debug marker
                     }
                 });
             });
             // Example for .anim-scale-up if used
             section.querySelectorAll('.anim-scale-up').forEach((el, idx) => {
                 gsap.fromTo(el, { scale: 0.7, opacity: 0 }, {
                     scale: 1,
                     opacity: 1,
                     duration: 1,
                     ease: 'power3.out',
                     delay: idx * staggerVal, // General stagger for scale elements
                     scrollTrigger: {
                         trigger: el,
                         start: "top 90%",
                         toggleActions: "play none none reverse"
                     }
                 });
             });


             // 4. Section Title Animation (Using Splitting Chars)
             const title = section.querySelector('.section-title[data-splitting]');
             if (title) {
                 const chars = title.querySelectorAll('.char');
                 if (chars && chars.length > 0) {
                     gsap.fromTo(chars,
                         { y: '100%', rotation: 5, opacity: 0 },
                         {
                             y: '0%',
                             rotation: 0,
                             opacity: 1,
                             stagger: isMobile ? 0.035 : 0.025,
                             duration: 0.8, // Slightly faster
                             ease: 'power3.out',
                             scrollTrigger: {
                                 trigger: title,
                                 start: "top 80%", // Trigger earlier
                                 toggleActions: "play none none reverse"
                             }
                         });
                 } else {
                    // Fallback if splitting failed? Animate the title container
                     gsap.fromTo(title, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: title, start: "top 80%", toggleActions: "play none none reverse" } });
                     console.warn("Section title found but no chars from Splitting:", title);
                 }
             }

             // 5. SVG Graphic Animation (Keep Same)
             const graphic = section.querySelector('.section-graphic path');
             if(graphic){
                 gsap.fromTo(graphic, { strokeDashoffset: 200, opacity: 0 }, {
                     strokeDashoffset: 0,
                     opacity: 1,
                     duration: 1.5,
                     ease: 'power2.inOut',
                     scrollTrigger:{
                         trigger: graphic,
                         start: "top 95%", // Trigger very late
                         toggleActions: "play none none reverse"
                     }
                 });
            }
        });
        console.log("Finished setting up section ScrollTriggers.");

        // 6. Horizontal Scroll for Projects (Desktop Only)
        const projectsWrapper = document.querySelector('.projects-horizontal-wrapper');
        const projectsTrack = document.querySelector('.projects-track');

        if (projectsWrapper && projectsTrack && !isMobile) {
            console.log("Setting up horizontal scroll for projects...");
            // Use a timeout to ensure layout is stable after initial render/font loading
            setTimeout(() => {
                ScrollTrigger.refresh(); // Refresh ST before calculations

                let scrollWidth = projectsTrack.scrollWidth - projectsWrapper.offsetWidth;
                console.log(`Horizontal Scroll Calc: TrackScroll=${projectsTrack.scrollWidth}, Wrapper=${projectsWrapper.offsetWidth}, ScrollAmount=${scrollWidth}`);

                if (scrollWidth > 10) { // Only activate if there's significant scroll needed
                   let horizontalScrollTween = gsap.to(projectsTrack, {
                        x: () => -scrollWidth,
                        ease: "none", // Linear movement is crucial for scrub
                        scrollTrigger: {
                            trigger: projectsWrapper,
                            pin: projectsWrapper, // Pin the wrapper element
                            scrub: 1.0, // Adjust scrub smoothness (lower is tighter)
                            start: "center center", // Start scroll when wrapper center hits viewport center
                            end: () => "+=" + scrollWidth, // End after scrolling the calculated width
                            invalidateOnRefresh: true, // Recalculate on resize/refresh
                           // markers: true // Debug markers for horizontal scroll
                        }
                    });
                    console.log("GSAP Horizontal scroll tween created.");

                    // Optional: Animate cards within the horizontal scroll
                    const projectCards = projectsTrack.querySelectorAll('.project-card-v2:not(.placeholder)');
                    projectCards.forEach(card => {
                        gsap.fromTo(card,
                           { scale: 0.9, opacity: 0.7 }, // Start slightly smaller/faded
                           {
                                scale: 1, opacity: 1, ease: 'sine.inOut',
                                scrollTrigger: {
                                    trigger: card,
                                    containerAnimation: horizontalScrollTween, // Link to the horizontal scroll
                                    start: "left 85%", // Animate when card left edge is 85% across container
                                    end: "right 15%", // Finish when card right edge is 15% from container left
                                    scrub: true, // Scrub the card animation too
                                   // markers: true // Debug markers for individual cards
                                }
                           });
                    });

                } else {
                    console.warn("Horizontal scroll not applied: Not enough content width to scroll.");
                    // Ensure track isn't offset if scroll isn't active
                     gsap.set(projectsTrack, { x: 0 });
                }
            }, 150); // Delay calculation slightly

        } else if (isMobile) { // Mobile vertical scroll animation for projects
            console.log("Setting up vertical project scroll animations for mobile.");
             document.querySelectorAll('#projects-section .project-card-v2:not(.placeholder)').forEach((card, idx) => {
                 gsap.fromTo(card,
                    { y: 50, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        ease: 'power3.out',
                        delay: idx * 0.1, // Stagger cards appearing
                        scrollTrigger: {
                            trigger: card,
                            start: "top 85%", // Trigger when card top is 85% from viewport top
                            toggleActions: "play none none reverse"
                            // markers: true // Debug markers
                        }
                    });
             });
        } else {
            console.log("Horizontal scroll setup skipped (likely !projectsWrapper or !projectsTrack).");
        }


        // --- Navigation Toggle & Smooth Scroll ---
        const navTrigger = document.querySelector('.nav-trigger');
        const mainNav = document.querySelector('.main-nav');
        const navLinks = document.querySelectorAll('.main-nav .nav-link');

        if (navTrigger && mainNav && navLinks.length > 0) {
            // Create a reusable timeline for the nav open/close animation
            const navTl = gsap.timeline({ paused: true, reversed: true });
            navTl.set(mainNav, { display: 'flex' }) // Set display before animating opacity
                 .to(mainNav, { opacity: 1, duration: 0.5, ease: 'power2.inOut' })
                 .to(navLinks, { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: 'power3.out' }, "-=0.3"); // Overlap link animation

            navTrigger.addEventListener('click', () => {
                const isActive = document.body.classList.toggle('nav-active');
                document.body.classList.toggle('no-scroll', isActive); // Toggle scroll lock

                if (isActive) { // If just activated (opening)
                    navTl.play();
                } else { // If just deactivated (closing)
                    navTl.reverse().then(() => {
                        // Ensure display: none is set only *after* the reverse animation completes
                         if (!document.body.classList.contains('nav-active')) {
                            mainNav.style.display = 'none';
                        }
                    });
                }
            });

            // Smooth scroll for nav links
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    const targetSection = document.querySelector(targetId);

                    if (targetSection) {
                        // Close the nav first
                        document.body.classList.remove('nav-active', 'no-scroll');
                        navTl.reverse().then(() => {
                           mainNav.style.display = 'none';
                           // Initiate scroll *after* nav is visually closed
                           gsap.to(window, {
                               duration: 1.5,
                               scrollTo: { y: targetSection, offsetY: 0 }, // Scroll to target section top
                               ease: "power3.inOut"
                           });
                        });
                    } else {
                         console.warn(`Scroll target not found for link: ${targetId}`);
                         // Optionally, still close the nav
                         document.body.classList.remove('nav-active', 'no-scroll');
                         navTl.reverse().then(() => mainNav.style.display = 'none');
                    }
                });
            });
            console.log("Navigation toggle and smooth scroll initialized.");
        } else {
            console.warn("Navigation elements missing - nav trigger, main nav, or links.");
        }


        // --- Set current year in footer ---
        const yearSpan = document.querySelector('.footer-note #year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        } else {
             console.warn("Footer year span not found.");
        }

        console.log("initEnhancedAnimations function finished successfully.");

    } catch(error) {
        showFatalError(`Error during core animation setup: ${error.message}`);
        // Optionally try to recover or just log
    }
} // End initEnhancedAnimations

// --- Initialize Features on Load ---
window.addEventListener('load', () => {
    console.log("Window Loaded. Starting initializations...");

    requestAnimationFrame(() => { // Ensure repaint before heavy lifting
        console.log("Post-Load RAF triggered. Initializing features...");
        try {
            // Init non-mobile visual enhancements first
            if (!isMobile) {
                try {
                    document.querySelectorAll('.magnetic').forEach(el => new RefinedMagneticFx(el));
                    console.log("MagneticFx Initialized.");
                } catch(e) { console.error("MagneticFx Init Error:", e); }

                try {
                     new EnhancedCursor(); // Initialize cursor
                     console.log("Cursor Initialized.");
                } catch(e) { console.error("EnhancedCursor Init Error:", e); }

                try {
                    new RefinedCanvas('interactive-canvas');
                    console.log("Canvas Initialized.");
                } catch(e) { console.error("RefinedCanvas Init Error:", e); }
            } else {
                console.log("Skipping Cursor, Canvas, Magnetic Fx on Mobile.");
                 document.body.style.cursor = 'auto'; // Ensure default cursor on mobile
            }

            // Init main animations AFTER other setup potentially affecting layout/style
             initEnhancedAnimations(); // This includes the loader animation logic

             // Add a final ScrollTrigger refresh after a short delay to catch any late layout shifts
             setTimeout(() => {
                 console.log("Attempting final ScrollTrigger refresh post-init.");
                 ScrollTrigger.refresh();
             }, 350); // Adjust delay if necessary (e.g., for slow-loading fonts)

        } catch(e) {
            showFatalError(`Error during post-load initialization sequence: ${e.message}`);
        }
    });
});

// --- Final Fallback Check ---
window.setTimeout(() => {
    const loader = document.querySelector('.loader');
    // Check if loader is still present AND body hasn't fully faded in
    if ((loader && loader.style.display !== 'none') || !document.body.classList.contains('page-loaded')) {
        console.warn("Fallback Timeout (7s): Loader might be stuck or page didn't load correctly. Forcing visibility.");
        showFatalError("Initialization timeout or loader error.", true); // Force visibility
    }
}, 7000); // 7 seconds timeout