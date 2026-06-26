// Swiper
import Swiper from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import EffectTinder from "../vendor/tinder-swiper/effect-tinder.esm";
import "../vendor/tinder-swiper/effect-tinder.css";

// GSAP
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

class StoryController {
  #carousel;
  #currentStory;
  #stories = {
    ".story--present": {
      name: ".story--present",
      enter: () => {},
      exit: () => {},
    },
    ".story--age": {
      name: ".story--age",
      enter: () => this.#enterAgeStory(),
      exit: () => this.#exitAgeStory(),
    },
    ".story--love-island": {
      name: ".story--love-island",
      enter: () => this.#enterLoveIslandStory(),
      exit: () => this.#exitLoveIslandStory(),
    },
    ".story--playlist": {
      name: ".story--playlist",
      enter: () => this.#enterPlaylistStory(),
      exit: () => this.#exitPlaylistStory(),
    },
    ".story--recap": {
      name: ".story--recap",
      enter: () => this.#enterRecapStory(),
      exit: () => {},
    },
  };

  constructor(carousel) {
    this.#carousel = carousel;    
    this.#currentStory = this.#setCurrentStory(this.#carousel.activeSlideClass);

    if (this.#carousel.variant === "main") {
      this.#carousel.nextButton.addEventListener("click", () => this.next());
      this.#carousel.previousButton.addEventListener("click", () => this.previous());
    }
  };

  async next() {
    this.#carousel.lock();
    await this.#exitStory();
    this.#carousel.next();
    this.#carousel.lock(); // this is hacky; internal Carousel lock mechs should be refined
    await this.#enterStory();
    this.#carousel.unlock();
  };

  previous() {
    this.#carousel.previous();
  }

  async #enterStory() {
    this.#currentStory = this.#setCurrentStory(this.#carousel.activeSlideClass);
    if (this.#currentStory) await this.#currentStory.enter();
  }

  async #exitStory() {
    if (!this.#currentStory) return;
 
    await this.#currentStory.exit();
    await gsap.to(this.#carousel.activeSlide, {
      opacity: 0,
      duration: 0.5
    });
  }

  #buildTimeline(callback) {
    const tl = gsap.timeline();
    callback(tl);
    return tl;
  };

  async #playTimeline(tl) {
    if (!tl) return;

    return new Promise((resolve) => {
      tl.eventCallback("onComplete", resolve);
      tl.play();
    });
  };

  async #enterAgeStory() {
    const scope = this.#currentStory.name;
    gsap.set(
      [
        `${scope} .age`,
        `${scope} .joke`,
        `${scope} .sorry`,
        `${scope} .embarrassed`,
      ],
      {
        y: 40,
        opacity: 0,
        xPercent: -50,
        yPercent: -50,
      }
    );

    const tl = this.#buildTimeline((tl) => {
      tl
      .fromTo(`${scope}`,
        {
          y: 40,
          autoAlpha: 0,
        },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1,
          ease: "power3.out",
        }
      )
      .call(() => this.#addTextAnimation(tl, `${scope} .age`))
      .to({}, { duration: 1 })
      .call(() => this.#addTextAnimation(tl, `${scope} .joke`))
      .call(() => this.#addTextAnimation(tl, `${scope} .sorry`))
      .call(() => this.#addTextAnimation(tl, `${scope} .embarrassed`, { exit: false }))
    });

    // keep this outside the timeline so our StoryController isn't waiting
    gsap.to(".decoration--circle", {
      rotation: 360,
      duration: 100,
      ease: "none",
      repeat: -1,
    });
    await this.#playTimeline(tl);
  };

  async #exitAgeStory() {
    const scope = this.#currentStory.name;
    const tl = this.#buildTimeline((tl) => {
      tl.to(`${scope}`, {
        y: -40,
        autoAlpha: 0,
        duration: 1,
        ease: "power3.in",
      });
    });
    await this.#playTimeline(tl);
  };

  async #enterPlaylistStory() {
    const scope = this.#currentStory.name;
    gsap.set(
      [
        `${scope} .title`,
        `${scope} .subtitle`,
        `${scope} .drumroll`,
      ],
      {
        y: 40,
        opacity: 0,
        xPercent: -50,
        yPercent: -50,
      }
    );
    gsap.set(`${scope} ol`, { autoAlpha: 0 });

    // this whole method is disgusting but i need to get it done
    await new Promise(async (resolve) => {
      const initText = async () => {
        const tl = this.#buildTimeline((tl) => {
          tl
          .fromTo(`${scope} .story-inner`,
            {
              y: 40,
              autoAlpha: 0,
            },
            {
              y: 0,
              autoAlpha: 1,
              duration: 1,
              ease: "power3.out",
            }
          )
          .call(() => this.#addTextAnimation(tl, `${scope} .title`))
          .call(() => this.#addTextAnimation(tl, `${scope} .subtitle`))
          .call(() => this.#addTextAnimation(tl, `${scope} .drumroll`))
        });

        await this.#playTimeline(tl);
      }

      const initCards = async () => {
        const cards = gsap.utils.toArray(`${scope} ol .group > li`);
        let stage = 0;
        const step = 2;
        let locked = false;
        const tl = gsap.timeline();

        cards.forEach(card => {
          gsap.set(card, { autoAlpha: 0 });
        });

        // initial timeline
        tl
        .to(`${scope} ol`,
          {
            autoAlpha: 1,
            duration: 1,
          },
          ">"
        )
        .to(cards.slice(0, 2), {
          autoAlpha: 1,
          duration: 0.75,
          stagger: 0.25
        });

        function go(direction) {
          const maxStage = cards.length / step;
          const nextStage = stage + direction;
          if (locked || nextStage < 0) return;

          const oldCards = cards.slice(stage * step, stage * step + step);
          const newCards = cards.slice(nextStage * step, nextStage * step + step);
          const duration = Math.random() * (1 - 0.5) + 0.5;
          const stagger = Math.random() * (0.5 - 0.25) + 0.25;
          if (!newCards.length) return;
          locked = true;

          gsap.timeline({
            onComplete: () => {
              stage = nextStage;
              locked = false;

              // so hacky
              if (stage + 1 === maxStage) resolve();
            }
          })
          .to(oldCards, { autoAlpha: 0, duration })
          .to(newCards, { autoAlpha: 1, duration, stagger });
        }

        window.addEventListener("wheel", (e) => {
          if (e.deltaY > 0) go(1);
          if (e.deltaY < 0) go(-1);
        });
      }
      
      await initText();
      await initCards();
    });
  }

  async #exitPlaylistStory() {
    const scope = this.#currentStory.name;
    const tl = this.#buildTimeline((tl) => {
      tl.to(`${scope}`, {
        y: -40,
        autoAlpha: 0,
        duration: 1,
        ease: "power3.in",
      });
    });
    await this.#playTimeline(tl);
  }

  async #enterLoveIslandStory() {
    const scope = this.#currentStory.name;
    gsap.set(
      [
        `${scope} .title`,
        `${scope} .subtitle`,
        `${scope} .couple`,
      ],
      {
        y: 40,
        opacity: 0,
        xPercent: -50,
        yPercent: -50,
      }
    );
    gsap.set(`${scope} .swiper--love-island`, {
      autoAlpha: 0,
    });

    await new Promise(async (resolve) => {
      const tl = this.#buildTimeline((tl) => {
        tl
        .fromTo(`${scope}`,
          {
            y: 40,
            autoAlpha: 0,
          },
          {
            y: 0,
            autoAlpha: 1,
            duration: 1.5,
            ease: "power3.out",
          }
        )
        .add(this.#addTextAnimation(tl, `${scope} .title`))
        .add(this.#addTextAnimation(tl, `${scope} .subtitle`))
        .add(this.#addTextAnimation(tl, `${scope} .couple`))
        .to(`${scope} .swiper--love-island`, { autoAlpha: 1 });
      });

      await this.#playTimeline(tl);
    });
  }

  async #exitLoveIslandStory() {
    const scope = this.#currentStory.name;
    const tl = this.#buildTimeline((tl) => {
      tl.to(`${scope}`, {
        y: -40,
        autoAlpha: 0,
        duration: 1.5,
        ease: "power3.in",
      });
    });
    await this.#playTimeline(tl);
  }

  async #enterRecapStory() {
    const rows = [];
    const scope = this.#currentStory.name;
    gsap.set(
      [
        `${scope} .serious`,
        `${scope} .wanted-to-say`,
        `${scope} .birthday`,
        `${scope} .us`,
      ],
      {
        y: 40,
        opacity: 0,
        xPercent: -50,
        yPercent: -50,
      }
    );
    gsap.set(".recap li", {
      opacity: 0,
      y: 40,
    });
    gsap.set(".recap img", {
      opacity: 0,
      y: 40,
    });

    for (let i = 1; i <= 5; i++) {
      rows.push(
        document.querySelector(`.recap .stats .dates li:nth-child(${i})`),
        document.querySelector(`.recap .stats .songs li:nth-child(${i})`)
      );
    }

    const tl = this.#buildTimeline((tl) => {
      tl
        .fromTo(`${scope}`,
          {
            y: 40,
            autoAlpha: 0,
          },
          {
            y: 0,
            autoAlpha: 1,
            duration: 1,
            ease: "power3.out",
          }
        )
        .add(this.#addTextAnimation(tl, `${scope} .serious`))
        .add(this.#addTextAnimation(tl, `${scope} .wanted-to-say`))
        .add(this.#addTextAnimation(tl, `${scope} .birthday`))
        .add(this.#addTextAnimation(tl, `${scope} .us`))
        .fromTo(".recap img",
          {
            opacity: 0,
            y: 40,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            stagger: 0.125,
          },
          ">"
        )
        .fromTo(".recap .stats .title",
          {
            opacity: 0,
            y: 40,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            stagger: 0.125,
          },
          "<+0.25"
        )
        .fromTo(rows,
          {
            opacity: 0,
            y: 40,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            stagger: 0.125,
          },
          "<+0.5"
        )
        .fromTo(".recap .meta > div",
          {
            opacity: 0,
            y: 40,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            stagger: 0.125,
          },
          ">"
        )
    });

    await this.#playTimeline(tl);
  }

  #addTextAnimation(tl, selector, options = {}) {
    const {
      hold = 2,
      enterDuration = 1,
      exitDuration = 1.5,
      position = ">",
      exit = true,
    } = options;

    tl
    .fromTo(
      selector,
      {
        y: 40,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: enterDuration,
        ease: "power3.out",
      },
      position
    )
    .to(selector, {
      opacity: 1,
      duration: hold,
    });
      
    exit && tl.to(selector, {
      y: -40,
      opacity: 0,
      duration: exitDuration,
      ease: "power3.in",
    });

    return tl;
  }

  #setCurrentStory(currentStoryClass) {
    const currentStory = this.#stories[currentStoryClass] ?? null;
    if (currentStory === null) {
      console.error("Current story is missing -- you probably forgot it Ron!!");
      return;
    }
    if (currentStoryClass !== ".story--present") {
      this.#carousel.unlockPagination();
    }
    return currentStory;
  };
}

class Carousel {
  #swiper;
  #variant;

  constructor(selector, isMain) {
    this.#variant = isMain ? "main" : "hinge";
    this.#swiper = new Swiper(selector, {
      modules: [Navigation, Pagination,  EffectTinder],
      slidesPerView: 1,
      navigation: {
        prevEl:  `.swiper-button-prev--${this.#variant}`,
        nextEl: `.swiper-button-next--${this.#variant}`,
      },

      ...(isMain && {
        speed: 0,
        noSwiping: true,
        noSwipingClass: "swiper-slide",
        pagination: {
          el: ".swiper-pagination",
          type: "bullets",
          clickable: true,
        },
      }),

      ...(!isMain && {
        effect: "tinder",
      }),
    });

    // removes Swiper navigation button events but keeps DOM elements
    if (isMain) {
      this.#swiper.navigation.destroy();
      this.lock();
    }
  };

  on(event, callback) {
    this.#swiper.on(event, callback);
  };

  next() {
    this.#swiper.slideNext();
  };

  previous() {
    this.#swiper.slidePrev();
  };

  lock() {
    this.#swiper.navigation.nextEl.disabled = true;
    this.#swiper.navigation.prevEl.disabled = true;
  };

  unlock() {
    this.#swiper.navigation.nextEl.disabled = false;
    this.#swiper.navigation.prevEl.disabled = false;
  };

  lockPagination() {
    this.pagination.classList.add("lock");
  };

  unlockPagination() {
    this.pagination.classList.remove("lock");
  };

  onReachEnd(callback) {
    this.#swiper.on("reachEnd", callback);
  }

  get swiper() {
    return this.#swiper;
  };

  get nextButton() {
    return this.#swiper.navigation.nextEl;
  };

  get previousButton() {
    return this.#swiper.navigation.prevEl;
  };

  get pagination() {
    return this.#swiper.pagination.el;
  };

  get variant() {
    return this.#variant;
  }

  get activeSlide() {
    const slide = this.#swiper.slides[this.#swiper.activeIndex];
    return slide?.querySelector(".story");
  };

  get activeSlideClass() {
    const slide = this.#swiper.slides[this.#swiper.activeIndex];
    const story = slide?.querySelector(".story");
    const klasses = story ? Array.from(story.classList) : [];
    const storyClass = klasses?.find((klass) => klass.startsWith("story--"));

    return `.${storyClass}`;
  };
}

const hingeCarousel = new Carousel(".swiper--love-island");
const mainCarousel = new Carousel(".swiper--main", true);
const stories = new StoryController(mainCarousel);
hingeCarousel.onReachEnd(() => {
  mainCarousel.unlock();
});
export { stories };