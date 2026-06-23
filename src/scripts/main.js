import Swiper from "swiper";
import { gsap } from "gsap";
import { Navigation, Pagination } from "swiper/modules";

class StoryController {
  #carousel;
  #currentStory;

  constructor(carousel) {
    this.#carousel = carousel;

    this.#carousel.on("slideChangeTransitionStart", async () => {
      const activeSlideClass = this.#carousel.activeSlideClass;
      this.#currentStory = activeSlideClass;

      switch(activeSlideClass) {
        case ".story--age":
          await this.#startAgeStory();
          break;
        default:
          break;
      }
    });
  }

  async #startAgeStory() {
    this.#carousel.lock();
    await this.#buildTimeline((tl) => {
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
    this.#carousel.unlock();
  }

  #buildTimeline(callback) {
    if (this.#hasStoryPlayed()) return;

    this.#carousel.activeSlide.setAttribute("data-played-story", "true");
    const tl = gsap.timeline();
    callback(tl);
    return tl;
  }

  #hasStoryPlayed() {
    return this.#carousel.activeSlide
      .getAttribute("data-played-story") === "true" ? true : false;
  }

  get currentStory() {
    return this.#currentStory;
  }
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

    this.lock(); // lock by default
  }

  on(event, callback) {
    this.#swiper.on(event, callback);
  }

  next() {
    this.#swiper.slideNext();
  }

  previous() {
    this.#swiper.slidePrev();
  }

  lock() {
    this.#swiper.navigation.nextEl.disabled = true;
    this.#swiper.navigation.prevEl.disabled = true;
  }

  unlock() {
    this.#swiper.navigation.nextEl.disabled = false;
    this.#swiper.navigation.prevEl.disabled = false;
  }

  lockPagination() {
    this.pagination.classList.add("lock");
  }

  unlockPagination() {
    this.pagination.classList.remove("lock");
  }

  get swiper() {
    return this.#swiper;
  }

  get nextButton() {
    return this.#swiper.navigation.nextEl;
  }

  get previousButton() {
    return this.#swiper.navigation.prevEl;
  }

  get pagination() {
    return this.#swiper.pagination.el;
  }

  get activeSlide() {
    const slide = this.#swiper.slides[this.#swiper.activeIndex];
    return slide?.querySelector(".story");
  }

  get activeSlideClass() {
    const slide = this.#swiper.slides[this.#swiper.activeIndex];
    const story = slide?.querySelector(".story");
    const klasses = story ? Array.from(story.classList) : [];
    const storyClass = klasses?.find((klass) => klass.startsWith("story--"));

    return `.${storyClass}`;
  }
}


const carousel = new Carousel();
new StoryController(carousel);

// .to(".age", {
      //   opacity: 0,
      //   y: -100,
      //   duration: 1,
      //   ease: "power3.out",
      // }, ">")
      // .to(".years", {
      //   opacity: 0,
      //   y: -100,
      //   duration: 1.25,
      //   ease: "power3.out",
      // }, "<");