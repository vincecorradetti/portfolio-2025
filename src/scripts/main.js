import Swiper from "swiper";
import { gsap } from "gsap";
import { Navigation, Pagination } from "swiper/modules";

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
    }
  };

  constructor(carousel) {
    this.#carousel = carousel;
    this.#carousel.nextButton.addEventListener("click", () => this.next());
    this.#carousel.previousButton.addEventListener("click", () => this.previous());
    this.#currentStory = this.#setCurrentStory(this.#carousel.activeSlideClass);
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
        opacity: 0.75,
        y: 40,
        duration: 1,
        ease: "power3.in",
      }, "<")
      .from(".years", {
        opacity: 0.75,
        y: 30,
        duration: 1.25,
        ease: "power3.in",
      }, "<")
      .to({}, { duration: 3})
    });
    await this.#playTimeline(tl);
  };

  async #exitAgeStory() {
    const tl = this.#buildTimeline((tl) => {
      tl.to(".age", {
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
      }, "<");
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

  constructor() {
    this.#swiper = new Swiper(".swiper", {
      modules: [Navigation, Pagination],
      slidesPerView: 1,
      noSwiping: true,
      noSwipingClass: "swiper-slide",
      navigation: {
        prevEl: ".swiper-button-prev",
        nextEl: ".swiper-button-next",
      },
      pagination: {
        el: ".swiper-pagination",
        type: "bullets",
        clickable: true,
      },
    });

    // removes Swiper navigation button events but keeps DOM elements
    this.#swiper.navigation.destroy();
    this.lock(); // lock by default
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

const carousel = new Carousel();
const stories = new StoryController(carousel);
export { stories };