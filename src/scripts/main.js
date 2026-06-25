import Swiper from "swiper";
import "../vendor/tinder-swiper/effect-tinder.css";
import EffectTinder from "../vendor/tinder-swiper/effect-tinder.esm";
import { Navigation, Pagination } from "swiper/modules";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

class StoryController {
  #carousel;
  #currentStory;
  #stories = {
    ".story--present": {
      name: "story--present",
      enter: () => {},
      exit: () => {},
      complete: () => {},
    },
    ".story--age": {
      name: "story--age",
      enter: () => this.#enterAgeStory(),
      exit: () => this.#exitAgeStory(),
      complete: () => this.#completeAgeStory(),
    },
    ".story--intro": {
      name: "story--intro",
      enter: () => {},
      exit: () => {},
      complete: () => {},
    },
    ".story--playlist": {
      name: "story--playlist",
      enter: () => this.#enterPlaylistStory(),
      exit: () => {},
      complete: () => {},
    },
    ".story--love-island": {
      name: "story--love-island",
      enter: () => this.#enterLoveIslandStory(),
      exit: () => {},
      complete: () => {},
    }
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
    this.#completeStory();
  }

  async #enterStory() {
    this.#currentStory = this.#setCurrentStory(this.#carousel.activeSlideClass);
    if (this.#currentStory) await this.#currentStory.enter();
  }

  async #exitStory() {
    if (this.#currentStory) await this.#currentStory.exit();
  }

  // exclusive for previous navigation;
  // make it so that text is on screen in a complete state;
  // distinct from the `endStory()` state
  #completeStory() {
    const activeSlideClass = this.#carousel.activeSlideClass;

    switch(activeSlideClass) {
      case ".story--age":
        this.#completeAgeStory();
        break;
      case ".story--intro":
        break;
      default:
        break;
    }
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
    const tl = this.#buildTimeline((tl) => {
      tl.fromTo(
        this.#carousel.activeSlide,
        {
          clipPath: "circle(5% at 50% 50%)"
        },
        {
          clipPath: "circle(100% at 50% 50%)",
          duration: 1,
          ease: "power4.in"
        }
      )
      .from(".age", {
        y: 40,
        duration: 1,
        ease: "power3.in",
      }, "<")
      .from(".years", {
        opacity: 0,
        y: 60,
        duration: 1.25,
        ease: "power3.in",
      }, "<")
      .to({}, { duration: 2})
      .to(".age", {
        opacity: 0,
        y: -100,
        duration: 1,
        ease: "power3.out",
      }, ">")
      .to(".years", {
        opacity: 0,
        y: -100,
        duration: 1.25,
        ease: "power3.out",
      }, "<")
      .fromTo(".nerd",
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
        },
        "<+0.5"
      )
      .to({}, { duration: 2})
      .to(".nerd",
        {
          opacity: 0,
          y: -100,
        }
      )
      .fromTo(".jokes",
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
        },
        ">"
      )
      .to({}, { duration: 2});
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
    const tl = this.#buildTimeline((tl) => {
      tl.to(".jokes", {
        opacity: 0,
        y: -100,
        duration: 1.25,
        ease: "power3.out",
      });
    });
    await this.#playTimeline(tl);
  };

  #completeAgeStory() {
    gsap.set(this.#carousel.activeSlide, {
      clipPath: "circle(100% at 50% 50%)"
    });

    gsap.set(".age", {
      opacity: 1,
      y: 0
    });

    gsap.set(".years", {
      opacity: 1,
      y: 0
    });

    gsap.set(".nerd", {
      opacity: 0,
      y: 0
    });

    gsap.set(".jokes", {
      opacity: 0,
      y: 0
    });
  }

  async #enterPlaylistStory() {
    // this whole method is disgusting but i need to get it done
    await new Promise(async (resolve) => {
      gsap.set(".story--playlist ol", { autoAlpha: 0 });

      const initText = async () => {
        const tl = this.#buildTimeline((tl) => {
          tl
          .to({}, { duration: 1 })
          .fromTo(".title",
            {
              y: 40,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: "power3.out",
            }
          )
          .to(".title", {
            opacity: 1,
            duration: 2,
          })
          .to(".title", {
            y: -40,
            opacity: 0,
            duration: 1.5,
            ease: "power3.in",
          })
          .fromTo(".subtitle",
            {
              y: 40,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: "power3.out",
            }
          )
          .to(".subtitle", {
            opacity: 1,
            duration: 2,
          })
          .to(".subtitle", {
            y: -40,
            opacity: 0,
            duration: 1.5,
            ease: "power3.in",
          })
          .fromTo(".drumroll",
            {
              y: 40,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: "power3.out",
            }
          )
          .to(".drumroll", {
            opacity: 1,
            duration: 2,
          })
          .to({}, { duration: 1 })
          .to(".drumroll", {
            y: -40,
            opacity: 0,
            duration: 1.5,
            ease: "power3.in",
          })
        });

        await this.#playTimeline(tl);
      }

      const initCards = async () => {
        const cards = gsap.utils.toArray(".story--playlist ol .group > li");
        let stage = 0;
        const step = 2;
        let locked = false;
        const tl = gsap.timeline();

        cards.forEach(card => {
          gsap.set(card, { autoAlpha: 0 });
        });

        // initial timeline
        tl
        .to(".story--playlist ol",
          {
            autoAlpha: 1,
            duration: 1.5,
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
          const duration = Math.random() * (1.5 - 0.5) + 0.5;
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

  async #enterLoveIslandStory() {
    // this whole method is disgusting but i need to get it done
    await new Promise(async (resolve) => {
      const initText = async () => {
        const tl = this.#buildTimeline((tl) => {
          tl
          .to({}, { duration: 1 })
          .fromTo(".title",
            {
              y: 40,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: "power3.out",
            }
          )
          .to(".title", {
            opacity: 1,
            duration: 2,
          })
          .to(".title", {
            y: -40,
            opacity: 0,
            duration: 1.5,
            ease: "power3.in",
          })
          .fromTo(".subtitle",
            {
              y: 40,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: "power3.out",
            }
          )
          .to(".subtitle", {
            opacity: 1,
            duration: 2,
          })
          .to(".subtitle", {
            y: -40,
            opacity: 0,
            duration: 1.5,
            ease: "power3.in",
          })
          .fromTo(".oops",
            {
              y: 40,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: "power3.out",
            }
          )
          .to(".oops", {
            opacity: 1,
            duration: 2,
          })
          .to(".oops", {
            y: -40,
            opacity: 0,
            duration: 1.5,
            ease: "power3.in",
          })
        });

        await this.#playTimeline(tl);
      }

      const initCards = async () => {
        const cards = gsap.utils.toArray(".story--playlist ol .group > li");
        let stage = 0;
        const step = 2;
        let locked = false;
        const tl = gsap.timeline();

        cards.forEach(card => {
          gsap.set(card, { autoAlpha: 0 });
        });

        // initial timeline
        tl
        .to(".story--playlist ol",
          {
            autoAlpha: 1,
            duration: 1.5,
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
          const duration = Math.random() * (1.5 - 0.5) + 0.5;
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
      
      // await initText();
      // await initCards();
    });
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
      modules: [Navigation, Pagination, EffectTinder],
      slidesPerView: 1,
      navigation: {
        prevEl:  `.swiper-button-prev--${this.#variant}`,
        nextEl: `.swiper-button-next--${this.#variant}`,
      },

      ...(isMain && {
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
export { stories };